#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

// Content database connection
const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function fixMortgageDropdownTypes() {
    try {
        console.log('🔧 FIXING MORTGAGE_STEP1 DROPDOWN COMPONENT TYPES...');
        
        // First, check the current schema to understand value storage
        const schemaQuery = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'content_items'
            AND column_name IN ('value', 'content_value', 'text_value', 'content')
            ORDER BY ordinal_position;
        `;
        
        const schema = await contentPool.query(schemaQuery);
        console.log('\n📋 Available value columns:');
        schema.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type}`);
        });
        
        // Check if there are separate translation tables
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND (table_name LIKE '%translation%' OR table_name LIKE '%content%' OR table_name LIKE '%value%')
            ORDER BY table_name;
        `;
        
        const tables = await contentPool.query(tablesQuery);
        console.log('\n📊 Content-related tables:');
        tables.rows.forEach(row => {
            console.log(`  ${row.table_name}`);
        });
        
        // Sample the content_items to see what fields have values
        const sampleQuery = `
            SELECT * 
            FROM content_items 
            WHERE screen_location = 'mortgage_step1' 
            AND component_type = 'dropdown'
            LIMIT 2;
        `;
        
        const sample = await contentPool.query(sampleQuery);
        console.log('\n📝 Sample content_items structure:');
        if (sample.rows.length > 0) {
            const firstRow = sample.rows[0];
            Object.keys(firstRow).forEach(key => {
                const value = firstRow[key];
                if (value !== null && value !== undefined) {
                    console.log(`  ${key}: ${typeof value === 'string' ? `"${value}"` : value}`);
                }
            });
        }
        
        console.log('\n🔧 UPDATING COMPONENT TYPES...');
        
        // Update dropdown -> dropdown_container
        const updateContainers = `
            UPDATE content_items 
            SET component_type = 'dropdown_container'
            WHERE screen_location = 'mortgage_step1' 
            AND component_type = 'dropdown';
        `;
        
        const containerResult = await contentPool.query(updateContainers);
        console.log(`✅ Updated ${containerResult.rowCount} dropdown containers`);
        
        // Update option -> dropdown_option
        const updateOptions = `
            UPDATE content_items 
            SET component_type = 'dropdown_option'
            WHERE screen_location = 'mortgage_step1' 
            AND component_type = 'option';
        `;
        
        const optionResult = await contentPool.query(updateOptions);
        console.log(`✅ Updated ${optionResult.rowCount} dropdown options`);
        
        // Verify the changes
        const verifyQuery = `
            SELECT component_type, COUNT(*) as count
            FROM content_items 
            WHERE screen_location = 'mortgage_step1' 
            AND component_type IN ('dropdown_container', 'dropdown_option')
            GROUP BY component_type
            ORDER BY component_type;
        `;
        
        const verify = await contentPool.query(verifyQuery);
        console.log('\n✅ VERIFICATION - Updated component types:');
        verify.rows.forEach(row => {
            console.log(`  ${row.component_type}: ${row.count} items`);
        });
        
        console.log('\n🎉 MORTGAGE_STEP1 DROPDOWN TYPES FIXED!');
        
    } catch (error) {
        console.error('❌ Error fixing dropdown types:', error.message);
    } finally {
        await contentPool.end();
    }
}

fixMortgageDropdownTypes();