require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found. Please check your .env file.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('railway') ? {
    rejectUnauthorized: false
  } : false
});

async function testConnection() {
  try {
    console.log('\nConnecting to database...');
    
    // Test connection
    const testQuery = await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully at:', testQuery.rows[0].now);
    
    // Check for content tables
    console.log('\n🔍 Checking for content_items and content_translations tables...');
    
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('content_items', 'content_translations')
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('\n❌ RESULT: Tables content_items and content_translations DO NOT EXIST');
      console.log('\nThis means:');
      console.log('1. The dropdown system is using JSON files (current implementation)');
      console.log('2. The database migration for Phase 6 has NOT been run');
      console.log('3. This is why Phase 6 tests are failing - they expect these tables');
      
      // Show what tables DO exist
      const existingTables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name NOT LIKE 'pg_%'
        ORDER BY table_name
        LIMIT 10
      `);
      
      console.log('\n📋 Tables that DO exist:');
      existingTables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('\n✅ Found content management tables:');
      tableCheck.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Database connection error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();