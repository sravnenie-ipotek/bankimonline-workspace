#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

// Production database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

// Content database connection
const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function testProductionDatabase() {
    console.log('🔍 Testing Production Database Connection...\n');
    
    try {
        // Test main database
        console.log('📊 Testing Main Database...');
        const mainResult = await pool.query('SELECT NOW() as current_time, version() as db_version');
        console.log('✅ Main Database Connected:', mainResult.rows[0].current_time);
        console.log('📋 Database Version:', mainResult.rows[0].db_version.split(' ')[0]);
        
        // Test content database
        console.log('\n📝 Testing Content Database...');
        const contentResult = await contentPool.query('SELECT NOW() as current_time, version() as db_version');
        console.log('✅ Content Database Connected:', contentResult.rows[0].current_time);
        console.log('📋 Database Version:', contentResult.rows[0].db_version.split(' ')[0]);
        
        // Show available tables in main database
        console.log('\n🏦 Main Database Tables:');
        const tablesResult = await pool.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        tablesResult.rows.forEach(table => {
            console.log(`  📋 ${table.table_name} (${table.table_type})`);
        });
        
        // Show available tables in content database
        console.log('\n📝 Content Database Tables:');
        const contentTablesResult = await contentPool.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        contentTablesResult.rows.forEach(table => {
            console.log(`  📋 ${table.table_name} (${table.table_type})`);
        });
        
        // Test some sample data
        console.log('\n📊 Sample Data Tests:');
        
        // Test banks data
        const banksResult = await pool.query('SELECT COUNT(*) as count FROM banks WHERE is_active = true');
        console.log(`  🏦 Active Banks: ${banksResult.rows[0].count}`);
        
        // Test clients data
        const clientsResult = await pool.query('SELECT COUNT(*) as count FROM clients');
        console.log(`  👥 Total Clients: ${clientsResult.rows[0].count}`);
        
        // Test content data
        const contentResult2 = await contentPool.query('SELECT COUNT(*) as count FROM content_items WHERE is_active = true');
        console.log(`  📝 Active Content Items: ${contentResult2.rows[0].count}`);
        
        // Test translations
        const translationsResult = await contentPool.query('SELECT COUNT(*) as count FROM content_translations WHERE status = \'approved\'');
        console.log(`  🌐 Approved Translations: ${translationsResult.rows[0].count}`);
        
        console.log('\n✅ Production Database Test Complete!');
        console.log('🚀 The app is ready to use with production data.');
        
    } catch (error) {
        console.error('❌ Database Test Failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check if DATABASE_URL environment variable is set');
        console.log('2. Verify Railway database is accessible');
        console.log('3. Ensure network connectivity to Railway');
    } finally {
        await pool.end();
        await contentPool.end();
    }
}

// Run the test
testProductionDatabase(); 