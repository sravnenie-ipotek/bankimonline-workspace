require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

// Check for CONTENT_DATABASE_URL
console.log('CONTENT_DATABASE_URL exists:', !!process.env.CONTENT_DATABASE_URL);
console.log('DATABASE_PUBLIC_URL exists:', !!process.env.DATABASE_PUBLIC_URL);

// Use content database connection
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: (process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || '').includes('railway') ? {
    rejectUnauthorized: false
  } : false
});

async function checkContentTables() {
  try {
    // Check column structure for content_translations
    const columnsQuery = await contentPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_translations'
      ORDER BY ordinal_position
    `);
    
    console.log('\nContent translations columns:');
    columnsQuery.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check sample data with actual column names
    console.log('\nTrying to query content_translations with actual columns...');
    const sampleQuery = await contentPool.query(`
      SELECT * FROM content_translations LIMIT 2
    `);
    
    console.log('\nSample content_translations data:');
    if (sampleQuery.rows.length > 0) {
      console.log('Columns:', Object.keys(sampleQuery.rows[0]));
      console.log(sampleQuery.rows);
    }
    
    // Check content_items columns too
    const itemsColumnsQuery = await contentPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_items'
      ORDER BY ordinal_position
    `);
    
    console.log('\nContent items columns:');
    itemsColumnsQuery.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await contentPool.end();
  }
}

checkContentTables();