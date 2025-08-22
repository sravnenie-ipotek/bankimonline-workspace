// ***********************************************************
// This file is processed and loaded automatically before test files.
// You can change the location of this file or turn off loading
// the support files with the 'supportFile' configuration option.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Percy visual testing integration
import '@percy/cypress'
import './percy-banking-commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global type definitions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login to the banking application
       * @example cy.login('972544123456', 'Test User')
       */
      login(phone: string, name: string): Chainable<void>
      
      /**
       * Custom command to select language
       * @example cy.selectLanguage('he')
       */
      selectLanguage(lang: 'en' | 'he' | 'ru'): Chainable<void>
      
      /**
       * Custom command to handle OTP verification
       * @example cy.handleOTP('123456')
       */
      handleOTP(code: string): Chainable<void>
      
      /**
       * Custom command to navigate through banking service flow
       * @example cy.navigateToService('mortgage')
       */
      navigateToService(service: 'mortgage' | 'credit' | 'refinance'): Chainable<void>
      
      /**
       * Custom command to fill form with Hebrew support
       * @example cy.fillFormField('name', 'שם מלא')
       */
      fillFormField(fieldName: string, value: string): Chainable<void>
      
      /**
       * Custom command to mock API responses
       * @example cy.mockApiResponse('login', { success: true })
       */
      mockApiResponse(endpoint: string, response: any): Chainable<void>
      
      /**
       * Percy visual snapshot with banking-specific configuration
       * @example cy.percySnapshot('Mortgage Step 1', { widths: [375, 768, 1280] })
       */
      percySnapshot(name: string, options?: {
        widths?: number[],
        minHeight?: number,
        percyCSS?: string,
        scope?: string,
        enableJavaScript?: boolean,
        waitForTimeout?: number,
        waitForSelector?: string,
        language?: 'he' | 'en' | 'ru'
      }): Chainable<void>
      
      /**
       * Multi-language Percy snapshot for all supported languages
       * @example cy.percySnapshotMultiLang('Mortgage Step 1')
       */
      percySnapshotMultiLang(baseName: string, options?: any): Chainable<void>
      
      /**
       * Banking-specific Percy snapshot with data masking
       * @example cy.percySnapshotSecure('Credit Form Step 2')
       */
      percySnapshotSecure(name: string, options?: any): Chainable<void>
    }
  }
}

// Prevent Cypress from failing tests on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the error from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  // Return true to fail the test on other uncaught exceptions
  return true
})

// Add custom logging for debugging
Cypress.on('window:before:load', (win) => {
  // Add console log capturing
  const originalLog = win.console.log
  win.console.log = (...args) => {
    originalLog.apply(win.console, args)
    Cypress.log({
      name: 'console.log',
      message: args.map(arg => JSON.stringify(arg)).join(', ')
    })
  }
})

// Configure viewport for different test scenarios
before(() => {
  // Set default viewport for desktop testing
  cy.viewport(1920, 1080)
})

// Clear cookies and local storage before each test
beforeEach(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
  
  // Set default language to Hebrew for banking app
  cy.window().then((win) => {
    win.localStorage.setItem('language', 'he')
    win.localStorage.setItem('admin_language', 'he')
  })
})

// Enhanced Jira integration with detailed tracking
Cypress.Screenshot.defaults({ screenshotOnRunFailure: true })

// Global variables to track test execution details
let testActionLog: string[] = []
let testSteps: any[] = []
let currentTestUrl = ''

// Add command logging
Cypress.on('command:start', (command) => {
  const action = `[${new Date().toISOString()}] ${command.attributes.name}: ${command.attributes.args ? JSON.stringify(command.attributes.args).slice(0, 100) : ''}`
  testActionLog.push(action)
  
  // Track test steps for structured reporting
  testSteps.push({
    action: command.attributes.name,
    args: command.attributes.args,
    selector: command.attributes.selector,
    timestamp: new Date().toISOString(),
    success: true // Will be updated if command fails
  })
})

