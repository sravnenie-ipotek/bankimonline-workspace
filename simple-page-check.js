#!/usr/bin/env node

/**
 * Simple page check - see what's actually rendering
 */

const { chromium } = require('playwright');

async function simplePageCheck() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture all console messages including React errors
  page.on('console', msg => {
    .toUpperCase()}]:`, msg.text());
  });

  // Capture page errors
  page.on('pageerror', error => {
    });

  // Capture request failures
  page.on('requestfailed', request => {
    }`);
  });
  
  try {
    await page.goto('http://localhost:5173/services/calculate-credit/3');
    await page.waitForTimeout(5000);
    
    // Get page text content
    const bodyText = await page.textContent('body');
    || bodyText.includes('credit'));
    );
    
    // Check if it's redirected or shows error
    const currentURL = page.url();
    // Look for any form containers
    const formContainers = await page.locator('.form-container, form, [data-testid*="form"]').count();
    // Look for any components at all
    const allElements = await page.locator('div, input, select, button').count();
    // Check for specific Credit Step 3 content
    const step3Content = await page.locator('text=/step.*3|3.*step|שלב.*3|3.*שלב/i').count();
    // Check if there's a loading state
    const loadingElements = await page.locator('text=/loading|טוען|загрузка/i').count();
    // Check for error messages
    const errorElements = await page.locator('text=/error|שגיאה|ошибка/i').count();
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'credit-step3-debug.png', fullPage: true });
    // Check if it's asking for login
    const loginElements = await page.locator('text=/login|התחבר|вход/i').count();
    // Check if there's navigation blocking
    const navElements = await page.locator('nav, .navigation, .sidebar, .menu').count();
    } catch (error) {
    console.error('❌ Check Error:', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

if (require.main === module) {
  simplePageCheck().catch(console.error);
}