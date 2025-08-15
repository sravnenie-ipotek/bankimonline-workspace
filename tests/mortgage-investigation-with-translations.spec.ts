import { test, expect } from '@playwright/test';

test('🔍 Mortgage Investigation - Wait for Translations', async ({ page }) => {
  // Navigate to the page
  await page.goto('http://localhost:5173/services/calculate-mortgage/1', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  );
  
  // Wait for React app to show loading state
  await page.waitForFunction(
    () => document.querySelector('#root')?.innerHTML.length > 100,
    { timeout: 15000 }
  );
  
  // Take screenshot of loading state
  await page.screenshot({ path: 'test-results/loading-state.png' });
  // Wait for translations to finish loading - look for the loading message to disappear
  try {
    // Wait for the loading message to disappear (max 30 seconds)
    await page.waitForFunction(
      () => {
        const body = document.body.textContent;
        return body && !body.includes('Loading translations') && body.trim() !== 'You need to enable JavaScript to run this app.';
      },
      { timeout: 30000 }
    );
    
    } catch (error) {
    // Take screenshot of stuck state
    await page.screenshot({ path: 'test-results/translation-timeout.png' });
  }
  
  // Wait a bit more for UI to stabilize
  await page.waitForTimeout(3000);
  
  // Take final screenshot
  await page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
  // Get current page content
  const bodyText = await page.textContent('body');
  if (bodyText) {
    const firstWords = bodyText.trim().substring(0, 300);
    // Check for mortgage-related content
    const hasPropertyText = bodyText.toLowerCase().includes('property') || 
                           bodyText.includes('נכס') || 
                           bodyText.includes('недвижимость');
    const hasMortgageText = bodyText.toLowerCase().includes('mortgage') || 
                           bodyText.includes('משכנתא') || 
                           bodyText.includes('ипотека');
    
    }
  
  // Now try to find form elements
  try {
    const inputs = await page.$$('input');
    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const testId = await input.getAttribute('data-testid');
      const id = await input.getAttribute('id');
      
      }
  } catch (e) {
    }
  
  try {
    const selects = await page.$$('select');
    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      const name = await select.getAttribute('name');
      const testId = await select.getAttribute('data-testid');
      const id = await select.getAttribute('id');
      
      try {
        const options = await select.$$('option');
        for (let j = 0; j < Math.min(options.length, 5); j++) {
          const optionText = await options[j].textContent();
          const optionValue = await options[j].getAttribute('value');
          }"`);
        }
      } catch (optionError) {
        }
    }
  } catch (e) {
    }
  
  try {
    const buttons = await page.$$('button');
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const testId = await button.getAttribute('data-testid');
      
      }"`);
    }
  } catch (e) {
    }
  
  // Look for slider/range inputs
  try {
    const ranges = await page.$$('input[type="range"]');
    } catch (e) {
    }
  
  // Check for common CSS class names or patterns
  try {
    const elementsWithClasses = await page.$$('[class*="mortgage"], [class*="property"], [class*="loan"], [class*="slider"]');
    } catch (e) {
    }
  
  });