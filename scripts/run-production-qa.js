#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * PRODUCTION QA TEST RUNNER FOR dev2.bankimonline.com
 * 
 * This script runs comprehensive QA tests on the production environment
 * Based on the test instructions in server/docs/QA/
 * 
 * Usage: node scripts/run-production-qa.js
 */

class ProductionQATester {
  constructor() {
    this.baseUrl = 'https://dev2.bankimonline.com';
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.reportDir = path.join(__dirname, '..', 'qa-reports', this.timestamp);
    this.results = {
      timestamp: new Date().toISOString(),
      environment: this.baseUrl,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
    
    // Create report directory
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * Take screenshot with consistent naming
   */
  async takeScreenshot(page, name) {
    const screenshotPath = path.join(this.reportDir, `${name}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  /**
   * Log test result with color coding
   */
  logResult(status, message) {
    const colors = {
      pass: '\x1b[32m✅',
      fail: '\x1b[31m❌',
      warn: '\x1b[33m⚠️',
      info: '\x1b[36mℹ️',
      reset: '\x1b[0m'
    };
    
    const prefix = colors[status] || colors.info;
    console.log(`${prefix} ${message}${colors.reset}`);
  }

  /**
   * Test 1: MORTGAGE CALCULATOR - STEP 1
   * Tests property ownership dropdown and other critical fields
   */
  async testMortgageStep1(page) {
    console.log('\n🏠 TESTING MORTGAGE CALCULATOR - STEP 1\n');
    
    const test = {
      name: 'Mortgage Calculator Step 1',
      url: `${this.baseUrl}/services/calculate-mortgage/1`,
      results: []
    };
    
    try {
      // Navigate to Step 1
      await page.goto(test.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Test 1.1: Property Ownership Dropdown
      this.logResult('info', 'Testing property ownership dropdown...');
      try {
        const propertyDropdown = await page.locator('select[name="propertyOwnership"], [data-testid*="property"]').first();
        if (await propertyDropdown.count() > 0) {
          const options = await propertyDropdown.locator('option').all();
          if (options.length > 1) {
            this.logResult('pass', `Property ownership dropdown has ${options.length} options`);
            test.results.push({ test: 'Property ownership dropdown', status: 'pass', details: `${options.length} options available` });
            this.results.summary.passed++;
          } else {
            this.logResult('fail', 'Property ownership dropdown has no options!');
            await this.takeScreenshot(page, 'mortgage-step1-property-dropdown-empty');
            test.results.push({ test: 'Property ownership dropdown', status: 'fail', details: 'No options available' });
            this.results.summary.failed++;
          }
        } else {
          // Try React component pattern
          const reactDropdown = await page.locator('[class*="dropdown"]:has-text("property"), [class*="select"]:has-text("property")').first();
          if (await reactDropdown.count() > 0) {
            await reactDropdown.click();
            await page.waitForTimeout(500);
            const menuItems = await page.locator('[role="option"], .dropdown-item, .menu-item').all();
            if (menuItems.length > 0) {
              this.logResult('pass', `Property ownership dropdown (React) has ${menuItems.length} options`);
              test.results.push({ test: 'Property ownership dropdown', status: 'pass', details: `${menuItems.length} React options` });
              this.results.summary.passed++;
            }
          } else {
            this.logResult('fail', 'Property ownership dropdown not found!');
            await this.takeScreenshot(page, 'mortgage-step1-property-dropdown-missing');
            test.results.push({ test: 'Property ownership dropdown', status: 'fail', details: 'Dropdown element not found' });
            this.results.summary.failed++;
          }
        }
      } catch (error) {
        this.logResult('fail', `Property dropdown error: ${error.message}`);
        test.results.push({ test: 'Property ownership dropdown', status: 'fail', details: error.message });
        this.results.summary.failed++;
      }
      
      // Test 1.2: When Needed Dropdown
      this.logResult('info', 'Testing "when needed" dropdown...');
      try {
        const whenDropdown = await page.locator('select:has(option:text-matches("month")), [class*="dropdown"]:has-text("month")').first();
        if (await whenDropdown.count() > 0) {
          this.logResult('pass', 'When needed dropdown found');
          test.results.push({ test: 'When needed dropdown', status: 'pass' });
          this.results.summary.passed++;
        } else {
          this.logResult('warn', 'When needed dropdown not found');
          test.results.push({ test: 'When needed dropdown', status: 'warn', details: 'Element not found' });
          this.results.summary.warnings++;
        }
      } catch (error) {
        this.logResult('warn', `When needed dropdown warning: ${error.message}`);
        test.results.push({ test: 'When needed dropdown', status: 'warn', details: error.message });
        this.results.summary.warnings++;
      }
      
      // Test 1.3: First Home Dropdown
      this.logResult('info', 'Testing "first home" dropdown...');
      try {
        const firstHomeDropdown = await page.locator('select[name*="first"], [class*="dropdown"]:has-text("first")').first();
        if (await firstHomeDropdown.count() > 0) {
          this.logResult('pass', 'First home dropdown found');
          test.results.push({ test: 'First home dropdown', status: 'pass' });
          this.results.summary.passed++;
        } else {
          this.logResult('warn', 'First home dropdown not found');
          test.results.push({ test: 'First home dropdown', status: 'warn', details: 'Element not found' });
          this.results.summary.warnings++;
        }
      } catch (error) {
        this.logResult('warn', `First home dropdown warning: ${error.message}`);
        test.results.push({ test: 'First home dropdown', status: 'warn', details: error.message });
        this.results.summary.warnings++;
      }
      
      // Take screenshot of final state
      await this.takeScreenshot(page, 'mortgage-step1-final');
      
    } catch (error) {
      this.logResult('fail', `Step 1 critical error: ${error.message}`);
      test.results.push({ test: 'Navigation', status: 'fail', details: error.message });
      this.results.summary.failed++;
    }
    
    this.results.tests.push(test);
    this.results.summary.total += test.results.length;
  }

  /**
   * Test 2: MORTGAGE CALCULATOR - STEP 2
   * Tests family status dropdown and personal information fields
   */
  async testMortgageStep2(page) {
    console.log('\n👨‍👩‍👧‍👦 TESTING MORTGAGE CALCULATOR - STEP 2\n');
    
    const test = {
      name: 'Mortgage Calculator Step 2',
      url: `${this.baseUrl}/services/calculate-mortgage/2`,
      results: []
    };
    
    try {
      // Navigate to Step 2
      await page.goto(test.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Test 2.1: Family Status Dropdown (CRITICAL)
      this.logResult('info', 'Testing family status dropdown...');
      try {
        // Try standard select
        let familyDropdown = await page.locator('select[name*="family"], select[name*="marital"]').first();
        
        if (await familyDropdown.count() === 0) {
          // Try React patterns
          familyDropdown = await page.locator('[class*="dropdown"]:has-text("family"), [class*="dropdown"]:has-text("מצב משפחתי")').first();
        }
        
        if (await familyDropdown.count() > 0) {
          // Check if it's a select element
          if (await familyDropdown.evaluate(el => el.tagName === 'SELECT')) {
            const options = await familyDropdown.locator('option').all();
            if (options.length > 1) {
              this.logResult('pass', `Family status dropdown has ${options.length} options`);
              test.results.push({ test: 'Family status dropdown', status: 'pass', details: `${options.length} options` });
              this.results.summary.passed++;
            } else {
              this.logResult('fail', 'Family status dropdown is empty!');
              await this.takeScreenshot(page, 'mortgage-step2-family-dropdown-empty');
              test.results.push({ test: 'Family status dropdown', status: 'fail', details: 'No options' });
              this.results.summary.failed++;
            }
          } else {
            // React component - try clicking
            await familyDropdown.click();
            await page.waitForTimeout(500);
            const menuItems = await page.locator('[role="option"], .dropdown-item').all();
            if (menuItems.length > 0) {
              this.logResult('pass', `Family status dropdown (React) has ${menuItems.length} options`);
              test.results.push({ test: 'Family status dropdown', status: 'pass', details: `${menuItems.length} React options` });
              this.results.summary.passed++;
            } else {
              this.logResult('fail', 'Family status dropdown has no menu items!');
              await this.takeScreenshot(page, 'mortgage-step2-family-dropdown-no-items');
              test.results.push({ test: 'Family status dropdown', status: 'fail', details: 'No menu items' });
              this.results.summary.failed++;
            }
          }
        } else {
          this.logResult('fail', 'Family status dropdown not found!');
          await this.takeScreenshot(page, 'mortgage-step2-family-dropdown-missing');
          test.results.push({ test: 'Family status dropdown', status: 'fail', details: 'Element not found' });
          this.results.summary.failed++;
        }
      } catch (error) {
        this.logResult('fail', `Family status dropdown error: ${error.message}`);
        test.results.push({ test: 'Family status dropdown', status: 'fail', details: error.message });
        this.results.summary.failed++;
      }
      
      // Test 2.2: Personal Information Fields
      this.logResult('info', 'Testing personal information fields...');
      try {
        const nameField = await page.locator('input[type="text"]').first();
        const phoneField = await page.locator('input[type="tel"], input[placeholder*="phone"]').first();
        
        if (await nameField.count() > 0 && await phoneField.count() > 0) {
          this.logResult('pass', 'Personal information fields found');
          test.results.push({ test: 'Personal info fields', status: 'pass' });
          this.results.summary.passed++;
        } else {
          this.logResult('warn', 'Some personal information fields missing');
          test.results.push({ test: 'Personal info fields', status: 'warn', details: 'Some fields missing' });
          this.results.summary.warnings++;
        }
      } catch (error) {
        this.logResult('warn', `Personal fields warning: ${error.message}`);
        test.results.push({ test: 'Personal info fields', status: 'warn', details: error.message });
        this.results.summary.warnings++;
      }
      
      // Take screenshot of final state
      await this.takeScreenshot(page, 'mortgage-step2-final');
      
    } catch (error) {
      this.logResult('fail', `Step 2 critical error: ${error.message}`);
      test.results.push({ test: 'Navigation', status: 'fail', details: error.message });
      this.results.summary.failed++;
    }
    
    this.results.tests.push(test);
    this.results.summary.total += test.results.length;
  }

  /**
   * Test 3: MENU NAVIGATION
   * Tests hamburger menu functionality and navigation
   */
  async testMenuNavigation(page) {
    console.log('\n📱 TESTING MENU NAVIGATION\n');
    
    const test = {
      name: 'Menu Navigation',
      url: this.baseUrl,
      results: []
    };
    
    try {
      // Navigate to homepage
      await page.goto(test.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Test 3.1: Hamburger Menu Button
      this.logResult('info', 'Testing hamburger menu...');
      try {
        const menuButton = await page.locator('.burger, [class*="burger"], [class*="menu-button"], button[aria-label*="menu"]').first();
        
        if (await menuButton.count() > 0 && await menuButton.isVisible()) {
          this.logResult('pass', 'Menu button found and visible');
          test.results.push({ test: 'Menu button visibility', status: 'pass' });
          this.results.summary.passed++;
          
          // Try to open menu
          await menuButton.click();
          await page.waitForTimeout(1000);
          
          const menuPanel = await page.locator('.mobile-menu, [class*="sidebar"], [class*="navigation"], nav').first();
          if (await menuPanel.isVisible()) {
            this.logResult('pass', 'Menu opens correctly');
            test.results.push({ test: 'Menu opening', status: 'pass' });
            this.results.summary.passed++;
            
            // Check menu items
            const menuItems = await page.locator('nav a, .menu-item, [class*="nav-link"]').all();
            if (menuItems.length > 0) {
              this.logResult('pass', `Menu has ${menuItems.length} navigation items`);
              test.results.push({ test: 'Menu items', status: 'pass', details: `${menuItems.length} items` });
              this.results.summary.passed++;
            }
          } else {
            this.logResult('fail', 'Menu does not open');
            await this.takeScreenshot(page, 'menu-not-opening');
            test.results.push({ test: 'Menu opening', status: 'fail', details: 'Menu panel not visible' });
            this.results.summary.failed++;
          }
        } else {
          this.logResult('fail', 'Menu button not found or not visible');
          await this.takeScreenshot(page, 'menu-button-missing');
          test.results.push({ test: 'Menu button visibility', status: 'fail', details: 'Button not found' });
          this.results.summary.failed++;
        }
      } catch (error) {
        this.logResult('fail', `Menu test error: ${error.message}`);
        test.results.push({ test: 'Menu navigation', status: 'fail', details: error.message });
        this.results.summary.failed++;
      }
      
    } catch (error) {
      this.logResult('fail', `Menu navigation critical error: ${error.message}`);
      test.results.push({ test: 'Navigation', status: 'fail', details: error.message });
      this.results.summary.failed++;
    }
    
    this.results.tests.push(test);
    this.results.summary.total += test.results.length;
  }

  /**
   * Test 4: LANGUAGE SWITCHING
   * Tests Hebrew, English, and Russian language support
   */
  async testLanguageSwitching(page) {
    console.log('\n🌍 TESTING LANGUAGE SWITCHING\n');
    
    const test = {
      name: 'Language Switching',
      url: this.baseUrl,
      results: []
    };
    
    try {
      // Navigate to homepage
      await page.goto(test.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      const languages = [
        { code: 'he', name: 'Hebrew', text: 'חשב משכנתא' },
        { code: 'en', name: 'English', text: 'Calculate Mortgage' },
        { code: 'ru', name: 'Russian', text: 'Рассчитать ипотеку' }
      ];
      
      for (const lang of languages) {
        this.logResult('info', `Testing ${lang.name} language...`);
        try {
          // Look for language switcher
          const langButton = await page.locator(`[data-lang="${lang.code}"], button:has-text("${lang.code.toUpperCase()}"), a[href*="${lang.code}"]`).first();
          
          if (await langButton.count() > 0) {
            await langButton.click();
            await page.waitForTimeout(1000);
            
            // Check if language changed
            const pageContent = await page.content();
            if (pageContent.includes(lang.text)) {
              this.logResult('pass', `${lang.name} language works`);
              test.results.push({ test: `${lang.name} language`, status: 'pass' });
              this.results.summary.passed++;
            } else {
              this.logResult('warn', `${lang.name} language content not verified`);
              test.results.push({ test: `${lang.name} language`, status: 'warn', details: 'Content not verified' });
              this.results.summary.warnings++;
            }
          } else {
            this.logResult('warn', `${lang.name} language button not found`);
            test.results.push({ test: `${lang.name} language`, status: 'warn', details: 'Button not found' });
            this.results.summary.warnings++;
          }
        } catch (error) {
          this.logResult('warn', `${lang.name} language test warning: ${error.message}`);
          test.results.push({ test: `${lang.name} language`, status: 'warn', details: error.message });
          this.results.summary.warnings++;
        }
      }
      
    } catch (error) {
      this.logResult('fail', `Language test critical error: ${error.message}`);
      test.results.push({ test: 'Language switching', status: 'fail', details: error.message });
      this.results.summary.failed++;
    }
    
    this.results.tests.push(test);
    this.results.summary.total += test.results.length;
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport() {
    const passRate = this.results.summary.total > 0 
      ? Math.round((this.results.summary.passed / this.results.summary.total) * 100) 
      : 0;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production QA Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1f2937;
            margin-bottom: 1rem;
            text-align: center;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .summary-card {
            background: #f3f4f6;
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
        }
        .summary-card h3 {
            color: #6b7280;
            font-size: 0.875rem;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
        }
        .summary-card .value {
            font-size: 2rem;
            font-weight: bold;
        }
        .passed { color: #10b981; }
        .failed { color: #dc2626; }
        .warning { color: #f59e0b; }
        .test-section {
            margin: 2rem 0;
            padding: 1.5rem;
            background: #f9fafb;
            border-radius: 10px;
        }
        .test-section h2 {
            color: #1f2937;
            margin-bottom: 1rem;
        }
        .test-result {
            display: flex;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .test-result:last-child {
            border-bottom: none;
        }
        .status-icon {
            margin-right: 1rem;
            font-size: 1.25rem;
        }
        .test-name {
            flex: 1;
            color: #374151;
        }
        .test-details {
            color: #6b7280;
            font-size: 0.875rem;
        }
        .environment {
            text-align: center;
            color: #6b7280;
            margin-bottom: 2rem;
        }
        .pass-rate {
            font-size: 3rem;
            font-weight: bold;
            color: ${passRate >= 80 ? '#10b981' : passRate >= 60 ? '#f59e0b' : '#dc2626'};
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Production QA Test Report</h1>
        <div class="environment">
            <p><strong>Environment:</strong> ${this.results.environment}</p>
            <p><strong>Timestamp:</strong> ${new Date(this.results.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Pass Rate</h3>
                <div class="pass-rate">${passRate}%</div>
            </div>
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${this.results.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value passed">${this.results.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value failed">${this.results.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Warnings</h3>
                <div class="value warning">${this.results.summary.warnings}</div>
            </div>
        </div>
        
        ${this.results.tests.map(test => `
            <div class="test-section">
                <h2>${test.name}</h2>
                <p style="color: #6b7280; margin-bottom: 1rem;">URL: ${test.url}</p>
                ${test.results.map(result => `
                    <div class="test-result">
                        <span class="status-icon">
                            ${result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'}
                        </span>
                        <span class="test-name">${result.test}</span>
                        ${result.details ? `<span class="test-details">${result.details}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('')}
        
        <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280;">Generated by Production QA Tester</p>
            <p style="color: #6b7280;">Screenshots saved to: ${this.reportDir}</p>
        </div>
    </div>
</body>
</html>`;
    
    const reportPath = path.join(this.reportDir, 'qa-report.html');
    fs.writeFileSync(reportPath, html);
    return reportPath;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 STARTING PRODUCTION QA TESTS');
    console.log('================================');
    console.log(`Environment: ${this.baseUrl}`);
    console.log(`Timestamp: ${new Date().toLocaleString()}`);
    console.log('================================\n');
    
    const browser = await chromium.launch({
      headless: true, // Run headless for production
      timeout: 60000
    });
    
    try {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        ignoreHTTPSErrors: true // For dev2 certificate
      });
      
      const page = await context.newPage();
      
      // Run test suites
      await this.testMortgageStep1(page);
      await this.testMortgageStep2(page);
      await this.testMenuNavigation(page);
      await this.testLanguageSwitching(page);
      
      // Generate report
      const reportPath = this.generateHTMLReport();
      
      // Print summary
      console.log('\n================================');
      console.log('📊 QA TEST SUMMARY');
      console.log('================================');
      console.log(`Total Tests: ${this.results.summary.total}`);
      console.log(`✅ Passed: ${this.results.summary.passed}`);
      console.log(`❌ Failed: ${this.results.summary.failed}`);
      console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
      
      const passRate = this.results.summary.total > 0 
        ? Math.round((this.results.summary.passed / this.results.summary.total) * 100) 
        : 0;
      console.log(`\n🎯 Pass Rate: ${passRate}%`);
      
      if (this.results.summary.failed > 0) {
        console.log('\n⚠️  CRITICAL ISSUES FOUND:');
        this.results.tests.forEach(test => {
          test.results.forEach(result => {
            if (result.status === 'fail') {
              console.log(`  - ${test.name}: ${result.test} - ${result.details || 'Failed'}`);
            }
          });
        });
      }
      
      console.log(`\n📄 Report saved to: ${reportPath}`);
      console.log(`📸 Screenshots saved to: ${this.reportDir}`);
      
      // Return exit code based on failures
      process.exit(this.results.summary.failed > 0 ? 1 : 0);
      
    } catch (error) {
      console.error('\n❌ FATAL ERROR:', error);
      process.exit(1);
    } finally {
      await browser.close();
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new ProductionQATester();
  tester.runAllTests().catch(console.error);
}

module.exports = ProductionQATester;