#!/usr/bin/env node

/**
 * Hebrew Translation Corrector
 * Analyzes Hebrew translations in content database and suggests corrections using Azure Translator API
 * Shows 20 translations at a time with approve/deny functionality
 */

const { Pool } = require('pg');
const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
require('dotenv').config();

class HebrewTranslationCorrector {
  constructor() {
    // Database connection to content database (local or Railway)
    const connectionString = process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway';
    const isLocalDatabase = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    
    this.contentPool = new Pool({
      connectionString: connectionString,
      ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
    });

    // Azure Translator API configuration
    this.azureApiKey = process.env.AZURE_TRANSLATOR_KEY;
    this.azureEndpoint = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';
    this.azureRegion = process.env.AZURE_TRANSLATOR_REGION || 'eastasia';
    
    if (!this.azureApiKey) {
      console.error('❌ AZURE_TRANSLATOR_KEY environment variable is required');
      process.exit(1);
    }

    // Create readline interface for user input
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Statistics
    this.stats = {
      total: 0,
      approved: 0,
      denied: 0,
      skipped: 0,
      errors: 0
    };
  }

  /**
   * Generate a unique trace ID for Azure API calls
   */
  generateTraceId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get Hebrew translations from database with English references
   */
  async getHebrewTranslations(limit = 20, offset = 0) {
    try {
      console.log(`📚 Fetching Hebrew translations (limit: ${limit}, offset: ${offset})...`);
      
      const query = `
        SELECT 
          ci.id as content_item_id,
          ci.content_key,
          ci.screen_location,
          ci.category,
          ct_he.content_value as hebrew_text,
          ct_en.content_value as english_text,
          ct_he.status as hebrew_status,
          ct_he.created_at
        FROM content_items ci
        JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
        JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
        WHERE ct_he.content_value IS NOT NULL
        AND ct_he.content_value != ''
        AND ct_en.content_value IS NOT NULL
        AND ct_en.content_value != ''
        AND ct_he.status = 'approved'
        AND ct_en.status = 'approved'
        ORDER BY ci.screen_location, ci.content_key
        LIMIT $1 OFFSET $2
      `;

      const result = await this.contentPool.query(query, [limit, offset]);
      console.log(`✅ Found ${result.rows.length} Hebrew translations`);
      return result.rows;
    } catch (error) {
      console.error('❌ Database query failed:', error.message);
      return [];
    }
  }

