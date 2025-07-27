const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway' });

async function checkExistingKeys() {
  try {
    const keys = [
      'calculate_mortgage_main_source',
      'calculate_mortgage_main_source_ph',
      'calculate_mortgage_main_source_option_1',
      'calculate_mortgage_has_additional',
      'calculate_mortgage_has_additional_ph',
      'calculate_mortgage_has_additional_option_1',
      'calculate_mortgage_debt_types',
      'calculate_mortgage_debt_types_ph',
      'calculate_mortgage_debt_types_option_1'
    ];
    
    const result = await pool.query(
      'SELECT content_key, screen_location FROM content_items WHERE content_key = ANY($1::text[]) ORDER BY content_key, screen_location',
      [keys]
    );
    
    console.log('Existing keys and their screen locations:');
    result.rows.forEach(row => console.log('  -', row.content_key, 'in', row.screen_location));
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkExistingKeys();