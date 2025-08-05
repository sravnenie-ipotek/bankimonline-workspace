#!/usr/bin/env node

/**
 * Update Frontend Dropdown Values to Match New Database Naming
 * Generated on: 2025-07-30T13:46:23.729Z
 */

const fs = require('fs').promises;
const path = require('path');

// Comprehensive mappings based on database analysis
const VALUE_MAPPINGS = {
  "propertyOwnership": [
    {
      "old": "3",
      "new": "property",
      "full": "app.mortgage.form.calculate_mortgage_property_ownership_im_selling_a_property"
    },
    {
      "old": "1",
      "new": "property",
      "full": "app.mortgage.form.calculate_mortgage_property_ownership_i_no_own_any_property"
    },
    {
      "old": "2",
      "new": "property",
      "full": "app.mortgage.form.calculate_mortgage_property_ownership_i_own_a_property"
    },
    {
      "old": "3",
      "new": "property",
      "full": "mortgage_calculation.field.property_ownership_im_selling_a_property"
    },
    {
      "old": "1",
      "new": "property",
      "full": "mortgage_calculation.field.property_ownership_i_no_own_any_property"
    },
    {
      "old": "2",
      "new": "property",
      "full": "mortgage_calculation.field.property_ownership_i_own_a_property"
    },
    {
      "old": "3",
      "new": "property",
      "full": "mortgage_step1.field.property_ownership_im_selling_a_property"
    },
    {
      "old": "1",
      "new": "property",
      "full": "mortgage_step1.field.property_ownership_i_no_own_any_property"
    },
    {
      "old": "2",
      "new": "property",
      "full": "mortgage_step1.field.property_ownership_i_own_a_property"
    }
  ],
  "debtTypes": [
    {
      "old": "2",
      "new": "loan",
      "full": "mortgage_calculation.field.debt_types_bank_loan"
    },
    {
      "old": "3",
      "new": "credit",
      "full": "mortgage_calculation.field.debt_types_consumer_credit"
    },
    {
      "old": "4",
      "new": "card",
      "full": "mortgage_calculation.field.debt_types_credit_card"
    },
    {
      "old": "1",
      "new": "obligations",
      "full": "mortgage_calculation.field.debt_types_no_obligations"
    },
    {
      "old": "5",
      "new": "other",
      "full": "mortgage_calculation.field.debt_types_other"
    },
    {
      "old": "2",
      "new": "loan",
      "full": "mortgage_step3_obligations_bank_loan"
    },
    {
      "old": "3",
      "new": "credit",
      "full": "mortgage_step3_obligations_consumer_credit"
    },
    {
      "old": "4",
      "new": "card",
      "full": "mortgage_step3_obligations_credit_card"
    },
    {
      "old": "1",
      "new": "obligations",
      "full": "mortgage_step3_obligations_no_obligations"
    },
    {
      "old": "5",
      "new": "other",
      "full": "mortgage_step3_obligations_other"
    },
    {
      "old": "2",
      "new": "loan",
      "full": "refinance_credit_debt_types_bank_loan"
    },
    {
      "old": "3",
      "new": "credit",
      "full": "refinance_credit_debt_types_consumer_credit"
    },
    {
      "old": "4",
      "new": "card",
      "full": "refinance_credit_debt_types_credit_card"
    },
    {
      "old": "1",
      "new": "obligations",
      "full": "refinance_credit_debt_types_no_obligations"
    },
    {
      "old": "5",
      "new": "other",
      "full": "refinance_credit_debt_types_other"
    }
  ],
  "education": [
    {
      "old": "5",
      "new": "bachelors",
      "full": "mortgage_calculation.field.education_bachelors"
    },
    {
      "old": "7",
      "new": "doctorate",
      "full": "mortgage_calculation.field.education_doctorate"
    },
    {
      "old": "3",
      "new": "diploma",
      "full": "mortgage_calculation.field.education_full_high_school_diploma"
    },
    {
      "old": "6",
      "new": "masters",
      "full": "mortgage_calculation.field.education_masters"
    },
    {
      "old": "1",
      "new": "diploma",
      "full": "mortgage_calculation.field.education_no_high_school_diploma"
    },
    {
      "old": "2",
      "new": "diploma",
      "full": "mortgage_calculation.field.education_partial_high_school_diploma"
    },
    {
      "old": "4",
      "new": "education",
      "full": "mortgage_calculation.field.education_postsecondary_education"
    },
    {
      "old": "5",
      "new": "bachelors",
      "full": "mortgage_step2.field.education_bachelors"
    },
    {
      "old": "7",
      "new": "doctorate",
      "full": "mortgage_step2.field.education_doctorate"
    },
    {
      "old": "3",
      "new": "diploma",
      "full": "mortgage_step2.field.education_full_high_school_diploma"
    },
    {
      "old": "6",
      "new": "masters",
      "full": "mortgage_step2.field.education_masters"
    },
    {
      "old": "1",
      "new": "diploma",
      "full": "mortgage_step2.field.education_no_high_school_diploma"
    },
    {
      "old": "2",
      "new": "diploma",
      "full": "mortgage_step2.field.education_partial_high_school_diploma"
    },
    {
      "old": "4",
      "new": "education",
      "full": "mortgage_step2.field.education_postsecondary_education"
    },
    {
      "old": "5",
      "new": "bachelors",
      "full": "calculate_mortgage_education_bachelors"
    },
    {
      "old": "7",
      "new": "doctorate",
      "full": "calculate_mortgage_education_doctorate"
    },
    {
      "old": "6",
      "new": "masters",
      "full": "calculate_mortgage_education_masters"
    },
    {
      "old": "5",
      "new": "bachelors",
      "full": "refinance_step2_education_bachelors"
    },
    {
      "old": "7",
      "new": "doctorate",
      "full": "refinance_step2_education_doctorate"
    },
    {
      "old": "3",
      "new": "certificate",
      "full": "refinance_step2_education_full_high_school_certificate"
    },
    {
      "old": "6",
      "new": "masters",
      "full": "refinance_step2_education_masters"
    },
    {
      "old": "1",
      "new": "certificate",
      "full": "refinance_step2_education_no_high_school_certificate"
    },
    {
      "old": "2",
      "new": "certificat",
      "full": "refinance_step2_education_partial_high_school_certificat"
    },
    {
      "old": "4",
      "new": "secondary",
      "full": "refinance_step2_education_post_secondary"
    },
    {
      "old": "4",
      "new": "education",
      "full": "refinance_step2_education_postsecondary_education"
    }
  ],
  "familyStatus": [
    {
      "old": "5",
      "new": "partner",
      "full": "mortgage_calculation.field.family_status_commonlaw_partner"
    },
    {
      "old": "3",
      "new": "divorced",
      "full": "mortgage_calculation.field.family_status_divorced"
    },
    {
      "old": "2",
      "new": "married",
      "full": "mortgage_calculation.field.family_status_married"
    },
    {
      "old": "6",
      "new": "other",
      "full": "mortgage_calculation.field.family_status_other"
    },
    {
      "old": "1",
      "new": "single",
      "full": "mortgage_calculation.field.family_status_single"
    },
    {
      "old": "4",
      "new": "widowed",
      "full": "mortgage_calculation.field.family_status_widowed"
    },
    {
      "old": "5",
      "new": "partner",
      "full": "mortgage_step2.field.family_status_commonlaw_partner"
    },
    {
      "old": "3",
      "new": "divorced",
      "full": "mortgage_step2.field.family_status_divorced"
    },
    {
      "old": "2",
      "new": "married",
      "full": "mortgage_step2.field.family_status_married"
    },
    {
      "old": "6",
      "new": "other",
      "full": "mortgage_step2.field.family_status_other"
    },
    {
      "old": "1",
      "new": "single",
      "full": "mortgage_step2.field.family_status_single"
    },
    {
      "old": "4",
      "new": "widowed",
      "full": "mortgage_step2.field.family_status_widowed"
    },
    {
      "old": "6",
      "new": "cohabiting",
      "full": "calculate_mortgage_family_status_cohabiting"
    },
    {
      "old": "3",
      "new": "divorced",
      "full": "calculate_mortgage_family_status_divorced"
    },
    {
      "old": "2",
      "new": "married",
      "full": "calculate_mortgage_family_status_married"
    },
    {
      "old": "5",
      "new": "separated",
      "full": "calculate_mortgage_family_status_separated"
    },
    {
      "old": "1",
      "new": "single",
      "full": "calculate_mortgage_family_status_single"
    },
    {
      "old": "4",
      "new": "widowed",
      "full": "calculate_mortgage_family_status_widowed"
    }
  ],
  "mainSource": [
    {
      "old": "7",
      "new": "other",
      "full": "mortgage_calculation.field.main_source_other"
    },
    {
      "old": "4",
      "new": "pension",
      "full": "mortgage_calculation.field.main_source_pension"
    },
    {
      "old": "7",
      "new": "other",
      "full": "mortgage_step3_main_source_other"
    },
    {
      "old": "4",
      "new": "pension",
      "full": "mortgage_step3_main_source_pension"
    },
    {
      "old": "7",
      "new": "other",
      "full": "refinance_credit_main_source_other"
    },
    {
      "old": "4",
      "new": "pension",
      "full": "refinance_credit_main_source_pension"
    }
  ]
};

