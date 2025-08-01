const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class ContentKeyAnalyzer {
  constructor() {
    this.foundKeys = new Set();
    this.contextPatterns = new Set(); // useContentApi contexts
    this.usagePatterns = [];
    this.fileAnalysis = {};
  }

  // Patterns to search for content key usage
  getSearchPatterns() {
    return [
      // Direct getContent calls
      /getContent\(['"`]([^'"`]+)['"`]\)/g,
      
      // Template literals with variables
      /getContent\(\`([^`]+)\`\)/g,
      
      // Dynamic key construction
      /getContent\(([^)]+)\)/g,
      
      // Translation fallbacks with content keys
      /\|\|\s*t\(['"`]([^'"`]+)['"`]/g,
      
      // Content keys in JSX or objects
      /['"`]([a-z][a-z0-9_]*[a-z0-9])['"`]/g,
    ];
  }

  // Extract useContentApi context/category usage
  extractContextPatterns() {
    return [
      /useContentApi\(['"`]([^'"`]+)['"`]\)/g,
    ];
  }

  // Search in a single file for content key patterns
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = {
        path: filePath,
        contexts: [],
        directKeys: [],
        dynamicKeys: [],
        possibleKeys: [],
        lineNumbers: {}
      };

      // Find useContentApi contexts
      const contextPatterns = this.extractContextPatterns();
      contextPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const context = match[1];
          analysis.contexts.push(context);
          this.contextPatterns.add(context);
          analysis.lineNumbers[context] = this.getLineNumber(content, match.index);
        }
      });

      // Find content key usage patterns
      const patterns = this.getSearchPatterns();
      
      // Direct getContent calls
      let match;
      while ((match = patterns[0].exec(content)) !== null) {
        const key = match[1];
        if (this.isValidContentKey(key)) {
          analysis.directKeys.push(key);
          this.foundKeys.add(key);
          analysis.lineNumbers[key] = this.getLineNumber(content, match.index);
        }
      }

      // Template literals
      while ((match = patterns[1].exec(content)) !== null) {
        const template = match[1];
        if (template.includes('${')) {
          analysis.dynamicKeys.push(template);
        } else if (this.isValidContentKey(template)) {
          analysis.directKeys.push(template);
          this.foundKeys.add(template);
          analysis.lineNumbers[template] = this.getLineNumber(content, match.index);
        }
      }

      // Find potential content keys in the file
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        const potentialKeys = this.extractPotentialKeys(line);
        potentialKeys.forEach(key => {
          if (this.isValidContentKey(key) && !analysis.directKeys.includes(key)) {
            analysis.possibleKeys.push(key);
            analysis.lineNumbers[key] = index + 1;
          }
        });
      });

      if (analysis.contexts.length > 0 || analysis.directKeys.length > 0 || 
          analysis.dynamicKeys.length > 0 || analysis.possibleKeys.length > 0) {
        this.fileAnalysis[filePath] = analysis;
      }

      return analysis;
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error.message);
      return null;
    }
  }

  // Extract potential content keys from a line using various patterns
  extractPotentialKeys(line) {
    const keys = [];
    
    // Look for quoted strings that could be content keys
    const quotedStrings = line.match(/['"`]([a-z][a-z0-9_]*[a-z0-9])['"`]/g);
    if (quotedStrings) {
      quotedStrings.forEach(str => {
        const key = str.slice(1, -1); // Remove quotes
        if (this.isValidContentKey(key)) {
          keys.push(key);
        }
      });
    }

    return keys;
  }

  // Check if a string looks like a valid content key
  isValidContentKey(key) {
    if (!key || typeof key !== 'string') return false;
    
    // Content keys typically:
    // - Are lowercase with underscores
    // - Are at least 3 characters long
    // - Don't contain spaces or special chars (except _)
    // - Don't look like common JS/HTML keywords
    
    const invalidPatterns = [
      /^(div|span|img|src|alt|href|class|style|id|data|aria|role|type|value|name|placeholder)$/,
      /^(true|false|null|undefined|console|window|document|this|self)$/,
      /^(tsx|jsx|ts|js|css|html|json|md|png|jpg|jpeg|svg|gif)$/,
      /^[0-9]+$/,
      /\s/,
      /[A-Z]/,
      /^[_-]/,
      /[_-]$/
    ];

    return key.length >= 3 && 
           key.length <= 100 && 
           /^[a-z][a-z0-9_]*[a-z0-9]$/.test(key) &&
           !invalidPatterns.some(pattern => pattern.test(key));
  }

  // Get line number for a position in content
  getLineNumber(content, position) {
    return content.substring(0, position).split('\n').length;
  }

  // Get all files to analyze
  async getFilesToAnalyze() {
    const patterns = [
      'mainapp/src/**/*.{ts,tsx,js,jsx}',
      'mainapp/cypress/**/*.{ts,tsx,js,jsx}',
      'server-db.js',
      '*.js',
      'migrations/*.js',
      'scripts/*.js'
    ];

    const files = [];
    for (const pattern of patterns) {
      try {
        const matches = await glob(pattern, {
          cwd: process.cwd(),
          ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
        });
        files.push(...matches);
      } catch (error) {
        console.error(`Error with pattern ${pattern}:`, error.message);
      }
    }

    return [...new Set(files)]; // Remove duplicates
  }

  // Main analysis function
  async analyzeCodebase() {
    console.log('🔍 Starting comprehensive content key analysis...\n');
    
    const files = await this.getFilesToAnalyze();
    console.log(`📁 Found ${files.length} files to analyze\n`);

    let processedFiles = 0;
    let filesWithKeys = 0;

    for (const file of files) {
      const analysis = this.analyzeFile(file);
      if (analysis && (analysis.directKeys.length > 0 || analysis.contexts.length > 0)) {
        filesWithKeys++;
      }
      processedFiles++;
      
      if (processedFiles % 50 === 0) {
        console.log(`Progress: ${processedFiles}/${files.length} files processed`);
      }
    }

    console.log(`\n✅ Analysis complete:`);
    console.log(`   📁 Files processed: ${processedFiles}`);
    console.log(`   🔑 Files with content keys: ${filesWithKeys}`);
    console.log(`   📄 Unique content contexts: ${this.contextPatterns.size}`);
    console.log(`   🎯 Direct content keys found: ${this.foundKeys.size}\n`);

    return this.generateReport();
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      summary: {
        totalFilesAnalyzed: Object.keys(this.fileAnalysis).length,
        uniqueContexts: Array.from(this.contextPatterns).sort(),
        directKeysFound: Array.from(this.foundKeys).sort(),
        totalUniqueKeys: this.foundKeys.size
      },
      detailedAnalysis: {},
      keysByContext: {},
      potentialOrphans: []
    };

    // Group keys by context
    this.contextPatterns.forEach(context => {
      report.keysByContext[context] = [];
    });

    // Process file analysis
    Object.entries(this.fileAnalysis).forEach(([filePath, analysis]) => {
      report.detailedAnalysis[filePath] = {
        contexts: analysis.contexts,
        directKeys: analysis.directKeys,
        dynamicKeys: analysis.dynamicKeys,
        possibleKeys: analysis.possibleKeys.filter(key => 
          // Only include possible keys that look very likely to be content keys
          key.includes('title') || key.includes('desc') || key.includes('label') ||
          key.includes('text') || key.includes('content') || key.includes('message') ||
          key.includes('step') || key.includes('button') || key.includes('option')
        ),
        lineNumbers: analysis.lineNumbers
      };

      // Associate keys with their contexts (best guess)
      analysis.contexts.forEach(context => {
        analysis.directKeys.forEach(key => {
          if (!report.keysByContext[context].includes(key)) {
            report.keysByContext[context].push(key);
          }
        });
      });
    });

    return report;
  }
}

// Run the analysis
async function main() {
  const analyzer = new ContentKeyAnalyzer();
  const report = await analyzer.analyzeCodebase();
  
  // Save detailed report
  fs.writeFileSync('content_usage_analysis.json', JSON.stringify(report, null, 2));
  
  // Save just the found keys for easy reference
  fs.writeFileSync('found_content_keys.json', JSON.stringify(Array.from(analyzer.foundKeys).sort(), null, 2));
  
  console.log('📊 Reports saved:');
  console.log('   📄 content_usage_analysis.json - Detailed analysis');
  console.log('   🔑 found_content_keys.json - List of all found keys\n');
  
  // Print summary
  console.log('📈 SUMMARY:');
  console.log(`   🎯 Content contexts found: ${report.summary.uniqueContexts.length}`);
  console.log(`   🔑 Direct content keys: ${report.summary.totalUniqueKeys}`);
  console.log('\n🏷️  Contexts:', report.summary.uniqueContexts.join(', '));
  console.log('\n🔑 Sample keys found:', report.summary.directKeysFound.slice(0, 20).join(', '));
  
  if (report.summary.directKeysFound.length > 20) {
    console.log(`   ... and ${report.summary.directKeysFound.length - 20} more`);
  }
}

main().catch(console.error);