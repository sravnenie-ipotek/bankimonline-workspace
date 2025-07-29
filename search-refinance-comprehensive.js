const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function searchRefinanceComprehensive() {
  try {
    console.log('🔍 COMPREHENSIVE REFINANCE MORTGAGE SEARCH\n');
    
    // 1. Search all screens with refinance
    console.log('📋 1. ALL SCREENS WITH "REFINANCE" KEYWORD:');
    console.log('==========================================\n');
    
    const refinanceScreens = await pool.query(`
      SELECT DISTINCT 
        screen_location,
        COUNT(*) as item_count,
        array_agg(DISTINCT component_type ORDER BY component_type) as component_types
      FROM content_items
      WHERE screen_location ILIKE '%refinance%'
        AND is_active = true
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    if (refinanceScreens.rows.length > 0) {
      console.log(`Found ${refinanceScreens.rows.length} screens:\n`);
      refinanceScreens.rows.forEach(row => {
        console.log(`📍 ${row.screen_location}: ${row.item_count} items`);
        console.log(`   Types: ${row.component_types.join(', ')}\n`);
      });
    }
    
    // 2. Get all content for refinance_step1
    console.log('\n📋 2. ALL CONTENT FOR REFINANCE_STEP1:');
    console.log('=====================================\n');
    
    const refinanceStep1 = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.category,
        ct.content_value,
        ct.language_code
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'refinance_step1'
        AND ci.is_active = true
        AND ct.status = 'approved'
      ORDER BY ct.language_code, ci.content_key
    `);
    
    if (refinanceStep1.rows.length > 0) {
      let currentLang = '';
      refinanceStep1.rows.forEach(row => {
        if (currentLang !== row.language_code) {
          console.log(`\n${row.language_code.toUpperCase()}:`);
          currentLang = row.language_code;
        }
        console.log(`  ${row.content_key} (${row.component_type}): "${row.content_value}"`);
      });
    }
    
    // 3. Search for refinance in different variations
    console.log('\n\n📋 3. CONTENT WITH REFINANCE VARIATIONS:');
    console.log('======================================\n');
    
    const variations = [
      'refinance',
      'refi',
      'מחזור', // Hebrew for refinance
      'рефинанс' // Russian for refinance
    ];
    
    for (const term of variations) {
      const result = await pool.query(`
        SELECT COUNT(DISTINCT ci.id) as count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE (ci.content_key ILIKE $1 
           OR ci.screen_location ILIKE $1
           OR ct.content_value ILIKE $1)
          AND ci.is_active = true
      `, [`%${term}%`]);
      
      console.log(`"${term}": ${result.rows[0].count} items`);
    }
    
    // 4. Check for form components
    console.log('\n\n📋 4. FORM COMPONENTS IN REFINANCE SCREENS:');
    console.log('=========================================\n');
    
    const formComponents = await pool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location ILIKE '%refinance%'
        AND ci.component_type IN (
          'input', 'label', 'placeholder', 'button', 
          'option', 'dropdown', 'select', 'radio', 
          'checkbox', 'field', 'validation_message'
        )
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
      ORDER BY ci.screen_location, ci.component_type, ci.content_key
    `);
    
    if (formComponents.rows.length > 0) {
      let currentScreen = '';
      let currentType = '';
      
      formComponents.rows.forEach(row => {
        if (currentScreen !== row.screen_location) {
          console.log(`\n📍 ${row.screen_location}:`);
          currentScreen = row.screen_location;
          currentType = '';
        }
        if (currentType !== row.component_type) {
          console.log(`\n  ${row.component_type}s:`);
          currentType = row.component_type;
        }
        console.log(`    - ${row.content_key}: "${row.content_value}"`);
      });
    } else {
      console.log('No form components found in refinance screens');
    }
    
    // 5. Check specific refinance calculator screens
    console.log('\n\n📋 5. CHECKING SPECIFIC CALCULATOR SCREENS:');
    console.log('=========================================\n');
    
    const calculatorScreens = [
      'refinance_calculator',
      'refinance_calculator_step1',
      'refinance_calculator_step2',
      'refinance_calculator_step3',
      'refinance_calculator_step4',
      'calculate_refinance',
      'calculate_refinance_1',
      'calculate_refinance_2'
    ];
    
    for (const screen of calculatorScreens) {
      const result = await pool.query(`
        SELECT COUNT(*) as count
        FROM content_items
        WHERE screen_location = $1 AND is_active = true
      `, [screen]);
      
      if (result.rows[0].count > 0) {
        console.log(`✅ ${screen}: ${result.rows[0].count} items`);
      }
    }
    
    // 6. Look for refinance content in other locations
    console.log('\n\n📋 6. REFINANCE CONTENT IN OTHER SCREENS:');
    console.log('=======================================\n');
    
    const otherScreens = await pool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key ILIKE '%refinance%'
        AND ci.screen_location NOT ILIKE '%refinance%'
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
      ORDER BY ci.screen_location, ci.content_key
    `);
    
    if (otherScreens.rows.length > 0) {
      let currentScreen = '';
      otherScreens.rows.forEach(row => {
        if (currentScreen !== row.screen_location) {
          console.log(`\n${row.screen_location}:`);
          currentScreen = row.screen_location;
        }
        console.log(`  - ${row.content_key}: "${row.content_value}"`);
      });
    }
    
    // 7. Check if content exists in translation files but not in DB
    console.log('\n\n📋 7. SUMMARY:');
    console.log('============\n');
    
    const summary = await pool.query(`
      SELECT 
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT ci.screen_location) as total_screens,
        COUNT(DISTINCT ci.component_type) as total_types,
        array_agg(DISTINCT ci.component_type ORDER BY ci.component_type) as all_types
      FROM content_items ci
      WHERE (ci.screen_location ILIKE '%refinance%' 
         OR ci.content_key ILIKE '%refinance%')
        AND ci.is_active = true
    `);
    
    const sumRow = summary.rows[0];
    console.log(`Total refinance-related items: ${sumRow.total_items}`);
    console.log(`Total screens: ${sumRow.total_screens}`);
    console.log(`Component types: ${sumRow.all_types.join(', ')}`);
    
    console.log('\n💡 NOTE: Limited content found in database.');
    console.log('The refinance mortgage calculator may still be using translation.json files');
    console.log('or the content might be under different screen names.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

searchRefinanceComprehensive();