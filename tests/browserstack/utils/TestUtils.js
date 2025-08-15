/**
 * Test Utilities for BrowserStack Mortgage Calculator Tests
 * Common utility functions for test automation
 */

const fs = require('fs');
const path = require('path');

class TestUtils {
  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   */
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Generate timestamp string
   * @param {Date} date - Date object (default: now)
   * @returns {string} Timestamp string
   */
  static getTimestamp(date = new Date()) {
    return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }
  
  /**
   * Format currency value
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency symbol
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount, currency = '₪') {
    return `${amount.toLocaleString('he-IL')} ${currency}`;
  }
  
  /**
   * Generate random string
   * @param {number} length - Length of string
   * @param {string} charset - Character set to use
   * @returns {string} Random string
   */
  static generateRandomString(length = 8, charset = 'abcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
  
  /**
   * Generate test email
   * @param {string} prefix - Email prefix
   * @returns {string} Test email address
   */
  static generateTestEmail(prefix = 'test') {
    const timestamp = Date.now();
    const randomString = this.generateRandomString(4);
    return `${prefix}-${timestamp}-${randomString}@example.com`;
  }
  
  /**
   * Generate Israeli phone number
   * @returns {string} Valid Israeli phone number
   */
  static generateIsraeliPhone() {
    const prefixes = ['050', '052', '053', '054', '055', '058'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `${prefix}${number}`;
  }
  
  /**
   * Calculate expected LTV based on property ownership
   * @param {string} ownershipStatus - Property ownership status
   * @returns {number} Expected LTV ratio (0-1)
   */
  static getExpectedLTV(ownershipStatus) {
    const ltvRatios = {
      'אין לי נכס': 0.75,      // No property: 75% LTV
      'יש לי נכס': 0.50,       // Has property: 50% LTV
      'אני מוכר נכס': 0.70     // Selling property: 70% LTV
    };
    
    return ltvRatios[ownershipStatus] || 0.75; // Default to no property
  }
  
  /**
   * Calculate minimum down payment
   * @param {number} propertyValue - Property value
   * @param {string} ownershipStatus - Property ownership status
   * @returns {number} Minimum down payment required
   */
  static calculateMinDownPayment(propertyValue, ownershipStatus) {
    const ltvRatio = this.getExpectedLTV(ownershipStatus);
    const maxLoan = propertyValue * ltvRatio;
    return propertyValue - maxLoan;
  }
  
  /**
   * Validate Israeli ID number (basic validation)
   * @param {string} id - Israeli ID number
   * @returns {boolean} True if valid format
   */
  static validateIsraeliId(id) {
    if (!/^\d{9}$/.test(id)) {
      return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      let digit = parseInt(id[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(id[8]);
  }
  
  /**
   * Extract numbers from text
   * @param {string} text - Text containing numbers
   * @returns {number} Extracted number
   */
  static extractNumber(text) {
    const match = text.match(/[\d,]+/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
  }
  
  /**
   * Wait for condition with timeout
   * @param {Function} condition - Function that returns boolean
   * @param {number} timeout - Timeout in milliseconds
   * @param {number} interval - Check interval in milliseconds
   * @returns {Promise<boolean>} True if condition met within timeout
   */
  static async waitForCondition(condition, timeout = 10000, interval = 500) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        if (await condition()) {
          return true;
        }
      } catch (error) {
        // Ignore errors during condition checking
      }
      
      await this.sleep(interval);
    }
    
    return false;
  }
  
  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise<any>} Result of function
   */
  static async retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
  
  /**
   * Capture test evidence (screenshot, data, etc.)
   * @param {Object} evidence - Evidence data
   * @param {string} testName - Name of test
   * @param {string} basePath - Base path for evidence files
   */
  static async captureEvidence(evidence, testName, basePath = './reports/evidence') {
    const timestamp = this.getTimestamp();
    const evidencePath = path.join(basePath, `${testName}-${timestamp}`);
    
    // Ensure directory exists
    if (!fs.existsSync(evidencePath)) {
      fs.mkdirSync(evidencePath, { recursive: true });
    }
    
    // Save evidence data as JSON
    const dataFile = path.join(evidencePath, 'test-evidence.json');
    fs.writeFileSync(dataFile, JSON.stringify(evidence, null, 2));
    
    return evidencePath;
  }
  
  /**
   * Compare two values with tolerance
   * @param {number} actual - Actual value
   * @param {number} expected - Expected value
   * @param {number} tolerance - Tolerance percentage (0-1)
   * @returns {boolean} True if within tolerance
   */
  static isWithinTolerance(actual, expected, tolerance = 0.05) {
    const diff = Math.abs(actual - expected);
    const maxDiff = expected * tolerance;
    return diff <= maxDiff;
  }
  
  /**
   * Generate test report summary
   * @param {Array} testResults - Array of test results
   * @returns {Object} Summary statistics
   */
  static generateTestSummary(testResults) {
    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'passed').length;
    const failed = testResults.filter(r => r.status === 'failed').length;
    const skipped = testResults.filter(r => r.status === 'skipped').length;
    
    const durations = testResults.map(r => r.duration || 0);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / total;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    
    return {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      avgDuration: Math.round(avgDuration),
      maxDuration,
      minDuration,
      totalDuration: durations.reduce((a, b) => a + b, 0)
    };
  }
  
  /**
   * Log test step with formatting
   * @param {string} step - Step description
   * @param {string} status - Step status (info, success, warning, error)
   * @param {any} data - Additional data to log
   */
  static logStep(step, status = 'info', data = null) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      start: '🚀',
      end: '🏁'
    };
    
