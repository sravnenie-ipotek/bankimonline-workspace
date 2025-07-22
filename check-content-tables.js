const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%content%' OR table_name LIKE '%page%')
      ORDER BY table_name
    `);
    
    console.log('Content-related tables:');
    result.rows.forEach(row => console.log('  -', row.table_name));
    
    // Check if page_content exists
    const pageContent = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'page_content'
      ORDER BY ordinal_position
    `);
    
    if (pageContent.rows.length > 0) {
      console.log('\npage_content table structure:');
      pageContent.rows.forEach(row => 
        console.log(`  - ${row.column_name}: ${row.data_type}`)
      );
    }
    
    // Check if content_items exists
    const contentItems = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_items'
      ORDER BY ordinal_position
    `);
    
    if (contentItems.rows.length > 0) {
      console.log('\ncontent_items table structure:');
      contentItems.rows.forEach(row => 
        console.log(`  - ${row.column_name}: ${row.data_type}`)
      );
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();
