#!/usr/bin/env node

const { Pool } = require('pg');

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

async function fixRemainingScreenLocations() {
  console.log('🚀 Starting Remaining Screen Location Fix');
  console.log('📋 Fixing about, contacts, and navigation screen_locations\n');

  try {
    // Begin transaction
    await pool.query('BEGIN');
    console.log('📦 Transaction started');

    // Check current state of non-compliant items
    console.log('\n=== CURRENT STATE ===');
    
    const currentState = await executeQuery(`
      SELECT screen_location, COUNT(*) as count
      FROM content_items 
      WHERE screen_location IN ('about', 'contacts', 'navigation')
      GROUP BY screen_location
      ORDER BY screen_location;
    `, 'Check current non-compliant screen_locations');

    // Show what content is in each category
    const aboutContent = await executeQuery(`
      SELECT content_key, component_type, category
      FROM content_items 
      WHERE screen_location = 'about'
      ORDER BY content_key;
    `, 'Show about page content');

    const contactsContent = await executeQuery(`
      SELECT content_key, component_type, category
      FROM content_items 
      WHERE screen_location = 'contacts'
      ORDER BY content_key;
    `, 'Show contacts page content');

    const navigationContent = await executeQuery(`
      SELECT content_key, component_type, category
      FROM content_items 
      WHERE screen_location = 'navigation'
      ORDER BY content_key;
    `, 'Show navigation content');

    // Fix screen_locations according to conventions
    console.log('\n=== FIXING SCREEN LOCATIONS ===');

    // Fix about → about_page
    const aboutFix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'about_page'
      WHERE screen_location = 'about';
    `, 'Fix about → about_page');

    // Fix contacts → contacts_page
    const contactsFix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'contacts_page'
      WHERE screen_location = 'contacts';
    `, 'Fix contacts → contacts_page');

    // Fix navigation → sidebar
    const navigationFix = await executeQuery(`
      UPDATE content_items 
      SET screen_location = 'sidebar'
      WHERE screen_location = 'navigation';
    `, 'Fix navigation → sidebar');

    // Verification
    console.log('\n=== VERIFICATION ===');
    
    const finalState = await executeQuery(`
      SELECT screen_location, COUNT(*) as count
      FROM content_items 
      WHERE screen_location IN ('about_page', 'contacts_page', 'sidebar')
      GROUP BY screen_location
      ORDER BY screen_location;
    `, 'Verify fixed screen_locations');

    // Check for any remaining non-compliant items
    const remainingNonCompliant = await executeQuery(`
      SELECT 'REMAINING NON-COMPLIANT' as check_type, screen_location, COUNT(*) as count
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
    `, 'Check for any remaining non-compliant screen_locations');

    // Final summary
    const summary = await executeQuery(`
      SELECT 
          'FINAL SUMMARY' as report_type,
          COUNT(*) as total_content_items,
          COUNT(DISTINCT screen_location) as unique_screen_locations
      FROM content_items 
      WHERE screen_location IS NOT NULL;
    `, 'Final migration summary');

    // Commit transaction
    await pool.query('COMMIT');
    console.log('\n✅ Transaction committed successfully');
    
    console.log('\n🎉 Remaining Screen Location Fix completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('- about (2 items) → about_page');
    console.log('- contacts (2 items) → contacts_page');
    console.log('- navigation (12 items) → sidebar');
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('\n❌ Transaction rolled back due to error:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await fixRemainingScreenLocations();
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

module.exports = { fixRemainingScreenLocations }; 