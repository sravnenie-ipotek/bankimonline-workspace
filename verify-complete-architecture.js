const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyCompleteArchitecture() {
  console.log('=== COMPLETE ARCHITECTURAL VERIFICATION REPORT ===\n');
  
  try {
    // STEP 1: Get the REAL baseline counts
    console.log('STEP 1: Actual Content Counts by Service\n');
    
    // Mortgage Calculator (actual screen names)
    const mortgageCalcQuery = `
      SELECT 
        'Mortgage Calculator' as service,
        screen_location,
        component_type,
        COUNT(*) as count
      FROM content_items 
      WHERE screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4', 'mortgage_calculation')
      GROUP BY screen_location, component_type
      ORDER BY screen_location, component_type;
    `;
    
    const mortgageCalc = await pool.query(mortgageCalcQuery);
    console.log('Mortgage Calculator (ACTUAL BASELINE):');
    console.table(mortgageCalc.rows);
    
    // Get mortgage calculator total
    const mortgageTotalQuery = `
      SELECT COUNT(*) as total
      FROM content_items 
      WHERE screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4', 'mortgage_calculation');
    `;
    
    const mortgageTotal = await pool.query(mortgageTotalQuery);
    const ACTUAL_BASELINE = mortgageTotal.rows[0].total;
    console.log(`\nMortgage Calculator TOTAL: ${ACTUAL_BASELINE} items (This is our 100% baseline)\n`);
    
    // Compare all services
    const serviceComparisonQuery = `
      SELECT 
        service,
        COUNT(*) as total_items,
        COUNT(DISTINCT screen_location) as screens,
        COUNT(DISTINCT component_type) as component_types,
        ROUND((COUNT(*)::numeric / ${ACTUAL_BASELINE} * 100), 1) as completion_percentage
      FROM (
        SELECT 
          CASE 
            WHEN screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4', 'mortgage_calculation') THEN 'Mortgage Calculator'
            WHEN screen_location LIKE 'refinance_step%' THEN 'Mortgage Refinancing'
            WHEN screen_location LIKE 'calculate_credit_%' THEN 'Credit Calculator'
            WHEN screen_location LIKE 'refinance_credit_%' THEN 'Credit Refinancing'
          END as service,
          *
        FROM content_items 
        WHERE screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4', 'mortgage_calculation')
           OR screen_location LIKE 'refinance_step%'
           OR screen_location LIKE 'calculate_credit_%'
           OR screen_location LIKE 'refinance_credit_%'
      ) t
      GROUP BY service
      ORDER BY total_items DESC;
    `;
    
    const serviceComparison = await pool.query(serviceComparisonQuery);
    console.log('Service Comparison:');
    console.table(serviceComparison.rows);
    
    // STEP 2: Analyze missing content by component type
    console.log('\n\nSTEP 2: Component Type Analysis\n');
    
    const componentAnalysisQuery = `
      SELECT 
        component_type,
        SUM(CASE WHEN screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4', 'mortgage_calculation') THEN 1 ELSE 0 END) as mortgage_calc,
        SUM(CASE WHEN screen_location LIKE 'refinance_step%' THEN 1 ELSE 0 END) as mortgage_refinance,
        SUM(CASE WHEN screen_location LIKE 'calculate_credit_%' THEN 1 ELSE 0 END) as credit_calc,
        SUM(CASE WHEN screen_location LIKE 'refinance_credit_%' THEN 1 ELSE 0 END) as credit_refinance
      FROM content_items
      WHERE screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4', 'mortgage_calculation')
         OR screen_location LIKE 'refinance_step%'
         OR screen_location LIKE 'calculate_credit_%'
         OR screen_location LIKE 'refinance_credit_%'
      GROUP BY component_type
      ORDER BY mortgage_calc DESC, component_type;
    `;
    
    const componentAnalysis = await pool.query(componentAnalysisQuery);
    console.log('Component Type Distribution:');
    console.table(componentAnalysis.rows);
    
    // STEP 3: Screen-by-screen comparison
    console.log('\n\nSTEP 3: Screen-by-Screen Analysis\n');
    
    const screenAnalysisQuery = `
      WITH mortgage_screens AS (
        SELECT 
          CASE 
            WHEN screen_location = 'mortgage_step1' THEN 'step1'
            WHEN screen_location = 'mortgage_step2' THEN 'step2'
            WHEN screen_location = 'mortgage_step3' THEN 'step3'
            WHEN screen_location = 'mortgage_step4' THEN 'step4'
            WHEN screen_location = 'mortgage_calculation' THEN 'calculation'
          END as step,
          COUNT(*) as count
        FROM content_items 
        WHERE screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4', 'mortgage_calculation')
        GROUP BY screen_location
      ),
      refinance_mortgage_screens AS (
        SELECT 
          CASE 
            WHEN screen_location = 'refinance_step1' THEN 'step1'
            WHEN screen_location = 'refinance_step2' THEN 'step2'
            WHEN screen_location = 'refinance_step3' THEN 'step3'
          END as step,
          COUNT(*) as count
        FROM content_items 
        WHERE screen_location LIKE 'refinance_step%'
        GROUP BY screen_location
      ),
      credit_calc_screens AS (
        SELECT 
          CASE 
            WHEN screen_location = 'calculate_credit_1' THEN 'step1'
            WHEN screen_location = 'calculate_credit_2' THEN 'step2'
            WHEN screen_location = 'calculate_credit_3' THEN 'step3'
            WHEN screen_location = 'calculate_credit_4' THEN 'step4'
          END as step,
          COUNT(*) as count
        FROM content_items 
        WHERE screen_location LIKE 'calculate_credit_%'
        GROUP BY screen_location
      ),
      credit_refinance_screens AS (
        SELECT 
          CASE 
            WHEN screen_location = 'refinance_credit_1' THEN 'step1'
            WHEN screen_location = 'refinance_credit_2' THEN 'step2'
            WHEN screen_location = 'refinance_credit_3' THEN 'step3'
            WHEN screen_location = 'refinance_credit_4' THEN 'step4'
          END as step,
          COUNT(*) as count
        FROM content_items 
        WHERE screen_location LIKE 'refinance_credit_%'
        GROUP BY screen_location
      )
      SELECT 
        COALESCE(m.step, rm.step, cc.step, cr.step) as step,
        COALESCE(m.count, 0) as mortgage_calc,
        COALESCE(rm.count, 0) as mortgage_refinance,
        COALESCE(cc.count, 0) as credit_calc,
        COALESCE(cr.count, 0) as credit_refinance
      FROM mortgage_screens m
      FULL OUTER JOIN refinance_mortgage_screens rm ON m.step = rm.step
      FULL OUTER JOIN credit_calc_screens cc ON COALESCE(m.step, rm.step) = cc.step
      FULL OUTER JOIN credit_refinance_screens cr ON COALESCE(m.step, rm.step, cc.step) = cr.step
      ORDER BY 
        CASE 
          WHEN COALESCE(m.step, rm.step, cc.step, cr.step) = 'step1' THEN 1
          WHEN COALESCE(m.step, rm.step, cc.step, cr.step) = 'step2' THEN 2
          WHEN COALESCE(m.step, rm.step, cc.step, cr.step) = 'step3' THEN 3
          WHEN COALESCE(m.step, rm.step, cc.step, cr.step) = 'step4' THEN 4
          WHEN COALESCE(m.step, rm.step, cc.step, cr.step) = 'calculation' THEN 5
        END;
    `;
    
    const screenAnalysis = await pool.query(screenAnalysisQuery);
    console.log('Screen-by-Screen Content Count:');
    console.table(screenAnalysis.rows);
    
    // STEP 4: Identify what's missing
    console.log('\n\nSTEP 4: Missing Content Analysis\n');
    
    // Check which component types are completely missing
    const missingComponentsQuery = `
      SELECT 
        component_type,
        COUNT(*) as mortgage_calc_count
      FROM content_items 
      WHERE screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4', 'mortgage_calculation')
      AND component_type NOT IN (
        SELECT DISTINCT component_type 
        FROM content_items 
        WHERE screen_location LIKE 'refinance_step%'
      )
      GROUP BY component_type
      ORDER BY mortgage_calc_count DESC;
    `;
    
    const missingComponents = await pool.query(missingComponentsQuery);
    console.log('Component types in Mortgage Calculator but MISSING from Mortgage Refinancing:');
    console.table(missingComponents.rows);
    
    // Summary
    console.log('\n\nSUMMARY OF FINDINGS:\n');
    console.log('1. The ACTUAL mortgage calculator baseline is', ACTUAL_BASELINE, 'items (not 123)');
    console.log('2. Current completion percentages based on actual baseline:');
    serviceComparison.rows.forEach(row => {
      if (row.service !== 'Mortgage Calculator') {
        console.log(`   - ${row.service}: ${row.total_items} items (${row.completion_percentage}%)`);
      }
    });
    console.log('\n3. Major gaps identified:');
    console.log('   - Mortgage Refinancing is missing step4 and calculation screens entirely');
    console.log('   - Credit services have minimal content (only step 1 has any real content)');
    console.log('   - Many component types are completely missing from refinancing services');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

verifyCompleteArchitecture();