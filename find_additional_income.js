const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function findAdditionalIncomeDropdown() {
  try {
    // Search for additional income related content
    const result = await pool.query(`
      SELECT ci.*, ct.content_value, ct.language_code 
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE (
        ci.content_key LIKE '%additional_income%' OR
        ci.content_key LIKE '%additional_source%' OR
        ci.content_key LIKE '%доход%'
      )
      AND ci.is_active = true
      ORDER BY ci.screen_location, ci.content_key, ct.language_code
    `);
    
    console.log('Found', result.rows.length, 'additional income related items');
    
    const groupedByKey = {};
    result.rows.forEach(row => {
      if (!groupedByKey[row.content_key]) {
        groupedByKey[row.content_key] = {
          id: row.id,
          content_key: row.content_key,
          component_type: row.component_type,
          screen_location: row.screen_location,
          category: row.category,
          translations: {}
        };
      }
      if (row.language_code) {
        groupedByKey[row.content_key].translations[row.language_code] = row.content_value;
      }
    });
    
    console.log('\nAdditional Income Dropdown Items:');
    console.log('================================');
    Object.values(groupedByKey).forEach(item => {
      console.log(`\nKey: ${item.content_key}`);
      console.log(`ID: ${item.id}`);
      console.log(`Type: ${item.component_type}`);
      console.log(`Screen: ${item.screen_location}`);
      console.log(`Category: ${item.category}`);
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

findAdditionalIncomeDropdown();