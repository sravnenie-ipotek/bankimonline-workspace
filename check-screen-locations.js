const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkScreenLocations() {
  try {
    console.log('🔍 CHECKING SCREEN LOCATIONS FOR FIRST_HOME CONTENT\n');
    
    const result = await pool.query(`
      SELECT content_key, screen_location 
      FROM content_items 
      WHERE content_key LIKE '%first_home%' 
        AND is_active = true 
      ORDER BY content_key, screen_location
    `);
    
    console.log('Content keys with screen locations:');
    result.rows.forEach(row => {
      console.log(`  ${row.content_key} -> ${row.screen_location}`);
    });
    
    console.log(`\nTotal items found: ${result.rows.length}`);
    
    // Group by screen location
    const byScreen = {};
    result.rows.forEach(row => {
      if (!byScreen[row.screen_location]) {
        byScreen[row.screen_location] = [];
      }
      byScreen[row.screen_location].push(row.content_key);
    });
    
    console.log('\nGrouped by screen location:');
    Object.keys(byScreen).forEach(screen => {
      console.log(`\n${screen}:`);
      byScreen[screen].forEach(key => {
        console.log(`  - ${key}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkScreenLocations(); 