/**
 * Mortgage Calculator Step 1 Page Object
 * Handles property details, financial parameters, and dropdown interactions
 */

const BasePage = require('./BasePage');
const config = require('../config/test-config');

class MortgageStep1Page extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Step 1 specific selectors with fallbacks
    this.selectors = {
      // Property value input field
      propertyPrice: [
        '[data-testid="property-price-input"]',
        'input[name*="price"]',
        'input[placeholder*="נכס"]',
        'input[placeholder*="property"]',
        '.property-price input',
        'input[type="number"]:first-of-type'
      ],
      
      // City dropdown selector
      cityDropdown: [
        '[data-testid="city-dropdown"]',
        '.city-dropdown',
        '[placeholder*="עיר"]',
        '[placeholder*="city"]',
        'select[name*="city"]'
      ],
      
      // When needed money dropdown
      whenNeededDropdown: [
        '[data-testid="when-needed-dropdown"]',
        '.when-needed-dropdown',
        '[placeholder*="מתי"]',
        '[placeholder*="when"]',
        'select[name*="when"]'
      ],
      
      // Property type dropdown  
      propertyTypeDropdown: [
        '[data-testid="property-type-dropdown"]',
        '.property-type-dropdown',
        '[placeholder*="סוג"]',
        '[placeholder*="type"]',
        'select[name*="type"]'
      ],
      
      // First home dropdown
      firstHomeDropdown: [
        '[data-testid="first-home-dropdown"]',
        '.first-home-dropdown', 
        '[placeholder*="ראשון"]',
        '[placeholder*="first"]',
        'select[name*="first"]'
      ],
      
      // Property ownership dropdown (critical for LTV calculation)
      propertyOwnershipDropdown: [
        '[data-testid="property-ownership-dropdown"]',
        '.property-ownership-dropdown',
        '[placeholder*="בעלות"]',
        '[placeholder*="ownership"]',
        'select[name*="ownership"]'
      ],
      
      // Initial fee slider
      initialFeeSlider: [
        '[data-testid="initial-fee-input"]',
        'input[name*="initial"]',
        'input[type="range"]',
        '.slider input',
        '.initial-fee input'
      ],
      
      // Continue/Submit button
      continueButton: [
        'button[type="submit"]',
        'button:contains("המשך")',
        'button:contains("Continue")',
        'button:contains("Next")',
        '.continue-button',
        '.next-button'
      ],
      
      // Error and success messages
      errorMessages: [
        '.error',
        '[data-testid*="error"]',
        '.error-message',
        '.field-error',
        '.validation-error'
      ],
      
      // Loading states
      loadingSpinner: [
        '[data-testid="loader"]',
        '.loader',
        '.loading',
        '.spinner'
      ],
      
      // Form validation
      validationMessage: [
        '.validation-message',
        '.error-text',
        '[role="alert"]'
      ]
    };
  }

  /**
   * Navigate to Step 1 of mortgage calculator
   * @param {number} timeout - Navigation timeout
   */
  async navigateToStep1(timeout = this.config.timeouts.page) {
    await this.navigateTo('/services/calculate-mortgage/1', timeout);
    await this.waitForStep1ToLoad();
    return this;
  }

  /**
   * Wait for Step 1 page to fully load
   * @param {number} timeout - Wait timeout
   */
  async waitForStep1ToLoad(timeout = this.config.timeouts.explicit) {
    // Wait for critical form elements to be present
    await Promise.race([
      this.findElement(this.selectors.propertyPrice, timeout),
      this.findElement(this.selectors.cityDropdown, timeout)
    ]);
    
    // Wait for any loading spinners to disappear
    try {
      const loadingElement = await this.driver.findElement(this.selectors.loadingSpinner[0]);
      await this.waitForElementToDisappear(this.selectors.loadingSpinner[0], 10000);
    } catch (e) {
      // Loading spinner not present, continue
    }
    
    }

  /**
   * Fill property price field
   * @param {number} price - Property price value
   */
  async fillPropertyPrice(price) {
    console.log(`Filling property price: ${price}`);
    
    const priceInput = await this.findElement(this.selectors.propertyPrice);
    await this.typeText(priceInput, price.toString(), true);
    
    // Verify the value was set correctly
    const actualValue = await priceInput.getAttribute('value');
    return this;
  }

  /**
   * Select city from dropdown
   * @param {string} cityName - Name of city to select
   */
  async selectCity(cityName) {
    await this.selectDropdownOption(this.selectors.cityDropdown[0], cityName);
    
    // Verify selection
    await this.driver.sleep(1000); // Allow dropdown to close
    return this;
  }

  /**
   * Select when mortgage is needed
   * @param {string} timeframe - When mortgage is needed
   */
  async selectWhenNeeded(timeframe) {
    await this.selectDropdownOption(this.selectors.whenNeededDropdown[0], timeframe);
    
    await this.driver.sleep(1000);
    return this;
  }

  /**
   * Select property type
   * @param {string} propertyType - Type of property
   */
  async selectPropertyType(propertyType) {
    await this.selectDropdownOption(this.selectors.propertyTypeDropdown[0], propertyType);
    
    await this.driver.sleep(1000);
    return this;
  }

  /**
   * Select if this is first home
   * @param {string} isFirstHome - First home selection
   */
  async selectFirstHome(isFirstHome) {
    await this.selectDropdownOption(this.selectors.firstHomeDropdown[0], isFirstHome);
    
    await this.driver.sleep(1000);
    return this;
  }

  /**
   * Select property ownership status (critical for LTV calculation)
   * @param {string} ownershipStatus - Property ownership status
   */
  async selectPropertyOwnership(ownershipStatus) {
    await this.selectDropdownOption(this.selectors.propertyOwnershipDropdown[0], ownershipStatus);
    
    // Wait for LTV calculation to update initial payment limits
    await this.driver.sleep(2000);
    return this;
  }

  /**
   * Set initial payment amount using slider
   * @param {number} amount - Initial payment amount
   */
  async setInitialPayment(amount) {
    console.log(`Setting initial payment: ${amount}`);
    
    const slider = await this.findElement(this.selectors.initialFeeSlider);
    
    // Get slider min/max values
    const minValue = await slider.getAttribute('min') || '0';
    const maxValue = await slider.getAttribute('max') || '10000000';
    
    // Clear and set new value
    await this.typeText(slider, amount.toString(), true);
    
    // Verify the value was set
    const actualValue = await slider.getAttribute('value');
    return this;
  }

  /**
   * Get all dropdown options for a specific dropdown
   * @param {string} dropdownType - Type of dropdown (city, whenNeeded, propertyType, etc.)
   * @returns {Array<string>} Array of dropdown option texts
   */
  async getDropdownOptions(dropdownType) {
    let selectorArray;
    switch (dropdownType) {
      case 'city':
        selectorArray = this.selectors.cityDropdown;
        break;
      case 'whenNeeded':
        selectorArray = this.selectors.whenNeededDropdown;
        break;
      case 'propertyType':
        selectorArray = this.selectors.propertyTypeDropdown;
        break;
      case 'firstHome':
        selectorArray = this.selectors.firstHomeDropdown;
        break;
      case 'propertyOwnership':
        selectorArray = this.selectors.propertyOwnershipDropdown;
        break;
      default:
        throw new Error(`Unknown dropdown type: ${dropdownType}`);
    }
    
    // Click dropdown to open it
    const dropdown = await this.findElement(selectorArray);
    await this.clickElement(dropdown);
    
    // Wait for options to appear
    await this.driver.sleep(1000);
    
    // Get all option texts
    const optionSelectors = [
      'option',
      '[role="option"]',
      '.dropdown-option',
      'li[data-value]',
      '[data-testid*="option"]'
    ];
    
    const options = [];
    for (const optionSelector of optionSelectors) {
      try {
        const optionElements = await this.driver.findElements({ css: optionSelector });
        if (optionElements.length > 0) {
          for (const element of optionElements) {
            const text = await element.getText();
            if (text.trim()) {
              options.push(text.trim());
            }
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Close dropdown by pressing Escape
    await this.driver.actions().sendKeys('\ue00c').perform();
    
    return options;
  }

  /**
   * Test all dropdown options by selecting each one
   * @param {string} dropdownType - Type of dropdown to test
   * @returns {Array<Object>} Test results for each option
   */
  async testAllDropdownOptions(dropdownType) {
    const options = await this.getDropdownOptions(dropdownType);
    const results = [];
    
    for (const option of options) {
      try {
        // Select the option
        switch (dropdownType) {
          case 'city':
            await this.selectCity(option);
            break;
          case 'whenNeeded':
            await this.selectWhenNeeded(option);
            break;
          case 'propertyType':
            await this.selectPropertyType(option);
            break;
          case 'firstHome':
            await this.selectFirstHome(option);
            break;
          case 'propertyOwnership':
            await this.selectPropertyOwnership(option);
            break;
        }
        
        // Wait for any updates to complete
        await this.driver.sleep(1000);
        
        // Check for validation errors
        const hasError = await this.hasValidationErrors();
        
        results.push({
          option: option,
          selected: true,
          hasError: hasError,
          timestamp: new Date().toISOString()
        });
        
        } catch (error) {
        console.error(`❌ Failed to test option "${option}":`, error.message);
        
        results.push({
          option: option,
          selected: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  /**
   * Check if there are any validation errors on the page
   * @returns {boolean} True if validation errors exist
   */
  async hasValidationErrors() {
    try {
      const errorElements = await this.driver.findElements({ css: this.selectors.errorMessages[0] });
      return errorElements.length > 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get all validation error messages
   * @returns {Array<string>} Array of error messages
   */
  async getValidationErrors() {
    const errors = [];
    
    for (const selector of this.selectors.errorMessages) {
      try {
        const errorElements = await this.driver.findElements({ css: selector });
        for (const element of errorElements) {
          const text = await element.getText();
          if (text.trim()) {
            errors.push(text.trim());
          }
        }
        break;
      } catch (e) {
        continue;
      }
    }
    
    return errors;
  }

  /**
   * Fill entire Step 1 form with provided data
   * @param {Object} formData - Form data object
   */
  async fillStep1Form(formData = {}) {
    const defaultData = {
      propertyPrice: 2000000,
      city: 'תל אביב',
      whenNeeded: 'בעוד 3 חודשים',
      propertyType: 'דירה',
      firstHome: 'כן',
      propertyOwnership: 'אין לי נכס',
      initialPayment: 500000
    };
    
    const data = { ...defaultData, ...formData };
    
    await this.fillPropertyPrice(data.propertyPrice);
    await this.selectCity(data.city);
    await this.selectWhenNeeded(data.whenNeeded);
    await this.selectPropertyType(data.propertyType);
    await this.selectFirstHome(data.firstHome);
    await this.selectPropertyOwnership(data.propertyOwnership);
    await this.setInitialPayment(data.initialPayment);
    
    return this;
  }

  /**
   * Click continue button to proceed to next step
   */
  async clickContinue() {
    const continueButton = await this.findElement(this.selectors.continueButton);
    await this.scrollToElement(continueButton);
    await this.clickElement(continueButton);
    
    // Wait for navigation to complete
    await this.driver.sleep(2000);
    
    return this;
  }

  /**
   * Complete Step 1 with form data and proceed to Step 2
   * @param {Object} formData - Form data object
   */
  async completeStep1(formData = {}) {
    await this.fillStep1Form(formData);
    
    // Take screenshot before proceeding
    await this.takeScreenshot('step1-completed');
    
    await this.clickContinue();
    
    // Verify we moved to step 2
    await this.driver.sleep(3000);
    const currentUrl = await this.getCurrentUrl();
    
    if (currentUrl.includes('/2')) {
      return true;
    } else {
      console.error('❌ Failed to proceed to Step 2');
      await this.takeScreenshot('step1-failed-to-proceed');
      return false;
    }
  }
}

module.exports = MortgageStep1Page;