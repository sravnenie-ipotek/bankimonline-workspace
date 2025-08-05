#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function fixPropertyOwnershipValues() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('=== FIXING PROPERTY OWNERSHIP VALUES ===\n');
        
        // First, let's see what we're dealing with
        const checkResult = await client.query(`
            SELECT id, content_key, component_type
            FROM content_items
            WHERE screen_location = 'mortgage_step1' 
            AND content_key LIKE '%property_ownership%'
            AND component_type = 'dropdown_option'
            ORDER BY content_key;
        `);
        
        console.log(`Found ${checkResult.rows.length} property ownership options to fix\n`);
        
        // Map old values to new values
        const valueMapping = {
            'im_selling_a_property': 'selling_property',
            'i_no_own_any_property': 'no_property',
            'i_own_a_property': 'has_property'
        };
        
        // Update each option's content_key to use the correct value
        let updateCount = 0;
        
        for (const row of checkResult.rows) {
            let newKey = row.content_key;
            let valueChanged = false;
            
            // Replace the old value with the new value in the content_key
            for (const [oldValue, newValue] of Object.entries(valueMapping)) {
                if (row.content_key.includes(oldValue)) {
                    newKey = row.content_key.replace(oldValue, newValue);
                    valueChanged = true;
                    break;
                }
            }
            
            if (valueChanged) {
                // Check if the new key already exists (to avoid duplicates)
                const existingCheck = await client.query(
                    'SELECT id FROM content_items WHERE content_key = $1 AND id != $2',
                    [newKey, row.id]
                );
                
                if (existingCheck.rows.length > 0) {
                    console.log(`⚠️  Key already exists: ${newKey}`);
                    console.log(`   Deleting duplicate: ${row.content_key}`);
                    
                    // Delete the duplicate
                    await client.query('DELETE FROM content_translations WHERE content_item_id = $1', [row.id]);
                    await client.query('DELETE FROM content_items WHERE id = $1', [row.id]);
                    updateCount++;
                } else {
                    console.log(`✅ Updating: ${row.content_key}`);
                    console.log(`   → to: ${newKey}`);
                    
                    await client.query(
                        'UPDATE content_items SET content_key = $1 WHERE id = $2',
                        [newKey, row.id]
                    );
                    updateCount++;
                }
            }
        }
        
        console.log(`\n✅ Updated/cleaned ${updateCount} property ownership options`);
        
        // Now let's verify the results
        const verifyResult = await client.query(`
            SELECT DISTINCT
                ci.content_key,
                ct.content_value as label_he
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%property_ownership%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log('\n=== VERIFICATION ===');
        console.log('Final property ownership options:');
        verifyResult.rows.forEach(row => {
            // Extract the value
            let value = 'UNKNOWN';
            if (row.content_key.includes('selling_property')) {
                value = 'selling_property';
            } else if (row.content_key.includes('no_property')) {
                value = 'no_property';
            } else if (row.content_key.includes('has_property')) {
                value = 'has_property';
            }
            
            console.log(`  Value: "${value}" | Label: "${row.label_he}"`);
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

fixPropertyOwnershipValues();