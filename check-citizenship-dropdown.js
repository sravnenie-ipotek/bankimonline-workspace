const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkCitizenshipDropdown() {
  try {
    console.log('🔍 Checking citizenship dropdown content...');
    
    // Check for citizenship content
    const result = await pool.query(`
      SELECT 
        ci.content_key, 
        ci.component_type, 
        ci.screen_location,
        ct.language_code, 
        ct.content_value,
        ct.status
      FROM content_items ci 
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE '%citizenship%' 
      ORDER BY ci.content_key, ct.language_code;
    `);
    
    console.log(`📊 Found ${result.rows.length} citizenship-related entries:`);
    
    if (result.rows.length === 0) {
      console.log('❌ No citizenship dropdown content found in database!');
      console.log('🔧 This explains why the dropdown shows no values.');
    } else {
      result.rows.forEach(row => {
        console.log(`- ${row.content_key} (${row.component_type}) [${row.language_code}]: ${row.content_value}`);
      });
    }
    
    // Also check for any step2 content that might be citizenship-related
    const step2Result = await pool.query(`
      SELECT 
        ci.content_key, 
        ci.component_type,
        COUNT(ct.id) as translation_count
      FROM content_items ci 
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step2' 
      AND ci.component_type = 'option'
      GROUP BY ci.content_key, ci.component_type
      ORDER BY ci.content_key;
    `);
    
    console.log(`\n📋 All step2 dropdown options (${step2Result.rows.length} found):`);
    step2Result.rows.forEach(row => {
      console.log(`- ${row.content_key} (${row.translation_count} translations)`);
    });
    
  } catch (error) {
    console.error('❌ Error checking citizenship dropdown:', error.message);
  } finally {
    await pool.end();
  }
}

checkCitizenshipDropdown();