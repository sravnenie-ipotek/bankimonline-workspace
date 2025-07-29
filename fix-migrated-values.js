#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix __MIGRATED_ prefix in translation values
function fixMigratedValues(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let fixedCount = 0;
    
    // Iterate through all keys
    for (const key in data) {
      if (typeof data[key] === 'string' && data[key].includes('__MIGRATED_')) {
        // Remove __MIGRATED_ prefix from the value
        const oldValue = data[key];
        data[key] = data[key].replace(/^__MIGRATED_\s*/, '').trim();
        console.log(`  Fixed: "${key}": "${oldValue}" → "${data[key]}"`);
        fixedCount++;
      }
    }
    
    if (fixedCount > 0) {
      // Write the fixed content back
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`  ✅ Fixed ${fixedCount} values in ${filePath}`);
    } else {
      console.log(`  ✅ No __MIGRATED_ values found in ${filePath}`);
    }
    
    return fixedCount;
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Find all translation.json files
const translationPaths = [
  'translations/en.json',
  'translations/he.json',
  'translations/ru.json',
  'public/locales/en/translation.json',
  'public/locales/he/translation.json',
  'public/locales/ru/translation.json',
  'build/locales/en/translation.json',
  'build/locales/he/translation.json',
  'build/locales/ru/translation.json'
];

console.log('Fixing __MIGRATED_ prefixes in translation values...\n');

let totalFixed = 0;

translationPaths.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    totalFixed += fixMigratedValues(filePath);
  } else {
    console.log(`Skipping (not found): ${filePath}`);
  }
});

console.log(`\n🎉 Total values fixed: ${totalFixed}`);