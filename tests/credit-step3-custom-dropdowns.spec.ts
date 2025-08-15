import { test, expect } from '@playwright/test';

/**
 * Credit Calculator Step 3 Custom Dropdowns Test
 * Tests the actual custom dropdown components used in the application
 */

test.describe('Credit Calculator Step 3 - Custom Dropdowns', () => {
  
  test('Test custom dropdown components interactions', async ({ page }) => {
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate directly to Step 3
    await page.goto('http://localhost:5173/services/calculate-credit/3', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/custom-dropdowns-initial.png',
      fullPage: true 
    });

    // Look for custom dropdown components with Hebrew text
    const hebrewFieldLabels = [
      'מתי אתה מתכנן לקחת את השאראלי', // When do you plan to take the Israeli
      'למה אתה צריך את השאראלי',     // Why do you need the Israeli  
      'לאיזה תקופה'                  // For what period
    ];

    // Look for clickable dropdown elements
    const dropdownSelectors = [
      'div[role="button"]',
      '.dropdown',
      '.custom-select',
      'div:has(svg)', // Elements with dropdown arrows
      '[class*="dropdown"]',
      '[class*="select"]'
    ];

    const foundDropdowns = [];
    
    for (const selector of dropdownSelectors) {
      const elements = await page.locator(selector).all();
      
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (await element.isVisible()) {
          const text = await element.textContent();
          const hasHebrewText = hebrewFieldLabels.some(label => text && text.includes(label));
          
          if (hasHebrewText || text?.includes('בחר') || text?.includes('Please select')) {
            foundDropdowns.push({
              selector: selector,
              index: i,
              text: text?.substring(0, 50) || 'No text'
            });
          }
        }
      }
    }

    foundDropdowns.forEach((dropdown, idx) => {
      });

    // Test clicking on dropdown elements
    let dropdownsInteracted = 0;
    
    for (let i = 0; i < Math.min(foundDropdowns.length, 3); i++) {
      const dropdown = foundDropdowns[i];
      
      try {
        const element = page.locator(dropdown.selector).nth(dropdown.index);
        
        // Try to click the dropdown
        await element.click();
        await page.waitForTimeout(1000);
        
        // Look for opened dropdown options
        const dropdownOptions = await page.locator('.dropdown-menu, .options, .menu, [role="listbox"], [role="menu"]').all();
        
        let optionsFound = false;
        for (const optionContainer of dropdownOptions) {
          if (await optionContainer.isVisible()) {
            const options = await optionContainer.locator('div, li, span').all();
            // Try to select first option if available
            if (options.length > 0) {
              const firstOption = options[0];
              if (await firstOption.isVisible()) {
                const optionText = await firstOption.textContent();
                await firstOption.click();
                optionsFound = true;
                dropdownsInteracted++;
                break;
              }
            }
          }
        }
        
        if (!optionsFound) {
          }
        
        await page.waitForTimeout(500);
        
      } catch (error) {
        }
    }

    // Take screenshot after interactions
    await page.screenshot({ 
      path: 'test-results/custom-dropdowns-after-interaction.png',
      fullPage: true 
    });

    // Test form validation state
    // Look for validation messages
    const validationMessages = await page.locator('.error, .validation-error, [class*="error"]').all();
    const validationTexts = [];
    
    for (const msg of validationMessages) {
      if (await msg.isVisible()) {
        const text = await msg.textContent();
        if (text && text.trim()) {
          validationTexts.push(text.trim());
        }
      }
    }
    
    validationTexts.forEach((text, idx) => {
      });

    // Check for continue button state
    const continueButton = page.locator('button:has-text("הבא"), button:has-text("המשך")').first();
    const continueButtonEnabled = await continueButton.isEnabled().catch(() => false);
    const continueButtonVisible = await continueButton.isVisible().catch(() => false);
    
    await page.waitForTimeout(2000);

    // Final comprehensive report
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((error, idx) => {
        });
    }

    // Assertions
    expect(consoleErrors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') || 
      error.includes('Cannot read') ||
      error.includes('hoisting')
    ).length).toBe(0);

    // Form should be interactive
    expect(foundDropdowns.length).toBeGreaterThan(0);
    
    // Validation should be working
    expect(validationTexts.length).toBeGreaterThan(0);
  });
});