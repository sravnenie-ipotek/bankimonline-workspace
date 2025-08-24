#!/usr/bin/env node

/**
 * Simple Hebrew Translation Corrector
 * Shows Hebrew translations in RTL format with Azure suggestions
 */

const { Pool } = require('pg');
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

class SimpleHebrewCorrector {
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

  displayHebrewTranslation(index, total, translation, azureSuggestion) {
    console.log('\n' + '='.repeat(80));
    console.log(`📝 Hebrew Translation ${index + 1} of ${total}`);
    console.log('='.repeat(80));
    
    console.log(`🔑 Key: ${translation.content_key}`);
    console.log(`📍 Screen: ${translation.screen_location}`);
    console.log(`📖 English: ${translation.english_text}`);
    console.log('');
    
    // RTL Hebrew display
    console.log('📝 CURRENT HEBREW:');
    console.log('─'.repeat(50));
    console.log(`   ${translation.hebrew_text}`);
    console.log('');
    
    if (azureSuggestion) {
      console.log('🤖 AZURE SUGGESTION:');
      console.log('─'.repeat(50));
      console.log(`   ${azureSuggestion}`);
      console.log('');
    }
    
    console.log('─'.repeat(80));
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
    
    for (let i = 0; i < translations.length; i++) {
      const translation = translations[i];
      
      // Get Azure suggestion
      const azureSuggestion = await this.translateWithAzure(translation.english_text);
      
      // Display translation
      this.displayHebrewTranslation(i + 1, translations.length, translation, azureSuggestion);
      
      if (!azureSuggestion) {
        console.log('❌ Skipping - Azure API error');
        this.stats.skipped++;
        continue;
      }
      
      // Ask for decision
      const decision = await this.askQuestion(
        `🤔 Update to Azure suggestion? (y/n/s/q): `
      );
      
      switch (decision) {
        case 'y':
        case 'yes':
          const success = await this.updateHebrewTranslation(
            translation.content_item_id, 
            azureSuggestion
          );
          if (success) {
            console.log('✅ Updated successfully');
            this.stats.approved++;
          } else {
            console.log('❌ Update failed');
            this.stats.skipped++;
          }
          break;
          
        case 'n':
        case 'no':
          console.log('❌ Kept unchanged');
          this.stats.denied++;
          break;
          
        case 's':
        case 'skip':
          console.log('⏭️  Skipped');
          this.stats.skipped++;
          break;
          
        case 'q':
        case 'quit':
          console.log('🛑 Stopping...');
          return false;
          
        default:
          console.log('⏭️  Invalid - skipping');
          this.stats.skipped++;
          break;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return true;
  }

  showStats() {
    console.log('\n📊 STATISTICS:');
    console.log('='.repeat(30));
    console.log(`Total: ${this.stats.total}`);
    console.log(`✅ Approved: ${this.stats.approved}`);
    console.log(`❌ Denied: ${this.stats.denied}`);
    console.log(`⏭️  Skipped: ${this.stats.skipped}`);
  }

  async run(batchSize = 20) {
    console.log('🔍 Hebrew Translation Corrector (Railway DB)');
    console.log('============================================');
    console.log(`Batch size: ${batchSize}\n`);
    
    let offset = 0;
    let continueProcessing = true;
    
    while (continueProcessing) {
      const translations = await this.getHebrewTranslations(batchSize, offset);
      
      if (translations.length === 0) {
        console.log('\n✅ No more translations');
        break;
      }
      
      this.stats.total += translations.length;
      continueProcessing = await this.processBatch(translations);
      
      if (continueProcessing) {
        const continueDecision = await this.askQuestion(
          `\n📋 Continue with next batch? (y/n): `
        );
        
        if (continueDecision !== 'y' && continueDecision !== 'yes') {
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
  const corrector = new SimpleHebrewCorrector();
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

module.exports = SimpleHebrewCorrector;
