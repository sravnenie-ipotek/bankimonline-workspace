/**
 * Mortgage Calculator Step 4 Page Object  
 * Handles bank offers, comparison, and results
 */

const BasePage = require('./BasePage');
const config = require('../config/test-config');

class MortgageStep4Page extends BasePage {
  constructor(driver) {
    super(driver);
    
    this.selectors = {
      // Bank offers and results
      bankOffers: [
        '[data-testid*="bank-offer"]',
        '.bank-offer',
        '.offer-card',
        '.bank-comparison-card'
      ],
      
      // Results section
      resultsContainer: [
        '[data-testid="results-container"]',
        '.results-section',
        '.mortgage-results',
        '.calculation-results'
      ],
      
      // Bank selection checkboxes
      bankCheckboxes: [
        'input[type="checkbox"][name*="bank"]',
        '[data-testid*="bank-checkbox"]',
        '.bank-selection input[type="checkbox"]'
      ],
      
      // Compare button
      compareButton: [
        'button:contains("השווה")',
        'button:contains("Compare")',
        '[data-testid*="compare"]',
        '.compare-button'
      ],
      
      // Monthly payment displays
      monthlyPayments: [
        '[data-testid*="monthly-payment"]',
        '.monthly-payment',
        '.payment-amount',
        '.monthly-amount'
      ],
      
      // Interest rate displays
      interestRates: [
        '[data-testid*="interest-rate"]',
        '.interest-rate',
        '.rate-display'
      ],
      
      // Bank logos/names
      bankNames: [
        '[data-testid*="bank-name"]',
        '.bank-name',
        '.bank-logo',
        '.offer-bank'
      ],
      
      // Offer details
      offerDetails: [
        '[data-testid*="offer-detail"]',
        '.offer-details',
        '.mortgage-details',
        '.offer-info'
      ],
      
      // Loading states
      loadingSpinner: [
        '[data-testid="loader"]',
        '.loader',
        '.loading',
        '.spinner'
      ],
      
      // Error messages
      errorMessages: [
        '.error',
        '[data-testid*="error"]',
        '.error-message'
      ]
    };
  }

  /**
   * Navigate to Step 4 of mortgage calculator
   */
  async navigateToStep4() {
    await this.navigateTo('/services/calculate-mortgage/4');
    await this.waitForStep4ToLoad();
    return this;
  }

  /**
   * Wait for Step 4 page to fully load with bank offers
   */
  async waitForStep4ToLoad(timeout = this.config.timeouts.page) {
    // Wait for loading spinner to disappear
    try {
      await this.driver.sleep(2000);
      const loadingElements = await this.driver.findElements({ css: this.selectors.loadingSpinner[0] });
      if (loadingElements.length > 0) {
        await this.waitForElementToDisappear(this.selectors.loadingSpinner[0], timeout);
      }
    } catch (e) {
      // No loading spinner found, continue
    }
    
    // Wait for either results or bank offers to appear
    try {
      await Promise.race([
        this.findElement(this.selectors.resultsContainer, 15000),
        this.findElement(this.selectors.bankOffers, 15000)
      ]);
    } catch (e) {
      }
    
    }