// Track command failures
Cypress.on('command:failed', (command, err) => {
  const failureAction = `[${new Date().toISOString()}] FAILED - ${command.attributes.name}: ${err.message}`
  testActionLog.push(failureAction)
  
  // Update last step as failed
  if (testSteps.length > 0) {
    testSteps[testSteps.length - 1].success = false
    testSteps[testSteps.length - 1].error = err.message
  }
})

// Track URL changes
beforeEach(() => {
  // Reset tracking variables for each test
  testActionLog = []
  testSteps = []
  currentTestUrl = ''
  
  // Log test start
  testActionLog.push(`[${new Date().toISOString()}] Test started: ${Cypress.currentTest?.title}`)
})

// Track current URL
Cypress.on('url:changed', (url) => {
  currentTestUrl = url
  testActionLog.push(`[${new Date().toISOString()}] URL changed to: ${url}`)
})

afterEach(function () {
  const test = (this as any).currentTest
  if (test && test.state === 'failed') {
    // Check if Jira integration is enabled
    if (!Cypress.env('JIRA_HOST') && !Cypress.env('jiraEnabled')) {
      return // Skip Jira integration if not configured
    }

    const spec = Cypress.spec.relative
    const testTitle = test.fullTitle ? test.fullTitle() : test.title
    const errMsg = (test.err && (test.err.stack || test.err.message)) || 'Unknown test failure'

    // Build expected screenshot path(s). Cypress stores screenshots as:
    // cypress/screenshots/<spec>/<test title> (failed).png
    const sanitize = (s: string) => s.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 200)
    const screenshotDir = `cypress/screenshots/${spec}`
    const screenshotName = `${sanitize(testTitle)} (failed).png`
    const screenshotPath = `${screenshotDir}/${screenshotName}`

    const browser = `${Cypress.browser.displayName} ${Cypress.browser.version || ''}`.trim()
    const os = `${Cypress.platform} ${Cypress.arch}`
    const appUrl = Cypress.config('baseUrl') || 'http://localhost:5174'

    // Get current URL from window if available
    cy.window().then((win) => {
      const currentUrl = win.location.href || currentTestUrl || appUrl
      
      // Add final test context to action log
      testActionLog.push(`[${new Date().toISOString()}] Test failed: ${errMsg}`)
      testActionLog.push(`[${new Date().toISOString()}] Final URL: ${currentUrl}`)
      testActionLog.push(`[${new Date().toISOString()}] Browser: ${browser}`)
      testActionLog.push(`[${new Date().toISOString()}] OS: ${os}`)
      
      // Determine file path context
      const filePath = spec.includes('/') ? spec : `cypress/e2e/${spec}`
      
      // Create enhanced Jira bug with detailed tracking
      cy.task('createOrUpdateJira', {
        spec,
        testTitle,
        errorMessage: errMsg,
        appUrl,
        browser,
        os,
        screenshotPaths: [screenshotPath],
        actionLog: testActionLog,
        currentUrl: currentUrl,
        testSteps: testSteps,
        filePath: filePath
      }, { log: false }).then((result: any) => {
        if (result && result.issueKey) {
          cy.log(`🎯 Jira bug filed: ${result.issueKey}`)
          cy.log(`📍 Bug details: https://bankimonline.atlassian.net/browse/${result.issueKey}`)
        } else if (result && result.error) {
          cy.log(`❌ Jira filing failed: ${result.error}`)
        }
      })
    }).catch(() => {
      // Fallback if window is not available
      const currentUrl = currentTestUrl || appUrl
      const filePath = spec.includes('/') ? spec : `cypress/e2e/${spec}`
      
      cy.task('createOrUpdateJira', {
        spec,
        testTitle,
        errorMessage: errMsg,
        appUrl,
        browser,
        os,
        screenshotPaths: [screenshotPath],
        actionLog: testActionLog,
        currentUrl: currentUrl,
        testSteps: testSteps,
        filePath: filePath
      }, { log: false }).then((result: any) => {
        if (result && result.issueKey) {
          cy.log(`🎯 Jira bug filed: ${result.issueKey}`)
        } else if (result && result.error) {
          cy.log(`❌ Jira filing failed: ${result.error}`)
        }
      })
    })
  }
})