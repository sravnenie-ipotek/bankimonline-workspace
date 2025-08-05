const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkMigratedScreens() {
  try {
    // Get all unique screen locations in database
    const result = await pool.query(`
      SELECT DISTINCT 
        screen_location,
        COUNT(DISTINCT content_key) as content_count,
        COUNT(DISTINCT CASE WHEN component_type = 'option' THEN content_key END) as option_count
      FROM content_items
      WHERE is_active = true
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('📊 SCREENS ALREADY IN DATABASE:');
    console.log('================================\n');
    
    result.rows.forEach(row => {
      console.log(`✅ ${row.screen_location}`);
      console.log(`   - Total items: ${row.content_count}`);
      console.log(`   - Dropdown options: ${row.option_count}\n`);
    });
    
    console.log(`\nTotal migrated screens: ${result.rows.length}`);
    
    // Return list for further processing
    return result.rows.map(r => r.screen_location);
    
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  } finally {
    await pool.end();
  }
}

checkMigratedScreens();
