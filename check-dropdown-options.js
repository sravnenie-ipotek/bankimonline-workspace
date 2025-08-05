const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDropdownOptions() {
  try {
    // Check if we have any option-type content
    const optionCountResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE component_type = 'option'
    `);
    
    console.log(`\n📊 Total dropdown options in database: ${optionCountResult.rows[0].count}`);
    
    // Get sample of option content
    const sampleOptions = await pool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.component_type = 'option'
      LIMIT 10
    `);
    
    if (sampleOptions.rows.length > 0) {
      console.log('\n📋 Sample dropdown options:');
      console.log('----------------------------------------');
      sampleOptions.rows.forEach(row => {
        console.log(`Screen: ${row.screen_location}`);
        console.log(`Key: ${row.content_key}`);
        console.log(`Language: ${row.language_code}`);
        console.log(`Value: ${row.content_value}`);
        console.log('----------------------------------------');
      });
    } else {
      console.log('\n❌ No dropdown options found in database!');
      console.log('The SQL migrations need to be run to populate dropdown content.');
    }
    
    // Check for specific dropdown keys
    const specificCheck = await pool.query(`
      SELECT 
        screen_location,
        COUNT(DISTINCT content_key) as option_count
      FROM content_items
      WHERE component_type = 'option'
      GROUP BY screen_location
    `);
    
    if (specificCheck.rows.length > 0) {
      console.log('\n📊 Dropdown options by screen:');
      specificCheck.rows.forEach(row => {
        console.log(`${row.screen_location}: ${row.option_count} options`);
      });
    }
    
  } catch (error) {
    console.error('Error checking dropdown options:', error);
  } finally {
    pool.end();
  }
}

checkDropdownOptions();