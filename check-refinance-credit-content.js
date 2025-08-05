const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkExistingContent() {
  console.log('🔍 Checking existing refinance credit content...\n');
  
  try {
    // Check existing content by screen
    const result = await pool.query(`
      SELECT screen_location, content_type, COUNT(*) as count
      FROM content_items
      WHERE screen_location LIKE 'refinance_credit_%'
      GROUP BY screen_location, content_type
      ORDER BY screen_location, content_type
    `);
    
    console.log('Existing content by screen and type:');
    result.rows.forEach(row => {
      console.log(`  ${row.screen_location} - ${row.content_type}: ${row.count}`);
    });
    
    // Check sample content keys
    const sampleResult = await pool.query(`
      SELECT content_key, screen_location, content_type
      FROM content_items
      WHERE screen_location LIKE 'refinance_credit_%'
      ORDER BY screen_location, content_key
      LIMIT 20
    `);
    
    console.log('\nSample content keys:');
    sampleResult.rows.forEach(row => {
      console.log(`  ${row.screen_location}: ${row.content_key} (${row.content_type})`);
    });
    
    // Check if dropdown options exist
    const dropdownResult = await pool.query(`
      SELECT content_key, screen_location
      FROM content_items
      WHERE screen_location = 'refinance_credit_1'
      AND content_type = 'dropdown_option'
      ORDER BY content_key
    `);
    
    console.log(`\nDropdown options in refinance_credit_1: ${dropdownResult.rows.length}`);
    if (dropdownResult.rows.length > 0) {
      console.log('Dropdown keys found:');
      dropdownResult.rows.forEach(row => {
        console.log(`  ${row.content_key}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking content:', error.message);
  } finally {
    await pool.end();
  }
}

checkExistingContent();