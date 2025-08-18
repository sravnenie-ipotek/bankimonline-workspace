#!/usr/bin/env node

/**
 * Railway to JSONB Migration Script
 * 
 * Non-destructive migration that transforms Railway's multi-table dropdown structure
 * into optimized JSONB format while preserving all existing data.
 * 
 * Migration Strategy:
 * 1. Extract dropdown data from content_items + content_translations
 * 2. Group by logical dropdown fields
 * 3. Transform to JSONB structure with all languages
 * 4. Insert into new dropdown_configs table
 * 5. Preserve original data for rollback capability
 */

const { Pool } = require('pg');

// Railway database connection
const railwayPool = new Pool({
    connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
    ssl: false
});

const SUPPORTED_LANGUAGES = ['en', 'he', 'ru'];

/**
 * Field name extraction patterns for different naming conventions
 */
const FIELD_PATTERNS = [
    // Pattern 1: mortgage_step1.field.property_ownership
    /^([^.]+)\.field\.([^.]+?)(?:_has_property|_no_property|_selling_property|_ph)?$/,
    
    // Pattern 2: app.mortgage.form.calculate_mortgage_property_ownership
    /^app\.mortgage\.form\.calculate_mortgage_([^_]+(?:_[^_]+)*)(?:_ph)?$/,
    
    // Pattern 3: app.mortgage.step1.dropdown.property_ownership
    /^app\.mortgage\.step\d+\.dropdown\.([^.]+)$/,
    
    // Pattern 4: credit_step1 dropdown_container/dropdown_option patterns
    /^([^.]+)\.([^.]+)\.([^.]+)$/,
    
    // Pattern 5: Direct field names like mortgage_step1_property_ownership
    /^([^_]+_step\d+)_([^_]+(?:_[^_]+)*)(?:_option_\d+|_ph)?$/,
    
    // Pattern 6: Generic fallback for component-based naming
    /^([^.]+)\.([^.]+)$/
];

/**
 * Extract field name from content key
 */
