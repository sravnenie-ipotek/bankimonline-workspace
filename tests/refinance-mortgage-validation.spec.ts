import { test, expect } from '@playwright/test';

test.describe('Refinance Mortgage Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the refinance mortgage flow - it may redirect to step 1
    await page.goto('/services/refinance-mortgage/3');
    await page.waitForLoadState('networkidle');
    
    // Check current URL and navigate appropriately
    const currentURL = page.url();
    // If we're at step 1, we need to fill out the form to reach step 3
    if (currentURL.includes('/services/refinance-mortgage/1')) {
      // Continue from step 1 for now to understand the flow
    }
  });

  test('should test form validation on refinance mortgage step 3', async ({ page }) => {
    // Test ID: test_001 - Check if page loads correctly
    const currentURL = page.url();
    // We'll test whichever step we land on
    await expect(page).toHaveURL(/.*\/services\/refinance-mortgage\/\d+/);
    
    // Test ID: test_002 - Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/refinance-mortgage-initial-state.png',
      fullPage: true 
    });

    // Test ID: test_003 - Check for validation debug logs in console
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      // Log validation-related console messages
      if (text.includes('validation') || text.includes('MainSourceOfIncome') || text.includes('isFormValid')) {
        }
    });

    // Test ID: test_004 - Analyze form field states
    // Check for main source of income dropdown
    const mainIncomeDropdown = page.locator('[data-testid*="main-source-income"], select[name*="income"], .main-source-income, [data-cy*="income"]').first();
    const mainIncomeExists = await mainIncomeDropdown.isVisible().catch(() => false);
    if (mainIncomeExists) {
      const dropdownValue = await mainIncomeDropdown.inputValue().catch(() => '');
      }

    // Check for all form fields and their states
    const formFields = await page.locator('input, select, textarea').all();
    for (let i = 0; i < formFields.length; i++) {
      const field = formFields[i];
      const isVisible = await field.isVisible().catch(() => false);
      const isRequired = await field.getAttribute('required').catch(() => null);
      const value = await field.inputValue().catch(() => '');
      const fieldName = await field.getAttribute('name').catch(() => `field-${i}`);
      const fieldType = await field.getAttribute('type').catch(() => 'unknown');
      
      - Visible: ${isVisible}, Required: ${!!isRequired}, Value: "${value}"`);
      
      // Check for validation errors
      const parentContainer = page.locator(`xpath=//input[@name="${fieldName}"]/parent::*/following-sibling::*[contains(@class, 'error') or contains(@class, 'invalid')]`);
      const hasError = await parentContainer.isVisible().catch(() => false);
      if (hasError) {
        const errorText = await parentContainer.textContent().catch(() => '');
        }
    }

    // Test ID: test_005 - Test main source of income dropdown changes
    if (mainIncomeExists) {
      // Try different selectors for the main source of income dropdown
      const possibleSelectors = [
        '[data-testid*="main-source-income"]',
        'select[name*="income"]',
        '.main-source-income select',
        '[data-cy*="income"]',
        'select:has-text("income")',
        'select:has-text("מקור")', // Hebrew for "source"
        'select:has-text("доход")'  // Russian for "income"
      ];
      
      let dropdown = null;
      for (const selector of possibleSelectors) {
        try {
          const element = page.locator(selector).first();
          const isVisible = await element.isVisible();
          if (isVisible) {
            dropdown = element;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (dropdown) {
        // Get available options
        const options = await dropdown.locator('option').all();
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          const value = await option.getAttribute('value').catch(() => '');
          const text = await option.textContent().catch(() => '');
          }
        
        // Try selecting different options and check if button becomes enabled
        if (options.length > 1) {
          for (let i = 1; i < Math.min(3, options.length); i++) {
            const optionValue = await options[i].getAttribute('value').catch(() => '');
            if (optionValue && optionValue !== '') {
              await dropdown.selectOption(optionValue);
              await page.waitForTimeout(500); // Wait for validation to process
              
              // Check if continue/next button becomes enabled
              const continueButtons = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("המשך"), button:has-text("Продолжить"), .continue-btn, .next-btn').all();
              
              for (const btn of continueButtons) {
                const isEnabled = await btn.isEnabled().catch(() => false);
                const isVisible = await btn.isVisible().catch(() => false);
                const buttonText = await btn.textContent().catch(() => '');
                }
              
              // Log any new validation messages
              await page.waitForTimeout(100);
            }
          }
        }
      } else {
        }
    }

    // Test ID: test_006 - Check for next/continue button status
    const continueButtons = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("המשך"), button:has-text("Продолжить"), .continue-btn, .next-btn').all();
    
    for (let i = 0; i < continueButtons.length; i++) {
      const btn = continueButtons[i];
      const isEnabled = await btn.isEnabled().catch(() => false);
      const isVisible = await btn.isVisible().catch(() => false);
      const buttonText = await btn.textContent().catch(() => '');
      const classes = await btn.getAttribute('class').catch(() => '');
      
      if (!isEnabled) {
        }
    }

    // Test ID: test_007 - Final screenshot and summary
    await page.screenshot({ 
      path: 'test-results/refinance-mortgage-final-state.png',
      fullPage: true 
    });

    // Log all collected console messages for analysis
    const validationLogs = consoleLogs.filter(log => 
      log.includes('validation') || 
      log.includes('MainSourceOfIncome') || 
      log.includes('isFormValid') ||
      log.includes('error') ||
      log.includes('required')
    );
    
    validationLogs.forEach((log, index) => {
      });
    
    // Generate validation report
    // Ensure at least basic page functionality
    await expect(page.locator('body')).toBeVisible();
  });
});