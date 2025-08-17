const { Pool } = require('pg');
require('dotenv').config();

// Connect to Railway content database
const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
    ssl: { rejectUnauthorized: false }
});

async function analyzeDropdownNaming() {
    console.log('=== DROPDOWN NAMING ANALYSIS ===\n');
    
    try {
        // 1. Get all unique screen_locations that have dropdowns
        const screensResult = await contentPool.query(`
            SELECT DISTINCT screen_location, COUNT(*) as item_count
            FROM content_items
            WHERE component_type IN ('dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label')
            AND is_active = true
            GROUP BY screen_location
            ORDER BY screen_location
        `);
        
        console.log('📍 Screens with dropdowns:');
        screensResult.rows.forEach(row => {
            console.log(`  - ${row.screen_location}: ${row.item_count} items`);
        });
        
        // 2. Analyze content_key patterns for each screen
        console.log('\n📋 Analyzing dropdown patterns for each screen:\n');
        
        const dropdownMap = new Map();
        
        for (const screen of screensResult.rows) {
            const itemsResult = await contentPool.query(`
                SELECT DISTINCT content_key, component_type
                FROM content_items
                WHERE screen_location = $1
                AND component_type IN ('dropdown_container', 'dropdown_option', 'option')
                AND is_active = true
                ORDER BY content_key
                LIMIT 20
            `, [screen.screen_location]);
            
            console.log(`\n🔍 ${screen.screen_location}:`);
            
            const fieldNames = new Set();
            
            itemsResult.rows.forEach(row => {
                // Extract field name using the same logic as server-db.js
                let fieldName = extractFieldName(row.content_key, screen.screen_location);
                if (fieldName) {
                    fieldNames.add(fieldName);
                    const dropdownKey = `${screen.screen_location}_${fieldName}`;
                    if (!dropdownMap.has(dropdownKey)) {
                        dropdownMap.set(dropdownKey, {
                            screen: screen.screen_location,
                            field: fieldName,
                            exampleKey: row.content_key
                        });
                    }
                }
            });
            
            console.log(`  Fields: ${Array.from(fieldNames).join(', ')}`);
        }
        
        // 3. Show proposed JSONB dropdown_keys
        console.log('\n🔑 Proposed JSONB dropdown_keys:\n');
        const sortedKeys = Array.from(dropdownMap.keys()).sort();
        sortedKeys.forEach(key => {
            const data = dropdownMap.get(key);
            console.log(`  ${key}`);
            console.log(`    Screen: ${data.screen}`);
            console.log(`    Field: ${data.field}`);
            console.log(`    Example: ${data.exampleKey}\n`);
        });
        
        console.log(`\nTotal unique dropdowns: ${dropdownMap.size}`);
        
        // 4. Check for potential naming conflicts
        console.log('\n⚠️  Checking for naming conflicts:');
        const fieldsByScreen = {};
        dropdownMap.forEach((data, key) => {
            if (!fieldsByScreen[data.screen]) {
                fieldsByScreen[data.screen] = [];
            }
            fieldsByScreen[data.screen].push(data.field);
        });
        
        let conflicts = false;
        Object.entries(fieldsByScreen).forEach(([screen, fields]) => {
            const duplicates = fields.filter((item, index) => fields.indexOf(item) !== index);
            if (duplicates.length > 0) {
                conflicts = true;
                console.log(`  ❌ ${screen}: duplicate fields: ${duplicates.join(', ')}`);
            }
        });
        
        if (!conflicts) {
            console.log('  ✅ No naming conflicts found!');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await contentPool.end();
    }
}

function extractFieldName(contentKey, screenLocation) {
    let fieldName = null;
    let match;
    
    // Pattern 1: mortgage_step1.field.{fieldname}
    match = contentKey.match(/^[^.]*\.field\.([^.]+?)_[0-9]_(?:no_additional_income|no_obligations)/);
    if (match) return match[1];
    
    match = contentKey.match(/^[^.]*\.field\.([^.]+)_(?:has_property|no_property|selling_property|within_3_months|3_to_6_months|6_to_12_months|over_12_months|apartment|garden_apartment|penthouse|private_house|other|yes_first_home|no_additional_property|investment|fixed_rate|variable_rate|mixed_rate|not_sure|im_|i_no_|i_own_|selling_|no_|has_|single|married|divorced|widowed|partner|commonlaw_partner|no_high_school_diploma|partial_high_school_diploma|full_high_school_diploma|postsecondary_education|bachelors|masters|doctorate|employee|selfemployed|pension|student|unemployed|unpaid_leave|additional_salary|additional_work|property_rental_income|no_additional_income|bank_loan|consumer_credit|credit_card|no_obligations|hapoalim|leumi|discount|massad|mizrahi)/);
    if (match) return match[1];
    
    // Handle field_of_activity
    match = contentKey.match(/^[^.]*\.field\.([^.]+?)_(?:agriculture|technology|healthcare|education|finance|real_estate|construction|retail|manufacturing|government|transport|consulting|entertainment|other)/);
    if (match) return match[1];
    
    match = contentKey.match(/^[^.]*\.field\.([^.]+)/);
    if (match) return match[1];
    
    // Pattern 2: mortgage_stepN_{fieldname}
    match = contentKey.match(/^mortgage_step\d+_([^_]+(?:_[^_]+)*)_(?:options_)?ph$/);
    if (match) return match[1];
    
    if (contentKey.includes('_option_') || contentKey.includes('_options_')) {
        match = contentKey.match(/^mortgage_step\d+_([^_]+(?:_[^_]+)*)_(?:option|options)_\d+$/);
        if (match) return match[1];
    }
    
    match = contentKey.match(/^mortgage_step\d+_([^_]+(?:_[^_]+)*)$/);
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

analyzeDropdownNaming();