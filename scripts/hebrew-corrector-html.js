#!/usr/bin/env node

/**
 * Hebrew Translation Corrector - HTML Generator
 * Creates an HTML page with Hebrew translations in RTL format and submit buttons
 */

const { Pool } = require('pg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class HebrewCorrectorHTML {
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

  generateHTML(translations, batchNumber, totalBatches) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlContent = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hebrew Translation Corrector - Batch ${batchNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            direction: rtl;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .batch-info {
            background: #ecf0f1;
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #bdc3c7;
        }
        
        .batch-info h2 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .translations-container {
            padding: 30px;
        }
        
        .translation-item {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            margin-bottom: 25px;
            padding: 25px;
            transition: all 0.3s ease;
        }
        
        .translation-item:hover {
            border-color: #007bff;
            box-shadow: 0 5px 15px rgba(0,123,255,0.2);
        }
        
        .translation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #dee2e6;
        }
        
        .translation-number {
            background: #007bff;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .translation-key {
            background: #6c757d;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.9em;
        }
        
        .translation-screen {
            background: #28a745;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.9em;
        }
        
        .content-section {
            margin-bottom: 20px;
        }
        
        .content-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 8px;
            font-size: 1.1em;
        }
        
        .content-text {
            background: white;
            border: 1px solid #ced4da;
            border-radius: 8px;
            padding: 15px;
            font-size: 1.1em;
            line-height: 1.6;
            min-height: 60px;
        }
        
        .hebrew-text {
            font-size: 1.2em;
            font-weight: 500;
            color: #2c3e50;
        }
        
        .azure-suggestion {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
        }
        
        .current-hebrew {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
        }
        
        .english-text {
            background: #f3e5f5;
            border-left: 4px solid #9c27b0;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 25px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }
        
        .btn-approve {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
        }
        
        .btn-approve:hover {
            background: linear-gradient(135deg, #218838 0%, #1ea085 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(40,167,69,0.3);
        }
        
        .btn-deny {
            background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
            color: white;
        }
        
        .btn-deny:hover {
            background: linear-gradient(135deg, #c82333 0%, #c0392b 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(220,53,69,0.3);
        }
        
        .btn-skip {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            color: white;
        }
        
        .btn-skip:hover {
            background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(108,117,125,0.3);
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .footer .instructions {
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .footer .batch-nav {
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        .btn-nav {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            text-decoration: none;
            font-weight: bold;
        }
        
        .btn-nav:hover {
            background: #0056b3;
        }
        
        .stats {
            background: #f8f9fa;
            padding: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
        }
        
        .stats h3 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .stat-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }
        
        .stat-label {
            color: #6c757d;
            font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .action-buttons {
                flex-direction: column;
            }
            
            .translation-header {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 Hebrew Translation Corrector</h1>
            <div class="subtitle">Azure Translator API Integration</div>
        </div>
        
        <div class="batch-info">
            <h2>📋 Batch ${batchNumber} of ${totalBatches}</h2>
            <p>${translations.length} Hebrew translations ready for review</p>
        </div>
        
        <div class="translations-container">
            ${translations.map((translation, index) => `
                <div class="translation-item" id="translation-${translation.content_item_id}">
                    <div class="translation-header">
                        <span class="translation-number">#${index + 1}</span>
                        <span class="translation-key">${translation.content_key}</span>
                        <span class="translation-screen">${translation.screen_location}</span>
                    </div>
                    
                    <div class="content-section">
                        <div class="content-label">📖 English Text:</div>
                        <div class="content-text english-text">${translation.english_text}</div>
                    </div>
                    
                    <div class="content-section">
                        <div class="content-label">📝 Current Hebrew:</div>
                        <div class="content-text current-hebrew hebrew-text">${translation.hebrew_text}</div>
                    </div>
                    
                    <div class="content-section">
                        <div class="content-label">🤖 Azure Suggestion:</div>
                        <div class="content-text azure-suggestion hebrew-text">${translation.azure_suggestion || 'Loading...'}</div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-approve" onclick="approveTranslation(${translation.content_item_id}, '${translation.azure_suggestion?.replace(/'/g, "\\'") || ''}')">
                            ✅ Approve Azure Suggestion
                        </button>
                        <button class="btn btn-deny" onclick="denyTranslation(${translation.content_item_id})">
                            ❌ Keep Current
                        </button>
                        <button class="btn btn-skip" onclick="skipTranslation(${translation.content_item_id})">
                            ⏭️ Skip
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="stats">
            <h3>📊 Batch Statistics</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${translations.length}</div>
                    <div class="stat-label">Total Translations</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="approved-count">0</div>
                    <div class="stat-label">Approved</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="denied-count">0</div>
                    <div class="stat-label">Denied</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="skipped-count">0</div>
                    <div class="stat-label">Skipped</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="instructions">
                <strong>Instructions:</strong> Review each translation and click the appropriate button to approve, deny, or skip.
            </div>
            <div class="batch-nav">
                <a href="hebrew-corrector-batch-${batchNumber - 1}.html" class="btn-nav" ${batchNumber <= 1 ? 'style="display:none"' : ''}>← Previous Batch</a>
                <a href="hebrew-corrector-batch-${batchNumber + 1}.html" class="btn-nav" ${batchNumber >= totalBatches ? 'style="display:none"' : ''}>Next Batch →</a>
            </div>
        </div>
    </div>

    <script>
        let stats = {
            approved: 0,
            denied: 0,
            skipped: 0
        };

        function updateStats() {
            document.getElementById('approved-count').textContent = stats.approved;
            document.getElementById('denied-count').textContent = stats.denied;
            document.getElementById('skipped-count').textContent = stats.skipped;
        }

        function approveTranslation(contentItemId, azureSuggestion) {
            if (!azureSuggestion || azureSuggestion === 'Loading...') {
                alert('Azure suggestion is not available yet. Please wait.');
                return;
            }
            
            if (confirm('Are you sure you want to approve this Azure suggestion?')) {
                // Here you would typically make an API call to update the database
                console.log('Approving translation:', contentItemId, azureSuggestion);
                
                // Update UI
                document.getElementById('translation-' + contentItemId).style.borderColor = '#28a745';
                document.getElementById('translation-' + contentItemId).style.backgroundColor = '#d4edda';
                
                stats.approved++;
                updateStats();
                
                // Disable buttons for this translation
                const buttons = document.querySelectorAll(\`#translation-\${contentItemId} .btn\`);
                buttons.forEach(btn => btn.disabled = true);
                
                alert('Translation approved! (Note: This is a demo - database update would happen here)');
            }
        }

        function denyTranslation(contentItemId) {
            if (confirm('Are you sure you want to keep the current translation?')) {
                console.log('Denying translation:', contentItemId);
                
                // Update UI
                document.getElementById('translation-' + contentItemId).style.borderColor = '#dc3545';
                document.getElementById('translation-' + contentItemId).style.backgroundColor = '#f8d7da';
                
                stats.denied++;
                updateStats();
                
                // Disable buttons for this translation
                const buttons = document.querySelectorAll(\`#translation-\${contentItemId} .btn\`);
                buttons.forEach(btn => btn.disabled = true);
                
                alert('Translation kept unchanged!');
            }
        }

        function skipTranslation(contentItemId) {
            if (confirm('Are you sure you want to skip this translation?')) {
                console.log('Skipping translation:', contentItemId);
                
                // Update UI
                document.getElementById('translation-' + contentItemId).style.borderColor = '#6c757d';
                document.getElementById('translation-' + contentItemId).style.backgroundColor = '#e2e3e5';
                
                stats.skipped++;
                updateStats();
                
                // Disable buttons for this translation
                const buttons = document.querySelectorAll(\`#translation-\${contentItemId} .btn\`);
                buttons.forEach(btn => btn.disabled = true);
                
                alert('Translation skipped!');
            }
        }

        // Auto-save stats to localStorage
        setInterval(() => {
            localStorage.setItem('hebrew-corrector-stats', JSON.stringify(stats));
        }, 5000);

        // Load stats from localStorage on page load
        window.addEventListener('load', () => {
            const savedStats = localStorage.getItem('hebrew-corrector-stats');
            if (savedStats) {
                stats = JSON.parse(savedStats);
                updateStats();
            }
        });
    </script>
</body>
</html>`;

    return htmlContent;
  }

  async processBatch(translations, batchNumber, totalBatches) {
    console.log(`\n🚀 Processing batch ${batchNumber} with ${translations.length} translations...`);
    
    // Get Azure suggestions for all translations
    const translationsWithAzure = [];
    for (let i = 0; i < translations.length; i++) {
      const translation = translations[i];
      console.log(`📝 Processing ${i + 1}/${translations.length}: ${translation.content_key}`);
      
      const azureSuggestion = await this.translateWithAzure(translation.english_text);
      translationsWithAzure.push({
        ...translation,
        azure_suggestion: azureSuggestion
      });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Generate HTML
    const htmlContent = this.generateHTML(translationsWithAzure, batchNumber, totalBatches);
    
    // Save HTML file
    const filename = `hebrew-corrector-batch-${batchNumber}.html`;
    const filepath = path.join(__dirname, '..', filename);
    
    fs.writeFileSync(filepath, htmlContent, 'utf8');
    
    console.log(`✅ Generated HTML file: ${filename}`);
    console.log(`📁 File location: ${filepath}`);
    
    return translationsWithAzure;
  }

  async run(batchSize = 20) {
    console.log('🔍 Hebrew Translation Corrector - HTML Generator');
    console.log('================================================');
    console.log('This tool will generate HTML pages with Hebrew translations');
    console.log('in RTL format with submit buttons for approval/denial');
    console.log(`Batch size: ${batchSize}\n`);
    
    // Get total count first
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM content_items ci
      JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ct_he.content_value IS NOT NULL
      AND ct_he.content_value != ''
      AND ct_en.content_value IS NOT NULL
      AND ct_en.content_value != ''
      AND ct_he.status = 'approved'
      AND ct_en.status = 'approved'
    `;
    
    const totalResult = await this.contentPool.query(totalQuery);
    const totalTranslations = parseInt(totalResult.rows[0].total);
    const totalBatches = Math.ceil(totalTranslations / batchSize);
    
    console.log(`📊 Total translations: ${totalTranslations}`);
    console.log(`📋 Total batches: ${totalBatches}\n`);
    
    let offset = 0;
    let batchNumber = 1;
    
    while (true) {
      const translations = await this.getHebrewTranslations(batchSize, offset);
      
      if (translations.length === 0) {
        console.log('\n✅ No more translations to process');
        break;
      }
      
      this.stats.total += translations.length;
      
      // Process batch
      await this.processBatch(translations, batchNumber, totalBatches);
      
      console.log(`\n📋 Batch ${batchNumber} completed.`);
      console.log(`📁 Open hebrew-corrector-batch-${batchNumber}.html in your browser to review translations.\n`);
      
      // Ask if user wants to continue
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Continue with next batch? (y/n): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('🛑 Processing stopped by user');
        break;
      }
      
      offset += batchSize;
      batchNumber++;
    }
    
    console.log('\n📊 FINAL STATISTICS:');
    console.log('='.repeat(50));
    console.log(`Total processed: ${this.stats.total}`);
    console.log(`Batches generated: ${batchNumber - 1}`);
    
    await this.contentPool.end();
  }
}

// Run the corrector
async function main() {
  const corrector = new HebrewCorrectorHTML();
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

module.exports = HebrewCorrectorHTML;