  /**
   * Translate text using Azure Translator API
   */
  async translateWithAzure(text, sourceLang = 'en', targetLang = 'he') {
    try {
      const response = await axios.post(`${this.azureEndpoint}/translate`, [
        { text: text }
      ], {
        params: {
          'api-version': '3.0',
          'from': sourceLang,
          'to': targetLang
        },
        headers: {
          'Ocp-Apim-Subscription-Key': this.azureApiKey,
          'Ocp-Apim-Subscription-Region': this.azureRegion,
          'Content-Type': 'application/json',
          'X-ClientTraceId': this.generateTraceId()
        }
      });

      if (response.data && response.data[0] && response.data[0].translations) {
        return {
          translated: response.data[0].translations[0].text,
          detected_lang: response.data[0].detectedLanguage?.language || sourceLang,
          confidence: response.data[0].detectedLanguage?.score || 1.0
        };
      }
    } catch (error) {
      console.error('❌ Azure translation failed:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Analyze translation quality and get Azure suggestion
   */
  async analyzeTranslation(englishText, hebrewText) {
    try {
      // Get Azure's suggestion
      const azureSuggestion = await this.translateWithAzure(englishText, 'en', 'he');
      
      if (!azureSuggestion) {
        return { status: 'error', message: 'Azure API error' };
      }

      // Calculate similarity between current Hebrew and Azure suggestion
      const similarity = this.calculateTextSimilarity(hebrewText, azureSuggestion.translated);
      
      // Determine if correction is needed
      let needsCorrection = false;
      let correctionReason = '';

      if (similarity < 0.8) {
        needsCorrection = true;
        if (similarity < 0.6) {
          correctionReason = 'Significant difference detected';
        } else {
          correctionReason = 'Moderate difference detected';
        }
      }

      // Check for specific issues
      const issues = [];
      if (hebrewText.length < 2) issues.push('very_short');
      if (!/[\u0590-\u05FF]/.test(hebrewText)) issues.push('no_hebrew_chars');
      if (hebrewText.length > azureSuggestion.translated.length * 2) issues.push('too_long');
      if (hebrewText.length < azureSuggestion.translated.length * 0.5) issues.push('too_short');

      if (issues.length > 0) {
        needsCorrection = true;
        correctionReason = `Issues detected: ${issues.join(', ')}`;
      }

      return {
        status: 'success',
        needsCorrection,
        correctionReason,
        similarity: Math.round(similarity * 100),
        azure_suggestion: azureSuggestion.translated,
        current_hebrew: hebrewText,
        english_reference: englishText,
        issues
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Calculate text similarity (Levenshtein-based)
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
   * Update Hebrew translation in database
   */
  async updateHebrewTranslation(contentItemId, newHebrewText) {
    try {
      const query = `
        UPDATE content_translations 
        SET content_value = $1, updated_at = NOW()
        WHERE content_item_id = $2 AND language_code = 'he'
      `;
      
      await this.contentPool.query(query, [newHebrewText, contentItemId]);
      return true;
    } catch (error) {
      console.error('❌ Database update failed:', error.message);
      return false;
    }
  }

  /**
   * Ask user for input with timeout
   */
  async askQuestion(question, timeout = 30000) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.log('\n⏰ Timeout - skipping this translation');
        resolve('skip');
      }, timeout);

      this.rl.question(question, (answer) => {
        clearTimeout(timer);
        resolve(answer.toLowerCase().trim());
      });
    });
  }

  /**
   * Display translation comparison
   */
  displayTranslation(index, total, translation, analysis) {
    console.log('\n' + '='.repeat(80));
    console.log(`📝 Translation ${index + 1} of ${total}`);
    console.log('='.repeat(80));
    
    console.log(`🔑 Content Key: ${translation.content_key}`);
    console.log(`📍 Screen: ${translation.screen_location}`);
    console.log(`📖 English: ${translation.english_text}`);
    
    // Display Hebrew text in RTL format with proper spacing
    console.log(`📝 Current Hebrew: ${translation.hebrew_text}`);
    
    if (analysis.status === 'success') {
      console.log(`🤖 Azure Suggestion: ${analysis.azure_suggestion}`);
      console.log(`📊 Similarity: ${analysis.similarity}%`);
      
      if (analysis.needsCorrection) {
        console.log(`⚠️  Correction Needed: ${analysis.correctionReason}`);
        if (analysis.issues.length > 0) {
          console.log(`🔍 Issues: ${analysis.issues.join(', ')}`);
        }
        
        // Show comparison side by side for better RTL viewing
        console.log('\n📋 COMPARISON:');
        console.log('─'.repeat(40));
        console.log(`Current:  ${translation.hebrew_text}`);
        console.log(`Azure:    ${analysis.azure_suggestion}`);
        console.log('─'.repeat(40));
      } else {
        console.log(`✅ No correction needed (similarity >= 80%)`);
      }
    } else {
      console.log(`❌ Analysis Error: ${analysis.message}`);
    }
    
    console.log('-'.repeat(80));
  }

  /**
   * Process a batch of translations
   */
  async processBatch(translations) {
    console.log(`\n🚀 Processing ${translations.length} Hebrew translations...\n`);
    
    for (let i = 0; i < translations.length; i++) {
      const translation = translations[i];
      
      // Analyze translation
      const analysis = await this.analyzeTranslation(translation.english_text, translation.hebrew_text);
      
      // Display translation
      this.displayTranslation(i, translations.length, translation, analysis);
      
      // Skip if no correction needed or error
      if (analysis.status !== 'success' || !analysis.needsCorrection) {
        if (analysis.status === 'success' && !analysis.needsCorrection) {
          console.log('✅ Skipping - no correction needed');
          this.stats.skipped++;
        } else {
          console.log('❌ Skipping - analysis error');
          this.stats.errors++;
        }
        continue;
      }
      
      // Ask user for decision
      const decision = await this.askQuestion(
        `\n🤔 Do you want to update this translation?\n` +
        `   (y)es - Use Azure suggestion\n` +
        `   (n)o - Keep current translation\n` +
        `   (s)kip - Skip this translation\n` +
        `   (q)uit - Stop processing\n` +
        `\nYour choice: `,
        60000 // 60 second timeout
      );
      
      switch (decision) {
        case 'y':
        case 'yes':
          const success = await this.updateHebrewTranslation(
            translation.content_item_id, 
            analysis.azure_suggestion
          );
          if (success) {
            console.log('✅ Translation updated successfully');
            this.stats.approved++;
          } else {
            console.log('❌ Failed to update translation');
            this.stats.errors++;
          }
          break;
          
        case 'n':
        case 'no':
          console.log('❌ Translation kept unchanged');
          this.stats.denied++;
          break;
          
        case 's':
        case 'skip':
          console.log('⏭️  Translation skipped');
          this.stats.skipped++;
          break;
          
        case 'q':
        case 'quit':
          console.log('🛑 Processing stopped by user');
          return false; // Stop processing
          
        default:
          console.log('⏭️  Invalid input - skipping');
          this.stats.skipped++;
          break;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return true; // Continue processing
  }

  /**
   * Show statistics
   */
  showStats() {
    console.log('\n📊 PROCESSING STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total processed: ${this.stats.total}`);
    console.log(`✅ Approved updates: ${this.stats.approved}`);
    console.log(`❌ Denied updates: ${this.stats.denied}`);
    console.log(`⏭️  Skipped: ${this.stats.skipped}`);
    console.log(`🚫 Errors: ${this.stats.errors}`);
    
    if (this.stats.total > 0) {
      const approvalRate = Math.round((this.stats.approved / this.stats.total) * 100);
      console.log(`📈 Approval rate: ${approvalRate}%`);
    }
  }

  /**
   * Main processing function
   */
  async processHebrewTranslations(batchSize = 20) {
    console.log('🔍 Hebrew Translation Corrector');
    console.log('================================');
    console.log('This tool will analyze Hebrew translations and suggest corrections using Azure Translator API');
    console.log(`Batch size: ${batchSize} translations per batch\n`);
    
    let offset = 0;
    let continueProcessing = true;
    
    while (continueProcessing) {
      // Get batch of translations
      const translations = await this.getHebrewTranslations(batchSize, offset);
      
      if (translations.length === 0) {
        console.log('\n✅ No more translations to process');
        break;
      }
      
      this.stats.total += translations.length;
      
      // Process batch
      continueProcessing = await this.processBatch(translations);
      
      if (continueProcessing) {
        // Ask if user wants to continue with next batch
        const continueDecision = await this.askQuestion(
          `\n📋 Processed ${translations.length} translations. Continue with next batch? (y/n): `,
          30000
        );
        
        if (continueDecision !== 'y' && continueDecision !== 'yes') {
          console.log('🛑 Processing stopped by user');
          break;
        }
        
        offset += batchSize;
      }
    }
    
    // Show final statistics
    this.showStats();
    
    // Close readline interface
    this.rl.close();
    
    // Close database connection
    await this.contentPool.end();
  }
}

// CLI interface
async function main() {
  const corrector = new HebrewTranslationCorrector();
  
  const args = process.argv.slice(2);
  const batchSize = parseInt(args[0]) || 20;

  try {
    await corrector.processHebrewTranslations(batchSize);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = HebrewTranslationCorrector;
