import { defineConfig } from 'cypress'
import * as fs from 'fs'
import * as path from 'path'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    trashAssetsBeforeRuns: false,
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
      // Create timestamped folder for screenshots
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
      const runFolder = `run-${timestamp}`
      const screenshotsPath = path.join(config.screenshotsFolder, runFolder)
      
      // Update config with new screenshots folder
      config.screenshotsFolder = screenshotsPath
      
      // Ensure the directory exists
      if (!fs.existsSync(screenshotsPath)) {
        fs.mkdirSync(screenshotsPath, { recursive: true })
      }
      
      // Add custom tasks here
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        table(message) {
          console.table(message)
          return null
        },
        getScreenshotFolder() {
          return screenshotsPath
        }
      })
      
      // Custom screenshot naming
      on('after:screenshot', (details) => {
        // Create a more descriptive filename
        const testName = details.specName.replace(/\.cy\.(ts|js)$/, '')
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
        const newFileName = `${testName}_${details.name}_${timestamp}.png`
        const newPath = path.join(path.dirname(details.path), newFileName)
        
        // Rename the screenshot
        fs.renameSync(details.path, newPath)
        
        // Update the details object
        details.path = newPath
        details.name = newFileName
        
        console.log(`Screenshot saved: ${newPath}`)
        
        return details
      })
      
      // Log the screenshot folder at the start of the run
      on('before:run', () => {
        console.log(`\n📸 Screenshots will be saved to: ${screenshotsPath}\n`)
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