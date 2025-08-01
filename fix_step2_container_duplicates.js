#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function fixStep2ContainerDuplicates() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== REMOVING DUPLICATE CONTAINERS IN MORTGAGE_STEP2 ===\n');
        
        // Delete containers with wrong prefix
        const deleteContainers = await client.query(`
            DELETE FROM content_items 
            WHERE screen_location = 'mortgage_step2' 
            AND component_type = 'dropdown_container'
            AND content_key LIKE 'mortgage_calculation.field.%'
            RETURNING id, content_key;
        `);
        
        console.log(`Deleted ${deleteContainers.rowCount} duplicate containers with wrong prefix`);
        deleteContainers.rows.forEach(row => {
            console.log(`  - ${row.content_key} (ID: ${row.id})`);
        });
        
        // Check remaining containers
        const checkContainers = await client.query(`
            SELECT 
                content_key,
                COUNT(*) as count
            FROM content_items
            WHERE screen_location = 'mortgage_step2' 
            AND component_type = 'dropdown_container'
            GROUP BY content_key
            ORDER BY content_key;
        `);
        
        console.log('\nRemaining containers:');
        checkContainers.rows.forEach(row => {
            console.log(`  ${row.content_key}: ${row.count}`);
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

fixStep2ContainerDuplicates();