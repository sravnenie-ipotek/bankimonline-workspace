import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Setup for banking application specific needs
    env: {
      apiUrl: 'http://localhost:8003',
      testUser: {
        phone: '972544123456',
        name: 'Test User',
        otp: '123456' // For test environment only
      },
      bankingDefaults: {
        currency: 'ILS',
        language: 'he'
      }
    },
    
    setupNodeEvents(on, config) {
      // Add custom tasks here
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        table(message) {
          console.table(message)
          return null
        }
      })
      
      // Configure code coverage if needed
      // require('@cypress/code-coverage/task')(on, config)
      
      return config
    },
    
    // Exclude test files from being served
    excludeSpecPattern: [
      '**/*.hot-update.js',
      '**/__snapshots__/*',
      '**/__image_snapshots__/*'
    ],
    
    // Test file patterns
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
    
    // Support file
    supportFile: 'cypress/support/e2e.ts',
    
    // Retry configuration for flaky tests
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
})