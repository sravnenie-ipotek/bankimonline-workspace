const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkCitizenshipKeys() {
  try {
    console.log('🔍 Checking citizenship content keys...');
    
    const result = await pool.query(`
      SELECT ci.content_key, ci.component_type, ct.language_code, ct.content_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE '%citizenship%' 
      AND ci.screen_location = 'mortgage_step2'
      AND ct.language_code = 'he'
      ORDER BY ci.content_key;
    `);
    
    console.log(`📊 Found ${result.rows.length} citizenship-related entries:`);
    result.rows.forEach(row => {
      console.log(`- ${row.content_key} (${row.component_type}): ${row.content_value}`);
    });
    
    // Also check for any 'calculate_mortgage_citizenship' key
    const calcResult = await pool.query(`
      SELECT ci.content_key, ci.component_type, ct.language_code, ct.content_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key = 'calculate_mortgage_citizenship'
      AND ct.language_code = 'he';
    `);
    
    console.log(`\n🔍 Checking for 'calculate_mortgage_citizenship' key: ${calcResult.rows.length} found`);
    if (calcResult.rows.length > 0) {
      calcResult.rows.forEach(row => {
        console.log(`- ${row.content_key} (${row.component_type}): ${row.content_value}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCitizenshipKeys();