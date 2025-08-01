#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function removeDuplicateDropdownOptions() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== REMOVING DUPLICATE DROPDOWN OPTIONS ===\n');
        
        // Find all duplicate dropdown options
        const duplicatesResult = await client.query(`
            WITH duplicates AS (
                SELECT 
                    ci.content_key,
                    ci.screen_location,
                    ci.component_type,
                    COUNT(*) as count,
                    array_agg(ci.id ORDER BY ci.created_at) as ids
                FROM content_items ci
                WHERE ci.component_type = 'dropdown_option'
                GROUP BY ci.content_key, ci.screen_location, ci.component_type
                HAVING COUNT(*) > 1
            )
            SELECT * FROM duplicates
            ORDER BY screen_location, content_key;
        `);
        
        console.log(`Found ${duplicatesResult.rows.length} duplicate dropdown option groups\n`);
        
        let totalDeleted = 0;
        
        for (const duplicate of duplicatesResult.rows) {
            console.log(`Processing: ${duplicate.content_key}`);
            console.log(`  Screen: ${duplicate.screen_location}`);
            console.log(`  Count: ${duplicate.count} duplicates`);
            console.log(`  IDs: ${duplicate.ids.join(', ')}`);
            
            // Keep the first ID (oldest), delete the rest
            const idsToDelete = duplicate.ids.slice(1);
            
            for (const id of idsToDelete) {
                // Delete translations first
                await client.query('DELETE FROM content_translations WHERE content_item_id = $1', [id]);
                // Then delete the item
                await client.query('DELETE FROM content_items WHERE id = $1', [id]);
                console.log(`  ✅ Deleted duplicate ID: ${id}`);
                totalDeleted++;
            }
            
            console.log('');
        }
        
        console.log(`\n✅ Removed ${totalDeleted} duplicate dropdown options`);
        
        // Verify no duplicates remain
        const verifyResult = await client.query(`
            SELECT 
                content_key,
                screen_location,
                COUNT(*) as count
            FROM content_items
            WHERE component_type = 'dropdown_option'
            GROUP BY content_key, screen_location
            HAVING COUNT(*) > 1;
        `);
        
        if (verifyResult.rows.length === 0) {
            console.log('✅ Verification: No duplicate dropdown options remain');
        } else {
            console.log(`❌ Warning: ${verifyResult.rows.length} duplicate groups still exist`);
        }
        
        // Show sample of property ownership options after cleanup
        const sampleResult = await client.query(`
            SELECT 
                ci.content_key,
                ct.content_value as label_he
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%property_ownership%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log('\n=== PROPERTY OWNERSHIP OPTIONS AFTER CLEANUP ===');
        sampleResult.rows.forEach(row => {
            const value = row.content_key.match(/_(has_property|no_property|selling_property)$/)?.[1] || 'UNKNOWN';
            console.log(`  ${value}: "${row.label_he}"`);
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

removeDuplicateDropdownOptions();