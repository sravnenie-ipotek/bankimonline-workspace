const { chromium } = require('playwright');
const fs = require('fs');

class ComprehensiveMenuTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      navigationBugTest: null,
      confluenceComparison: [],
      testedUrls: new Set(),
      menuHierarchy: {},
      emptyPages: [],
      brokenLinks: [],
      workingPages: [],
      submenus: [],
      deepestLevel: 0,
      totalLinksFound: 0,
      totalLinksTested: 0,
      issues: [],
      screenshots: []
    };
    
    this.visitedUrls = new Set();
    this.menuQueue = [];
  }

  // Test critical navigation bug fix
  async testNavigationBugFix(page) {
    console.log('\n🐛 TESTING CRITICAL NAVIGATION BUG FIX...\n');
    console.log('Issue: Menu button disappears after navigating from service pages');
    console.log('Expected: Menu button should always be visible on non-service pages\n');
    
    const testResult = {
      testName: 'Navigation Bug Fix - Menu Button Persistence',
      status: 'PENDING',
      steps: [],
      screenshots: []
    };
    
    try {
      // Step 1: Navigate to homepage
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      testResult.steps.push({ step: 'Navigate to homepage', status: 'PASS' });
      
      // Step 2: Open menu
      const burgerButton = await page.locator('.burger, [class*="burger"], button:has(span)').first();
      if (await burgerButton.isVisible()) {
        await burgerButton.click();
        await page.waitForTimeout(500);
        console.log('✅ Step 1: Menu opened successfully');
        testResult.steps.push({ step: 'Open menu', status: 'PASS' });
        
        // Take screenshot of open menu
        const menuOpenScreenshot = `screenshots/menu-open-${Date.now()}.png`;
        await page.screenshot({ path: menuOpenScreenshot, fullPage: true });
        testResult.screenshots.push(menuOpenScreenshot);
        
        // Step 3: Navigate to Services -> Mortgage Calculator
        // Try Hebrew text first
        let servicesLink = await page.locator('text="השירותים שלנו"').first();
        if (await servicesLink.count() === 0) {
          servicesLink = await page.locator('text="Our Services"').first();
        }
        
        if (await servicesLink.count() > 0) {
          await servicesLink.click();
          await page.waitForTimeout(500);
          console.log('✅ Step 2: Clicked on Services menu');
          testResult.steps.push({ step: 'Click Services menu', status: 'PASS' });
          
          // Look for Mortgage Calculator link
          let mortgageLink = await page.locator('text="חישוב משכנתא"').first();
          if (await mortgageLink.count() === 0) {
            mortgageLink = await page.locator('text="Mortgage Calculator"').first();
          }
          
          if (await mortgageLink.count() > 0) {
            await mortgageLink.click();
            await page.waitForLoadState('networkidle');
            console.log('✅ Step 3: Navigated to Mortgage Calculator');
            testResult.steps.push({ step: 'Navigate to Mortgage Calculator', status: 'PASS' });
            
            // Take screenshot on service page
            const servicePageScreenshot = `screenshots/service-page-${Date.now()}.png`;
            await page.screenshot({ path: servicePageScreenshot, fullPage: true });
            testResult.screenshots.push(servicePageScreenshot);
            
            // Step 4: Click logo to go home
            const logoSelectors = [
              'img[src*="logo"]',
              'img[alt*="logo"]',
              '.logo-container a',
              '[class*="logo"] a',
              'header a:has(img)',
              'a:has(img[src*="logo"])'
            ];
            
            let logoClicked = false;
            for (const selector of logoSelectors) {
              const logo = await page.locator(selector).first();
              if (await logo.count() > 0) {
                await logo.click();
                await page.waitForLoadState('networkidle');
                logoClicked = true;
                console.log('✅ Step 4: Navigated home via logo');
                testResult.steps.push({ step: 'Click logo to go home', status: 'PASS' });
                break;
              }
            }
            
            if (logoClicked) {
              // Step 5: Check if burger button is visible
              await page.waitForTimeout(1000); // Give UI time to update
              const burgerAfterNav = await page.locator('.burger, [class*="burger"], button:has(span)').first();
              
              if (await burgerAfterNav.isVisible()) {
                console.log('✅ Step 5: PASS - Burger menu button is visible after navigation');
                testResult.steps.push({ step: 'Burger button visible after navigation', status: 'PASS' });
                
                // Step 6: Try to open menu without refresh
                await burgerAfterNav.click();
                await page.waitForTimeout(500);
                
                const menuSelectors = [
                  '.mobile-menu',
                  '[class*="sidebar"]',
                  '[class*="menu"][class*="open"]',
                  '.nav-menu'
                ];
                
                let menuVisible = false;
                for (const selector of menuSelectors) {
                  const menu = await page.locator(selector).first();
                  if (await menu.count() > 0 && await menu.isVisible()) {
                    menuVisible = true;
                    break;
                  }
                }
                
                if (menuVisible) {
                  console.log('✅ Step 6: PASS - Menu opens without page refresh');
                  testResult.steps.push({ step: 'Menu opens without refresh', status: 'PASS' });
                  testResult.status = 'PASS';
                  
                  // Take success screenshot
                  const successScreenshot = `screenshots/bug-fix-success-${Date.now()}.png`;
                  await page.screenshot({ path: successScreenshot, fullPage: true });
                  testResult.screenshots.push(successScreenshot);
                  
                  this.results.workingPages.push({
                    text: 'Navigation Bug Fix - VERIFIED',
                    url: 'Menu button persists after logo navigation',
                    depth: 0,
                    contentLength: 0
                  });
                } else {
                  console.log('❌ Step 6: FAIL - Menu does not open without refresh');
                  testResult.steps.push({ step: 'Menu opens without refresh', status: 'FAIL' });
                  testResult.status = 'FAIL';
                  
                  // Take failure screenshot
                  const failScreenshot = `screenshots/bug-not-fixed-menu-${Date.now()}.png`;
                  await page.screenshot({ path: failScreenshot, fullPage: true });
                  testResult.screenshots.push(failScreenshot);
                  
                  this.results.issues.push({
                    text: 'Menu not opening after navigation',
                    error: 'Menu requires page refresh to open',
                    severity: 'CRITICAL',
                    depth: 0,
                    screenshot: failScreenshot
                  });
                }
              } else {
                console.log('❌ Step 5: FAIL - Burger menu button not visible after navigation');
                testResult.steps.push({ step: 'Burger button visible after navigation', status: 'FAIL' });
                testResult.status = 'FAIL';
                
                // Take failure screenshot
                const failScreenshot = `screenshots/bug-not-fixed-button-${Date.now()}.png`;
                await page.screenshot({ path: failScreenshot, fullPage: true });
                testResult.screenshots.push(failScreenshot);
                
                this.results.issues.push({
                  text: 'Burger button missing after navigation',
                  error: 'Burger button disappears after logo navigation from service pages',
                  severity: 'CRITICAL',
                  depth: 0,
                  screenshot: failScreenshot
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('❌ Error testing navigation bug:', error.message);
      testResult.status = 'ERROR';
      testResult.error = error.message;
      this.results.issues.push({
        text: 'Navigation Bug Test Error',
        error: error.message,
        severity: 'HIGH',
        depth: 0
      });
    }
    
    this.results.navigationBugTest = testResult;
    
    console.log('\n' + '='.repeat(60));
    console.log(`Navigation Bug Test Result: ${testResult.status}`);
    console.log('='.repeat(60) + '\n');
    
    return testResult;
  }

  // Compare with Confluence documentation
  async compareWithConfluence() {
    console.log('\n📋 COMPARING WITH CONFLUENCE DOCUMENTATION...');
    console.log('Reference: https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/48332829/2\n');
    
    // Expected menu structure from Confluence
    const expectedMenuStructure = {
      'Company': [
        'Our Services',
        'About',
        'Temporary Franchise for Brokers',
        'Vacancies',
        'Contacts'
      ],
      'Business': [
        'Partner Financial Institutions',
        'Partnership Program',
        'Franchise for Brokers',
        'Real Estate Franchise',
        'Partnership Program for Lawyers'
      ],
      'Services': [
        'Mortgage Calculator',
        'Credit Calculator',
        'Refinance Calculator'
      ]
    };
    
    // Hebrew translations
    const hebrewExpected = {
      'חברה': [
        'השירותים שלנו',
        'אודות',
        'זכיון זמני למתווכים',
        'משרות',
        'צור קשר'
      ],
      'עסקים': [
        'מוסדות פיננסיים שותפים',
        'תכנית שותפים',
        'זיכיון למתווכים',
        'זיכיון למתווכי נדל"ן',
        'תכנית שותפים לעורכי דין'
      ],
      'שירותים': [
        'חישוב משכנתא',
        'חישוב אשראי',
        'מחזור משכנתא'
      ]
    };
    
    this.results.confluenceComparison = {
      expected: expectedMenuStructure,
      expectedHebrew: hebrewExpected,
      matches: [],
      mismatches: [],
      missing: []
    };
    
    return this.results.confluenceComparison;
  }

  // Test all menu items recursively
  async exploreAllMenusRecursively(page, depth = 0, parentMenu = 'root') {
    console.log(`\n${'  '.repeat(depth)}📁 Exploring level ${depth}: ${parentMenu}`);
    
    if (depth > 10) {
      console.log(`Max depth reached at level ${depth}`);
      return;
    }
    
    this.results.deepestLevel = Math.max(this.results.deepestLevel, depth);
    
    // Find ALL clickable menu elements
    const menuSelectors = [
      'nav a', 'nav button',
      '[role="navigation"] a', '[role="navigation"] button',
      '[class*="menu-item"]', '[class*="nav-item"]',
      '.sidebar a', '.sidebar button',
      'footer a', 'footer button',
      // Hebrew specific
      'a:has-text("שירותים")', 'a:has-text("אודות")',
      'a:has-text("צור קשר")', 'a:has-text("משרות")',
      'a[href]', 'button:not([type="submit"])'
    ];
    
    const foundElements = [];
    
    for (const selector of menuSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible()) {
            const text = await element.textContent();
            const href = await element.getAttribute('href');
            
            if (text && text.trim()) {
              foundElements.push({
                element,
                text: text.trim(),
                href,
                selector,
                depth
              });
            }
          }
        }
      } catch (e) {
        // Continue with next selector
      }
    }
    
    console.log(`${'  '.repeat(depth)}Found ${foundElements.length} menu items at level ${depth}`);
    this.results.totalLinksFound += foundElements.length;
    
    // Test each found element
    for (const item of foundElements) {
      await this.testMenuItem(page, item, depth);
    }
  }

  // Test individual menu item
  async testMenuItem(page, item, depth) {
    const indent = '  '.repeat(depth);
    console.log(`\n${indent}🔍 Testing: ${item.text}`);
    
    try {
      const currentUrl = page.url();
      
      // Skip if already tested
      if (this.visitedUrls.has(item.href || item.text)) {
        console.log(`${indent}⏭️  Already tested, skipping`);
        return;
      }
      
      this.visitedUrls.add(item.href || item.text);
      this.results.totalLinksTested++;
      
      if (item.href && item.href !== '#' && item.href !== 'javascript:void(0)') {
        // Navigate to the link
        console.log(`${indent}🔗 Navigating to: ${item.href}`);
        
        try {
          await item.element.click();
          await page.waitForTimeout(2000);
          
          const newUrl = page.url();
          
          if (newUrl !== currentUrl) {
            console.log(`${indent}✅ Navigation successful to: ${newUrl}`);
            
            // Check page content
            const pageStatus = await this.checkPageContent(page, item.text, newUrl);
            
            if (pageStatus.isEmpty) {
              console.log(`${indent}⚠️ EMPTY PAGE DETECTED!`);
              
              // Take screenshot
              const screenshot = `screenshots/empty-page-${item.text.replace(/\s+/g, '-')}-${Date.now()}.png`;
              await page.screenshot({ path: screenshot, fullPage: true });
              
              this.results.emptyPages.push({
                text: item.text,
                url: newUrl,
                depth: depth,
                reason: pageStatus.reason,
                screenshot: screenshot
              });
            } else {
              console.log(`${indent}✅ Page has content`);
              this.results.workingPages.push({
                text: item.text,
                url: newUrl,
                depth: depth,
                contentLength: pageStatus.contentLength
              });
            }
            
            // Navigate back
            await page.goBack();
            await page.waitForTimeout(1000);
          }
        } catch (navError) {
          console.log(`${indent}❌ Navigation error: ${navError.message}`);
          
          // Take error screenshot
          const screenshot = `screenshots/error-${item.text.replace(/\s+/g, '-')}-${Date.now()}.png`;
          await page.screenshot({ path: screenshot, fullPage: true });
          
          this.results.brokenLinks.push({
            text: item.text,
            href: item.href,
            error: navError.message,
            depth: depth,
            screenshot: screenshot
          });
        }
      }
    } catch (error) {
      console.log(`${indent}❌ Error testing item: ${error.message}`);
      this.results.issues.push({
        text: item.text,
        error: error.message,
        depth: depth
      });
    }
  }

  // Check page content
  async checkPageContent(page, menuText, url) {
    const content = await page.locator('body').textContent();
    const contentLength = content ? content.trim().length : 0;
    
    // Empty page indicators
    const emptyIndicators = [
      contentLength < 100,
      await page.locator('text="404"').count() > 0,
      await page.locator('text="Page not found"').count() > 0,
      await page.locator('text="דף לא נמצא"').count() > 0,
      await page.locator('text="Coming soon"').count() > 0,
      await page.locator('text="בקרוב"').count() > 0,
      await page.locator('text="Under construction"').count() > 0
    ];
    
    const isEmpty = emptyIndicators.some(indicator => indicator === true);
    
    let reason = '';
    if (contentLength < 100) reason = 'Too little content';
    if (await page.locator('text="404"').count() > 0) reason = '404 error';
    if (await page.locator('text="Coming soon"').count() > 0) reason = 'Coming soon page';
    
    const hasContent = 
      await page.locator('h1, h2, h3').count() > 0 ||
      await page.locator('p').count() > 3 ||
      await page.locator('form').count() > 0;
    
    return {
      isEmpty: isEmpty && !hasContent,
      contentLength,
      reason,
      hasContent
    };
  }

  // Generate comprehensive HTML report with Jira integration
  generateHTMLReport(data) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Comprehensive Menu Test Report - ${new Date().toISOString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1600px; margin: 0 auto; }
        .header { 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }
        .header h1 { 
            font-size: 2.5em; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .critical-test {
            background: white;
            margin: 20px 0;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-left: 5px solid ${data.navigationBugTest?.status === 'PASS' ? '#10b981' : '#ef4444'};
        }
        .test-steps {
            margin: 20px 0;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
        }
        .step {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .step:last-child { border-bottom: none; }
        .step-pass { color: #10b981; font-weight: bold; }
        .step-fail { color: #ef4444; font-weight: bold; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label { color: #666; font-size: 0.9em; }
        .success { color: #10b981; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        .info { color: #3b82f6; }
        .section {
            background: white;
            margin: 20px 0;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .section h2 {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .issue-card {
            background: #fef2f2;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
            position: relative;
        }
        .empty-page {
            background: #fef2f2;
            border-left-color: #f59e0b;
        }
        .working-page {
            background: #f0fdf4;
            border-left-color: #10b981;
        }
        .screenshot-preview {
            max-width: 200px;
            max-height: 150px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        tr:hover { background: #f9fafb; }
        .btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: opacity 0.3s;
            margin: 5px;
        }
        .btn:hover { opacity: 0.9; }
        .btn-danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
        .btn-warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .bug-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .confluence-link {
            display: inline-block;
            padding: 8px 15px;
            background: #0052CC;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .confluence-link:hover { background: #0747A6; }
        #jiraModal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        #jiraModal.show { display: flex; }
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-header { 
            font-size: 1.5em; 
            margin-bottom: 15px;
            color: #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-body { 
            margin: 20px 0;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #374151;
        }
        .form-group input, .form-group textarea, .form-group select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 5px;
            font-size: 14px;
        }
        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }
        .modal-footer {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        .close-btn:hover { color: #333; }
        .severity-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
            margin-left: 10px;
        }
        .severity-critical { background: #ef4444; }
        .severity-high { background: #f59e0b; }
        .severity-medium { background: #eab308; }
        .severity-low { background: #3b82f6; }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e5e7eb;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Comprehensive Menu Navigation Test Report</h1>
            <p style="color: #666;">Generated: ${new Date().toISOString()}</p>
            <p style="color: #666;">Banking Application QA - Complete Menu & Navigation Testing</p>
            <a href="https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/48332829/2" target="_blank" class="confluence-link">
                📋 View Confluence Documentation
            </a>
        </div>
        
        ${data.navigationBugTest ? `
        <div class="critical-test">
            <h2>🐛 Critical Navigation Bug Test</h2>
            <p style="color: #666; margin: 10px 0;">
                <strong>Issue:</strong> Menu button disappears after navigating from service pages back to home via logo<br>
                <strong>Status:</strong> <span class="${data.navigationBugTest.status === 'PASS' ? 'success' : 'error'}" style="font-size: 1.2em; font-weight: bold;">
                    ${data.navigationBugTest.status === 'PASS' ? '✅ FIXED' : '❌ NOT FIXED'}
                </span>
            </p>
            
            <div class="test-steps">
                <h3>Test Steps:</h3>
                ${data.navigationBugTest.steps ? data.navigationBugTest.steps.map(step => `
                    <div class="step">
                        <span>${step.step}</span>
                        <span class="${step.status === 'PASS' ? 'step-pass' : 'step-fail'}">${step.status}</span>
                    </div>
                `).join('') : ''}
            </div>
            
            ${data.navigationBugTest.screenshots && data.navigationBugTest.screenshots.length > 0 ? `
                <div style="margin-top: 15px;">
                    <strong>Screenshots:</strong>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                        ${data.navigationBugTest.screenshots.map(screenshot => `
                            <img src="${screenshot}" alt="Test screenshot" class="screenshot-preview" onclick="window.open('${screenshot}', '_blank')">
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${data.navigationBugTest.status !== 'PASS' ? `
                <div class="bug-actions">
                    <button class="btn btn-danger" onclick="openJiraModal('navigation-bug', 'critical')">
                        🐛 Create Critical Bug in Jira
                    </button>
                </div>
            ` : ''}
        </div>
        ` : ''}
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number info">${data.totalLinksFound}</div>
                <div class="stat-label">Total Links Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-number info">${data.totalLinksTested}</div>
                <div class="stat-label">Links Tested</div>
            </div>
            <div class="stat-card">
                <div class="stat-number success">${data.workingPages.length}</div>
                <div class="stat-label">Working Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number warning">${data.emptyPages.length}</div>
                <div class="stat-label">Empty Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${data.brokenLinks.length}</div>
                <div class="stat-label">Broken Links</div>
            </div>
            <div class="stat-card">
                <div class="stat-number info">${data.deepestLevel}</div>
                <div class="stat-label">Max Menu Depth</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Overall Success Rate</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${data.successRate || 0}%">
                    ${data.successRate || 0}%
                </div>
            </div>
        </div>

        ${data.emptyPages.length > 0 ? `
        <div class="section">
            <h2>⚠️ Empty Pages Detected (${data.emptyPages.length})</h2>
            <p style="color: #666; margin-bottom: 20px;">These pages have no content or are under construction</p>
            ${data.emptyPages.map((page, index) => `
                <div class="issue-card empty-page">
                    <strong>${page.text}</strong>
                    <span class="severity-badge severity-high">HIGH</span><br>
                    <span style="color: #666;">URL:</span> ${page.url}<br>
                    <span style="color: #666;">Reason:</span> ${page.reason}<br>
                    <span style="color: #666;">Menu Level:</span> ${page.depth}
                    ${page.screenshot ? `
                        <div style="margin-top: 10px;">
                            <img src="${page.screenshot}" alt="Empty page screenshot" class="screenshot-preview" onclick="window.open('${page.screenshot}', '_blank')">
                        </div>
                    ` : ''}
                    <div class="bug-actions">
                        <button class="btn btn-warning" onclick="openJiraModal('empty-page-${index}', 'high')">
                            🐛 Create Bug
                        </button>
                        <button class="btn" onclick="investigateFurther('empty-page', ${index})">
                            🔍 Investigate
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${data.brokenLinks.length > 0 ? `
        <div class="section">
            <h2>💔 Broken Links (${data.brokenLinks.length})</h2>
            <p style="color: #666; margin-bottom: 20px;">These links failed to navigate properly</p>
            ${data.brokenLinks.map((link, index) => `
                <div class="issue-card">
                    <strong>${link.text}</strong>
                    <span class="severity-badge severity-critical">CRITICAL</span><br>
                    <span style="color: #666;">HREF:</span> ${link.href}<br>
                    <span style="color: #666;">Error:</span> ${link.error}
                    ${link.screenshot ? `
                        <div style="margin-top: 10px;">
                            <img src="${link.screenshot}" alt="Error screenshot" class="screenshot-preview" onclick="window.open('${link.screenshot}', '_blank')">
                        </div>
                    ` : ''}
                    <div class="bug-actions">
                        <button class="btn btn-danger" onclick="openJiraModal('broken-link-${index}', 'critical')">
                            🐛 Create Critical Bug
                        </button>
                        <button class="btn" onclick="investigateFurther('broken-link', ${index})">
                            🔍 Investigate
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h2>✅ Working Pages (Top 20)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Menu Item</th>
                        <th>URL</th>
                        <th>Content Size</th>
                        <th>Menu Level</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.workingPages.slice(0, 20).map(page => `
                        <tr>
                            <td>${page.text}</td>
                            <td>${page.url}</td>
                            <td>${page.contentLength} chars</td>
                            <td>Level ${page.depth}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>📋 Test Summary</h2>
            <table>
                <tr>
                    <td><strong>Test Date:</strong></td>
                    <td>${new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td><strong>Test Duration:</strong></td>
                    <td>~${Math.ceil(data.totalLinksTested * 3 / 60)} minutes</td>
                </tr>
                <tr>
                    <td><strong>Unique URLs Tested:</strong></td>
                    <td>${data.visitedUrls ? data.visitedUrls.length : 0}</td>
                </tr>
                <tr>
                    <td><strong>Navigation Bug Status:</strong></td>
                    <td>${data.navigationBugTest?.status === 'PASS' ? '<span class="success">✅ FIXED</span>' : '<span class="error">❌ NOT FIXED</span>'}</td>
                </tr>
                <tr>
                    <td><strong>Overall Test Status:</strong></td>
                    <td>${(data.successRate || 0) >= 80 && data.navigationBugTest?.status === 'PASS' ? '<span class="success">✅ PASSED</span>' : '<span class="error">❌ FAILED</span>'}</td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Jira Bug Creation Modal -->
    <div id="jiraModal">
        <div class="modal-content">
            <div class="modal-header">
                <span>🐛 Create Jira Bug</span>
                <button class="close-btn" onclick="closeJiraModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="jiraForm">
                    <div class="form-group">
                        <label>Summary*</label>
                        <input type="text" id="jiraSummary" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Priority*</label>
                        <select id="jiraPriority" required>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Issue Type*</label>
                        <select id="jiraIssueType" required>
                            <option value="Bug">Bug</option>
                            <option value="Task">Task</option>
                            <option value="Story">Story</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Description*</label>
                        <textarea id="jiraDescription" required rows="8"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Steps to Reproduce</label>
                        <textarea id="jiraSteps" rows="5"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Expected Result</label>
                        <textarea id="jiraExpected" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Actual Result</label>
                        <textarea id="jiraActual" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Screenshots</label>
                        <input type="text" id="jiraScreenshots" placeholder="Screenshot paths (comma separated)">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="closeJiraModal()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmCreateJiraBug()">Create Bug</button>
            </div>
        </div>
    </div>

    <script>
        const testData = ${JSON.stringify(data)};
        let currentIssue = null;

        function openJiraModal(issueType, severity) {
            currentIssue = { type: issueType, severity: severity };
            
            // Pre-fill the form based on issue type
            if (issueType === 'navigation-bug') {
                document.getElementById('jiraSummary').value = 'Menu button disappears after navigating from service pages';
                document.getElementById('jiraPriority').value = 'Critical';
                document.getElementById('jiraDescription').value = \`
Critical UI/UX Bug: Menu Navigation Issue

When navigating from service pages (e.g., Mortgage Calculator) back to the homepage using the logo, the hamburger menu button disappears or becomes non-functional, requiring a page refresh to restore functionality.

Test Result: \${testData.navigationBugTest?.status || 'UNKNOWN'}

Environment:
- URL: http://localhost:5173
- Browser: Chrome (Playwright)
- Test Date: \${new Date().toISOString()}
                \`.trim();
                
                document.getElementById('jiraSteps').value = \`
1. Navigate to homepage
2. Open menu (click hamburger button)
3. Navigate to "השירותים שלנו" (Our Services)
4. Click on "חישוב משכנתא" (Mortgage Calculator)
5. Click the logo to navigate back to homepage
6. Try to open the menu again
                \`.trim();
                
                document.getElementById('jiraExpected').value = 'Menu button should be visible and functional after navigation';
                document.getElementById('jiraActual').value = 'Menu button is either not visible or does not open the menu without page refresh';
                
            } else if (issueType.startsWith('empty-page-')) {
                const index = parseInt(issueType.split('-')[2]);
                const page = testData.emptyPages[index];
                
                document.getElementById('jiraSummary').value = \`Empty page: \${page.text}\`;
                document.getElementById('jiraPriority').value = 'High';
                document.getElementById('jiraDescription').value = \`
Empty/Incomplete Page Detected

Menu Item: \${page.text}
URL: \${page.url}
Reason: \${page.reason}
Menu Level: \${page.depth}

This page appears to be empty or under construction.
                \`.trim();
                
                if (page.screenshot) {
                    document.getElementById('jiraScreenshots').value = page.screenshot;
                }
                
            } else if (issueType.startsWith('broken-link-')) {
                const index = parseInt(issueType.split('-')[2]);
                const link = testData.brokenLinks[index];
                
                document.getElementById('jiraSummary').value = \`Broken link: \${link.text}\`;
                document.getElementById('jiraPriority').value = 'Critical';
                document.getElementById('jiraDescription').value = \`
Broken Navigation Link

Menu Item: \${link.text}
HREF: \${link.href}
Error: \${link.error}
Menu Level: \${link.depth}

This link fails to navigate properly.
                \`.trim();
                
                if (link.screenshot) {
                    document.getElementById('jiraScreenshots').value = link.screenshot;
                }
            }
            
            document.getElementById('jiraModal').classList.add('show');
        }

        function closeJiraModal() {
            document.getElementById('jiraModal').classList.remove('show');
            currentIssue = null;
        }

        function confirmCreateJiraBug() {
            const formData = {
                summary: document.getElementById('jiraSummary').value,
                priority: document.getElementById('jiraPriority').value,
                issueType: document.getElementById('jiraIssueType').value,
                description: document.getElementById('jiraDescription').value,
                steps: document.getElementById('jiraSteps').value,
                expected: document.getElementById('jiraExpected').value,
                actual: document.getElementById('jiraActual').value,
                screenshots: document.getElementById('jiraScreenshots').value
            };
            
            console.log('Creating Jira bug with data:', formData);
            
            // Show confirmation
            alert(\`Jira bug would be created:\\n\\nSummary: \${formData.summary}\\nPriority: \${formData.priority}\\n\\nNote: Actual Jira integration requires API credentials.\`);
            
            closeJiraModal();
        }

        function investigateFurther(type, index) {
            let issue;
            if (type === 'empty-page') {
                issue = testData.emptyPages[index];
            } else if (type === 'broken-link') {
                issue = testData.brokenLinks[index];
            }
            
            console.log('Investigating:', issue);
            alert(\`Investigating \${type}:\\n\\n\${issue.text}\\nURL: \${issue.url || issue.href}\\n\\nCheck console for full details.\`);
        }

        // Animate progress bar on load
        window.addEventListener('load', () => {
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                const width = progressFill.style.width;
                progressFill.style.width = '0%';
                setTimeout(() => {
                    progressFill.style.width = width;
                }, 100);
            }
        });
    </script>
</body>
</html>`;
    
    fs.writeFileSync('comprehensive-menu-test-report.html', html);
  }

  // Generate comprehensive report
  async generateComprehensiveReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE MENU NAVIGATION TEST REPORT');
    console.log('='.repeat(80));
    
    console.log('\n📈 STATISTICS:');
    console.log(`  Total Links Found: ${this.results.totalLinksFound}`);
    console.log(`  Total Links Tested: ${this.results.totalLinksTested}`);
    console.log(`  Unique URLs Tested: ${this.visitedUrls.size}`);
    console.log(`  Deepest Menu Level: ${this.results.deepestLevel}`);
    
    console.log('\n✅ WORKING PAGES: ' + this.results.workingPages.length);
    console.log('\n⚠️ EMPTY PAGES: ' + this.results.emptyPages.length);
    console.log('\n💔 BROKEN LINKS: ' + this.results.brokenLinks.length);
    
    // Calculate success rate
    const totalTested = this.results.workingPages.length + this.results.emptyPages.length + this.results.brokenLinks.length;
    const successRate = totalTested > 0 ? (this.results.workingPages.length / totalTested * 100).toFixed(2) : 0;
    this.results.successRate = successRate;
    
    console.log('\n📊 OVERALL RESULTS:');
    console.log(`  Success Rate: ${successRate}%`);
    console.log(`  Navigation Bug Status: ${this.results.navigationBugTest?.status || 'NOT TESTED'}`);
    
    // Save reports
    const reportData = {
      ...this.results,
      visitedUrls: Array.from(this.visitedUrls),
      successRate: successRate
    };
    
    fs.writeFileSync(
      'comprehensive-menu-test-report.json',
      JSON.stringify(reportData, null, 2)
    );
    
    // Generate HTML report
    this.generateHTMLReport(reportData);
    
    console.log('\n📊 Reports saved:');
    console.log('  - comprehensive-menu-test-report.json');
    console.log('  - comprehensive-menu-test-report.html');
    
    console.log('\n' + '='.repeat(80));
  }

  // Main test runner
  async runComprehensiveTest() {
    const browser = await chromium.launch({ 
      headless: false,
      timeout: 120000
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });
    
    const page = await context.newPage();
    
    console.log('🚀 STARTING COMPREHENSIVE MENU NAVIGATION TESTING');
    console.log('=' .repeat(80));
    
    try {
      // Navigate to homepage
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
      
      // 1. Test the critical navigation bug fix
      await this.testNavigationBugFix(page);
      
      // 2. Compare with Confluence documentation
      await this.compareWithConfluence();
      
      // 3. Run comprehensive menu exploration
      console.log('\n🎯 STARTING DEEP MENU EXPLORATION...\n');
      await this.exploreAllMenusRecursively(page, 0, 'Homepage');
      
    } catch (error) {
      console.error('\n❌ Fatal error during testing:', error);
      this.results.issues.push({
        type: 'FATAL',
        error: error.message
      });
    } finally {
      await browser.close();
      
      // Generate comprehensive report
      await this.generateComprehensiveReport();
      
      console.log('\n✅ COMPREHENSIVE MENU NAVIGATION TESTING COMPLETE!');
      console.log('📊 Open comprehensive-menu-test-report.html to view the detailed report');
    }
  }
}

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the comprehensive test
const tester = new ComprehensiveMenuTester();
tester.runComprehensiveTest().catch(console.error);