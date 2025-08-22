
describe('Mobile Button Fix Validation', () => {
  beforeEach(() => {
    cy.viewport(375, 812) // iPhone X dimensions
  })

  it('should load homepage on mobile viewport', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
    cy.takeScreenshot('mobile-homepage-loaded')
  })

  it('should detect button positions on mobile', () => {
    cy.visit('/services/calculate-mortgage/1')
    cy.get('body').should('be.visible')
    
    // Check for any buttons
    cy.get('button').then($buttons => {
      if ($buttons.length > 0) {
        cy.log(`Found ${$buttons.length} buttons`)
        
        $buttons.each((index, button) => {
          const rect = button.getBoundingClientRect()
          const viewportHeight = Cypress.config('viewportHeight')
          
          if (rect.bottom > viewportHeight) {
            cy.log(`⚠️ Button overflow: ${button.innerText} at ${rect.bottom}px`)
          } else {
            cy.log(`✅ Button OK: ${button.innerText} at ${rect.bottom}px`)
          }
        })
      }
    })
    
    cy.takeScreenshot('mobile-button-positions')
  })
})
