#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function addMortgageTypeOptions() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== ADDING MORTGAGE TYPE OPTIONS ===\n');
        
        // First check if they already exist
        const existingCheck = await client.query(`
            SELECT content_key
            FROM content_items
            WHERE screen_location = 'mortgage_step1' 
            AND content_key LIKE 'mortgage_step1.field.type_%'
            AND component_type = 'dropdown_option'
            AND (
                content_key LIKE '%fixed_rate%'
                OR content_key LIKE '%variable_rate%'
                OR content_key LIKE '%mixed_rate%'
                OR content_key LIKE '%not_sure%'
            );
        `);
        
        if (existingCheck.rows.length > 0) {
            console.log('Mortgage type options already exist:');
            existingCheck.rows.forEach(row => {
                console.log(`  - ${row.content_key}`);
            });
            return;
        }
        
        // Insert mortgage type options
        const mortgageTypes = [
            { key: 'mortgage_step1.field.type_fixed_rate', value_he: 'ריבית קבועה', value_en: 'Fixed Rate' },
            { key: 'mortgage_step1.field.type_variable_rate', value_he: 'ריבית משתנה', value_en: 'Variable Rate' },
            { key: 'mortgage_step1.field.type_mixed_rate', value_he: 'ריבית משולבת', value_en: 'Mixed Rate' },
            { key: 'mortgage_step1.field.type_not_sure', value_he: 'לא בטוח', value_en: 'Not Sure' }
        ];
        
        for (const type of mortgageTypes) {
            // Insert content item
            const itemResult = await client.query(`
                INSERT INTO content_items (content_key, screen_location, component_type, is_active, created_at, updated_at)
                VALUES ($1, 'mortgage_step1', 'dropdown_option', true, NOW(), NOW())
                RETURNING id;
            `, [type.key]);
            
            const itemId = itemResult.rows[0].id;
            
            // Insert Hebrew translation
            await client.query(`
                INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
                VALUES ($1, 'he', $2, 'approved', NOW(), NOW());
            `, [itemId, type.value_he]);
            
            // Insert English translation
            await client.query(`
                INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
                VALUES ($1, 'en', $2, 'approved', NOW(), NOW());
            `, [itemId, type.value_en]);
            
            console.log(`✅ Added: ${type.key}`);
            console.log(`   Hebrew: "${type.value_he}"`);
            console.log(`   English: "${type.value_en}"`);
        }
        
        // Delete any remaining mortgage type options with wrong prefixes
        const deleteOldTypes = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step1' 
            AND component_type = 'dropdown_option'
            AND (
                content_key LIKE 'app.mortgage.form.%type_%'
                OR content_key LIKE 'mortgage_calculation.field.%type_%'
            )
            AND (
                content_key LIKE '%fixed_rate%'
                OR content_key LIKE '%variable_rate%'
                OR content_key LIKE '%mixed_rate%'
                OR content_key LIKE '%not_sure%'
            )
            RETURNING id, content_key;
        `);
        
        if (deleteOldTypes.rowCount > 0) {
            console.log(`\nCleaned up ${deleteOldTypes.rowCount} old mortgage type entries`);
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

addMortgageTypeOptions();