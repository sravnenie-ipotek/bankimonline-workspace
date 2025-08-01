const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function updateNoAdditionalIncomeValue() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find the "no additional income" option
    const result = await client.query(`
      SELECT ci.*, ct.content_value, ct.language_code
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key = 'mortgage_step3.field.additional_income_no_additional_income'
      AND ci.screen_location = 'mortgage_step3'
    `);
    
    if (result.rows.length > 0) {
      const itemId = result.rows[0].id;
      console.log(`Found "no additional income" option with ID: ${itemId}`);
      
      // Update the content_key to use option_1 pattern
      const updateResult = await client.query(`
        UPDATE content_items 
        SET content_key = 'mortgage_step3.field.additional_income_option_1'
        WHERE id = $1
        RETURNING *
      `, [itemId]);
      
      console.log('✅ Updated content_key to:', updateResult.rows[0].content_key);
      
      await client.query('COMMIT');
      console.log('✅ Transaction committed successfully!');
      
    } else {
      console.log('❌ No additional income option not found');
      await client.query('ROLLBACK');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateNoAdditionalIncomeValue();