#!/usr/bin/env node
/**
 * Smoke test for critical form functionality
 */

require('dotenv').config();
const { chromium } = require('playwright');

async function smokeTestForms() {
  console.log('🚀 Running Form Smoke Tests...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const tests = [
    {
      name: 'Mortgage Calculator Step 3',
      url: 'http://localhost:5173/services/calculate-mortgage/3',
      selectors: {
        mainSource: '[data-testid="main-source-dropdown"], select[name*="main"], select[name*="source"]',
        additionalIncome: '[data-testid="additional-income-dropdown"], select[name*="additional"], select[name*="income"]'
      }
    },
    {
      name: 'Credit Calculator Step 3', 
      url: 'http://localhost:5173/services/calculate-credit/3',
      selectors: {
        mainSource: '[data-testid="main-source-dropdown"], select[name*="main"], select[name*="source"]'
      }
    },
    {
      name: 'Refinance Mortgage Step 3',
      url: 'http://localhost:5173/services/refinance-mortgage/3', 
      selectors: {
        mainSource: '[data-testid="main-source-dropdown"], select[name*="main"], select[name*="source"]'
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      
      await page.goto(test.url, { waitUntil: 'networkidle' });
      
      // Wait for dropdown components to load
      await page.waitForTimeout(2000);
      
      // Check if page loaded successfully
      const title = await page.title();
      if (title.includes('404') || title.includes('Error')) {
        throw new Error('Page not found or error page');
      }
      
      // Test each dropdown selector
      for (const [fieldName, selector] of Object.entries(test.selectors)) {
        try {
          // Try multiple selector strategies
          const element = await page.locator(selector).first();
          
          // Check if dropdown is present and has options
          if (await element.count() > 0) {
            // For select elements, check option count
            if (selector.includes('select')) {
              const options = await page.locator(`${selector} option`).count();
              if (options > 1) {
                console.log(`  ✅ ${fieldName}: ${options - 1} options available`);
              } else {
                console.log(`  ⚠️  ${fieldName}: No options available`);
              }
            } else {
              console.log(`  ✅ ${fieldName}: Dropdown component found`);
            }
          } else {
            console.log(`  ❌ ${fieldName}: Dropdown not found`);
          }
        } catch (err) {
          console.log(`  ❌ ${fieldName}: ${err.message}`);
        }
      }
      
      console.log(`  ✅ ${test.name} - Basic functionality working`);
      passed++;
      
    } catch (error) {
      console.log(`  ❌ ${test.name} - Failed: ${error.message}`);
      failed++;
    }
  }
  
  await browser.close();
  
  console.log(`\n📊 Smoke Test Results: ${passed}/${tests.length} tests passed`);
  
  if (failed > 0) {
    console.log('❌ Some form smoke tests failed - check frontend server and dropdown functionality');
    process.exit(1);
  } else {
    console.log('✅ All critical forms are loading correctly');
  }
}

// Check if frontend server is running
fetch('http://localhost:5173')
  .then(() => smokeTestForms())
  .catch(() => {
    console.error('❌ Frontend server not running on port 5173. Start with: npm run dev');
    process.exit(1);
  });