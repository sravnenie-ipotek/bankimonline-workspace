const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyArchitectureStatus() {
  console.log('=== ARCHITECTURAL VERIFICATION REPORT ===\n');
  
  try {
    // STEP 1: Count current content items by screen_location
    console.log('STEP 1: Count current content items by screen_location\n');
    
    // Refinance Mortgage screens
    const refinanceMortgageQuery = `
      SELECT screen_location, component_type, COUNT(*) as count 
      FROM content_items 
      WHERE screen_location IN ('refinance_step1', 'refinance_step2', 'refinance_step3')
      GROUP BY screen_location, component_type 
      ORDER BY screen_location, component_type;
    `;
    
    const refinanceMortgage = await pool.query(refinanceMortgageQuery);
    console.log('Refinance Mortgage Content:');
    console.table(refinanceMortgage.rows);
    
    // Calculate Credit screens
    const calculateCreditQuery = `
      SELECT screen_location, component_type, COUNT(*) as count 
      FROM content_items 
      WHERE screen_location IN ('calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4')
      GROUP BY screen_location, component_type 
      ORDER BY screen_location, component_type;
    `;
    
    const calculateCredit = await pool.query(calculateCreditQuery);
    console.log('\nCalculate Credit Content:');
    console.table(calculateCredit.rows);
    
    // Refinance Credit screens
    const refinanceCreditQuery = `
      SELECT screen_location, component_type, COUNT(*) as count 
      FROM content_items 
      WHERE screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')
      GROUP BY screen_location, component_type 
      ORDER BY screen_location, component_type;
    `;
    
    const refinanceCredit = await pool.query(refinanceCreditQuery);
    console.log('\nRefinance Credit Content:');
    console.table(refinanceCredit.rows);
    
    // STEP 2: Verify dropdown coverage
    console.log('\n\nSTEP 2: Verify dropdown coverage\n');
    
    const dropdownCoverageQuery = `
      SELECT 
        screen_location,
        SUM(CASE WHEN component_type = 'dropdown' THEN 1 ELSE 0 END) as dropdown_count,
        SUM(CASE WHEN component_type IN ('option', 'dropdown_option') THEN 1 ELSE 0 END) as option_count,
        COUNT(*) as total_items
      FROM content_items 
      WHERE screen_location IN (
        'refinance_step1', 'refinance_step2', 'refinance_step3',
        'calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4',
        'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'
      )
      GROUP BY screen_location 
      ORDER BY screen_location;
    `;
    
    const dropdownCoverage = await pool.query(dropdownCoverageQuery);
    console.log('Dropdown Coverage by Screen:');
    console.table(dropdownCoverage.rows);
    
    // Check specific refinance_credit_1 dropdown options
    const refinanceCredit1DropdownsQuery = `
      SELECT content_key, component_type, description, legacy_translation_key 
      FROM content_items 
      WHERE screen_location = 'refinance_credit_1' 
      AND component_type IN ('dropdown', 'option', 'dropdown_option')
      ORDER BY content_key, component_type;
    `;
    
    const refinanceCredit1Dropdowns = await pool.query(refinanceCredit1DropdownsQuery);
    console.log('\nRefinance Credit Step 1 Dropdown Details:');
    console.table(refinanceCredit1Dropdowns.rows);
    
    // STEP 3: Check for new content (evidence of migrations)
    console.log('\n\nSTEP 3: Check if migrations were applied\n');
    
    // Check for step 4 content
    const step4ContentQuery = `
      SELECT screen_location, component_type, content_key, description 
      FROM content_items 
      WHERE screen_location IN ('calculate_credit_4', 'refinance_credit_4')
      ORDER BY screen_location, component_type;
    `;
    
    const step4Content = await pool.query(step4ContentQuery);
    console.log('Step 4 Content (Evidence of migrations):');
    console.table(step4Content.rows);
    
    // STEP 4: Calculate actual completion percentages
    console.log('\n\nSTEP 4: Calculate actual completion percentages\n');
    
    // Get total counts for each service
    const totalCountsQuery = `
      SELECT 
        CASE 
          WHEN screen_location LIKE 'calculate_mortgage_%' THEN 'Mortgage Calculator'
          WHEN screen_location LIKE 'refinance_step%' THEN 'Mortgage Refinancing'
          WHEN screen_location LIKE 'calculate_credit_%' THEN 'Credit Calculator'
          WHEN screen_location LIKE 'refinance_credit_%' THEN 'Credit Refinancing'
        END as service,
        COUNT(*) as total_items
      FROM content_items 
      WHERE screen_location LIKE 'calculate_mortgage_%' 
         OR screen_location LIKE 'refinance_step%'
         OR screen_location LIKE 'calculate_credit_%'
         OR screen_location LIKE 'refinance_credit_%'
      GROUP BY service
      ORDER BY service;
    `;
    
    const totalCounts = await pool.query(totalCountsQuery);
    console.log('Total Item Counts by Service:');
    console.table(totalCounts.rows);
    
    // Calculate percentages using mortgage calculator as baseline (123 items)
    const baselineCount = 123;
    console.log('\nCompletion Percentages (baseline: Mortgage Calculator = 123 items):');
    totalCounts.rows.forEach(row => {
      if (row.service) {
        const percentage = ((row.total_items / baselineCount) * 100).toFixed(1);
        console.log(`${row.service}: ${row.total_items} items (${percentage}%)`);
      }
    });
    
    // STEP 5: Verify specific claims
    console.log('\n\nSTEP 5: Verify specific claims\n');
    
    // Get exact counts for verification
    const verificationQuery = `
      SELECT 
        'Mortgage Refinancing' as service,
        COUNT(*) as actual_count,
        36 as claimed_count,
        COUNT(*) - 36 as difference
      FROM content_items 
      WHERE screen_location LIKE 'refinance_step%'
      UNION ALL
      SELECT 
        'Credit Calculator' as service,
        COUNT(*) as actual_count,
        17 as claimed_count,
        COUNT(*) - 17 as difference
      FROM content_items 
      WHERE screen_location LIKE 'calculate_credit_%'
      UNION ALL
      SELECT 
        'Credit Refinancing' as service,
        COUNT(*) as actual_count,
        27 as claimed_count,
        COUNT(*) - 27 as difference
      FROM content_items 
      WHERE screen_location LIKE 'refinance_credit_%';
    `;
    
    const verification = await pool.query(verificationQuery);
    console.log('Claim Verification:');
    console.table(verification.rows);
    
    // Check missing items calculation
    console.log('\n\nMissing Items Analysis:');
    console.log('Claimed missing items:');
    console.log('- Mortgage Refinancing: 80-120 items missing');
    console.log('- Credit Calculator: 40-80 items missing');
    console.log('- Credit Refinancing: 60-90 items missing');
    
    console.log('\nActual missing items (using 123 as baseline):');
    totalCounts.rows.forEach(row => {
      if (row.service && row.service !== 'Mortgage Calculator') {
        const missing = baselineCount - row.total_items;
        console.log(`- ${row.service}: ${missing} items missing`);
      }
    });
    
    // Additional analysis: Check for empty screens
    const emptyScreensQuery = `
      SELECT screen_location, COUNT(*) as count
      FROM content_items
      WHERE screen_location IN (
        'refinance_step1', 'refinance_step2', 'refinance_step3',
        'calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4',
        'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'
      )
      GROUP BY screen_location
      HAVING COUNT(*) = 0;
    `;
    
    const emptyScreens = await pool.query(emptyScreensQuery);
    if (emptyScreens.rows.length > 0) {
      console.log('\n\nEmpty Screens Found:');
      console.table(emptyScreens.rows);
    } else {
      console.log('\n\nNo empty screens found - all screens have content.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

verifyArchitectureStatus();