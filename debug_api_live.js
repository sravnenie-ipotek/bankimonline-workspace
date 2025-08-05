#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function simulateAPILogic() {
    try {
        console.log('=== SIMULATING DROPDOWN API LOGIC ===');
        
        // Same query as the API
        const result = await contentPool.query(`
            SELECT 
                content_items.content_key,
                content_items.component_type,
                content_translations.content_value
            FROM content_items
            JOIN content_translations ON content_items.id = content_translations.content_item_id
            WHERE content_items.screen_location = $1 
                AND content_translations.language_code = $2
                AND content_translations.status = 'approved'
                AND content_items.is_active = true
                AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder', 'label')
            ORDER BY content_items.content_key, content_items.component_type
        `, ['mortgage_step1', 'he']);
        
        console.log(`\nQuery returned ${result.rows.length} rows`);
        
        // Find property ownership items
        const propertyOwnershipItems = result.rows.filter(row => 
            row.content_key.includes('property_ownership')
        );
        
        console.log(`\n🏠 Property ownership items: ${propertyOwnershipItems.length}`);
        
        propertyOwnershipItems.forEach(row => {
            console.log(`  ${row.component_type}: ${row.content_key}`);
            console.log(`    Value: "${row.content_value}"`);
            
            // Test field name extraction
            let fieldName = null;
            
            // Pattern 1
            let match = row.content_key.match(/^[^.]*\.field\.([^.]+?)_(?:im_|i_no_|i_own_)/);
            if (match) {
                fieldName = match[1];
                console.log(`    → Field (Pattern 1 option): ${fieldName}`);
            } else {
                match = row.content_key.match(/^[^.]*\.field\.([^.]+)/);
                if (match) {
                    fieldName = match[1];
                    console.log(`    → Field (Pattern 1 container): ${fieldName}`);
                }
            }
            
            // Pattern 2
            if (!fieldName) {
                match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_(?:im_|i_no_|i_own_)/);
                if (match) {
                    fieldName = match[1];
                    console.log(`    → Field (Pattern 2 option): ${fieldName}`);
                } else {
                    match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)(?:_ph|$)/);
                    if (match) {
                        fieldName = match[1];
                        console.log(`    → Field (Pattern 2 container): ${fieldName}`);
                    }
                }
            }
            
            // Test option value extraction for options
            if (row.component_type === 'dropdown_option') {
                const optionPatterns = [
                    /_option_(.+)$/,
                    /_(im_selling_a_property)$/,
                    /_(i_no_own_any_property)$/,
                    /_(i_own_a_property)$/,
                    /_([^_]+)$/
                ];
                
                for (const pattern of optionPatterns) {
                    const optionMatch = row.content_key.match(pattern);
                    if (optionMatch) {
                        console.log(`    → Option value: ${optionMatch[1]} (pattern: ${pattern})`);
                        break;
                    }
                }
            }
            
            console.log('');
        });
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

simulateAPILogic();