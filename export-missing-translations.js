const fs = require('fs');
const path = require('path');

// Read translation files
const translationsDir = path.join(__dirname, 'translations');
const enPath = path.join(translationsDir, 'en.json');
const hePath = path.join(translationsDir, 'he.json');
const ruPath = path.join(translationsDir, 'ru.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const he = JSON.parse(fs.readFileSync(hePath, 'utf8'));
const ru = JSON.parse(fs.readFileSync(ruPath, 'utf8'));

// Find missing Hebrew translations
const missingHebrew = {};
const missingRussian = {};

// Check for missing Hebrew translations
Object.keys(en).forEach(key => {
  if (!he[key] || he[key] === '' || he[key] === en[key]) {
    missingHebrew[key] = en[key];
  }
});

// Check for missing Russian translations
Object.keys(en).forEach(key => {
  if (!ru[key] || ru[key] === '' || ru[key] === en[key]) {
    missingRussian[key] = en[key];
  }
});

// Create export files
const exportDir = path.join(__dirname, 'translations-to-translate');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

// Export missing Hebrew translations
const hebrewExportPath = path.join(exportDir, 'missing-hebrew.json');
fs.writeFileSync(hebrewExportPath, JSON.stringify(missingHebrew, null, 2));

// Export missing Russian translations
const russianExportPath = path.join(exportDir, 'missing-russian.json');
fs.writeFileSync(russianExportPath, JSON.stringify(missingRussian, null, 2));

// Create a CSV format for easy Google Translate use
const hebrewCsvPath = path.join(exportDir, 'missing-hebrew.csv');
const russianCsvPath = path.join(exportDir, 'missing-russian.csv');

// Hebrew CSV
const hebrewCsv = 'Key,English Text\n' + 
  Object.entries(missingHebrew).map(([key, value]) => `"${key}","${value}"`).join('\n');
fs.writeFileSync(hebrewCsvPath, hebrewCsv);

// Russian CSV
const russianCsv = 'Key,English Text\n' + 
  Object.entries(missingRussian).map(([key, value]) => `"${key}","${value}"`).join('\n');
fs.writeFileSync(russianCsvPath, russianCsv);

// Create simple text files with just the English text for bulk translation
const hebrewTextPath = path.join(exportDir, 'hebrew-to-translate.txt');
const russianTextPath = path.join(exportDir, 'russian-to-translate.txt');

fs.writeFileSync(hebrewTextPath, Object.values(missingHebrew).join('\n'));
fs.writeFileSync(russianTextPath, Object.values(missingRussian).join('\n'));

console.log('Export complete!');
console.log('');
console.log('Files created in translations-to-translate/:');
console.log('- missing-hebrew.json: JSON format with keys and English values');
console.log('- missing-russian.json: JSON format with keys and English values');
console.log('- missing-hebrew.csv: CSV format for spreadsheet import');
console.log('- missing-russian.csv: CSV format for spreadsheet import');
console.log('- hebrew-to-translate.txt: Just the English text (for bulk Google Translate)');
console.log('- russian-to-translate.txt: Just the English text (for bulk Google Translate)');
console.log('');
console.log(`Hebrew translations needed: ${Object.keys(missingHebrew).length}`);
console.log(`Russian translations needed: ${Object.keys(missingRussian).length}`);
console.log('');
console.log('To use with Google Translate:');
console.log('1. Copy the content from hebrew-to-translate.txt or russian-to-translate.txt');
console.log('2. Paste into Google Translate');
console.log('3. Match the translated lines back to the keys in the CSV or JSON files');