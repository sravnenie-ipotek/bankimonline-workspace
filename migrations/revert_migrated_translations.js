// Script to revert the __MIGRATED_ prefix from translation keys
// This will restore the original keys so the application works correctly

const fs = require('fs');
const path = require('path');

// Languages to process
const languages = ['en', 'he', 'ru'];

// Process each language file
languages.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'mainapp', 'public', 'locales', lang, 'translation.json');
  
  try {
    // Read the current translation file
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);
    
    // Create a new object with migrated keys restored
    const restoredTranslations = {};
    let restoredCount = 0;
    
    for (const [key, value] of Object.entries(translations)) {
      if (key.startsWith('__MIGRATED_')) {
        // Remove the __MIGRATED_ prefix
        const originalKey = key.replace('__MIGRATED_', '');
        restoredTranslations[originalKey] = value;
        restoredCount++;
      } else {
        // Keep non-migrated keys as is
        restoredTranslations[key] = value;
      }
    }
    
    // Write the restored translations back to file
    fs.writeFileSync(filePath, JSON.stringify(restoredTranslations, null, 2), 'utf8');
    
    console.log(`✅ ${lang}/translation.json: Restored ${restoredCount} keys`);
  } catch (error) {
    console.error(`❌ Error processing ${lang}/translation.json:`, error.message);
  }
});

console.log('\n✅ Translation keys restored! The pages should now display correctly.');