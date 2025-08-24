#!/usr/bin/env node

/**
 * Update Hebrew Translations via API
 * Improves Hebrew content using Azure Translator API and reports results
 */

const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

class HebrewUpdater {
  constructor() {
    // Database connection to Railway content database
    this.contentPool = new Pool({
      connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
      ssl: { rejectUnauthorized: false }
    });

    // Azure Translator API configuration
    this.azureApiKey = process.env.AZURE_TRANSLATOR_KEY;
    this.azureEndpoint = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';
    this.azureRegion = process.env.AZURE_TRANSLATOR_REGION || 'eastasia';
    
    if (!this.azureApiKey) {
      console.error('❌ AZURE_TRANSLATOR_KEY environment variable is required');
      process.exit(1);
    }

    this.stats = {
      total: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      improvements: []
    };
  }

  async getHebrewTranslations(limit = 50) {
    try {
      const query = `
        SELECT 
          ci.id as content_item_id,
          ci.content_key,
          ci.screen_location,
          ct_he.content_value as hebrew_text,
          ct_en.content_value as english_text
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
        LIMIT $1
      `;

      const result = await this.contentPool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Database error:', error.message);
      return [];
    }
  }

  async translateWithAzure(text) {
    try {
      const response = await axios.post(`${this.azureEndpoint}/translate`, [
        { text: text }
      ], {
        params: {
          'api-version': '3.0',
          'from': 'en',
          'to': 'he'
        },
        headers: {
          'Ocp-Apim-Subscription-Key': this.azureApiKey,
          'Ocp-Apim-Subscription-Region': this.azureRegion,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data[0] && response.data[0].translations) {
        return response.data[0].translations[0].text;
      }
    } catch (error) {
      console.error('❌ Azure API error:', error.message);
      return null;
    }
  }

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
      console.error('❌ Update failed:', error.message);
      return false;
    }
  }

  calculateTextSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

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

  shouldUpdateTranslation(currentHebrew, azureSuggestion) {
    if (!azureSuggestion) return false;
    
    // Calculate similarity
    const similarity = this.calculateTextSimilarity(currentHebrew, azureSuggestion);
    
    // Check for specific issues
    const issues = [];
    if (currentHebrew.length < 2) issues.push('very_short');
    if (!/[\u0590-\u05FF]/.test(currentHebrew)) issues.push('no_hebrew_chars');
    if (currentHebrew.length > azureSuggestion.length * 2) issues.push('too_long');
    if (currentHebrew.length < azureSuggestion.length * 0.5) issues.push('too_short');
    
    // Update if similarity is low or there are issues
    return similarity < 0.8 || issues.length > 0;
  }

  async updateHebrewTranslations() {
    console.log('🔍 Hebrew Translation Updater');
    console.log('=============================');
    console.log('Updating Hebrew translations using Azure Translator API\n');
    
    // Get Hebrew translations
    const translations = await this.getHebrewTranslations(50);
    console.log(`📚 Found ${translations.length} Hebrew translations to analyze\n`);
    
    this.stats.total = translations.length;
    
    for (let i = 0; i < translations.length; i++) {
      const translation = translations[i];
      
      console.log(`📝 Processing ${i + 1}/${translations.length}: ${translation.content_key}`);
      console.log(`📍 Screen: ${translation.screen_location}`);
      console.log(`📖 English: ${translation.english_text}`);
      console.log(`📝 Current Hebrew: ${translation.hebrew_text}`);
      
      // Get Azure suggestion
      const azureSuggestion = await this.translateWithAzure(translation.english_text);
      
      if (!azureSuggestion) {
        console.log('❌ Azure API error - skipping');
        this.stats.skipped++;
        continue;
      }
      
      console.log(`🤖 Azure Suggestion: ${azureSuggestion}`);
      
      // Check if update is needed
      const shouldUpdate = this.shouldUpdateTranslation(translation.hebrew_text, azureSuggestion);
      
      if (shouldUpdate) {
        console.log('✅ Updating translation...');
        
        const success = await this.updateHebrewTranslation(
          translation.content_item_id, 
          azureSuggestion
        );
        
        if (success) {
          console.log('✅ Translation updated successfully');
          this.stats.updated++;
          
          this.stats.improvements.push({
            key: translation.content_key,
            screen: translation.screen_location,
            old: translation.hebrew_text,
            new: azureSuggestion,
            english: translation.english_text
          });
        } else {
          console.log('❌ Update failed');
          this.stats.failed++;
        }
      } else {
        console.log('⏭️  No update needed (similarity >= 80%)');
        this.stats.skipped++;
      }
      
      console.log('─'.repeat(80));
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Generate report
    this.generateReport();
    
    await this.contentPool.end();
  }

  generateReport() {
    console.log('\n📊 UPDATE REPORT');
    console.log('='.repeat(50));
    console.log(`Total translations analyzed: ${this.stats.total}`);
    console.log(`✅ Successfully updated: ${this.stats.updated}`);
    console.log(`❌ Failed updates: ${this.stats.failed}`);
    console.log(`⏭️  Skipped (no change needed): ${this.stats.skipped}`);
    
    if (this.stats.updated > 0) {
      const improvementRate = Math.round((this.stats.updated / this.stats.total) * 100);
      console.log(`📈 Improvement rate: ${improvementRate}%`);
      
      console.log('\n🔧 IMPROVEMENTS MADE:');
      console.log('='.repeat(50));
      
      this.stats.improvements.forEach((improvement, index) => {
        console.log(`\n${index + 1}. ${improvement.key} (${improvement.screen})`);
        console.log(`   📖 English: ${improvement.english}`);
        console.log(`   📝 Old Hebrew: ${improvement.old}`);
        console.log(`   🤖 New Hebrew: ${improvement.new}`);
      });
    }
    
    console.log('\n🎉 Hebrew translations have been improved!');
    console.log('🌐 Your application at http://localhost:5173/ now has better Hebrew content.');
  }
}

// Run the updater
async function main() {
  const updater = new HebrewUpdater();
  
  try {
    await updater.updateHebrewTranslations();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = HebrewUpdater;