    const icon = icons[status] || 'ℹ️';
    if (data) {
      }
  }
  
  /**
   * Create test context with browser and environment info
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @returns {Promise<Object>} Test context object
   */
  static async createTestContext(driver) {
    const capabilities = await driver.getCapabilities();
    const currentUrl = await driver.getCurrentUrl();
    
    return {
      browser: {
        name: capabilities.get('browserName'),
        version: capabilities.get('browserVersion') || capabilities.get('version'),
        platform: capabilities.get('platformName') || capabilities.get('platform')
      },
      session: {
        id: capabilities.get('webdriver.remote.sessionid'),
        currentUrl: currentUrl,
        timestamp: new Date().toISOString()
      },
      environment: {
        testEnv: process.env.TEST_ENV || 'local',
        nodeVersion: process.version,
        platform: process.platform
      }
    };
  }
  
  /**
   * Sanitize filename for cross-platform compatibility
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }
  
  /**
   * Generate unique test identifier
   * @param {string} testName - Test name
   * @param {string} browser - Browser name
   * @returns {string} Unique identifier
   */
  static generateTestId(testName, browser = 'unknown') {
    const sanitizedName = this.sanitizeFilename(testName);
    const timestamp = Date.now();
    return `${sanitizedName}-${browser}-${timestamp}`;
  }
  
  /**
   * Check if running in CI environment
   * @returns {boolean} True if in CI
   */
  static isCI() {
    return !!(
      process.env.CI ||
      process.env.GITHUB_ACTIONS ||
      process.env.JENKINS_URL ||
      process.env.BUILDKITE ||
      process.env.CIRCLECI
    );
  }
  
  /**
   * Get test execution metadata
   * @returns {Object} Metadata object
   */
  static getExecutionMetadata() {
    return {
      timestamp: new Date().toISOString(),
      environment: process.env.TEST_ENV || 'local',
      browser: process.env.BROWSER || 'unknown',
      isCI: this.isCI(),
      nodeVersion: process.version,
      platform: process.platform,
      user: process.env.USER || process.env.USERNAME || 'unknown',
      buildId: process.env.BUILD_ID || process.env.GITHUB_RUN_ID || 'local'
    };
  }
}

module.exports = TestUtils;