function extractFieldName(contentKey, componentType) {
    // Remove option suffixes and placeholders to get base field name
    let baseKey = contentKey
        .replace(/_option_\d+$/, '')
        .replace(/_ph$/, '')
        .replace(/_has_property$/, '')
        .replace(/_no_property$/, '') 
        .replace(/_selling_property$/, '');
    
    for (const pattern of FIELD_PATTERNS) {
        const match = baseKey.match(pattern);
        if (match) {
            // Return the field part of the match
            return match[match.length - 1];
        }
    }
    
    // Fallback: use the content key as-is
    return baseKey.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Extract option value from content key
 */
function extractOptionValue(contentKey) {
    // For property ownership specific mappings
    if (contentKey.includes('_no_property')) return '1';
    if (contentKey.includes('_has_property')) return '2'; 
    if (contentKey.includes('_selling_property')) return '3';
    
    // For numbered options
    const numberMatch = contentKey.match(/_option_(\d+)$/);
    if (numberMatch) return numberMatch[1];
    
    // For named options, create a hash-based value
    const optionPart = contentKey.split('_').pop();
    return optionPart || '1';
}

/**
 * Clean and standardize dropdown key
 */
function generateDropdownKey(screenLocation, fieldName) {
    const cleanScreen = screenLocation.replace(/[^a-zA-Z0-9_]/g, '_');
    const cleanField = fieldName.replace(/[^a-zA-Z0-9_]/g, '_');
    return `${cleanScreen}_${cleanField}`;
}

/**
 * Fetch all dropdown-related content from Railway
 */
async function fetchDropdownContent() {
    console.log('🔍 Fetching dropdown content from Railway...');
    
    const query = `
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            ci.category,
            ct.language_code,
            ct.content_value,
            ct.status
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.component_type IN (
            'dropdown_container', 
            'dropdown_option', 
            'option', 
            'placeholder', 
            'label'
        )
        AND ct.status = 'approved'
        AND ci.is_active = true
        ORDER BY ci.screen_location, ci.content_key, ct.language_code
    `;
    
    const result = await railwayPool.query(query);
    console.log(`📊 Found ${result.rows.length} dropdown content items`);
    
    return result.rows;
}

/**
 * Group content by dropdown fields
 */
function groupContentByField(contentItems) {
    console.log('🔗 Grouping content by dropdown fields...');
    
    const dropdownMap = new Map();
    
    for (const item of contentItems) {
        const fieldName = extractFieldName(item.content_key, item.component_type);
        const dropdownKey = generateDropdownKey(item.screen_location, fieldName);
        
        if (!dropdownMap.has(dropdownKey)) {
            dropdownMap.set(dropdownKey, {
                dropdown_key: dropdownKey,
                field_name: fieldName,
                screen_location: item.screen_location,
                category: item.category,
                labels: {},
                placeholders: {},
                options: [],
                source_keys: []
            });
        }
        
        const dropdown = dropdownMap.get(dropdownKey);
        dropdown.source_keys.push(item.content_key);
        
        // Process based on component type
        if (item.component_type === 'dropdown_container' || item.component_type === 'label') {
            dropdown.labels[item.language_code] = item.content_value;
        } else if (item.component_type === 'placeholder') {
            dropdown.placeholders[item.language_code] = item.content_value;
        } else if (item.component_type === 'dropdown_option' || item.component_type === 'option') {
            // Find existing option or create new one
            const optionValue = extractOptionValue(item.content_key);
            let option = dropdown.options.find(opt => opt.value === optionValue);
            
            if (!option) {
                option = { value: optionValue, text: {} };
                dropdown.options.push(option);
            }
            
            option.text[item.language_code] = item.content_value;
        }
    }
    
    console.log(`📦 Grouped into ${dropdownMap.size} unique dropdown fields`);
    return Array.from(dropdownMap.values());
}

/**
 * Transform grouped data to JSONB format
 */
function transformToJsonb(groupedDropdowns) {
    console.log('🔄 Transforming to JSONB format...');
    
    const jsonbDropdowns = [];
    
    for (const dropdown of groupedDropdowns) {
        // Ensure all languages have label and placeholder
        const label = {};
        const placeholder = {};
        
        for (const lang of SUPPORTED_LANGUAGES) {
            label[lang] = dropdown.labels[lang] || '';
            placeholder[lang] = dropdown.placeholders[lang] || '';
        }
        
        // Process options with full language support
        const options = dropdown.options.map(option => ({
            value: option.value,
            text: {
                en: option.text.en || '',
                he: option.text.he || '',
                ru: option.text.ru || ''
            }
        }));
        
        // Sort options by value for consistency
        options.sort((a, b) => a.value.localeCompare(b.value));
        
        const jsonbData = {
            label,
            placeholder,
            options,
            metadata: {
                source: 'railway_migration',
                created_at: new Date().toISOString(),
                original_keys: dropdown.source_keys,
                option_count: options.length
            }
        };
        
        jsonbDropdowns.push({
            dropdown_key: dropdown.dropdown_key,
            field_name: dropdown.field_name,
            screen_location: dropdown.screen_location,
            category: dropdown.category || 'form',
            dropdown_data: jsonbData,
            metadata: {
                migration_source: 'railway_content_items',
                migration_date: new Date().toISOString(),
                source_count: dropdown.source_keys.length
            }
        });
    }
    
    console.log(`✨ Transformed ${jsonbDropdowns.length} dropdowns to JSONB format`);
    return jsonbDropdowns;
}

/**
 * Insert JSONB dropdowns into Railway database
 */
async function insertJsonbDropdowns(jsonbDropdowns) {
    console.log('💾 Inserting JSONB dropdowns into Railway database...');
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const dropdown of jsonbDropdowns) {
        try {
            const insertQuery = `
                INSERT INTO dropdown_configs (
                    dropdown_key, 
                    dropdown_data, 
                    metadata, 
                    category, 
                    screen_location, 
                    field_name, 
                    is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (dropdown_key) DO UPDATE SET
                    dropdown_data = EXCLUDED.dropdown_data,
                    metadata = EXCLUDED.metadata,
                    updated_at = CURRENT_TIMESTAMP
            `;
            
            await railwayPool.query(insertQuery, [
                dropdown.dropdown_key,
                JSON.stringify(dropdown.dropdown_data),
                JSON.stringify(dropdown.metadata),
                dropdown.category,
                dropdown.screen_location,
                dropdown.field_name,
                true
            ]);
            
            insertedCount++;
            
            if (insertedCount % 10 === 0) {
                console.log(`📝 Processed ${insertedCount}/${jsonbDropdowns.length} dropdowns...`);
            }
            
        } catch (error) {
            console.error(`❌ Error inserting dropdown ${dropdown.dropdown_key}:`, error.message);
            skippedCount++;
        }
    }
    
    console.log(`✅ Migration completed: ${insertedCount} inserted, ${skippedCount} skipped`);
    return { insertedCount, skippedCount };
}

