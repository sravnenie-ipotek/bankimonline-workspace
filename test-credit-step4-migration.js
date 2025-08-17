#!/usr/bin/env node

/**
 * Credit Step 4 Migration Test Script
 * 
 * This script tests the credit_step4 database migration to ensure:
 * 1. Migration creates all required content items
 * 2. All translations are properly created
 * 3. View is accessible and returns correct data
 * 4. No regressions occur
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Expected content keys
const EXPECTED_CONTENT_KEYS = [
  'credit_step4_title',
  'credit_step4_subtitle',
  'credit_final',
  'credit_warning',
  'credit_step4_user_info_title',
  'credit_step4_name_label',
  'credit_step4_phone_label',
  'credit_step4_amount_label',
  'credit_step4_filter_title',
  'credit_step4_filter_all',
  'credit_step4_filter_banks',
  'credit_step4_filter_insurance',
  'credit_step4_offers_title',
  'credit_step4_no_offers',
  'credit_step4_loading',
  'credit_step4_back_button',
  'credit_step4_submit_button',
  'credit_step4_compare_button'
];

const LANGUAGES = ['en', 'he', 'ru'];

async function testMigration() {
  console.log('🧪 Testing Credit Step 4 Migration\n');
  console.log('=' .repeat(60));
  
  let allTestsPassed = true;
  const results = {
    contentItems: { expected: EXPECTED_CONTENT_KEYS.length, actual: 0, passed: false },
    translations: { expected: EXPECTED_CONTENT_KEYS.length * LANGUAGES.length, actual: 0, passed: false },
    view: { exists: false, recordCount: 0, passed: false },
    keyIntegrity: { missing: [], extra: [], passed: false },
    languageCoverage: { en: 0, he: 0, ru: 0, passed: false }
  };
  
  try {
    // Test 1: Check content items
    console.log('\n📋 Test 1: Content Items');
    const contentResult = await pool.query(`
      SELECT content_key, component_type, category, is_active
      FROM content_items 
      WHERE screen_location = 'credit_step4'
      ORDER BY content_key
    `);
    
    results.contentItems.actual = contentResult.rows.length;
    results.contentItems.passed = results.contentItems.actual === results.contentItems.expected;
    
    console.log(`  Expected: ${results.contentItems.expected} items`);
    console.log(`  Found: ${results.contentItems.actual} items`);
    console.log(`  Status: ${results.contentItems.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Check for missing keys
    const foundKeys = contentResult.rows.map(row => row.content_key);
    results.keyIntegrity.missing = EXPECTED_CONTENT_KEYS.filter(key => !foundKeys.includes(key));
    results.keyIntegrity.extra = foundKeys.filter(key => !EXPECTED_CONTENT_KEYS.includes(key));
    results.keyIntegrity.passed = results.keyIntegrity.missing.length === 0 && results.keyIntegrity.extra.length === 0;
    
    if (results.keyIntegrity.missing.length > 0) {
      console.log(`  ⚠️  Missing keys: ${results.keyIntegrity.missing.join(', ')}`);
    }
    if (results.keyIntegrity.extra.length > 0) {
      console.log(`  ⚠️  Extra keys: ${results.keyIntegrity.extra.join(', ')}`);
    }
    
    // Test 2: Check translations
    console.log('\n🌍 Test 2: Translations');
    const translationResult = await pool.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_step4'
      ORDER BY ci.content_key, ct.language_code
    `);
    
    results.translations.actual = translationResult.rows.length;
    results.translations.passed = results.translations.actual === results.translations.expected;
    
    console.log(`  Expected: ${results.translations.expected} translations`);
    console.log(`  Found: ${results.translations.actual} translations`);
    console.log(`  Status: ${results.translations.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Check language coverage
    for (const lang of LANGUAGES) {
      results.languageCoverage[lang] = translationResult.rows.filter(row => row.language_code === lang).length;
    }
    results.languageCoverage.passed = 
      results.languageCoverage.en === EXPECTED_CONTENT_KEYS.length &&
      results.languageCoverage.he === EXPECTED_CONTENT_KEYS.length &&
      results.languageCoverage.ru === EXPECTED_CONTENT_KEYS.length;
    
    console.log(`  Language coverage:`);
    console.log(`    English: ${results.languageCoverage.en}/${EXPECTED_CONTENT_KEYS.length}`);
    console.log(`    Hebrew: ${results.languageCoverage.he}/${EXPECTED_CONTENT_KEYS.length}`);
    console.log(`    Russian: ${results.languageCoverage.ru}/${EXPECTED_CONTENT_KEYS.length}`);
    
    // Test 3: Check view
    console.log('\n👁️  Test 3: Database View');
    const viewResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM view_credit_step4
    `);
    
    results.view.exists = true;
    results.view.recordCount = parseInt(viewResult.rows[0].count);
    results.view.passed = results.view.recordCount === results.translations.expected;
    
    console.log(`  View exists: ${results.view.exists ? '✅' : '❌'}`);
    console.log(`  Record count: ${results.view.recordCount}`);
    console.log(`  Status: ${results.view.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Test 4: Check critical content
    console.log('\n🔑 Test 4: Critical Content Verification');
    const criticalKeys = ['credit_final', 'credit_warning'];
    let criticalPassed = true;
    
    for (const key of criticalKeys) {
      const result = await pool.query(`
        SELECT ct.language_code, ct.content_value
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.content_key = $1 AND ci.screen_location = 'credit_step4'
        ORDER BY ct.language_code
      `, [key]);
      
      const found = result.rows.length === 3; // Should have 3 languages
      console.log(`  ${key}: ${found ? '✅' : '❌'} (${result.rows.length}/3 languages)`);
      
      if (!found) {
        criticalPassed = false;
      }
    }
    
    // Test 5: Sample content preview
    console.log('\n📄 Test 5: Sample Content Preview');
    const sampleResult = await pool.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        LEFT(ct.content_value, 50) as preview
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_step4'
        AND ci.content_key IN ('credit_final', 'credit_warning')
      ORDER BY ci.content_key, ct.language_code
      LIMIT 6
    `);
    
    console.log('  Sample translations:');
    for (const row of sampleResult.rows) {
      console.log(`    ${row.content_key} [${row.language_code}]: "${row.preview}..."`);
    }
    
    // Overall result
    allTestsPassed = 
      results.contentItems.passed &&
      results.translations.passed &&
      results.view.passed &&
      results.keyIntegrity.passed &&
      results.languageCoverage.passed &&
      criticalPassed;
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 MIGRATION TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`Content Items: ${results.contentItems.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Translations: ${results.translations.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Database View: ${results.view.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Key Integrity: ${results.keyIntegrity.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Language Coverage: ${results.languageCoverage.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Critical Content: ${criticalPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('=' .repeat(60));
    console.log(`OVERALL: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('=' .repeat(60));
    
    if (!allTestsPassed) {
      console.log('\n⚠️  MIGRATION NEEDS ATTENTION');
      console.log('Please review the failed tests above and ensure the migration ran correctly.');
    } else {
      console.log('\n✅ MIGRATION SUCCESSFUL');
      console.log('All credit_step4 content has been properly created in the database.');
    }
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    if (error.code === '42P01') {
      console.error('⚠️  View does not exist. Please run the migration first.');
    }
    allTestsPassed = false;
  } finally {
    await pool.end();
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Run the test
testMigration().catch(console.error);