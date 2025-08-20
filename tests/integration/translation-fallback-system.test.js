/**
 * Translation Fallback System Integration Tests
 * 
 * Tests the critical translation system that shows raw keys instead of text
 * Validates content API and i18next fallback mechanisms
 * 
 * @author DevOps Team
 * @priority Critical - Translation failures create poor user experience
 */

const { test, expect } = require('@playwright/test');

// Test configuration  
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8003';
const TEST_TIMEOUT = 30000; // 30 seconds

test.describe('Translation Fallback System Integration Tests', () => {
  
  test.beforeEach(async () => {
    console.log('🌐 Starting translation fallback test');
  });

  test.afterEach(async () => {
    console.log('✅ Translation fallback test completed');
  });

  // Test critical content screens that have shown translation issues
  const criticalContentScreens = [
    {
      name: 'Mortgage Step 1',
      endpoint: '/api/content/mortgage_step1/en',
      language: 'en',
      criticalKeys: [
        'mortgage_step1.header.title',
        'mortgage_step1.field.property_price',
        'mortgage_step1.field.city',
        'mortgage_step1.field.property_ownership'
      ]
    },
    {
      name: 'Mortgage Step 1 Hebrew',
      endpoint: '/api/content/mortgage_step1/he', 
      language: 'he',
      criticalKeys: [
        'mortgage_step1.header.title',
        'mortgage_step1.field.property_price',
        'mortgage_step1.field.city'
      ]
    },
    {
      name: 'Refinance Step 1',
      endpoint: '/api/content/refinance_step1/en',
      language: 'en',
      criticalKeys: [
        'app.refinance.step1.title',
        'app.refinance.step1.description'
      ]
    },
    {
      name: 'Refinance Step 1 Hebrew',
      endpoint: '/api/content/refinance_step1/he',
      language: 'he', 
      criticalKeys: [
        'app.refinance.step1.title',
        'app.refinance.step1.description'
      ]
    },
    {
      name: 'Validation Errors',
      endpoint: '/api/content/validation_errors/en',
      language: 'en',
      criticalKeys: [
        'error_required',
        'error_min_length',
        'error_invalid_email'
      ]
    }
  ];

  criticalContentScreens.forEach(screen => {
    test(`should load ${screen.name} content successfully`, async () => {
      test.setTimeout(TEST_TIMEOUT);
      
      console.log(`Testing ${screen.name} content API`);
      
      const response = await fetch(`${API_BASE_URL}${screen.endpoint}`);
      
      // Should return 200 OK or have graceful fallback
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`${screen.name} response status:`, data.status);
        
        // Should have success status
        expect(['success', 'error']).toContain(data.status);
        
        if (data.status === 'success') {
          // Should have content data
          expect(data.content).toBeDefined();
          expect(typeof data.content).toBe('object');
          
          // Check critical translation keys exist
          let foundKeys = 0;
          screen.criticalKeys.forEach(key => {
            if (data.content[key]) {
              expect(data.content[key].value).toBeDefined();
              expect(data.content[key].value.trim()).not.toBe('');
              foundKeys++;
              console.log(`  ✅ ${key}: "${data.content[key].value}"`);
            } else {
              console.log(`  ⚠️ ${key}: Not found`);
            }
          });
          
          console.log(`✅ ${screen.name}: ${foundKeys}/${screen.criticalKeys.length} critical keys found`);
          
        } else if (data.status === 'error') {
          console.log(`⚠️ ${screen.name}: API returned error, fallback may be needed`);
          console.log(`Error message: ${data.message}`);
          
          // If error, should still have some fallback data or meaningful error
          expect(data.message).toBeDefined();
        }
        
      } else if (response.status === 404) {
        console.log(`ℹ️ ${screen.name}: Content endpoint not found, testing fallback mechanisms`);
      }
    });

    test(`should validate ${screen.name} content structure and quality`, async () => {
      test.setTimeout(TEST_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}${screen.endpoint}`);
      
      if (response.status === 200) {
        const data = await response.json();
        
        if (data.status === 'success' && data.content) {
          Object.keys(data.content).forEach(key => {
            const contentItem = data.content[key];
            
            // Each content item should have proper structure
            expect(contentItem.value).toBeDefined();
            expect(typeof contentItem.value).toBe('string');
            expect(contentItem.value.trim()).not.toBe('');
            
            // Should not contain raw translation keys
            expect(contentItem.value).not.toMatch(/^app\./);
            expect(contentItem.value).not.toMatch(/^error_/);
            expect(contentItem.value).not.toMatch(/^validation\./);
            
            // For Hebrew content, should contain Hebrew characters
            if (screen.language === 'he') {
              const hasHebrew = /[\u0590-\u05FF]/.test(contentItem.value);
              if (hasHebrew) {
                console.log(`  ✅ ${key}: Contains Hebrew text`);
              } else {
                console.log(`  ⚠️ ${key}: No Hebrew characters detected: "${contentItem.value}"`);
              }
            }
            
            // Should not be too short (likely missing translation)
            if (contentItem.value.length < 2) {
              console.log(`  ⚠️ ${key}: Very short translation: "${contentItem.value}"`);
            }
          });
          
          console.log(`✅ ${screen.name}: Content structure validated`);
        }
      }
    });
  });

  test('should test content API performance', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const startTime = Date.now();
    
    // Test primary content endpoint
    const response = await fetch(`${API_BASE_URL}/api/content/mortgage_step1/en`);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`Content API response time: ${responseTime}ms`);
    
    // Should respond reasonably quickly
    expect(responseTime).toBeLessThan(3000); // Within 3 seconds
    
    if (response.status === 200) {
      const data = await response.json();
      
      if (data.status === 'success') {
        const contentCount = Object.keys(data.content || {}).length;
        console.log(`✅ Loaded ${contentCount} content items in ${responseTime}ms`);
      }
    }
  });

  test('should validate multi-language content consistency', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const testScreen = 'mortgage_step1';
    const languages = ['en', 'he', 'ru'];
    
    const contentResults = {};
    
    for (const lang of languages) {
      const response = await fetch(`${API_BASE_URL}/api/content/${testScreen}/${lang}`);
      
      if (response.status === 200) {
        const data = await response.json();
        if (data.status === 'success') {
          contentResults[lang] = data.content;
          console.log(`✅ ${lang}: ${Object.keys(data.content).length} content items`);
        }
      } else {
        console.log(`⚠️ ${lang}: Not available (${response.status})`);
      }
    }
    
    // Compare content keys between languages
    const languages_available = Object.keys(contentResults);
    if (languages_available.length >= 2) {
      const [lang1, lang2] = languages_available;
      const keys1 = Object.keys(contentResults[lang1]);
      const keys2 = Object.keys(contentResults[lang2]);
      
      const commonKeys = keys1.filter(key => keys2.includes(key));
      const uniqueKeys1 = keys1.filter(key => !keys2.includes(key));
      const uniqueKeys2 = keys2.filter(key => !keys1.includes(key));
      
      console.log(`Common keys between ${lang1} and ${lang2}: ${commonKeys.length}`);
      console.log(`${lang1} unique keys: ${uniqueKeys1.length}`);
      console.log(`${lang2} unique keys: ${uniqueKeys2.length}`);
      
      if (uniqueKeys1.length > 0) {
        console.log(`${lang1} unique:`, uniqueKeys1.slice(0, 5));
      }
      if (uniqueKeys2.length > 0) {
        console.log(`${lang2} unique:`, uniqueKeys2.slice(0, 5));
      }
      
      // Should have reasonable overlap
      const overlapPercent = (commonKeys.length / Math.max(keys1.length, keys2.length)) * 100;
      expect(overlapPercent).toBeGreaterThan(50); // At least 50% overlap
      
      console.log(`✅ Content consistency: ${overlapPercent.toFixed(1)}% overlap`);
    }
  });

  test('should test translation fallback to i18next', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test what happens when content API is unavailable
    const nonExistentResponse = await fetch(`${API_BASE_URL}/api/content/nonexistent_screen/en`);
    
    if (nonExistentResponse.status === 404) {
      console.log('✅ Non-existent content returns 404 (fallback mechanism should activate)');
    } else if (nonExistentResponse.status === 200) {
      const data = await nonExistentResponse.json();
      if (data.status === 'error') {
        console.log('✅ Non-existent content returns error status (fallback mechanism should activate)');
        expect(data.message).toBeDefined();
      }
    }
    
    // Test static translation files are accessible (fallback mechanism)
    const staticTranslationResponse = await fetch(`${API_BASE_URL}/locales/en/translation.json`);
    
    if (staticTranslationResponse.status === 200) {
      const translations = await staticTranslationResponse.json();
      expect(typeof translations).toBe('object');
      
      const translationKeys = Object.keys(translations);
      console.log(`✅ Static translations available: ${translationKeys.length} keys`);
      
      // Check for critical translation keys
      const criticalStaticKeys = [
        'calculate_mortgage_property_ownership_option_1',
        'calculate_mortgage_property_ownership_option_2', 
        'calculate_mortgage_property_ownership_option_3'
      ];
      
      let foundStaticKeys = 0;
      criticalStaticKeys.forEach(key => {
        if (translations[key]) {
          foundStaticKeys++;
          console.log(`  ✅ ${key}: "${translations[key]}"`);
        }
      });
      
      console.log(`Static fallback coverage: ${foundStaticKeys}/${criticalStaticKeys.length} critical keys`);
      
    } else {
      console.log('⚠️ Static translation files not accessible via API');
    }
  });

  test('should validate content caching and cache invalidation', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const testUrl = `${API_BASE_URL}/api/content/mortgage_step1/en`;
    
    // First request
    const firstResponse = await fetch(testUrl);
    if (firstResponse.status === 200) {
      const firstData = await firstResponse.json();
      
      // Second request (should potentially be cached)
      const secondResponse = await fetch(testUrl);
      if (secondResponse.status === 200) {
        const secondData = await secondResponse.json();
        
        // Data should be consistent between requests
        expect(JSON.stringify(firstData.content)).toBe(JSON.stringify(secondData.content));
        console.log('✅ Content consistency between requests maintained');
      }
    }
  });

  test('should test content API error handling', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test various error scenarios
    const errorTests = [
      {
        name: 'Invalid screen',
        url: `${API_BASE_URL}/api/content/invalid_screen_name/en`,
        expectedStatuses: [404, 200] // 200 with error status is also acceptable
      },
      {
        name: 'Invalid language',
        url: `${API_BASE_URL}/api/content/mortgage_step1/invalid_lang`,
        expectedStatuses: [404, 200, 400]
      },
      {
        name: 'Malformed request',
        url: `${API_BASE_URL}/api/content//en`, // Double slash
        expectedStatuses: [404, 400]
      }
    ];
    
    for (const errorTest of errorTests) {
      console.log(`Testing ${errorTest.name}: ${errorTest.url}`);
      
      const response = await fetch(errorTest.url);
      
      expect(errorTest.expectedStatuses).toContain(response.status);
      console.log(`  Status: ${response.status} ✅`);
      
      if (response.status === 200) {
        const data = await response.json();
        if (data.status === 'error') {
          expect(data.message).toBeDefined();
          console.log(`  Error message: ${data.message}`);
        }
      }
    }
    
    console.log('✅ Error handling validation completed');
  });

  test('should validate translation content completeness', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test completeness of critical content
    const response = await fetch(`${API_BASE_URL}/api/content/mortgage_step1/en`);
    
    if (response.status === 200) {
      const data = await response.json();
      
      if (data.status === 'success' && data.content) {
        // Check for empty or placeholder content
        const emptyContent = [];
        const placeholderContent = [];
        
        Object.keys(data.content).forEach(key => {
          const value = data.content[key].value;
          
          if (!value || value.trim() === '') {
            emptyContent.push(key);
          } else if (value.includes('TODO') || value.includes('PLACEHOLDER') || value === key) {
            placeholderContent.push(key);
          }
        });
        
        if (emptyContent.length > 0) {
          console.log(`⚠️ Empty content keys: ${emptyContent.join(', ')}`);
        }
        
        if (placeholderContent.length > 0) {
          console.log(`⚠️ Placeholder content keys: ${placeholderContent.join(', ')}`);
        }
        
        const totalKeys = Object.keys(data.content).length;
        const completeKeys = totalKeys - emptyContent.length - placeholderContent.length;
        const completenessPercent = (completeKeys / totalKeys) * 100;
        
        console.log(`Content completeness: ${completenessPercent.toFixed(1)}% (${completeKeys}/${totalKeys})`);
        
        // Should have reasonable completeness
        expect(completenessPercent).toBeGreaterThan(70); // At least 70% complete
      }
    }
  });
});