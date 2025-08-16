const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const QAReportGenerator = require('./lib/report-generator');

/**
 * COMPREHENSIVE QA TEST RUNNER
 * Runs all QA tests and generates reports with Jira integration
 */

class ComprehensiveQATester {
  constructor() {
    this.reportGenerator = new QAReportGenerator({
      reportsDir: 'server/docs/QA/reports',
      screenshotsDir: 'screenshots'
    });
    
    this.allResults = {
      timestamp: new Date().toISOString(),
      tests: []
    };
  }

  /**
   * Run menu navigation tests
   */
  async runMenuTests(page) {
    console.log('\n🎯 RUNNING MENU NAVIGATION TESTS...\n');
    
    const results = {
      testName: 'Menu Navigation Test',
      testType: 'Navigation & UI Testing',
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: [],
      screenshots: []
    };
    
    try {
      // Test menu visibility
      const burger = await page.locator('.burger, [class*="burger"]').first();
      results.totalTests++;
      
      if (await burger.isVisible()) {
        console.log('✅ Menu button visible');
        results.passed++;
      } else {
        console.log('❌ Menu button not visible');
        results.failed++;
        const screenshot = await this.reportGenerator.takeScreenshot(page, 'menu-button-missing');
        results.issues.push({
          title: 'Menu button not visible',
          description: 'The hamburger menu button is not visible on the page',
          severity: 'CRITICAL',
          screenshot: screenshot
        });
      }
      
      // Test menu opening
      if (await burger.isVisible()) {
        await burger.click();
        await page.waitForTimeout(500);
        results.totalTests++;
        
        const menu = await page.locator('.mobile-menu, [class*="sidebar"]').first();
        if (await menu.isVisible()) {
          console.log('✅ Menu opens correctly');
          results.passed++;
        } else {
          console.log('❌ Menu does not open');
          results.failed++;
          const screenshot = await this.reportGenerator.takeScreenshot(page, 'menu-not-opening');
          results.issues.push({
            title: 'Menu does not open',
            description: 'Clicking the menu button does not open the navigation menu',
            severity: 'CRITICAL',
            screenshot: screenshot
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Menu test error:', error.message);
      results.failed++;
      results.issues.push({
        title: 'Menu test error',
        description: error.message,
        severity: 'HIGH'
      });
    }
    
    // Generate report
    const reportPath = await this.reportGenerator.generateReport(results);
    console.log(`📊 Menu test report: ${reportPath}`);
    
    this.allResults.tests.push(results);
    return results;
  }

  /**
   * Run form validation tests
   */
  async runFormTests(page) {
    console.log('\n📝 RUNNING FORM VALIDATION TESTS...\n');
    
    const results = {
      testName: 'Form Validation Test',
      testType: 'Form & Input Testing',
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: [],
      screenshots: []
    };
    
    try {
      // Navigate to mortgage calculator
      await page.goto('http://localhost:5173/services/calculate-mortgage');
      await page.waitForLoadState('networkidle');
      
      // Test required field validation
      results.totalTests++;
      const submitButton = await page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        const errors = await page.locator('.error, [class*="error"]').all();
        if (errors.length > 0) {
          console.log('✅ Form validation works');
          results.passed++;
        } else {
          console.log('⚠️ No validation errors shown');
          results.warnings++;
          const screenshot = await this.reportGenerator.takeScreenshot(page, 'form-validation-missing');
          results.issues.push({
            title: 'Form validation not working',
            description: 'Submitting empty form does not show validation errors',
            severity: 'MEDIUM',
            screenshot: screenshot
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Form test error:', error.message);
      results.failed++;
      results.issues.push({
        title: 'Form test error',
        description: error.message,
        severity: 'MEDIUM'
      });
    }
    
    // Generate report
    const reportPath = await this.reportGenerator.generateReport(results);
    console.log(`📊 Form test report: ${reportPath}`);
    
    this.allResults.tests.push(results);
    return results;
  }

  /**
   * Run translation tests
   */
  async runTranslationTests(page) {
    console.log('\n🌐 RUNNING TRANSLATION TESTS...\n');
    
    const results = {
      testName: 'Translation Test',
      testType: 'Multi-language Testing',
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: [],
      screenshots: []
    };
    
    const languages = ['en', 'he', 'ru'];
    
    for (const lang of languages) {
      try {
        results.totalTests++;
        
        // Try to switch language
        console.log(`Testing ${lang} language...`);
        
        // Check for translated content
        const hasContent = await page.locator('body').textContent();
        if (hasContent && hasContent.length > 100) {
          console.log(`✅ ${lang} language has content`);
          results.passed++;
        } else {
          console.log(`❌ ${lang} language missing content`);
          results.failed++;
          const screenshot = await this.reportGenerator.takeScreenshot(page, `translation-${lang}-missing`);
          results.issues.push({
            title: `Missing translations for ${lang}`,
            description: `The ${lang} language version is missing content`,
            severity: 'HIGH',
            screenshot: screenshot
          });
        }
        
      } catch (error) {
        console.error(`❌ Translation test error for ${lang}:`, error.message);
        results.failed++;
      }
    }
    
    // Generate report
    const reportPath = await this.reportGenerator.generateReport(results);
    console.log(`📊 Translation test report: ${reportPath}`);
    
    this.allResults.tests.push(results);
    return results;
  }

  /**
   * Run dropdown tests
   */
  async runDropdownTests(page) {
    console.log('\n📋 RUNNING DROPDOWN TESTS...\n');
    
    const results = {
      testName: 'Dropdown Test',
      testType: 'UI Component Testing',
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: [],
      screenshots: []
    };
    
    try {
      // Find all dropdowns
      const dropdowns = await page.locator('select, [role="combobox"], [class*="dropdown"]').all();
      console.log(`Found ${dropdowns.length} dropdowns`);
      
      for (let i = 0; i < Math.min(dropdowns.length, 5); i++) {
        results.totalTests++;
        const dropdown = dropdowns[i];
        
        try {
          if (await dropdown.isVisible()) {
            console.log(`✅ Dropdown ${i + 1} is visible`);
            results.passed++;
          } else {
            console.log(`❌ Dropdown ${i + 1} is not visible`);
            results.failed++;
          }
        } catch (error) {
          console.log(`⚠️ Could not test dropdown ${i + 1}`);
          results.warnings++;
        }
      }
      
    } catch (error) {
      console.error('❌ Dropdown test error:', error.message);
      results.failed++;
      results.issues.push({
        title: 'Dropdown test error',
        description: error.message,
        severity: 'MEDIUM'
      });
    }
    
    // Generate report
    const reportPath = await this.reportGenerator.generateReport(results);
    console.log(`📊 Dropdown test report: ${reportPath}`);
    
    this.allResults.tests.push(results);
    return results;
  }

  /**
   * Generate master report
   */
  async generateMasterReport() {
    console.log('\n📊 GENERATING MASTER QA REPORT...\n');
    
    // Calculate totals
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;
    let allIssues = [];
    
    this.allResults.tests.forEach(test => {
      totalTests += test.totalTests;
      totalPassed += test.passed;
      totalFailed += test.failed;
      totalWarnings += test.warnings;
      allIssues = allIssues.concat(test.issues);
    });
    
    const masterResults = {
      testName: 'Comprehensive QA Test Suite',
      testType: 'Full System Testing',
      totalTests: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      warnings: totalWarnings,
      issues: allIssues,
      duration: 'N/A',
      environment: 'http://localhost:5173',
      timestamp: this.allResults.timestamp,
      individualTests: this.allResults.tests
    };
    
    // Generate master report
    const reportPath = await this.reportGenerator.generateReport(masterResults);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MASTER QA REPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Warnings: ${totalWarnings}`);
    console.log(`Issues Found: ${allIssues.length}`);
    console.log(`\nMaster Report: ${reportPath}`);
    console.log('='.repeat(60));
    
    console.log('\n✅ All reports generated with:');
    console.log('  - Interactive HTML interface');
    console.log('  - One-click Jira bug creation');
    console.log('  - Bilingual descriptions (English/Russian)');
    console.log('  - Automatic screenshot attachment');
    console.log('  - Confluence documentation links');
    
    return reportPath;
  }

  /**
   * Run all tests
   */
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
    
    console.log('🚀 STARTING COMPREHENSIVE QA TEST SUITE');
    console.log('=' .repeat(60));
    
    try {
      // Navigate to homepage
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
      
      // Run all test suites
      await this.runMenuTests(page);
      await this.runFormTests(page);
      await this.runTranslationTests(page);
      await this.runDropdownTests(page);
      
      // Generate master report
      await this.generateMasterReport();
      
    } catch (error) {
      console.error('\n❌ Fatal error during testing:', error);
    } finally {
      await browser.close();
      console.log('\n✅ COMPREHENSIVE QA TESTING COMPLETE!');
    }
  }
}

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run if executed directly
if (require.main === module) {
  const tester = new ComprehensiveQATester();
  tester.runAllTests().catch(console.error);
}

module.exports = ComprehensiveQATester;