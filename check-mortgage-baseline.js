const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkMortgageBaseline() {
  try {
    // Get mortgage calculator content breakdown
    const mortgageQuery = `
      SELECT 
        screen_location,
        component_type,
        COUNT(*) as count
      FROM content_items 
      WHERE screen_location LIKE 'calculate_mortgage_%'
      GROUP BY screen_location, component_type
      ORDER BY screen_location, component_type;
    `;
    
    const mortgage = await pool.query(mortgageQuery);
    console.log('Mortgage Calculator Content Breakdown:');
    console.table(mortgage.rows);
    
    // Get total per screen
    const screenTotalsQuery = `
      SELECT 
        screen_location,
        COUNT(*) as total_items,
        COUNT(DISTINCT component_type) as component_types
      FROM content_items 
      WHERE screen_location LIKE 'calculate_mortgage_%'
      GROUP BY screen_location
      ORDER BY screen_location;
    `;
    
    const screenTotals = await pool.query(screenTotalsQuery);
    console.log('\nMortgage Calculator Screen Totals:');
    console.table(screenTotals.rows);
    
    // Get grand total
    const grandTotalQuery = `
      SELECT 
        'Mortgage Calculator' as service,
        COUNT(*) as total_items,
        COUNT(DISTINCT screen_location) as screens,
        COUNT(DISTINCT component_type) as component_types
      FROM content_items 
      WHERE screen_location LIKE 'calculate_mortgage_%';
    `;
    
    const grandTotal = await pool.query(grandTotalQuery);
    console.log('\nMortgage Calculator Grand Total:');
    console.table(grandTotal.rows);
    
    // Compare component types across services
    const componentComparisonQuery = `
      SELECT 
        component_type,
        SUM(CASE WHEN screen_location LIKE 'calculate_mortgage_%' THEN 1 ELSE 0 END) as mortgage_calc,
        SUM(CASE WHEN screen_location LIKE 'refinance_step%' THEN 1 ELSE 0 END) as mortgage_refinance,
        SUM(CASE WHEN screen_location LIKE 'calculate_credit_%' THEN 1 ELSE 0 END) as credit_calc,
        SUM(CASE WHEN screen_location LIKE 'refinance_credit_%' THEN 1 ELSE 0 END) as credit_refinance
      FROM content_items
      WHERE screen_location LIKE 'calculate_mortgage_%' 
         OR screen_location LIKE 'refinance_step%'
         OR screen_location LIKE 'calculate_credit_%'
         OR screen_location LIKE 'refinance_credit_%'
      GROUP BY component_type
      ORDER BY component_type;
    `;
    
    const componentComparison = await pool.query(componentComparisonQuery);
    console.log('\nComponent Type Comparison Across Services:');
    console.table(componentComparison.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkMortgageBaseline();