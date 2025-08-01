const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class ComprehensiveContentSearch {
  constructor() {
    this.allFoundKeys = new Set();
    this.searchResults = {
      directKeys: new Set(),
      dynamicKeys: new Set(),
      contextualKeys: new Set(),
      serverKeys: new Set(),
      possibleKeys: new Set()
    };
    this.fileResults = {};
  }

  // Enhanced search patterns for content keys
  getSearchPatterns() {
    return [
      // Direct getContent calls
      {
        name: 'direct_getContent',
        pattern: /getContent\(['"`]([^'"`]+)['"`]\)/g,
        category: 'directKeys'
      },
      
      // Template literals
      {
        name: 'template_getContent',
        pattern: /getContent\(\`([^`]+)\`\)/g,
        category: 'dynamicKeys'
      },
      
      // Dynamic construction
      {
        name: 'dynamic_getContent',
        pattern: /getContent\(([^)]+)\)/g,
        category: 'dynamicKeys'
      },
      
      // Translation with content fallback
      {
        name: 'translation_fallback',
        pattern: /\|\|\s*t\(['"`]([^'"`]+)['"`]/g,
        category: 'contextualKeys'
      },
      
      // Server-side content_key references
      {
        name: 'server_content_key',
        pattern: /content_key['":\s=]+['"`]([^'"`]+)['"`]/g,
        category: 'serverKeys'
      },
      
      // SQL-like content key patterns
      {
        name: 'sql_content_patterns',
        pattern: /content_items\.content_key['":\s=]+['"`]([^'"`]+)['"`]/g,
        category: 'serverKeys'
      },
      
      // Screen locations and categories (these map to content)
      {
        name: 'screen_locations',
        pattern: /screen_location['":\s=]+['"`]([^'"`]+)['"`]/g,
        category: 'contextualKeys'
      },
      
      // Component types that indicate content usage
      {
        name: 'component_types',
        pattern: /component_type['":\s=]+['"`]([^'"`]+)['"`]/g,
        category: 'contextualKeys'
      },
      
      // Content keys in object properties
      {
        name: 'object_keys',
        pattern: /['"`]([a-z][a-z0-9_]*[a-z0-9])['"`]\s*:/g,
        category: 'possibleKeys'
      },
      
      // Quoted strings that look like content keys
      {
        name: 'quoted_content_keys',
        pattern: /['"`]([a-z][a-z0-9_]{2,50})['"`]/g,
        category: 'possibleKeys'
      }
    ];
  }

  // Analyze individual file
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileResult = {
        path: filePath,
        patterns: {}
      };

      const patterns = this.getSearchPatterns();
      
      patterns.forEach(patternConfig => {
        const matches = [];
        let match;
        
        while ((match = patternConfig.pattern.exec(content)) !== null) {
          const key = match[1];
          if (this.isValidContentKey(key, patternConfig.name)) {
            matches.push({
              key,
              line: this.getLineNumber(content, match.index),
              context: this.getContext(content, match.index)
            });
            
            this.searchResults[patternConfig.category].add(key);
            this.allFoundKeys.add(key);
          }
        }
        
        if (matches.length > 0) {
          fileResult.patterns[patternConfig.name] = matches;
        }
      });

      if (Object.keys(fileResult.patterns).length > 0) {
        this.fileResults[filePath] = fileResult;
      }

      return fileResult;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return null;
    }
  }

  // Check if a key is valid based on pattern type
  isValidContentKey(key, patternType) {
    if (!key || typeof key !== 'string') return false;
    
    // Basic validation
    if (key.length < 2 || key.length > 100) return false;
    
    // Pattern-specific validation
    switch (patternType) {
      case 'direct_getContent':
      case 'template_getContent':
        return this.isStrictContentKey(key);
        
      case 'server_content_key':
      case 'sql_content_patterns':
        return this.isStrictContentKey(key);
        
      case 'screen_locations':
        return this.isScreenLocation(key);
        
      case 'component_types':
        return this.isComponentType(key);
        
      case 'object_keys':
      case 'quoted_content_keys':
        return this.isPossibleContentKey(key);
        
      default:
        return this.isPossibleContentKey(key);
    }
  }

  // Strict content key validation
  isStrictContentKey(key) {
    return /^[a-z][a-z0-9_]*[a-z0-9]$/.test(key) &&
           !this.isCommonWord(key) &&
           !this.isFileExtension(key);
  }

  // Screen location validation
  isScreenLocation(key) {
    const validLocations = [
      'home_page', 'about', 'contacts', 'sidebar', 'mortgage_step1', 'mortgage_step2',
      'mortgage_step3', 'mortgage_step4', 'calculate_credit_1', 'calculate_credit_2',
      'calculate_credit_3', 'calculate_credit_4', 'refinance_step1', 'refinance_step2',
      'refinance_step3', 'personal_cabinet', 'temporary_franchise', 'bank_offers',
      'cooperation', 'tenders_for_brokers', 'tenders_for_lawyers'
    ];
    return validLocations.includes(key) || /^[a-z][a-z0-9_]*[a-z0-9]$/.test(key);
  }

  // Component type validation
  isComponentType(key) {
    const validTypes = [
      'text', 'label', 'button', 'dropdown_container', 'dropdown_option', 'placeholder',
      'title', 'subtitle', 'description', 'link', 'image_alt', 'tooltip'
    ];
    return validTypes.includes(key);
  }

  // Possible content key validation (more lenient)
  isPossibleContentKey(key) {
    // Must be lowercase with underscores
    if (!/^[a-z][a-z0-9_]*[a-z0-9]$/.test(key)) return false;
    
    // Exclude common words and technical terms
    if (this.isCommonWord(key) || this.isFileExtension(key) || this.isTechnicalTerm(key)) {
      return false;
    }
    
    // Include if it has content-like patterns
    return this.hasContentPatterns(key);
  }

  // Check for content-like patterns
  hasContentPatterns(key) {
    const contentPatterns = [
      /title/, /desc/, /text/, /label/, /button/, /message/, /content/,
      /step/, /option/, /placeholder/, /header/, /footer/, /menu/,
      /form/, /field/, /input/, /dropdown/, /modal/, /page/,
      /home/, /about/, /contact/, /mortgage/, /credit/, /refinance/,
      /calculate/, /bank/, /offer/, /personal/, /cabinet/
    ];
    
    return contentPatterns.some(pattern => pattern.test(key));
  }

  // Common word exclusions
  isCommonWord(key) {
    const commonWords = [
      'div', 'span', 'img', 'src', 'alt', 'href', 'class', 'style', 'id', 'data',
      'aria', 'role', 'type', 'value', 'name', 'true', 'false', 'null', 'undefined',
      'console', 'window', 'document', 'this', 'self', 'return', 'function', 'const',
      'let', 'var', 'if', 'else', 'for', 'while', 'break', 'continue', 'switch',
      'case', 'default', 'try', 'catch', 'finally', 'throw', 'new', 'delete',
      'typeof', 'instanceof', 'void', 'public', 'private', 'protected', 'static',
      'export', 'import', 'from', 'default', 'as', 'extends', 'implements', 'interface'
    ];
    return commonWords.includes(key);
  }

  // File extension exclusions
  isFileExtension(key) {
    const extensions = ['tsx', 'jsx', 'ts', 'js', 'css', 'scss', 'html', 'json', 'md', 'txt', 'png', 'jpg', 'jpeg', 'svg', 'gif', 'ico'];
    return extensions.includes(key);
  }

  // Technical term exclusions
  isTechnicalTerm(key) {
    const technical = [
      'router', 'component', 'props', 'state', 'reducer', 'action', 'payload',
      'async', 'await', 'promise', 'callback', 'event', 'handler', 'listener',
      'api', 'endpoint', 'method', 'get', 'post', 'put', 'delete', 'patch',
      'request', 'response', 'status', 'code', 'error', 'success', 'loading',
      'redux', 'store', 'dispatch', 'selector', 'middleware', 'thunk'
    ];
    return technical.includes(key);
  }

  // Get line number for position
  getLineNumber(content, position) {
    return content.substring(0, position).split('\n').length;
  }

  // Get context around match
  getContext(content, position, contextSize = 50) {
    const start = Math.max(0, position - contextSize);
    const end = Math.min(content.length, position + contextSize);
    return content.substring(start, end).replace(/\n/g, ' ').trim();
  }

  // Get files to analyze
  async getFilesToAnalyze() {
    const patterns = [
      'mainapp/src/**/*.{ts,tsx,js,jsx}',
      'mainapp/cypress/**/*.{ts,tsx,js,jsx}',
      'server-db.js',
      '*.js',
      'migrations/*.{js,sql}',
      'scripts/*.js',
      'public/locales/**/translation.json',
      'locales/**/translation.json'
    ];

    const files = [];
    for (const pattern of patterns) {
      try {
        const matches = await glob(pattern, {
          cwd: process.cwd(),
          ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/screenshots/**']
        });
        files.push(...matches);
      } catch (error) {
        console.error(`Error with pattern ${pattern}:`, error.message);
      }
    }

    return [...new Set(files)];
  }

  // Main analysis
  async analyze() {
    console.log('🔍 Starting comprehensive content key search...\n');
    
    const files = await this.getFilesToAnalyze();
    console.log(`📁 Found ${files.length} files to analyze\n`);

    let processed = 0;
    for (const file of files) {
      this.analyzeFile(file);
      processed++;
      
      if (processed % 100 === 0) {
        console.log(`Progress: ${processed}/${files.length} files`);
      }
    }

    console.log(`\n✅ Analysis complete:`);
    console.log(`   📁 Files with matches: ${Object.keys(this.fileResults).length}`);
    console.log(`   🎯 Direct keys: ${this.searchResults.directKeys.size}`);
    console.log(`   🔧 Dynamic keys: ${this.searchResults.dynamicKeys.size}`);
    console.log(`   📄 Contextual keys: ${this.searchResults.contextualKeys.size}`);
    console.log(`   🖥️  Server keys: ${this.searchResults.serverKeys.size}`);
    console.log(`   💡 Possible keys: ${this.searchResults.possibleKeys.size}`);
    console.log(`   🔗 Total unique keys: ${this.allFoundKeys.size}\n`);

    return this.generateReport();
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      summary: {
        totalFiles: Object.keys(this.fileResults).length,
        totalKeys: this.allFoundKeys.size,
        keysByCategory: {
          direct: Array.from(this.searchResults.directKeys).sort(),
          dynamic: Array.from(this.searchResults.dynamicKeys).sort(),
          contextual: Array.from(this.searchResults.contextualKeys).sort(),
          server: Array.from(this.searchResults.serverKeys).sort(),
          possible: Array.from(this.searchResults.possibleKeys).sort()
        },
        allKeys: Array.from(this.allFoundKeys).sort()
      },
      fileAnalysis: this.fileResults
    };

    return report;
  }
}

// Run analysis
async function main() {
  const searcher = new ComprehensiveContentSearch();
  const report = await searcher.analyze();
  
  // Save reports
  fs.writeFileSync('comprehensive_content_search.json', JSON.stringify(report, null, 2));
  fs.writeFileSync('all_found_content_keys.json', JSON.stringify(report.summary.allKeys, null, 2));
  
  console.log('📊 Reports saved:');
  console.log('   📄 comprehensive_content_search.json');
  console.log('   🔑 all_found_content_keys.json\n');
  
  // Print summary by category
  Object.entries(report.summary.keysByCategory).forEach(([category, keys]) => {
    console.log(`📂 ${category.toUpperCase()}: ${keys.length} keys`);
    if (keys.length > 0) {
      console.log(`   Sample: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
    }
  });

  console.log(`\n🎯 Total unique keys found: ${report.summary.totalKeys}`);
}

main().catch(console.error);