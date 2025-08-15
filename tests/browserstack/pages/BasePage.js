/**
 * Base Page Object for BrowserStack Mortgage Calculator Tests
 * Contains common functionality shared across all pages
 */

const { By, until } = require('selenium-webdriver');
const config = require('../config/test-config');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.config = config;
  }

  /**
   * Navigate to a specific URL
   * @param {string} path - URL path to navigate to
   * @param {number} timeout - Timeout in milliseconds
   */
  async navigateTo(path = '', timeout = this.config.timeouts.page) {
    const url = this.config.getUrl(path);
    await this.driver.manage().setTimeouts({
      pageLoad: timeout,
      script: this.config.timeouts.script
    });
    
    await this.driver.get(url);
    await this.waitForPageLoad();
    
    return this;
  }

  /**
   * Wait for page to fully load
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForPageLoad(timeout = this.config.timeouts.page) {
    // Wait for document ready state
    await this.driver.wait(async () => {
      const readyState = await this.driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, timeout, 'Page did not finish loading within timeout');

    // Wait for React to initialize (look for React root)
    await this.driver.wait(async () => {
      try {
        const hasReact = await this.driver.executeScript(`
          return !!(window.React || document.querySelector('[data-reactroot]') || 
                   document.querySelector('#root') || 
                   document.querySelector('[data-testid]'));
        `);
        return hasReact;
      } catch (e) {
        return false;
      }
    }, 10000, 'React application did not initialize');

    }

  /**
   * Find element with multiple selector strategies
   * @param {string|Array} selectors - CSS selector(s) to try
   * @param {number} timeout - Timeout in milliseconds
   * @returns {WebElement} Found element
   */
  async findElement(selectors, timeout = this.config.timeouts.explicit) {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    
    for (const selector of selectorArray) {
      try {
        const element = await this.driver.wait(
          until.elementLocated(By.css(selector)), 
          timeout / selectorArray.length
        );
        
        // Wait for element to be visible
        await this.driver.wait(until.elementIsVisible(element), 5000);
        return element;
      } catch (error) {
        if (selector === selectorArray[selectorArray.length - 1]) {
          // This was the last selector, throw the error
          throw new Error(`Element not found with any of the selectors: ${selectorArray.join(', ')}`);
        }
        // Try next selector
        continue;
      }
    }
  }

  /**
   * Find multiple elements
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Array<WebElement>} Array of found elements
   */
  async findElements(selector, timeout = this.config.timeouts.explicit) {
    await this.driver.wait(
      until.elementLocated(By.css(selector)), 
      timeout
    );
    
    const elements = await this.driver.findElements(By.css(selector));
    return elements;
  }

  /**
   * Wait for element to be clickable and click
   * @param {string|WebElement} elementOrSelector - Element or selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async clickElement(elementOrSelector, timeout = this.config.timeouts.explicit) {
    let element;
    
    if (typeof elementOrSelector === 'string') {
      element = await this.findElement(elementOrSelector, timeout);
    } else {
      element = elementOrSelector;
    }
    
    // Wait for element to be clickable
    await this.driver.wait(until.elementIsEnabled(element), timeout);
    
    // Scroll element into view
    await this.driver.executeScript('arguments[0].scrollIntoView({block: "center"});', element);
    await this.driver.sleep(500); // Allow scroll to complete
    
    // Click the element
    await element.click();
    }

  /**
   * Type text into an input field
   * @param {string|WebElement} elementOrSelector - Element or selector
   * @param {string} text - Text to type
   * @param {boolean} clearFirst - Whether to clear field first
   */
  async typeText(elementOrSelector, text, clearFirst = true) {
    let element;
    
    if (typeof elementOrSelector === 'string') {
      element = await this.findElement(elementOrSelector);
    } else {
      element = elementOrSelector;
    }
    
    if (clearFirst) {
      await element.clear();
    }
    
    await element.sendKeys(text.toString());
    }

  /**
   * Select option from dropdown
   * @param {string} dropdownSelector - Dropdown selector
   * @param {string} optionText - Option text to select
   * @param {number} timeout - Timeout in milliseconds
   */
  async selectDropdownOption(dropdownSelector, optionText, timeout = this.config.timeouts.explicit) {
    // Click dropdown to open
    const dropdown = await this.findElement(dropdownSelector);
    await this.clickElement(dropdown);
    
    // Wait for options to appear and select the one with matching text
    const optionSelectors = [
      `${dropdownSelector} option:contains("${optionText}")`,
      `[data-testid*="option"]:contains("${optionText}")`,
      `li:contains("${optionText}")`,
      `.dropdown-option:contains("${optionText}")`,
      `[role="option"]:contains("${optionText}")`
    ];
    
    // Try multiple strategies to find and click the option
    for (const optionSelector of optionSelectors) {
      try {
        const option = await this.driver.wait(
          until.elementLocated(By.css(optionSelector)),
          timeout / optionSelectors.length
        );
        await this.clickElement(option);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error(`Could not select dropdown option: ${optionText}`);
  }

  /**
   * Wait for element to contain specific text
   * @param {string} selector - Element selector
   * @param {string} expectedText - Expected text content
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForText(selector, expectedText, timeout = this.config.timeouts.explicit) {
    await this.driver.wait(async () => {
      try {
        const element = await this.driver.findElement(By.css(selector));
        const text = await element.getText();
        return text.includes(expectedText);
      } catch (e) {
        return false;
      }
    }, timeout, `Text "${expectedText}" not found in element within timeout`);
    
    }

  /**
   * Take screenshot for debugging
   * @param {string} filename - Screenshot filename
   * @returns {string} Screenshot path
   */
  async takeScreenshot(filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `${filename}-${timestamp}.png`;
    const screenshotPath = `${this.config.screenshots.directory}/${screenshotName}`;
    
    try {
      const screenshot = await this.driver.takeScreenshot();
      const fs = require('fs');
      const path = require('path');
      
      // Ensure directory exists
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(screenshotPath, screenshot, 'base64');
      return screenshotPath;
    } catch (error) {
      console.error('❌ Failed to take screenshot:', error.message);
      return null;
    }
  }

  /**
   * Get current page title
   * @returns {string} Page title
   */
  async getPageTitle() {
    const title = await this.driver.getTitle();
    return title;
  }

  /**
   * Get current URL
   * @returns {string} Current URL
   */
  async getCurrentUrl() {
    const url = await this.driver.getCurrentUrl();
    return url;
  }

  /**
   * Check if element exists
   * @param {string} selector - Element selector
   * @returns {boolean} True if element exists
   */
  async isElementPresent(selector) {
    try {
      await this.driver.findElement(By.css(selector));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for element to disappear
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElementToDisappear(selector, timeout = this.config.timeouts.explicit) {
    await this.driver.wait(async () => {
      try {
        const elements = await this.driver.findElements(By.css(selector));
        return elements.length === 0;
      } catch (e) {
        return true;
      }
    }, timeout, `Element did not disappear within timeout: ${selector}`);
    
    }

  /**
   * Get element text
   * @param {string|WebElement} elementOrSelector - Element or selector
   * @returns {string} Element text
   */
  async getElementText(elementOrSelector) {
    let element;
    
    if (typeof elementOrSelector === 'string') {
      element = await this.findElement(elementOrSelector);
    } else {
      element = elementOrSelector;
    }
    
    const text = await element.getText();
    return text;
  }

  /**
   * Execute JavaScript code
   * @param {string} script - JavaScript code to execute
   * @param {...any} args - Arguments to pass to script
   * @returns {any} Script return value
   */
  async executeScript(script, ...args) {
    console.log(`Executing script with ${args.length} args`);
    return await this.driver.executeScript(script, ...args);
  }

  /**
   * Scroll to element
   * @param {string|WebElement} elementOrSelector - Element or selector to scroll to
   */
  async scrollToElement(elementOrSelector) {
    let element;
    
    if (typeof elementOrSelector === 'string') {
      element = await this.findElement(elementOrSelector);
    } else {
      element = elementOrSelector;
    }
    
    await this.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', element);
    await this.driver.sleep(1000); // Allow smooth scroll to complete
    }
}

module.exports = BasePage;