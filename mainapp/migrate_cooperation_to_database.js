const fs = require('fs');

// Read the current Cooperation.tsx file
const filePath = '/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/src/pages/Cooperation/Cooperation.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Step 1: Replace useTranslation import and hook
// Replace the import
const oldImport = `import { useTranslation } from 'react-i18next'`;
const newImport = `import { useContentApi } from '@src/hooks/useContentApi'`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  } else {
  }

// Replace the hook usage
const oldHook = `const { t } = useTranslation()`;
const newHook = `const { getContent } = useContentApi('cooperation')`;

if (content.includes(oldHook)) {
  content = content.replace(oldHook, newHook);
  } else {
  }

// Step 2: Replace all t() calls with getContent()
calls with getContent()');

// Define all the t() patterns to replace
const replacements = [
  // Simple t() calls
  { from: `{t('cooperation_title')}`, to: `{getContent('cooperation_title')}` },
  { from: `{t('cooperation_subtitle')}`, to: `{getContent('cooperation_subtitle')}` },
  { from: `{t('register_partner_program')}`, to: `{getContent('register_partner_program')}` },
  { from: `{t('marketplace_title')}`, to: `{getContent('marketplace_title')}` },
  { from: `{t('marketplace_description')}`, to: `{getContent('marketplace_description')}` },
  { from: `{t('feature_mortgage_calc')}`, to: `{getContent('feature_mortgage_calc')}` },
  { from: `{t('feature_mortgage_refinance')}`, to: `{getContent('feature_mortgage_refinance')}` },
  { from: `{t('feature_credit_calc')}`, to: `{getContent('feature_credit_calc')}` },
  { from: `{t('feature_credit_refinance')}`, to: `{getContent('feature_credit_refinance')}` },
  { from: `{t('one_click_mortgage')}`, to: `{getContent('one_click_mortgage')}` },
  { from: `{t('cooperation_cta_title')}`, to: `{getContent('cooperation_cta_title')}` },
  
  // Complex t() calls with defaultValue (need special handling)
  { 
    from: `{t('referral_title', { defaultValue: 'Bring a client and get 500 ₪ reward' })}`, 
    to: `{getContent('referral_title')}`,
    note: 'Removed defaultValue - relying on database + JSON fallback' 
  },
  { 
    from: `{t('referral_description', {\n                defaultValue: 'Earn a commission for every client who purchases our services'\n              })}`, 
    to: `{getContent('referral_description')}`,
    note: 'Removed multiline defaultValue - relying on database + JSON fallback'
  }
];

let replacementCount = 0;

replacements.forEach((replacement, index) => {
  if (content.includes(replacement.from)) {
    content = content.replace(replacement.from, replacement.to);
    }...`);
    if (replacement.note) {
      }
    replacementCount++;
  } else {
    }...`);
  }
});

// Step 3: Handle any remaining generic t() patterns
patterns');

// Use regex to find any remaining t('...') patterns
const remainingTPatterns = content.match(/t\(['"'][^'"']+['"']\)/g);
if (remainingTPatterns) {
  patterns:`);
  remainingTPatterns.forEach((pattern, index) => {
    });
} else {
  patterns found');
}

// Step 4: Write the updated file
const originalLines = fs.readFileSync(filePath, 'utf8').split('\n').length;
const updatedLines = content.split('\n').length;

fs.writeFileSync(filePath, content);

// Step 5: Verification
const verifyContent = fs.readFileSync(filePath, 'utf8');
const hasUseTranslation = verifyContent.includes('useTranslation');
const hasGetContent = verifyContent.includes('getContent');
const hasUseContentApi = verifyContent.includes('useContentApi');

' : 'CLEAN'}`);

const remainingTUsage = verifyContent.match(/\bt\(/g);
if (hasUseContentApi && hasGetContent && !hasUseTranslation && !remainingTUsage) {
  calls replaced with getContent()');
  } else {
  if (hasUseTranslation) if (remainingTUsage) calls');
  if (!hasGetContent) }

