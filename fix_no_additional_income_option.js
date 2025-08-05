const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function fixNoAdditionalIncomeOption() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, revert the option_1 back to its original key
    const revertResult = await client.query(`
      UPDATE content_items 
      SET content_key = 'mortgage_step3.field.additional_income_no_additional_income'
      WHERE content_key = 'mortgage_step3.field.additional_income_option_1'
      AND screen_location = 'mortgage_step3'
      RETURNING id
    `);
    
    if (revertResult.rows.length > 0) {
      console.log('✅ Reverted option_1 back to original key');
    }
    
    // Now add it as the first option by inserting with a special key that will sort first
    // First, check if we need to add an option that sorts first
    const checkFirst = await client.query(`
      SELECT content_key 
      FROM content_items 
      WHERE content_key LIKE 'mortgage_step3.field.additional_income_%'
      AND component_type = 'dropdown_option'
      AND screen_location = 'mortgage_step3'
      AND is_active = true
      ORDER BY content_key
      LIMIT 1
    `);
    
    console.log('First option key:', checkFirst.rows[0]?.content_key);
    
    // Update the sort order by renaming keys to ensure "no additional income" appears first
    // We'll use a naming pattern that ensures it sorts first: additional_income_1_no_additional_income
    const updateSort = await client.query(`
      UPDATE content_items
      SET content_key = 'mortgage_step3.field.additional_income_1_no_additional_income'
      WHERE content_key = 'mortgage_step3.field.additional_income_no_additional_income'
      AND screen_location = 'mortgage_step3'
      RETURNING id
    `);
    
    if (updateSort.rows.length > 0) {
      console.log('✅ Updated sort order for no additional income option');
    }
    
    await client.query('COMMIT');
    console.log('✅ Transaction completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixNoAdditionalIncomeOption();