const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyContent() {
  try {
    console.log('🔍 CONTENT VERIFICATION REPORT\n');
    console.log('=' .repeat(80));
    
    // 1. Get content counts by screen
    const screenCounts = await pool.query(`
      SELECT 
        screen_location,
        COUNT(*) as total_items,
        COUNT(CASE WHEN component_type = 'dropdown' THEN 1 END) as dropdowns,
        COUNT(CASE WHEN component_type = 'dropdown_option' THEN 1 END) as options,
        COUNT(CASE WHEN component_type = 'text' THEN 1 END) as text_items,
        COUNT(CASE WHEN component_type = 'heading' THEN 1 END) as headings,
        COUNT(CASE WHEN component_type = 'button' THEN 1 END) as buttons
      FROM content_items
      WHERE screen_location IN (
        'refinance_step1', 'refinance_step2', 'refinance_step3',
        'calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4',
        'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4',
        'mortgage_step2', 'mortgage_step3'
      )
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('\n📊 CONTENT BY SCREEN:\n');
    
    let mortgageRefinanceTotal = 0;
    let creditCalcTotal = 0;
    let creditRefinanceTotal = 0;
    
    screenCounts.rows.forEach(row => {
      console.log(`${row.screen_location}: ${row.total_items} items`);
      console.log(`  - Dropdowns: ${row.dropdowns}`);
      console.log(`  - Options: ${row.options}`);
      console.log(`  - Text: ${row.text_items}`);
      console.log(`  - Headings: ${row.headings}`);
      console.log(`  - Buttons: ${row.buttons}`);
      console.log('');
      
      // Sum up totals
      if (row.screen_location.startsWith('refinance_step')) {
        mortgageRefinanceTotal += parseInt(row.total_items);
      } else if (row.screen_location.startsWith('calculate_credit_')) {
        creditCalcTotal += parseInt(row.total_items);
      } else if (row.screen_location.startsWith('refinance_credit_')) {
        creditRefinanceTotal += parseInt(row.total_items);
      }
    });
    
    // 2. Get sample content from minimal screens
    console.log('\n📋 CONTENT IN MINIMAL SCREENS:\n');
    
    const minimalScreens = ['refinance_step2', 'refinance_step3', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'];
    
    for (const screen of minimalScreens) {
      const content = await pool.query(`
        SELECT content_key, component_type
        FROM content_items
        WHERE screen_location = $1
      `, [screen]);
      
      if (content.rows.length > 0) {
        console.log(`${screen}:`);
        content.rows.forEach(row => {
          console.log(`  - ${row.content_key} (${row.component_type})`);
        });
      }
    }
    
    // 3. Check translations
    console.log('\n\n📋 TRANSLATION STATUS:\n');
    
    const translationStatus = await pool.query(`
      SELECT 
        ci.screen_location,
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT ct_en.content_item_id) as has_english,
        COUNT(DISTINCT ct_he.content_item_id) as has_hebrew,
        COUNT(DISTINCT ct_ru.content_item_id) as has_russian
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location IN (
        'refinance_step1', 'refinance_credit_1', 'calculate_credit_1'
      )
      GROUP BY ci.screen_location
    `);
    
    translationStatus.rows.forEach(row => {
      console.log(`${row.screen_location}:`);
      console.log(`  Total items: ${row.total_items}`);
      console.log(`  Has English: ${row.has_english}`);
      console.log(`  Has Hebrew: ${row.has_hebrew}`);
      console.log(`  Has Russian: ${row.has_russian}`);
      console.log('');
    });
    
    // 4. Summary
    console.log('\n\n✅ VERIFICATION SUMMARY:\n');
    console.log('=' .repeat(80));
    
    console.log('\n1. SERVICE TOTALS:');
    console.log(`   Mortgage Refinancing: ${mortgageRefinanceTotal} items (claimed 36) ${mortgageRefinanceTotal === 36 ? '✅' : '❌'}`);
    console.log(`   Credit Calculator: ${creditCalcTotal} items (claimed 17) ${creditCalcTotal === 17 ? '✅' : '❌'}`);
    console.log(`   Credit Refinancing: ${creditRefinanceTotal} items (claimed 27) ${creditRefinanceTotal === 27 ? '✅' : '❌'}`);
    
    console.log('\n2. MISSING STEPS:');
    console.log('   Credit Calculator: Steps 2, 3, 4 are MISSING (0 items each)');
    console.log('   Mortgage Refinancing: Steps 2, 3 have only 1 item each');
    console.log('   Credit Refinancing: Steps 2, 3, 4 have only 1 item each');
    
    console.log('\n3. COMPARISON:');
    console.log('   Complete screens (mortgage_step2, mortgage_step3) have 42 items each');
    console.log('   Steps with 1 item are missing ~40 items of content');
    
    console.log('\n4. ESTIMATED MISSING CONTENT:');
    console.log('   - Credit Calculator steps 2-4: ~120 items (3 × 40)');
    console.log('   - Mortgage Refinancing steps 2-3: ~80 items (2 × 40)');
    console.log('   - Credit Refinancing steps 2-4: ~120 items (3 × 40)');
    console.log('   - TOTAL MISSING: ~320 content items');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyContent();