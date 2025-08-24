#!/usr/bin/env node

/**
 * Hebrew Translation Analyzer
 * Analyzes Hebrew translations in content database and compares with Azure Translator API suggestions
 * Creates detailed comparison reports without updating the database
 */

const { Pool } = require('pg');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

class HebrewTranslationAnalyzer {
  constructor() {
    // Database connection to content database (local or Railway)
    const connectionString = process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway';
    
    // Check if it's a local database (no SSL needed)
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
  async getHebrewTranslationsWithEnglish(limit = 50) {
    try {
      console.log(`📚 Fetching Hebrew translations with English references (limit: ${limit})...`);
      
      const query = `
        SELECT 
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
        LIMIT $1
      `;

      const result = await this.contentPool.query(query, [limit]);
      console.log(`✅ Found ${result.rows.length} Hebrew translations with English references`);
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
   * Analyze translation quality and differences
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
      
      // Determine analysis result
      let analysis = 'identical';
      let recommendation = 'keep_current';
      let confidence = 'high';

      if (similarity >= 0.95) {
        analysis = 'identical';
        recommendation = 'keep_current';
        confidence = 'high';
      } else if (similarity >= 0.8) {
        analysis = 'very_similar';
        recommendation = 'keep_current';
        confidence = 'high';
      } else if (similarity >= 0.6) {
        analysis = 'similar';
        recommendation = 'consider_azure';
        confidence = 'medium';
      } else if (similarity >= 0.4) {
        analysis = 'different';
        recommendation = 'review_azure';
        confidence = 'medium';
      } else {
        analysis = 'very_different';
        recommendation = 'use_azure';
        confidence = 'high';
      }

      // Check for specific issues
      const issues = [];
      if (hebrewText.length < 2) issues.push('very_short');
      if (!/[\u0590-\u05FF]/.test(hebrewText)) issues.push('no_hebrew_chars');
      if (hebrewText.length > azureSuggestion.translated.length * 2) issues.push('too_long');
      if (hebrewText.length < azureSuggestion.translated.length * 0.5) issues.push('too_short');

      return {
        status: 'success',
        analysis,
        similarity: Math.round(similarity * 100),
        recommendation,
        confidence,
        issues,
        azure_suggestion: azureSuggestion.translated,
        current_hebrew: hebrewText,
        english_reference: englishText
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
   * Generate comprehensive analysis report
   */
  async generateAnalysisReport(limit = 20) {
    console.log('\n🔍 Starting Hebrew translation analysis...\n');

    // Get translations from database
    const translations = await this.getHebrewTranslationsWithEnglish(limit);
    if (translations.length === 0) {
      console.log('❌ No Hebrew translations found in database');
      return;
    }

    console.log('\n📊 Analysis Results:\n');
    console.log('='.repeat(120));

    const results = {
      total: translations.length,
      identical: 0,
      very_similar: 0,
      similar: 0,
      different: 0,
      very_different: 0,
      errors: 0,
      recommendations: {
        keep_current: 0,
        consider_azure: 0,
        review_azure: 0,
        use_azure: 0
      },
      details: []
    };

    for (const translation of translations) {
      console.log(`\n🔍 Analyzing: ${translation.content_key}`);
      console.log(`📍 Screen: ${translation.screen_location}`);
      console.log(`📖 English: ${translation.english_text}`);
      console.log(`📝 Current Hebrew: ${translation.hebrew_text}`);

      // Analyze translation
      const analysis = await this.analyzeTranslation(translation.english_text, translation.hebrew_text);
      
      if (analysis.status === 'success') {
        console.log(`🤖 Azure Suggestion: ${analysis.azure_suggestion}`);
        console.log(`📊 Similarity: ${analysis.similarity}%`);
        console.log(`🎯 Analysis: ${analysis.analysis.toUpperCase()}`);
        console.log(`💡 Recommendation: ${analysis.recommendation.replace('_', ' ').toUpperCase()}`);
        console.log(`🎯 Confidence: ${analysis.confidence.toUpperCase()}`);
        
        if (analysis.issues.length > 0) {
          console.log(`⚠️  Issues: ${analysis.issues.join(', ')}`);
        }

        // Update statistics
        results[analysis.analysis]++;
        results.recommendations[analysis.recommendation]++;
        
        results.details.push({
          content_key: translation.content_key,
          screen_location: translation.screen_location,
          category: translation.category,
          english_text: translation.english_text,
          current_hebrew: translation.hebrew_text,
          azure_suggestion: analysis.azure_suggestion,
          similarity: analysis.similarity,
          analysis: analysis.analysis,
          recommendation: analysis.recommendation,
          confidence: analysis.confidence,
          issues: analysis.issues
        });
      } else {
        console.log(`❌ Analysis error: ${analysis.message}`);
        results.errors++;
      }

      console.log('-'.repeat(60));
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Print summary
    console.log('\n📈 ANALYSIS SUMMARY');
    console.log('='.repeat(120));
    console.log(`Total translations analyzed: ${results.total}`);
    console.log(`✅ Identical: ${results.identical}`);
    console.log(`👍 Very Similar: ${results.very_similar}`);
    console.log(`⚠️  Similar: ${results.similar}`);
    console.log(`🔄 Different: ${results.different}`);
    console.log(`❌ Very Different: ${results.very_different}`);
    console.log(`🚫 Errors: ${results.errors}`);

    console.log('\n💡 RECOMMENDATIONS:');
    console.log(`✅ Keep Current: ${results.recommendations.keep_current}`);
    console.log(`🤔 Consider Azure: ${results.recommendations.consider_azure}`);
    console.log(`🔍 Review Azure: ${results.recommendations.review_azure}`);
    console.log(`🔄 Use Azure: ${results.recommendations.use_azure}`);

    const qualityPercentage = Math.round(((results.identical + results.very_similar) / results.total) * 100);
    console.log(`\n🎯 Overall Quality Score: ${qualityPercentage}%`);

    // Save detailed report
    await this.saveDetailedReport(results);
    
    // Generate comparison table
    await this.generateComparisonTable(results.details);
  }

  /**
   * Save detailed analysis report
   */
  async saveDetailedReport(results) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = `hebrew-analysis-report-${timestamp}.json`;
      
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      
      console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    } catch (error) {
      console.error('❌ Error saving report:', error.message);
    }
  }

  /**
   * Generate comparison table (CSV format)
   */
  async generateComparisonTable(details) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const csvPath = `hebrew-comparison-table-${timestamp}.csv`;
      
      // CSV header
      let csv = 'Content Key,Screen Location,Category,English Text,Current Hebrew,Azure Suggestion,Similarity %,Analysis,Recommendation,Confidence,Issues\n';
      
      // Add data rows
      details.forEach(item => {
        const row = [
          `"${item.content_key}"`,
          `"${item.screen_location}"`,
          `"${item.category || ''}"`,
          `"${item.english_text.replace(/"/g, '""')}"`,
          `"${item.current_hebrew.replace(/"/g, '""')}"`,
          `"${item.azure_suggestion.replace(/"/g, '""')}"`,
          item.similarity,
          item.analysis,
          item.recommendation,
          item.confidence,
          `"${item.issues.join(', ')}"`
        ].join(',');
        
        csv += row + '\n';
      });
      
      fs.writeFileSync(csvPath, csv);
      console.log(`📊 Comparison table saved to: ${csvPath}`);
      
      // Also generate HTML table
      await this.generateHTMLTable(details, timestamp);
      
    } catch (error) {
      console.error('❌ Error generating comparison table:', error.message);
    }
  }

  /**
   * Generate HTML comparison table
   */
  async generateHTMLTable(details, timestamp) {
    try {
      const htmlPath = `hebrew-comparison-table-${timestamp}.html`;
      
      let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hebrew Translation Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .similarity-high { background-color: #d4edda; }
        .similarity-medium { background-color: #fff3cd; }
        .similarity-low { background-color: #f8d7da; }
        .recommendation-keep { background-color: #d4edda; }
        .recommendation-review { background-color: #fff3cd; }
        .recommendation-use { background-color: #f8d7da; }
        .hebrew-text { direction: rtl; text-align: right; }
    </style>
</head>
<body>
    <h1>Hebrew Translation Analysis Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Total translations analyzed: ${details.length}</p>
    
    <table>
        <thead>
            <tr>
                <th>Content Key</th>
                <th>Screen</th>
                <th>English</th>
                <th>Current Hebrew</th>
                <th>Azure Suggestion</th>
                <th>Similarity</th>
                <th>Analysis</th>
                <th>Recommendation</th>
                <th>Issues</th>
            </tr>
        </thead>
        <tbody>
      `;
      
      details.forEach(item => {
        const similarityClass = item.similarity >= 80 ? 'similarity-high' : 
                              item.similarity >= 60 ? 'similarity-medium' : 'similarity-low';
        
        const recommendationClass = item.recommendation === 'keep_current' ? 'recommendation-keep' :
                                  item.recommendation === 'use_azure' ? 'recommendation-use' : 'recommendation-review';
        
        html += `
            <tr class="${similarityClass}">
                <td>${item.content_key}</td>
                <td>${item.screen_location}</td>
                <td>${item.english_text}</td>
                <td class="hebrew-text">${item.current_hebrew}</td>
                <td class="hebrew-text">${item.azure_suggestion}</td>
                <td>${item.similarity}%</td>
                <td>${item.analysis}</td>
                <td class="${recommendationClass}">${item.recommendation.replace('_', ' ')}</td>
                <td>${item.issues.join(', ')}</td>
            </tr>
        `;
      });
      
      html += `
        </tbody>
    </table>
</body>
</html>
      `;
      
      fs.writeFileSync(htmlPath, html);
      console.log(`🌐 HTML table saved to: ${htmlPath}`);
      
    } catch (error) {
      console.error('❌ Error generating HTML table:', error.message);
    }
  }

  /**
   * Analyze specific words or phrases
   */
  async analyzeSpecificWords(words) {
    console.log('\n🔍 Analyzing specific words/phrases...\n');
    
    const wordAnalysis = [];
    
    for (const word of words) {
      console.log(`📝 Analyzing: "${word}"`);
      
      const azureTranslation = await this.translateWithAzure(word, 'en', 'he');
      
      if (azureTranslation) {
        console.log(`🤖 Azure translation: ${azureTranslation.translated}`);
        wordAnalysis.push({
          english: word,
          azure_hebrew: azureTranslation.translated,
          confidence: azureTranslation.confidence
        });
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Save word analysis
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const wordAnalysisPath = `word-analysis-${timestamp}.json`;
    fs.writeFileSync(wordAnalysisPath, JSON.stringify(wordAnalysis, null, 2));
    
    console.log(`\n💾 Word analysis saved to: ${wordAnalysisPath}`);
    return wordAnalysis;
  }
}

// CLI interface
async function main() {
  const analyzer = new HebrewTranslationAnalyzer();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';
  const limit = parseInt(args[1]) || 20;

  try {
    switch (command) {
      case 'analyze':
        await analyzer.generateAnalysisReport(limit);
        break;
      case 'words':
        const words = args.slice(1);
        if (words.length === 0) {
          console.log('Usage: node hebrew-translation-analyzer.js words "word1" "word2" "phrase1"');
          console.log('Example: node hebrew-translation-analyzer.js words "Property Ownership" "Monthly Payment"');
        } else {
          await analyzer.analyzeSpecificWords(words);
        }
        break;
      default:
        console.log('Usage:');
        console.log('  node hebrew-translation-analyzer.js analyze [limit]  - Analyze Hebrew translations');
        console.log('  node hebrew-translation-analyzer.js words "word1" "word2"  - Analyze specific words');
        console.log('\nExamples:');
        console.log('  node hebrew-translation-analyzer.js analyze 50');
        console.log('  node hebrew-translation-analyzer.js words "Property Ownership" "Monthly Payment"');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await analyzer.contentPool.end();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = HebrewTranslationAnalyzer;
