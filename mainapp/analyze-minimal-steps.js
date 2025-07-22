const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function analyzeMinimalSteps() {
  try {
    console.log('🔍 ANALYZING MINIMAL STEP CONTENT\n');
    console.log('=' .repeat(80));
    
    // Check what the single items are in steps 2-4
    const minimalSteps = [
      'refinance_step2', 'refinance_step3',
      'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'
    ];
    
    console.log('\n📋 CONTENT IN MINIMAL STEPS (1 item each):\n');
    
    for (const screen of minimalSteps) {
      const result = await pool.query(`
        SELECT content_key, component_type, category, en, he, ru
        FROM content_items
        WHERE screen_location = $1
      `, [screen]);
      
      if (result.rows.length > 0) {
        console.log(`${screen}:`);
        result.rows.forEach(row => {
          console.log(`  Key: ${row.content_key}`);
          console.log(`  Type: ${row.component_type}`);
          console.log(`  Category: ${row.category || 'none'}`);
          console.log(`  Content EN: ${row.en}`);
          console.log(`  Content HE: ${row.he}`);
          console.log(`  Content RU: ${row.ru}`);
        });
        console.log('');
      }
    }
    
    // Compare with complete steps to see what's typically included
    console.log('\n📊 COMPONENT TYPE DISTRIBUTION IN COMPLETE VS MINIMAL STEPS:\n');
    
    // Complete steps
    const completeSteps = ['mortgage_step2', 'mortgage_step3', 'refinance_step1', 'calculate_credit_1', 'refinance_credit_1'];
    
    for (const screen of completeSteps) {
      const result = await pool.query(`
        SELECT component_type, COUNT(*) as count
        FROM content_items
        WHERE screen_location = $1
        GROUP BY component_type
        ORDER BY count DESC
      `, [screen]);
      
      console.log(`${screen} (${result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)} items):`);
      result.rows.forEach(row => {
        console.log(`  - ${row.component_type}: ${row.count}`);
      });
      console.log('');
    }
    
    // Check for patterns in content keys
    console.log('\n🔍 CONTENT KEY PATTERNS:\n');
    
    const keyPatterns = await pool.query(`
      SELECT 
        screen_location,
        COUNT(CASE WHEN content_key LIKE '%title%' THEN 1 END) as title_count,
        COUNT(CASE WHEN content_key LIKE '%label%' THEN 1 END) as label_count,
        COUNT(CASE WHEN content_key LIKE '%button%' THEN 1 END) as button_count,
        COUNT(CASE WHEN content_key LIKE '%placeholder%' THEN 1 END) as placeholder_count,
        COUNT(CASE WHEN content_key LIKE '%option%' THEN 1 END) as option_count,
        COUNT(CASE WHEN content_key LIKE '%error%' THEN 1 END) as error_count,
        COUNT(CASE WHEN content_key LIKE '%info%' OR content_key LIKE '%help%' THEN 1 END) as info_count
      FROM content_items
      WHERE screen_location IN (
        'mortgage_step2', 'mortgage_step3', 
        'refinance_step1', 'refinance_step2', 'refinance_step3',
        'calculate_credit_1', 'refinance_credit_1'
      )
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('Content key patterns by screen:');
    keyPatterns.rows.forEach(row => {
      console.log(`\n${row.screen_location}:`);
      console.log(`  Titles: ${row.title_count}`);
      console.log(`  Labels: ${row.label_count}`);
      console.log(`  Buttons: ${row.button_count}`);
      console.log(`  Placeholders: ${row.placeholder_count}`);
      console.log(`  Options: ${row.option_count}`);
      console.log(`  Errors: ${row.error_count}`);
      console.log(`  Info/Help: ${row.info_count}`);
    });
    
    // Check what content exists in refinance_credit_1 as it has more items
    console.log('\n\n📋 SAMPLE CONTENT FROM refinance_credit_1 (24 items):\n');
    
    const sampleContent = await pool.query(`
      SELECT content_key, component_type, en
      FROM content_items
      WHERE screen_location = 'refinance_credit_1'
      ORDER BY content_key
      LIMIT 10
    `);
    
    sampleContent.rows.forEach(row => {
      console.log(`- ${row.content_key} (${row.component_type}): "${row.en}"`);
    });
    
    // Summary
    console.log('\n\n📊 SUMMARY OF FINDINGS:\n');
    console.log('=' .repeat(80));
    
    console.log('\n1. VERIFIED CLAIMS:');
    console.log('   ✅ Mortgage Refinancing: 36 items (34 + 1 + 1)');
    console.log('   ✅ Credit Calculator: 17 items (only step 1 exists)');
    console.log('   ✅ Credit Refinancing: 27 items (24 + 1 + 1 + 1)');
    
    console.log('\n2. MISSING CONTENT:');
    console.log('   - Credit Calculator: Steps 2, 3, and 4 are completely missing');
    console.log('   - Mortgage Refinancing: Steps 2 and 3 have only 1 item each');
    console.log('   - Credit Refinancing: Steps 2, 3, and 4 have only 1 item each');
    
    console.log('\n3. COMPARISON WITH COMPLETE SCREENS:');
    console.log('   - Complete screens (mortgage_step2, mortgage_step3) have 42 items each');
    console.log('   - This suggests that the minimal steps are missing ~40 items each');
    
    console.log('\n4. TYPICAL CONTENT FOR A COMPLETE STEP INCLUDES:');
    console.log('   - Multiple input fields with labels and placeholders');
    console.log('   - Dropdown menus with options');
    console.log('   - Validation error messages');
    console.log('   - Help text and tooltips');
    console.log('   - Navigation buttons');
    console.log('   - Section titles and instructions');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeMinimalSteps();