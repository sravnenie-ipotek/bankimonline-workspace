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
  try {
    // Test 1: Database Content Check
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
    // Test 2: API Response Check
    const apiResponse = await fetch('http://localhost:8003/api/dropdowns/credit_step3/he');
    const apiData = await apiResponse.json();

    const availableDropdowns = Object.keys(apiData.options || {});
    availableDropdowns.forEach(key => {
      const optionCount = apiData.options[key]?.length || 0;
      });

    // Test 3: Required Dropdowns Check
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
        } else {
        missingDropdowns.push(dropdown);
        }
    });

    // Test 4: Additional Income Default Option Check
    const additionalIncomeOptions = apiData.options?.credit_step3_additional_income || [];
    if (additionalIncomeOptions.length > 0) {
      const firstOption = additionalIncomeOptions[0];
      `);
      
      if (firstOption.value === 'no_additional_income') {
        } else {
        ');
      }
    } else {
      }

    // Test 5: Field Name Mapping Check
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
        → ${mapping.apiKey}: ${optionCount} options`);
      } else {
        → ${mapping.apiKey}: MISSING or NO OPTIONS`);
      }
    });

    // Test 6: Translation Coverage Check
    const languages = ['he', 'en', 'ru'];
    
    for (const lang of languages) {
      try {
        const langResponse = await fetch(`http://localhost:8003/api/dropdowns/credit_step3/${lang}`);
        const langData = await langResponse.json();
        const dropdownCount = Object.keys(langData.options || {}).length;
        }: ${dropdownCount} dropdowns available`);
      } catch (err) {
        }: ❌ Error - ${err.message}`);
      }
    }

    // Summary Report
    if (missingDropdowns.length === 0) {
      } else {
      }`);
    }
    
    const totalOptions = presentDropdowns.reduce((sum, dropdown) => sum + dropdown.count, 0);
    if (presentDropdowns.find(d => d.name === 'credit_step3_professional_sphere')) {
      } else {
      }

    const firstIncomeOption = apiData.options?.credit_step3_additional_income?.[0];
    if (firstIncomeOption?.value === 'no_additional_income') {
      } else {
      }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the test
testCreditStep3Dropdowns();