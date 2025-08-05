#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkDropdownStructures() {
    try {
        console.log('=== CHECKING ALL DROPDOWN STRUCTURES IN MORTGAGE_STEP1 ===\n');
        
        // Check when_needed dropdown
        console.log('1. WHEN_NEEDED DROPDOWN:');
        const whenNeededResult = await contentPool.query(`
            SELECT content_key, component_type, ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%when%'
            AND ci.component_type IN ('dropdown_container', 'dropdown_option')
            ORDER BY ci.component_type DESC, ci.content_key;
        `);
        
        whenNeededResult.rows.forEach(row => {
            console.log(`  ${row.component_type}: ${row.content_key}`);
            console.log(`    Value: "${row.content_value}"`);
        });
        
        // Check type dropdown
        console.log('\n2. TYPE DROPDOWN:');
        const typeResult = await contentPool.query(`
            SELECT content_key, component_type, ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%type%' 
            AND ci.content_key NOT LIKE '%property%'
            AND ci.component_type IN ('dropdown_container', 'dropdown_option')
            ORDER BY ci.component_type DESC, ci.content_key;
        `);
        
        typeResult.rows.forEach(row => {
            console.log(`  ${row.component_type}: ${row.content_key}`);
            console.log(`    Value: "${row.content_value}"`);
        });
        
        // Check first_home dropdown
        console.log('\n3. FIRST_HOME DROPDOWN:');
        const firstHomeResult = await contentPool.query(`
            SELECT content_key, component_type, ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%first%'
            AND ci.component_type IN ('dropdown_container', 'dropdown_option')
            ORDER BY ci.component_type DESC, ci.content_key;
        `);
        
        firstHomeResult.rows.forEach(row => {
            console.log(`  ${row.component_type}: ${row.content_key}`);
            console.log(`    Value: "${row.content_value}"`);
        });
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkDropdownStructures();