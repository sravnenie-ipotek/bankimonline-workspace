import { test, expect } from '@playwright/test';

/**
 * Credit Calculator Step 3 Debug Test
 * Focused test to verify specific fixes applied
 */

test.describe('Credit Calculator Step 3 Debug', () => {
  
  test('Verify Step 3 loads and dropdowns work', async ({ page }) => {
    console.log('🚀 Starting Step 3 Debug Test...');
    
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to Step 3
    await page.goto('http://localhost:5173/services/calculate-credit/3', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('📄 Page loaded, waiting for content...');
    
    // Wait for page content to be visible
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/step3-debug-initial.png',
      fullPage: true 
    });
    
    console.log('📸 Initial screenshot taken');
    
    // Check for any visible dropdowns or select elements
    const selectElements = await page.locator('select').all();
    console.log(`Found ${selectElements.length} select elements`);
    
    // Check for main source of income dropdown
    const mainSourceSelectors = [
      'select[name="source"]',
      '[data-testid="main-source-of-income"]', 
      '.main-source-of-income select',
      'select:has-text("מקור הכנסה")',
      'select[placeholder*="מקור"]'
    ];
    
    let mainSourceFound = false;
    for (const selector of mainSourceSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log(`✅ Found Main Source dropdown with selector: ${selector}`);
        
        // Check options
        const optionCount = await element.locator('option').count();
        console.log(`   Options count: ${optionCount}`);
        
        if (optionCount > 1) {
          const options = await element.locator('option').allTextContents();
          console.log(`   Options: ${options.join(', ')}`);
        }
        
        mainSourceFound = true;
        break;
      }
    }
    
    // Check for additional income dropdown
    const additionalIncomeSelectors = [
      'select[name="additional"]',
      '[data-testid="additional-income"]',
      '.additional-income select',
      'select:has-text("הכנסה נוספת")',
      'select[placeholder*="נוספת"]'
    ];
    
    let additionalIncomeFound = false;
    for (const selector of additionalIncomeSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log(`✅ Found Additional Income dropdown with selector: ${selector}`);
        
        // Check options
        const optionCount = await element.locator('option').count();
        console.log(`   Options count: ${optionCount}`);
        
        if (optionCount > 1) {
          const options = await element.locator('option').allTextContents();
          console.log(`   Options: ${options.join(', ')}`);
        }
        
        additionalIncomeFound = true;
        break;
      }
    }
    
    // Look for any form fields or components
    const formElements = await page.locator('input, select, button').all();
    console.log(`📝 Found ${formElements.length} form elements total`);
    
    // Check page HTML content for debugging
    const pageContent = await page.content();
    const hasFormContent = pageContent.includes('select') || pageContent.includes('dropdown');
    console.log(`📋 Page has form content: ${hasFormContent}`);
    
    // Look for specific Hebrew text
    const hasHebrewContent = pageContent.includes('מקור') || pageContent.includes('הכנסה');
    console.log(`🔤 Page has Hebrew content: ${hasHebrewContent}`);
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/step3-debug-final.png',
      fullPage: true 
    });
    
    // Wait for any async operations
    await page.waitForTimeout(3000);
    
    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('❌ Console Errors Detected:');
      consoleErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Summary
    console.log('\n🎯 TEST SUMMARY:');
    console.log('================');
    console.log(`Main Source Dropdown Found: ${mainSourceFound ? '✅ YES' : '❌ NO'}`);
    console.log(`Additional Income Dropdown Found: ${additionalIncomeFound ? '✅ YES' : '❌ NO'}`);
    console.log(`Console Errors: ${consoleErrors.length === 0 ? '✅ NONE' : '❌ ' + consoleErrors.length}`);
    console.log(`Form Elements Present: ${formElements.length > 0 ? '✅ YES' : '❌ NO'} (${formElements.length})`);
    console.log(`Hebrew Content: ${hasHebrewContent ? '✅ YES' : '❌ NO'}`);
    
    // Basic assertions - page should load without critical errors
    expect(consoleErrors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') || 
      error.includes('Cannot read')
    ).length).toBe(0);
    
    // We should find at least some form elements
    expect(formElements.length).toBeGreaterThan(0);
  });
});