/**
 * Validate migration results
 */
async function validateMigration() {
    console.log('🔍 Validating migration results...');
    
    // Count original dropdown content
    const originalQuery = `
        SELECT 
            COUNT(*) as original_count,
            COUNT(DISTINCT ci.screen_location) as screen_count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.component_type IN ('dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label')
        AND ct.status = 'approved'
        AND ci.is_active = true
    `;
    
    const originalResult = await railwayPool.query(originalQuery);
    
    // Count migrated dropdowns
    const migratedQuery = `
        SELECT 
            COUNT(*) as migrated_count,
            COUNT(DISTINCT screen_location) as screen_count
        FROM dropdown_configs
        WHERE is_active = true
    `;
    
    const migratedResult = await railwayPool.query(migratedQuery);
    
    console.log('📊 Migration Validation Results:');
    console.log(`   Original content items: ${originalResult.rows[0].original_count}`);
    console.log(`   Original screens: ${originalResult.rows[0].screen_count}`);
    console.log(`   Migrated dropdowns: ${migratedResult.rows[0].migrated_count}`);
    console.log(`   Migrated screens: ${migratedResult.rows[0].screen_count}`);
    
    // Sample a few dropdowns for manual validation
    const sampleQuery = `
        SELECT dropdown_key, field_name, screen_location, 
               jsonb_pretty(dropdown_data) as formatted_data
        FROM dropdown_configs 
        ORDER BY screen_location, field_name 
        LIMIT 3
    `;
    
    const sampleResult = await railwayPool.query(sampleQuery);
    console.log('\\n📋 Sample migrated dropdowns:');
    
    for (const sample of sampleResult.rows) {
        console.log(`\\n🔸 ${sample.dropdown_key} (${sample.screen_location})`);
        console.log(sample.formatted_data);
    }
}

/**
 * Main migration execution
 */
async function runMigration() {
    const startTime = Date.now();
    
    try {
        console.log('🚀 Starting Railway to JSONB Migration...');
        console.log(`⏰ Start time: ${new Date().toISOString()}`);
        
        // Step 1: Fetch content
        const contentItems = await fetchDropdownContent();
        
        // Step 2: Group by fields
        const groupedDropdowns = groupContentByField(contentItems);
        
        // Step 3: Transform to JSONB
        const jsonbDropdowns = transformToJsonb(groupedDropdowns);
        
        // Step 4: Insert into database
        const results = await insertJsonbDropdowns(jsonbDropdowns);
        
        // Step 5: Validate results
        await validateMigration();
        
        const duration = Date.now() - startTime;
        console.log(`\\n🎉 Migration completed successfully!`);
        console.log(`⏱️ Total duration: ${Math.round(duration / 1000)}s`);
        console.log(`📊 Results: ${results.insertedCount} dropdowns migrated`);
        
    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    } finally {
        await railwayPool.end();
    }
}

// Execute migration if run directly
if (require.main === module) {
    runMigration();
}

module.exports = {
    runMigration,
    fetchDropdownContent,
    groupContentByField,
    transformToJsonb,
    insertJsonbDropdowns,
    validateMigration
};