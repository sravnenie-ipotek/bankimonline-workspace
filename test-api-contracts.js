const fetch = require('node-fetch');

/**
 * API Contract Tests for Phase 5
 * Ensures /api/dropdowns response schema stability
 */

const API_BASE = 'http://localhost:8003';
const LANGUAGES = ['en', 'he', 'ru'];
const SCREENS = ['mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4'];

// Expected schema structure
const DROPDOWN_RESPONSE_SCHEMA = {
  status: 'string',
  screen_location: 'string', 
  language_code: 'string',
  dropdowns: 'array',
  options: 'object',
  placeholders: 'object',
  labels: 'object',
  cache_info: 'object|undefined',
  cached: 'boolean|undefined',
  performance: 'object|undefined'
};

const DROPDOWN_ITEM_SCHEMA = {
  key: 'string',
  label: 'string'
};

const OPTION_SCHEMA = {
  value: 'string',
  label: 'string'
};

const CACHE_INFO_SCHEMA = {
  hit: 'boolean',
  processing_time_ms: 'number'
};

// Utility functions
function validateType(value, expectedType) {
  if (expectedType.includes('|')) {
    const types = expectedType.split('|');
    return types.some(type => validateSingleType(value, type));
  }
  return validateSingleType(value, expectedType);
}

function validateSingleType(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'undefined':
      return value === undefined;
    default:
      return false;
  }
}

function validateSchema(data, schema, path = '') {
  const errors = [];
  
  for (const [key, expectedType] of Object.entries(schema)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in data) && !expectedType.includes('undefined')) {
      errors.push(`Missing required field: ${currentPath}`);
      continue;
    }
    
    if (key in data && !validateType(data[key], expectedType)) {
      errors.push(`Type mismatch at ${currentPath}: expected ${expectedType}, got ${typeof data[key]}`);
    }
  }
  
  // Check for unexpected fields
  for (const key of Object.keys(data)) {
    if (!(key in schema)) {
      errors.push(`Unexpected field: ${path ? `${path}.${key}` : key}`);
    }
  }
  
  return errors;
}

async function testDropdownEndpoint(screen, lang) {
  try {
    console.log(`\n📋 Testing /api/dropdowns/${screen}/${lang}`);
    
    const response = await fetch(`${API_BASE}/api/dropdowns/${screen}/${lang}`);
    const data = await response.json();
    
    // Validate main response schema
    const mainErrors = validateSchema(data, DROPDOWN_RESPONSE_SCHEMA);
    if (mainErrors.length > 0) {
      return {
        success: false,
        endpoint: `/api/dropdowns/${screen}/${lang}`,
        errors: mainErrors
      };
    }
    
    // Validate status
    if (data.status !== 'success') {
      return {
        success: false,
        endpoint: `/api/dropdowns/${screen}/${lang}`,
        errors: [`Expected status 'success', got '${data.status}'`]
      };
    }
    
    // Validate screen_location
    if (data.screen_location !== screen) {
      return {
        success: false,
        endpoint: `/api/dropdowns/${screen}/${lang}`,
        errors: [`Expected screen_location '${screen}', got '${data.screen_location}'`]
      };
    }
    
    // Validate language_code
    if (data.language_code !== lang) {
      return {
        success: false,
        endpoint: `/api/dropdowns/${screen}/${lang}`,
        errors: [`Expected language_code '${lang}', got '${data.language_code}'`]
      };
    }
    
    // Validate dropdowns array items
    const dropdownErrors = [];
    if (Array.isArray(data.dropdowns)) {
      data.dropdowns.forEach((item, index) => {
        const itemErrors = validateSchema(item, DROPDOWN_ITEM_SCHEMA, `dropdowns[${index}]`);
        dropdownErrors.push(...itemErrors);
      });
    }
    
    // Validate options structure
    const optionErrors = [];
    if (typeof data.options === 'object' && data.options !== null) {
      for (const [key, options] of Object.entries(data.options)) {
        if (!Array.isArray(options)) {
          optionErrors.push(`options.${key} should be an array`);
        } else {
          options.forEach((option, index) => {
            const itemErrors = validateSchema(option, OPTION_SCHEMA, `options.${key}[${index}]`);
            optionErrors.push(...itemErrors);
          });
        }
      }
    }
    
    // Validate cache_info if present
    const cacheErrors = [];
    if (data.cache_info !== undefined) {
      const itemErrors = validateSchema(data.cache_info, CACHE_INFO_SCHEMA, 'cache_info');
      cacheErrors.push(...itemErrors);
    }
    
    // Combine all errors
    const allErrors = [...dropdownErrors, ...optionErrors, ...cacheErrors];
    
    if (allErrors.length > 0) {
      return {
        success: false,
        endpoint: `/api/dropdowns/${screen}/${lang}`,
        errors: allErrors
      };
    }
    
    // Additional contract validations
    
    // 1. Every dropdown key should have corresponding options
    const contractErrors = [];
    if (Array.isArray(data.dropdowns)) {
      data.dropdowns.forEach(dropdown => {
        if (!data.options[dropdown.key]) {
          contractErrors.push(`Missing options for dropdown: ${dropdown.key}`);
        }
      });
    }
    
    // 2. All option keys should follow naming convention
    for (const key of Object.keys(data.options || {})) {
      if (!key.startsWith(`${screen}_`)) {
        contractErrors.push(`Option key '${key}' doesn't follow naming convention (should start with '${screen}_')`);
      }
    }
    
    // 3. Placeholders and labels should match dropdown keys
    for (const key of Object.keys(data.placeholders || {})) {
      if (!data.options[key]) {
        contractErrors.push(`Placeholder for non-existent dropdown: ${key}`);
      }
    }
    
    for (const key of Object.keys(data.labels || {})) {
      if (!data.options[key]) {
        contractErrors.push(`Label for non-existent dropdown: ${key}`);
      }
    }
    
    if (contractErrors.length > 0) {
      return {
        success: false,
        endpoint: `/api/dropdowns/${screen}/${lang}`,
        errors: contractErrors
      };
    }
    
    console.log(`✅ Contract validation passed`);
    return {
      success: true,
      endpoint: `/api/dropdowns/${screen}/${lang}`,
      dropdownCount: data.dropdowns?.length || 0,
      optionGroups: Object.keys(data.options || {}).length
    };
    
  } catch (error) {
    return {
      success: false,
      endpoint: `/api/dropdowns/${screen}/${lang}`,
      errors: [`Request failed: ${error.message}`]
    };
  }
}

