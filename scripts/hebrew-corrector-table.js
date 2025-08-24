#!/usr/bin/env node

/**
 * Hebrew Translation Corrector with Table Display
 * Shows Hebrew translations in clear table format with Azure suggestions
 */

const { Pool } = require('pg');
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

class HebrewCorrectorTable {
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

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.stats = { total: 0, approved: 0, denied: 0, skipped: 0 };
  }

  async getHebrewTranslations(limit = 20, offset = 0) {
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
        LIMIT $1 OFFSET $2
      `;

      const result = await this.contentPool.query(query, [limit, offset]);
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

  displayTableHeader() {
    console.log('\n' + '='.repeat(120));
    console.log('📋 HEBREW TRANSLATION CORRECTION TABLE');
    console.log('='.repeat(120));
    console.log('| #  | Key                    | Screen    | English Text                    | Current Hebrew                    | Azure Suggestion                  | Action |');
    console.log('|----|------------------------|-----------|--------------------------------|-----------------------------------|-----------------------------------|--------|');
  }

  displayTableRow(index, translation, azureSuggestion, action = '') {
    const key = translation.content_key.padEnd(22);
    const screen = translation.screen_location.padEnd(9);
    const english = (translation.english_text.length > 30 ? translation.english_text.substring(0, 27) + '...' : translation.english_text).padEnd(32);
    const current = (translation.hebrew_text.length > 30 ? translation.hebrew_text.substring(0, 27) + '...' : translation.hebrew_text).padEnd(33);
    const azure = azureSuggestion ? (azureSuggestion.length > 30 ? azureSuggestion.substring(0, 27) + '...' : azureSuggestion).padEnd(33) : 'N/A'.padEnd(33);
    const actionText = action.padEnd(6);
    
    console.log(`| ${index.toString().padStart(2)} | ${key} | ${screen} | ${english} | ${current} | ${azure} | ${actionText} |`);
  }

  displayTableFooter() {
    console.log('|----|------------------------|-----------|--------------------------------|-----------------------------------|-----------------------------------|--------|');
  }

  displayFullTranslation(index, translation, azureSuggestion) {
    console.log('\n' + '='.repeat(100));
    console.log(`📝 DETAILED VIEW - Translation ${index}`);
    console.log('='.repeat(100));
    console.log(`🔑 Key: ${translation.content_key}`);
    console.log(`📍 Screen: ${translation.screen_location}`);
    console.log(`📖 English: ${translation.english_text}`);
    console.log('');
    console.log('📝 CURRENT HEBREW:');
    console.log('─'.repeat(50));
    console.log(`   ${translation.hebrew_text}`);
    console.log('');
    console.log('🤖 AZURE SUGGESTION:');
    console.log('─'.repeat(50));
    console.log(`   ${azureSuggestion}`);
    console.log('');
    console.log('─'.repeat(100));
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase().trim());
      });
    });
  }

  async processBatch(translations) {
    console.log(`\n🚀 Processing ${translations.length} Hebrew translations...\n`);
    
    // Display table header
    this.displayTableHeader();
    
    // Process each translation
    for (let i = 0; i < translations.length; i++) {
      const translation = translations[i];
      
      // Get Azure suggestion
      const azureSuggestion = await this.translateWithAzure(translation.english_text);
      
      // Display in table format
      this.displayTableRow(i + 1, translation, azureSuggestion);
      
      if (!azureSuggestion) {
        console.log('❌ Azure API error for this translation');
        this.stats.skipped++;
        continue;
      }
      
      // Show detailed view
      this.displayFullTranslation(i + 1, translation, azureSuggestion);
      
      // Ask for decision
      const decision = await this.askQuestion(
        `🤔 DECISION for translation ${i + 1}:\n` +
        `   (y)es - Use Azure suggestion\n` +
        `   (n)o - Keep current translation\n` +
        `   (s)kip - Skip this translation\n` +
        `   (q)uit - Stop processing\n` +
        `\nYour choice: `
      );
      
      let action = '';
      switch (decision) {
        case 'y':
        case 'yes':
          const success = await this.updateHebrewTranslation(
            translation.content_item_id, 
            azureSuggestion
          );
          if (success) {
            action = '✅ YES';
            console.log('✅ Translation updated successfully');
            this.stats.approved++;
          } else {
            action = '❌ FAIL';
            console.log('❌ Update failed');
            this.stats.skipped++;
          }
          break;
          
        case 'n':
        case 'no':
          action = '❌ NO';
          console.log('❌ Translation kept unchanged');
          this.stats.denied++;
          break;
          
        case 's':
        case 'skip':
          action = '⏭️  SKIP';
          console.log('⏭️  Translation skipped');
          this.stats.skipped++;
          break;
          
        case 'q':
        case 'quit':
          console.log('🛑 Processing stopped by user');
          return false;
          
        default:
          action = '❓ INVALID';
          console.log('⏭️  Invalid input - skipping');
          this.stats.skipped++;
          break;
      }
      
      // Update table row with action
      console.log('\n📋 Updated table row:');
      this.displayTableRow(i + 1, translation, azureSuggestion, action);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Display table footer
    this.displayTableFooter();
    
    return true;
  }

  showStats() {
    console.log('\n📊 FINAL STATISTICS:');
    console.log('='.repeat(50));
    console.log(`Total processed: ${this.stats.total}`);
    console.log(`✅ Approved updates: ${this.stats.approved}`);
    console.log(`❌ Denied updates: ${this.stats.denied}`);
    console.log(`⏭️  Skipped: ${this.stats.skipped}`);
    
    if (this.stats.total > 0) {
      const approvalRate = Math.round((this.stats.approved / this.stats.total) * 100);
      console.log(`📈 Approval rate: ${approvalRate}%`);
    }
  }

  async run(batchSize = 20) {
    console.log('🔍 Hebrew Translation Corrector with Table Display');
    console.log('==================================================');
    console.log('This tool will show Hebrew translations in a table format');
    console.log('and let you approve or deny Azure suggestions');
    console.log(`Batch size: ${batchSize}\n`);
    
    let offset = 0;
    let continueProcessing = true;
    
    while (continueProcessing) {
      const translations = await this.getHebrewTranslations(batchSize, offset);
      
      if (translations.length === 0) {
        console.log('\n✅ No more translations to process');
        break;
      }
      
      this.stats.total += translations.length;
      continueProcessing = await this.processBatch(translations);
      
      if (continueProcessing) {
        const continueDecision = await this.askQuestion(
          `\n📋 Processed ${translations.length} translations. Continue with next batch? (y/n): `
        );
        
        if (continueDecision !== 'y' && continueDecision !== 'yes') {
          console.log('🛑 Processing stopped by user');
          break;
        }
        
        offset += batchSize;
      }
    }
    
    this.showStats();
    this.rl.close();
    await this.contentPool.end();
  }
}

// Run the corrector
async function main() {
  const corrector = new HebrewCorrectorTable();
  const batchSize = parseInt(process.argv[2]) || 20;
  
  try {
    await corrector.run(batchSize);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = HebrewCorrectorTable;
