#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function fixStep2Step3ComponentTypes() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== UPDATING COMPONENT TYPES FOR MORTGAGE_STEP2 AND MORTGAGE_STEP3 ===\n');
        
        // Update dropdown to dropdown_container for step2
        const step2ContainerUpdate = await client.query(`
            UPDATE content_items 
            SET component_type = 'dropdown_container'
            WHERE screen_location = 'mortgage_step2' 
            AND component_type = 'dropdown'
            RETURNING id, content_key;
        `);
        
        console.log(`✅ Updated ${step2ContainerUpdate.rowCount} dropdown containers in mortgage_step2`);
        
        // Update option to dropdown_option for step2
        const step2OptionUpdate = await client.query(`
            UPDATE content_items 
            SET component_type = 'dropdown_option'
            WHERE screen_location = 'mortgage_step2' 
            AND component_type = 'option'
            RETURNING id, content_key;
        `);
        
        console.log(`✅ Updated ${step2OptionUpdate.rowCount} dropdown options in mortgage_step2`);
        
        // Update dropdown to dropdown_container for step3
        const step3ContainerUpdate = await client.query(`
            UPDATE content_items 
            SET component_type = 'dropdown_container'
            WHERE screen_location = 'mortgage_step3' 
            AND component_type = 'dropdown'
            RETURNING id, content_key;
        `);
        
        console.log(`✅ Updated ${step3ContainerUpdate.rowCount} dropdown containers in mortgage_step3`);
        
        // Update option to dropdown_option for step3
        const step3OptionUpdate = await client.query(`
            UPDATE content_items 
            SET component_type = 'dropdown_option'
            WHERE screen_location = 'mortgage_step3' 
            AND component_type = 'option'
            RETURNING id, content_key;
        `);
        
        console.log(`✅ Updated ${step3OptionUpdate.rowCount} dropdown options in mortgage_step3`);
        
        // Verify the updates
        const verifyResult = await client.query(`
            SELECT 
                screen_location,
                component_type,
                COUNT(*) as count
            FROM content_items
            WHERE screen_location IN ('mortgage_step2', 'mortgage_step3')
            AND component_type IN ('dropdown_container', 'dropdown_option')
            GROUP BY screen_location, component_type
            ORDER BY screen_location, component_type;
        `);
        
        console.log('\n=== VERIFICATION ===');
        console.log('Updated component types:');
        verifyResult.rows.forEach(row => {
            console.log(`  ${row.screen_location}: ${row.count} ${row.component_type} items`);
        });
        
        const totalUpdated = step2ContainerUpdate.rowCount + step2OptionUpdate.rowCount + 
                           step3ContainerUpdate.rowCount + step3OptionUpdate.rowCount;
        
        console.log(`\n✅ Total items updated: ${totalUpdated}`);
        
        await client.query('COMMIT');
        console.log('✅ Transaction committed successfully!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error.message);
        console.error('Transaction rolled back');
    } finally {
        client.release();
        await contentPool.end();
    }
}

fixStep2Step3ComponentTypes();