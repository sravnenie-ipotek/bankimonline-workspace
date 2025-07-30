const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testMortgageStep1Integration() {
  console.log('🧪 TESTING MORTGAGE STEP 1 INTEGRATION\n');
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Verify all required content exists in mortgage_step1
    console.log('📋 Test 1: Checking mortgage_step1 content completeness...');
    const requiredFields = [
      'mortgage_step1.field.city',
      'mortgage_step1.field.when_needed',
      'mortgage_step1.field.type',
      'mortgage_step1.field.first_home',
      'mortgage_step1.field.property_ownership'
    ];
    
    const contentCheck = await pool.query(`
      SELECT content_key, component_type
      FROM content_items
      WHERE screen_location = 'mortgage_step1'
        AND content_key = ANY($1::text[])
        AND is_active = true
    `, [requiredFields]);
    
    const foundKeys = new Set(contentCheck.rows.map(r => r.content_key));
    const missingKeys = requiredFields.filter(key => !foundKeys.has(key));
    
    if (missingKeys.length === 0) {
      console.log('✅ All required fields found in mortgage_step1');
    } else {
      console.log('❌ Missing fields:', missingKeys);
      allTestsPassed = false;
    }
    
    // Test 2: Check translations exist for all content
    console.log('\n📋 Test 2: Checking translations...');
    const translationCheck = await pool.query(`
      SELECT 
        ci.content_key,
        COUNT(DISTINCT ct.language_code) as translation_count,
        array_agg(DISTINCT ct.language_code ORDER BY ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step1'
        AND ci.is_active = true
      GROUP BY ci.content_key
      HAVING COUNT(DISTINCT ct.language_code) < 3
    `);
    
    if (translationCheck.rows.length === 0) {
      console.log('✅ All content has translations in all 3 languages');
    } else {
      console.log('❌ Content missing translations:');
      translationCheck.rows.forEach(row => {
        console.log(`   - ${row.content_key}: ${row.languages ? row.languages.join(', ') : 'none'}`);
      });
      allTestsPassed = false;
    }
    
    // Test 3: Verify options exist for all dropdowns
    console.log('\n📋 Test 3: Checking dropdown options...');
    const dropdownsWithOptions = {
      'when_needed': 4,
      'type': 4,
      'first_home': 3,
      'property_ownership': 3
    };
    
    for (const [field, expectedCount] of Object.entries(dropdownsWithOptions)) {
      const optionCheck = await pool.query(`
        SELECT COUNT(*) as option_count
        FROM content_items
        WHERE screen_location = 'mortgage_step1'
          AND content_key LIKE 'mortgage_step1.field.${field}_option_%'
          AND is_active = true
      `);
      
      const actualCount = parseInt(optionCheck.rows[0].option_count);
      if (actualCount === expectedCount) {
        console.log(`✅ ${field}: ${actualCount} options found (expected ${expectedCount})`);
      } else {
        console.log(`❌ ${field}: ${actualCount} options found (expected ${expectedCount})`);
        allTestsPassed = false;
      }
    }
    
    // Test 4: Check for duplicates
    console.log('\n📋 Test 4: Checking for duplicate content keys...');
    const duplicateCheck = await pool.query(`
      SELECT content_key, COUNT(*) as count
      FROM content_items
      WHERE screen_location = 'mortgage_step1'
      GROUP BY content_key
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateCheck.rows.length === 0) {
      console.log('✅ No duplicate content keys found');
    } else {
      console.log('❌ Duplicate content keys found:');
      duplicateCheck.rows.forEach(row => {
        console.log(`   - ${row.content_key}: ${row.count} occurrences`);
      });
      allTestsPassed = false;
    }
    
    // Test 5: Simulate API call
    console.log('\n📋 Test 5: Simulating API content fetch...');
    const apiSimulation = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        json_object_agg(
          ct.language_code, 
          ct.content_value
        ) as translations
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step1'
        AND ci.is_active = true
        AND ct.status = 'approved'
      GROUP BY ci.id, ci.content_key, ci.component_type
      ORDER BY ci.content_key
    `);
    
    console.log(`✅ API would return ${apiSimulation.rows.length} content items`);
    
    // Sample a few items to show structure
    console.log('\n   Sample content structure:');
    apiSimulation.rows.slice(0, 3).forEach(item => {
      console.log(`   - ${item.content_key} (${item.component_type})`);
      console.log(`     Languages: ${Object.keys(item.translations).join(', ')}`);
    });
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
      console.log('✅ ALL TESTS PASSED! mortgage_step1 is ready for use.');
    } else {
      console.log('❌ Some tests failed. Please review the issues above.');
    }
    
    // Helpful info for manual testing
    console.log('\n📝 MANUAL TESTING CHECKLIST:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Navigate to: http://localhost:5173/services/calculate-mortgage/1');
    console.log('3. Verify all 5 dropdowns appear correctly:');
    console.log('   - City selection');
    console.log('   - When needed (4 options)');
    console.log('   - Property type (4 options)');
    console.log('   - First home status (3 options)');
    console.log('   - Property ownership (3 options)');
    console.log('4. Test language switching (English, Hebrew, Russian)');
    console.log('5. Check admin panel at mortgage_step1 section');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    allTestsPassed = false;
  } finally {
    await pool.end();
  }
  
  return allTestsPassed;
}

// Execute tests
testMortgageStep1Integration()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });