#!/usr/bin/env node

/**
 * BrowserStack Configuration for All Non-Localhost URLs
 * Comprehensive mobile testing for production, staging, previews, tunnels
 */

const BROWSERSTACK_CONFIG = {
  // Credentials
  username: process.env.BROWSERSTACK_USERNAME || 'bankim_bDR9eZP4Bb2',
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY || 'DwWqjFesqgUNTZqrddhV',
  
  // Hub URL
  hubUrl: 'https://hub-cloud.browserstack.com/wd/hub',
  
  // Supported URL patterns (ALL non-localhost)
  supportedUrls: {
    production: [
      /^https:\/\/.*\.railway\.app/,
      /^https:\/\/.*\.vercel\.app/,
      /^https:\/\/.*\.netlify\.app/,
      /^https:\/\/.*\.herokuapp\.com/,
      /^https:\/\/.*\.onrender\.com/
    ],
    staging: [
      /^https:\/\/staging-.*\./,
      /^https:\/\/.*-staging\./,
      /^https:\/\/dev-.*\./,
      /^https:\/\/.*-dev\./
    ],
    preview: [
      /^https:\/\/deploy-preview-.*\.netlify\.app/,
      /^https:\/\/.*--preview\.vercel\.app/,
      /^https:\/\/pr-\d+-.*\./
    ],
    tunnel: [
      /^https:\/\/.*\.ngrok\.io/,
      /^https:\/\/.*\.tunnelto\.dev/,
      /^https:\/\/.*\.localtunnel\.me/
    ],
    custom: [
      /^https:\/\/[^\/]+/, // Any HTTPS URL
      /^http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)[^\/]+/ // HTTP (non-localhost)
    ]
  },
  
  // Critical mobile devices for banking testing
  devices: {
    // iPhone devices (iOS Safari)
    ios: [
      {
        name: 'iPhone 15 Pro',
        os: 'ios',
        osVersion: '17',
        deviceName: 'iPhone 15 Pro',
        browserName: 'safari',
        viewport: { width: 393, height: 852 },
        critical: true,
        note: 'Latest iPhone - primary testing device'
      },
      {
        name: 'iPhone 14',
        os: 'ios',
        osVersion: '16', 
        deviceName: 'iPhone 14',
        browserName: 'safari',
        viewport: { width: 390, height: 844 },
        critical: true,
        note: 'Popular iPhone model'
      },
      {
        name: 'iPhone SE 2022',
        os: 'ios',
        osVersion: '15',
        deviceName: 'iPhone SE 2022', 
        browserName: 'safari',
        viewport: { width: 375, height: 667 },
        critical: true,
        note: 'Smallest screen - most likely to show button overflow'
      },
      {
        name: 'iPhone 13 Pro Max',
        os: 'ios',
        osVersion: '15',
        deviceName: 'iPhone 13 Pro Max',
        browserName: 'safari',
        viewport: { width: 428, height: 926 },
        critical: false,
        note: 'Large screen testing'
      }
    ],
    
    // Android devices (Chrome)
    android: [
      {
        name: 'Samsung Galaxy S23',
        os: 'android',
        osVersion: '13.0',
        deviceName: 'Samsung Galaxy S23',
        browserName: 'chrome',
        viewport: { width: 360, height: 780 },
        critical: true,
        note: 'Latest Android flagship'
      },
      {
        name: 'Samsung Galaxy S21',
        os: 'android', 
        osVersion: '12.0',
        deviceName: 'Samsung Galaxy S21',
        browserName: 'chrome',
        viewport: { width: 360, height: 800 },
        critical: true,
        note: 'Popular Android device'
      },
      {
        name: 'Google Pixel 7',
        os: 'android',
        osVersion: '13.0',
        deviceName: 'Google Pixel 7',
        browserName: 'chrome', 
        viewport: { width: 393, height: 851 },
        critical: false,
        note: 'Pure Android experience'
      }
    ]
  },
  
  // Banking application test paths
  testPaths: [
    {
      path: '/',
      name: 'Homepage',
      description: 'Main landing page with navigation',
      critical: true
    },
    {
      path: '/services/calculate-mortgage/1',
      name: 'Mortgage Calculator Step 1', 
      description: 'Property value and ownership form',
      critical: true,
      expectedButtons: ['המשך', 'שמור והמשך']
    },
    {
      path: '/services/calculate-mortgage/2',
      name: 'Mortgage Calculator Step 2',
      description: 'Personal information form', 
      critical: true,
      expectedButtons: ['המשך', 'הקודם']
    },
    {
      path: '/services/calculate-credit/1', 
      name: 'Credit Calculator Step 1',
      description: 'Credit application form',
      critical: true,
      expectedButtons: ['המשך']
    },
    {
      path: '/personal-cabinet',
      name: 'Personal Cabinet',
      description: 'User dashboard and profile',
      critical: false,
      expectedButtons: ['שמור']
    },
    {
      path: '/services/refinance-mortgage/1',
      name: 'Refinance Calculator',
      description: 'Mortgage refinancing form',
      critical: false
    }
  ],
  
  // Button detection configuration
  buttonSelectors: [
    // Primary action buttons
    'button[type="submit"]',
    '.single-button button',
    '[data-testid*="submit"]',
    '[data-testid*="continue"]',
    
    // Hebrew text buttons
    'button:contains("המשך")',      // Continue
    'button:contains("שמור")',      // Save  
    'button:contains("שמור והמשך")', // Save and Continue
    'button:contains("הקודם")',     // Previous
    'button:contains("אישור")',     // Confirm
    
    // CSS class patterns
    '[class*="button"]',
    '[class*="btn"]',
    '.mobile-button',
    '.action-button',
    '.primary-button',
    '.submit-button'
  ],
  
  // Test configuration
  testing: {
    // Timeouts
    pageLoadTimeout: 10000,
    elementWaitTimeout: 5000,
    scriptTimeout: 30000,
    
    // Mobile-specific settings
    mobile: {
      minTouchTargetSize: 44, // iOS minimum
      maxButtonOverflow: 0,   // No pixels outside viewport
      requiredPositions: ['fixed', 'sticky'], // Acceptable button positions
      maxZIndex: 10000
    },
    
    // Performance thresholds
    performance: {
      maxLoadTime: 5000,      // 5 seconds max page load
      maxRenderTime: 3000     // 3 seconds max initial render
    },
    
    // Hebrew/RTL validation
    hebrew: {
      requiredDirection: 'rtl',
      expectedFonts: ['Heebo', 'Arial'],
      currencySymbol: '₪'
    }
  },
  
  // Project settings
  project: {
    name: 'Banking App Mobile Testing',
    build: 'Button Overflow Fixes',
    tags: ['mobile', 'banking', 'hebrew', 'rtl', 'buttons']
  }
};

