const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSidebarContent() {
  try {
    // Check if content_items table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'content_items'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ content_items table does not exist');
      return;
    }
    
    // Get sidebar content
    const result = await pool.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        ct.language_code,
        ct.content_value,
        ct.status
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'sidebar'
      ORDER BY ci.content_key, ct.language_code
    `);
    
    console.log('Sidebar content in database:');
    console.log('Total rows:', result.rowCount);
    
    if (result.rowCount > 0) {
      const contentByKey = {};
      result.rows.forEach(row => {
        if (!contentByKey[row.content_key]) {
          contentByKey[row.content_key] = {};
        }
        if (row.language_code) {
          contentByKey[row.content_key][row.language_code] = {
            value: row.content_value,
            status: row.status
          };
        }
      });
      
      console.log(JSON.stringify(contentByKey, null, 2));
    } else {
      console.log('❌ No sidebar content found in database');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSidebarContent();