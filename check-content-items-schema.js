const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkSchema() {
  console.log('📊 Content Items Table Schema:\n');
  
  try {
    const result = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'content_items'
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('Columns:');
    result.rows.forEach(row => {
      let colInfo = `  ${row.column_name} - ${row.data_type}`;
      if (row.character_maximum_length) {
        colInfo += `(${row.character_maximum_length})`;
      }
      colInfo += ` - ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`;
      if (row.column_default) {
        colInfo += ` - Default: ${row.column_default}`;
      }
      console.log(colInfo);
    });
    
    // Check how existing content uses these columns
    const sampleResult = await pool.query(`
      SELECT 
        content_key,
        content_type,
        category,
        component_type,
        screen_location
      FROM content_items
      WHERE screen_location LIKE 'refinance_credit_%'
      LIMIT 5
    `);
    
    console.log('\nSample existing refinance credit content:');
    sampleResult.rows.forEach(row => {
      console.log(`  Key: ${row.content_key}`);
      console.log(`    content_type: ${row.content_type}`);
      console.log(`    category: ${row.category}`);
      console.log(`    component_type: ${row.component_type}`);
      console.log(`    screen_location: ${row.screen_location}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();