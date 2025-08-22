import { test, expect, devices } from '@playwright/test';

/**
 * Critical Mobile User Flow Tests
 * Tests the most important user journeys on mobile devices
 */

test.describe('Mobile: Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Mobile: Button visibility in viewport', async ({ page, viewport }) => {
    // This test specifically checks for the button overflow issue
    await page.goto('/services/refinance-mortgage/1');
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Find all submit/continue buttons
    const buttons = await page.locator('button[type="submit"], button:has-text("המשך"), button:has-text("שמור")').all();
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box) {
        // Check if button is within viewport
        expect(box.y + box.height, 'Button should be fully visible in viewport').toBeLessThanOrEqual(viewport!.height);
        expect(box.x + box.width, 'Button should not overflow horizontally').toBeLessThanOrEqual(viewport!.width);
        
        // Check minimum touch target size (44x44 for iOS)
        expect(box.height, 'Button height should meet touch target').toBeGreaterThanOrEqual(44);
        expect(box.width, 'Button width should meet touch target').toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Mobile: Form scrollability', async ({ page, viewport }) => {
    await page.goto('/services/calculate-mortgage/1');
    
    // Check if form content is scrollable when needed
    const formHeight = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? form.scrollHeight : 0;
    });
    
    if (formHeight > viewport!.height) {
      // Content is taller than viewport, should be scrollable
      const isScrollable = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        return body.scrollHeight > window.innerHeight || html.scrollHeight > window.innerHeight;
      });
      
      expect(isScrollable, 'Long forms should be scrollable on mobile').toBeTruthy();
    }
  });

  test('Mobile: Touch interactions work correctly', async ({ page, browserName }) => {
    // Skip on desktop browsers
    if (!page.context()._options.isMobile) {
      test.skip();
    }
    
    await page.goto('/services/calculate-mortgage/1');
    
    // Test tap on input field
    const input = page.locator('input[type="text"]').first();
    await input.tap();
    await expect(input).toBeFocused();
    
    // Test swipe/scroll
    await page.evaluate(() => window.scrollTo(0, 200));
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('Mobile: RTL layout on Hebrew', async ({ page, viewport }) => {
    await page.goto('/');
    
    // Check RTL direction is set
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
    
    // Check that elements are properly aligned for RTL
    const buttons = await page.locator('button').all();
    for (const button of buttons.slice(0, 3)) { // Check first 3 buttons
      const box = await button.boundingBox();
      if (box) {
        // In RTL, buttons should generally be aligned to the right
        // But not overflow the viewport
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport!.width);
      }
    }
  });

  test('Mobile: Dropdown usability', async ({ page }) => {
    await page.goto('/services/borrowers-personal-data/2');
    
    // Find dropdowns
    const dropdowns = await page.locator('select').all();
    
    for (const dropdown of dropdowns.slice(0, 2)) { // Test first 2 dropdowns
      // Check if dropdown is visible and clickable
      await expect(dropdown).toBeVisible();
      
      // Check for duplicate options (the reported issue)
      const options = await dropdown.locator('option').allTextContents();
      const uniqueOptions = [...new Set(options)];
      
      expect(options.length, 'Dropdown should not have duplicate options').toBe(uniqueOptions.length);
    }
  });

  test('Mobile: Critical mortgage flow on iPhone', async ({ page, viewport }) => {
    // Simulate iPhone X viewport if not already
    if (viewport!.width !== 375) {
      await page.setViewportSize({ width: 375, height: 812 });
    }
    
    // Step 1: Navigate to mortgage calculator
    await page.goto('/services/calculate-mortgage/1');
    await page.waitForSelector('form');
    
    // Fill basic fields
    await page.fill('input[type="number"]', '1000000');
    
    // Find and check submit button visibility
    const submitButton = page.locator('button[type="submit"]').first();
    const buttonBox = await submitButton.boundingBox();
    
    // This should FAIL if button is outside viewport (the bug we found)
    if (buttonBox) {
      expect(buttonBox.y + buttonBox.height, 'Submit button must be within viewport').toBeLessThanOrEqual(812);
    }
    
    // Try to click the button (should work if visible)
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();
  });

  test('Mobile: Responsive images and text', async ({ page, viewport }) => {
    await page.goto('/');
    
    // Check that images don't overflow
    const images = await page.locator('img').all();
    for (const img of images.slice(0, 3)) { // Check first 3 images
      const box = await img.boundingBox();
      if (box) {
        expect(box.width, 'Images should not overflow viewport').toBeLessThanOrEqual(viewport!.width);
      }
    }
    
    // Check text is readable (font size)
    const fontSize = await page.evaluate(() => {
      const p = document.querySelector('p');
      return p ? parseInt(window.getComputedStyle(p).fontSize) : 0;
    });
    
    expect(fontSize, 'Text should be readable on mobile').toBeGreaterThanOrEqual(14);
  });

  test('Mobile: Performance on 3G network', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
    
    const startTime = Date.now();
    await page.goto('/services/calculate-mortgage/1');
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time even on slow network
    expect(loadTime, 'Page should load within 10 seconds on 3G').toBeLessThan(10000);
  });
});

test.describe('Mobile: Device-Specific Tests', () => {
  test('Small screen (iPhone SE)', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
      locale: 'he-IL',
    });
    const page = await context.newPage();
    
    await page.goto('/services/refinance-mortgage/1');
    
    // On small screens, check that form is still usable
    const form = await page.locator('form').boundingBox();
    if (form) {
      expect(form.width, 'Form should fit in small screen').toBeLessThanOrEqual(375);
    }
    
    await context.close();
  });

  test('Tablet layout (iPad)', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Mini'],
      locale: 'he-IL',
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Tablets might show different layout (e.g., sidebar)
    const viewport = page.viewportSize();
    expect(viewport!.width).toBe(768);
    
    // Check if layout adapts for tablet
    const hasTabletLayout = await page.evaluate(() => {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    });
    expect(hasTabletLayout).toBeTruthy();
    
    await context.close();
  });

  test('Landscape orientation', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12 landscape'],
      locale: 'he-IL',
    });
    const page = await context.newPage();
    
    await page.goto('/services/calculate-mortgage/1');
    
    // In landscape, height is limited
    const form = await page.locator('form').boundingBox();
    if (form) {
      // Check that critical elements are still visible
      const submitButton = await page.locator('button[type="submit"]').first().boundingBox();
      if (submitButton) {
        expect(submitButton.y + submitButton.height, 'Button visible in landscape').toBeLessThanOrEqual(390);
      }
    }
    
    await context.close();
  });
});