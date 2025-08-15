#!/usr/bin/env node
/**
 * Test critical dropdown endpoints for deployment validation
 */

require('dotenv').config();

const criticalScreens = [
  { screen: 'mortgage_step3', expectedMinItems: 50 },
  { screen: 'credit_step3', expectedMinItems: 20 },
  { screen: 'refinance_step3', expectedMinItems: 20 }
];

const languages = ['en', 'he', 'ru'];

async function testDropdownEndpoints() {
  console.log('🧪 Testing Critical Dropdown Endpoints...\n');
  
  let failures = 0;
  let totalTests = 0;
  
  for (const { screen, expectedMinItems } of criticalScreens) {
    for (const language of languages) {
      totalTests++;
      
      try {
        const response = await fetch(`http://localhost:8003/api/dropdowns/${screen}/${language}`);
        
        if (!response.ok) {
          console.log(`❌ ${screen}/${language}: HTTP ${response.status}`);
          failures++;
          continue;
        }
        
        const data = await response.json();
        
        if (data.status !== 'success') {
          console.log(`❌ ${screen}/${language}: API Error - ${data.status}`);
          failures++;
          continue;
        }
        
        const totalItems = data.performance?.total_items || 0;
        const dropdownsFound = data.performance?.dropdowns_found || 0;
        
        if (totalItems < expectedMinItems) {
          console.log(`❌ ${screen}/${language}: Only ${totalItems} items (expected ≥${expectedMinItems})`);
          failures++;
          continue;
        }
        
        // Check for critical dropdown keys
        const options = data.options || {};
        const criticalKeys = getCriticalKeys(screen);
        
        let missingKeys = [];
        for (const key of criticalKeys) {
          if (!options[key] || options[key].length === 0) {
            missingKeys.push(key);
          }
        }
        
        if (missingKeys.length > 0) {
          console.log(`⚠️  ${screen}/${language}: Missing keys: ${missingKeys.join(', ')}`);
        } else {
          console.log(`✅ ${screen}/${language}: ${totalItems} items, ${dropdownsFound} dropdowns`);
        }
        
      } catch (error) {
        console.log(`❌ ${screen}/${language}: ${error.message}`);
        failures++;
      }
    }
  }
  
  console.log(`\n📊 Results: ${totalTests - failures}/${totalTests} tests passed`);
  
  if (failures > 0) {
    console.log(`\n❌ ${failures} dropdown tests failed - check server configuration and database connectivity`);
    process.exit(1);
  } else {
    console.log('\n✅ All critical dropdown endpoints working correctly');
  }
}

function getCriticalKeys(screen) {
  switch (screen) {
    case 'mortgage_step3':
      return ['mortgage_step3_main_source', 'mortgage_step3_additional_income'];
    case 'credit_step3':
      return ['credit_step3_main_source', 'credit_step3_additional_income'];
    case 'refinance_step3':
      return ['refinance_step3_main_source', 'refinance_step3_additional_income'];
    default:
      return [];
  }
}

// Check if server is running
fetch('http://localhost:8003/health')
  .then(() => testDropdownEndpoints())
  .catch(() => {
    console.error('❌ Server not running on port 8003. Start with: npm start');
    process.exit(1);
  });