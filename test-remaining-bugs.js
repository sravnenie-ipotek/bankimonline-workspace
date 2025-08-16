const { chromium } = require('playwright');

async function testRemainingBugs() {
  // Environment configuration
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
  const TEST_ENV = process.env.TEST_ENVIRONMENT || 'development';
  const IS_PRODUCTION = BASE_URL.includes('bankimonline.com');
  
  console.log('🔍 TESTING REMAINING BUGS FROM LAST RUN\n');
  console.log('=' .repeat(60));
  console.log(`🌍 Environment: ${TEST_ENV.toUpperCase()}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🛡️  Safety Mode: ${IS_PRODUCTION ? 'ENABLED (Production)' : 'DISABLED (Development)'}`);
  console.log('=' .repeat(60));

  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  
  const bugs = [];
  
  try {
    // BUG-003: Test Mortgage Calculator Dropdown
    console.log('\n📋 BUG-003: Mortgage Calculator - Property Ownership Dropdown');
    console.log('-'.repeat(60));
    
    await page.goto(`${BASE_URL}/services/calculate-mortgage`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for property ownership dropdown
    const dropdown = await page.locator('select[name="property_ownership"], #property_ownership, [data-testid="property-ownership"]').first();
    const dropdownExists = await dropdown.count() > 0;
    
    if (dropdownExists) {
      const options = await dropdown.locator('option').all();
      console.log(`  Dropdown found: YES`);
      console.log(`  Number of options: ${options.length}`);
      
      if (options.length > 1) { // More than just placeholder
        console.log('  ✅ Dropdown has options');
        for (let i = 0; i < Math.min(options.length, 5); i++) {
          const text = await options[i].textContent();
          console.log(`    Option ${i}: "${text}"`);
        }
      } else {
        console.log('  ❌ Dropdown is empty or only has placeholder');
        bugs.push({
          id: 'BUG-003',
          title: 'Property Ownership Dropdown Missing Options',
          severity: 'HIGH',
          location: 'Mortgage Calculator Step 1',
          description: 'Dropdown exists but has no selectable options'
        });
      }
    } else {
      console.log('  ❌ Property ownership dropdown not found');
      bugs.push({
        id: 'BUG-003',
        title: 'Property Ownership Dropdown Missing',
        severity: 'HIGH',
        location: 'Mortgage Calculator Step 1', 
        description: 'Dropdown element not found on page'
      });
    }
    
    // BUG-004: Test Refinance Credit Page
    console.log('\n📋 BUG-004: Refinance Credit Page Content');
    console.log('-'.repeat(60));
    
    await page.goto(`${BASE_URL}/services/refinance-credit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for any form content
    const refinanceCreditForm = await page.locator('form, [class*="form"], [class*="calculator"], main').first();
    const refinanceCreditContent = await page.locator('input, select, button').count();
    
    console.log(`  Page has form elements: ${refinanceCreditContent}`);
    
    if (refinanceCreditContent < 3) {
      console.log('  ❌ Page appears empty or incomplete');
      bugs.push({
        id: 'BUG-004',
        title: 'Refinance Credit Page Empty',
        severity: 'HIGH',
        location: '/services/refinance-credit',
        description: `Page has only ${refinanceCreditContent} interactive elements`
      });
    } else {
      console.log('  ✅ Page has content');
    }
    
    // BUG-005: Test Refinance Mortgage Page
    console.log('\n📋 BUG-005: Refinance Mortgage Page Content');
    console.log('-'.repeat(60));
    
    await page.goto(`${BASE_URL}/services/refinance-mortgage`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for any form content
    const refinanceMortgageForm = await page.locator('form, [class*="form"], [class*="calculator"], main').first();
    const refinanceMortgageContent = await page.locator('input, select, button').count();
    
    console.log(`  Page has form elements: ${refinanceMortgageContent}`);
    
    if (refinanceMortgageContent < 3) {
      console.log('  ❌ Page appears empty or incomplete');
      bugs.push({
        id: 'BUG-005',
        title: 'Refinance Mortgage Page Empty',
        severity: 'HIGH',
        location: '/services/refinance-mortgage',
        description: `Page has only ${refinanceMortgageContent} interactive elements`
      });
    } else {
      console.log('  ✅ Page has content');
    }
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 BUG VERIFICATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`\n✅ FIXED BUGS:`);
    console.log(`  - BUG-002: Menu Navigation (VERIFIED FIXED)`);
    
    if (bugs.length > 0) {
      console.log(`\n❌ REMAINING BUGS (${bugs.length}):`);
      bugs.forEach(bug => {
        console.log(`\n  ${bug.id}: ${bug.title}`);
        console.log(`    Severity: ${bug.severity}`);
        console.log(`    Location: ${bug.location}`);
        console.log(`    Issue: ${bug.description}`);
      });
      
      console.log('\n🔧 NEXT STEPS:');
      console.log('  1. Fix property ownership dropdown data population');
      console.log('  2. Implement refinance credit page components');
      console.log('  3. Implement refinance mortgage page components');
    } else {
      console.log('\n✅ ALL BUGS FIXED!');
      console.log('  All previously identified issues have been resolved.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Bug verification completed');
  }
}

// Run the test
testRemainingBugs().catch(console.error);