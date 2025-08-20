const { Pool } = require('pg');
require('dotenv').config();

// Content database connection (shortline)
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkRefinanceTranslations() {
  try {
    console.log('\n📊 Checking Refinance Mortgage Translations in Database...\n');
    
    // Keys from the screenshot
    const refinanceKeys = [
      'app.refinance.step1.title',
      'app.refinance.step1.property_value_label',
      'app.refinance.step1.balance_label', 
      'app.refinance.step1.why_label',
      'app.refinance.step1.registered_label',
      'app.refinance.step1.current_bank_label',
      'app.refinance.step1.property_type_label'
    ];

    console.log('Looking for keys:', refinanceKeys);
    
    // Check if these keys exist in content_items
    const keysQuery = `
      SELECT 
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key = ANY($1)
      ORDER BY ci.content_key, ct.language_code
    `;
    
    const result = await contentPool.query(keysQuery, [refinanceKeys]);
    
    if (result.rows.length === 0) {
      console.log('❌ No refinance translations found in database!');
      
      // Check what refinance keys DO exist
      const existingQuery = `
        SELECT DISTINCT content_key 
        FROM content_items 
        WHERE content_key LIKE '%refinance%' 
        ORDER BY content_key
        LIMIT 20
      `;
      
      const existing = await contentPool.query(existingQuery);
      console.log('\n📋 Existing refinance keys in database:');
      existing.rows.forEach(row => console.log(`  - ${row.content_key}`));
      
    } else {
      console.log('\n✅ Found translations:');
      const grouped = {};
      result.rows.forEach(row => {
        if (!grouped[row.content_key]) {
          grouped[row.content_key] = {};
        }
        grouped[row.content_key][row.language_code] = row.content_value;
      });
      
      Object.entries(grouped).forEach(([key, translations]) => {
        console.log(`\n📝 ${key}:`);
        Object.entries(translations).forEach(([lang, value]) => {
          console.log(`   ${lang}: ${value}`);
        });
      });
    }
    
    // Check for alternative key patterns
    console.log('\n🔍 Checking alternative key patterns...');
    const altQuery = `
      SELECT DISTINCT content_key, screen_location
      FROM content_items 
      WHERE screen_location LIKE 'refinance%'
         OR content_key LIKE 'refinance%'
         OR content_key LIKE 'calculate_refinance%'
      ORDER BY screen_location, content_key
      LIMIT 30
    `;
    
    const altResult = await contentPool.query(altQuery);
    if (altResult.rows.length > 0) {
      console.log('\n📋 Alternative refinance keys found:');
      altResult.rows.forEach(row => {
        console.log(`  ${row.screen_location}: ${row.content_key}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking translations:', error.message);
  } finally {
    await contentPool.end();
  }
}

checkRefinanceTranslations();