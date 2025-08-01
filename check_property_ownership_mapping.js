#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkPropertyOwnershipMapping() {
    try {
        console.log('=== CHECKING PROPERTY OWNERSHIP VALUE MAPPING ===\n');
        
        // Query to get all property ownership options
        const result = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.component_type,
                ct.content_value as label_he,
                ct_en.content_value as label_en
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%property_ownership%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY ci.content_key;
        `);
        
        console.log('Found property ownership options:');
        console.log('================================\n');
        
        result.rows.forEach(row => {
            console.log(`Key: ${row.content_key}`);
            
            // Extract the value from the content key
            let value = 'UNKNOWN';
            if (row.content_key.includes('im_selling_a_property')) {
                value = 'im_selling_a_property';
            } else if (row.content_key.includes('i_no_own_any_property')) {
                value = 'i_no_own_any_property';
            } else if (row.content_key.includes('i_own_a_property')) {
                value = 'i_own_a_property';
            }
            
            console.log(`  Dropdown value: "${value}"`);
            console.log(`  Hebrew label: "${row.label_he}"`);
            console.log(`  English label: "${row.label_en || 'N/A'}"`);
            
            // Show what the backend expects
            let expectedValue = 'UNKNOWN';
            if (value.includes('selling')) {
                expectedValue = 'selling_property';
            } else if (value.includes('no_own') || value.includes('dont')) {
                expectedValue = 'no_property';
            } else if (value.includes('own_a_property')) {
                expectedValue = 'has_property';
            }
            
            console.log(`  ⚠️  Backend expects: "${expectedValue}"`);
            console.log(`  ❌ MISMATCH: "${value}" !== "${expectedValue}"`);
            console.log('');
        });
        
        console.log('\n=== VALUE MAPPING NEEDED ===');
        console.log('The dropdown returns these values:');
        console.log('  - "im_selling_a_property" → should map to → "selling_property"');
        console.log('  - "i_no_own_any_property" → should map to → "no_property"');
        console.log('  - "i_own_a_property" → should map to → "has_property"');
        
        console.log('\n=== CHECKING FOR DUPLICATES ===');
        const duplicateCheck = await contentPool.query(`
            SELECT 
                ci.content_key,
                COUNT(*) as count
            FROM content_items ci
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%property_ownership%'
            AND ci.component_type = 'dropdown_option'
            GROUP BY ci.content_key
            HAVING COUNT(*) > 1;
        `);
        
        if (duplicateCheck.rows.length > 0) {
            console.log('❌ Found duplicate content keys:');
            duplicateCheck.rows.forEach(row => {
                console.log(`  ${row.content_key}: ${row.count} duplicates`);
            });
        } else {
            console.log('✅ No duplicate content keys found');
        }
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkPropertyOwnershipMapping();