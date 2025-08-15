/**
 * SYSTEMATIC SOLUTION: Prevent Screen Location Regression
 * 
 * This script validates that all form components use explicit screen locations
 * instead of the dangerous 'auto-detect' pattern that causes dropdown failures.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SCREEN LOCATION VALIDATION - Preventing Dropdown Regressions\n');

// Components that should use getComponentsByIncomeSource with explicit screen location
const formsToCheck = [
  {
    path: 'src/pages/Services/pages/CalculateMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx',
    expectedScreenLocation: 'mortgage_step3'
  },
  {
    path: 'src/pages/Services/pages/RefinanceMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx', 
    expectedScreenLocation: 'refinance_step3'
  },
  {
    path: 'src/pages/Services/pages/OtherBorrowers/SecondStep/SecondStepForm/SecondStepForm.tsx',
    expectedScreenLocation: 'other_borrowers_step2'
  },
  {
    path: 'src/pages/Services/pages/OtherBorrowers/Modals/SourceOfIncomeModal/SourceOfIncomeForm/SourceOfIncomeForm.tsx',
    expectedScreenLocation: 'other_borrowers_step2'
  }
];

let allPassed = true;
let issuesFound = [];

formsToCheck.forEach(form => {
  const fullPath = path.join(__dirname, form.path);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${form.path}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check 1: Should NOT import default componentsByIncomeSource (causes auto-detect bug)
  const hasDefaultImport = content.includes('import { componentsByIncomeSource }');
  
  // Check 2: Should import getComponentsByIncomeSource function
  const hasFunctionImport = content.includes('import { getComponentsByIncomeSource }');
  
  // Check 3: Should call function with explicit screen location
  const hasExplicitCall = content.includes(`getComponentsByIncomeSource('${form.expectedScreenLocation}')`);
  
  // Check 4: Should have fix comment
  const hasFixComment = content.includes('✅ FIXED: Use screen-specific components');
  
  console.log(`📋 Checking: ${form.path}`);
  
  if (hasDefaultImport) {
    console.log(`  ❌ REGRESSION DETECTED: Uses dangerous default import (causes auto-detect bug)`);
    issuesFound.push(`${form.path}: Uses default import - causes dropdown failures`);
    allPassed = false;
  } else {
    console.log(`  ✅ No default import (good)`);
  }
  
  if (hasFunctionImport) {
    console.log(`  ✅ Uses function import (correct)`);
  } else {
    console.log(`  ❌ Missing function import`);
    issuesFound.push(`${form.path}: Missing getComponentsByIncomeSource import`);
    allPassed = false;
  }
  
  if (hasExplicitCall) {
    console.log(`  ✅ Uses explicit screen location: '${form.expectedScreenLocation}'`);
  } else {
    console.log(`  ❌ Missing explicit screen location call`);
    issuesFound.push(`${form.path}: Missing explicit screen location '${form.expectedScreenLocation}'`);
    allPassed = false;
  }
  
  if (hasFixComment) {
    console.log(`  ✅ Has fix documentation`);
  } else {
    console.log(`  ⚠️  Missing fix comment (not critical)`);
  }
  
  console.log('');
});

console.log('='.repeat(80));
if (allPassed) {
  console.log('🎉 ALL FORMS PASSED - No dropdown regression risk detected');
  console.log('✅ All forms use explicit screen locations');
  console.log('✅ No dangerous auto-detect patterns found');
} else {
  console.log('🚨 DROPDOWN REGRESSION RISK DETECTED');
  console.log('❌ Issues found that could cause dropdown failures:');
  issuesFound.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  console.log('');
  console.log('🔧 FIX REQUIRED:');
  console.log('1. Change: import { componentsByIncomeSource }');
  console.log('2. To: import { getComponentsByIncomeSource }'); 
  console.log('3. Add: const componentsByIncomeSource = getComponentsByIncomeSource("screen_location")');
  console.log('4. Replace screen_location with appropriate value (mortgage_step3, etc.)');
}
console.log('='.repeat(80));

process.exit(allPassed ? 0 : 1);