/**
 * Validates if URL is supported for BrowserStack testing
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, reason: 'URL is required and must be a string' };
  }
  
  // Block localhost URLs
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0')) {
    return { valid: false, reason: 'BrowserStack cannot access localhost URLs' };
  }
  
  // Check against supported patterns
  const allPatterns = [
    ...BROWSERSTACK_CONFIG.supportedUrls.production,
    ...BROWSERSTACK_CONFIG.supportedUrls.staging,
    ...BROWSERSTACK_CONFIG.supportedUrls.preview,
    ...BROWSERSTACK_CONFIG.supportedUrls.tunnel,
    ...BROWSERSTACK_CONFIG.supportedUrls.custom
  ];
  
  const isSupported = allPatterns.some(pattern => pattern.test(url));
  
  if (!isSupported) {
    return { valid: false, reason: 'URL pattern not supported. Must be HTTPS or non-localhost HTTP.' };
  }
  
  return { valid: true, reason: 'URL is valid for BrowserStack testing' };
}

/**
 * Determines environment type from URL
 */
function getEnvironmentType(url) {
  const { supportedUrls } = BROWSERSTACK_CONFIG;
  
  if (supportedUrls.production.some(pattern => pattern.test(url))) {
    return 'production';
  }
  if (supportedUrls.staging.some(pattern => pattern.test(url))) {
    return 'staging'; 
  }
  if (supportedUrls.preview.some(pattern => pattern.test(url))) {
    return 'preview';
  }
  if (supportedUrls.tunnel.some(pattern => pattern.test(url))) {
    return 'tunnel';
  }
  
  return 'custom';
}

/**
 * Gets critical devices for testing
 */
function getCriticalDevices() {
  return [
    ...BROWSERSTACK_CONFIG.devices.ios.filter(device => device.critical),
    ...BROWSERSTACK_CONFIG.devices.android.filter(device => device.critical)
  ];
}

/**
 * Gets all devices for comprehensive testing
 */
function getAllDevices() {
  return [
    ...BROWSERSTACK_CONFIG.devices.ios,
    ...BROWSERSTACK_CONFIG.devices.android
  ];
}

/**
 * Creates BrowserStack capabilities for a device
 */
function createCapabilities(device, url, sessionName = null) {
  const envType = getEnvironmentType(url);
  
  return {
    'bstack:options': {
      os: device.os,
      osVersion: device.osVersion,
      deviceName: device.deviceName,
      realMobile: 'true',
      projectName: BROWSERSTACK_CONFIG.project.name,
      buildName: `${BROWSERSTACK_CONFIG.project.build} - ${envType}`,
      sessionName: sessionName || `${device.name} - ${envType} Testing`,
      userName: BROWSERSTACK_CONFIG.username,
      accessKey: BROWSERSTACK_CONFIG.accessKey,
      debug: 'true',
      consoleLogs: 'verbose',
      networkLogs: 'true',
      tags: [...BROWSERSTACK_CONFIG.project.tags, envType]
    },
    browserName: device.browserName
  };
}

// Export configuration and utilities
module.exports = {
  BROWSERSTACK_CONFIG,
  isValidUrl,
  getEnvironmentType,
  getCriticalDevices,
  getAllDevices, 
  createCapabilities
};

// CLI usage
if (require.main === module) {
  const url = process.argv[2];
  
  if (url) {
    const validation = isValidUrl(url);
    const envType = getEnvironmentType(url);
    
    console.log(`🌐 URL: ${url}`);
    console.log(`✅ Valid: ${validation.valid}`);
    console.log(`📝 Reason: ${validation.reason}`);
    console.log(`🏷️  Environment: ${envType}`);
    console.log(`📱 Critical Devices: ${getCriticalDevices().length}`);
    console.log(`🧪 Test Paths: ${BROWSERSTACK_CONFIG.testPaths.length}`);
  } else {
    console.log('BrowserStack Configuration for Non-Localhost URLs');
    console.log('Usage: node browserstack-config.js <URL>');
    console.log('');
    console.log('Supported URL patterns:');
    console.log('✅ https://app.railway.app');
    console.log('✅ https://abc123.ngrok.io');
    console.log('✅ https://deploy-preview-123.netlify.app');
    console.log('❌ http://localhost:5173 (not supported)');
  }
}