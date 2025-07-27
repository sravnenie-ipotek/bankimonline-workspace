#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration - using contentPool connection like server-db.js
const dbConfig = {
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
};

const pool = new Pool(dbConfig);

async function executeQuery(query, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const result = await pool.query(query);
    console.log(`✅ ${description} completed successfully`);
    if (result.rows && result.rows.length > 0) {
      console.table(result.rows);
    }
    return result;
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error.message);
    throw error;
  }
}

async function fixScreenLocationConventions() {
  console.log('🚀 Starting Screen Location Convention Fix Migration');
  console.log('📋 This will align database screen_location values with procceessesPagesInDB.md conventions\n');

  try {
    // Begin transaction
    await pool.query('BEGIN');
    console.log('📦 Transaction started');

    // Phase 1: Check current state
    console.log('\n=== PHASE 1: CURRENT STATE ANALYSIS ===');
    
    const currentMortgage = await executeQuery(`
      SELECT screen_location, COUNT(*) as count
      FROM content_items 
      WHERE screen_location LIKE '%mortgage%'
      GROUP BY screen_location
      ORDER BY screen_location;
    `, 'Checking current mortgage screen_locations');

    const currentCredit = await executeQuery(`
      SELECT screen_location, COUNT(*) as count
      FROM content_items 
      WHERE screen_location LIKE '%credit%'
      GROUP BY screen_location
      ORDER BY screen_location;
    `, 'Checking current credit screen_locations');

    // Phase 2: Fix Mortgage Calculator
    console.log('\n=== PHASE 2: FIXING MORTGAGE CALCULATOR ===');
    
    const mortgageCalcFix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'mortgage_step1'
      WHERE screen_location = 'mortgage_calculation';
    `, 'Fix mortgage_calculation → mortgage_step1');

    const mortgageGenericFix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'mortgage_step1'
      WHERE screen_location = 'mortgage';
    `, 'Fix generic mortgage → mortgage_step1');

    // Phase 3: Fix Credit Calculator
    console.log('\n=== PHASE 3: FIXING CREDIT CALCULATOR ===');
    
    const credit1Fix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'credit_step1'
      WHERE screen_location = 'calculate_credit_1';
    `, 'Fix calculate_credit_1 → credit_step1');

    const credit2Fix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'credit_step2'
      WHERE screen_location = 'calculate_credit_2';
    `, 'Fix calculate_credit_2 → credit_step2');

    const credit3Fix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'credit_step3'
      WHERE screen_location = 'calculate_credit_3';
    `, 'Fix calculate_credit_3 → credit_step3');

    const credit4Fix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'credit_step4'
      WHERE screen_location = 'calculate_credit_4';
    `, 'Fix calculate_credit_4 → credit_step4');

    // Phase 4: Fix Legacy Credit Step Naming
    console.log('\n=== PHASE 4: FIXING LEGACY CREDIT NAMING ===');
    
    const legacyCreditFix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'credit_step1'
      WHERE screen_location = 'calculate_credit_step1';
    `, 'Fix calculate_credit_step1 → credit_step1');

    // Phase 5: Fix Sub-section Screen Locations
    console.log('\n=== PHASE 5: FIXING SUB-SECTION NAMING ===');
    
    const subsectionFixes = [
      {
        from: 'calculate_credit_3_header',
        to: 'credit_step3_header',
        desc: 'Fix credit step 3 header'
      },
      {
        from: 'calculate_credit_3_personal_info',
        to: 'credit_step3_personal_info',
        desc: 'Fix credit step 3 personal info'
      },
      {
        from: 'calculate_credit_4_header',
        to: 'credit_step4_header',
        desc: 'Fix credit step 4 header'
      },
      {
        from: 'calculate_credit_4_employment',
        to: 'credit_step4_employment',
        desc: 'Fix credit step 4 employment'
      },
      {
        from: 'calculate_credit_4_income',
        to: 'credit_step4_income',
        desc: 'Fix credit step 4 income'
      }
    ];

    for (const fix of subsectionFixes) {
      await executeQuery(`
        UPDATE content_items 
        SET screen_location = '${fix.to}'
        WHERE screen_location = '${fix.from}';
      `, fix.desc);
    }

    // Phase 6: Verification
    console.log('\n=== PHASE 6: VERIFICATION ===');
    
    const finalMortgage = await executeQuery(`
      SELECT 'MORTGAGE CHECK' as check_type, screen_location, COUNT(*) as count
      FROM content_items 
      WHERE screen_location LIKE '%mortgage%'
      GROUP BY screen_location
      ORDER BY screen_location;
    `, 'Verify mortgage screen_locations');

    const finalCredit = await executeQuery(`
      SELECT 'CREDIT CHECK' as check_type, screen_location, COUNT(*) as count
      FROM content_items 
      WHERE screen_location LIKE '%credit%'
      GROUP BY screen_location
      ORDER BY screen_location;
    `, 'Verify credit screen_locations');

    const nonCompliant = await executeQuery(`
      SELECT 'NON-COMPLIANT' as check_type, screen_location, COUNT(*) as count
      FROM content_items 
      WHERE screen_location NOT IN (
          'mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4',
          'credit_step1', 'credit_step2', 'credit_step3', 'credit_step4',
          'credit_step3_header', 'credit_step3_personal_info', 
          'credit_step4_header', 'credit_step4_employment', 'credit_step4_income',
          'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4',
          'sidebar', 'footer', 'bank_offers', 'bank_comparison',
          'home_page', 'about_page', 'contacts_page',
          'admin_dashboard', 'admin_content', 'admin_users'
      )
      AND screen_location IS NOT NULL
      GROUP BY screen_location
      ORDER BY screen_location;
    `, 'Check for remaining non-compliant screen_locations');

    const summary = await executeQuery(`
      SELECT 
          'MIGRATION SUMMARY' as report_type,
          COUNT(*) as total_content_items,
          COUNT(DISTINCT screen_location) as unique_screen_locations
      FROM content_items 
      WHERE screen_location IS NOT NULL;
    `, 'Migration summary');

    // Commit transaction
    await pool.query('COMMIT');
    console.log('\n✅ Transaction committed successfully');
    
    console.log('\n🎉 Screen Location Convention Fix Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update frontend components to use new screen_location values');
    console.log('2. Test API endpoints with new screen_location values');
    console.log('3. Update any hardcoded screen_location references in code');
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('\n❌ Transaction rolled back due to error:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await fixScreenLocationConventions();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fixScreenLocationConventions }; 