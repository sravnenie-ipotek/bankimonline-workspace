#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Store all found content keys with their usage details
const contentKeys = new Map();

// Function to add a content key finding
function addContentKey(filePath, lineNumber, contentKey, method, context = '') {
  if (!contentKeys.has(contentKey)) {
    contentKeys.set(contentKey, []);
  }
  
  contentKeys.get(contentKey).push({
    file: filePath.replace('/Users/michaelmishayev/Projects/bankDev2_standalone/', ''), // Make relative
    line: lineNumber,
    method: method,
    context: context.trim()
  });
}

// Function to extract content keys from file content
function extractContentKeys(filePath, content) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Pattern 1: useContentApi('content_key')
    const useContentApiMatch = line.match(/useContentApi\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
    if (useContentApiMatch) {
      useContentApiMatch.forEach(match => {
        const keyMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (keyMatch) {
          addContentKey(filePath, lineNumber, keyMatch[1], 'useContentApi', line);
        }
      });
    }
    
    // Pattern 2: getContent('content_key', 'fallback')
    const getContentMatches = line.match(/getContent\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (getContentMatches) {
      getContentMatches.forEach(match => {
        const keyMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (keyMatch) {
          addContentKey(filePath, lineNumber, keyMatch[1], 'getContent', line);
        }
      });
    }
    
    // Pattern 3: t('content_key')
    const tMatches = line.match(/\bt\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (tMatches) {
      tMatches.forEach(match => {
        const keyMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (keyMatch) {
          addContentKey(filePath, lineNumber, keyMatch[1], 't()', line);
        }
      });
    }
    
    // Pattern 4: Dynamic t() calls like t(`key_${variable}`)
    const dynamicTMatches = line.match(/\bt\s*\(\s*`([^`]+)`/g);
    if (dynamicTMatches) {
      dynamicTMatches.forEach(match => {
        const keyMatch = match.match(/`([^`]+)`/);
        if (keyMatch) {
          addContentKey(filePath, lineNumber, keyMatch[1], 't() (dynamic)', line);
        }
      });
    }
    
    // Pattern 5: i18n.t('content_key')
    const i18nTMatches = line.match(/i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (i18nTMatches) {
      i18nTMatches.forEach(match => {
        const keyMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (keyMatch) {
          addContentKey(filePath, lineNumber, keyMatch[1], 'i18n.t()', line);
        }
      });
    }
  });
}

// Function to recursively scan directory
function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath);
  
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry)) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      // Process React/TypeScript files
      if (/\.(tsx?|jsx?)$/.test(entry)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          extractContentKeys(fullPath, content);
        } catch (error) {
          console.error(`Error reading file ${fullPath}: ${error.message}`);
        }
      }
    }
  });
}

// Main execution
console.log('🔍 Scanning React codebase for content key usage...\n');

const srcPath = '/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/src';
scanDirectory(srcPath);

// Sort content keys alphabetically
const sortedKeys = Array.from(contentKeys.keys()).sort();

console.log(`📊 Found ${sortedKeys.length} unique content keys\n`);
console.log('=' * 80);
console.log('COMPREHENSIVE CONTENT KEY USAGE REPORT');
console.log('=' * 80);

sortedKeys.forEach(key => {
  const usages = contentKeys.get(key);
  console.log(`\n🔑 Content Key: "${key}"`);
  console.log(`   Used ${usages.length} time(s):`);
  
  usages.forEach(usage => {
    console.log(`   📄 ${usage.file}:${usage.line} - ${usage.method}`);
    // Show a truncated version of the context
    const truncatedContext = usage.context.length > 80 
      ? usage.context.substring(0, 80) + '...' 
      : usage.context;
    console.log(`      ${truncatedContext}`);
  });
});

// Generate summary statistics
console.log('\n' + '=' * 80);
console.log('SUMMARY STATISTICS');
console.log('=' * 80);

const methodStats = {};
let totalUsages = 0;

contentKeys.forEach((usages, key) => {
  totalUsages += usages.length;
  usages.forEach(usage => {
    methodStats[usage.method] = (methodStats[usage.method] || 0) + 1;
  });
});

console.log(`📈 Total unique content keys: ${sortedKeys.length}`);
console.log(`📈 Total usage instances: ${totalUsages}`);
console.log('\n📊 Usage by method:');
Object.entries(methodStats).sort((a, b) => b[1] - a[1]).forEach(([method, count]) => {
  console.log(`   ${method}: ${count} usages`);
});

// Generate file for further analysis
const outputFile = '/Users/michaelmishayev/Projects/bankDev2_standalone/content_keys_analysis.json';
const outputData = {
  totalKeys: sortedKeys.length,
  totalUsages: totalUsages,
  methodStats: methodStats,
  keys: Object.fromEntries(contentKeys)
};

fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
console.log(`\n💾 Detailed analysis saved to: ${outputFile}`);

console.log('\n✅ Content key extraction completed!');