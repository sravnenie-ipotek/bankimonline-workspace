const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkStatusConstraint() {
  try {
    // Check existing status values
    const result = await contentPool.query(`
      SELECT DISTINCT status 
      FROM content_translations 
      ORDER BY status
    `);
    
    console.log('Existing status values in database:');
    result.rows.forEach(row => {
      console.log(`- "${row.status}"`);
    });
    
    // Try to get constraint definition
    const constraintResult = await contentPool.query(`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conname LIKE '%status%'
        AND conrelid = 'content_translations'::regclass
    `);
    
    if (constraintResult.rows.length > 0) {
      console.log('\nStatus constraint definition:');
      constraintResult.rows.forEach(row => {
        console.log(`${row.constraint_name}: ${row.constraint_definition}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await contentPool.end();
  }
}

checkStatusConstraint();