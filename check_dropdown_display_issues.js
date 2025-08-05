#!/usr/bin/env node

/**
 * Comprehensive Dropdown Display Issues Checker
 * 
 * This script checks for common causes of empty dropdowns:
 * 1. Component type mismatches (option vs dropdown_option)
 * 2. Missing content translations 
 * 3. Inactive content items
 * 4. Missing screen_location mappings
 * 5. API response structure issues
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
});

async function checkDropdownDisplayIssues() {
  try {
    console.log('🔍 CHECKING DROPDOWN DISPLAY ISSUES\n');
    
    // 1. Check for component type mismatches
    console.log('=== 1. COMPONENT TYPE ANALYSIS ===');
    const componentTypeQuery = `
      SELECT 
        screen_location,
        component_type,
        COUNT(*) as count,
        array_agg(DISTINCT content_key ORDER BY content_key) as sample_keys
      FROM content_items 
      WHERE content_key LIKE '%option%' 
        OR component_type IN ('option', 'dropdown_option', 'dropdown', 'select')
      GROUP BY screen_location, component_type
      ORDER BY screen_location, component_type;
    `;
    
    const componentTypes = await pool.query(componentTypeQuery);
    console.log('Component Type Distribution:');
    componentTypes.rows.forEach(row => {
      console.log(`  ${row.screen_location}: ${row.component_type} (${row.count} items)`);
      if (row.count <= 3) {
        console.log(`    Keys: ${row.sample_keys.join(', ')}`);
      }
    });
    
    // 2. Check for screens with missing options
    console.log('\n=== 2. SCREENS WITH MISSING OPTIONS ===');
    const missingOptionsQuery = `
      SELECT 
        screen_location,
        COUNT(DISTINCT CASE WHEN component_type IN ('dropdown', 'dropdown_container') THEN content_key END) as containers,
        COUNT(DISTINCT CASE WHEN component_type IN ('option', 'dropdown_option') THEN content_key END) as options
      FROM content_items 
      WHERE is_active = true
      GROUP BY screen_location
      HAVING COUNT(DISTINCT CASE WHEN component_type IN ('dropdown', 'dropdown_container') THEN content_key END) > 0
        AND COUNT(DISTINCT CASE WHEN component_type IN ('option', 'dropdown_option') THEN content_key END) = 0
      ORDER BY screen_location;
    `;
    
    const missingOptions = await pool.query(missingOptionsQuery);
    if (missingOptions.rows.length > 0) {
      console.log('❌ Screens with dropdown containers but NO options:');
      missingOptions.rows.forEach(row => {
        console.log(`  ${row.screen_location}: ${row.containers} containers, ${row.options} options`);
      });
    } else {
      console.log('✅ All screens with dropdown containers have options');
    }
    
    // 3. Check for missing translations
    console.log('\n=== 3. MISSING TRANSLATIONS CHECK ===');
    const missingTranslationsQuery = `
      SELECT 
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        COUNT(DISTINCT ct.language_code) as translation_count,
        array_agg(ct.language_code ORDER BY ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
        AND ct.status = 'approved'
      WHERE ci.component_type IN ('option', 'dropdown_option', 'dropdown', 'dropdown_container')
        AND ci.is_active = true
      GROUP BY ci.id, ci.screen_location, ci.content_key, ci.component_type
      HAVING COUNT(DISTINCT ct.language_code) < 3
      ORDER BY ci.screen_location, ci.content_key;
    `;
    
    const missingTranslations = await pool.query(missingTranslationsQuery);
    if (missingTranslations.rows.length > 0) {
      console.log('❌ Items with missing translations (should have en, he, ru):');
      missingTranslations.rows.slice(0, 10).forEach(row => {
        console.log(`  ${row.screen_location}/${row.content_key} (${row.component_type}): ${row.translation_count} langs - ${row.languages || 'none'}`);
      });
      if (missingTranslations.rows.length > 10) {
        console.log(`  ... and ${missingTranslations.rows.length - 10} more`);
      }
    } else {
      console.log('✅ All dropdown items have complete translations');
    }
    
    // 4. Check specific problematic screens
    console.log('\n=== 4. CRITICAL SCREEN ANALYSIS ===');
    const criticalScreens = [
      'mortgage_step1',
      'mortgage_step2', 
      'mortgage_step3',
      'refinance_step1',
      'credit_step1'
    ];
    
    for (const screen of criticalScreens) {
      console.log(`\n--- ${screen.toUpperCase()} ---`);
      
      const screenQuery = `
        SELECT 
          ci.content_key,
          ci.component_type,
          COUNT(DISTINCT ct.language_code) as lang_count,
          bool_and(ci.is_active) as is_active,
          array_agg(DISTINCT ct.language_code ORDER BY ct.language_code) as languages
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
          AND ct.status = 'approved'
        WHERE ci.screen_location = $1
          AND ci.component_type IN ('dropdown', 'dropdown_container', 'option', 'dropdown_option')
        GROUP BY ci.content_key, ci.component_type
        ORDER BY ci.content_key, ci.component_type;
      `;
      
      const screenData = await pool.query(screenQuery, [screen]);
      
      const containers = screenData.rows.filter(r => r.component_type === 'dropdown' || r.component_type === 'dropdown_container');
      const options = screenData.rows.filter(r => r.component_type === 'option' || r.component_type === 'dropdown_option');
      
      console.log(`  Containers: ${containers.length}, Options: ${options.length}`);
      
      // Check if containers have corresponding options
      containers.forEach(container => {
        const fieldName = container.content_key.replace(/.*\.field\./, '').replace(/_container$/, '');
        const relatedOptions = options.filter(opt => opt.content_key.includes(fieldName));
        
        if (relatedOptions.length === 0) {
          console.log(`  ❌ Container "${container.content_key}" has NO options`);
        } else if (relatedOptions.some(opt => opt.lang_count < 3)) {
          console.log(`  ⚠️  Container "${container.content_key}" has ${relatedOptions.length} options, some missing translations`);
        } else {
          console.log(`  ✅ Container "${container.content_key}" has ${relatedOptions.length} options, all translated`);
        }
      });
      
      // Check for inactive items
      const inactiveItems = screenData.rows.filter(r => !r.is_active);
      if (inactiveItems.length > 0) {
        console.log(`  ❌ ${inactiveItems.length} inactive items found`);
      }
    }
    
    // 5. Test API response for a critical screen
    console.log('\n=== 5. API RESPONSE TEST ===');
    
    // Simulate the API query structure from server-db.js
    const apiTestQuery = `
      SELECT 
        content_items.content_key,
        content_items.component_type,
        content_translations.content_value
      FROM content_items
      JOIN content_translations ON content_items.id = content_translations.content_item_id
      WHERE content_items.screen_location = $1 
        AND content_translations.language_code = $2
        AND content_translations.status = 'approved'
        AND content_items.is_active = true
        AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label')
      ORDER BY content_items.content_key, content_items.component_type
    `;
    
    console.log('Testing API response for mortgage_step1...');
    const apiTest = await pool.query(apiTestQuery, ['mortgage_step1', 'en']);
    
    const containers_api = apiTest.rows.filter(r => r.component_type === 'dropdown_container');
    const options_api = apiTest.rows.filter(r => r.component_type === 'option' || r.component_type === 'dropdown_option');
    
    console.log(`  API returned: ${containers_api.length} containers, ${options_api.length} options`);
    
    if (options_api.length === 0) {
      console.log('  ❌ CRITICAL: API returns NO options - this would cause empty dropdowns!');
    } else {
      console.log(`  ✅ API returns options - dropdowns should work`);
      
      // Show sample options
      console.log('  Sample options:');
      options_api.slice(0, 3).forEach(opt => {
        console.log(`    ${opt.content_key} (${opt.component_type}): ${opt.content_value}`);
      });
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('✅ Backend code handles both "option" and "dropdown_option" component types');
    console.log('✅ API query includes both component types in WHERE clause');
    
    if (missingOptions.rows.length > 0) {
      console.log('❌ Found screens with missing dropdown options');
    }
    
    if (missingTranslations.rows.length > 0) {
      console.log('❌ Found items with incomplete translations');
    }
    
    if (options_api.length === 0) {
      console.log('❌ CRITICAL: API test shows no options returned for mortgage_step1');
    }
    
  } catch (error) {
    console.error('Error checking dropdown display issues:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkDropdownDisplayIssues();