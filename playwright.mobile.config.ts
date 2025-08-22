import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Mobile Testing Configuration
 * Dedicated configuration for mobile viewport and device testing
 */
export default defineConfig({
  testDir: './tests/mobile',
  testMatch: ['**/*mobile*.spec.ts', '**/mobile/**/*.spec.ts'],
  
  /* Mobile-specific settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1, // More retries for mobile
  workers: process.env.CI ? 2 : 4,
  
  /* Reporting */
  reporter: [
    ['html', { outputFolder: 'playwright-report-mobile' }],
    ['json', { outputFile: 'test-results-mobile.json' }],
    ['list']
  ],
  
  /* Global mobile test settings */
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    
    /* Mobile-specific settings */
    actionTimeout: 15000, // Longer timeout for mobile
    navigationTimeout: 30000,
    
    /* SSL Certificate handling */
    ignoreHTTPSErrors: true, // Accept self-signed certificates
    
    /* Security context options */
    contextOptions: {
      // Accept invalid certificates for testing
      ignoreHTTPSErrors: true,
      // Bypass CSP for testing
      bypassCSP: true,
      // Additional permissions for mobile testing
      permissions: ['geolocation', 'notifications', 'camera'],
      // Geolocation for Israeli testing
      geolocation: { latitude: 32.0853, longitude: 34.7818 }, // Tel Aviv
      // Locale
      locale: 'he-IL',
    },
    
    /* Emulate mobile network conditions */
    offline: false,
    // Simulate 3G network
    // Note: This requires CDP (Chrome DevTools Protocol)
    // slow3G: true,
  },

  /* Mobile Device Projects */
  projects: [
    // === iOS Devices ===
    {
      name: 'iPhone SE',
      use: { 
        ...devices['iPhone SE'],
        locale: 'he-IL',
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'iPhone 12',
      use: { 
        ...devices['iPhone 12'],
        locale: 'he-IL',
        viewport: { width: 390, height: 844 }
      },
    },
    {
      name: 'iPhone 12 Pro Max',
      use: { 
        ...devices['iPhone 12 Pro Max'],
        locale: 'he-IL',
        viewport: { width: 428, height: 926 }
      },
    },
    {
      name: 'iPhone 13',
      use: { 
        ...devices['iPhone 13'],
        locale: 'he-IL',
        viewport: { width: 390, height: 844 }
      },
    },
    {
      name: 'iPad Mini',
      use: { 
        ...devices['iPad Mini'],
        locale: 'he-IL',
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'iPad Pro 11',
      use: { 
        ...devices['iPad Pro 11'],
        locale: 'he-IL',
        viewport: { width: 834, height: 1194 }
      },
    },

    // === Android Devices ===
    {
      name: 'Pixel 5',
      use: { 
        ...devices['Pixel 5'],
        locale: 'he-IL',
        viewport: { width: 393, height: 851 }
      },
    },
    {
      name: 'Pixel 7',
      use: { 
        ...devices['Pixel 7'],
        locale: 'he-IL',
        viewport: { width: 412, height: 915 }
      },
    },
    {
      name: 'Galaxy S9+',
      use: { 
        ...devices['Galaxy S9+'],
        locale: 'he-IL',
        viewport: { width: 412, height: 846 }
      },
    },
    {
      name: 'Galaxy S20 Ultra',
      use: {
        ...devices['Galaxy S20 Ultra'],
        locale: 'he-IL',
        viewport: { width: 412, height: 915 }
      },
    },
    {
      name: 'Galaxy Tab S4',
      use: {
        ...devices['Galaxy Tab S4'],
        locale: 'he-IL',
        viewport: { width: 712, height: 1138 }
      },
    },

    // === Landscape Orientations ===
    {
      name: 'iPhone 12 landscape',
      use: { 
        ...devices['iPhone 12 landscape'],
        locale: 'he-IL',
        viewport: { width: 844, height: 390 }
      },
    },
    {
      name: 'Pixel 5 landscape',
      use: { 
        ...devices['Pixel 5'],
        locale: 'he-IL',
        viewport: { width: 851, height: 393 },
        isMobile: true,
        hasTouch: true,
      },
    },

    // === Special Test Cases ===
    {
      name: 'Small Phone (iPhone SE)',
      use: {
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    },
    {
      name: 'Large Phone',
      use: {
        viewport: { width: 414, height: 896 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Foldable',
      use: {
        viewport: { width: 280, height: 653 }, // Galaxy Fold closed
        deviceScaleFactor: 2.5,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  /* Timeout configuration for mobile */
  timeout: 45000, // 45 seconds global timeout
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  /* Output folders */
  outputDir: 'test-results-mobile',

  /* Web servers - same as desktop but with startup check */
  webServer: [
    {
      command: 'npm run dev',
      cwd: './mainapp',
      port: 5173,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node server/server-db.js',
      port: 8003,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    }
  ],
});