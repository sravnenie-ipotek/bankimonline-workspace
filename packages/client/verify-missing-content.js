const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyMissingContent() {
  try {
    console.log('🔍 VERIFYING MISSING CONTENT CLAIMS\n');
    console.log('=' .repeat(80));
    
    // 1. Count content items by screen_location
    console.log('\n📊 CONTENT COUNTS BY SCREEN LOCATION:\n');
    
    const screens = [
      // Mortgage Refinancing
      'refinance_step1', 'refinance_step2', 'refinance_step3',
      // Credit Calculator
      'calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4',
      // Credit Refinancing
      'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'
    ];
    
    for (const screen of screens) {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_count,
          COUNT(CASE WHEN component_type = 'dropdown' THEN 1 END) as dropdown_count,
          COUNT(CASE WHEN component_type = 'dropdown_option' THEN 1 END) as option_count,
          COUNT(CASE WHEN component_type = 'text' THEN 1 END) as text_count,
          COUNT(CASE WHEN component_type NOT IN ('dropdown', 'dropdown_option', 'text') THEN 1 END) as other_count
        FROM content_items
        WHERE screen_location = $1
      `, [screen]);
      
      const row = result.rows[0];
      console.log(`${screen}:`);
      console.log(`  Total: ${row.total_count} items`);
      console.log(`  - Dropdowns: ${row.dropdown_count}`);
      console.log(`  - Options: ${row.option_count}`);
      console.log(`  - Text: ${row.text_count}`);
      console.log(`  - Other: ${row.other_count}`);
      console.log('');
    }
    
    // 2. Summary by service
    console.log('\n📈 SUMMARY BY SERVICE:\n');
    
    const services = [
      { name: 'Mortgage Refinancing', screens: ['refinance_step1', 'refinance_step2', 'refinance_step3'] },
      { name: 'Credit Calculator', screens: ['calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4'] },
      { name: 'Credit Refinancing', screens: ['refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'] }
    ];
    
    for (const service of services) {
      const result = await pool.query(`
        SELECT COUNT(*) as total_count
        FROM content_items
        WHERE screen_location = ANY($1)
      `, [service.screens]);
      
      console.log(`${service.name}: ${result.rows[0].total_count} items total`);
      
      // Get breakdown by screen
      const breakdown = await pool.query(`
        SELECT screen_location, COUNT(*) as count
        FROM content_items
        WHERE screen_location = ANY($1)
        GROUP BY screen_location
        ORDER BY screen_location
      `, [service.screens]);
      
      breakdown.rows.forEach(row => {
        console.log(`  - ${row.screen_location}: ${row.count} items`);
      });
      console.log('');
    }
    
    // 3. Compare with complete screens (mortgage_step2, mortgage_step3)
    console.log('\n🔍 COMPARISON WITH COMPLETE SCREENS:\n');
    
    const completeScreens = ['mortgage_step2', 'mortgage_step3'];
    
    for (const screen of completeScreens) {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_count,
          COUNT(CASE WHEN component_type = 'dropdown' THEN 1 END) as dropdown_count,
          COUNT(CASE WHEN component_type = 'dropdown_option' THEN 1 END) as option_count,
          COUNT(CASE WHEN component_type = 'text' THEN 1 END) as text_count
        FROM content_items
        WHERE screen_location = $1
      `, [screen]);
      
      const row = result.rows[0];
      console.log(`${screen} (baseline):`);
      console.log(`  Total: ${row.total_count} items`);
      console.log(`  - Dropdowns: ${row.dropdown_count}`);
      console.log(`  - Options: ${row.option_count}`);
      console.log(`  - Text: ${row.text_count}`);
      console.log('');
    }
    
    // 4. Check for potential content reuse patterns
    console.log('\n🔄 CHECKING FOR CONTENT REUSE PATTERNS:\n');
    
    // Check if any content keys appear in multiple screens
    const reuseCheck = await pool.query(`
      SELECT content_key, COUNT(DISTINCT screen_location) as screen_count, 
             array_agg(DISTINCT screen_location ORDER BY screen_location) as screens
      FROM content_items
      WHERE screen_location IN (
        'refinance_step1', 'refinance_step2', 'refinance_step3',
        'calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4',
        'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4',
        'mortgage_step2', 'mortgage_step3'
      )
      GROUP BY content_key
      HAVING COUNT(DISTINCT screen_location) > 1
      ORDER BY screen_count DESC
      LIMIT 10
    `);
    
    if (reuseCheck.rows.length > 0) {
      console.log('Content keys appearing in multiple screens:');
      reuseCheck.rows.forEach(row => {
        console.log(`  "${row.content_key}" appears in ${row.screen_count} screens:`);
        console.log(`    ${row.screens.join(', ')}`);
      });
    } else {
      console.log('No content reuse detected between these screens.');
    }
    
    // 5. Verify specific claims
    console.log('\n\n✅ VERIFICATION OF CLAIMS:\n');
    console.log('=' .repeat(80));
    
    // Mortgage Refinancing claim: 36 items (34+1+1)
    const mortgageRefinanceResult = await pool.query(`
      SELECT screen_location, COUNT(*) as count
      FROM content_items
      WHERE screen_location IN ('refinance_step1', 'refinance_step2', 'refinance_step3')
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    let mortgageRefinanceTotal = 0;
    console.log('\nMortgage Refinancing:');
    console.log('Claimed: 36 items total (34+1+1)');
    console.log('Actual:');
    mortgageRefinanceResult.rows.forEach(row => {
      console.log(`  - ${row.screen_location}: ${row.count} items`);
      mortgageRefinanceTotal += parseInt(row.count);
    });
    console.log(`  Total: ${mortgageRefinanceTotal} items`);
    console.log(`  Claim ${mortgageRefinanceTotal === 36 ? '✅ VERIFIED' : '❌ INCORRECT'}`);
    
    // Credit Calculator claim: 17 items (only step 1)
    const creditCalcResult = await pool.query(`
      SELECT screen_location, COUNT(*) as count
      FROM content_items
      WHERE screen_location IN ('calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4')
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    let creditCalcTotal = 0;
    console.log('\nCredit Calculator:');
    console.log('Claimed: 17 items (only step 1 exists)');
    console.log('Actual:');
    creditCalcResult.rows.forEach(row => {
      console.log(`  - ${row.screen_location}: ${row.count} items`);
      creditCalcTotal += parseInt(row.count);
    });
    console.log(`  Total: ${creditCalcTotal} items`);
    console.log(`  Claim ${creditCalcTotal === 17 ? '✅ VERIFIED' : '❌ INCORRECT'}`);
    
    // Credit Refinancing claim: 27 items (24+1+1+1)
    const creditRefinanceResult = await pool.query(`
      SELECT screen_location, COUNT(*) as count
      FROM content_items
      WHERE screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    let creditRefinanceTotal = 0;
    console.log('\nCredit Refinancing:');
    console.log('Claimed: 27 items (24+1+1+1)');
    console.log('Actual:');
    creditRefinanceResult.rows.forEach(row => {
      console.log(`  - ${row.screen_location}: ${row.count} items`);
      creditRefinanceTotal += parseInt(row.count);
    });
    console.log(`  Total: ${creditRefinanceTotal} items`);
    console.log(`  Claim ${creditRefinanceTotal === 27 ? '✅ VERIFIED' : '❌ INCORRECT'}`);
    
    // 6. Analyze what's missing
    console.log('\n\n🔍 ANALYSIS OF MISSING CONTENT:\n');
    console.log('=' .repeat(80));
    
    // Check if steps 2-4 exist at all for credit services
    console.log('\nCredit Calculator Missing Steps:');
    const creditMissing = ['calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4'];
    for (const screen of creditMissing) {
      const exists = await pool.query(
        'SELECT COUNT(*) as count FROM content_items WHERE screen_location = $1',
        [screen]
      );
      console.log(`  ${screen}: ${exists.rows[0].count > 0 ? '✅ EXISTS' : '❌ MISSING'} (${exists.rows[0].count} items)`);
    }
    
    console.log('\nCredit Refinancing Step Counts:');
    const creditRefSteps = ['refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'];
    for (const screen of creditRefSteps) {
      const exists = await pool.query(
        'SELECT COUNT(*) as count FROM content_items WHERE screen_location = $1',
        [screen]
      );
      console.log(`  ${screen}: ${exists.rows[0].count} items`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyMissingContent();