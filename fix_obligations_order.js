const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function fixObligationsOrder() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Updating obligations dropdown order...');
    
    // First, find the no_obligations option
    const findResult = await client.query(`
      SELECT id, content_key 
      FROM content_items 
      WHERE content_key LIKE '%obligations_no_obligations%'
      AND screen_location = 'mortgage_step3'
      AND component_type = 'dropdown_option'
      AND is_active = true
    `);
    
    if (findResult.rows.length > 0) {
      const currentKey = findResult.rows[0].content_key;
      console.log(`Found no_obligations option: ${currentKey}`);
      
      // Update to use 0_ prefix to make it sort first
      const updateResult = await client.query(`
        UPDATE content_items 
        SET content_key = REGEXP_REPLACE(content_key, '_no_obligations$', '_0_no_obligations')
        WHERE id = $1
        AND content_key NOT LIKE '%_0_no_obligations'
        RETURNING content_key
      `, [findResult.rows[0].id]);
      
      if (updateResult.rows.length > 0) {
        console.log(`✅ Updated to: ${updateResult.rows[0].content_key}`);
      } else {
        console.log('ℹ️ Already has correct ordering');
      }
    } else {
      console.log('❌ No obligations option not found');
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

fixObligationsOrder();