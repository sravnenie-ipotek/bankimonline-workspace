const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function checkExistingKeys() {
  try {
    const keysToCheck = [
      'add_place_to_work',
      'add_additional_source_of_income',
      'add_obligation',
      'add_borrower',
      'source_of_income',
      'additional_source_of_income',
      'obligation',
      'borrower'
    ];
    
    const result = await pool.query(`
      SELECT content_key, screen_location, component_type
      FROM content_items 
      WHERE content_key = ANY($1)
      ORDER BY content_key, screen_location
    `, [keysToCheck]);
    
    console.log('🔍 Existing Keys in Database:');
    console.log('=============================');
    
    let currentKey = '';
    result.rows.forEach(row => {
      if (row.content_key !== currentKey) {
        console.log(`\n📌 ${row.content_key}:`);
        currentKey = row.content_key;
      }
      console.log(`   - Location: ${row.screen_location} [${row.component_type}]`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkExistingKeys();