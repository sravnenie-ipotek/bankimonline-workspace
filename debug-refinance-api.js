const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function debugRefinanceAPI() {
  try {
    console.log('🔍 DEBUGGING REFINANCE_STEP1 API\n');
    
    // Simulate the API query
    const result = await pool.query(`
      SELECT 
        content_items.content_key,
        content_items.component_type,
        content_translations.content_value
      FROM content_items
      JOIN content_translations ON content_items.id = content_translations.content_item_id
      WHERE content_items.screen_location = 'refinance_step1' 
        AND content_translations.language_code = 'ru'
        AND content_translations.status = 'approved'
        AND content_items.is_active = true
        AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder', 'label')
      ORDER BY content_items.content_key, content_items.component_type
    `);
    
    console.log(`Found ${result.rows.length} items from database:`);
    result.rows.forEach(row => {
      console.log(`  ${row.content_key} (${row.component_type}): "${row.content_value}"`);
    });
    
    // Test the field extraction logic
    console.log('\n🔧 TESTING FIELD EXTRACTION:');
    result.rows.forEach(row => {
      let fieldName = null;
      
      // Pattern 4: refinance_step1_{fieldname} (handles both container and options)
      let match = row.content_key.match(/refinance_step1_([^_]+(?:_[^_]+)*)_(?:lower_interest_rate|reduce_monthly_payment|shorten_mortgage_term|cash_out_refinance|consolidate_debts|fixed_interest|variable_interest|prime_interest|mixed_interest|other|apartment|private_house|commercial|land|other|land|no_not_registered)/);
      if (match) {
        fieldName = match[1];
      } else {
        // For containers like: refinance_step1_why
        match = row.content_key.match(/refinance_step1_([^_]+(?:_[^_]+)*)(?:_ph|$)/);
        if (match) {
          fieldName = match[1];
        }
      }
      
      console.log(`  ${row.content_key} -> fieldName: ${fieldName}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugRefinanceAPI(); 