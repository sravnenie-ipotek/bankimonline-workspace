#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

function extractFieldName(contentKey) {
    let fieldName = null;
    
    // Pattern 1: mortgage_step1.field.{fieldname} (handles both container and options)
    let match = contentKey.match(/^[^.]*\.field\.([^.]+?)_(?:im_|i_no_|i_own_)/);
    if (match) {
        fieldName = match[1];
        console.log(`  Pattern 1 (option): ${contentKey} -> ${fieldName}`);
        return fieldName;
    } else {
        match = contentKey.match(/^[^.]*\.field\.([^.]+)/);
        if (match) {
            fieldName = match[1];
            console.log(`  Pattern 1 (container): ${contentKey} -> ${fieldName}`);
            return fieldName;
        }
    }
    
    // Pattern 2: app.mortgage.form.calculate_mortgage_{fieldname} (handles both container and options)
    if (!fieldName) {
        // For options like: calculate_mortgage_property_ownership_im_selling_a_property
        match = contentKey.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_(?:im_|i_no_|i_own_)/);
        if (match) {
            fieldName = match[1];
            console.log(`  Pattern 2 (option): ${contentKey} -> ${fieldName}`);
            return fieldName;
        } else {
            // For containers like: calculate_mortgage_property_ownership
            match = contentKey.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)(?:_ph|$)/);
            if (match) {
                fieldName = match[1];
                console.log(`  Pattern 2 (container): ${contentKey} -> ${fieldName}`);
                return fieldName;
            }
        }
    }
    
    // Pattern 3: mortgage_calculation.field.{fieldname} (handles both container and options)
    if (!fieldName) {
        // For options like: mortgage_calculation.field.property_ownership_im_selling_a_property
        match = contentKey.match(/mortgage_calculation\.field\.([^.]+?)_(?:im_|i_no_|i_own_)/);
        if (match) {
            fieldName = match[1];
            console.log(`  Pattern 3 (option): ${contentKey} -> ${fieldName}`);
            return fieldName;
        } else {
            // For containers like: mortgage_calculation.field.property_ownership
            match = contentKey.match(/mortgage_calculation\.field\.([^.]+)/);
            if (match) {
                fieldName = match[1];
                console.log(`  Pattern 3 (container): ${contentKey} -> ${fieldName}`);
                return fieldName;
            }
        }
    }
    
    console.log(`  NO MATCH: ${contentKey} -> null`);
    return null;
}

async function debugFieldNameExtraction() {
    try {
        console.log('=== DEBUGGING FIELD NAME EXTRACTION ===');
        
        const query = `
            SELECT ci.content_key, ci.component_type, ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.component_type IN ('dropdown_container', 'dropdown_option')
            AND ct.language_code = 'he'
            AND ci.content_key LIKE '%property_ownership%'
            ORDER BY ci.component_type, ci.content_key;
        `;
        
        const result = await contentPool.query(query);
        
        console.log('\n=== PROPERTY OWNERSHIP KEYS ===');
        const fieldMap = new Map();
        
        result.rows.forEach(row => {
            console.log(`\nProcessing: ${row.content_key} (${row.component_type})`);
            const fieldName = extractFieldName(row.content_key);
            
            if (fieldName) {
                if (!fieldMap.has(fieldName)) {
                    fieldMap.set(fieldName, { containers: [], options: [] });
                }
                
                if (row.component_type === 'dropdown_container') {
                    fieldMap.get(fieldName).containers.push(row);
                } else if (row.component_type === 'dropdown_option') {
                    fieldMap.get(fieldName).options.push(row);
                }
            }
        });
        
        console.log('\n=== GROUPED BY FIELD NAME ===');
        for (const [fieldName, data] of fieldMap) {
            console.log(`\n📋 Field: ${fieldName}`);
            console.log(`  Containers (${data.containers.length}):`);
            data.containers.forEach(item => {
                console.log(`    ${item.content_key}: "${item.content_value}"`);
            });
            console.log(`  Options (${data.options.length}):`);
            data.options.forEach(item => {
                console.log(`    ${item.content_key}: "${item.content_value}"`);
            });
        }
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugFieldNameExtraction();