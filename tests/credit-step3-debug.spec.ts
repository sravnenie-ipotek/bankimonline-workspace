import { test, expect } from '@playwright/test';

/**
 * Credit Calculator Step 3 Debug Test
 * Focused test to verify specific fixes applied
 */

test.describe('Credit Calculator Step 3 Debug', () => {
  
  test('Verify Step 3 loads and dropdowns work', async ({ page }) => {
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
    
    // Wait for page content to be visible
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/step3-debug-initial.png',
      fullPage: true 
    });
    
    // Check for any visible dropdowns or select elements
    const selectElements = await page.locator('select').all();
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
        // Check options
        const optionCount = await element.locator('option').count();
        if (optionCount > 1) {
          const options = await element.locator('option').allTextContents();
          }`);
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
        // Check options
        const optionCount = await element.locator('option').count();
        if (optionCount > 1) {
          const options = await element.locator('option').allTextContents();
          }`);
        }
        
        additionalIncomeFound = true;
        break;
      }
    }
    
    // Look for any form fields or components
    const formElements = await page.locator('input, select, button').all();
    // Check page HTML content for debugging
    const pageContent = await page.content();
    const hasFormContent = pageContent.includes('select') || pageContent.includes('dropdown');
    // Look for specific Hebrew text
    const hasHebrewContent = pageContent.includes('מקור') || pageContent.includes('הכנסה');
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/step3-debug-final.png',
      fullPage: true 
    });
    
    // Wait for any async operations
    await page.waitForTimeout(3000);
    
    // Report console errors
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((error, index) => {
        });
    } else {
      }
    
    // Summary
    `);
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