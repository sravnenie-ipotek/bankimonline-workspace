const fs = require('fs');
const { Pool } = require('pg');

class OrphanAnalyzer {
  constructor() {
    this.databaseKeys = new Set();
    this.codeKeys = new Set();
    this.orphanedKeys = new Set();
    this.usedKeys = new Set();
    this.ambiguousKeys = new Set();
    
    this.pool = new Pool({
      connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
    });
  }

  // Load database keys
  async loadDatabaseKeys() {
    try {
      const result = await this.pool.query('SELECT content_key FROM content_items WHERE is_active = true ORDER BY content_key');
      result.rows.forEach(row => {
        this.databaseKeys.add(row.content_key);
      });
      console.log(`📊 Loaded ${this.databaseKeys.size} database keys`);
    } catch (error) {
      console.error('❌ Error loading database keys:', error.message);
      throw error;
    }
  }

  // Load code analysis results
  loadCodeKeys() {
    try {
      const codeKeysFile = 'all_found_content_keys.json';
      if (fs.existsSync(codeKeysFile)) {
        const keys = JSON.parse(fs.readFileSync(codeKeysFile, 'utf8'));
        keys.forEach(key => this.codeKeys.add(key));
        console.log(`📊 Loaded ${this.codeKeys.size} code keys`);
      } else {
        console.error('❌ Code keys file not found. Run comprehensive_content_search.js first');
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Error loading code keys:', error.message);
      return false;
    }
  }

  // Advanced matching algorithms
  findMatches() {
    console.log('🔍 Cross-referencing database keys with code usage...\n');

    const results = {
      exactMatches: new Set(),
      partialMatches: new Set(),
      orphanedKeys: new Set(),
      ambiguousKeys: new Set(),
      codeOnlyKeys: new Set()
    };

    // Find exact matches
    for (const dbKey of this.databaseKeys) {
      if (this.codeKeys.has(dbKey)) {
        results.exactMatches.add(dbKey);
        this.usedKeys.add(dbKey);
      }
    }

    // Find partial matches (more sophisticated matching)
    for (const dbKey of this.databaseKeys) {
      if (!results.exactMatches.has(dbKey)) {
        const partialMatches = this.findPartialMatches(dbKey);
        if (partialMatches.length > 0) {
          results.partialMatches.add(dbKey);
          this.usedKeys.add(dbKey);
          console.log(`🔗 Partial match for "${dbKey}": ${partialMatches.join(', ')}`);
        }
      }
    }

    // Find dynamic/contextual matches
    for (const dbKey of this.databaseKeys) {
      if (!results.exactMatches.has(dbKey) && !results.partialMatches.has(dbKey)) {
        if (this.isDynamicallyUsed(dbKey)) {
          results.partialMatches.add(dbKey);
          this.usedKeys.add(dbKey);
          console.log(`⚡ Dynamic usage detected for "${dbKey}"`);
        }
      }
    }

    // Identify orphaned keys
    for (const dbKey of this.databaseKeys) {
      if (!this.usedKeys.has(dbKey)) {
        results.orphanedKeys.add(dbKey);
        this.orphanedKeys.add(dbKey);
      }
    }

    // Find code-only keys (keys in code but not in database)
    for (const codeKey of this.codeKeys) {
      if (!this.databaseKeys.has(codeKey)) {
        results.codeOnlyKeys.add(codeKey);
      }
    }

    return results;
  }

  // Find partial matches using various strategies
  findPartialMatches(dbKey) {
    const matches = [];

    // Strategy 1: Check if key is part of a larger key in code
    for (const codeKey of this.codeKeys) {
      if (codeKey.includes(dbKey) || dbKey.includes(codeKey)) {
        matches.push(codeKey);
      }
    }

    // Strategy 2: Check for pattern variations
    const variations = this.generateKeyVariations(dbKey);
    for (const variation of variations) {
      if (this.codeKeys.has(variation)) {
        matches.push(variation);
      }
    }

    // Strategy 3: Check for contextual usage (prefix/suffix matching)
    const keyParts = dbKey.split(/[._]/);
    if (keyParts.length > 1) {
      for (const codeKey of this.codeKeys) {
        const codeKeyParts = codeKey.split(/[._]/);
        const intersection = keyParts.filter(part => codeKeyParts.includes(part));
        if (intersection.length >= 2) { // At least 2 matching parts
          matches.push(codeKey);
        }
      }
    }

    return [...new Set(matches)]; // Remove duplicates
  }

  // Generate possible variations of a key
  generateKeyVariations(key) {
    const variations = new Set();
    
    // Dot notation variants
    variations.add(key.replace(/_/g, '.'));
    
    // Camel case variants
    const camelCase = key.replace(/_(.)/g, (_, char) => char.toUpperCase());
    variations.add(camelCase);
    
    // Remove common prefixes/suffixes
    const withoutPrefixes = key.replace(/^(app|home|mortgage|credit|calculate|refinance)_/, '');
    if (withoutPrefixes !== key) {
      variations.add(withoutPrefixes);
    }
    
    // Add common prefixes
    ['app.', 'home.', 'mortgage.', 'credit.'].forEach(prefix => {
      variations.add(prefix + key);
    });

    return Array.from(variations);
  }

  // Check if key might be used dynamically
  isDynamicallyUsed(dbKey) {
    // Check for dynamic patterns that might construct this key
    const keyParts = dbKey.split(/[._]/);
    
    // Look for screen location patterns
    if (keyParts[0] && this.codeKeys.has(keyParts[0])) {
      return true;
    }
    
    // Look for component type patterns
    const componentTypes = ['title', 'desc', 'text', 'label', 'button', 'placeholder', 'option'];
    const lastPart = keyParts[keyParts.length - 1];
    if (componentTypes.includes(lastPart)) {
      const baseKey = keyParts.slice(0, -1).join('_');
      if (this.codeKeys.has(baseKey)) {
        return true;
      }
    }
    
    // Check for step-based patterns
    if (dbKey.includes('step') && keyParts.some(part => /step\d+/.test(part))) {
      const basePattern = dbKey.replace(/step\d+/, 'step');
      for (const codeKey of this.codeKeys) {
        if (codeKey.includes(basePattern.split('_')[0])) {
          return true;
        }
      }
    }

    // Check for dropdown patterns
    if (dbKey.includes('option') && keyParts.includes('option')) {
      const baseKey = keyParts.slice(0, keyParts.indexOf('option')).join('_');
      if (baseKey && this.codeKeys.has(baseKey)) {
        return true;
      }
    }

    return false;
  }

  // Advanced confidence scoring for orphan status
  calculateOrphanConfidence(key) {
    let confidence = 1.0; // Start with 100% confidence it's orphaned
    
    // Reduce confidence if key has patterns that suggest dynamic usage
    if (this.isDynamicallyUsed(key)) {
      confidence -= 0.4;
    }
    
    // Reduce confidence if key has partial matches
    const partialMatches = this.findPartialMatches(key);
    if (partialMatches.length > 0) {
      confidence -= 0.3 * Math.min(partialMatches.length / 5, 1);
    }
    
    // Reduce confidence for keys that follow common patterns
    if (this.followsCommonPattern(key)) {
      confidence -= 0.2;
    }

    // Increase confidence for keys that seem very specific/unused
    if (this.seemsUnused(key)) {
      confidence += 0.1;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  // Check if key follows common patterns
  followsCommonPattern(key) {
    const commonPatterns = [
      /^(home|about|contact|mortgage|credit|refinance)_/,
      /_(title|desc|text|label|button|placeholder)$/,
      /^app\./,
      /_step\d+_/,
      /_option_\d+$/
    ];
    
    return commonPatterns.some(pattern => pattern.test(key));
  }

  // Check if key seems unused based on patterns
  seemsUnused(key) {
    // Keys with very specific patterns that don't appear in code
    const unusedPatterns = [
      /test_/,
      /debug_/,
      /temp_/,
      /old_/,
      /deprecated_/,
      /legacy_/
    ];

    return unusedPatterns.some(pattern => pattern.test(key));
  }

  // Generate comprehensive report
  generateReport(analysis) {
    const report = {
      summary: {
        totalDatabaseKeys: this.databaseKeys.size,
        totalCodeKeys: this.codeKeys.size,
        exactMatches: analysis.exactMatches.size,
        partialMatches: analysis.partialMatches.size,
        orphanedKeys: analysis.orphanedKeys.size,
        codeOnlyKeys: analysis.codeOnlyKeys.size,
        usageRate: ((analysis.exactMatches.size + analysis.partialMatches.size) / this.databaseKeys.size * 100).toFixed(1)
      },
      orphanedKeysDetailed: [],
      exactMatches: Array.from(analysis.exactMatches).sort(),
      partialMatches: Array.from(analysis.partialMatches).sort(),
      codeOnlyKeys: Array.from(analysis.codeOnlyKeys).sort()
    };

    // Detailed orphaned keys analysis
    for (const key of analysis.orphanedKeys) {
      const confidence = this.calculateOrphanConfidence(key);
      const partialMatches = this.findPartialMatches(key);
      
      report.orphanedKeysDetailed.push({
        key,
        confidence,
        confidenceLevel: this.getConfidenceLevel(confidence),
        partialMatches,
        dynamicUsage: this.isDynamicallyUsed(key),
        commonPattern: this.followsCommonPattern(key),
        recommendation: this.getRecommendation(confidence, partialMatches.length)
      });
    }

    // Sort by confidence (highest first)
    report.orphanedKeysDetailed.sort((a, b) => b.confidence - a.confidence);

    return report;
  }

  getConfidenceLevel(confidence) {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    if (confidence >= 0.3) return 'Low';
    return 'Very Low';
  }

  getRecommendation(confidence, partialMatchCount) {
    if (confidence >= 0.9) {
      return 'SAFE TO DELETE - Very high confidence orphaned';
    } else if (confidence >= 0.7) {
      return 'LIKELY SAFE TO DELETE - Manual review recommended';
    } else if (confidence >= 0.5) {
      return 'REVIEW CAREFULLY - May have dynamic usage';
    } else if (partialMatchCount > 0) {
      return 'KEEP - Has partial matches, likely used dynamically';
    } else {
      return 'INVESTIGATE - Low confidence, needs manual review';
    }
  }

  // Main analysis function
  async analyze() {
    console.log('🔍 Starting orphaned content keys analysis...\n');

    // Load data
    await this.loadDatabaseKeys();
    if (!this.loadCodeKeys()) {
      return null;
    }

    // Perform analysis
    const analysis = this.findMatches();
    const report = this.generateReport(analysis);

    // Save report
    fs.writeFileSync('orphaned_keys_analysis.json', JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n📊 ANALYSIS RESULTS:');
    console.log(`   📊 Database keys: ${report.summary.totalDatabaseKeys}`);
    console.log(`   📊 Code keys: ${report.summary.totalCodeKeys}`);
    console.log(`   ✅ Exact matches: ${report.summary.exactMatches}`);
    console.log(`   🔗 Partial matches: ${report.summary.partialMatches}`);
    console.log(`   ⚠️  Orphaned keys: ${report.summary.orphanedKeys}`);
    console.log(`   📈 Usage rate: ${report.summary.usageRate}%\n`);

    // Print high-confidence orphans
    const highConfidenceOrphans = report.orphanedKeysDetailed.filter(item => item.confidence >= 0.7);
    console.log(`🗑️  HIGH CONFIDENCE ORPHANS (${highConfidenceOrphans.length} keys):`);
    highConfidenceOrphans.slice(0, 20).forEach(item => {
      console.log(`   ${item.confidence.toFixed(2)} - ${item.key} (${item.recommendation})`);
    });

    if (highConfidenceOrphans.length > 20) {
      console.log(`   ... and ${highConfidenceOrphans.length - 20} more`);
    }

    await this.pool.end();
    return report;
  }
}

// Run analysis
async function main() {
  const analyzer = new OrphanAnalyzer();
  const report = await analyzer.analyze();
  
  if (report) {
    console.log('\n📄 Report saved to: orphaned_keys_analysis.json');
  }
}

main().catch(console.error);