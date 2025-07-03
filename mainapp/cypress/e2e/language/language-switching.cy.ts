describe('Language Switching', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should default to Hebrew language', () => {
    // Check document direction
    cy.get('html').should('have.attr', 'dir', 'rtl')
    cy.get('html').should('have.attr', 'lang', 'he')
    
    // Check Hebrew content is displayed
    cy.contains('ברוכים הבאים').should('be.visible')
  })

  it('should switch to English', () => {
    cy.selectLanguage('en')
    
    // Check document direction changes
    cy.get('html').should('have.attr', 'dir', 'ltr')
    cy.get('html').should('have.attr', 'lang', 'en')
    
    // Check English content
    cy.contains('Welcome').should('be.visible')
    
    // Check localStorage
    cy.window().its('localStorage.language').should('eq', 'en')
  })

  it('should switch to Russian', () => {
    cy.selectLanguage('ru')
    
    // Check document direction (LTR for Russian)
    cy.get('html').should('have.attr', 'dir', 'ltr')
    cy.get('html').should('have.attr', 'lang', 'ru')
    
    // Check Russian content
    cy.contains('Добро пожаловать').should('be.visible')
  })

  it('should persist language selection after reload', () => {
    // Switch to English
    cy.selectLanguage('en')
    cy.contains('Welcome').should('be.visible')
    
    // Reload page
    cy.reload()
    
    // Should still be in English
    cy.get('html').should('have.attr', 'lang', 'en')
    cy.contains('Welcome').should('be.visible')
  })

  it('should update all UI elements when switching language', () => {
    // Start in Hebrew
    cy.get('button').contains('התחבר').should('be.visible')
    
    // Switch to English
    cy.selectLanguage('en')
    
    // Check multiple UI elements updated
    cy.get('button').contains('Login').should('be.visible')
    cy.get('a').contains('Services').should('be.visible')
    cy.get('a').contains('Contact').should('be.visible')
  })

  it('should handle RTL/LTR layout correctly', () => {
    // Hebrew (RTL)
    cy.get('[class*="sidebar"]').should('have.css', 'right', '0px')
    
    // Switch to English (LTR)
    cy.selectLanguage('en')
    cy.get('[class*="sidebar"]').should('have.css', 'left', '0px')
  })

  it('should update form placeholders and labels', () => {
    // Open login modal
    cy.get('[data-cy=login-button]').click()
    
    // Check Hebrew placeholders
    cy.get('input[placeholder*="שם מלא"]').should('be.visible')
    
    // Close modal and switch language
    cy.get('[class*="closeButton"]').click()
    cy.selectLanguage('en')
    
    // Open login modal again
    cy.get('[data-cy=login-button]').click()
    
    // Check English placeholders
    cy.get('input[placeholder*="Full name"]').should('be.visible')
  })

  it('should handle number formatting based on locale', () => {
    // Visit mortgage calculator
    cy.visit('/services/calculate-mortgage')
    
    // Enter a number in Hebrew locale
    cy.fillFormField('propertyValue', '2000000')
    
    // Should format with Hebrew number formatting
    cy.get('input[name="propertyValue"]').should('have.value', '2,000,000')
    
    // Switch to English
    cy.selectLanguage('en')
    
    // Number format should remain consistent
    cy.get('input[name="propertyValue"]').should('have.value', '2,000,000')
  })

  it('should update validation messages in correct language', () => {
    // Try to submit empty form in Hebrew
    cy.get('[data-cy=login-button]').click()
    cy.get('button').contains('המשך').click()
    
    // Check Hebrew validation message
    cy.get('[class*="error"]').should('contain', 'שדה חובה')
    
    // Switch to English
    cy.get('[class*="closeButton"]').click()
    cy.selectLanguage('en')
    
    // Try again in English
    cy.get('[data-cy=login-button]').click()
    cy.get('button').contains('Continue').click()
    
    // Check English validation message
    cy.get('[class*="error"]').should('contain', 'Required field')
  })

  it('should handle language switch during active session', () => {
    // Login first
    cy.window().then((win) => {
      win.localStorage.setItem('ACCESS_TOKEN', 'test-token')
      win.localStorage.setItem('USER_DATA', JSON.stringify({
        name: 'משתמש בדיקה',
        phone: '972544123456'
      }))
    })
    cy.reload()
    
    // Navigate to personal cabinet
    cy.visit('/personal-cabinet')
    
    // Check Hebrew dashboard
    cy.contains('לוח בקרה').should('be.visible')
    
    // Switch language
    cy.selectLanguage('en')
    
    // Check English dashboard
    cy.contains('Dashboard').should('be.visible')
    
    // User data should remain intact
    cy.window().its('localStorage.ACCESS_TOKEN').should('exist')
  })

  it('should update document title based on language', () => {
    // Hebrew title
    cy.title().should('contain', 'בנק')
    
    // Switch to English
    cy.selectLanguage('en')
    cy.title().should('contain', 'Bank')
    
    // Switch to Russian
    cy.selectLanguage('ru')
    cy.title().should('contain', 'Банк')
  })
})