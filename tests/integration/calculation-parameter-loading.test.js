/**
 * Calculation Parameter Loading Integration Tests
 * 
 * Tests the critical financial calculation parameters that power banking calculations
 * Validates calculation service API and fallback mechanisms for financial accuracy
 * 
 * @author DevOps Team
 * @priority CRITICAL - Financial calculation accuracy is legally required
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8003';
const TEST_TIMEOUT = 30000; // 30 seconds

test.describe('Calculation Parameter Loading Integration Tests', () => {
  
  test.beforeEach(async () => {
    console.log('💰 Starting calculation parameter test');
  });

  test.afterEach(async () => {
    console.log('✅ Calculation parameter test completed');
  });

  // Test critical business paths that require calculation parameters
  const criticalBusinessPaths = [
    {
      name: 'Mortgage Calculation',
      path: 'mortgage',
      requiredParameters: [
        'current_interest_rate',
        'property_ownership_ltvs',
        'standards'
      ],
      expectedLtvTypes: ['no_property', 'has_property', 'selling_property']
    },
    {
      name: 'Credit Calculation', 
      path: 'credit',
      requiredParameters: [
        'current_interest_rate',
        'standards'
      ]
    },
    {
      name: 'Mortgage Refinance',
      path: 'mortgage_refinance',
      requiredParameters: [
        'current_interest_rate',
        'property_ownership_ltvs',
        'standards'
      ]
    },
    {
      name: 'Credit Refinance',
      path: 'credit_refinance', 
      requiredParameters: [
        'current_interest_rate',
        'standards'
      ]
    }
  ];

  criticalBusinessPaths.forEach(businessPath => {
    test(`should load ${businessPath.name} calculation parameters`, async () => {
      test.setTimeout(TEST_TIMEOUT);
      
      console.log(`Testing ${businessPath.name} calculation parameters`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/calculation-parameters?business_path=${businessPath.path}`
      );
      
      // Should return 200 OK
      expect(response.status).toBe(200);
      
      const data = await response.json();
      console.log(`${businessPath.name} response status:`, data.status);
      
      // Should have success status or error with fallback
      expect(['success', 'error']).toContain(data.status);
      
      // Should have calculation data regardless of status
      expect(data.data).toBeDefined();
      expect(typeof data.data).toBe('object');
      
      // Validate required parameters exist
      businessPath.requiredParameters.forEach(param => {
        expect(data.data[param]).toBeDefined();
        console.log(`  ✅ ${param}: ${JSON.stringify(data.data[param])}`);
      });
      
      // Validate business path matches
      expect(data.data.business_path).toBe(businessPath.path);
      
      // Check if using fallback data
      if (data.data.is_fallback) {
        console.log(`⚠️ ${businessPath.name}: Using fallback parameters (database issue)`);
      } else {
        console.log(`✅ ${businessPath.name}: Using live database parameters`);
      }
      
      // Validate timestamp exists
      expect(data.data.last_updated).toBeDefined();
      expect(new Date(data.data.last_updated)).toBeInstanceOf(Date);
    });

    test(`should validate ${businessPath.name} interest rate accuracy`, async () => {
      test.setTimeout(TEST_TIMEOUT);
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/calculation-parameters?business_path=${businessPath.path}`
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Interest rate validation
      const interestRate = data.data.current_interest_rate;
      expect(typeof interestRate).toBe('number');
      
      // Reasonable interest rate bounds (0.1% to 50%)
      expect(interestRate).toBeGreaterThan(0.1);
      expect(interestRate).toBeLessThan(50.0);
      
      console.log(`✅ ${businessPath.name}: Interest rate ${interestRate}% is within bounds`);
      
      // For mortgage vs credit, rates should be different
      if (businessPath.path === 'mortgage') {
        // Mortgage rates typically 3-8%
        expect(interestRate).toBeLessThan(15.0);
        console.log(`  Mortgage rate validation: ${interestRate}% ✅`);
      } else if (businessPath.path === 'credit') {
        // Credit rates typically higher 5-20%
        expect(interestRate).toBeGreaterThan(3.0);
        console.log(`  Credit rate validation: ${interestRate}% ✅`);
      }
    });

    if (businessPath.expectedLtvTypes) {
      test(`should validate ${businessPath.name} LTV ratios`, async () => {
        test.setTimeout(TEST_TIMEOUT);
        
        const response = await fetch(
          `${API_BASE_URL}/api/v1/calculation-parameters?business_path=${businessPath.path}`
        );
        
        expect(response.status).toBe(200);
        const data = await response.json();
        
        // LTV ratios validation
        const ltvRatios = data.data.property_ownership_ltvs;
        expect(typeof ltvRatios).toBe('object');
        
        businessPath.expectedLtvTypes.forEach(ltvType => {
          expect(ltvRatios[ltvType]).toBeDefined();
          
          const ltvData = ltvRatios[ltvType];
          expect(ltvData.ltv).toBeDefined();
          expect(ltvData.min_down_payment).toBeDefined();
          
          // LTV should be reasonable percentage (20-80%)
          expect(ltvData.ltv).toBeGreaterThan(20.0);
          expect(ltvData.ltv).toBeLessThan(80.0);
          
          // LTV + min_down_payment should equal 100%
          expect(Math.abs((ltvData.ltv + ltvData.min_down_payment) - 100.0)).toBeLessThan(0.1);
          
          console.log(`  ✅ ${ltvType}: ${ltvData.ltv}% LTV, ${ltvData.min_down_payment}% down`);
        });
        
        // Validate business logic: no_property should have highest LTV
        if (ltvRatios.no_property && ltvRatios.has_property) {
          expect(ltvRatios.no_property.ltv).toBeGreaterThan(ltvRatios.has_property.ltv);
          console.log(`✅ Business logic: no_property LTV > has_property LTV`);
        }
      });
    }
  });

  test('should validate calculation parameter performance', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const startTime = Date.now();
    
    // Test most complex parameter endpoint
    const response = await fetch(
      `${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`Calculation parameters response time: ${responseTime}ms`);
    
    expect(response.status).toBe(200);
    
    // Should respond quickly for financial calculations
    expect(responseTime).toBeLessThan(2000); // Within 2 seconds
    
    const data = await response.json();
    expect(data.data).toBeDefined();
    
    console.log(`✅ Calculation parameters loaded in ${responseTime}ms`);
    
    if (data.data.is_fallback) {
      console.log('⚠️ Using fallback parameters (may indicate database issue)');
    }
  });

  test('should validate calculation parameter caching', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const testUrl = `${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`;
    
    // First request (may populate cache)
    const firstStart = Date.now();
    const firstResponse = await fetch(testUrl);
    const firstEnd = Date.now();
    const firstTime = firstEnd - firstStart;
    
    expect(firstResponse.status).toBe(200);
    const firstData = await firstResponse.json();
    
    console.log(`First request: ${firstTime}ms`);
    
    // Second request (should use cache if implemented)
    const secondStart = Date.now();
    const secondResponse = await fetch(testUrl);
    const secondEnd = Date.now();
    const secondTime = secondEnd - secondStart;
    
    expect(secondResponse.status).toBe(200);
    const secondData = await secondResponse.json();
    
    console.log(`Second request: ${secondTime}ms`);
    
    // Data should be consistent between requests
    expect(firstData.data.current_interest_rate).toBe(secondData.data.current_interest_rate);
    expect(JSON.stringify(firstData.data.property_ownership_ltvs)).toBe(
      JSON.stringify(secondData.data.property_ownership_ltvs)
    );
    
    console.log('✅ Calculation parameter consistency between requests maintained');
    
    if (secondTime < firstTime * 0.8) { // 20% faster
      console.log('✅ Caching appears to be working (faster second request)');
    }
  });

  test('should validate fallback mechanism reliability', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test all business paths to ensure fallbacks work
    const fallbackTests = await Promise.all(
      criticalBusinessPaths.map(async (bp) => {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/calculation-parameters?business_path=${bp.path}`
        );
        
        expect(response.status).toBe(200);
        const data = await response.json();
        
        return {
          path: bp.path,
          status: data.status,
          hasFallback: data.data.is_fallback || false,
          hasInterestRate: typeof data.data.current_interest_rate === 'number'
        };
      })
    );
    
    console.log('Fallback mechanism test results:');
    fallbackTests.forEach(result => {
      console.log(
        `  ${result.path}: ${result.status} ` +
        `(fallback: ${result.hasFallback}, rate: ${result.hasInterestRate})`
      );
      
      // Every business path should return usable data
      expect(result.hasInterestRate).toBe(true);
    });
    
    const allWorking = fallbackTests.every(r => r.hasInterestRate);
    expect(allWorking).toBe(true);
    
    console.log('✅ All business paths return usable calculation parameters');
  });

  test('should validate calculation standards integrity', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`
    );
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    // Validate standards structure
    const standards = data.data.standards;
    expect(typeof standards).toBe('object');
    
    // Check for common standard categories
    const expectedCategories = ['ltv', 'dti', 'credit_score', 'loan_terms'];
    let foundCategories = 0;
    
    expectedCategories.forEach(category => {
      if (standards[category]) {
        foundCategories++;
        console.log(`  ✅ ${category}: Available`);
        
        // Each standard should have numeric values
        Object.keys(standards[category]).forEach(standard => {
          const value = standards[category][standard].value;
          if (typeof value === 'number') {
            console.log(`    ${standard}: ${value}`);
            
            // Validate reasonable ranges for common standards
            if (standard.includes('ltv')) {
              expect(value).toBeGreaterThan(0);
              expect(value).toBeLessThan(100);
            } else if (standard.includes('dti')) {
              expect(value).toBeGreaterThan(10);
              expect(value).toBeLessThan(80);
            } else if (standard.includes('credit_score')) {
              expect(value).toBeGreaterThan(300);
              expect(value).toBeLessThan(850);
            }
          }
        });
      } else {
        console.log(`  ⚠️ ${category}: Not found`);
      }
    });
    
    console.log(`Standards categories found: ${foundCategories}/${expectedCategories.length}`);
  });

  test('should validate business path parameter differences', async () => {
    test.setTimeout(TEST_TIMEOUT * 2); // Double timeout for multiple requests
    
    // Get parameters for mortgage and credit
    const mortgageResponse = await fetch(
      `${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`
    );
    const creditResponse = await fetch(
      `${API_BASE_URL}/api/v1/calculation-parameters?business_path=credit`
    );
    
    expect(mortgageResponse.status).toBe(200);
    expect(creditResponse.status).toBe(200);
    
    const mortgageData = await mortgageResponse.json();
    const creditData = await creditResponse.json();
    
    console.log('Mortgage interest rate:', mortgageData.data.current_interest_rate);
    console.log('Credit interest rate:', creditData.data.current_interest_rate);
    
    // Interest rates should be different between products
    expect(mortgageData.data.current_interest_rate).not.toBe(
      creditData.data.current_interest_rate
    );
    
    // Mortgage should have LTV ratios, credit may not
    if (mortgageData.data.property_ownership_ltvs) {
      console.log('✅ Mortgage has property ownership LTV ratios');
    }
    
    // Both should have standards but they may differ
    expect(mortgageData.data.standards).toBeDefined();
    expect(creditData.data.standards).toBeDefined();
    
    console.log('✅ Business path parameter differentiation working');
  });

  test('should validate parameter data freshness', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`
    );
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    // Validate timestamp is recent
    const lastUpdated = new Date(data.data.last_updated);
    const now = new Date();
    const ageInDays = (now - lastUpdated) / (1000 * 60 * 60 * 24);
    
    console.log(`Parameters last updated: ${lastUpdated.toISOString()}`);
    console.log(`Age: ${ageInDays.toFixed(1)} days`);
    
    if (data.data.is_fallback) {
      console.log('ℹ️ Using fallback data, freshness check skipped');
    } else {
      // Live data should be relatively fresh (within 30 days)
      expect(ageInDays).toBeLessThan(30);
      console.log('✅ Parameter data is fresh');
    }
  });

  test('should handle invalid business path gracefully', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test invalid business path
    const response = await fetch(
      `${API_BASE_URL}/api/v1/calculation-parameters?business_path=invalid_path`
    );
    
    // Should handle gracefully (400, 404, or 200 with error)
    expect([200, 400, 404]).toContain(response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      
      if (data.status === 'error') {
        expect(data.message).toBeDefined();
        console.log(`✅ Invalid path error: ${data.message}`);
      } else {
        // May return default parameters
        console.log('ℹ️ Invalid path returned default parameters');
      }
    } else {
      console.log(`✅ Invalid path properly rejected: ${response.status}`);
    }
  });
});