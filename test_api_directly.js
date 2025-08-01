const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function testApiDirectly() {
  try {
    // Run the exact query the API uses
    const result = await pool.query(`
      SELECT 
        content_items.content_key,
        content_items.component_type,
        content_translations.content_value
      FROM content_items
      JOIN content_translations ON content_items.id = content_translations.content_item_id
      WHERE content_items.screen_location = $1 
        AND content_translations.language_code = $2
        AND content_translations.status = 'approved'
        AND content_items.is_active = true
        AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder', 'label')
      ORDER BY content_items.content_key, content_items.component_type
    `, ['mortgage_step3', 'he']);
    
    console.log('Total rows:', result.rows.length);
    console.log('\nAdditional income options:');
    console.log('==========================');
    
    result.rows
      .filter(row => row.content_key.includes('additional_income') && row.component_type === 'dropdown_option')
      .forEach(row => {
        console.log(`${row.content_key} => ${row.content_value}`);
      });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

testApiDirectly();