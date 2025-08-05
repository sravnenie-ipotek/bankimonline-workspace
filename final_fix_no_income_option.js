const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function finalFixNoIncomeOption() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update to use the first position pattern that other screens use
    const updateResult = await client.query(`
      UPDATE content_items 
      SET content_key = 'mortgage_step3.field.additional_income_0_no_additional_income'
      WHERE content_key = 'mortgage_step3.field.additional_income_1_no_additional_income'
      AND screen_location = 'mortgage_step3'
      RETURNING id, content_key
    `);
    
    if (updateResult.rows.length > 0) {
      console.log('✅ Updated content key to:', updateResult.rows[0].content_key);
      console.log('   This should now be extracted as field "additional_income" with value "no_additional_income"');
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

finalFixNoIncomeOption();