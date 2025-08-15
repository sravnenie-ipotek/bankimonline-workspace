import { test, expect } from '@playwright/test';

test('🔍 Simple Mortgage Calculator Investigation', async ({ page }) => {
  // Navigate with longer timeout
  await page.goto('http://localhost:5173/services/calculate-mortgage/1', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  );
  
  // Wait for React app to load - look for the root div to have content
  await page.waitForFunction(
    () => document.querySelector('#root')?.innerHTML.length > 100,
    { timeout: 15000 }
  );
  
  // Take screenshot for visual inspection
  await page.screenshot({ path: 'test-results/mortgage-step1-actual.png', fullPage: true });
  // Get page title
  const title = await page.title();
  // Check for any text on the page
  const bodyText = await page.textContent('body');
  const hasContent = bodyText && bodyText.length > 10;
  if (bodyText) {
    const firstWords = bodyText.trim().substring(0, 200);
    }
  
  // Look for form elements without waiting for specific selectors
  try {
    const inputs = await page.$$('input');
    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      const type = await inputs[i].getAttribute('type');
      const name = await inputs[i].getAttribute('name');
      const placeholder = await inputs[i].getAttribute('placeholder');
      }
  } catch (e) {
    }
  
  try {
    const selects = await page.$$('select');
    for (let i = 0; i < selects.length; i++) {
      const name = await selects[i].getAttribute('name');
      const options = await selects[i].$$('option');
      for (let j = 0; j < Math.min(options.length, 3); j++) {
        const optionText = await options[j].textContent();
        }
    }
  } catch (e) {
    }
  
  try {
    const buttons = await page.$$('button');
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      const text = await buttons[i].textContent();
      }"`);
    }
  } catch (e) {
    }
  
  // Look for specific mortgage-related text
  const containsProperty = bodyText?.toLowerCase().includes('property') || bodyText?.toLowerCase().includes('נכס');
  const containsMortgage = bodyText?.toLowerCase().includes('mortgage') || bodyText?.toLowerCase().includes('משכנתא');
  const containsLoan = bodyText?.toLowerCase().includes('loan') || bodyText?.toLowerCase().includes('הלוואה');
  
  // Check if page is showing error or loading state
  const hasError = bodyText?.toLowerCase().includes('error') || bodyText?.toLowerCase().includes('not found');
  const hasLoading = bodyText?.toLowerCase().includes('loading') || bodyText?.toLowerCase().includes('טוען');
  
  });