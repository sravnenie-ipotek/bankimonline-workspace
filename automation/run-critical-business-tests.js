#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CRITICAL BUSINESS LOGIC TESTS EXECUTION');
console.log('=' .repeat(60));
console.log('Requirements:');
console.log('✓ All 4 services MUST complete 4 steps');
console.log('✓ All dropdowns MUST work');
console.log('✓ Visual tests MUST pass');
console.log('✓ Font consistency MUST be maintained');
console.log('=' .repeat(60));

const testResults = {
  fourSteps: { passed: [], failed: [] },
  dropdowns: { passed: [], failed: [] },
  visual: { passed: [], failed: [] },
  fonts: { passed: [], failed: [] }
};

// Critical test files
const criticalTests = [
  // 4-Step Business Logic Tests
  {
    category: 'fourSteps',
    name: 'Mortgage 4-Step Flow',
    file: 'cypress/e2e/mortgage-4-steps-complete.cy.ts'
  },
  {
    category: 'fourSteps',
    name: 'Credit 4-Step Flow',
    file: 'cypress/e2e/credit-4-steps-complete.cy.ts'
  },
  {
    category: 'fourSteps',
    name: 'Refinance Mortgage 4-Step Flow',
    file: 'cypress/e2e/refinance-mortgage-4-steps.cy.ts'
  },
  {
    category: 'fourSteps',
    name: 'Refinance Credit 4-Step Flow',
    file: 'cypress/e2e/refinance-credit-4-steps.cy.ts'
  },
  
  // Dropdown Tests
  {
    category: 'dropdowns',
    name: 'Comprehensive Dropdown Validation',
    file: 'cypress/e2e/comprehensive-dropdown-test.cy.ts'
  },
  {
    category: 'dropdowns',
    name: 'Mortgage Dropdown Validation',
    file: 'cypress/e2e/mortgage-dropdown-validation.cy.ts'
  },
  
  // Visual Tests
  {
    category: 'visual',
    name: 'Mortgage Visual Test',
    file: 'cypress/e2e/visual/mortgage-visual.cy.ts'
  },
  {
    category: 'visual',
    name: 'Credit Visual Test',
    file: 'cypress/e2e/visual/credit-visual.cy.ts'
  },
  {
    category: 'visual',
    name: 'Refinance Mortgage Visual',
    file: 'cypress/e2e/visual/refinance-mortgage-visual.cy.ts'
  },
  {
    category: 'visual',
    name: 'Refinance Credit Visual',
    file: 'cypress/e2e/visual/refinance-credit-visual.cy.ts'
  },
  
  // Font Consistency
  {
    category: 'fonts',
    name: 'Font Consistency Validator',
    file: 'cypress/e2e/font-consistency-validator.cy.ts'
  },
  
  // Critical Business Logic
  {
    category: 'fourSteps',
    name: 'All Services Business Logic',
    file: 'CRITICAL-BUSINESS-LOGIC-TESTS.cy.ts'
  }
];

// Cypress configuration
const cypressConfig = {
  e2e: {
    baseUrl: 'http://localhost:5175',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    viewportWidth: 1920,
    viewportHeight: 1080
  }
};

// Save config
const configPath = path.join(__dirname, 'cypress.config.json');
fs.writeFileSync(configPath, JSON.stringify(cypressConfig, null, 2));

// Create screenshots directory
const screenshotDir = path.join(__dirname, 'screenshots', `critical-${Date.now()}`);
fs.mkdirSync(screenshotDir, { recursive: true });

// Check servers
console.log('\n🔍 Checking servers...');
try {
  execSync('curl -s http://localhost:5173 > /dev/null', { timeout: 2000 });
  console.log('✅ Frontend running on port 5173');
} catch (err) {
  console.log('❌ Frontend not running! Please start with: cd mainapp && npm run dev');
  process.exit(1);
}

try {
  execSync('curl -s http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage > /dev/null', { timeout: 2000 });
  console.log('✅ Backend API running on port 8003');
} catch (err) {
  console.log('❌ Backend not running! Please start with: node server/server-db.js');
  process.exit(1);
}

// Run tests
console.log('\n🧪 Running Critical Business Logic Tests...\n');

let totalPassed = 0;
let totalFailed = 0;

