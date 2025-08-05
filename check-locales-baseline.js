const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkLocalesBaseline() {
  try {
    // Check if locales table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'locales'
      );
    `;
    
    const tableExists = await pool.query(tableExistsQuery);
    console.log('Locales table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Count mortgage calculator keys in locales
      const mortgageKeysQuery = `
        SELECT COUNT(DISTINCT key) as total_keys
        FROM locales 
        WHERE key LIKE 'calculate_mortgage_%';
      `;
      
      const mortgageKeys = await pool.query(mortgageKeysQuery);
      console.log('\nMortgage Calculator keys in locales table:', mortgageKeys.rows[0].total_keys);
      
      // Sample some keys
      const sampleKeysQuery = `
        SELECT DISTINCT key
        FROM locales 
        WHERE key LIKE 'calculate_mortgage_%'
        LIMIT 10;
      `;
      
      const sampleKeys = await pool.query(sampleKeysQuery);
      console.log('\nSample mortgage calculator keys:');
      sampleKeys.rows.forEach(row => console.log(`  - ${row.key}`));
    }
    
    // Check translation files mentioned in documentation
    console.log('\n\nChecking for translation patterns in content_items:');
    
    // Check for mortgage-related content with different naming
    const mortgagePatternQuery = `
      SELECT 
        screen_location,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location LIKE '%mortgage%' 
         OR content_key LIKE '%mortgage%'
         OR legacy_translation_key LIKE '%mortgage%'
      GROUP BY screen_location
      ORDER BY count DESC;
    `;
    
    const mortgagePatterns = await pool.query(mortgagePatternQuery);
    console.table(mortgagePatterns.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkLocalesBaseline();