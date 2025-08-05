const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function importTranslations() {
  console.log('Translation Import Tool');
  console.log('======================');
  console.log('');
  
  const language = await question('Which language to import? (he/ru): ');
  if (!['he', 'ru'].includes(language)) {
    console.log('Invalid language. Please use "he" for Hebrew or "ru" for Russian.');
    rl.close();
    return;
  }
  
  const method = await question('Import method?\n1. From translated text file (line by line)\n2. From JSON file with key-value pairs\n3. From CSV file\nChoose (1/2/3): ');
  
  const translationsDir = path.join(__dirname, 'translations');
  const targetPath = path.join(translationsDir, `${language}.json`);
  const exportDir = path.join(__dirname, 'translations-to-translate');
  
  // Load current translations
  const currentTranslations = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  
  try {
    if (method === '1') {
      // Import from translated text file
      const translatedFile = await question('Path to translated text file: ');
      const missingKeysFile = path.join(exportDir, `missing-${language === 'he' ? 'hebrew' : 'russian'}.json`);
      
      const translatedLines = fs.readFileSync(translatedFile, 'utf8').split('\n').filter(line => line.trim());
      const missingKeys = JSON.parse(fs.readFileSync(missingKeysFile, 'utf8'));
      const keysArray = Object.keys(missingKeys);
      
      if (translatedLines.length !== keysArray.length) {
        console.log(`Warning: Number of translations (${translatedLines.length}) doesn't match number of keys (${keysArray.length})`);
        const proceed = await question('Continue anyway? (y/n): ');
        if (proceed.toLowerCase() !== 'y') {
          rl.close();
          return;
        }
      }
      
      // Map translations to keys
      keysArray.forEach((key, index) => {
        if (index < translatedLines.length) {
          currentTranslations[key] = translatedLines[index].trim();
        }
      });
      
    } else if (method === '2') {
      // Import from JSON file
      const jsonFile = await question('Path to JSON file with translations: ');
      const newTranslations = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      
      Object.entries(newTranslations).forEach(([key, value]) => {
        if (value && value.trim()) {
          currentTranslations[key] = value;
        }
      });
      
    } else if (method === '3') {
      // Import from CSV file
      const csvFile = await question('Path to CSV file: ');
      const csvContent = fs.readFileSync(csvFile, 'utf8');
      const lines = csvContent.split('\n').slice(1); // Skip header
      
      lines.forEach(line => {
        if (!line.trim()) return;
        
        // Parse CSV line (handle quoted values)
        const match = line.match(/^"([^"]+)","([^"]+)"$/);
        if (match) {
          const [, key, translation] = match;
          if (translation && translation.trim()) {
            currentTranslations[key] = translation;
          }
        }
      });
    }
    
    // Save updated translations
    fs.writeFileSync(targetPath, JSON.stringify(currentTranslations, null, 2));
    
    // Run sync script
    console.log('\nTranslations imported successfully!');
    console.log('Running sync-translations script...');
    
    const { exec } = require('child_process');
    exec('npm run sync-translations', (error, stdout, stderr) => {
      if (error) {
        console.error('Error syncing translations:', error);
      } else {
        console.log('Translations synced successfully!');
      }
      rl.close();
    });
    
  } catch (error) {
    console.error('Error importing translations:', error.message);
    rl.close();
  }
}

importTranslations();