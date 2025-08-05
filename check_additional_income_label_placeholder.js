const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function checkAdditionalIncomeLabelPlaceholder() {
  try {
    // Check for label and placeholder
    const result = await pool.query(`
      SELECT ci.*, ct.content_value, ct.language_code 
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step3'
      AND ci.content_key IN (
        'additional_income',
        'additional_income_label', 
        'additional_income_ph',
        'additional_income_placeholder',
        'app.mortgage.step3.additional_income',
        'app.mortgage.step3.additional_income_ph',
        'mortgage_step3.field.additional_income',
        'mortgage_step3_additional_income',
        'mortgage_step3_additional_income_label',
        'mortgage_step3_additional_income_ph'
      )
      AND ci.component_type IN ('label', 'placeholder', 'dropdown', 'dropdown_container')
      AND ci.is_active = true
      ORDER BY ci.component_type, ci.content_key, ct.language_code
    `);
    
    console.log('Label and Placeholder Search Results:');
    console.log('=====================================');
    
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.content_key]) {
        grouped[row.content_key] = {
          id: row.id,
          content_key: row.content_key,
          component_type: row.component_type,
          translations: {}
        };
      }
      if (row.language_code) {
        grouped[row.content_key].translations[row.language_code] = row.content_value;
      }
    });
    
    Object.values(grouped).forEach(item => {
      console.log(`\n${item.component_type.toUpperCase()}: ${item.content_key} (ID: ${item.id})`);
      Object.entries(item.translations).forEach(([lang, value]) => {
        console.log(`  ${lang}: ${value}`);
      });
    });
    
    // Now let's check what the API query would find
    console.log('\n\nChecking API query pattern:');
    console.log('===========================');
    
    const apiQuery = await pool.query(`
      SELECT ci.content_key, ci.component_type, ct.language_code, ct.content_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step3'
      AND ci.is_active = true
      AND ct.language_code = 'he'
      AND (
        (ci.component_type = 'label' AND ci.content_key LIKE '%additional_income%') OR
        (ci.component_type = 'placeholder' AND ci.content_key LIKE '%additional_income%')
      )
    `);
    
    console.log('\nAPI pattern results:');
    apiQuery.rows.forEach(row => {
      console.log(`${row.component_type}: ${row.content_key} = "${row.content_value}"`);
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

checkAdditionalIncomeLabelPlaceholder();