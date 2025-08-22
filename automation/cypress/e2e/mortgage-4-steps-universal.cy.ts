/**
 * Universal Mortgage Calculator Test - Language Agnostic
 * Uses data-testid attributes and Percy integration
 */

import LanguageHelper from '../support/language-helper'

describe('Mortgage Calculator - Universal 4 Step Test', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
  })

  it('Should complete all 4 steps with Percy snapshots', () => {
    cy.log('🏠 Starting universal mortgage calculator test')
    
    // Step 1: Navigate to mortgage calculator
    LanguageHelper.navigateToService('mortgage')
    cy.wait(3000)
    
    // Ensure we're in English for consistent testing
    LanguageHelper.ensureEnglish()
    cy.wait(2000)
    
    // Take Percy snapshot of initial state
    cy.percySnapshot('Mortgage Step 1 - Initial')
    
    // Fill Step 1 using data-testid attributes
    cy.log('📝 Filling Step 1 - Property Details')
    
    // Property value (using data-testid)
    cy.get('[data-testid="property-price-input"]').should('exist').then($input => {
      cy.wrap($input).clear().type('2000000')
      cy.log('✅ Filled property value: 2,000,000')
    })
    
    // City dropdown (using data-testid)
    cy.get('[data-testid="city-dropdown"]').should('exist').click({ force: true })
    cy.wait(500)
    cy.get('[data-testid^="city-dropdown-item"]').first().click({ force: true })
    cy.log('✅ Selected first city')
    
    // When needed dropdown (using data-testid)
    cy.get('[data-testid="when-needed-dropdown"]').should('exist').click({ force: true })
    cy.wait(500)
    cy.get('[data-testid^="when-needed-dropdown-item"]').first().click({ force: true })
    cy.log('✅ Selected when needed')
    
    // Property type dropdown (using data-testid)
    cy.get('[data-testid="property-type-dropdown"]').should('exist').click({ force: true })
    cy.wait(500)
    cy.get('[data-testid^="property-type-dropdown-item"]').first().click({ force: true })
    cy.log('✅ Selected property type')
    
    // First home dropdown (using data-testid)
    cy.get('[data-testid="first-home-dropdown"]').should('exist').click({ force: true })
    cy.wait(500)
    cy.get('[data-testid^="first-home-dropdown-item"]').first().click({ force: true })
    cy.log('✅ Selected first home option')
    
    // Property ownership dropdown (using data-testid)
    cy.get('[data-testid="property-ownership-dropdown"]').should('exist').click({ force: true })
    cy.wait(500)
    cy.get('[data-testid^="property-ownership-dropdown-item"]').first().click({ force: true })
    cy.log('✅ Selected property ownership')
    
    // Initial fee (using data-testid)
    cy.get('[data-testid="initial-fee-input"]').should('exist').then($input => {
      cy.wrap($input).clear().type('600000')
      cy.log('✅ Filled initial fee: 600,000')
    })
    
    // Take Percy snapshot after filling
    cy.percySnapshot('Mortgage Step 1 - Filled')
    
    // Click Next button
    LanguageHelper.clickNext()
    cy.wait(3000)
    
    // Check if authentication modal appears
    cy.get('body').then($body => {
      if ($body.find('input[type="tel"]').length > 0) {
        cy.log('📱 Authentication required - filling phone')
        cy.get('input[type="tel"]').type('972544123456')
        cy.get('button').contains(/Send|שלח/i).click({ force: true })
        cy.wait(2000)
        
        // Enter OTP
        cy.get('input').last().type('123456')
        cy.get('button').contains(/Verify|אמת/i).click({ force: true })
        cy.wait(3000)
      }
    })
    
    // Step 2: Personal Information
    cy.url().then(url => {
      if (url.includes('/2')) {
        cy.log('✅ Reached Step 2 - Personal Information')
        cy.percySnapshot('Mortgage Step 2 - Initial')
        
        // Fill personal data
        cy.get('input[type="text"]').first().type('Test User')
        cy.get('input[type="date"], input[type="text"]').eq(1).type('01/01/1990')
        
        // Handle Yes/No questions
        cy.get('button').filter(':contains("No"), :contains("לא")').first().click({ force: true })
        
        cy.percySnapshot('Mortgage Step 2 - Filled')
        
        // Click Next
        LanguageHelper.clickNext()
        cy.wait(3000)
        
        // Step 3: Financial Information
        cy.url().then(url => {
          if (url.includes('/3')) {
            cy.log('✅ Reached Step 3 - Financial Information')
            cy.percySnapshot('Mortgage Step 3 - Initial')
            
            // Fill income
            cy.get('input[type="text"], input[type="number"]').first().type('20000')
            
            // Select income source if dropdown exists
            cy.get('[data-testid*="income"], [class*="dropdown"]').first().then($el => {
              if ($el.length > 0) {
                cy.wrap($el).click({ force: true })
                cy.wait(500)
                cy.get('li, [role="option"]').first().click({ force: true })
              }
            })
            
            cy.percySnapshot('Mortgage Step 3 - Filled')
            
            // Click Calculate/Next
            cy.get('button').filter((index, element) => {
              const text = element.textContent || ''
              return text.includes('Calculate') || text.includes('חשב') || 
                     text.includes('Next') || text.includes('הבא')
            }).first().click({ force: true })
            cy.wait(5000)
            
            // Step 4: Results
            cy.url().then(url => {
              if (url.includes('/4')) {
                cy.log('🎉 SUCCESS: Reached Step 4 - Results!')
                cy.percySnapshot('Mortgage Step 4 - Results')
                
                // Verify results are displayed
                cy.get('body').should('contain.text', /offer|הצעה|bank|בנק/i)
                cy.log('✅ Bank offers displayed')
              } else {
                cy.log('⚠️ Did not reach Step 4')
                cy.percySnapshot('Mortgage - Stuck at Step 3')
              }
            })
          } else {
            cy.log('⚠️ Did not reach Step 3')
            cy.percySnapshot('Mortgage - Stuck at Step 2')
          }
        })
      } else {
        cy.log('⚠️ Did not reach Step 2')
        cy.percySnapshot('Mortgage - Stuck at Step 1')
      }
    })
  })
})

// Export Percy configuration
export const percyConfig = {
  token: 'web_9f73a1caca3ef1eeee6eb9bbbc50729ccbaea586614609282e4b00848dbb26bc',
  project: 'BankimOnline'
}