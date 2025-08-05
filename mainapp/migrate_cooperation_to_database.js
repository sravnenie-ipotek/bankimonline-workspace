const fs = require('fs');

console.log('=== PHASE 9: COOPERATION DATABASE-ONLY MIGRATION ===\n');

// Read the current Cooperation.tsx file
const filePath = '/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/src/pages/Cooperation/Cooperation.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('📄 Original file size:', content.length, 'characters');

// Step 1: Replace useTranslation import and hook
console.log('\n🔄 Step 1: Replace useTranslation with useContentApi');

// Replace the import
const oldImport = `import { useTranslation } from 'react-i18next'`;
const newImport = `import { useContentApi } from '@src/hooks/useContentApi'`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  console.log('✅ Replaced useTranslation import with useContentApi');
} else {
  console.log('⚠️ useTranslation import not found');
}

// Replace the hook usage
const oldHook = `const { t } = useTranslation()`;
const newHook = `const { getContent } = useContentApi('cooperation')`;

if (content.includes(oldHook)) {
  content = content.replace(oldHook, newHook);
  console.log('✅ Replaced useTranslation hook with useContentApi');
} else {
  console.log('⚠️ useTranslation hook not found');
}

// Step 2: Replace all t() calls with getContent()
console.log('\n🔄 Step 2: Replace t() calls with getContent()');

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
    console.log(`✅ ${index + 1}. Replaced: ${replacement.from.substring(0, 50)}...`);
    if (replacement.note) {
      console.log(`   Note: ${replacement.note}`);
    }
    replacementCount++;
  } else {
    console.log(`⚠️ ${index + 1}. Not found: ${replacement.from.substring(0, 50)}...`);
  }
});

// Step 3: Handle any remaining generic t() patterns
console.log('\n🔄 Step 3: Check for remaining t() patterns');

// Use regex to find any remaining t('...') patterns
const remainingTPatterns = content.match(/t\(['"'][^'"']+['"']\)/g);
if (remainingTPatterns) {
  console.log(`⚠️ Found ${remainingTPatterns.length} remaining t() patterns:`);
  remainingTPatterns.forEach((pattern, index) => {
    console.log(`${index + 1}. ${pattern}`);
  });
} else {
  console.log('✅ No remaining t() patterns found');
}

// Step 4: Write the updated file
console.log('\n🔄 Step 4: Write updated file');

const originalLines = fs.readFileSync(filePath, 'utf8').split('\n').length;
const updatedLines = content.split('\n').length;

fs.writeFileSync(filePath, content);

console.log('✅ File updated successfully');
console.log(`📄 Lines: ${originalLines} -> ${updatedLines}`);
console.log(`🔄 Replacements made: ${replacementCount}`);

// Step 5: Verification
console.log('\n🔍 Step 5: Verification');

const verifyContent = fs.readFileSync(filePath, 'utf8');
const hasUseTranslation = verifyContent.includes('useTranslation');
const hasGetContent = verifyContent.includes('getContent');
const hasUseContentApi = verifyContent.includes('useContentApi');

console.log(`✅ useContentApi import: ${hasUseContentApi ? 'FOUND' : 'MISSING'}`);
console.log(`✅ getContent usage: ${hasGetContent ? 'FOUND' : 'MISSING'}`);
console.log(`🚫 useTranslation remnants: ${hasUseTranslation ? 'FOUND (should remove)' : 'CLEAN'}`);

const remainingTUsage = verifyContent.match(/\bt\(/g);
console.log(`🚫 Remaining t( usage: ${remainingTUsage ? remainingTUsage.length + ' instances' : 'CLEAN'}`);

console.log('\n=== MIGRATION SUMMARY ===');
if (hasUseContentApi && hasGetContent && !hasUseTranslation && !remainingTUsage) {
  console.log('🎉 SUCCESS: Cooperation.tsx migrated to database-only!');
  console.log('✅ All t() calls replaced with getContent()');
  console.log('✅ useContentApi hook properly imported');
  console.log('⚡ Next step: Build validation');
} else {
  console.log('⚠️  Migration partially complete - manual review needed');
  if (hasUseTranslation) console.log('- Remove remaining useTranslation references');
  if (remainingTUsage) console.log('- Replace remaining t() calls');
  if (!hasGetContent) console.log('- Ensure getContent is being used');
}

console.log('\n📋 Ready for build validation and testing phase');