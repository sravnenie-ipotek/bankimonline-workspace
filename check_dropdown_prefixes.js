#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkDropdownPrefixes() {
    try {
        console.log('=== CHECKING DROPDOWN OPTION PREFIXES ===\n');
        
        const result = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key,
                CASE 
                    WHEN ci.content_key LIKE 'app.mortgage.form.%' THEN 'app.mortgage.form'
                    WHEN ci.content_key LIKE 'mortgage_calculation.field.%' THEN 'mortgage_calculation.field'
                    WHEN ci.content_key LIKE 'mortgage_step1.field.%' THEN 'mortgage_step1.field'
                    ELSE 'other'
                END as prefix,
                ct.content_value as label_he
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE '%property_ownership%'
            AND ci.component_type = 'dropdown_option'
            ORDER BY 
                CASE 
                    WHEN ci.content_key LIKE '%no_property%' THEN 1
                    WHEN ci.content_key LIKE '%has_property%' THEN 2
                    WHEN ci.content_key LIKE '%selling_property%' THEN 3
                END,
                prefix;
        `);
        
        console.log('Property ownership options by prefix:\n');
        
        let currentValue = '';
        result.rows.forEach(row => {
            const value = row.content_key.match(/_(has_property|no_property|selling_property)$/)?.[1] || 'UNKNOWN';
            
            if (value !== currentValue) {
                currentValue = value;
                console.log(`\n${value.toUpperCase()}:`);
            }
            
            console.log(`  [${row.prefix}] ID: ${row.id}`);
            console.log(`    Key: ${row.content_key}`);
            console.log(`    Label: "${row.label_he}"`);
        });
        
        console.log('\n=== RECOMMENDATION ===');
        console.log('Keep only mortgage_step1.field prefix entries as they are the most specific.');
        console.log('Delete entries with app.mortgage.form and mortgage_calculation.field prefixes.');
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkDropdownPrefixes();