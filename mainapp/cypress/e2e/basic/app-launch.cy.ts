/**
 * Basic App Launch Test
 * Verifies the application loads correctly and main elements are present
 */

describe('Basic App Launch', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/')
  })

  it('should load the application successfully', () => {
    // Check that the page loads without errors
    cy.get('body').should('be.visible')
    
    // Verify the main logo is present
    cy.get('a[href="/"]').should('exist')
    
    // Check for language selector
    cy.get('button').contains(/Русский|English|עברית/).should('be.visible')
    
    // Verify the page has loaded by checking for common elements
    cy.get('[id="root"]').should('exist')
  })

  it('should navigate to bank employee registration page', () => {
    // Navigate to the bank employee registration page
    cy.visit('/bank-employee/register')
    
    // Verify the registration page loaded
    cy.url().should('include', '/bank-employee/register')
    
    // Check for registration form elements
    cy.contains('h1', /регистрация|registration|הרשמה/i).should('be.visible')
    
    // Verify form fields are present
    cy.get('input[name="fullName"]').should('exist')
    cy.get('input[name="email"]').should('exist')
  })

  it('should switch languages', () => {
    // Find and click the language selector
    cy.get('button').contains(/Русский|English|עברית/).click()
    
    // Select Hebrew
    cy.get('button').contains('עברית').click()
    
    // Verify RTL direction is applied
    cy.get('html').should('have.attr', 'dir', 'rtl')
    
    // Switch back to English
    cy.get('button').contains(/Русский|English|עברית/).click()
    cy.get('button').contains('English').click()
    
    // Verify LTR direction
    cy.get('html').should('have.attr', 'dir', 'ltr')
  })
})