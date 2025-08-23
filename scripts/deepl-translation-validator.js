#!/usr/bin/env node

/**
 * DeepL Translation Validator for Hebrew Database Translations
 * Validates Hebrew translations using DeepL API for quality and accuracy
 */

const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

class DeepLTranslationValidator {
  constructor() {
    // Database connection to content database (shortline)
    this.contentPool = new Pool({
      connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
      ssl: { rejectUnauthorized: false }
    });

    // DeepL API configuration
    this.deeplApiKey = process.env.DEEPL_API_KEY;
    this.deeplApiUrl = 'https://api-free.deepl.com/v2/translate'; // Free API endpoint
    
    if (!this.deeplApiKey) {
      console.error('❌ DEEPL_API_KEY environment variable is required');
      console.log('💡 Get your free API key from: https://www.deepl.com/en/pro/change-plan#developer');
      process.exit(1);
    }
  }

  /**
   * Test DeepL API connection
   */
  async testDeepLConnection() {
    try {
      console.log('🔍 Testing DeepL API connection...');
      
      const response = await axios.post(this.deeplApiUrl, {
        text: ['Hello world'],
        source_lang: 'EN',
        target_lang: 'HE'
      }, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.deeplApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.translations) {
        console.log('✅ DeepL API connection successful');
        console.log(`📊 Usage: ${response.data.translations[0].detected_source_language} → Hebrew`);
        return true;
      }
    } catch (error) {
      console.error('❌ DeepL API connection failed:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Get Hebrew translations from database
   */
  async getHebrewTranslations(limit = 50) {
    try {
      console.log(`📚 Fetching Hebrew translations from database (limit: ${limit})...`);
      
      const query = `
        SELECT 
          ci.content_key,
          ci.screen_location,
          ci.category,
          ct.content_value as hebrew_text,
          ct.status,
          ct.created_at
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ct.language_code = 'he'
        AND ct.content_value IS NOT NULL
        AND ct.content_value != ''
        AND ct.status = 'approved'
        ORDER BY ci.screen_location, ci.content_key
        LIMIT $1
      `;

      const result = await this.contentPool.query(query, [limit]);
      console.log(`✅ Found ${result.rows.length} Hebrew translations`);
      return result.rows;
    } catch (error) {
      console.error('❌ Database query failed:', error.message);
      return [];
    }
  }

  /**
   * Translate text using DeepL API
   */
  async translateWithDeepL(text, sourceLang = 'EN', targetLang = 'HE') {
    try {
      const response = await axios.post(this.deeplApiUrl, {
        text: [text],
        source_lang: sourceLang,
        target_lang: targetLang
      }, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.deeplApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.translations && response.data.translations[0]) {
        return {
          translated: response.data.translations[0].text,
          detected_lang: response.data.translations[0].detected_source_language,
          confidence: response.data.translations[0].detected_source_language_confidence || 1.0
        };
      }
    } catch (error) {
      console.error('❌ DeepL translation failed:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Validate Hebrew translation quality
   */
  async validateHebrewTranslation(originalText, hebrewText) {
    try {
      // First, translate Hebrew back to English to check accuracy
      const hebrewToEnglish = await this.translateWithDeepL(hebrewText, 'HE', 'EN');
      
      if (!hebrewToEnglish) {
        return { status: 'error', message: 'DeepL API error' };
      }

      // Calculate similarity score (simple approach)
      const similarity = this.calculateTextSimilarity(originalText.toLowerCase(), hebrewToEnglish.translated.toLowerCase());
      
      // Determine quality level
      let quality = 'poor';
      let issues = [];

      if (similarity >= 0.8) {
        quality = 'excellent';
      } else if (similarity >= 0.6) {
        quality = 'good';
      } else if (similarity >= 0.4) {
        quality = 'fair';
      } else {
        quality = 'poor';
        issues.push('Significant meaning deviation');
      }

      // Check for common Hebrew translation issues
      if (hebrewText.length < 2) {
        issues.push('Very short translation');
      }

      if (!/[\u0590-\u05FF]/.test(hebrewText)) {
        issues.push('No Hebrew characters detected');
      }

      return {
        status: 'success',
        quality,
        similarity: Math.round(similarity * 100),
        original: originalText,
        hebrew: hebrewText,
        back_translation: hebrewToEnglish.translated,
        detected_lang: hebrewToEnglish.detected_lang,
        issues
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Calculate text similarity (simple Levenshtein-based)
   */
  calculateTextSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein distance calculation
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Get English reference translations
   */
  async getEnglishReference(contentKey) {
    try {
      const query = `
        SELECT ct.content_value as english_text
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.content_key = $1
        AND ct.language_code = 'en'
        AND ct.status = 'approved'
        LIMIT 1
      `;

      const result = await this.contentPool.query(query, [contentKey]);
      return result.rows[0]?.english_text || null;
    } catch (error) {
      console.error('❌ Error fetching English reference:', error.message);
      return null;
    }
  }

  /**
   * Generate comprehensive validation report
   */
  async generateValidationReport(limit = 20) {
    console.log('\n🔍 Starting Hebrew translation validation...\n');

    // Test DeepL connection
    const deeplConnected = await this.testDeepLConnection();
    if (!deeplConnected) {
      console.log('❌ Cannot proceed without DeepL API connection');
      return;
    }

    // Get Hebrew translations
    const hebrewTranslations = await this.getHebrewTranslations(limit);
    if (hebrewTranslations.length === 0) {
      console.log('❌ No Hebrew translations found in database');
      return;
    }

    console.log('\n📊 Validation Results:\n');
    console.log('='.repeat(80));

    const results = {
      total: hebrewTranslations.length,
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      errors: 0,
      details: []
    };

    for (const translation of hebrewTranslations) {
      console.log(`\n🔍 Validating: ${translation.content_key}`);
      console.log(`📍 Screen: ${translation.screen_location}`);
      console.log(`📝 Hebrew: ${translation.hebrew_text}`);

      // Get English reference
      const englishReference = await this.getEnglishReference(translation.content_key);
      
      if (englishReference) {
        console.log(`📖 English: ${englishReference}`);
        
        // Validate translation
        const validation = await this.validateHebrewTranslation(englishReference, translation.hebrew_text);
        
        if (validation.status === 'success') {
          console.log(`✅ Quality: ${validation.quality.toUpperCase()} (${validation.similarity}% similarity)`);
          console.log(`🔄 Back-translation: ${validation.back_translation}`);
          
          if (validation.issues.length > 0) {
            console.log(`⚠️  Issues: ${validation.issues.join(', ')}`);
          }

          // Update statistics
          results[validation.quality]++;
          results.details.push({
            content_key: translation.content_key,
            screen_location: translation.screen_location,
            quality: validation.quality,
            similarity: validation.similarity,
            hebrew: translation.hebrew_text,
            english: englishReference,
            back_translation: validation.back_translation,
            issues: validation.issues
          });
        } else {
          console.log(`❌ Validation error: ${validation.message}`);
          results.errors++;
        }
      } else {
        console.log(`⚠️  No English reference found`);
        results.errors++;
      }

      console.log('-'.repeat(40));
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Print summary
    console.log('\n📈 VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total translations checked: ${results.total}`);
    console.log(`✅ Excellent quality: ${results.excellent}`);
    console.log(`👍 Good quality: ${results.good}`);
    console.log(`⚠️  Fair quality: ${results.fair}`);
    console.log(`❌ Poor quality: ${results.poor}`);
    console.log(`🚫 Errors: ${results.errors}`);

    const qualityPercentage = Math.round(((results.excellent + results.good) / results.total) * 100);
    console.log(`\n🎯 Overall quality score: ${qualityPercentage}%`);

    // Save detailed report
    await this.saveDetailedReport(results);
  }

  /**
   * Save detailed validation report
   */
  async saveDetailedReport(results) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = `deepl-validation-report-${timestamp}.json`;
      
      const fs = require('fs');
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      
      console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    } catch (error) {
      console.error('❌ Error saving report:', error.message);
    }
  }

  /**
   * Suggest improvements for poor translations
   */
  async suggestImprovements(contentKey, hebrewText, englishReference) {
    try {
      console.log(`\n💡 Generating improvement suggestions for: ${contentKey}`);
      
      // Get DeepL's suggested translation
      const deeplTranslation = await this.translateWithDeepL(englishReference, 'EN', 'HE');
      
      if (deeplTranslation) {
        console.log(`📝 Current Hebrew: ${hebrewText}`);
        console.log(`🤖 DeepL suggestion: ${deeplTranslation.translated}`);
        
        return {
          content_key: contentKey,
          current: hebrewText,
          suggested: deeplTranslation.translated,
          confidence: deeplTranslation.confidence
        };
      }
    } catch (error) {
      console.error('❌ Error generating suggestions:', error.message);
    }
  }

  /**
   * Batch improve poor translations
   */
  async batchImproveTranslations(qualityThreshold = 0.6) {
    console.log('\n🔄 Starting batch improvement process...\n');

    const hebrewTranslations = await this.getHebrewTranslations(100);
    const improvements = [];

    for (const translation of hebrewTranslations) {
      const englishReference = await this.getEnglishReference(translation.content_key);
      
      if (englishReference) {
        const validation = await this.validateHebrewTranslation(englishReference, translation.hebrew_text);
        
        if (validation.status === 'success' && validation.similarity < qualityThreshold * 100) {
          const improvement = await this.suggestImprovements(
            translation.content_key,
            translation.hebrew_text,
            englishReference
          );
          
          if (improvement) {
            improvements.push(improvement);
          }
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (improvements.length > 0) {
      console.log(`\n📋 Found ${improvements.length} translations that need improvement:`);
      improvements.forEach(imp => {
        console.log(`\n🔧 ${imp.content_key}:`);
        console.log(`   Current: ${imp.current}`);
        console.log(`   Suggested: ${imp.suggested}`);
      });

      // Save improvements to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fs = require('fs');
      fs.writeFileSync(`hebrew-improvements-${timestamp}.json`, JSON.stringify(improvements, null, 2));
      console.log(`\n💾 Improvements saved to: hebrew-improvements-${timestamp}.json`);
    } else {
      console.log('\n✅ All translations meet quality threshold!');
    }
  }
}

// CLI interface
async function main() {
  const validator = new DeepLTranslationValidator();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'validate';
  const limit = parseInt(args[1]) || 20;

  try {
    switch (command) {
      case 'validate':
        await validator.generateValidationReport(limit);
        break;
      case 'improve':
        const threshold = parseFloat(args[1]) || 0.6;
        await validator.batchImproveTranslations(threshold);
        break;
      case 'test':
        await validator.testDeepLConnection();
        break;
      default:
        console.log('Usage:');
        console.log('  node deepl-translation-validator.js validate [limit]  - Validate Hebrew translations');
        console.log('  node deepl-translation-validator.js improve [threshold]  - Suggest improvements');
        console.log('  node deepl-translation-validator.js test  - Test DeepL API connection');
        console.log('\nExamples:');
        console.log('  node deepl-translation-validator.js validate 50');
        console.log('  node deepl-translation-validator.js improve 0.7');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await validator.contentPool.end();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DeepLTranslationValidator;
