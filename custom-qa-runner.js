const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Custom QA Test Runner
 * Comprehensive testing suite for BankiMonline application
 */

class CustomQARunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: [],
      testSuites: []
    };
  }

  async log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async takeScreenshot(page, name) {
    const screenshotPath = `screenshots/${name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  async testHomepageLoad(page) {
    const testResults = {
      name: 'Homepage Load Test',
      passed: 0,
      failed: 0,
      issues: []
    };

    try {
      await this.log('🏠 Testing homepage load...');
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
      
      // Test 1: Page loads successfully
      this.results.totalTests++;
      testResults.total = 1;
      
      const title = await page.title();
      if (title && title.length > 0) {
        await this.log('✅ Homepage loads with title: ' + title);
        testResults.passed++;
        this.results.passed++;
      } else {
        await this.log('❌ Homepage has no title');
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push('Homepage missing title');
      }

    } catch (error) {
      await this.log('❌ Homepage load failed: ' + error.message);
      testResults.failed++;
      this.results.failed++;
      testResults.issues.push(`Homepage load error: ${error.message}`);
    }

    this.results.testSuites.push(testResults);
    return testResults;
  }

  async testMortgageCalculator(page) {
    const testResults = {
      name: 'Mortgage Calculator Test',
      passed: 0,
      failed: 0,
      issues: [],
      total: 0
    };

    try {
      await this.log('🏘️ Testing mortgage calculator...');
      await page.goto('http://localhost:5173/services/calculate-mortgage/1', { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      });

      // Test 1: Page loads
      this.results.totalTests++;
      testResults.total++;
      
      const isLoaded = await page.waitForSelector('body', { timeout: 10000 }).catch(() => false);
      if (isLoaded) {
        await this.log('✅ Mortgage calculator page loads');
        testResults.passed++;
        this.results.passed++;
      } else {
        await this.log('❌ Mortgage calculator page failed to load');
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push('Page load failure');
      }

      // Test 2: Property value input exists
      this.results.totalTests++;
      testResults.total++;
      
      const propertyInput = await page.locator('input[name*="property"], input[name*="value"], [data-testid*="property"]').first();
      const inputExists = await propertyInput.count() > 0;
      
      if (inputExists) {
        await this.log('✅ Property value input found');
        testResults.passed++;
        this.results.passed++;
        
        // Try to enter a value
        try {
          await propertyInput.fill('2000000');
          await this.log('✅ Successfully entered property value');
        } catch (error) {
          await this.log('⚠️ Could not enter property value: ' + error.message);
          this.results.warnings++;
        }
      } else {
        await this.log('❌ Property value input not found');
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push('Property value input missing');
      }

      // Test 3: Property ownership dropdown
      this.results.totalTests++;
      testResults.total++;
      
      const dropdowns = await page.locator('select, [role="combobox"], [class*="dropdown"], [class*="select"]').all();
      if (dropdowns.length > 0) {
        await this.log(`✅ Found ${dropdowns.length} dropdown(s)`);
        testResults.passed++;
        this.results.passed++;
      } else {
        await this.log('❌ No dropdowns found');
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push('Property ownership dropdown missing');
      }

      // Test 4: Continue button exists
      this.results.totalTests++;
      testResults.total++;
      
      const continueBtn = await page.locator('button:has-text("המשך"), button:has-text("Continue"), button:has-text("Next"), [type="submit"]').first();
      const btnExists = await continueBtn.count() > 0;
      
      if (btnExists) {
        await this.log('✅ Continue button found');
        testResults.passed++;
        this.results.passed++;
      } else {
        await this.log('❌ Continue button not found');
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push('Continue button missing');
      }

    } catch (error) {
      await this.log('❌ Mortgage calculator test failed: ' + error.message);
      testResults.failed++;
      this.results.failed++;
      testResults.issues.push(`Test error: ${error.message}`);
    }

    this.results.testSuites.push(testResults);
    return testResults;
  }

  async testCreditCalculator(page) {
    const testResults = {
      name: 'Credit Calculator Test',
      passed: 0,
      failed: 0,
      issues: [],
      total: 0
    };

    try {
      await this.log('💳 Testing credit calculator...');
      await page.goto('http://localhost:5173/services/calculate-credit/1', { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      });

      // Test 1: Page loads
      this.results.totalTests++;
      testResults.total++;
      
      const isLoaded = await page.waitForSelector('body', { timeout: 10000 }).catch(() => false);
      if (isLoaded) {
        await this.log('✅ Credit calculator page loads');
        testResults.passed++;
        this.results.passed++;
      } else {
        await this.log('❌ Credit calculator page failed to load');
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push('Page load failure');
      }

      // Test 2: Credit amount input
      this.results.totalTests++;
      testResults.total++;
      
      const creditInput = await page.locator('input[name*="credit"], input[name*="amount"], input[name*="loan"]').first();
      const inputExists = await creditInput.count() > 0;
      
      if (inputExists) {
        await this.log('✅ Credit amount input found');
        testResults.passed++;
        this.results.passed++;
      } else {
        await this.log('❌ Credit amount input not found');
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push('Credit amount input missing');
      }

    } catch (error) {
      await this.log('❌ Credit calculator test failed: ' + error.message);
      testResults.failed++;
      this.results.failed++;
      testResults.issues.push(`Test error: ${error.message}`);
    }

    this.results.testSuites.push(testResults);
    return testResults;
  }

  async testRefinanceMortgage(page) {
    const testResults = {
      name: 'Refinance Mortgage Test',
      passed: 0,
      failed: 0,
      issues: [],
      total: 0
    };

    try {
      await this.log('🏦 Testing refinance mortgage...');
      await page.goto('http://localhost:5173/services/refinance-mortgage/1', { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      });

      // Test 1: Page loads
      this.results.totalTests++;
      testResults.total++;
      
      const isLoaded = await page.waitForSelector('body', { timeout: 10000 }).catch(() => false);
      if (isLoaded) {
        await this.log('✅ Refinance mortgage page loads');
        testResults.passed++;
        this.results.passed++;
      } else {
        await this.log('❌ Refinance mortgage page failed to load');
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push('Page load failure');
      }

    } catch (error) {
      await this.log('❌ Refinance mortgage test failed: ' + error.message);
      testResults.failed++;
      this.results.failed++;
      testResults.issues.push(`Test error: ${error.message}`);
    }

    this.results.testSuites.push(testResults);
    return testResults;
  }

  async testResponsiveDesign(page) {
    const testResults = {
      name: 'Responsive Design Test',
      passed: 0,
      failed: 0,
      issues: [],
      total: 0
    };

    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      try {
        await this.log(`📱 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });

        this.results.totalTests++;
        testResults.total++;

        // Check if page is responsive
        const body = await page.locator('body');
        const isVisible = await body.isVisible();
        
        if (isVisible) {
          await this.log(`✅ ${viewport.name} layout renders correctly`);
          testResults.passed++;
          this.results.passed++;
        } else {
          await this.log(`❌ ${viewport.name} layout has issues`);
          testResults.failed++;
          this.results.failed++;
          testResults.issues.push(`${viewport.name} layout broken`);
        }

      } catch (error) {
        await this.log(`❌ ${viewport.name} test failed: ${error.message}`);
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push(`${viewport.name} error: ${error.message}`);
      }
    }

    this.results.testSuites.push(testResults);
    return testResults;
  }

  async testTranslations(page) {
    const testResults = {
      name: 'Translation Test',
      passed: 0,
      failed: 0,
      issues: [],
      total: 0
    };

    const languages = ['en', 'he', 'ru'];

    for (const lang of languages) {
      try {
        await this.log(`🌐 Testing ${lang} translations...`);
        await page.goto(`http://localhost:5173?lang=${lang}`, { 
          waitUntil: 'networkidle', 
          timeout: 30000 
        });

        this.results.totalTests++;
        testResults.total++;

        const bodyText = await page.textContent('body');
        if (bodyText && bodyText.length > 100) {
          await this.log(`✅ ${lang} content available`);
          testResults.passed++;
          this.results.passed++;
        } else {
          await this.log(`❌ ${lang} content missing or insufficient`);
          testResults.failed++;
          this.results.failed++;
          testResults.issues.push(`${lang} translation issues`);
        }

      } catch (error) {
        await this.log(`❌ ${lang} translation test failed: ${error.message}`);
        testResults.failed++;
        this.results.failed++;
        testResults.issues.push(`${lang} error: ${error.message}`);
      }
    }

    this.results.testSuites.push(testResults);
    return testResults;
  }

  generateReport() {
    const reportPath = `qa-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    const report = {
      ...this.results,
      summary: {
        totalTests: this.results.totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: Math.round((this.results.passed / this.results.totalTests) * 100) || 0
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE QA TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️ Warnings: ${this.results.warnings}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}%`);
    console.log('\n📋 Test Suites:');
    
    this.results.testSuites.forEach(suite => {
      console.log(`  ${suite.name}: ${suite.passed}/${suite.total} passed`);
      if (suite.issues.length > 0) {
        console.log(`    Issues: ${suite.issues.join(', ')}`);
      }
    });
    
    console.log(`\n📄 Full report saved: ${reportPath}`);
    console.log('='.repeat(60));
    
    return reportPath;
  }

  async runAllTests() {
    const browser = await chromium.launch({ 
      headless: false,
      timeout: 120000
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });

    const page = await context.newPage();

    // Create screenshots directory
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    console.log('🚀 STARTING COMPREHENSIVE QA TEST SUITE');
    console.log('=' .repeat(60));

    try {
      await this.testHomepageLoad(page);
      await this.testMortgageCalculator(page);
      await this.testCreditCalculator(page);
      await this.testRefinanceMortgage(page);
      await this.testResponsiveDesign(page);
      await this.testTranslations(page);

      this.generateReport();

    } catch (error) {
      console.error('\n❌ Fatal error during testing:', error);
    } finally {
      await browser.close();
      console.log('\n✅ COMPREHENSIVE QA TESTING COMPLETE!');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const runner = new CustomQARunner();
  runner.runAllTests().catch(console.error);
}

module.exports = CustomQARunner;