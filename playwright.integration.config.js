/**
 * Playwright Integration Tests Configuration
 * 
 * Specialized configuration for API integration testing
 * Tests database connectivity, dropdown APIs, translation fallback, and calculation parameters
 */

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  // Test directory
  testDir: './tests/integration',
  
  // Test file patterns
  testMatch: '**/*.test.js',
  
  // Timeout configuration
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  
  // Run tests in parallel for faster execution
  fullyParallel: true,
  
  // Fail fast on CI environments
  forbidOnly: !!process.env.CI,
  
  // Retry configuration
  retries: process.env.CI ? 2 : 1,
  
  // Number of parallel workers
  workers: process.env.CI ? 2 : 4,
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'integration-test-results',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    ['json', { 
      outputFile: 'integration-test-results/results.json' 
    }],
    ['junit', { 
      outputFile: 'integration-test-results/junit.xml' 
    }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Global setup and teardown
  globalSetup: './tests/integration/setup/global-setup.js',
  globalTeardown: './tests/integration/setup/global-teardown.js',
  
  // Use configuration
  use: {
    // API base URL - can be overridden by environment
    baseURL: process.env.API_BASE_URL || 'http://localhost:8003',
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    
    // Ignore HTTPS errors in test environments
    ignoreHTTPSErrors: true,
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Navigation timeout  
    navigationTimeout: 20 * 1000,
    
    // Trace configuration
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    
    // Video configuration
    video: process.env.CI ? 'retain-on-failure' : 'off',
    
    // Screenshot configuration  
    screenshot: 'only-on-failure',
  },

  // Environment-specific configurations
  projects: [
    {
      name: 'Integration Tests - Development',
      use: {
        baseURL: 'http://localhost:8003',
      },
      testMatch: '**/*.test.js',
    },
    {
      name: 'Integration Tests - Staging',
      use: {
        baseURL: process.env.STAGING_API_URL || 'https://staging.bankimonline.com/api',
      },
      testMatch: '**/*.test.js',
    },
    {
      name: 'Integration Tests - Production',
      use: {
        baseURL: process.env.PROD_API_URL || 'https://bankimonline.com/api',
      },
      testMatch: '**/*.test.js',
      // Only run safe read-only tests in production
      grep: /@production/,
    }
  ],

  // Output directory
  outputDir: 'integration-test-results/',
  
  // Preserve output between runs in CI
  preserveOutput: process.env.CI ? 'always' : 'failures-only',
});