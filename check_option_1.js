const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function checkOption1() {
  try {
    const result = await pool.query(`
      SELECT ci.*, ct.content_value, ct.language_code
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE '%option_1%'
      AND ci.screen_location = 'mortgage_step3'
      ORDER BY ci.id, ct.language_code
    `);
    
    console.log('Option_1 search results:');
    console.log('========================');
    
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          content_key: row.content_key,
          component_type: row.component_type,
          is_active: row.is_active,
          translations: {}
        };
      }
      if (row.language_code) {
        grouped[row.id].translations[row.language_code] = row.content_value;
      }
    });
    
    Object.values(grouped).forEach(item => {
      console.log(`\nID: ${item.id}`);
      console.log(`Key: ${item.content_key}`);
      console.log(`Type: ${item.component_type}`);
      console.log(`Active: ${item.is_active}`);
      console.log('Translations:');
      Object.entries(item.translations).forEach(([lang, value]) => {
        console.log(`  ${lang}: ${value}`);
      });
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

checkOption1();