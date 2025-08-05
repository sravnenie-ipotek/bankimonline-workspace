#!/usr/bin/env node

/**
 * Batch update script to migrate Step 2 components from useTranslation to useContentApi
 * Updates multiple components systematically to use database content instead of JSON translations
 */

const fs = require('fs');
const path = require('path');

// Component updates configuration
const componentUpdates = [
  // AdditionalCitizenship component
  {
    filePath: '/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/src/pages/Services/components/AdditionalCitizenship/AdditionalCitizenship.tsx',
    replacements: [
      {
        old: `import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'`,
        new: `import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'`
      },
      {
        old: `const AdditionalCitizenship = () => {
  const { t, i18n } = useTranslation()`,
        new: `const AdditionalCitizenship = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step2')`
      },
      {
        old: `t('calculate_mortgage_citizenship')`,
        new: `getContent('calculate_mortgage_citizenship', 'calculate_mortgage_citizenship')`
      }
    ]
  },
  
  // FamilyStatus component  
  {
    filePath: '/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/src/pages/Services/components/FamilyStatus/FamilyStatus.tsx',
    replacements: [
      {
        old: `import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'`,
        new: `import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'`
      },
      {
        old: `const FamilyStatus = () => {
  const { t, i18n } = useTranslation()`,
        new: `const FamilyStatus = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step2')`
      },
      {
        old: `{ value: 'option_1', label: t('calculate_mortgage_family_status_option_1') }`,
        new: `{ value: 'option_1', label: getContent('calculate_mortgage_family_status_option_1', 'calculate_mortgage_family_status_option_1') }`
      },
      {
        old: `{ value: 'option_2', label: t('calculate_mortgage_family_status_option_2') }`,
        new: `{ value: 'option_2', label: getContent('calculate_mortgage_family_status_option_2', 'calculate_mortgage_family_status_option_2') }`
      },
      {
        old: `{ value: 'option_3', label: t('calculate_mortgage_family_status_option_3') }`,
        new: `{ value: 'option_3', label: getContent('calculate_mortgage_family_status_option_3', 'calculate_mortgage_family_status_option_3') }`
      },
      {
        old: `{ value: 'option_4', label: t('calculate_mortgage_family_status_option_4') }`,
        new: `{ value: 'option_4', label: getContent('calculate_mortgage_family_status_option_4', 'calculate_mortgage_family_status_option_4') }`
      },
      {
        old: `{ value: 'option_5', label: t('calculate_mortgage_family_status_option_5') }`,
        new: `{ value: 'option_5', label: getContent('calculate_mortgage_family_status_option_5', 'calculate_mortgage_family_status_option_5') }`
      },
      {
        old: `{ value: 'option_6', label: t('calculate_mortgage_family_status_option_6') }`,
        new: `{ value: 'option_6', label: getContent('calculate_mortgage_family_status_option_6', 'calculate_mortgage_family_status_option_6') }`
      },
      {
        old: `title={t('calculate_mortgage_family_status')}`,
        new: `title={getContent('calculate_mortgage_family_status', 'calculate_mortgage_family_status')}`
      },
      {
        old: `placeholder={t('calculate_mortgage_family_status_ph')}`,
        new: `placeholder={getContent('calculate_mortgage_family_status_ph', 'calculate_mortgage_family_status_ph')}`
      }
    ]
  },

  // Borrowers component
  {
    filePath: '/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/src/pages/Services/components/Borrowers/Borrowers.tsx',
    replacements: [
      {
        old: `import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'`,
        new: `import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'`
      },
      {
        old: `const Borrowers = () => {
  const { t, i18n } = useTranslation()`,
        new: `const Borrowers = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step2')`
      },
      {
        old: `title={t('calculate_mortgage_borrowers')}`,
        new: `title={getContent('calculate_mortgage_borrowers', 'calculate_mortgage_borrowers')}`
      },
      {
        old: `placeholder={t('place_borrowers')}`,
        new: `placeholder={getContent('place_borrowers', 'place_borrowers')}`
      }
    ]
  }
];

// Function to update a single file
function updateComponentFile(componentConfig) {
  const { filePath, replacements } = componentConfig;
  
  try {
    console.log(`🔄 Updating: ${path.basename(filePath)}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach((replacement, index) => {
      if (content.includes(replacement.old)) {
        content = content.replace(replacement.old, replacement.new);
        modified = true;
        console.log(`  ✅ Applied replacement ${index + 1}`);
      } else {
        console.log(`  ⚠️ Replacement ${index + 1} not found in file`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`⚠️ No changes made to: ${path.basename(filePath)}`);
      return false;
    }
    
  } catch (error) {
    console.error(`💥 Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🚀 Starting batch update of Step 2 components...');
console.log(`📊 Total components to update: ${componentUpdates.length}`);

let successCount = 0;
let failureCount = 0;

componentUpdates.forEach((componentConfig) => {
  const success = updateComponentFile(componentConfig);
  if (success) {
    successCount++;
  } else {
    failureCount++;
  }
  console.log(''); // Add spacing between components
});

console.log('📈 Update Summary:');
console.log(`✅ Successfully updated: ${successCount}`);
console.log(`❌ Failed to update: ${failureCount}`);
console.log(`📊 Total: ${successCount + failureCount}`);

if (successCount > 0) {
  console.log('\\n🎉 Component updates completed! Test the page to verify changes.');
}