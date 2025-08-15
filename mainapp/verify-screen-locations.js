/**
 * SYSTEMATIC SOLUTION: Prevent Screen Location Regression
 * 
 * This script validates that all form components use explicit screen locations
 * instead of the dangerous 'auto-detect' pattern that causes dropdown failures.
 */

const fs = require('fs');
const path = require('path');

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
  
  if (hasDefaultImport) {
    `);
    issuesFound.push(`${form.path}: Uses default import - causes dropdown failures`);
    allPassed = false;
  } else {
    `);
  }
  
  if (hasFunctionImport) {
    `);
  } else {
    issuesFound.push(`${form.path}: Missing getComponentsByIncomeSource import`);
    allPassed = false;
  }
  
  if (hasExplicitCall) {
    } else {
    issuesFound.push(`${form.path}: Missing explicit screen location '${form.expectedScreenLocation}'`);
    allPassed = false;
  }
  
  if (hasFixComment) {
    } else {
    `);
  }
  
  });

);
if (allPassed) {
  } else {
  issuesFound.forEach(issue => {
    });
  ');
  ');
}
);

process.exit(allPassed ? 0 : 1);
