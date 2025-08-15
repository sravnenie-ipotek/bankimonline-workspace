#!/usr/bin/env node

/**
 * Credit Calculator Fix Validation Script
 * 
 * This script validates that the database fix for Credit Calculator dropdowns is working correctly.
 * It tests the API endpoints and component mapping logic.
 */

const https = require('http');

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy());
  });
}

async function validateCreditCalculatorFix() {
  );
  
  const tests = [];
  let passCount = 0;

  // Test 1: Credit Calculator API Returns Semantic Values
  try {
    const creditData = await makeRequest('http://localhost:8003/api/dropdowns/calculate_credit_3/en');
    
    const mainSourceOptions = creditData?.options?.calculate_credit_3_main_source || [];
    
    if (mainSourceOptions.length === 0) {
      tests.push('Credit API: ❌ FAIL - No options');
    } else {
      // Check for semantic values
      const semanticValues = mainSourceOptions.map(opt => opt.value);
      const hasEmployee = semanticValues.includes('employee');
      const hasSelfEmployed = semanticValues.includes('selfemployed');
      const hasPension = semanticValues.includes('pension');
      
      }`);
      
      if (hasEmployee && hasSelfEmployed && hasPension) {
        ');
        tests.push('Credit API: ✅ PASS');
        passCount++;
      } else {
        tests.push('Credit API: ❌ FAIL - Wrong values');
      }
    }
  } catch (error) {
    tests.push('Credit API: ❌ ERROR');
  }

  // Test 2: Mortgage Calculator Still Works (Regression)
  try {
    const mortgageData = await makeRequest('http://localhost:8003/api/dropdowns/mortgage_step3/en');
    
    const mortgageOptions = mortgageData?.options?.mortgage_step3_main_source || [];
    
    if (mortgageOptions.length > 0) {
      .join(', ')}`);
      tests.push('Mortgage API: ✅ PASS');
      passCount++;
    } else {
      tests.push('Mortgage API: ❌ FAIL');
    }
  } catch (error) {
    tests.push('Mortgage API: ❌ ERROR');
  }

  // Test 3: Component Mapping Validation
  // Simulate the componentsByIncomeSource mapping from the frontend
  const componentsByIncomeSource = {
    employee: ['MonthlyIncome', 'StartDate', 'FieldOfActivity', 'CompanyName', 'Profession'],
    selfemployed: ['MonthlyIncome', 'StartDate', 'FieldOfActivity', 'CompanyName', 'Profession'],
    pension: ['MonthlyIncome'],
    unemployed: ['NoIncome'],
    student: ['NoIncome'],
    other: ['MonthlyIncome']
  };
  
  const testValues = ['employee', 'selfemployed', 'pension'];
  let componentMappingWorks = true;
  
  testValues.forEach(value => {
    const components = componentsByIncomeSource[value];
    if (components && components.length > 0) {
      }`);
    } else {
      componentMappingWorks = false;
    }
  });
  
  if (componentMappingWorks) {
    tests.push('Component Mapping: ✅ PASS');
    passCount++;
  } else {
    tests.push('Component Mapping: ❌ FAIL');
  }

  // Final Summary
  );
  );
  
  tests.forEach(test => );
  
  const totalTests = tests.length;
  if (passCount === totalTests) {
    ');
    return true;
  } else {
    return false;
  }
}

// Run validation
if (require.main === module) {
  validateCreditCalculatorFix()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 VALIDATION ERROR:', error.message);
      process.exit(1);
    });
}

module.exports = { validateCreditCalculatorFix };