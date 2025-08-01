const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function checkScreenLocations() {
  try {
    const result = await pool.query(`
      SELECT DISTINCT screen_location, COUNT(*) as item_count
      FROM content_items 
      WHERE component_type IN ('dropdown_container', 'dropdown_option')
      GROUP BY screen_location 
      ORDER BY screen_location
    `);
    
    console.log('Available screen locations with dropdown content:');
    result.rows.forEach(row => {
      console.log(`  ${row.screen_location}: ${row.item_count} items`);
    });
    
    console.log('\nMissing screen locations needed:');
    const needed = [
      'credit_step1', 'credit_step2', 'credit_step3', 
      'refinance_mortgage_step1', 'refinance_mortgage_step2', 'refinance_mortgage_step3', 
      'refinance_credit_step1', 'refinance_credit_step2', 'refinance_credit_step3'
    ];
    const existing = result.rows.map(r => r.screen_location);
    
    needed.forEach(screen => {
      if (!existing.includes(screen)) {
        console.log(`  ❌ ${screen} - NO CONTENT`);
      } else {
        console.log(`  ✅ ${screen} - HAS CONTENT`);
      }
    });
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkScreenLocations();