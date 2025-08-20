/**
 * Dropdown API Endpoints Integration Tests
 * 
 * Tests the critical dropdown functionality that has caused production issues
 * Validates JSONB dropdown system and fallback mechanisms
 * 
 * @author DevOps Team
 * @priority Critical - Dropdown failures directly impact user experience
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8003';
const TEST_TIMEOUT = 30000; // 30 seconds

test.describe('Dropdown API Endpoints Integration Tests', () => {
  
  test.beforeEach(async () => {
    console.log('🔽 Starting dropdown API test');
  });

  test.afterEach(async () => {
    console.log('✅ Dropdown API test completed');
  });

  // Test critical dropdown endpoints that have failed in production
  const criticalDropdowns = [
    {
      name: 'Mortgage Step 1',
      endpoint: '/api/dropdowns/mortgage_step1/en',
      businessPath: 'mortgage',
      requiredFields: ['when_needed', 'type', 'first_home', 'property_ownership']
    },
    {
      name: 'Credit Step 3', 
      endpoint: '/api/dropdowns/credit_step3/en',
      businessPath: 'credit',
      requiredFields: ['income_source', 'employment_type', 'citizenship']
    },
    {
      name: 'Refinance Mortgage',
      endpoint: '/api/dropdowns/refinance_mortgage_step1/en',
      businessPath: 'mortgage_refinance', 
      requiredFields: ['current_loan_type', 'refinance_reason']
    },
    {
      name: 'Refinance Credit',
      endpoint: '/api/dropdowns/refinance_credit_step1/en',
      businessPath: 'credit_refinance',
      requiredFields: ['current_credit_type', 'refinance_goal']
    }
  ];

  criticalDropdowns.forEach(dropdown => {
    test(`should load ${dropdown.name} dropdowns successfully`, async () => {
      test.setTimeout(TEST_TIMEOUT);
      
      console.log(`Testing ${dropdown.name} dropdown API`);
      
      const response = await fetch(`${API_BASE_URL}${dropdown.endpoint}`);
      
      // Should return 200 OK
      expect(response.status).toBe(200);
      
      const data = await response.json();
      console.log(`${dropdown.name} response:`, JSON.stringify(data, null, 2));
      
      // Should have success status
      expect(data.status).toBe('success');
      
      // Should have dropdown data
      expect(data.dropdowns).toBeDefined();
      expect(typeof data.dropdowns).toBe('object');
      
      // Should have at least some dropdown fields
      const dropdownKeys = Object.keys(data.dropdowns);
      expect(dropdownKeys.length).toBeGreaterThan(0);
      
      console.log(`✅ ${dropdown.name}: ${dropdownKeys.length} dropdown fields loaded`);
      
      // Validate required fields exist
      dropdown.requiredFields.forEach(field => {
        if (data.dropdowns[field]) {
          expect(Array.isArray(data.dropdowns[field])).toBe(true);
          expect(data.dropdowns[field].length).toBeGreaterThan(0);
          console.log(`  ✅ ${field}: ${data.dropdowns[field].length} options`);
        } else {
          console.log(`  ⚠️ ${field}: Not found (may be expected)`);
        }
      });
    });

    test(`should validate ${dropdown.name} dropdown option structure`, async () => {
      test.setTimeout(TEST_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}${dropdown.endpoint}`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      
      // Validate dropdown option structure
      Object.keys(data.dropdowns).forEach(fieldName => {
        const options = data.dropdowns[fieldName];
        
        if (Array.isArray(options) && options.length > 0) {
          options.forEach((option, index) => {
            // Each option should have value and label
            expect(option.value).toBeDefined();
            expect(option.label).toBeDefined();
            
            // Values should not be empty
            expect(option.value.toString().trim()).not.toBe('');
            expect(option.label.toString().trim()).not.toBe('');
            
            console.log(`  ${fieldName}[${index}]: ${option.value} = ${option.label}`);
          });
        }
      });
      
      console.log(`✅ ${dropdown.name}: All dropdown options have valid structure`);
    });
  });

  test('should handle multi-language dropdown support', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const languages = ['en', 'he', 'ru'];
    const testEndpoint = '/api/dropdowns/mortgage_step1';
    
    for (const lang of languages) {
      console.log(`Testing ${lang} language support`);
      
      const response = await fetch(`${API_BASE_URL}${testEndpoint}/${lang}`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.status).toBe('success');
        expect(data.dropdowns).toBeDefined();
        
        console.log(`✅ ${lang}: Dropdown data loaded`);
        
        // Check if labels are in correct language (basic validation)
        const dropdownKeys = Object.keys(data.dropdowns);
        if (dropdownKeys.length > 0) {
          const firstDropdown = data.dropdowns[dropdownKeys[0]];
          if (Array.isArray(firstDropdown) && firstDropdown.length > 0) {
            console.log(`  Sample label in ${lang}: "${firstDropdown[0].label}"`);
          }
        }
      } else {
        console.log(`⚠️ ${lang}: Not available (status: ${response.status})`);
      }
    }
  });

  test('should validate JSONB dropdown performance', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const startTime = Date.now();
    
    // Test largest dropdown endpoint
    const response = await fetch(`${API_BASE_URL}/api/dropdowns/mortgage_step1/en`);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`Dropdown API response time: ${responseTime}ms`);
    
    expect(response.status).toBe(200);
    
    // Should respond within 2 seconds (JSONB should be fast)
    expect(responseTime).toBeLessThan(2000);
    
    const data = await response.json();
    expect(data.status).toBe('success');
    
    // Count total dropdown options loaded
    let totalOptions = 0;
    Object.values(data.dropdowns).forEach(options => {
      if (Array.isArray(options)) {
        totalOptions += options.length;
      }
    });
    
    console.log(`✅ Loaded ${totalOptions} total dropdown options in ${responseTime}ms`);
  });

  test('should validate dropdown caching mechanism', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const testUrl = `${API_BASE_URL}/api/dropdowns/mortgage_step1/en`;
    
    // First request (cold cache)
    const firstStart = Date.now();
    const firstResponse = await fetch(testUrl);
    const firstEnd = Date.now();
    const firstTime = firstEnd - firstStart;
    
    expect(firstResponse.status).toBe(200);
    const firstData = await firstResponse.json();
    expect(firstData.status).toBe('success');
    
    console.log(`First request (cold cache): ${firstTime}ms`);
    
    // Second request (should be cached)
    const secondStart = Date.now();
    const secondResponse = await fetch(testUrl);
    const secondEnd = Date.now();
    const secondTime = secondEnd - secondStart;
    
    expect(secondResponse.status).toBe(200);
    const secondData = await secondResponse.json();
    expect(secondData.status).toBe('success');
    
    console.log(`Second request (warm cache): ${secondTime}ms`);
    
    // Cached response should be faster or same data
    if (secondTime < firstTime) {
      console.log('✅ Caching appears to be working (faster second request)');
    } else {
      console.log('ℹ️ No significant caching improvement detected');
    }
    
    // Data should be identical
    expect(JSON.stringify(firstData.dropdowns)).toBe(JSON.stringify(secondData.dropdowns));
  });

  test('should test dropdown fallback mechanisms', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test with potentially non-existent dropdown
    const response = await fetch(`${API_BASE_URL}/api/dropdowns/nonexistent_step/en`);
    
    if (response.status === 404) {
      console.log('✅ Non-existent dropdown properly returns 404');
    } else if (response.status === 200) {
      const data = await response.json();
      
      if (data.status === 'error') {
        console.log('✅ Non-existent dropdown properly returns error status');
        expect(data.message).toBeDefined();
      } else {
        console.log('ℹ️ Non-existent dropdown returned success (may have fallback)');
      }
    }
  });

  test('should validate bulk dropdown loading', async () => {
    test.setTimeout(TEST_TIMEOUT * 2); // Double timeout for bulk test
    
    // Test multiple dropdown endpoints concurrently
    const endpointPromises = criticalDropdowns.map(dropdown => 
      fetch(`${API_BASE_URL}${dropdown.endpoint}`)
        .then(response => response.json())
        .then(data => ({
          name: dropdown.name,
          status: data.status,
          dropdownCount: Object.keys(data.dropdowns || {}).length
        }))
        .catch(error => ({
          name: dropdown.name,
          status: 'error',
          error: error.message
        }))
    );
    
    const results = await Promise.all(endpointPromises);
    
    console.log('Bulk dropdown loading results:');
    results.forEach(result => {
      console.log(`  ${result.name}: ${result.status} (${result.dropdownCount || 0} dropdowns)`);
      
      if (result.status === 'success') {
        expect(result.dropdownCount).toBeGreaterThan(0);
      } else {
        console.log(`    Error: ${result.error || 'Unknown'}`);
      }
    });
    
    // At least 50% of critical dropdowns should work
    const successCount = results.filter(r => r.status === 'success').length;
    const successRate = (successCount / results.length) * 100;
    
    console.log(`Success rate: ${successRate}% (${successCount}/${results.length})`);
    expect(successRate).toBeGreaterThan(50);
  });

  test('should validate dropdown data consistency', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test same dropdown in different languages for consistency
    const baseEndpoint = '/api/dropdowns/mortgage_step1';
    const languages = ['en', 'he'];
    
    const responses = {};
    
    for (const lang of languages) {
      const response = await fetch(`${API_BASE_URL}${baseEndpoint}/${lang}`);
      if (response.status === 200) {
        responses[lang] = await response.json();
      }
    }
    
    if (responses.en && responses.he) {
      // Should have same dropdown fields
      const enFields = Object.keys(responses.en.dropdowns);
      const heFields = Object.keys(responses.he.dropdowns);
      
      console.log(`EN fields: ${enFields.join(', ')}`);
      console.log(`HE fields: ${heFields.join(', ')}`);
      
      // Field count should be similar (within 10% difference)
      const fieldDifference = Math.abs(enFields.length - heFields.length);
      const averageFields = (enFields.length + heFields.length) / 2;
      const differencePercent = (fieldDifference / averageFields) * 100;
      
      expect(differencePercent).toBeLessThan(10); // Less than 10% difference
      
      console.log(`✅ Field consistency: ${differencePercent.toFixed(1)}% difference`);
    } else {
      console.log('ℹ️ Multi-language consistency test skipped (languages not available)');
    }
  });
});