#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function finalDropdownCleanup() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== FINAL DROPDOWN CLEANUP FOR MORTGAGE_STEP1 ===\n');
        
        // 1. Clean up when_needed duplicates
        console.log('1. CLEANING WHEN_NEEDED DUPLICATES:');
        const whenNeededDeletes = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step1' 
            AND content_key LIKE '%when_needed%'
            AND component_type = 'dropdown_option'
            AND (
                content_key LIKE 'app.mortgage.form.%'
                OR content_key LIKE 'mortgage_calculation.field.%'
            )
            RETURNING id, content_key;
        `);
        
        console.log(`  Deleted ${whenNeededDeletes.rowCount} when_needed duplicates`);
        
        // 2. Clean up first_home duplicates
        console.log('\n2. CLEANING FIRST_HOME DUPLICATES:');
        const firstHomeDeletes = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step1' 
            AND content_key LIKE '%first%'
            AND component_type = 'dropdown_option'
            AND (
                content_key LIKE 'app.mortgage.form.%'
                OR content_key LIKE 'mortgage_calculation.field.%'
            )
            RETURNING id, content_key;
        `);
        
        console.log(`  Deleted ${firstHomeDeletes.rowCount} first_home duplicates`);
        
        // 3. Fix type dropdown - it should be mortgage types, not property types
        console.log('\n3. CHECKING TYPE DROPDOWN ISSUE:');
        
        // First, let's see what we have
        const typeCheck = await client.query(`
            SELECT content_key, ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%type%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log('  Current type options:');
        typeCheck.rows.forEach(row => {
            console.log(`    ${row.content_key}: "${row.content_value}"`);
        });
        
        // The issue is that we have property types mixed with mortgage types
        // Delete the property type options (apartment, penthouse, etc.) from mortgage_step1
        const propertyTypeDeletes = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step1' 
            AND content_key LIKE '%type_%'
            AND component_type = 'dropdown_option'
            AND (
                content_key LIKE '%apartment%'
                OR content_key LIKE '%penthouse%'
                OR content_key LIKE '%private_house%'
                OR content_key LIKE '%garden_apartment%'
                OR content_key LIKE '%other%'
            )
            RETURNING id, content_key;
        `);
        
        console.log(`  Deleted ${propertyTypeDeletes.rowCount} property type options (these belong to a different dropdown)`);
        
        // Now check if we have mortgage type options
        const mortgageTypeCheck = await client.query(`
            SELECT COUNT(*) as count
            FROM content_items
            WHERE screen_location = 'mortgage_step1' 
            AND content_key LIKE '%type_%'
            AND component_type = 'dropdown_option'
            AND (
                content_key LIKE '%fixed_rate%'
                OR content_key LIKE '%variable_rate%'
                OR content_key LIKE '%mixed_rate%'
                OR content_key LIKE '%not_sure%'
            );
        `);
        
        if (mortgageTypeCheck.rows[0].count === '0') {
            console.log('\n  ⚠️  No mortgage type options found! Need to add them.');
            
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
                    INSERT INTO content_items (content_key, screen_location, component_type, is_active)
                    VALUES ($1, 'mortgage_step1', 'dropdown_option', true)
                    RETURNING id;
                `, [type.key]);
                
                const itemId = itemResult.rows[0].id;
                
                // Insert Hebrew translation
                await client.query(`
                    INSERT INTO content_translations (content_item_id, language_code, content_value, status)
                    VALUES ($1, 'he', $2, 'approved');
                `, [itemId, type.value_he]);
                
                // Insert English translation
                await client.query(`
                    INSERT INTO content_translations (content_item_id, language_code, content_value, status)
                    VALUES ($1, 'en', $2, 'approved');
                `, [itemId, type.value_en]);
                
                console.log(`    ✅ Added: ${type.key}`);
            }
        }
        
        // 4. Final verification
        console.log('\n=== FINAL VERIFICATION ===');
        
        const finalCheck = await client.query(`
            SELECT 
                CASE 
                    WHEN content_key LIKE '%when_needed%' THEN 'when_needed'
                    WHEN content_key LIKE '%type%' AND NOT content_key LIKE '%property%' THEN 'type'
                    WHEN content_key LIKE '%first%' THEN 'first_home'
                    WHEN content_key LIKE '%property_ownership%' THEN 'property_ownership'
                END as dropdown,
                COUNT(*) as count
            FROM content_items
            WHERE screen_location = 'mortgage_step1' 
            AND component_type = 'dropdown_option'
            AND content_key LIKE 'mortgage_step1.field.%'
            AND (
                content_key LIKE '%when_needed%'
                OR (content_key LIKE '%type%' AND NOT content_key LIKE '%property%')
                OR content_key LIKE '%first%'
                OR content_key LIKE '%property_ownership%'
            )
            GROUP BY dropdown;
        `);
        
        console.log('Final option counts:');
        finalCheck.rows.forEach(row => {
            console.log(`  ${row.dropdown}: ${row.count} options`);
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

finalDropdownCleanup();