/**
 * Cypress E2E Support File
 * Loaded before every test file
 */

// Percy removed - using native Cypress screenshots instead

// Custom commands
Cypress.Commands.add('login', (phone: string = '972544123456', otp: string = '123456') => {
  cy.get('input[type="tel"]').type(phone)
  cy.get('button').contains(/Send|שלח/i).click()
  cy.wait(2000)
  cy.get('input').last().type(otp)
  cy.get('button').contains(/Verify|אמת/i).click()
  cy.wait(3000)
})

// Language switching command
Cypress.Commands.add('switchToEnglish', () => {
  cy.get('body').then($body => {
    const langButtons = $body.find('button').filter((i, el) => {
      const text = el.textContent || ''
      return text.includes('EN') || text.includes('English')
    })
    
    if (langButtons.length > 0) {
      cy.wrap(langButtons.first()).click()
      cy.wait(1000)
    }
  })
})

// Next button clicking command
Cypress.Commands.add('clickNext', () => {
  cy.get('button').filter((index, element) => {
    const text = element.textContent || ''
    return text.includes('Next') || text.includes('הבא') || 
           text.includes('Continue') || text.includes('המשך')
  }).first().click({ force: true })
})

// TypeScript declarations
declare global {
  namespace Cypress {
    interface Chainable {
      login(phone?: string, otp?: string): Chainable<void>
      switchToEnglish(): Chainable<void>
      clickNext(): Chainable<void>
    }
  }
}

export {}