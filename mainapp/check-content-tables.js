const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway') ? {
    rejectUnauthorized: false
  } : false
});

async function checkContentTables() {
  console.log('Checking for content_items and content_translations tables...\n');
  
  try {
    // Check if tables exist
    const tableCheckQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('content_items', 'content_translations')
      ORDER BY table_name;
    `;
    
    const result = await pool.query(tableCheckQuery);
    
    if (result.rows.length === 0) {
      console.log('❌ Tables content_items and content_translations DO NOT EXIST in the database');
      console.log('\nThis explains why Phase 6 tests are failing!');
      console.log('These tables would be created by running the migration scripts.');
    } else {
      console.log('✅ Found the following tables:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      
      // If tables exist, check their structure
      for (const table of result.rows) {
        console.log(`\n📊 Structure of ${table.table_name}:`);
        const structureQuery = `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = '${table.table_name}'
          ORDER BY ordinal_position;
        `;
        const structure = await pool.query(structureQuery);
        structure.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });
        
        // Check row count
        const countQuery = `SELECT COUNT(*) as count FROM ${table.table_name}`;
        const count = await pool.query(countQuery);
        console.log(`   Total rows: ${count.rows[0].count}`);
      }
    }
    
    // Also check what tables DO exist
    console.log('\n📋 All tables in the database:');
    const allTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
      LIMIT 20;
    `;
    const allTables = await pool.query(allTablesQuery);
    allTables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await pool.end();
  }
}

checkContentTables();