#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

// Create database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function testRailwayDatabase() {
    console.log('🧪 Testing Railway PostgreSQL Database...\n');
    
    try {
        // Test basic connection
        console.log('📡 Connecting to Railway...');
        const timeResult = await pool.query('SELECT NOW() as current_time');
        console.log('✅ Connection successful!');
        console.log(`🕐 Server time: ${timeResult.rows[0].current_time}\n`);

        // Check what tables exist
        console.log('📋 Checking existing tables:');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        if (tablesResult.rows.length === 0) {
            console.log('   📦 Empty database - no tables found');
        } else {
            console.log(`   📊 Found ${tablesResult.rows.length} tables:`);
            tablesResult.rows.forEach((table, index) => {
                console.log(`      ${index + 1}. ${table.table_name}`);
            });
        }
        console.log('');

        // Create a test table
        console.log('🔧 Creating test table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS test_bankimonline (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Test table created');

        // Insert test data
        console.log('📝 Inserting test data...');
        const insertResult = await pool.query(`
            INSERT INTO test_bankimonline (name, phone) 
            VALUES ($1, $2) 
            RETURNING id, name, phone, created_at
        `, ['Test User', '+972501234567']);
        
        const testRecord = insertResult.rows[0];
        console.log(`✅ Inserted record with ID: ${testRecord.id}`);
        console.log(`   Name: ${testRecord.name}`);
        console.log(`   Phone: ${testRecord.phone}`);
        console.log(`   Created: ${testRecord.created_at}`);

        // Read test data back
        console.log('\n📖 Reading test data back...');
        const selectResult = await pool.query('SELECT * FROM test_bankimonline WHERE id = $1', [testRecord.id]);
        if (selectResult.rows.length > 0) {
            console.log('✅ Successfully read back the test record');
        } else {
            console.log('❌ Could not read back the test record');
        }

        // Update test data
        console.log('\n✏️  Updating test data...');
        await pool.query(`
            UPDATE test_bankimonline 
            SET name = $1 
            WHERE id = $2
        `, ['Updated Test User', testRecord.id]);
        
        const updatedResult = await pool.query('SELECT name FROM test_bankimonline WHERE id = $1', [testRecord.id]);
        console.log(`✅ Updated name to: ${updatedResult.rows[0].name}`);

        // Clean up - delete test data
        console.log('\n🧹 Cleaning up test data...');
        await pool.query('DELETE FROM test_bankimonline WHERE id = $1', [testRecord.id]);
        console.log('✅ Test record deleted');

        // Drop test table
        console.log('🗑️  Dropping test table...');
        await pool.query('DROP TABLE test_bankimonline');
        console.log('✅ Test table dropped');

        console.log('\n🎉 All database operations successful!');
        console.log('✅ Your Railway PostgreSQL database is working perfectly');
        
        // Show database info
        console.log('\n📊 Database Info:');
        const dbInfo = await pool.query('SELECT current_database() as db_name, current_user as username');
        console.log(`   Database: ${dbInfo.rows[0].db_name}`);
        console.log(`   User: ${dbInfo.rows[0].username}`);

    } catch (err) {
        console.error('❌ Database test failed:', err.message);
        console.error('\n🔧 Error Details:');
        console.error(`   Code: ${err.code}`);
        console.error(`   Detail: ${err.detail || 'No additional details'}`);
        
        if (err.message.includes('password')) {
            console.error('\n💡 Possible fixes:');
            console.error('   1. Check your DATABASE_URL in .env file');
            console.error('   2. Verify Railway database credentials are correct');
            console.error('   3. Make sure the database service is running on Railway');
        }
    } finally {
        // Close the connection
        await pool.end();
        console.log('\n🔌 Database connection closed.');
    }
}

// Environment check
console.log('📦 Environment Check:');
console.log(`   Node.js: ${process.version}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Found' : '❌ Missing'}`);
if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port}`);
    console.log(`   Database: ${url.pathname.substring(1)}`);
}
console.log('');

// Run the test
testRailwayDatabase(); 