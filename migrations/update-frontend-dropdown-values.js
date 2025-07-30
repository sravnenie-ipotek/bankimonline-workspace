#!/usr/bin/env node

/**
 * Update Frontend Dropdown Values from Numeric to Descriptive
 * 
 * This script updates all frontend components to use the new descriptive
 * dropdown values instead of numeric ones (e.g., 'option_1' → 'immediately')
 * 
 * Usage: node update-frontend-dropdown-values.js [--dry-run]
 */

const fs = require('fs').promises;
const path = require('path');

// Mapping of old numeric values to new descriptive values
const VALUE_MAPPINGS = {
  // When Money Needed
  '1': {
    contexts: ['WhenDoYouNeedMoneyOptions'],
    newValue: 'immediately'
  },
  '2': {
    contexts: ['WhenDoYouNeedMoneyOptions', 'TypeSelectOptions'],
    newValues: {
      'WhenDoYouNeedMoneyOptions': 'within_month',
      'TypeSelectOptions': 'private_house'
    }
  },
  '3': {
    contexts: ['WhenDoYouNeedMoneyOptions', 'TypeSelectOptions', 'WillBeYourFirstOptions'],
    newValues: {
      'WhenDoYouNeedMoneyOptions': 'within_3months',
      'TypeSelectOptions': 'penthouse',
      'WillBeYourFirstOptions': 'improvement'
    }
  },
  '4': {
    contexts: ['WhenDoYouNeedMoneyOptions', 'TypeSelectOptions'],
    newValues: {
      'WhenDoYouNeedMoneyOptions': 'within_6months',
      'TypeSelectOptions': 'land'
    }
  },
  
  // Property Ownership specific mappings
  'no_property': 'no_property', // Already correct
  'has_property': 'has_property', // Already correct
  'selling_property': 'selling_property', // Already correct
  
  // First Home options
  'yes': 'yes', // Keep as is for simple yes/no
  'no': 'no',   // Keep as is for simple yes/no
};

// Files to update
const TARGET_FILES = [
  'mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/pages/RefinanceCredit/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/pages/CalculateCredit/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/components/PropertyOwnership/PropertyOwnership.tsx',
  'mainapp/src/pages/Services/components/FamilyStatus/FamilyStatus.tsx',
  'mainapp/src/pages/Services/components/Education/Education.tsx',
  'mainapp/src/pages/Services/components/MainSourceOfIncome/MainSourceOfIncome.tsx',
  'mainapp/src/pages/Services/components/AdditionalIncome/AdditionalIncome.tsx',
  'mainapp/src/pages/Services/components/Obligation/Obligation.tsx',
];

// Patterns to find and replace
const REPLACEMENT_PATTERNS = [
  // WhenDoYouNeedMoneyOptions
  {
    pattern: /value:\s*['"]1['"]/g,
    replacement: "value: 'immediately'",
    context: 'WhenDoYouNeedMoneyOptions'
  },
  {
    pattern: /value:\s*['"]2['"]/g,
    replacement: "value: 'within_month'",
    context: 'WhenDoYouNeedMoneyOptions'
  },
  {
    pattern: /value:\s*['"]3['"]/g,
    replacement: "value: 'within_3months'",
    context: 'WhenDoYouNeedMoneyOptions'
  },
  {
    pattern: /value:\s*['"]4['"]/g,
    replacement: "value: 'within_6months'",
    context: 'WhenDoYouNeedMoneyOptions'
  },
  
  // TypeSelectOptions
  {
    pattern: /TypeSelectOptions[\s\S]*?value:\s*['"]1['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]1['"]/, "value: 'apartment'"),
    context: 'TypeSelectOptions'
  },
  {
    pattern: /TypeSelectOptions[\s\S]*?value:\s*['"]2['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]2['"]/, "value: 'private_house'"),
    context: 'TypeSelectOptions'
  },
  {
    pattern: /TypeSelectOptions[\s\S]*?value:\s*['"]3['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]3['"]/, "value: 'penthouse'"),
    context: 'TypeSelectOptions'
  },
  {
    pattern: /TypeSelectOptions[\s\S]*?value:\s*['"]4['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]4['"]/, "value: 'land'"),
    context: 'TypeSelectOptions'
  },
  
  // WillBeYourFirstOptions
  {
    pattern: /WillBeYourFirstOptions[\s\S]*?value:\s*['"]1['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]1['"]/, "value: 'yes'"),
    context: 'WillBeYourFirstOptions'
  },
  {
    pattern: /WillBeYourFirstOptions[\s\S]*?value:\s*['"]2['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]2['"]/, "value: 'no'"),
    context: 'WillBeYourFirstOptions'
  },
  {
    pattern: /WillBeYourFirstOptions[\s\S]*?value:\s*['"]3['"]/g,
    replacement: (match) => match.replace(/value:\s*['"]3['"]/, "value: 'improvement'"),
    context: 'WillBeYourFirstOptions'
  },
];

async function updateFile(filePath, isDryRun) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    let updatedContent = content;
    let changesMade = false;
    
    // Apply each replacement pattern
    for (const { pattern, replacement } of REPLACEMENT_PATTERNS) {
      const beforeLength = updatedContent.length;
      updatedContent = updatedContent.replace(pattern, replacement);
      if (updatedContent.length !== beforeLength) {
        changesMade = true;
      }
    }
    
    if (changesMade) {
      console.log(`✅ Updating ${filePath}`);
      if (!isDryRun) {
        await fs.writeFile(fullPath, updatedContent, 'utf8');
      } else {
        console.log('  (DRY RUN - no changes written)');
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
  
  console.log('🔄 Updating Frontend Dropdown Values from Numeric to Descriptive');
  console.log('================================================');
  if (isDryRun) {
    console.log('🏃 Running in DRY RUN mode - no files will be modified');
  }
  console.log('');
  
  for (const file of TARGET_FILES) {
    await updateFile(file, isDryRun);
  }
  
  console.log('\n✨ Update complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the changes in your git diff');
  console.log('2. Run your test suite to ensure everything works');
  console.log('3. Update any hardcoded value checks in your code');
  console.log('4. Run the database migration: psql $DATABASE_URL < migrations/fix_numeric_dropdown_naming.sql');
}

main().catch(console.error);