#!/usr/bin/env node

/**
 * Translation Validation Script
 * Validates that all translation files are properly formatted and contain expected keys
 */

const fs = require('fs')
const path = require('path')

const LOCALES_DIR = path.join(__dirname, '../src/locales')
const SUPPORTED_LANGUAGES = ['en', 'he', 'ru']

function validateTranslationFile(filePath, language) {
  const errors = []
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      errors.push(`❌ Translation file missing: ${filePath}`)
      return errors
    }
    
    // Read and parse JSON
    const content = fs.readFileSync(filePath, 'utf8')
    const translations = JSON.parse(content)
    
    // Basic validation
    if (typeof translations !== 'object' || translations === null) {
      errors.push(`❌ ${language}: Translation file is not a valid object`)
      return errors
    }
    
    // Count keys
    const keyCount = Object.keys(translations).length
    }: ${keyCount} translation keys found`)
    
    // Check for empty values
    let emptyKeys = 0
    Object.entries(translations).forEach(([key, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        emptyKeys++
      }
    })
    
    if (emptyKeys > 0) {
      }: ${emptyKeys} empty translation values found`)
    }
    
    // Language-specific validation
    if (language === 'en') {
      // English should have the most keys (reference language)
      if (keyCount < 1000) {
        errors.push(`❌ ${language}: Expected at least 1000 keys, found ${keyCount}`)
      }
    }
    
  } catch (error) {
    errors.push(`❌ ${language}: Failed to parse JSON - ${error.message}`)
  }
  
  return errors
}

function validateAllTranslations() {
  let totalErrors = 0
  const results = {}
  
  for (const language of SUPPORTED_LANGUAGES) {
    const filePath = path.join(LOCALES_DIR, language, 'translation.json')
    const errors = validateTranslationFile(filePath, language)
    
    results[language] = {
      path: filePath,
      errors: errors.length,
      errorMessages: errors
    }
    
    totalErrors += errors.length
    
    // Print errors for this language
    if (errors.length > 0) {
      } Errors:`)
      errors.forEach(error => )
    }
  }
  
  // Cross-language validation
  try {
    const enPath = path.join(LOCALES_DIR, 'en', 'translation.json')
    const hePath = path.join(LOCALES_DIR, 'he', 'translation.json')
    const ruPath = path.join(LOCALES_DIR, 'ru', 'translation.json')
    
    if (fs.existsSync(enPath) && fs.existsSync(hePath) && fs.existsSync(ruPath)) {
      const enKeys = Object.keys(JSON.parse(fs.readFileSync(enPath, 'utf8')))
      const heKeys = Object.keys(JSON.parse(fs.readFileSync(hePath, 'utf8')))
      const ruKeys = Object.keys(JSON.parse(fs.readFileSync(ruPath, 'utf8')))
      
      // Find missing keys
      const missingInHe = enKeys.filter(key => !heKeys.includes(key))
      const missingInRu = enKeys.filter(key => !ruKeys.includes(key))
      
      if (missingInHe.length > 0) {
        totalErrors += missingInHe.length
      }
      
      if (missingInRu.length > 0) {
        totalErrors += missingInRu.length
      }
      
      if (missingInHe.length === 0 && missingInRu.length === 0) {
        }
    }
  } catch (error) {
    totalErrors++
  }
  
  // Summary
  if (totalErrors === 0) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

// Run validation
validateAllTranslations()