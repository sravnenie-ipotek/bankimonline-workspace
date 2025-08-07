/**
 * BrowserStack Capabilities Configuration
 * Professional QA Automation Suite for Mortgage Calculator
 */

const baseCapabilities = {
  'bstack:options': {
    'userName': process.env.BROWSERSTACK_USERNAME || 'qabankimonline@gmail.com',
    'accessKey': process.env.BROWSERSTACK_ACCESS_KEY || '1sPgh89g81AybDayLQtz',
    'buildName': process.env.BUILD_NAME || 'BankiMonline-MortgageCalculator-Manual',
    'projectName': 'BankiMonline Banking Platform',
    'buildTag': process.env.BUILD_TAG || 'mortgage-calculator-automation',
    'sessionName': 'Mortgage Calculator E2E Tests',
    
    // Debugging and monitoring
    'debug': true,
    'console': 'errors',
    'networkLogs': true,
    'seleniumLogs': true,
    'video': true,
    'screenshots': true,
    
    // Performance settings
    'seleniumVersion': '4.15.0',
    'idleTimeout': 300,
    'connectionTimeout': 90,
    
    // Network simulation for performance testing
    'networkProfile': process.env.NETWORK_PROFILE || 'high-speed',
    
    // Timezone for consistent test execution
    'timezone': 'UTC',
    
    // Test metadata
    'custom': {
      'testSuite': 'mortgage-calculator',
      'version': '1.0.0',
      'environment': process.env.TEST_ENV || 'local'
    }
  }
};

const capabilities = {
  // Desktop browsers for comprehensive testing
  desktop: {
    'chrome-latest': {
      'browserName': 'Chrome',
      'browserVersion': 'latest',
      'os': 'Windows',
      'osVersion': '11',
      'bstack:options': {
        ...baseCapabilities['bstack:options'],
        'sessionName': 'Chrome Latest - Mortgage Calculator',
        'resolution': '1920x1080'
      }
    },
    
    'firefox-latest': {
      'browserName': 'Firefox',
      'browserVersion': 'latest',
      'os': 'Windows',
      'osVersion': '10',
      'bstack:options': {
        ...baseCapabilities['bstack:options'],
        'sessionName': 'Firefox Latest - Mortgage Calculator',
        'resolution': '1920x1080'
      }
    },
    
    'safari-latest': {
      'browserName': 'Safari',
      'browserVersion': 'latest',
      'os': 'OS X',
      'osVersion': 'Ventura',
      'bstack:options': {
        ...baseCapabilities['bstack:options'],
        'sessionName': 'Safari Latest - Mortgage Calculator',
        'resolution': '1920x1080'
      }
    },
    
    'edge-latest': {
      'browserName': 'Edge',
      'browserVersion': 'latest',
      'os': 'Windows',
      'osVersion': '11',
      'bstack:options': {
        ...baseCapabilities['bstack:options'],
        'sessionName': 'Edge Latest - Mortgage Calculator',
        'resolution': '1920x1080'
      }
    }
  },
  
  // Mobile devices for responsive testing
  mobile: {
    'iphone-14-pro': {
      'deviceName': 'iPhone 14 Pro',
      'platformName': 'iOS',
      'platformVersion': '16',
      'browserName': 'Safari',
      'bstack:options': {
        ...baseCapabilities['bstack:options'],
        'sessionName': 'iPhone 14 Pro - Mortgage Calculator',
        'realMobile': true,
        'deviceOrientation': 'portrait',
        'networkProfile': '4g'
      }
    },
    
    'samsung-s23': {
      'deviceName': 'Samsung Galaxy S23',
      'platformName': 'android',
      'platformVersion': '13.0',
      'browserName': 'chrome',
      'bstack:options': {
        ...baseCapabilities['bstack:options'],
        'sessionName': 'Samsung S23 - Mortgage Calculator',
        'realMobile': true,
        'deviceOrientation': 'portrait',
        'networkProfile': '4g'
      }
    },
    
    'ipad-pro': {
      'deviceName': 'iPad Pro 12.9 2022',
      'platformName': 'iOS',
      'platformVersion': '16',
      'browserName': 'Safari',
      'bstack:options': {
        ...baseCapabilities['bstack:options'],
        'sessionName': 'iPad Pro - Mortgage Calculator',
        'realMobile': true,
        'deviceOrientation': 'portrait'
      }
    }
  },
  
  // Performance testing configurations
  performance: {
    'chrome-slow-network': {
      'browserName': 'Chrome',
      'browserVersion': 'latest',
      'os': 'Windows',
      'osVersion': '11',
      'bstack:options': {
        ...baseCapabilities['bstack:options'],
        'sessionName': 'Chrome Slow Network - Performance Test',
        'networkProfile': '3g',
        'resolution': '1920x1080'
      }
    },
    
    'mobile-2g': {
      'deviceName': 'Samsung Galaxy S22',
      'platformName': 'android',
      'platformVersion': '12.0',
      'browserName': 'chrome',
      'bstack:options': {
        ...baseCapabilities['bstack:options'],
        'sessionName': 'Mobile 2G Network - Performance Test',
        'realMobile': true,
        'networkProfile': '2g',
        'deviceOrientation': 'portrait'
      }
    }
  }
};

/**
 * Get capability by browser key
 * @param {string} browserKey - Browser configuration key
 * @returns {Object} Browser capability configuration
 */
const getCapability = (browserKey) => {
  // Check desktop browsers
  if (capabilities.desktop[browserKey]) {
    return capabilities.desktop[browserKey];
  }
  
  // Check mobile browsers
  if (capabilities.mobile[browserKey]) {
    return capabilities.mobile[browserKey];
  }
  
  // Check performance browsers
  if (capabilities.performance[browserKey]) {
    return capabilities.performance[browserKey];
  }
  
  // Default to Chrome if not found
  console.warn(`Browser configuration '${browserKey}' not found. Using chrome-latest as default.`);
  return capabilities.desktop['chrome-latest'];
};

/**
 * Get all capabilities for parallel execution
 * @param {string} category - Category of browsers (desktop, mobile, performance, all)
 * @returns {Array} Array of capability configurations
 */
const getAllCapabilities = (category = 'all') => {
  switch (category) {
    case 'desktop':
      return Object.values(capabilities.desktop);
    case 'mobile':
      return Object.values(capabilities.mobile);
    case 'performance':
      return Object.values(capabilities.performance);
    case 'all':
      return [
        ...Object.values(capabilities.desktop),
        ...Object.values(capabilities.mobile)
      ];
    default:
      return Object.values(capabilities.desktop);
  }
};

/**
 * Create custom capability with overrides
 * @param {string} baseKey - Base browser configuration key
 * @param {Object} overrides - Capability overrides
 * @returns {Object} Custom capability configuration
 */
const createCustomCapability = (baseKey, overrides = {}) => {
  const baseCap = getCapability(baseKey);
  return {
    ...baseCap,
    'bstack:options': {
      ...baseCap['bstack:options'],
      ...overrides
    }
  };
};

module.exports = {
  capabilities,
  getCapability,
  getAllCapabilities,
  createCustomCapability,
  baseCapabilities
};