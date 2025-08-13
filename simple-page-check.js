#!/usr/bin/env node

/**
 * Simple page check - see what's actually rendering
 */

const { chromium } = require('playwright');

async function simplePageCheck() {
  console.log('🔍 Simple Credit Step 3 Page Check\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture all console messages including React errors
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]:`, error.message);
  });

  // Capture request failures
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED]: ${request.url()}`);
  });
  
  try {
    console.log('1️⃣ Navigate to Credit Step 3...');
    await page.goto('http://localhost:5173/services/calculate-credit/3');
    await page.waitForTimeout(5000);
    
    console.log('2️⃣ Check page content...');
    
    // Get page text content
    const bodyText = await page.textContent('body');
    console.log('📄 Page contains "Credit":', bodyText.includes('Credit') || bodyText.includes('credit'));
    console.log('📄 Page contains Hebrew text:', /[\u0590-\u05FF]/.test(bodyText));
    
    // Check if it's redirected or shows error
    const currentURL = page.url();
    console.log('📍 Current URL:', currentURL);
    
    // Look for any form containers
    const formContainers = await page.locator('.form-container, form, [data-testid*="form"]').count();
    console.log('📋 Form containers found:', formContainers);
    
    // Look for any components at all
    const allElements = await page.locator('div, input, select, button').count();
    console.log('🔧 Total elements found:', allElements);
    
    // Check for specific Credit Step 3 content
    const step3Content = await page.locator('text=/step.*3|3.*step|שלב.*3|3.*שלב/i').count();
    console.log('3️⃣ Step 3 related text found:', step3Content);
    
    // Check if there's a loading state
    const loadingElements = await page.locator('text=/loading|טוען|загрузка/i').count();
    console.log('⏳ Loading indicators:', loadingElements);
    
    // Check for error messages
    const errorElements = await page.locator('text=/error|שגיאה|ошибка/i').count();
    console.log('❌ Error indicators:', errorElements);
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'credit-step3-debug.png', fullPage: true });
    console.log('📸 Screenshot saved as credit-step3-debug.png');
    
    console.log('\n4️⃣ Checking for authentication requirements...');
    
    // Check if it's asking for login
    const loginElements = await page.locator('text=/login|התחבר|вход/i').count();
    console.log('🔑 Login indicators:', loginElements);
    
    // Check if there's navigation blocking
    const navElements = await page.locator('nav, .navigation, .sidebar, .menu').count();
    console.log('🧭 Navigation elements:', navElements);
    
    console.log('\n🎯 Simple check completed');
    
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