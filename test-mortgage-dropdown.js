const { Pool } = require('pg');
require('dotenv').config();

// Content database connection
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testMortgageDropdown() {
  try {
    console.log('\n🔍 Testing Mortgage Calculator "First Apartment" Dropdown...\n');
    
    // Check for the specific key
    const query = `
      SELECT 
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE '%first%' 
         OR ci.content_key LIKE '%calculate_mortgage_first%'
         OR ci.content_key = 'app.mortgage.step1.first_apartment'
      ORDER BY ci.content_key, ct.language_code
    `;
    
    const result = await contentPool.query(query);
    
    if (result.rows.length === 0) {
      console.log('❌ No "first apartment" translations found in database!');
      
      // Check what mortgage keys exist
      const mortgageQuery = `
        SELECT DISTINCT content_key, screen_location
        FROM content_items 
        WHERE screen_location LIKE 'mortgage%'
           OR content_key LIKE '%mortgage%'
        ORDER BY content_key
        LIMIT 20
      `;
      
      const mortgageResult = await contentPool.query(mortgageQuery);
      console.log('\n📋 Sample mortgage keys in database:');
      mortgageResult.rows.forEach(row => {
        console.log(`  ${row.screen_location}: ${row.content_key}`);
      });
      
    } else {
      console.log('✅ Found translations:');
      const grouped = {};
      result.rows.forEach(row => {
        if (!grouped[row.content_key]) {
          grouped[row.content_key] = {
            screen_location: row.screen_location,
            translations: {}
          };
        }
        if (row.language_code) {
          grouped[row.content_key].translations[row.language_code] = row.content_value;
        }
      });
      
      Object.entries(grouped).forEach(([key, data]) => {
        console.log(`\n📝 ${key} (${data.screen_location}):`);
        Object.entries(data.translations).forEach(([lang, value]) => {
          console.log(`   ${lang}: ${value}`);
        });
      });
    }
    
    // Test dropdown config
    console.log('\n🔽 Checking JSONB dropdown configuration...');
    const dropdownQuery = `
      SELECT field_name, screen_location, config
      FROM dropdown_configs
      WHERE field_name IN ('first_apartment', 'property_ownership', 'first_home')
         OR screen_location LIKE 'mortgage%'
      LIMIT 10
    `;
    
    const dropdownResult = await contentPool.query(dropdownQuery);
    if (dropdownResult.rows.length > 0) {
      console.log('\n📋 Dropdown configurations:');
      dropdownResult.rows.forEach(row => {
        console.log(`  ${row.screen_location}/${row.field_name}:`, JSON.stringify(row.config, null, 2));
      });
    } else {
      console.log('❌ No dropdown configurations found for mortgage fields');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await contentPool.end();
  }
}

testMortgageDropdown();