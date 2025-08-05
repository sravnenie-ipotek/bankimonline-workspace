#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkStep2Step3Dropdowns() {
    try {
        console.log('=== CHECKING DROPDOWNS IN MORTGAGE_STEP2 ===\n');
        
        // Check mortgage_step2 dropdowns
        const step2Result = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.component_type,
                ct.content_value as label_he,
                ci.screen_location
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step2' 
            AND ci.component_type IN ('dropdown', 'option', 'dropdown_container', 'dropdown_option')
            ORDER BY ci.component_type, ci.content_key;
        `);
        
        console.log(`Found ${step2Result.rows.length} dropdown items in mortgage_step2\n`);
        
        // Group by field
        const step2Fields = new Map();
        step2Result.rows.forEach(row => {
            let fieldName = 'unknown';
            
            // Extract field name from content_key
            if (row.content_key.includes('family_status')) fieldName = 'family_status';
            else if (row.content_key.includes('education')) fieldName = 'education';
            else if (row.content_key.includes('citizenship')) fieldName = 'citizenship';
            else if (row.content_key.includes('tax')) fieldName = 'tax_countries';
            
            if (!step2Fields.has(fieldName)) {
                step2Fields.set(fieldName, { containers: [], options: [] });
            }
            
            if (row.component_type === 'dropdown' || row.component_type === 'dropdown_container') {
                step2Fields.get(fieldName).containers.push(row);
            } else {
                step2Fields.get(fieldName).options.push(row);
            }
        });
        
        console.log('MORTGAGE_STEP2 DROPDOWNS:');
        for (const [field, data] of step2Fields) {
            console.log(`\n${field}:`);
            console.log(`  Containers (${data.containers.length}): ${data.containers.map(c => c.component_type).join(', ')}`);
            console.log(`  Options (${data.options.length}): ${data.options.map(o => o.component_type).join(', ')}`);
        }
        
        console.log('\n\n=== CHECKING DROPDOWNS IN MORTGAGE_STEP3 ===\n');
        
        // Check mortgage_step3 dropdowns
        const step3Result = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.component_type,
                ct.content_value as label_he,
                ci.screen_location
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step3' 
            AND ci.component_type IN ('dropdown', 'option', 'dropdown_container', 'dropdown_option')
            ORDER BY ci.component_type, ci.content_key;
        `);
        
        console.log(`Found ${step3Result.rows.length} dropdown items in mortgage_step3\n`);
        
        // Group by field
        const step3Fields = new Map();
        step3Result.rows.forEach(row => {
            let fieldName = 'unknown';
            
            // Extract field name from content_key
            if (row.content_key.includes('main_source')) fieldName = 'main_source';
            else if (row.content_key.includes('additional_income')) fieldName = 'additional_income';
            else if (row.content_key.includes('obligation')) fieldName = 'obligation';
            
            if (!step3Fields.has(fieldName)) {
                step3Fields.set(fieldName, { containers: [], options: [] });
            }
            
            if (row.component_type === 'dropdown' || row.component_type === 'dropdown_container') {
                step3Fields.get(fieldName).containers.push(row);
            } else {
                step3Fields.get(fieldName).options.push(row);
            }
        });
        
        console.log('MORTGAGE_STEP3 DROPDOWNS:');
        for (const [field, data] of step3Fields) {
            console.log(`\n${field}:`);
            console.log(`  Containers (${data.containers.length}): ${data.containers.map(c => c.component_type).join(', ')}`);
            console.log(`  Options (${data.options.length}): ${data.options.map(o => o.component_type).join(', ')}`);
        }
        
        // Check which need fixing
        console.log('\n\n=== COMPONENT TYPES THAT NEED UPDATING ===');
        
        const needsFixing = await contentPool.query(`
            SELECT 
                screen_location,
                component_type,
                COUNT(*) as count
            FROM content_items
            WHERE screen_location IN ('mortgage_step2', 'mortgage_step3')
            AND component_type IN ('dropdown', 'option')
            GROUP BY screen_location, component_type
            ORDER BY screen_location, component_type;
        `);
        
        if (needsFixing.rows.length > 0) {
            console.log('\nItems that need component type updates:');
            needsFixing.rows.forEach(row => {
                console.log(`  ${row.screen_location}: ${row.count} items with type '${row.component_type}'`);
            });
        } else {
            console.log('\n✅ All component types are already standardized!');
        }
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkStep2Step3Dropdowns();