const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function searchRefinanceMortgageContent() {
  try {
    console.log('🔍 SEARCHING FOR REFINANCE MORTGAGE CONTENT\n');
    console.log('URL: http://localhost:5173/services/refinance-mortgage/1\n');
    
    // Search for content items related to refinance mortgage
    console.log('📋 1. SEARCHING FOR REFINANCE MORTGAGE SCREEN CONTENT:');
    console.log('=================================================\n');
    
    const screenLocations = [
      'refinance_mortgage_1',
      'refinance_mortgage_step1',
      'refinance-mortgage-1',
      'refinance-mortgage/1',
      'services/refinance-mortgage/1'
    ];
    
    for (const screen of screenLocations) {
      const result = await pool.query(`
        SELECT 
          ci.id,
          ci.content_key,
          ci.component_type,
          ci.category,
          ci.screen_location,
          COUNT(ct.id) as translation_count
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = $1 AND ci.is_active = true
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, ci.screen_location
        ORDER BY ci.content_key
      `, [screen]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Found ${result.rows.length} items for screen: ${screen}`);
        result.rows.forEach(row => {
          console.log(`  - ${row.content_key} (${row.component_type}) - ${row.translation_count} translations`);
        });
        console.log('');
      }
    }
    
    // Search for dropdown options
    console.log('\n📋 2. SEARCHING FOR DROPDOWN OPTIONS:');
    console.log('=====================================\n');
    
    const dropdownResult = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE '%refinance%mortgage%'
        AND ci.component_type IN ('option', 'dropdown', 'select', 'radio')
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
      ORDER BY ci.screen_location, ci.content_key
    `);
    
    if (dropdownResult.rows.length > 0) {
      console.log(`✅ Found ${dropdownResult.rows.length} dropdown options:\n`);
      
      let currentScreen = '';
      dropdownResult.rows.forEach(row => {
        if (currentScreen !== row.screen_location) {
          console.log(`\n${row.screen_location}:`);
          currentScreen = row.screen_location;
        }
        console.log(`  - ${row.content_key}: "${row.content_value}"`);
      });
    } else {
      console.log('❌ No dropdown options found for refinance mortgage screens');
    }
    
    // Search by category
    console.log('\n\n📋 3. SEARCHING BY CATEGORY:');
    console.log('============================\n');
    
    const categoryResult = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ci.category,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.category IN ('refinance', 'mortgage', 'refinance-mortgage', 'mortgage-refi')
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
      ORDER BY ci.category, ci.component_type, ci.content_key
      LIMIT 20
    `);
    
    if (categoryResult.rows.length > 0) {
      console.log(`✅ Found ${categoryResult.rows.length} items in refinance/mortgage categories:\n`);
      
      let currentCategory = '';
      categoryResult.rows.forEach(row => {
        if (currentCategory !== row.category) {
          console.log(`\n${row.category}:`);
          currentCategory = row.category;
        }
        console.log(`  - ${row.content_key} (${row.component_type}): "${row.content_value}"`);
      });
    }
    
    // Search for form fields
    console.log('\n\n📋 4. SEARCHING FOR FORM FIELDS:');
    console.log('================================\n');
    
    const formFieldsResult = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE '%refinance%mortgage%'
        AND ci.component_type IN ('input', 'label', 'placeholder', 'field', 'text_field', 'number_field')
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
      ORDER BY ci.content_key
    `);
    
    if (formFieldsResult.rows.length > 0) {
      console.log(`✅ Found ${formFieldsResult.rows.length} form fields:\n`);
      formFieldsResult.rows.forEach(row => {
        console.log(`  - ${row.content_key} (${row.component_type}): "${row.content_value}"`);
      });
    }
    
    // Search for any content with "refinance" and "mortgage" keywords
    console.log('\n\n📋 5. GENERAL SEARCH FOR REFINANCE MORTGAGE CONTENT:');
    console.log('==================================================\n');
    
    const generalResult = await pool.query(`
      SELECT DISTINCT
        ci.screen_location,
        COUNT(*) as item_count,
        array_agg(DISTINCT ci.component_type) as component_types
      FROM content_items ci
      WHERE (ci.content_key ILIKE '%refinance%mortgage%' 
         OR ci.screen_location ILIKE '%refinance%mortgage%'
         OR ci.category ILIKE '%refinance%mortgage%')
        AND ci.is_active = true
      GROUP BY ci.screen_location
      ORDER BY item_count DESC
    `);
    
    if (generalResult.rows.length > 0) {
      console.log(`✅ Found content in ${generalResult.rows.length} screens:\n`);
      generalResult.rows.forEach(row => {
        console.log(`  - ${row.screen_location}: ${row.item_count} items`);
        console.log(`    Component types: ${row.component_types.join(', ')}`);
      });
    }
    
    // Check for specific dropdown patterns
    console.log('\n\n📋 6. CHECKING SPECIFIC DROPDOWN PATTERNS:');
    console.log('=========================================\n');
    
    const patterns = [
      'property_ownership',
      'loan_type',
      'payment_type',
      'interest_type',
      'bank_selection',
      'purpose',
      'city',
      'employment_status'
    ];
    
    for (const pattern of patterns) {
      const patternResult = await pool.query(`
        SELECT 
          ci.content_key,
          ci.screen_location,
          ct.content_value
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.content_key ILIKE '%${pattern}%'
          AND ci.screen_location ILIKE '%refinance%'
          AND ci.component_type IN ('option', 'dropdown', 'select')
          AND ci.is_active = true
          AND ct.status = 'approved'
          AND ct.language_code = 'en'
        LIMIT 5
      `);
      
      if (patternResult.rows.length > 0) {
        console.log(`\n${pattern}:`);
        patternResult.rows.forEach(row => {
          console.log(`  - ${row.content_key}: "${row.content_value}" (${row.screen_location})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

searchRefinanceMortgageContent();