// ***********************************************************
// This file is processed and loaded automatically before test files.
// You can change the location of this file or turn off loading
// the support files with the 'supportFile' configuration option.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

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