criticalTests.forEach((test, index) => {
  console.log(`[${index + 1}/${criticalTests.length}] ${test.name}`);
  console.log('-'.repeat(50));
  
  // Check if test file exists
  const testPath = path.join(__dirname, test.file);
  if (!fs.existsSync(testPath)) {
    console.log(`  ⚠️ Test file not found: ${test.file}`);
    testResults[test.category].failed.push(test.name);
    totalFailed++;
    return;
  }
  
  try {
    // Run test
    const output = execSync(
      `npx cypress run --spec "${test.file}" --config-file cypress.config.json --config screenshotsFolder="${screenshotDir}"`,
      { 
        cwd: __dirname,
        encoding: 'utf8',
        timeout: 60000
      }
    );
    
    // Check if passed
    if (output.includes('All specs passed') || output.includes('1 of 1 passed') || !output.includes('failed')) {
      console.log(`  ✅ PASSED`);
      testResults[test.category].passed.push(test.name);
      totalPassed++;
    } else {
      console.log(`  ❌ FAILED`);
      testResults[test.category].failed.push(test.name);
      totalFailed++;
      
      // Extract failure details
      const failureMatch = output.match(/(\d+) of (\d+) failed/);
      if (failureMatch) {
        console.log(`     ${failureMatch[0]}`);
      }
    }
  } catch (err) {
    console.log(`  ❌ ERROR`);
    testResults[test.category].failed.push(test.name);
    totalFailed++;
    
    // Try to extract error info
    const errorStr = err.toString();
    if (errorStr.includes('failed')) {
      const match = errorStr.match(/\d+ of \d+ failed/);
      if (match) {
        console.log(`     ${match[0]}`);
      }
    }
  }
  
  console.log('');
});

// Generate report
console.log('=' .repeat(60));
console.log('📊 CRITICAL TEST RESULTS');
console.log('=' .repeat(60));

// 4-Step Tests
console.log('\n🔢 4-STEP BUSINESS LOGIC TESTS:');
console.log(`  ✅ Passed: ${testResults.fourSteps.passed.length}`);
testResults.fourSteps.passed.forEach(test => console.log(`     - ${test}`));
console.log(`  ❌ Failed: ${testResults.fourSteps.failed.length}`);
testResults.fourSteps.failed.forEach(test => console.log(`     - ${test}`));

// Dropdown Tests
console.log('\n🔽 DROPDOWN VALIDATION TESTS:');
console.log(`  ✅ Passed: ${testResults.dropdowns.passed.length}`);
testResults.dropdowns.passed.forEach(test => console.log(`     - ${test}`));
console.log(`  ❌ Failed: ${testResults.dropdowns.failed.length}`);
testResults.dropdowns.failed.forEach(test => console.log(`     - ${test}`));

// Visual Tests
console.log('\n🎨 VISUAL REGRESSION TESTS:');
console.log(`  ✅ Passed: ${testResults.visual.passed.length}`);
testResults.visual.passed.forEach(test => console.log(`     - ${test}`));
console.log(`  ❌ Failed: ${testResults.visual.failed.length}`);
testResults.visual.failed.forEach(test => console.log(`     - ${test}`));

// Font Tests
console.log('\n🔤 FONT CONSISTENCY TESTS:');
console.log(`  ✅ Passed: ${testResults.fonts.passed.length}`);
testResults.fonts.passed.forEach(test => console.log(`     - ${test}`));
console.log(`  ❌ Failed: ${testResults.fonts.failed.length}`);
testResults.fonts.failed.forEach(test => console.log(`     - ${test}`));

// Overall summary
console.log('\n' + '=' .repeat(60));
console.log('📈 OVERALL SUMMARY');
console.log('=' .repeat(60));
console.log(`Total Tests: ${totalPassed + totalFailed}`);
console.log(`✅ Passed: ${totalPassed}`);
console.log(`❌ Failed: ${totalFailed}`);
console.log(`Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);

// Critical failures
const criticalFailures = [];
if (testResults.fourSteps.failed.length > 0) {
  criticalFailures.push('4-Step Business Logic');
}
if (testResults.dropdowns.failed.length > 0) {
  criticalFailures.push('Dropdown Validation');
}
if (testResults.visual.failed.length > 0) {
  criticalFailures.push('Visual Regression');
}
if (testResults.fonts.failed.length > 0) {
  criticalFailures.push('Font Consistency');
}

if (criticalFailures.length > 0) {
  console.log('\n🚨 CRITICAL FAILURES DETECTED:');
  criticalFailures.forEach(failure => {
    console.log(`  ❌ ${failure}`);
  });
  console.log('\n⚠️ These are MANDATORY requirements that MUST pass!');
}

// Save report
const reportPath = path.join(__dirname, 'reports', `critical-test-report-${Date.now()}.json`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  results: testResults,
  summary: {
    total: totalPassed + totalFailed,
    passed: totalPassed,
    failed: totalFailed,
    successRate: Math.round((totalPassed / (totalPassed + totalFailed)) * 100)
  },
  criticalFailures
}, null, 2));

console.log(`\n📄 Report saved to: ${reportPath}`);
console.log(`📸 Screenshots saved to: ${screenshotDir}`);

// Exit code based on critical failures
if (criticalFailures.length > 0) {
  console.log('\n❌ CRITICAL TESTS FAILED - NOT READY FOR PRODUCTION');
  process.exit(1);
} else {
  console.log('\n✅ ALL CRITICAL TESTS PASSED - READY FOR PRODUCTION');
  process.exit(0);
}