  /**
   * Get all bank offers displayed on the page
   * @returns {Array<Object>} Array of bank offer data
   */
  async getBankOffers() {
    const offers = [];
    
    try {
      const offerElements = await this.findElements(this.selectors.bankOffers[0]);
      
      for (let i = 0; i < offerElements.length; i++) {
        const offer = offerElements[i];
        
        try {
          // Extract bank name
          let bankName = 'Unknown Bank';
          try {
            const bankNameElement = await offer.findElement({ css: this.selectors.bankNames[0] });
            bankName = await bankNameElement.getText();
          } catch (e) {
            }
          
          // Extract monthly payment
          let monthlyPayment = 'N/A';
          try {
            const paymentElement = await offer.findElement({ css: this.selectors.monthlyPayments[0] });
            monthlyPayment = await paymentElement.getText();
          } catch (e) {
            }
          
          // Extract interest rate
          let interestRate = 'N/A';
          try {
            const rateElement = await offer.findElement({ css: this.selectors.interestRates[0] });
            interestRate = await rateElement.getText();
          } catch (e) {
            }
          
          offers.push({
            index: i,
            bankName: bankName.trim(),
            monthlyPayment: monthlyPayment.trim(),
            interestRate: interestRate.trim(),
            element: offer
          });
          
        } catch (error) {
          console.error(`Error extracting data from offer ${i + 1}:`, error.message);
        }
      }
      
    } catch (error) {
      }
    
    ));
    
    return offers;
  }

  /**
   * Select specific banks for comparison
   * @param {Array<number>} bankIndices - Array of bank offer indices to select
   */
  async selectBanksForComparison(bankIndices = [0, 1]) {
    const checkboxes = await this.findElements(this.selectors.bankCheckboxes[0]);
    
    for (const index of bankIndices) {
      if (index < checkboxes.length) {
        const checkbox = checkboxes[index];
        const isChecked = await checkbox.isSelected();
        
        if (!isChecked) {
          await this.clickElement(checkbox);
          } else {
          }
      }
    }
    
    return this;
  }

  /**
   * Click compare button to view detailed comparison
   */
  async clickCompare() {
    try {
      const compareButton = await this.findElement(this.selectors.compareButton);
      await this.scrollToElement(compareButton);
      await this.clickElement(compareButton);
      
      // Wait for comparison results to load
      await this.driver.sleep(3000);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get calculation results summary
   * @returns {Object} Results summary data
   */
  async getCalculationResults() {
    const results = {
      hasResults: false,
      bankOffers: [],
      totalOffers: 0,
      errors: []
    };
    
    try {
      // Check if results container exists
      const resultsExist = await this.isElementPresent(this.selectors.resultsContainer[0]);
      results.hasResults = resultsExist;
      
      // Get bank offers
      results.bankOffers = await this.getBankOffers();
      results.totalOffers = results.bankOffers.length;
      
      // Check for any error messages
      try {
        const errors = await this.driver.findElements({ css: this.selectors.errorMessages[0] });
        for (const errorElement of errors) {
          const errorText = await errorElement.getText();
          if (errorText.trim()) {
            results.errors.push(errorText.trim());
          }
        }
      } catch (e) {
        // No errors found
      }
      
    } catch (error) {
      console.error('❌ Error getting calculation results:', error.message);
      results.errors.push(`Error retrieving results: ${error.message}`);
    }
    
    return results;
  }

  /**
   * Test all interactive elements on Step 4
   * @returns {Object} Test results for Step 4 functionality
   */
  async testStep4Functionality() {
    const testResults = {
      step: 4,
      timestamp: new Date().toISOString(),
      pageLoaded: false,
      offersFound: 0,
      offersData: [],
      compareButtonExists: false,
      compareButtonClickable: false,
      checkboxesFound: 0,
      errors: []
    };
    
    try {
      // Test page loading
      await this.waitForStep4ToLoad();
      testResults.pageLoaded = true;
      
      // Test bank offers
      const offers = await this.getBankOffers();
      testResults.offersFound = offers.length;
      testResults.offersData = offers;
      
      // Test compare button
      const compareButtonExists = await this.isElementPresent(this.selectors.compareButton[0]);
      testResults.compareButtonExists = compareButtonExists;
      
      if (compareButtonExists) {
        try {
          const compareButton = await this.findElement(this.selectors.compareButton);
          const isEnabled = await compareButton.isEnabled();
          testResults.compareButtonClickable = isEnabled;
        } catch (e) {
          testResults.compareButtonClickable = false;
        }
      }
      
      // Test checkboxes
      try {
        const checkboxes = await this.driver.findElements({ css: this.selectors.bankCheckboxes[0] });
        testResults.checkboxesFound = checkboxes.length;
      } catch (e) {
        testResults.checkboxesFound = 0;
      }
      
    } catch (error) {
      console.error('❌ Error testing Step 4 functionality:', error.message);
      testResults.errors.push(error.message);
    }
    
    // Take screenshot of results
    await this.takeScreenshot('step4-functionality-test');
    
    return testResults;
  }

  /**
   * Complete full mortgage calculation flow through Step 4
   * @returns {Object} Complete calculation results
   */
  async completeCalculation() {
    await this.waitForStep4ToLoad();
    
    const results = await this.getCalculationResults();
    
    // Take final screenshot
    await this.takeScreenshot('step4-calculation-complete');
    
    return results;
  }
}

module.exports = MortgageStep4Page;