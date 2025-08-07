/**
 * Mortgage Calculator Step 3 Page Object
 * Handles income information and employment details
 */

const BasePage = require('./BasePage');
const config = require('../config/test-config');

class MortgageStep3Page extends BasePage {
  constructor(driver) {
    super(driver);
    
    this.selectors = {
      // Income fields
      monthlyIncome: [
        '[name*="income"]',
        '[data-testid*="income"]',
        'input[placeholder*="הכנסה"]',
        'input[placeholder*="income"]',
        '.income input'
      ],
      
      // Employment information
      employmentType: [
        '[data-testid*="employment"]',
        'select[name*="employment"]',
        '[placeholder*="עבודה"]',
        '[placeholder*="employment"]'
      ],
      
      // Additional financial info
      additionalIncome: [
        '[name*="additional"]',
        '[data-testid*="additional"]',
        'input[placeholder*="נוספת"]',
        'input[placeholder*="additional"]'
      ],
      
      // Continue button
      continueButton: [
        'button[type="submit"]',
        'button:contains("המשך")',
        'button:contains("Continue")',
        'button:contains("Next")',
        '.continue-button'
      ],
      
      // Error messages
      errorMessages: [
        '.error',
        '[data-testid*="error"]',
        '.error-message',
        '.validation-error'
      ]
    };
  }

  /**
   * Navigate to Step 3 of mortgage calculator
   */
  async navigateToStep3() {
    console.log('💼 Navigating to Mortgage Calculator Step 3');
    await this.navigateTo('/services/calculate-mortgage/3');
    await this.waitForStep3ToLoad();
    return this;
  }

  /**
   * Wait for Step 3 page to fully load
   */
  async waitForStep3ToLoad() {
    console.log('⏳ Waiting for Step 3 to load...');
    await this.findElement(this.selectors.monthlyIncome);
    console.log('✅ Step 3 loaded successfully');
  }

  /**
   * Fill income and employment information
   * @param {Object} incomeData - Income and employment data
   */
  async fillIncomeInfo(incomeData = {}) {
    const defaultData = {
      monthlyIncome: 25000,
      employmentType: 'עובד משכורת',
      additionalIncome: 0
    };
    
    const data = { ...defaultData, ...incomeData };
    
    console.log('💰 Filling income information:', data);
    
    if (data.monthlyIncome) {
      await this.typeText(this.selectors.monthlyIncome, data.monthlyIncome.toString());
    }
    
    if (data.employmentType) {
      try {
        await this.selectDropdownOption(this.selectors.employmentType[0], data.employmentType);
      } catch (e) {
        console.log('Employment dropdown not found or not interactive');
      }
    }
    
    console.log('✅ Income information filled');
    return this;
  }

  /**
   * Complete Step 3 and proceed to Step 4
   */
  async completeStep3(incomeData = {}) {
    await this.fillIncomeInfo(incomeData);
    await this.takeScreenshot('step3-completed');
    
    const continueButton = await this.findElement(this.selectors.continueButton);
    await this.clickElement(continueButton);
    
    await this.driver.sleep(3000);
    
    const currentUrl = await this.getCurrentUrl();
    if (currentUrl.includes('/4')) {
      console.log('✅ Successfully proceeded to Step 4');
      return true;
    } else {
      console.error('❌ Failed to proceed to Step 4');
      return false;
    }
  }
}

module.exports = MortgageStep3Page;