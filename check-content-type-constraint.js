const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkContentTypeConstraint() {
  console.log('🔍 Checking content_type constraint...\n');
  
  try {
    // Get check constraint definition
    const constraintResult = await pool.query(`
      SELECT 
        con.conname as constraint_name,
        pg_get_constraintdef(con.oid) as constraint_definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'content_items' 
        AND con.contype = 'c'
        AND con.conname LIKE '%content_type%'
    `);
    
    console.log('Content type constraint:');
    constraintResult.rows.forEach(row => {
      console.log(`  ${row.constraint_name}: ${row.constraint_definition}`);
    });
    
    // Get existing content types
    const typesResult = await pool.query(`
      SELECT DISTINCT content_type, COUNT(*) as count
      FROM content_items
      GROUP BY content_type
      ORDER BY content_type
    `);
    
    console.log('\nExisting content types in database:');
    typesResult.rows.forEach(row => {
      console.log(`  ${row.content_type}: ${row.count} items`);
    });
    
    // Check what content types are being used in migrations
    console.log('\nContent types used in migrations:');
    const migrationTypes = [
      'dropdown_option',
      'label',
      'placeholder',
      'button',
      'title',
      'option',
      'dialog',
      'unit',
      'validation_message',
      'tooltip',
      'helper_text'
    ];
    
    migrationTypes.forEach(type => {
      console.log(`  - ${type}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkContentTypeConstraint();