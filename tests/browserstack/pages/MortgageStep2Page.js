/**
 * Mortgage Calculator Step 2 Page Object
 * Handles personal information and contact details
 */

const BasePage = require('./BasePage');
const config = require('../config/test-config');

class MortgageStep2Page extends BasePage {
  constructor(driver) {
    super(driver);
    
    this.selectors = {
      // Personal information fields
      firstName: [
        '[name="firstName"]',
        '[data-testid*="first-name"]',
        'input[placeholder*="שם פרטי"]',
        'input[placeholder*="first"]',
        '.first-name input'
      ],
      
      lastName: [
        '[name="lastName"]',
        '[data-testid*="last-name"]',
        'input[placeholder*="שם משפחה"]',
        'input[placeholder*="last"]',
        '.last-name input'
      ],
      
      // Contact information
      phone: [
        '[name="phone"]',
        '[data-testid*="phone"]',
        'input[type="tel"]',
        'input[placeholder*="טלפון"]',
        'input[placeholder*="phone"]',
        '.phone input'
      ],
      
      email: [
        '[name="email"]',
        '[data-testid*="email"]',
        'input[type="email"]',
        'input[placeholder*="מייל"]',
        'input[placeholder*="email"]',
        '.email input'
      ],
      
      // Date fields
      birthDate: [
        '[name*="birth"]',
        '[data-testid*="birth"]',
        'input[type="date"]',
        'input[placeholder*="תאריך"]',
        'input[placeholder*="date"]'
      ],
      
      // Dropdowns for personal info
      citizenship: [
        '[data-testid*="citizenship"]',
        'select[name*="citizenship"]',
        '[placeholder*="אזרחות"]',
        '[placeholder*="citizenship"]'
      ],
      
      maritalStatus: [
        '[data-testid*="marital"]',
        'select[name*="marital"]',
        '[placeholder*="משפחתי"]',
        '[placeholder*="marital"]'
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
   * Navigate to Step 2 of mortgage calculator
   */
  async navigateToStep2() {
    await this.navigateTo('/services/calculate-mortgage/2');
    await this.waitForStep2ToLoad();
    return this;
  }

  /**
   * Wait for Step 2 page to fully load
   */
  async waitForStep2ToLoad() {
    await this.findElement(this.selectors.firstName);
    }

  /**
   * Fill personal information form
   * @param {Object} personalData - Personal information data
   */
  async fillPersonalInfo(personalData = {}) {
    const defaultData = {
      firstName: 'יונתן',
      lastName: 'כהן',
      phone: '0544123456',
      email: 'test@example.com',
      citizenship: 'ישראלי',
      maritalStatus: 'רווק'
    };
    
    const data = { ...defaultData, ...personalData };
    
    if (data.firstName) {
      await this.typeText(this.selectors.firstName, data.firstName);
    }
    
    if (data.lastName) {
      await this.typeText(this.selectors.lastName, data.lastName);
    }
    
    if (data.phone) {
      await this.typeText(this.selectors.phone, data.phone);
    }
    
    if (data.email) {
      await this.typeText(this.selectors.email, data.email);
    }
    
    return this;
  }

  /**
   * Complete Step 2 and proceed to Step 3
   */
  async completeStep2(personalData = {}) {
    await this.fillPersonalInfo(personalData);
    await this.takeScreenshot('step2-completed');
    
    const continueButton = await this.findElement(this.selectors.continueButton);
    await this.clickElement(continueButton);
    
    await this.driver.sleep(3000);
    
    const currentUrl = await this.getCurrentUrl();
    if (currentUrl.includes('/3')) {
      return true;
    } else {
      console.error('❌ Failed to proceed to Step 3');
      return false;
    }
  }
}

module.exports = MortgageStep2Page;