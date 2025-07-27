const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function checkRefinanceContent() {
  try {
    const result = await pool.query(`
      SELECT screen_location, COUNT(*) as content_items
      FROM content_items 
      WHERE screen_location IN ('credit_step1', 'credit_step2', 'credit_step3', 'credit_step4', 'calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4')
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('📊 Calculate Credit Database Content Status:');
    console.log('===============================================');
    result.rows.forEach(row => {
      console.log(`${row.screen_location}: ${row.content_items} items`);
    });
    
    // Check specific content keys
    const detailResult = await pool.query(`
      SELECT screen_location, content_key, component_type
      FROM content_items 
      WHERE screen_location IN ('credit_step1', 'credit_step2', 'credit_step3', 'credit_step4', 'calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4')
      ORDER BY screen_location, content_key
    `);
    
    console.log('\n📋 Detailed Content Keys:');
    console.log('=========================');
    let currentScreen = '';
    detailResult.rows.forEach(row => {
      if (row.screen_location !== currentScreen) {
        console.log(`\n🔸 ${row.screen_location}:`);
        currentScreen = row.screen_location;
      }
      console.log(`  - ${row.content_key} [${row.component_type}]`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRefinanceContent();