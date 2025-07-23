const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchema() {
  try {
    // Get table schema
    const schemaQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_items' 
      ORDER BY ordinal_position;
    `;
    
    const schema = await pool.query(schemaQuery);
    console.log('Content Items Table Schema:');
    console.table(schema.rows);
    
    // Get sample data
    const sampleQuery = `
      SELECT * 
      FROM content_items 
      WHERE screen_location LIKE 'refinance%' 
      LIMIT 5;
    `;
    
    const sample = await pool.query(sampleQuery);
    console.log('\nSample Data:');
    console.table(sample.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();