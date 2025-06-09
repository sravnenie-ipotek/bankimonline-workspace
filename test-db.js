#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

// Create database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway') ? {
        rejectUnauthorized: false
    } : false
});

async function testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...\n');
    
    try {
        // Test basic connection
        console.log('📡 Connecting to Railway PostgreSQL...');
        const timeResult = await pool.query('SELECT NOW() as current_time');
        console.log('✅ Connection successful!');
        console.log(`🕐 Server time: ${timeResult.rows[0].current_time}\n`);

        // Get database info
        console.log('📊 Database Information:');
        const dbInfo = await pool.query('SELECT current_database() as db_name, current_user as username, version()');
        console.log(`   Database: ${dbInfo.rows[0].db_name}`);
        console.log(`   User: ${dbInfo.rows[0].username}`);
        console.log(`   Version: ${dbInfo.rows[0].version.split(' ')[0]} ${dbInfo.rows[0].version.split(' ')[1]}\n`);

        // List all tables
        console.log('📋 Available Tables:');
        const tablesResult = await pool.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        if (tablesResult.rows.length === 0) {
            console.log('   ⚠️  No tables found! You may need to import your backup file.');
        } else {
            tablesResult.rows.forEach((table, index) => {
                console.log(`   ${index + 1}. ${table.table_name} (${table.table_type})`);
            });
        }
        console.log('');

        // Test specific tables that our application uses
        console.log('🎯 Testing Application Tables:');
        const testTables = ['users', 'banks', 'cities', 'locales'];
        
        for (const tableName of testTables) {
            try {
                const result = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
                console.log(`   ✅ ${tableName}: ${result.rows[0].count} records`);
            } catch (err) {
                console.log(`   ❌ ${tableName}: Table not found or error - ${err.message}`);
            }
        }
        console.log('');

        // Show sample data from users table (if exists)
        try {
            console.log('👥 Sample Users (first 5):');
            const usersResult = await pool.query('SELECT id, name, phone, email, role FROM users LIMIT 5');
            if (usersResult.rows.length === 0) {
                console.log('   No users found in the database.');
            } else {
                usersResult.rows.forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.name} | ${user.phone} | ${user.email} | ${user.role}`);
                });
            }
        } catch (err) {
            console.log(`   ❌ Cannot access users table: ${err.message}`);
        }
        console.log('');

        // Show sample data from banks table (if exists)
        try {
            console.log('🏦 Sample Banks (first 5):');
            const banksResult = await pool.query('SELECT id, name_ru, name_en, name_he FROM banks LIMIT 5');
            if (banksResult.rows.length === 0) {
                console.log('   No banks found in the database.');
            } else {
                banksResult.rows.forEach((bank, index) => {
                    console.log(`   ${index + 1}. ${bank.name_ru} | ${bank.name_en} | ${bank.name_he}`);
                });
            }
        } catch (err) {
            console.log(`   ❌ Cannot access banks table: ${err.message}`);
        }

    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Check if your .env file exists with DATABASE_URL');
        console.error('   2. Verify your Railway database credentials');
        console.error('   3. Ensure you have network access to Railway');
        console.error('   4. Check if the database service is running on Railway');
    } finally {
        // Close the connection
        await pool.end();
        console.log('\n🔌 Database connection closed.');
    }
}

// Add package.json info
console.log('📦 Environment Check:');
console.log(`   Node.js: ${process.version}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Found' : '❌ Missing'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Found' : '❌ Missing'}`);
if (process.env.DATABASE_URL) {
    console.log(`   Connection string preview: ${process.env.DATABASE_URL.substring(0, 30)}...`);
}
console.log('');

// Run the test
testDatabaseConnection(); 