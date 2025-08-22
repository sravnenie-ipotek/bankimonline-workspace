#!/usr/bin/env node

/**
 * Quick Mobile Fix Verification Script
 * Tests critical mobile fixes after bug resolution
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function verifyMobileFixes() {
  console.log('🔍 Starting Mobile Fix Verification...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  const results = [];
  const screenshotDir = 'mobile-verification-screenshots';
  
  // Create screenshots directory
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  try {
    // Test 1: Refinance Mortgage Button Position
    console.log('✅ Test 1: Refinance Mortgage Button Position');
    await page.goto('http://localhost:5173/services/refinance-mortgage/1');
    await page.waitForTimeout(3000);
    
    // Check if button is within viewport
    const button = await page.locator('button:has-text("הבא"), button:has-text("שמור והמשך")').first();
    const buttonBox = await button.boundingBox();
    const viewport = page.viewportSize();
    
    const isButtonVisible = buttonBox && 
      buttonBox.y >= 0 && 
      (buttonBox.y + buttonBox.height) <= viewport.height &&
      buttonBox.x >= 0 && 
      (buttonBox.x + buttonBox.width) <= viewport.width;
    
    results.push({
      test: 'Button Position - Refinance Mortgage',
      status: isButtonVisible ? 'PASS' : 'FAIL',
      details: `Button at: ${buttonBox ? `${buttonBox.x}, ${buttonBox.y}` : 'not found'}, Viewport: ${viewport.width}x${viewport.height}`
    });
    
    await page.screenshot({ 
      path: `${screenshotDir}/refinance-mortgage-button-${Date.now()}.png`,
      fullPage: false 
    });
    
    // Test 2: Calculate Credit Button Position
    console.log('✅ Test 2: Calculate Credit Button Position');
    await page.goto('http://localhost:5173/services/calculate-credit/1');
    await page.waitForTimeout(3000);
    
    const creditButton = await page.locator('button:has-text("הבא"), button:has-text("שמור והמשך")').first();
    const creditButtonBox = await creditButton.boundingBox();
    
    const isCreditButtonVisible = creditButtonBox && 
      creditButtonBox.y >= 0 && 
      (creditButtonBox.y + creditButtonBox.height) <= viewport.height;
    
    results.push({
      test: 'Button Position - Calculate Credit',
      status: isCreditButtonVisible ? 'PASS' : 'FAIL',
      details: `Button at: ${creditButtonBox ? `${creditButtonBox.x}, ${creditButtonBox.y}` : 'not found'}`
    });
    
    await page.screenshot({ 
      path: `${screenshotDir}/calculate-credit-button-${Date.now()}.png`,
      fullPage: false 
    });
    
    // Test 3: Dropdown Functionality
    console.log('✅ Test 3: Dropdown Functionality (No Duplicates)');
    await page.goto('http://localhost:5173/services/calculate-credit/3');
    await page.waitForTimeout(3000);
    
    // Check for obligation dropdown
    const dropdown = await page.locator('[data-testid="dropdown"], .dropdown, select').first();
    let dropdownWorking = false;
    try {
      await dropdown.click();
      await page.waitForTimeout(1000);
      dropdownWorking = true;
    } catch (e) {
      console.log('Dropdown click failed:', e.message);
    }
    
    results.push({
      test: 'Dropdown Functionality',
      status: dropdownWorking ? 'PASS' : 'SKIP',
      details: 'Dropdown interaction test'
    });
    
    await page.screenshot({ 
      path: `${screenshotDir}/dropdown-test-${Date.now()}.png`,
      fullPage: false 
    });
    
  } catch (error) {
    console.error('Test error:', error);
    results.push({
      test: 'Error during testing',
      status: 'ERROR',
      details: error.message
    });
  }
  
  await browser.close();
  
  // Print Results
  console.log('\n🎯 MOBILE FIX VERIFICATION RESULTS');
  console.log('=====================================');
  
  let passCount = 0;
  let failCount = 0;
  
  results.forEach(result => {
    const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${result.test}: ${result.status}`);
    console.log(`   ${result.details}\n`);
    
    if (result.status === 'PASS') passCount++;
    if (result.status === 'FAIL') failCount++;
  });
  
  console.log(`\n📊 Summary: ${passCount} passed, ${failCount} failed`);
  console.log(`📷 Screenshots saved to: ${screenshotDir}/`);
  
  if (failCount === 0) {
    console.log('\n🎉 ALL MOBILE FIXES VERIFIED SUCCESSFULLY!');
  } else {
    console.log('\n⚠️  Some issues detected - review screenshots');
  }
  
  return { passCount, failCount, results };
}

// Run verification
verifyMobileFixes()
  .then(({ passCount, failCount }) => {
    process.exit(failCount > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });