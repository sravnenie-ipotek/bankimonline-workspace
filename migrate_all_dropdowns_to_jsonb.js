/**
 * Complete Dropdown Migration to JSONB
 * Migrates ALL dropdowns from Railway content_translations to Neon JSONB
 */

const { Pool } = require('pg');
require('dotenv').config();

// Source: Railway Content Database
const railwayPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
    ssl: { rejectUnauthorized: false }
});

// Target: Neon JSONB Database
const neonPool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_jbzp4wqldAu7@ep-wild-feather-ad1lx42k.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function migrateAllDropdowns() {
    console.log('🚀 Starting Complete Dropdown Migration to JSONB\n');
    
    try {
        // 1. Get all screens with dropdowns
        const screensResult = await railwayPool.query(`
            SELECT DISTINCT screen_location
            FROM content_items
            WHERE component_type IN ('dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label')
            AND is_active = true
            ORDER BY screen_location
        `);
        
        console.log(`📍 Found ${screensResult.rows.length} screens with dropdowns\n`);
        
        // 2. Process each screen
        let totalDropdowns = 0;
        const allDropdowns = [];
        
        for (const screen of screensResult.rows) {
            console.log(`\n🔍 Processing screen: ${screen.screen_location}`);
            
            // Get all dropdown data for this screen
            const dropdownData = await railwayPool.query(`
                SELECT 
                    ci.content_key,
                    ci.component_type,
                    ct.language_code,
                    ct.content_value,
                    ci.screen_location
                FROM content_items ci
                JOIN content_translations ct ON ci.id = ct.content_item_id
                WHERE ci.screen_location = $1 
                    AND ct.status = 'approved'
                    AND ci.is_active = true
                    AND ci.component_type IN ('dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label')
                ORDER BY ci.content_key, ct.language_code
            `, [screen.screen_location]);
            
            // Group by field name
            const fieldMap = new Map();
            
            for (const row of dropdownData.rows) {
                const fieldName = extractFieldName(row.content_key, row.screen_location);
                if (!fieldName) continue;
                
                const dropdownKey = `${row.screen_location}_${fieldName}`;
                
                if (!fieldMap.has(dropdownKey)) {
                    fieldMap.set(dropdownKey, {
                        dropdown_key: dropdownKey,
                        screen_location: row.screen_location,
                        field_name: fieldName,
                        label: { en: '', he: '', ru: '' },
                        placeholder: { en: '', he: '', ru: '' },
                        options: [],
                        metadata: {
                            created_at: new Date().toISOString(),
                            source: 'railway_migration',
                            original_keys: []
                        }
                    });
                }
                
                const dropdown = fieldMap.get(dropdownKey);
                dropdown.metadata.original_keys.push(row.content_key);
                
                // Process based on component type
                if (row.component_type === 'label' || row.component_type === 'dropdown_container') {
                    if (!row.content_key.includes('_option_') && !row.content_key.includes('_ph')) {
                        dropdown.label[row.language_code] = row.content_value;
                    }
                } else if (row.component_type === 'placeholder' || row.content_key.includes('_ph')) {
                    dropdown.placeholder[row.language_code] = row.content_value;
                } else if (row.component_type === 'option' || row.component_type === 'dropdown_option' || row.content_key.includes('_option_')) {
                    // Extract option number
                    let optionNum = null;
                    let optionMatch = row.content_key.match(/_option_(\d+)/);
                    if (optionMatch) {
                        optionNum = parseInt(optionMatch[1]);
                    } else {
                        // For legacy format, generate option number based on specific suffix
                        const suffixes = ['no_property', 'has_property', 'selling_property', 'single', 'married', 'divorced', 'widowed', 
                                        'employee', 'selfemployed', 'pension', 'student', 'unemployed'];
                        for (let i = 0; i < suffixes.length; i++) {
                            if (row.content_key.includes(suffixes[i])) {
                                optionNum = i + 1;
                                break;
                            }
                        }
                    }
                    
                    if (optionNum !== null) {
                        // Find or create option
                        let option = dropdown.options.find(o => o.value === String(optionNum));
                        if (!option) {
                            option = {
                                value: String(optionNum),
                                text: { en: '', he: '', ru: '' }
                            };
                            dropdown.options.push(option);
                        }
                        option.text[row.language_code] = row.content_value;
                    }
                }
            }
            
            // Add all dropdowns from this screen
            fieldMap.forEach(dropdown => {
                // Sort options by value
                dropdown.options.sort((a, b) => parseInt(a.value) - parseInt(b.value));
                
                // Create JSONB structure
                const jsonbData = {
                    label: dropdown.label,
                    placeholder: dropdown.placeholder,
                    options: dropdown.options,
                    metadata: dropdown.metadata
                };
                
                allDropdowns.push({
                    key: dropdown.dropdown_key,
                    data: jsonbData,
                    screen: dropdown.screen_location,
                    field: dropdown.field_name
                });
                
                totalDropdowns++;
            });
            
            console.log(`  ✅ Processed ${fieldMap.size} dropdowns`);
        }
        
        console.log(`\n📊 Total dropdowns to migrate: ${totalDropdowns}\n`);
        
        // 3. Create table in Neon if not exists
        console.log('📦 Creating JSONB table in Neon...');
        await neonPool.query(`
            CREATE TABLE IF NOT EXISTS dropdown_configs (
                id SERIAL PRIMARY KEY,
                dropdown_key VARCHAR(255) NOT NULL UNIQUE,
                dropdown_data JSONB NOT NULL,
                metadata JSONB DEFAULT '{}',
                category VARCHAR(100),
                screen_location VARCHAR(255),
                field_name VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_dropdown_key ON dropdown_configs(dropdown_key);
            CREATE INDEX IF NOT EXISTS idx_screen_location ON dropdown_configs(screen_location);
            CREATE INDEX IF NOT EXISTS idx_field_name ON dropdown_configs(field_name);
            CREATE INDEX IF NOT EXISTS idx_dropdown_data ON dropdown_configs USING gin(dropdown_data);
        `);
        
        // 4. Insert all dropdowns
        console.log('💾 Inserting dropdowns into Neon...\n');
        let inserted = 0;
        let updated = 0;
        
        for (const dropdown of allDropdowns) {
            try {
                // Try insert, update if exists
                const result = await neonPool.query(`
                    INSERT INTO dropdown_configs (
                        dropdown_key, 
                        dropdown_data, 
                        screen_location, 
                        field_name,
                        category,
                        metadata
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (dropdown_key) 
                    DO UPDATE SET 
                        dropdown_data = EXCLUDED.dropdown_data,
                        metadata = EXCLUDED.metadata,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING dropdown_key, 
                             CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END as action
                `, [
                    dropdown.key,
                    JSON.stringify(dropdown.data),
                    dropdown.screen,
                    dropdown.field,
                    'dropdown',
                    JSON.stringify(dropdown.data.metadata)
                ]);
                
                if (result.rows[0].action === 'inserted') {
                    inserted++;
                } else {
                    updated++;
                }
                
                console.log(`  ${result.rows[0].action === 'inserted' ? '➕' : '🔄'} ${dropdown.key}`);
            } catch (error) {
                console.error(`  ❌ Error with ${dropdown.key}:`, error.message);
            }
        }
        
        console.log(`\n✅ Migration Complete!`);
        console.log(`  📊 Inserted: ${inserted}`);
        console.log(`  🔄 Updated: ${updated}`);
        console.log(`  📦 Total: ${inserted + updated}\n`);
        
        // 5. Verify migration
        console.log('🔍 Verifying migration...');
        const verifyResult = await neonPool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT screen_location) as screens,
                COUNT(DISTINCT field_name) as fields
            FROM dropdown_configs
            WHERE is_active = true
        `);
        
        console.log('  ✅ Verification Results:');
        console.log(`     Total dropdowns: ${verifyResult.rows[0].total}`);
        console.log(`     Unique screens: ${verifyResult.rows[0].screens}`);
        console.log(`     Unique fields: ${verifyResult.rows[0].fields}`);
        
    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        await railwayPool.end();
        await neonPool.end();
    }
}

function extractFieldName(contentKey, screenLocation) {
    let fieldName = null;
    let match;
    
    // Multiple patterns to extract field name (same as server-db.js)
    
    // Pattern 1: screen.field.{fieldname}
    match = contentKey.match(/^[^.]*\.field\.([^.]+?)_[0-9]_(?:no_additional_income|no_obligations)/);
    if (match) return match[1];
    
    match = contentKey.match(/^[^.]*\.field\.([^.]+)_(?:has_property|no_property|selling_property|within_3_months|3_to_6_months|6_to_12_months|over_12_months|apartment|garden_apartment|penthouse|private_house|other|yes_first_home|no_additional_property|investment|fixed_rate|variable_rate|mixed_rate|not_sure|im_|i_no_|i_own_|selling_|no_|has_|single|married|divorced|widowed|partner|commonlaw_partner|no_high_school_diploma|partial_high_school_diploma|full_high_school_diploma|postsecondary_education|bachelors|masters|doctorate|employee|selfemployed|pension|student|unemployed|unpaid_leave|additional_salary|additional_work|property_rental_income|no_additional_income|bank_loan|consumer_credit|credit_card|no_obligations|hapoalim|leumi|discount|massad|mizrahi)/);
    if (match) return match[1];
    
    // Handle field_of_activity and other multi-word fields
    match = contentKey.match(/^[^.]*\.field\.([^.]+?)_(?:agriculture|technology|healthcare|education|finance|real_estate|construction|retail|manufacturing|government|transport|consulting|entertainment|other)/);
    if (match) return match[1];
    
    match = contentKey.match(/^[^.]*\.field\.([^.]+)/);
    if (match) return match[1];
    
    // Pattern 2: screen_{fieldname}
    match = contentKey.match(/^[^_]+_step\d+_([^_]+(?:_[^_]+)*)_(?:options_)?ph$/);
    if (match) return match[1];
    
    if (contentKey.includes('_option_') || contentKey.includes('_options_')) {
        match = contentKey.match(/^[^_]+_step\d+_([^_]+(?:_[^_]+)*)_(?:option|options)_\d+$/);
        if (match) return match[1];
    }
    
    match = contentKey.match(/^[^_]+_step\d+_([^_]+(?:_[^_]+)*)$/);
    if (match) return match[1];
    
    // Pattern 3: calculate_mortgage_{fieldname}
    if (contentKey.includes('_ph')) {
        match = contentKey.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_ph$/);
        if (match) return match[1];
    }
    
    if (contentKey.includes('_option_')) {
        match = contentKey.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_option_\d+$/);
        if (match) return match[1];
    }
    
    match = contentKey.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)$/);
    if (match) return match[1];
    
    return fieldName;
}

// Run migration
migrateAllDropdowns();