import { test, expect } from '@playwright/test';

test.describe('Refinance Mortgage Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the refinance mortgage flow - it may redirect to step 1
    await page.goto('/services/refinance-mortgage/3');
    await page.waitForLoadState('networkidle');
    
    // Check current URL and navigate appropriately
    const currentURL = page.url();
    console.log(`Current URL after initial navigation: ${currentURL}`);
    
    // If we're at step 1, we need to fill out the form to reach step 3
    if (currentURL.includes('/services/refinance-mortgage/1')) {
      console.log('Starting from step 1, will navigate through form...');
      // Continue from step 1 for now to understand the flow
    }
  });

  test('should test form validation on refinance mortgage step 3', async ({ page }) => {
    // Test ID: test_001 - Check if page loads correctly
    console.log('Test ID: test_001 - Analyzing refinance mortgage form validation');
    const currentURL = page.url();
    console.log(`Testing form validation on: ${currentURL}`);
    
    // We'll test whichever step we land on
    await expect(page).toHaveURL(/.*\/services\/refinance-mortgage\/\d+/);
    
    // Test ID: test_002 - Take initial screenshot
    console.log('Test ID: test_002 - Taking initial screenshot');
    await page.screenshot({ 
      path: 'test-results/refinance-mortgage-initial-state.png',
      fullPage: true 
    });

    // Test ID: test_003 - Check for validation debug logs in console
    console.log('Test ID: test_003 - Setting up console log monitoring');
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      // Log validation-related console messages
      if (text.includes('validation') || text.includes('MainSourceOfIncome') || text.includes('isFormValid')) {
        console.log(`VALIDATION LOG: ${text}`);
      }
    });

    // Test ID: test_004 - Analyze form field states
    console.log('Test ID: test_004 - Analyzing form field states');
    
    // Check for main source of income dropdown
    const mainIncomeDropdown = page.locator('[data-testid*="main-source-income"], select[name*="income"], .main-source-income, [data-cy*="income"]').first();
    const mainIncomeExists = await mainIncomeDropdown.isVisible().catch(() => false);
    console.log(`Main source of income dropdown visible: ${mainIncomeExists}`);
    
    if (mainIncomeExists) {
      const dropdownValue = await mainIncomeDropdown.inputValue().catch(() => '');
      console.log(`Main source of income current value: "${dropdownValue}"`);
    }

    // Check for all form fields and their states
    const formFields = await page.locator('input, select, textarea').all();
    console.log(`Total form fields found: ${formFields.length}`);
    
    for (let i = 0; i < formFields.length; i++) {
      const field = formFields[i];
      const isVisible = await field.isVisible().catch(() => false);
      const isRequired = await field.getAttribute('required').catch(() => null);
      const value = await field.inputValue().catch(() => '');
      const fieldName = await field.getAttribute('name').catch(() => `field-${i}`);
      const fieldType = await field.getAttribute('type').catch(() => 'unknown');
      
      console.log(`Field ${i}: ${fieldName} (${fieldType}) - Visible: ${isVisible}, Required: ${!!isRequired}, Value: "${value}"`);
      
      // Check for validation errors
      const parentContainer = page.locator(`xpath=//input[@name="${fieldName}"]/parent::*/following-sibling::*[contains(@class, 'error') or contains(@class, 'invalid')]`);
      const hasError = await parentContainer.isVisible().catch(() => false);
      if (hasError) {
        const errorText = await parentContainer.textContent().catch(() => '');
        console.log(`  -> VALIDATION ERROR: ${errorText}`);
      }
    }

    // Test ID: test_005 - Test main source of income dropdown changes
    console.log('Test ID: test_005 - Testing main source of income dropdown changes');
    
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
            console.log(`Found dropdown with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (dropdown) {
        // Get available options
        const options = await dropdown.locator('option').all();
        console.log(`Dropdown has ${options.length} options`);
        
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          const value = await option.getAttribute('value').catch(() => '');
          const text = await option.textContent().catch(() => '');
          console.log(`  Option ${i}: value="${value}" text="${text}"`);
        }
        
        // Try selecting different options and check if button becomes enabled
        if (options.length > 1) {
          console.log('Testing dropdown option changes...');
          
          for (let i = 1; i < Math.min(3, options.length); i++) {
            const optionValue = await options[i].getAttribute('value').catch(() => '');
            if (optionValue && optionValue !== '') {
              console.log(`Selecting option: ${optionValue}`);
              await dropdown.selectOption(optionValue);
              await page.waitForTimeout(500); // Wait for validation to process
              
              // Check if continue/next button becomes enabled
              const continueButtons = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("המשך"), button:has-text("Продолжить"), .continue-btn, .next-btn').all();
              
              for (const btn of continueButtons) {
                const isEnabled = await btn.isEnabled().catch(() => false);
                const isVisible = await btn.isVisible().catch(() => false);
                const buttonText = await btn.textContent().catch(() => '');
                console.log(`  Button "${buttonText}" - Visible: ${isVisible}, Enabled: ${isEnabled}`);
              }
              
              // Log any new validation messages
              await page.waitForTimeout(100);
            }
          }
        }
      } else {
        console.log('Could not find main source of income dropdown with any selector');
      }
    }

    // Test ID: test_006 - Check for next/continue button status
    console.log('Test ID: test_006 - Checking continue/next button status');
    const continueButtons = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("המשך"), button:has-text("Продолжить"), .continue-btn, .next-btn').all();
    
    console.log(`Found ${continueButtons.length} potential continue buttons`);
    
    for (let i = 0; i < continueButtons.length; i++) {
      const btn = continueButtons[i];
      const isEnabled = await btn.isEnabled().catch(() => false);
      const isVisible = await btn.isVisible().catch(() => false);
      const buttonText = await btn.textContent().catch(() => '');
      const classes = await btn.getAttribute('class').catch(() => '');
      
      console.log(`Continue Button ${i}: "${buttonText}" - Visible: ${isVisible}, Enabled: ${isEnabled}, Classes: ${classes}`);
      
      if (!isEnabled) {
        console.log(`  -> BUTTON DISABLED - investigating validation issues`);
      }
    }

    // Test ID: test_007 - Final screenshot and summary
    console.log('Test ID: test_007 - Taking final screenshot and generating summary');
    await page.screenshot({ 
      path: 'test-results/refinance-mortgage-final-state.png',
      fullPage: true 
    });

    // Log all collected console messages for analysis
    console.log('\\n=== CONSOLE LOG SUMMARY ===');
    console.log(`Total console messages: ${consoleLogs.length}`);
    
    const validationLogs = consoleLogs.filter(log => 
      log.includes('validation') || 
      log.includes('MainSourceOfIncome') || 
      log.includes('isFormValid') ||
      log.includes('error') ||
      log.includes('required')
    );
    
    console.log(`Validation-related logs: ${validationLogs.length}`);
    validationLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log}`);
    });
    
    // Generate validation report
    console.log('\\n=== VALIDATION REPORT ===');
    console.log('This test analyzed the refinance mortgage form validation.');
    console.log('Check the console output above for specific field states and validation errors.');
    console.log('Screenshots saved to test-results/ directory.');
    
    // Ensure at least basic page functionality
    await expect(page.locator('body')).toBeVisible();
  });
});