#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function cleanPropertyOwnershipDuplicates() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== CLEANING PROPERTY OWNERSHIP DUPLICATES ===\n');
        
        // Delete entries with app.mortgage.form prefix
        const appMortgageResult = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step1' 
            AND content_key LIKE 'app.mortgage.form.%property_ownership%'
            AND component_type = 'dropdown_option'
            RETURNING id, content_key;
        `);
        
        console.log(`Deleted ${appMortgageResult.rowCount} app.mortgage.form entries:`);
        appMortgageResult.rows.forEach(row => {
            console.log(`  - ID: ${row.id}, Key: ${row.content_key}`);
        });
        
        // Delete entries with mortgage_calculation.field prefix
        const mortgageCalcResult = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step1' 
            AND content_key LIKE 'mortgage_calculation.field.%property_ownership%'
            AND component_type = 'dropdown_option'
            RETURNING id, content_key;
        `);
        
        console.log(`\nDeleted ${mortgageCalcResult.rowCount} mortgage_calculation.field entries:`);
        mortgageCalcResult.rows.forEach(row => {
            console.log(`  - ID: ${row.id}, Key: ${row.content_key}`);
        });
        
        // Verify remaining entries
        const verifyResult = await client.query(`
            SELECT 
                ci.id,
                ci.content_key,
                ct.content_value as label_he
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%property_ownership%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log('\n=== REMAINING PROPERTY OWNERSHIP OPTIONS ===');
        verifyResult.rows.forEach(row => {
            const value = row.content_key.match(/_(has_property|no_property|selling_property)$/)?.[1] || 'UNKNOWN';
            console.log(`  ${value}: "${row.label_he}" (ID: ${row.id})`);
        });
        
        await client.query('COMMIT');
        console.log('\n✅ Transaction committed successfully!');
        console.log(`✅ Total entries deleted: ${appMortgageResult.rowCount + mortgageCalcResult.rowCount}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error.message);
        console.error('Transaction rolled back');
    } finally {
        client.release();
        await contentPool.end();
    }
}

cleanPropertyOwnershipDuplicates();