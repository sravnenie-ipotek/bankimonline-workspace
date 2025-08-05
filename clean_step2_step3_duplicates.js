#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function cleanStep2Step3Duplicates() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== CLEANING DUPLICATES IN MORTGAGE_STEP2 AND MORTGAGE_STEP3 ===\n');
        
        // Check for duplicate prefixes
        const checkDuplicates = await client.query(`
            SELECT 
                screen_location,
                CASE 
                    WHEN content_key LIKE 'app.mortgage.form.%' THEN 'app.mortgage.form'
                    WHEN content_key LIKE 'mortgage_calculation.field.%' THEN 'mortgage_calculation.field'
                    WHEN content_key LIKE 'mortgage_step2.field.%' THEN 'mortgage_step2.field'
                    WHEN content_key LIKE 'mortgage_step3.field.%' THEN 'mortgage_step3.field'
                    ELSE 'other'
                END as prefix,
                COUNT(*) as count
            FROM content_items
            WHERE screen_location IN ('mortgage_step2', 'mortgage_step3')
            AND component_type = 'dropdown_option'
            GROUP BY screen_location, prefix
            ORDER BY screen_location, prefix;
        `);
        
        console.log('Current prefix distribution:');
        checkDuplicates.rows.forEach(row => {
            console.log(`  ${row.screen_location} - ${row.prefix}: ${row.count} items`);
        });
        
        // Delete duplicates with wrong prefixes for step2
        console.log('\n1. CLEANING MORTGAGE_STEP2 DUPLICATES:');
        
        const step2Deletes = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step2' 
            AND component_type = 'dropdown_option'
            AND (
                content_key LIKE 'app.mortgage.form.%'
                OR content_key LIKE 'mortgage_calculation.field.%'
            )
            RETURNING id, content_key;
        `);
        
        console.log(`  Deleted ${step2Deletes.rowCount} duplicate options from mortgage_step2`);
        
        // Delete duplicates with wrong prefixes for step3
        console.log('\n2. CLEANING MORTGAGE_STEP3 DUPLICATES:');
        
        const step3Deletes = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step3' 
            AND component_type = 'dropdown_option'
            AND (
                content_key LIKE 'app.mortgage.form.%'
                OR content_key LIKE 'mortgage_calculation.field.%'
            )
            RETURNING id, content_key;
        `);
        
        console.log(`  Deleted ${step3Deletes.rowCount} duplicate options from mortgage_step3`);
        
        // Check specific dropdowns
        console.log('\n=== CHECKING SPECIFIC DROPDOWNS ===');
        
        // Check family_status dropdown
        const familyStatusCheck = await client.query(`
            SELECT content_key, ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step2' 
            AND ci.content_key LIKE '%family_status%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log(`\nfamily_status options (${familyStatusCheck.rows.length}):`);
        familyStatusCheck.rows.forEach(row => {
            console.log(`  ${row.content_key}: "${row.content_value}"`);
        });
        
        // Check education dropdown
        const educationCheck = await client.query(`
            SELECT content_key, ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step2' 
            AND ci.content_key LIKE '%education%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log(`\neducation options (${educationCheck.rows.length}):`);
        educationCheck.rows.forEach(row => {
            console.log(`  ${row.content_key}: "${row.content_value}"`);
        });
        
        // Check main_source dropdown
        const mainSourceCheck = await client.query(`
            SELECT content_key, ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step3' 
            AND ci.content_key LIKE '%main_source%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log(`\nmain_source options (${mainSourceCheck.rows.length}):`);
        mainSourceCheck.rows.forEach(row => {
            console.log(`  ${row.content_key}: "${row.content_value}"`);
        });
        
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

cleanStep2Step3Duplicates();