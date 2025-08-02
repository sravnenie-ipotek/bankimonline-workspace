require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkRefinanceContent() {
  try {
    console.log('🔍 CHECKING REFINANCE_STEP1 CONTENT\n');
    
    const result = await pool.query(`
      SELECT content_key, component_type 
      FROM content_items 
      WHERE screen_location = 'refinance_step1' 
        AND is_active = true 
      ORDER BY content_key
    `);
    
    console.log('Refinance step 1 content:');
    result.rows.forEach(row => {
      console.log(`  ${row.content_key} (${row.component_type})`);
    });
    
    console.log(`\nTotal items found: ${result.rows.length}`);
    
    // Check for dropdown-related content
    const dropdownContent = result.rows.filter(row => 
      row.component_type === 'dropdown_container' || 
      row.component_type === 'dropdown_option' ||
      row.component_type === 'placeholder'
    );
    
    console.log('\nDropdown-related content:');
    dropdownContent.forEach(row => {
      console.log(`  ${row.content_key} (${row.component_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRefinanceContent();