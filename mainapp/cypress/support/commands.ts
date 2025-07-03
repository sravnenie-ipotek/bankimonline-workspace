/// <reference types="cypress" />

// Custom command to login to the banking application
Cypress.Commands.add('login', (phone: string, name: string) => {
  cy.visit('/')
  
  // Click on login button
  cy.get('[data-cy=login-button]').click()
  
  // Fill in phone verification form
  cy.get('input[placeholder*="שם"]').type(name)
  cy.get('.react-phone-input-2 input').clear().type(phone)
  
  // Submit form
  cy.get('button[type="button"]').contains('המשך').click()
  
  // Handle OTP in test environment
  cy.handleOTP(Cypress.env('testUser').otp)
})

// Custom command to select language
Cypress.Commands.add('selectLanguage', (lang: 'en' | 'he' | 'ru') => {
  // Click on language selector
  cy.get('[class*="language-wrapper"]').click()
  
  // Select the desired language
  const languageMap = {
    'en': 'English',
    'he': 'עברית',
    'ru': 'Русский'
  }
  
  cy.get('[class*="language-select__item"]')
    .contains(languageMap[lang])
    .click()
  
  // Verify language changed
  cy.window().its('localStorage.language').should('eq', lang)
})

// Custom command to handle OTP verification
Cypress.Commands.add('handleOTP', (code: string) => {
  // Wait for OTP input to be visible
  cy.get('[class*="otp-input"]', { timeout: 10000 }).should('be.visible')
  
  // Type each digit of the OTP
  code.split('').forEach((digit, index) => {
    cy.get(`input[data-index="${index}"]`).type(digit)
  })
  
  // Submit OTP
  cy.get('button').contains('אמת').click()
})

// Custom command to navigate through banking service flow
Cypress.Commands.add('navigateToService', (service: 'mortgage' | 'credit' | 'refinance') => {
  const serviceMap = {
    'mortgage': 'חישוב משכנתא',
    'credit': 'חישוב הלוואה',
    'refinance': 'מחזור משכנתא'
  }
  
  // Navigate to services page
  cy.visit('/services')
  
  // Click on the specific service
  cy.get('[class*="service-card"]')
    .contains(serviceMap[service])
    .click()
})

// Custom command to fill form fields with Hebrew support
Cypress.Commands.add('fillFormField', (fieldName: string, value: string) => {
  // Find field by name, placeholder, or label
  cy.get(`input[name="${fieldName}"], input[placeholder*="${fieldName}"], label:contains("${fieldName}") + input`)
    .clear()
    .type(value)
    .should('have.value', value)
})

// Custom command to mock API responses
Cypress.Commands.add('mockApiResponse', (endpoint: string, response: any) => {
  cy.intercept('POST', `**/${endpoint}`, {
    statusCode: 200,
    body: response
  }).as(`${endpoint}Request`)
})

// Additional utility commands for banking app

// Command to select from dropdown
Cypress.Commands.add('selectDropdownOption', (dropdownSelector: string, optionText: string) => {
  cy.get(dropdownSelector).click()
  cy.get('[class*="react-dropdown-select-item"]').contains(optionText).click()
})

// Command to handle date picker
Cypress.Commands.add('selectDate', (dateFieldSelector: string, date: Date) => {
  cy.get(dateFieldSelector).click()
  
  // Select year
  cy.get('select[class*="year-select"]').select(date.getFullYear().toString())
  
  // Select month
  cy.get('select[class*="month-select"]').select(date.getMonth().toString())
  
  // Select day
  cy.get(`[class*="react-datepicker__day"]:not([class*="outside-month"])`).contains(date.getDate()).click()
})

// Command to handle file upload
Cypress.Commands.add('uploadDocument', (documentType: string, fileName: string) => {
  cy.fixture(fileName).then(fileContent => {
    cy.get(`[data-cy="${documentType}-upload"]`).attachFile({
      fileContent: fileContent.toString(),
      fileName: fileName,
      mimeType: 'application/pdf'
    })
  })
})

// Command to verify form validation errors
Cypress.Commands.add('verifyValidationError', (fieldName: string, errorMessage: string) => {
  cy.get(`[class*="error"][data-field="${fieldName}"], [class*="error-message"]`)
    .should('be.visible')
    .and('contain', errorMessage)
})

// Export empty object to make this a module
export {}