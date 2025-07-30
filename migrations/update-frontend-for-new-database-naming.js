#!/usr/bin/env node

/**
 * Update Frontend Dropdown Values to Match New Database Naming
 * This updates numeric values (1, 2, 3) to descriptive names from the database migration
 */

const fs = require('fs').promises;
const path = require('path');

// Mapping based on the database migration
const REPLACEMENT_PATTERNS = [
  // When Money Needed Options - mortgage_step1
  {
    pattern: /WhenDoYouNeedMoneyOptions[\s\S]*?value:\s*['"]1['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]1['"]/, "value: 'next_3_months'"),
    files: ['CalculateMortgage']
  },
  {
    pattern: /WhenDoYouNeedMoneyOptions[\s\S]*?value:\s*['"]2['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]2['"]/, "value: '3_to_6_months'"),
    files: ['CalculateMortgage']
  },
  {
    pattern: /WhenDoYouNeedMoneyOptions[\s\S]*?value:\s*['"]3['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]3['"]/, "value: '6_to_12_months'"),
    files: ['CalculateMortgage']
  },
  {
    pattern: /WhenDoYouNeedMoneyOptions[\s\S]*?value:\s*['"]4['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]4['"]/, "value: 'more_than_12_months'"),
    files: ['CalculateMortgage']
  },
  
  // Type Select Options (Property Type)
  {
    pattern: /TypeSelectOptions[\s\S]*?value:\s*['"]1['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]1['"]/, "value: 'fixed_rate'"),
    files: ['CalculateMortgage']
  },
  {
    pattern: /TypeSelectOptions[\s\S]*?value:\s*['"]2['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]2['"]/, "value: 'variable_rate'"),
    files: ['CalculateMortgage']
  },
  {
    pattern: /TypeSelectOptions[\s\S]*?value:\s*['"]3['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]3['"]/, "value: 'mixed_rate'"),
    files: ['CalculateMortgage']
  },
  {
    pattern: /TypeSelectOptions[\s\S]*?value:\s*['"]4['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]4['"]/, "value: 'not_sure'"),
    files: ['CalculateMortgage']
  },
  
  // Will Be Your First Options
  {
    pattern: /WillBeYourFirstOptions[\s\S]*?value:\s*['"]1['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]1['"]/, "value: 'first_apartment'"),
    files: ['CalculateMortgage']
  },
  {
    pattern: /WillBeYourFirstOptions[\s\S]*?value:\s*['"]2['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]2['"]/, "value: 'not_first_apartment'"),
    files: ['CalculateMortgage']
  },
  {
    pattern: /WillBeYourFirstOptions[\s\S]*?value:\s*['"]3['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]3['"]/, "value: 'investment'"),
    files: ['CalculateMortgage']
  },
  
  // Family Status Options
  {
    pattern: /familyStatusOptions[\s\S]*?value:\s*['"]1['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]1['"]/, "value: 'single'"),
    files: ['FamilyStatus']
  },
  {
    pattern: /familyStatusOptions[\s\S]*?value:\s*['"]2['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]2['"]/, "value: 'married'"),
    files: ['FamilyStatus']
  },
  {
    pattern: /familyStatusOptions[\s\S]*?value:\s*['"]3['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]3['"]/, "value: 'divorced'"),
    files: ['FamilyStatus']
  },
  {
    pattern: /familyStatusOptions[\s\S]*?value:\s*['"]4['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]4['"]/, "value: 'widowed'"),
    files: ['FamilyStatus']
  },
  {
    pattern: /familyStatusOptions[\s\S]*?value:\s*['"]5['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]5['"]/, "value: 'commonlaw_partner'"),
    files: ['FamilyStatus']
  },
  {
    pattern: /familyStatusOptions[\s\S]*?value:\s*['"]6['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]6['"]/, "value: 'other'"),
    files: ['FamilyStatus']
  },
  
  // Education Options
  {
    pattern: /educationOptions[\s\S]*?value:\s*['"]1['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]1['"]/, "value: 'no_high_school_diploma'"),
    files: ['Education']
  },
  {
    pattern: /educationOptions[\s\S]*?value:\s*['"]2['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]2['"]/, "value: 'partial_high_school_diploma'"),
    files: ['Education']
  },
  {
    pattern: /educationOptions[\s\S]*?value:\s*['"]3['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]3['"]/, "value: 'full_high_school_diploma'"),
    files: ['Education']
  },
  {
    pattern: /educationOptions[\s\S]*?value:\s*['"]4['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]4['"]/, "value: 'postsecondary_education'"),
    files: ['Education']
  },
  {
    pattern: /educationOptions[\s\S]*?value:\s*['"]5['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]5['"]/, "value: 'bachelors'"),
    files: ['Education']
  },
  {
    pattern: /educationOptions[\s\S]*?value:\s*['"]6['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]6['"]/, "value: 'masters'"),
    files: ['Education']
  },
  {
    pattern: /educationOptions[\s\S]*?value:\s*['"]7['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]7['"]/, "value: 'doctorate'"),
    files: ['Education']
  },
  
  // Main Source of Income Options
  {
    pattern: /mainSourceOfIncomeOptions[\s\S]*?value:\s*['"]1['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]1['"]/, "value: 'salary'"),
    files: ['MainSourceOfIncome']
  },
  {
    pattern: /mainSourceOfIncomeOptions[\s\S]*?value:\s*['"]2['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]2['"]/, "value: 'business'"),
    files: ['MainSourceOfIncome']
  },
  {
    pattern: /mainSourceOfIncomeOptions[\s\S]*?value:\s*['"]3['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]3['"]/, "value: 'freelance'"),
    files: ['MainSourceOfIncome']
  },
  {
    pattern: /mainSourceOfIncomeOptions[\s\S]*?value:\s*['"]4['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]4['"]/, "value: 'pension'"),
    files: ['MainSourceOfIncome']
  },
  {
    pattern: /mainSourceOfIncomeOptions[\s\S]*?value:\s*['"]5['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]5['"]/, "value: 'rental'"),
    files: ['MainSourceOfIncome']
  },
  {
    pattern: /mainSourceOfIncomeOptions[\s\S]*?value:\s*['"]6['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]6['"]/, "value: 'investment'"),
    files: ['MainSourceOfIncome']
  },
  {
    pattern: /mainSourceOfIncomeOptions[\s\S]*?value:\s*['"]7['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]7['"]/, "value: 'other'"),
    files: ['MainSourceOfIncome']
  },
  
  // Debt/Obligation Types
  {
    pattern: /obligationOptions[\s\S]*?value:\s*['"]1['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]1['"]/, "value: 'no_obligations'"),
    files: ['Obligation']
  },
  {
    pattern: /obligationOptions[\s\S]*?value:\s*['"]2['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]2['"]/, "value: 'bank_loan'"),
    files: ['Obligation']
  },
  {
    pattern: /obligationOptions[\s\S]*?value:\s*['"]3['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]3['"]/, "value: 'consumer_credit'"),
    files: ['Obligation']
  },
  {
    pattern: /obligationOptions[\s\S]*?value:\s*['"]4['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]4['"]/, "value: 'credit_card'"),
    files: ['Obligation']
  },
  {
    pattern: /obligationOptions[\s\S]*?value:\s*['"]5['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]5['"]/, "value: 'other'"),
    files: ['Obligation']
  },
];

// Files to check
const TARGET_FILES = [
  'mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/pages/CalculateMortgage/pages/SecondStep/SecondStepForm/SecondStepForm.tsx',
  'mainapp/src/pages/Services/pages/CalculateMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx',
  'mainapp/src/pages/Services/pages/RefinanceCredit/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/pages/RefinanceCredit/pages/SecondStep/SecondStepForm/SecondStepForm.tsx',
  'mainapp/src/pages/Services/pages/RefinanceCredit/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx',
  'mainapp/src/pages/Services/pages/CalculateCredit/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/components/PropertyOwnership/PropertyOwnership.tsx',
  'mainapp/src/pages/Services/components/FamilyStatus/FamilyStatus.tsx',
  'mainapp/src/pages/Services/components/Education/Education.tsx',
  'mainapp/src/pages/Services/components/MainSourceOfIncome/MainSourceOfIncome.tsx',
  'mainapp/src/pages/Services/components/AdditionalIncome/AdditionalIncome.tsx',
  'mainapp/src/pages/Services/components/Obligation/Obligation.tsx',
  'mainapp/src/pages/Services/pages/RefinanceMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/pages/RefinanceMortgage/pages/SecondStep/SecondStepForm/SecondStepForm.tsx',
];

async function updateFile(filePath, isDryRun) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    let updatedContent = content;
    let changesMade = false;
    const changes = [];
    
    // Apply relevant patterns
    for (const { pattern, replacement, files } of REPLACEMENT_PATTERNS) {
      // Check if this pattern should apply to this file
      const shouldApply = files.some(filePattern => filePath.includes(filePattern));
      if (!shouldApply) continue;
      
      const beforeLength = updatedContent.length;
      let matchCount = 0;
      updatedContent = updatedContent.replace(pattern, (match) => {
        matchCount++;
        return replacement(match);
      });
      
      if (updatedContent.length !== beforeLength) {
        changesMade = true;
        changes.push(`Applied ${matchCount} replacements for ${pattern.source.substring(0, 30)}...`);
      }
    }
    
    if (changesMade) {
      console.log(`\n✅ Updating ${filePath}`);
      changes.forEach(change => console.log(`   - ${change}`));
      
      if (!isDryRun) {
        await fs.writeFile(fullPath, updatedContent, 'utf8');
      } else {
        console.log('   (DRY RUN - no changes written)');
      }
    } else {
      console.log(`⏭️  No changes needed in ${filePath}`);
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠️  File not found: ${filePath}`);
    } else {
      console.error(`❌ Error updating ${filePath}:`, error.message);
    }
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  console.log('🔄 Updating Frontend Dropdown Values to Match New Database Naming');
  console.log('================================================');
  console.log('This will update numeric values (1, 2, 3) to descriptive names');
  console.log('matching the database migration that was just completed.\n');
  
  if (isDryRun) {
    console.log('🏃 Running in DRY RUN mode - no files will be modified');
  }
  
  for (const file of TARGET_FILES) {
    await updateFile(file, isDryRun);
  }
  
  console.log('\n✨ Update complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the changes in your git diff');
  console.log('2. Run your test suite to ensure everything works');
  console.log('3. Test all dropdown components in the browser');
  console.log('4. Update any Redux slices or API calls that use numeric values');
}

main().catch(console.error);