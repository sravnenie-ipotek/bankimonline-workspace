const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testDropdownDuplicates() {
  try {
    console.log('🔍 TESTING DROPDOWN DUPLICATES FOR MORTGAGE_STEP1\n');
    
    // 1. Check raw database content
    console.log('1. RAW DATABASE CONTENT:');
    console.log('========================');
    
    const rawContent = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.content_value,
        ct.language_code
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step1'
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'ru'
        AND ci.content_key LIKE '%first_home%'
      ORDER BY ci.content_key, ci.component_type
    `);
    
    console.log(`Found ${rawContent.rows.length} items for first_home in mortgage_step1:`);
    rawContent.rows.forEach(row => {
      console.log(`  - ${row.content_key} (${row.component_type}): "${row.content_value}"`);
    });
    
    // 2. Check if there are duplicates in the database
    console.log('\n2. CHECKING FOR DATABASE DUPLICATES:');
    console.log('=====================================');
    
    const duplicates = await pool.query(`
      SELECT 
        content_key,
        component_type,
        COUNT(*) as count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step1'
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'ru'
      GROUP BY content_key, component_type
      HAVING COUNT(*) > 1
      ORDER BY count DESC, content_key
    `);
    
    if (duplicates.rows.length === 0) {
      console.log('✅ No database duplicates found');
    } else {
      console.log('❌ Database duplicates found:');
      duplicates.rows.forEach(row => {
        console.log(`  - ${row.content_key} (${row.component_type}): ${row.count} occurrences`);
      });
    }
    
    // 3. Test the API endpoint logic
    console.log('\n3. TESTING API LOGIC:');
    console.log('======================');
    
    // Simulate the API field extraction logic
    const testKeys = [
      'mortgage_step1.field.first_home',
      'mortgage_step1.field.first_home_ph',
      'mortgage_step1.field.first_home_yes_first_home',
      'mortgage_step1.field.first_home_no_additional_property',
      'mortgage_step1.field.first_home_investment'
    ];
    
    console.log('Field extraction test:');
    testKeys.forEach(key => {
      // Simulate the API's field extraction logic
      let fieldName = null;
      
      // Pattern 1: mortgage_step1.field.{fieldname}
      let match = key.match(/^[^.]*\.field\.([^.]+?)_(?:yes_first_home|no_additional_property|investment)/);
      if (match) {
        fieldName = match[1];
      } else {
        match = key.match(/^[^.]*\.field\.([^.]+)/);
        if (match) {
          fieldName = match[1];
        }
      }
      
      console.log(`  ${key} -> fieldName: ${fieldName}`);
    });
    
    // 4. Check if there are multiple screen locations with same content
    console.log('\n4. CHECKING MULTIPLE SCREEN LOCATIONS:');
    console.log('========================================');
    
    const multiScreen = await pool.query(`
      SELECT 
        content_key,
        ARRAY_AGG(DISTINCT screen_location) as screens,
        COUNT(DISTINCT screen_location) as screen_count
      FROM content_items
      WHERE content_key LIKE '%first_home%'
        AND is_active = true
      GROUP BY content_key
      HAVING COUNT(DISTINCT screen_location) > 1
      ORDER BY screen_count DESC, content_key
    `);
    
    if (multiScreen.rows.length === 0) {
      console.log('✅ No content keys found in multiple screen locations');
    } else {
      console.log('⚠️ Content keys found in multiple screen locations:');
      multiScreen.rows.forEach(row => {
        console.log(`  - ${row.content_key}: ${row.screens.join(', ')}`);
      });
    }
    
    // 5. Check the actual API response
    console.log('\n5. TESTING ACTUAL API RESPONSE:');
    console.log('================================');
    
    try {
      const response = await fetch('http://localhost:8003/api/dropdowns/mortgage_step1/ru');
      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('✅ API Response Structure:');
        console.log(`  - Dropdowns: ${data.dropdowns?.length || 0}`);
        console.log(`  - Options keys: ${Object.keys(data.options || {}).length}`);
        
        // Check for first_home specifically
        const firstHomeDropdown = data.dropdowns?.find(d => d.key.includes('first_home'));
        if (firstHomeDropdown) {
          console.log(`  - First home dropdown: ${firstHomeDropdown.key}`);
          const options = data.options[firstHomeDropdown.key];
          if (options) {
            console.log(`  - First home options: ${options.length}`);
            options.forEach(option => {
              console.log(`    - ${option.value}: "${option.label}"`);
            });
          }
        }
      } else {
        console.log('❌ API returned error:', data);
      }
    } catch (error) {
      console.log('❌ Failed to test API:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testDropdownDuplicates(); 