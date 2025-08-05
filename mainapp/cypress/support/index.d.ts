/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login to the banking application
     * @example cy.login('0544123456', 'Test User')
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
     * Custom command to fill form fields with Hebrew support
     * @example cy.fillFormField('firstName', 'John')
     */
    fillFormField(fieldName: string, value: string): Chainable<void>
    
    /**
     * Custom command to mock API responses
     * @example cy.mockApiResponse('banks', { data: [...] })
     */
    mockApiResponse(endpoint: string, response: any): Chainable<void>
    
    /**
     * Command to select from dropdown
     * @example cy.selectDropdownOption('#bank-select', 'Bank Hapoalim')
     */
    selectDropdownOption(dropdownSelector: string, optionText: string): Chainable<void>
    
    /**
     * Command to handle date picker
     * @example cy.selectDate('#birthdate', new Date('1990-01-01'))
     */
    selectDate(dateFieldSelector: string, date: Date): Chainable<void>
    
    /**
     * Command to handle file upload
     * @example cy.uploadDocument('id-card', 'sample-id.pdf')
     */
    uploadDocument(documentType: string, fileName: string): Chainable<void>
    
    /**
     * Command to verify form validation errors
     * @example cy.verifyValidationError('email', 'Invalid email format')
     */
    verifyValidationError(fieldName: string, errorMessage: string): Chainable<void>
    
    /**
     * Custom command to fill all form fields automatically
     * @example cy.fillAllFormFields()
     */
    fillAllFormFields(): Chainable<void>
    
    /**
     * Command to click continue/next button
     * @example cy.clickContinueButton()
     */
    clickContinueButton(): Chainable<void>
    
    /**
     * Custom command to take organized screenshots with descriptive names
     * Screenshots will be saved in timestamped folders
     * @example cy.takeScreenshot('step1-completed')
     * @example cy.takeScreenshot('form-filled', { capture: 'fullPage' })
     */
    takeScreenshot(name: string, options?: {
      capture?: 'viewport' | 'fullPage' | 'runner'
      clip?: { x: number, y: number, width: number, height: number }
    }): Chainable<void>
    
    /**
     * Command to take screenshot of specific element
     * @example cy.screenshotElement('.bank-offer-card', 'bank-offer')
     */
    screenshotElement(selector: string, name: string): Chainable<void>
    
    /**
     * Command to document test step with screenshot
     * Logs the step and takes a screenshot automatically
     * @example cy.documentStep('Filled personal information', 'All required fields completed')
     */
    documentStep(stepName: string, description?: string): Chainable<void>
  }
}