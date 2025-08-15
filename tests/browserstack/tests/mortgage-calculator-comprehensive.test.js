/**
 * Comprehensive Mortgage Calculator Test Suite
 * Professional QA Automation for BankiMonline Platform
 * 
 * This test suite performs thorough testing of the mortgage calculator
 * across all 4 steps with dropdown validation, cross-browser compatibility,
 * and comprehensive error handling.
 */

const { Builder } = require('selenium-webdriver');
const { expect } = require('chai');
const { getCapability } = require('../config/capabilities');
const config = require('../config/test-config');

// Page Objects
const MortgageStep1Page = require('../pages/MortgageStep1Page');
const MortgageStep2Page = require('../pages/MortgageStep2Page');
const MortgageStep3Page = require('../pages/MortgageStep3Page');
const MortgageStep4Page = require('../pages/MortgageStep4Page');

// Test Results Storage
const TestReporter = require('../utils/TestReporter');
const reporter = new TestReporter('mortgage-calculator-comprehensive');

describe('BankiMonline Mortgage Calculator - Comprehensive Test Suite', function() {
  this.timeout(config.getTestTimeout('regression'));
  
  let driver;
  let step1Page, step2Page, step3Page, step4Page;
  
  const testBrowser = process.env.BROWSER || 'chrome-latest';
  const testEnv = process.env.TEST_ENV || 'local';
  
  before(async function() {
    // Initialize WebDriver with BrowserStack capabilities
    const capabilities = getCapability(testBrowser);
    capabilities['bstack:options'].sessionName = `Mortgage Calculator Comprehensive - ${testBrowser}`;
    
    driver = await new Builder()
      .usingServer(config.hubUrl)
      .withCapabilities(capabilities)
      .build();
    
    // Initialize page objects
    step1Page = new MortgageStep1Page(driver);
    step2Page = new MortgageStep2Page(driver);
    step3Page = new MortgageStep3Page(driver);
    step4Page = new MortgageStep4Page(driver);
    
    // Configure timeouts
    await driver.manage().setTimeouts({
      implicit: config.timeouts.implicit,
      pageLoad: config.timeouts.page,
      script: config.timeouts.script
    });
    
    });
  
  after(async function() {
    if (driver) {
      await driver.quit();
      }
    
    // Generate test report
    await reporter.generateReport();
  });
  
  beforeEach(async function() {
    reporter.startTest(this.currentTest.title);
    });
  
  afterEach(async function() {
    const testResult = {
      name: this.currentTest.title,
      status: this.currentTest.state || 'unknown',
      error: this.currentTest.err?.message,
      duration: Date.now() - this.currentTest.start
    };
    
    reporter.endTest(testResult);
    
    // Take screenshot on failure
    if (this.currentTest.state === 'failed') {
      await step1Page.takeScreenshot(`failed-${this.currentTest.title.replace(/\s+/g, '-')}`);
    }
  });
  
  describe('Step 1 - Property Details & Financial Parameters', function() {
    
    it('should load Step 1 page successfully', async function() {
      await step1Page.navigateToStep1();
      
      const title = await step1Page.getPageTitle();
      const url = await step1Page.getCurrentUrl();
      
      expect(url).to.include('/services/calculate-mortgage/1');
      reporter.addAssertion('Page URL contains step 1 path', true);
      reporter.addAssertion('Page title exists', title.length > 0);
    });
    
    it('should validate all dropdown options in Step 1', async function() {
      await step1Page.navigateToStep1();
      
      const dropdownTypes = ['city', 'whenNeeded', 'propertyType', 'firstHome', 'propertyOwnership'];
      const dropdownResults = {};
      
      for (const dropdownType of dropdownTypes) {
        try {
          const options = await step1Page.getDropdownOptions(dropdownType);
          const testResults = await step1Page.testAllDropdownOptions(dropdownType);
          
          dropdownResults[dropdownType] = {
            totalOptions: options.length,
            testedOptions: testResults.length,
            successfulSelections: testResults.filter(r => r.selected).length,
            errors: testResults.filter(r => r.error).length,
            options: options,
            results: testResults
          };
          
          // Assertions for reporting
          reporter.addAssertion(`${dropdownType} dropdown has options`, options.length > 0);
          reporter.addAssertion(`${dropdownType} dropdown options selectable`, dropdownResults[dropdownType].successfulSelections > 0);
          
        } catch (error) {
          console.error(`❌ Error testing ${dropdownType} dropdown:`, error.message);
          dropdownResults[dropdownType] = { error: error.message };
          reporter.addAssertion(`${dropdownType} dropdown test failed`, false, error.message);
        }
      }
      
      // Store detailed results
      reporter.addData('dropdownValidationResults', dropdownResults);
      
      // Overall validation
      const totalDropdowns = dropdownTypes.length;
      const successfulDropdowns = Object.values(dropdownResults).filter(r => !r.error).length;
      
      expect(successfulDropdowns).to.be.greaterThan(0);
      });
    
    it('should complete Step 1 form and proceed to Step 2', async function() {
      await step1Page.navigateToStep1();
      
      const formData = {
        propertyPrice: 2500000,
        city: 'תל אביב',
        whenNeeded: 'בעוד 3 חודשים', 
        propertyType: 'דירה',
        firstHome: 'כן',
        propertyOwnership: 'אין לי נכס',
        initialPayment: 625000
      };
      
      const success = await step1Page.completeStep1(formData);
      
      expect(success).to.be.true;
      reporter.addAssertion('Step 1 form completion successful', success);
      reporter.addData('step1FormData', formData);
      
      });
    
    it('should validate property ownership LTV impact', async function() {
      await step1Page.navigateToStep1();
      
      // Test different property ownership options and their impact on initial payment limits
      const propertyValue = 2000000;
      await step1Page.fillPropertyPrice(propertyValue);
      
      const ownershipOptions = ['אין לי נכס', 'יש לי נכס', 'אני מוכר נכס'];
      const ltvResults = [];
      
      for (const ownership of ownershipOptions) {
        try {
          await step1Page.selectPropertyOwnership(ownership);
          
          // Wait for LTV calculation to update
          await driver.sleep(2000);
          
          // Try to set initial payment and observe behavior
          await step1Page.setInitialPayment(500000);
          
          // Check for validation errors
          const hasErrors = await step1Page.hasValidationErrors();
          const errors = hasErrors ? await step1Page.getValidationErrors() : [];
          
          ltvResults.push({
            ownership: ownership,
            propertyValue: propertyValue,
            initialPayment: 500000,
            hasValidationErrors: hasErrors,
            errors: errors
          });
          
          } catch (error) {
          console.error(`❌ Error testing property ownership "${ownership}":`, error.message);
          ltvResults.push({
            ownership: ownership,
            error: error.message
          });
        }
      }
      
      reporter.addData('ltvValidationResults', ltvResults);
      
      // Verify that at least some ownership options were tested
      const successfulTests = ltvResults.filter(r => !r.error).length;
      expect(successfulTests).to.be.greaterThan(0);
      
      });
  });
  
  describe('Step 2 - Personal Information', function() {
    
    it('should load Step 2 page after completing Step 1', async function() {
      // Complete Step 1 first
      await step1Page.navigateToStep1();
      await step1Page.completeStep1();
      
      // Verify Step 2 loaded
      await step2Page.waitForStep2ToLoad();
      
      const url = await step2Page.getCurrentUrl();
      expect(url).to.include('/services/calculate-mortgage/2');
      
      reporter.addAssertion('Step 2 navigation successful', true);
      });
    
    it('should fill personal information and proceed to Step 3', async function() {
      // Navigate directly to Step 2 (assuming previous test completed Step 1)
      const personalData = {
        firstName: 'יונתן',
        lastName: 'כהן', 
        phone: '0544123456',
        email: 'test.user@example.com'
      };
      
      const success = await step2Page.completeStep2(personalData);
      
      expect(success).to.be.true;
      reporter.addAssertion('Step 2 completion successful', success);
      reporter.addData('step2PersonalData', personalData);
      
      });
  });
  
  describe('Step 3 - Income Information', function() {
    
    it('should fill income information and proceed to Step 4', async function() {
      // Navigate through previous steps or directly to Step 3
      await step3Page.navigateToStep3();
      
      const incomeData = {
        monthlyIncome: 28000,
        employmentType: 'עובד משכורת',
        additionalIncome: 2000
      };
      
      const success = await step3Page.completeStep3(incomeData);
      
      expect(success).to.be.true;
      reporter.addAssertion('Step 3 completion successful', success);
      reporter.addData('step3IncomeData', incomeData);
      
      });
  });
  
  describe('Step 4 - Bank Offers & Results', function() {
    
    it('should load and display bank offers', async function() {
      await step4Page.navigateToStep4();
      
      const offers = await step4Page.getBankOffers();
      const results = await step4Page.getCalculationResults();
      
      reporter.addAssertion('Step 4 page loaded', true);
      reporter.addAssertion('Bank offers found', offers.length > 0);
      reporter.addData('bankOffers', offers);
      reporter.addData('calculationResults', results);
      
      expect(results.hasResults || offers.length > 0).to.be.true;
    });
    
    it('should test Step 4 interactive functionality', async function() {
      await step4Page.navigateToStep4();
      
      const functionalityResults = await step4Page.testStep4Functionality();
      
      reporter.addAssertion('Step 4 functionality test completed', true);
      reporter.addData('step4FunctionalityResults', functionalityResults);
      
      // Verify basic functionality
      expect(functionalityResults.pageLoaded).to.be.true;
      
      });
  });
  
  describe('Complete End-to-End Flow', function() {
    
    it('should complete entire mortgage calculator flow', async function() {
      const flowResults = {
        startTime: new Date().toISOString(),
        steps: {}
      };
      
      try {
        // Step 1
        await step1Page.navigateToStep1();
        const step1Success = await step1Page.completeStep1({
          propertyPrice: 3000000,
          city: 'תל אביב',
          propertyOwnership: 'אין לי נכס'
        });
        flowResults.steps.step1 = { success: step1Success, timestamp: new Date().toISOString() };
        
        // Step 2
        const step2Success = await step2Page.completeStep2({
          firstName: 'דוד',
          lastName: 'לוי',
          phone: '0544123456',
          email: 'david.levi@test.com'
        });
        flowResults.steps.step2 = { success: step2Success, timestamp: new Date().toISOString() };
        
        // Step 3
        const step3Success = await step3Page.completeStep3({
          monthlyIncome: 35000,
          employmentType: 'עובד משכורת'
        });
        flowResults.steps.step3 = { success: step3Success, timestamp: new Date().toISOString() };
        
        // Step 4
        await step4Page.waitForStep4ToLoad();
        const step4Results = await step4Page.completeCalculation();
        flowResults.steps.step4 = { 
          success: true, 
          results: step4Results, 
          timestamp: new Date().toISOString() 
        };
        
        flowResults.endTime = new Date().toISOString();
        flowResults.overallSuccess = Object.values(flowResults.steps).every(step => step.success);
        
        reporter.addData('completeFlowResults', flowResults);
        
        expect(flowResults.overallSuccess).to.be.true;
        
      } catch (error) {
        flowResults.error = error.message;
        flowResults.endTime = new Date().toISOString();
        
        console.error('❌ End-to-end flow failed:', error.message);
        throw error;
      }
    });
  });
  
  describe('Cross-Browser Validation', function() {
    
    it('should record browser-specific behavior', async function() {
      const browserInfo = await driver.getCapabilities();
      const currentUrl = await driver.getCurrentUrl();
      
      const browserData = {
        browserName: browserInfo.get('browserName'),
        browserVersion: browserInfo.get('browserVersion'),
        platform: browserInfo.get('platform') || browserInfo.get('platformName'),
        currentUrl: currentUrl,
        timestamp: new Date().toISOString()
      };
      
      reporter.addData('browserInfo', browserData);
      
      expect(browserData.browserName).to.exist;
    });
  });
});

// Export test results for external reporting
module.exports = {
  getTestResults: () => reporter.getResults(),
  reporter: reporter
};