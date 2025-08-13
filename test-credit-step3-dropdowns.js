#!/usr/bin/env node
/**
 * Test script to verify all credit step 3 dropdown fixes
 * Tests database content, API responses, and component field mappings
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: false
});

async function testCreditStep3Dropdowns() {
  console.log('🧪 Testing Credit Step 3 Dropdown Fixes\n');

  try {
    // Test 1: Database Content Check
    console.log('📊 Test 1: Database Content Check');
    const dbResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN content_key LIKE '%field_of_activity%' THEN 1 END) as field_of_activity_count,
        COUNT(CASE WHEN content_key LIKE '%professional_sphere%' THEN 1 END) as professional_sphere_count,
        COUNT(CASE WHEN content_key LIKE '%additional_income%' THEN 1 END) as additional_income_count,
        COUNT(CASE WHEN content_key LIKE '%main_source%' THEN 1 END) as main_source_count,
        COUNT(CASE WHEN content_key LIKE '%obligations%' THEN 1 END) as obligations_count
      FROM content_items 
      WHERE screen_location = 'credit_step3' 
      AND component_type IN ('dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label')
    `);

    const counts = dbResult.rows[0];
    console.log(`  ✓ Field of Activity: ${counts.field_of_activity_count} items`);
    console.log(`  ✓ Professional Sphere: ${counts.professional_sphere_count} items`);
    console.log(`  ✓ Additional Income: ${counts.additional_income_count} items`);
    console.log(`  ✓ Main Source: ${counts.main_source_count} items`);
    console.log(`  ✓ Obligations: ${counts.obligations_count} items`);

    // Test 2: API Response Check
    console.log('\n🌐 Test 2: API Response Check');
    const apiResponse = await fetch('http://localhost:8003/api/dropdowns/credit_step3/he');
    const apiData = await apiResponse.json();

    console.log(`  Status: ${apiData.status}`);
    console.log(`  Screen: ${apiData.screen_location}`);
    console.log(`  Language: ${apiData.language_code}`);
    console.log(`  Total dropdowns: ${apiData.dropdowns?.length || 0}`);
    
    const availableDropdowns = Object.keys(apiData.options || {});
    console.log('  Available dropdown keys:');
    availableDropdowns.forEach(key => {
      const optionCount = apiData.options[key]?.length || 0;
      console.log(`    - ${key}: ${optionCount} options`);
    });

    // Test 3: Required Dropdowns Check
    console.log('\n✅ Test 3: Required Dropdowns Check');
    const requiredDropdowns = [
      'credit_step3_main_source',
      'credit_step3_additional_income', 
      'credit_step3_obligations',
      'credit_step3_professional_sphere' // The missing one we fixed
    ];

    const missingDropdowns = [];
    const presentDropdowns = [];

    requiredDropdowns.forEach(dropdown => {
      if (availableDropdowns.includes(dropdown)) {
        const optionCount = apiData.options[dropdown]?.length || 0;
        presentDropdowns.push({ name: dropdown, count: optionCount });
        console.log(`  ✓ ${dropdown}: ${optionCount} options`);
      } else {
        missingDropdowns.push(dropdown);
        console.log(`  ❌ ${dropdown}: MISSING`);
      }
    });

    // Test 4: Additional Income Default Option Check
    console.log('\n🏆 Test 4: Additional Income Default Option Check');
    const additionalIncomeOptions = apiData.options?.credit_step3_additional_income || [];
    if (additionalIncomeOptions.length > 0) {
      const firstOption = additionalIncomeOptions[0];
      console.log(`  First option: "${firstOption.label}" (value: ${firstOption.value})`);
      
      if (firstOption.value === 'no_additional_income') {
        console.log('  ✅ "No additional income" appears first as requested');
      } else {
        console.log('  ⚠️ "No additional income" is not first (should be fixed)');
      }
    } else {
      console.log('  ❌ No additional income options found');
    }

    // Test 5: Field Name Mapping Check
    console.log('\n🔧 Test 5: Component Field Name Mapping Check');
    const fieldMappings = [
      { component: 'MainSourceOfIncome', field: 'main_source', apiKey: 'credit_step3_main_source' },
      { component: 'AdditionalIncome', field: 'additional_income', apiKey: 'credit_step3_additional_income' },
      { component: 'Obligation', field: 'obligations', apiKey: 'credit_step3_obligations' },
      { component: 'FieldOfActivity', field: 'professional_sphere', apiKey: 'credit_step3_professional_sphere' }
    ];

    fieldMappings.forEach(mapping => {
      const hasApiKey = availableDropdowns.includes(mapping.apiKey);
      const optionCount = hasApiKey ? apiData.options[mapping.apiKey]?.length || 0 : 0;
      
      if (hasApiKey && optionCount > 0) {
        console.log(`  ✅ ${mapping.component} (${mapping.field}) → ${mapping.apiKey}: ${optionCount} options`);
      } else {
        console.log(`  ❌ ${mapping.component} (${mapping.field}) → ${mapping.apiKey}: MISSING or NO OPTIONS`);
      }
    });

    // Test 6: Translation Coverage Check
    console.log('\n🌐 Test 6: Translation Coverage Check');
    const languages = ['he', 'en', 'ru'];
    
    for (const lang of languages) {
      try {
        const langResponse = await fetch(`http://localhost:8003/api/dropdowns/credit_step3/${lang}`);
        const langData = await langResponse.json();
        const dropdownCount = Object.keys(langData.options || {}).length;
        console.log(`  ${lang.toUpperCase()}: ${dropdownCount} dropdowns available`);
      } catch (err) {
        console.log(`  ${lang.toUpperCase()}: ❌ Error - ${err.message}`);
      }
    }

    // Summary Report
    console.log('\n📋 SUMMARY REPORT');
    console.log('================');
    
    if (missingDropdowns.length === 0) {
      console.log('✅ ALL REQUIRED DROPDOWNS PRESENT');
    } else {
      console.log(`❌ MISSING DROPDOWNS: ${missingDropdowns.join(', ')}`);
    }
    
    const totalOptions = presentDropdowns.reduce((sum, dropdown) => sum + dropdown.count, 0);
    console.log(`📊 Total dropdown options: ${totalOptions}`);
    
    if (presentDropdowns.find(d => d.name === 'credit_step3_professional_sphere')) {
      console.log('🎯 CRITICAL FIX VERIFIED: Professional field dropdown is now available');
    } else {
      console.log('❌ CRITICAL ISSUE: Professional field dropdown still missing');
    }

    const firstIncomeOption = apiData.options?.credit_step3_additional_income?.[0];
    if (firstIncomeOption?.value === 'no_additional_income') {
      console.log('🏅 ORDERING FIX VERIFIED: "No additional income" appears first');
    } else {
      console.log('⚠️ ORDERING ISSUE: "No additional income" not first');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the test
testCreditStep3Dropdowns();