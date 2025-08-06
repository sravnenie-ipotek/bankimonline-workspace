const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function analyzeMortgageContent() {
  try {
    const result = await pool.query(`
      SELECT screen_location, content_key, component_type, category
      FROM content_items 
      WHERE screen_location LIKE 'mortgage_step%'
        AND component_type IN ('dropdown_container', 'dropdown_option')
      ORDER BY screen_location, content_key
    `);
    
    console.log('Mortgage dropdown content structure:');
    let currentScreen = '';
    result.rows.forEach(row => {
      if (row.screen_location !== currentScreen) {
        currentScreen = row.screen_location;
        console.log(`\n=== ${currentScreen} ===`);
      }
      console.log(`  ${row.content_key} (${row.component_type})`);
    });
    
    // Count by screen
    console.log('\n=== SUMMARY ===');
    const screens = ['mortgage_step1', 'mortgage_step2', 'mortgage_step3'];
    for (const screen of screens) {
      const containers = result.rows.filter(r => r.screen_location === screen && r.component_type === 'dropdown_container').length;
      const options = result.rows.filter(r => r.screen_location === screen && r.component_type === 'dropdown_option').length;
      console.log(`${screen}: ${containers} containers, ${options} options`);
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeMortgageContent();