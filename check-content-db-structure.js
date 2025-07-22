#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

// Content database connection
const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkStructure() {
    try {
        console.log('=== CONTENT DATABASE STRUCTURE ===\n');

        // Check content_items table structure
        console.log('1. content_items table structure:');
        const itemsStructure = await contentPool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'content_items'
            ORDER BY ordinal_position
        `);
        console.table(itemsStructure.rows);

        // Check content_translations table structure
        console.log('\n2. content_translations table structure:');
        const translationsStructure = await contentPool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'content_translations'
            ORDER BY ordinal_position
        `);
        console.table(translationsStructure.rows);

        // Check if there's a locales table
        console.log('\n3. Checking for locales table:');
        const localesExists = await contentPool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_name = 'locales'
        `);
        
        if (localesExists.rows.length > 0) {
            console.log('✅ locales table exists');
            const localesStructure = await contentPool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'locales'
                ORDER BY ordinal_position
            `);
            console.table(localesStructure.rows);
        } else {
            console.log('❌ locales table does not exist');
        }

        // Check for credit refinancing entries specifically
        console.log('\n4. Looking for credit refinancing entries:');
        const creditRefinanceSearch = await contentPool.query(`
            SELECT *
            FROM content_items
            WHERE screen_location = 'refinance_credit'
               OR screen_location = 'credit_refinance'
               OR screen_location = 'refinancing_credit'
               OR screen_location = 'credit_refinancing'
            LIMIT 10
        `);
        
        if (creditRefinanceSearch.rows.length > 0) {
            console.log('Found credit refinancing entries:');
            console.table(creditRefinanceSearch.rows);
        } else {
            console.log('❌ No credit refinancing entries found with standard naming');
        }

    } catch (error) {
        console.error('Error checking structure:', error);
    } finally {
        await contentPool.end();
    }
}

checkStructure();