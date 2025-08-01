#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function fixStep3ContainerDuplicates() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== CHECKING AND FIXING MORTGAGE_STEP3 CONTAINERS ===\n');
        
        // First check what prefixes we have
        const checkPrefixes = await client.query(`
            SELECT 
                CASE 
                    WHEN content_key LIKE 'mortgage_step3.field.%' THEN 'mortgage_step3.field'
                    WHEN content_key LIKE 'mortgage_calculation.field.%' THEN 'mortgage_calculation.field'
                    WHEN content_key LIKE 'mortgage_step3_%' THEN 'mortgage_step3_'
                    ELSE 'other'
                END as prefix,
                component_type,
                COUNT(*) as count
            FROM content_items
            WHERE screen_location = 'mortgage_step3' 
            AND component_type IN ('dropdown_container', 'dropdown_option')
            GROUP BY prefix, component_type
            ORDER BY prefix, component_type;
        `);
        
        console.log('Current prefix distribution:');
        checkPrefixes.rows.forEach(row => {
            console.log(`  ${row.prefix} (${row.component_type}): ${row.count} items`);
        });
        
        // Delete containers with wrong prefix
        const deleteContainers = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step3' 
            AND component_type = 'dropdown_container'
            AND (
                content_key LIKE 'mortgage_calculation.field.%'
                OR content_key LIKE 'mortgage_step3_%'
            )
            RETURNING id, content_key;
        `);
        
        console.log(`\nDeleted ${deleteContainers.rowCount} duplicate containers with wrong prefix`);
        deleteContainers.rows.forEach(row => {
            console.log(`  - ${row.content_key} (ID: ${row.id})`);
        });
        
        // Check remaining containers
        const checkContainers = await client.query(`
            SELECT 
                content_key,
                COUNT(*) as count
            FROM content_items
            WHERE screen_location = 'mortgage_step3' 
            AND component_type = 'dropdown_container'
            GROUP BY content_key
            ORDER BY content_key;
        `);
        
        console.log('\nRemaining containers:');
        checkContainers.rows.forEach(row => {
            console.log(`  ${row.content_key}: ${row.count}`);
        });
        
        // Check for options that need fixing
        const checkOptions = await client.query(`
            SELECT 
                content_key,
                ct.content_value as label_he
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE screen_location = 'mortgage_step3' 
            AND component_type = 'dropdown_option'
            AND content_key LIKE 'mortgage_step3_%'
            ORDER BY content_key;
        `);
        
        console.log(`\nFound ${checkOptions.rows.length} options with old prefix pattern`);
        if (checkOptions.rows.length > 0) {
            checkOptions.rows.forEach(row => {
                console.log(`  ${row.content_key}: "${row.label_he}"`);
            });
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Transaction committed successfully!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error.message);
        console.error('Transaction rolled back');
    } finally {
        client.release();
        await contentPool.end();
    }
}

fixStep3ContainerDuplicates();