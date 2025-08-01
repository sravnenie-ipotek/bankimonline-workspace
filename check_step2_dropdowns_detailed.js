#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkStep2DropdownsDetailed() {
    try {
        console.log('=== CHECKING FAMILY_STATUS DROPDOWN STRUCTURE ===\n');
        
        // Check family_status container
        const containerResult = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key,
                ci.component_type,
                ct.content_value as label_he
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step2' 
            AND ci.content_key LIKE '%family_status%'
            AND ci.component_type = 'dropdown_container'
            ORDER BY ci.content_key;
        `);
        
        console.log(`Found ${containerResult.rows.length} family_status containers:`);
        containerResult.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Key: ${row.content_key}, Label: "${row.label_he}"`);
        });
        
        // Check family_status options
        const optionsResult = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key,
                ci.component_type,
                ct.content_value as label_he
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step2' 
            AND ci.content_key LIKE '%family_status%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log(`\nFound ${optionsResult.rows.length} family_status options:`);
        optionsResult.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Key: ${row.content_key}, Label: "${row.label_he}"`);
        });
        
        // Check education dropdown
        console.log('\n\n=== CHECKING EDUCATION DROPDOWN STRUCTURE ===\n');
        
        const educationContainer = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key,
                ci.component_type,
                ct.content_value as label_he
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step2' 
            AND ci.content_key LIKE '%education%'
            AND ci.component_type = 'dropdown_container'
            ORDER BY ci.content_key;
        `);
        
        console.log(`Found ${educationContainer.rows.length} education containers:`);
        educationContainer.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Key: ${row.content_key}, Label: "${row.label_he}"`);
        });
        
        const educationOptions = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key,
                ci.component_type,
                ct.content_value as label_he
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step2' 
            AND ci.content_key LIKE '%education%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log(`\nFound ${educationOptions.rows.length} education options:`);
        educationOptions.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Key: ${row.content_key}, Label: "${row.label_he}"`);
        });
        
        // Check problematic keys
        console.log('\n\n=== CHECKING FOR PROBLEMATIC CONTENT KEYS ===\n');
        
        const problematicKeys = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.component_type,
                COUNT(*) as count
            FROM content_items ci
            WHERE ci.screen_location = 'mortgage_step2' 
            AND ci.component_type IN ('dropdown_container', 'dropdown_option')
            GROUP BY ci.content_key, ci.component_type
            HAVING COUNT(*) > 1
            ORDER BY ci.content_key;
        `);
        
        if (problematicKeys.rows.length > 0) {
            console.log('Found duplicate content keys:');
            problematicKeys.rows.forEach(row => {
                console.log(`  ${row.content_key} (${row.component_type}): ${row.count} duplicates`);
            });
        } else {
            console.log('No duplicate content keys found.');
        }
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkStep2DropdownsDetailed();