// Files to update
const TARGET_FILES = [
  'mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/pages/CalculateMortgage/pages/SecondStep/SecondStepForm/SecondStepForm.tsx',
  'mainapp/src/pages/Services/pages/CalculateMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx',
  'mainapp/src/pages/Services/pages/RefinanceCredit/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/pages/CalculateCredit/pages/FirstStep/FirstStepForm/FirstStepForm.tsx',
  'mainapp/src/pages/Services/components/PropertyOwnership/PropertyOwnership.tsx',
  'mainapp/src/pages/Services/components/FamilyStatus/FamilyStatus.tsx',
  'mainapp/src/pages/Services/components/Education/Education.tsx',
  'mainapp/src/pages/Services/components/MainSourceOfIncome/MainSourceOfIncome.tsx',
  'mainapp/src/pages/Services/components/AdditionalIncome/AdditionalIncome.tsx',
  'mainapp/src/pages/Services/components/Obligation/Obligation.tsx',
];

async function updateFile(filePath, isDryRun) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    let updatedContent = content;
    let changesMade = false;
    
    // Update property ownership values
    if (filePath.includes('PropertyOwnership')) {
      VALUE_MAPPINGS.propertyOwnership?.forEach(mapping => {
        const oldPattern = new RegExp(`value:\\s*['"]${mapping.old}['"]`, 'g');
        const newValue = `value: '${mapping.new}'`;
        const before = updatedContent.length;
        updatedContent = updatedContent.replace(oldPattern, newValue);
        if (updatedContent.length !== before) changesMade = true;
      });
    }
    
    // Update family status values
    if (filePath.includes('FamilyStatus')) {
      VALUE_MAPPINGS.familyStatus?.forEach(mapping => {
        const oldPattern = new RegExp(`value:\\s*['"]${mapping.old}['"]`, 'g');
        const newValue = `value: '${mapping.new}'`;
        const before = updatedContent.length;
        updatedContent = updatedContent.replace(oldPattern, newValue);
        if (updatedContent.length !== before) changesMade = true;
      });
    }
    
    // Update education values
    if (filePath.includes('Education')) {
      VALUE_MAPPINGS.education?.forEach(mapping => {
        const oldPattern = new RegExp(`value:\\s*['"]${mapping.old}['"]`, 'g');
        const newValue = `value: '${mapping.new}'`;
        const before = updatedContent.length;
        updatedContent = updatedContent.replace(oldPattern, newValue);
        if (updatedContent.length !== before) changesMade = true;
      });
    }
    
    // Update main source values
    if (filePath.includes('MainSource')) {
      VALUE_MAPPINGS.mainSource?.forEach(mapping => {
        const oldPattern = new RegExp(`value:\\s*['"]${mapping.old}['"]`, 'g');
        const newValue = `value: '${mapping.new}'`;
        const before = updatedContent.length;
        updatedContent = updatedContent.replace(oldPattern, newValue);
        if (updatedContent.length !== before) changesMade = true;
      });
    }
    
    // Update debt/obligation values
    if (filePath.includes('Obligation')) {
      VALUE_MAPPINGS.debtTypes?.forEach(mapping => {
        const oldPattern = new RegExp(`value:\\s*['"]${mapping.old}['"]`, 'g');
        const newValue = `value: '${mapping.new}'`;
        const before = updatedContent.length;
        updatedContent = updatedContent.replace(oldPattern, newValue);
        if (updatedContent.length !== before) changesMade = true;
      });
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
  
  console.log('🔄 Updating Frontend Dropdown Values to Match Database');
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
  console.log('3. Test all dropdown components thoroughly');
}

main().catch(console.error);
