#!/usr/bin/env node

/**
 * Debug Credit Step 3 - Check actual page state and console errors
 */

const { chromium } = require('playwright');

async function debugCreditStep3() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('🔍') || msg.text().includes('🚨')) {
      .toUpperCase()}]:`, msg.text());
    }
  });

  // Listen to network errors
  page.on('requestfailed', request => {
    } - ${request.failure()?.errorText}`);
  });
  
  try {
    await page.goto('http://localhost:5173/services/calculate-credit/3', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check page title and content
    const title = await page.title();
    // Check if page loaded properly
    const pageContent = await page.textContent('body');
    const hasError = pageContent.includes('error') || pageContent.includes('Error');
    // List all visible dropdowns/selects
    const allDropdowns = await page.locator('select, [role="button"][aria-haspopup], .MuiSelect-root, [data-testid*="dropdown"]').all();
    for (let i = 0; i < allDropdowns.length; i++) {
      const dropdown = allDropdowns[i];
      const isVisible = await dropdown.isVisible();
      const text = await dropdown.textContent();
      const placeholder = await dropdown.getAttribute('placeholder');
      const ariaLabel = await dropdown.getAttribute('aria-label');
      
      .substring(0, 50)}...`);
      }
    
    // Check form state by looking at Formik debug logs
    await page.waitForTimeout(3000);
    
    // Try to select main income source first
    const mainIncomeDropdown = await page.locator('[role="button"]:has([placeholder*="מקור"]), [role="button"]:has([placeholder*="בחר"])').first();
    
    if (await mainIncomeDropdown.isVisible()) {
      await mainIncomeDropdown.click();
      await page.waitForTimeout(2000);
      
      // Look for options
      const options = await page.locator('[role="option"], .MuiMenuItem-root').all();
      if (options.length > 0) {
        // Select employee option
        const employeeOption = options[0]; // First option should be "משכורת"
        const optionText = await employeeOption.textContent();
        await employeeOption.click();
        await page.waitForTimeout(3000);
        
        // Now check if additional fields appeared
        const afterDropdowns = await page.locator('select, [role="button"][aria-haspopup], .MuiSelect-root').all();
        `);
        
        if (afterDropdowns.length > allDropdowns.length) {
          // Look specifically for Field of Activity
          for (let i = 0; i < afterDropdowns.length; i++) {
            const dropdown = afterDropdowns[i];
            const placeholder = await dropdown.getAttribute('placeholder');
            const ariaLabel = await dropdown.getAttribute('aria-label');
            
            if ((placeholder && placeholder.includes('מקצועי')) || (ariaLabel && ariaLabel.includes('professional'))) {
              break;
            }
          }
        }
      }
    } else {
      }
    
    } catch (error) {
    console.error('❌ Debug Error:', error.message);
  } finally {
    await page.waitForTimeout(5000); // Keep browser open to see state
    await browser.close();
  }
}

if (require.main === module) {
  debugCreditStep3().catch(console.error);
}