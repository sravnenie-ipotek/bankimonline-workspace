/**
 * Test Configuration for BankiMonline Mortgage Calculator
 * Professional QA Automation Suite
 */

const path = require('path');

const config = {
  // Environment configurations
  environments: {
    local: {
      baseUrl: 'http://localhost:5173',
      apiUrl: 'http://localhost:8003',
      description: 'Local development environment'
    },
    staging: {
      baseUrl: 'https://staging.bankimonline.com',
      apiUrl: 'https://staging-api.bankimonline.com', 
      description: 'Staging environment for QA testing'
    },
    production: {
      baseUrl: 'https://admin.bankimonline.com',
      apiUrl: 'https://api.bankimonline.com',
      description: 'Production environment (read-only tests only)'
    }
  },
  
  // Current environment (from env var or default to local)
  currentEnv: process.env.TEST_ENV || 'local',
  
  // BrowserStack Hub URL
  hubUrl: 'https://hub-cloud.browserstack.com/wd/hub',
  
  // Test timeouts (in milliseconds)
  timeouts: {
    implicit: 10000,        // Implicit wait for elements
    explicit: 30000,        // Explicit wait for conditions
    page: 60000,           // Page load timeout
    script: 30000,         // Script execution timeout
    test: 120000           // Individual test timeout
  },
  
  // Retry configuration
  retries: {
    testRetries: 2,        // Number of times to retry failed tests
    beforeEachRetries: 1   // Retries for beforeEach hooks
  },
  
  // Screenshot configuration
  screenshots: {
    enabled: true,
    onFailure: true,
    onSuccess: process.env.SCREENSHOT_ON_SUCCESS === 'true',
    directory: path.join(__dirname, '../reports/screenshots'),
    format: 'png'
  },
  
  // Video recording configuration
  videos: {
    enabled: true,
    onFailure: true,
    directory: path.join(__dirname, '../reports/videos')
  },
  
  // Reporting configuration
  reporting: {
    enabled: true,
    directory: path.join(__dirname, '../reports'),
    formats: ['json', 'html', 'junit'],
    includeScreenshots: true,
    includeVideos: true
  },
  
  // Test data configuration
  testData: {
    mortgage: {
      defaultPropertyValue: 2000000,
      defaultInitialPayment: 500000,
      defaultLoanPeriod: 25,
      cities: ['תל אביב', 'ירושלים', 'חיפה', 'באר שבע'],
      testPhone: '0544123456',
      testOTP: '123456'
    },
    
    // Multi-language testing
    languages: {
      english: { code: 'en', name: 'English', rtl: false },
      hebrew: { code: 'he', name: 'עברית', rtl: true },
      russian: { code: 'ru', name: 'Русский', rtl: false }
    }
  },
  
  // Page selectors for different steps
  selectors: {
    step1: {
      propertyPrice: '[data-testid="property-price-input"]',
      cityDropdown: '[data-testid="city-dropdown"]',
      whenNeededDropdown: '[data-testid="when-needed-dropdown"]',
      propertyTypeDropdown: '[data-testid="property-type-dropdown"]',
      firstHomeDropdown: '[data-testid="first-home-dropdown"]',
      propertyOwnershipDropdown: '[data-testid="property-ownership-dropdown"]',
      initialFeeSlider: '[data-testid="initial-fee-input"]',
      continueButton: 'button[type="submit"], button:contains("המשך"), button:contains("Continue")'
    },
    
    step2: {
      firstNameInput: '[name="firstName"], [data-testid*="first-name"]',
      lastNameInput: '[name="lastName"], [data-testid*="last-name"]',
      phoneInput: '[name="phone"], [data-testid*="phone"]',
      emailInput: '[name="email"], [data-testid*="email"]',
      continueButton: 'button[type="submit"], button:contains("המשך"), button:contains("Continue")'
    },
    
    step3: {
      incomeInput: '[name="income"], [data-testid*="income"]',
      employmentDropdown: '[data-testid*="employment"]',
      continueButton: 'button[type="submit"], button:contains("המשך"), button:contains("Continue")'
    },
    
    step4: {
      bankOffers: '[data-testid*="bank-offer"], .bank-offer',
      compareButton: 'button:contains("השווה"), button:contains("Compare")',
      resultsContainer: '[data-testid="results-container"], .results-section'
    },
    
    // Common selectors
    common: {
      errorMessage: '.error, [data-testid*="error"], .error-message',
      successMessage: '.success, [data-testid*="success"], .success-message',
      loadingSpinner: '[data-testid="loader"], .loader, .loading',
      progressBar: '[data-testid="progress-bar"], .progress-bar',
      languageSelector: '[data-testid="language-selector"], .language-selector',
      mobileMenu: '[data-testid="mobile-menu"], .mobile-menu'
    }
  },
  
  // Network conditions for performance testing
  networkProfiles: {
    'high-speed': { description: 'High speed internet connection' },
    '4g': { description: '4G mobile connection' },
    '3g': { description: '3G mobile connection' },
    '2g': { description: '2G mobile connection (slow)' }
  },
  
  // Test categories for organized execution
  testCategories: {
    smoke: {
      description: 'Critical path tests for basic functionality',
      timeout: 60000
    },
    regression: {
      description: 'Full regression test suite',
      timeout: 120000
    },
    performance: {
      description: 'Performance and load time tests',
      timeout: 180000
    },
    accessibility: {
      description: 'Accessibility compliance tests',
      timeout: 90000
    },
    crossBrowser: {
      description: 'Cross-browser compatibility tests',
      timeout: 120000
    },
    mobile: {
      description: 'Mobile responsiveness tests',
      timeout: 150000
    }
  }
};

/**
 * Get current environment configuration
 * @returns {Object} Current environment config
 */
config.getCurrentEnv = () => {
  const env = config.environments[config.currentEnv];
  if (!env) {
    throw new Error(`Environment '${config.currentEnv}' not found. Available: ${Object.keys(config.environments).join(', ')}`);
  }
  return env;
};

/**
 * Get base URL for current environment
 * @returns {string} Base URL
 */
config.getBaseUrl = () => {
  return config.getCurrentEnv().baseUrl;
};

/**
 * Get API URL for current environment
 * @returns {string} API URL
 */
config.getApiUrl = () => {
  return config.getCurrentEnv().apiUrl;
};

/**
 * Get full URL for a specific path
 * @param {string} path - URL path
 * @returns {string} Full URL
 */
config.getUrl = (path = '') => {
  const baseUrl = config.getBaseUrl();
  return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
};

/**
 * Get selector with fallbacks
 * @param {string} step - Step name
 * @param {string} element - Element name
 * @returns {string} CSS selector
 */
config.getSelector = (step, element) => {
  const stepSelectors = config.selectors[step];
  if (!stepSelectors) {
    throw new Error(`Step '${step}' selectors not found`);
  }
  
  const selector = stepSelectors[element];
  if (!selector) {
    throw new Error(`Selector '${element}' not found for step '${step}'`);
  }
  
  return selector;
};

/**
 * Check if running in CI environment
 * @returns {boolean} True if in CI
 */
config.isCI = () => {
  return !!(process.env.CI || process.env.GITHUB_ACTIONS || process.env.JENKINS_URL);
};

/**
 * Get test timeout for category
 * @param {string} category - Test category
 * @returns {number} Timeout in milliseconds
 */
config.getTestTimeout = (category) => {
  return config.testCategories[category]?.timeout || config.timeouts.test;
};

module.exports = config;