require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

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
    // Test connection
    const testQuery = await pool.query('SELECT NOW()');
    // Check for content tables
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('content_items', 'content_translations')
    `);
    
    if (tableCheck.rows.length === 0) {
      ');
      // Show what tables DO exist
      const existingTables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name NOT LIKE 'pg_%'
        ORDER BY table_name
        LIMIT 10
      `);
      
      existingTables.rows.forEach(row => {
        });
    } else {
      tableCheck.rows.forEach(row => {
        });
    }
    
  } catch (error) {
    console.error('\n❌ Database connection error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();