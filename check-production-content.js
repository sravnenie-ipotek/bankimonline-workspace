#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkProductionContent() {
    try {
        console.log('🔍 Checking Production Database Content...\n');
        
        // 1. Check if content_items table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'content_items'
            );
        `);
        
        console.log('📋 Content items table exists:', tableExists.rows[0].exists);
        
        if (tableExists.rows[0].exists) {
            // 2. Check mortgage_step1 content
            const step1Content = await pool.query(`
                SELECT COUNT(*) as count 
                FROM content_items 
                WHERE screen_location = 'mortgage_step1'
            `);
            
            // 3. Check mortgage_calculation content
            const calcContent = await pool.query(`
                SELECT COUNT(*) as count 
                FROM content_items 
                WHERE screen_location = 'mortgage_calculation'
            `);
            
            console.log('🏠 mortgage_step1 items:', step1Content.rows[0].count);
            console.log('📊 mortgage_calculation items:', calcContent.rows[0].count);
            
            // 4. Show sample content
            const sampleContent = await pool.query(`
                SELECT content_key, screen_location, component_type 
                FROM content_items 
                WHERE screen_location IN ('mortgage_step1', 'mortgage_calculation')
                LIMIT 5
            `);
            
            console.log('\n📝 Sample content:');
            sampleContent.rows.forEach(row => {
                console.log(`  - ${row.content_key} (${row.screen_location})`);
            });
            
            // 5. Check content_translations table
            const translationsExist = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'content_translations'
                );
            `);
            
            console.log('\n📝 Content translations table exists:', translationsExist.rows[0].exists);
            
            if (translationsExist.rows[0].exists) {
                const translationCount = await pool.query(`
                    SELECT COUNT(*) as count 
                    FROM content_translations
                `);
                console.log('📝 Total translations:', translationCount.rows[0].count);
            }
            
        } else {
            console.log('❌ Content items table does not exist!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkProductionContent(); 