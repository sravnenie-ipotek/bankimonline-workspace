#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function fixStep3DropdownStructure() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== FIXING MORTGAGE_STEP3 DROPDOWN STRUCTURE ===\n');
        
        // Create missing containers
        console.log('1. Creating missing dropdown containers...');
        
        // Main source container
        const mainSourceContainer = await client.query(`
            INSERT INTO content_items (screen_location, content_key, component_type, category, status, is_active)
            VALUES ('mortgage_step3', 'mortgage_step3.field.main_source', 'dropdown_container', 'mortgage', 'approved', true)
            RETURNING id;
        `);
        const mainSourceId = mainSourceContainer.rows[0].id;
        
        await client.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value)
            VALUES 
                ($1, 'he', 'מקור הכנסה עיקרי'),
                ($1, 'en', 'Main source of income'),
                ($1, 'ru', 'Основной источник дохода')
        `, [mainSourceId]);
        
        // Additional income container
        const additionalIncomeContainer = await client.query(`
            INSERT INTO content_items (screen_location, content_key, component_type, category, status, is_active)
            VALUES ('mortgage_step3', 'mortgage_step3.field.additional_income', 'dropdown_container', 'mortgage', 'approved', true)
            RETURNING id;
        `);
        const additionalIncomeId = additionalIncomeContainer.rows[0].id;
        
        await client.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value)
            VALUES 
                ($1, 'he', 'הכנסה נוספת'),
                ($1, 'en', 'Additional income'),
                ($1, 'ru', 'Дополнительный доход')
        `, [additionalIncomeId]);
        
        // Obligations container
        const obligationsContainer = await client.query(`
            INSERT INTO content_items (screen_location, content_key, component_type, category, status, is_active)
            VALUES ('mortgage_step3', 'mortgage_step3.field.obligations', 'dropdown_container', 'mortgage', 'approved', true)
            RETURNING id;
        `);
        const obligationsId = obligationsContainer.rows[0].id;
        
        await client.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value)
            VALUES 
                ($1, 'he', 'התחייבויות'),
                ($1, 'en', 'Obligations'),
                ($1, 'ru', 'Обязательства')
        `, [obligationsId]);
        
        console.log('✅ Created 3 dropdown containers');
        
        // Update option keys
        console.log('\n2. Updating option content keys to match new pattern...');
        
        // Update main_source options
        const mainSourceUpdate = await client.query(`
            UPDATE content_items 
            SET content_key = REPLACE(content_key, 'mortgage_step3_main_source', 'mortgage_step3.field.main_source')
            WHERE screen_location = 'mortgage_step3' 
            AND component_type = 'dropdown_option'
            AND content_key LIKE 'mortgage_step3_main_source%'
            RETURNING content_key;
        `);
        
        console.log(`  Updated ${mainSourceUpdate.rowCount} main_source options`);
        
        // Update additional_income options
        const additionalIncomeUpdate = await client.query(`
            UPDATE content_items 
            SET content_key = REPLACE(content_key, 'mortgage_step3_additional_income', 'mortgage_step3.field.additional_income')
            WHERE screen_location = 'mortgage_step3' 
            AND component_type = 'dropdown_option'
            AND content_key LIKE 'mortgage_step3_additional_income%'
            RETURNING content_key;
        `);
        
        console.log(`  Updated ${additionalIncomeUpdate.rowCount} additional_income options`);
        
        // Update obligations options
        const obligationsUpdate = await client.query(`
            UPDATE content_items 
            SET content_key = REPLACE(content_key, 'mortgage_step3_obligations', 'mortgage_step3.field.obligations')
            WHERE screen_location = 'mortgage_step3' 
            AND component_type = 'dropdown_option'
            AND content_key LIKE 'mortgage_step3_obligations%'
            RETURNING content_key;
        `);
        
        console.log(`  Updated ${obligationsUpdate.rowCount} obligations options`);
        
        // Verify the structure
        console.log('\n3. Verifying final structure...');
        
        const verifyResult = await client.query(`
            SELECT 
                component_type,
                COUNT(*) as count
            FROM content_items
            WHERE screen_location = 'mortgage_step3' 
            AND component_type IN ('dropdown_container', 'dropdown_option')
            GROUP BY component_type
            ORDER BY component_type;
        `);
        
        verifyResult.rows.forEach(row => {
            console.log(`  ${row.component_type}: ${row.count} items`);
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

fixStep3DropdownStructure();