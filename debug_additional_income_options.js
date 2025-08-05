const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function debugAdditionalIncomeOptions() {
  try {
    const result = await pool.query(`
      SELECT ci.id, ci.content_key, ci.component_type, ci.is_active,
             ct.content_value, ct.language_code
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE '%additional_income%'
      AND ci.screen_location = 'mortgage_step3'
      AND ci.component_type = 'dropdown_option'
      AND ct.language_code = 'he'
      ORDER BY ci.content_key
    `);
    
    console.log('All additional income options in mortgage_step3:');
    console.log('================================================');
    
    result.rows.forEach(row => {
      console.log(`\nID: ${row.id}`);
      console.log(`Key: ${row.content_key}`);
      console.log(`Active: ${row.is_active}`);
      console.log(`Hebrew: ${row.content_value}`);
      
      // Show what value the API would extract
      let value = 'UNKNOWN';
      
      // Check standard option pattern
      let match = row.content_key.match(/_option_(.+)$/);
      if (match) {
        value = match[1];
      } else {
        // Check for specific patterns
        const patterns = [
          /_(additional_salary)$/,
          /_(additional_work)$/,
          /_(property_rental_income)$/,
          /_(no_additional_income)$/,
          /_(investment)$/,
          /_(pension)$/,
          /_(other)$/,
          /_(1_no_additional_income)$/,
          /_([^_]+)$/ // fallback
        ];
        
        for (const pattern of patterns) {
          match = row.content_key.match(pattern);
          if (match) {
            value = match[1];
            break;
          }
        }
      }
      
      console.log(`API would extract value: "${value}"`);
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

debugAdditionalIncomeOptions();