async function testContentEndpoint(screen, lang) {
  try {
    console.log(`\n📋 Testing /api/content/${screen}/${lang}`);
    
    const response = await fetch(`${API_BASE}/api/content/${screen}/${lang}`);
    const data = await response.json();
    
    // Basic structure validation
    if (!data.content || typeof data.content !== 'object') {
      return {
        success: false,
        endpoint: `/api/content/${screen}/${lang}`,
        errors: ['Response missing content object']
      };
    }
    
    // Validate content items have required fields
    const contentErrors = [];
    for (const [key, item] of Object.entries(data.content)) {
      if (!item.value || typeof item.value !== 'string') {
        contentErrors.push(`Content item '${key}' missing or invalid value`);
      }
      if (!item.component_type || typeof item.component_type !== 'string') {
        contentErrors.push(`Content item '${key}' missing or invalid component_type`);
      }
    }
    
    if (contentErrors.length > 0) {
      return {
        success: false,
        endpoint: `/api/content/${screen}/${lang}`,
        errors: contentErrors
      };
    }
    
    console.log(`✅ Contract validation passed`);
    return {
      success: true,
      endpoint: `/api/content/${screen}/${lang}`,
      contentItems: Object.keys(data.content).length
    };
    
  } catch (error) {
    return {
      success: false,
      endpoint: `/api/content/${screen}/${lang}`,
      errors: [`Request failed: ${error.message}`]
    };
  }
}

async function runContractTests() {
  console.log('🔍 API Contract Tests - Phase 5');
  console.log('================================');
  console.log(`API Base: ${API_BASE}`);
  console.log(`Testing ${SCREENS.length} screens x ${LANGUAGES.length} languages`);
  
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };
  
  // Test dropdown endpoints
  console.log('\n🎯 Testing Dropdown Endpoints');
  console.log('----------------------------');
  
  for (const screen of SCREENS) {
    for (const lang of LANGUAGES) {
      const result = await testDropdownEndpoint(screen, lang);
      
      if (result.success) {
        results.passed++;
        console.log(`   Dropdowns: ${result.dropdownCount}, Option groups: ${result.optionGroups}`);
      } else {
        results.failed++;
        results.errors.push({
          endpoint: result.endpoint,
          errors: result.errors
        });
        console.log(`❌ Contract validation failed:`);
        result.errors.forEach(err => console.log(`   - ${err}`));
      }
    }
  }
  
  // Test content endpoints for comparison
  console.log('\n🎯 Testing Content Endpoints');
  console.log('---------------------------');
  
  for (const screen of SCREENS) {
    for (const lang of LANGUAGES) {
      const result = await testContentEndpoint(screen, lang);
      
      if (result.success) {
        results.passed++;
        console.log(`   Content items: ${result.contentItems}`);
      } else {
        results.failed++;
        results.errors.push({
          endpoint: result.endpoint,
          errors: result.errors
        });
        console.log(`❌ Contract validation failed:`);
        result.errors.forEach(err => console.log(`   - ${err}`));
      }
    }
  }
  
  // Summary
  console.log('\n📊 Contract Test Summary');
  console.log('=======================');
  console.log(`Total tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\n❌ Contract Violations:');
    results.errors.forEach(error => {
      console.log(`\n${error.endpoint}:`);
      error.errors.forEach(err => console.log(`  - ${err}`));
    });
    process.exit(1);
  } else {
    console.log('\n✅ All API contracts are stable!');
    console.log('The /api/dropdowns endpoint schema is consistent across all screens and languages.');
  }
}

// Check if server is running by testing a known endpoint
fetch(`${API_BASE}/api/v1/banks`)
  .then(response => {
    if (response.ok || response.status === 401) { // 401 is ok, means server is running
      console.log('✅ Server is running\n');
      runContractTests();
    } else {
      throw new Error('Server not responding properly');
    }
  })
  .catch((error) => {
    console.error('❌ Error: Server is not running on port 8003');
    console.error('Please start the server with: npm run dev');
    console.error('Error:', error.message);
    process.exit(1);
  });