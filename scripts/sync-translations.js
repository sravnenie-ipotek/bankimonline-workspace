#!/usr/bin/env node

/**
 * TRANSLATION SYNC SCRIPT
 * 
 * This script copies translations from the single source directory
 * to all required locations to maintain compatibility while ensuring consistency.
 * 
 * Usage: node scripts/sync-translations.js
 */

const fs = require('fs');
const path = require('path');

// Single source directory (source of truth)
const SOURCE_DIR = './translations';

// Target locations where translations need to be copied
const TARGET_LOCATIONS = [
  './locales',
  './mainapp/public/locales', 
  './public/locales'
];

// Supported languages
const LANGUAGES = ['en', 'he', 'ru'];

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

/**
 * Copy file with error handling
 */
function copyFile(source, target) {
  try {
    fs.copyFileSync(source, target);
    console.log(`✅ Copied: ${source} → ${target}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to copy ${source} → ${target}:`, error.message);
    return false;
  }
}

/**
 * Sync translations from source to all target locations
 */
function syncTranslations() {
  console.log('🚀 Starting translation sync...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Check if source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }
  
  // Sync each language to all target locations
  for (const lang of LANGUAGES) {
    const sourceFile = path.join(SOURCE_DIR, `${lang}.json`);
    
    // Check if source file exists
    if (!fs.existsSync(sourceFile)) {
      console.warn(`⚠️  Source file not found: ${sourceFile}`);
      errorCount++;
      continue;
    }
    
    console.log(`📄 Syncing ${lang.toUpperCase()} translations...`);
    
    // Copy to each target location
    for (const targetLocation of TARGET_LOCATIONS) {
      const targetDir = path.join(targetLocation, lang);
      const targetFile = path.join(targetDir, 'translation.json');
      
      // Ensure target directory exists
      ensureDir(targetDir);
      
      // Copy the file
      if (copyFile(sourceFile, targetFile)) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('📊 SYNC SUMMARY:');
  console.log(`✅ Successful copies: ${successCount}`);
  console.log(`❌ Failed copies: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 All translations synced successfully!');
  } else {
    console.log('⚠️  Some translations failed to sync. Check errors above.');
    process.exit(1);
  }
}

/**
 * Validate translations (check for missing keys)
 */
function validateTranslations() {
  console.log('🔍 Validating translations...\n');
  
  const translations = {};
  
  // Load all translation files
  for (const lang of LANGUAGES) {
    const filePath = path.join(SOURCE_DIR, `${lang}.json`);
    if (fs.existsSync(filePath)) {
      try {
        translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`✅ Loaded ${lang}: ${Object.keys(translations[lang]).length} keys`);
      } catch (error) {
        console.error(`❌ Failed to parse ${filePath}:`, error.message);
      }
    }
  }
  
  // Check for missing keys between languages
  if (translations.en) {
    const englishKeys = Object.keys(translations.en);
    
    for (const lang of LANGUAGES) {
      if (lang === 'en' || !translations[lang]) continue;
      
      const langKeys = Object.keys(translations[lang]);
      const missingKeys = englishKeys.filter(key => !langKeys.includes(key));
      
      if (missingKeys.length > 0) {
        console.warn(`⚠️  ${lang.toUpperCase()} missing ${missingKeys.length} keys:`, missingKeys.slice(0, 5));
        if (missingKeys.length > 5) {
          console.warn(`   ... and ${missingKeys.length - 5} more`);
        }
      } else {
        console.log(`✅ ${lang.toUpperCase()} has all keys`);
      }
    }
  }
  
  console.log('');
}

// Main execution
if (require.main === module) {
  console.log('🌐 TRANSLATION SYNC UTILITY\n');
  
  // Validate first
  validateTranslations();
  
  // Then sync
  syncTranslations();
}

module.exports = { syncTranslations, validateTranslations }; 