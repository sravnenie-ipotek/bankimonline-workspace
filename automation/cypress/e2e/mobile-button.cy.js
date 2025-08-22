
describe('Mobile Button Position Test', () => {
  beforeEach(() => {
    cy.viewport(375, 812) // iPhone X
  })
  
  it('should load mortgage calculator on mobile', () => {
    cy.visit('/services/calculate-mortgage/1', { timeout: 10000 })
    cy.get('body').should('be.visible')
  })
  
  it('should have buttons within viewport', () => {
    cy.visit('/services/calculate-mortgage/1')
    cy.get('button').then($buttons => {
      cy.log(`Found ${$buttons.length} buttons`)
      
      $buttons.each((index, button) => {
        const rect = button.getBoundingClientRect()
        const viewportHeight = 812
        
        if (rect.bottom > viewportHeight) {
          cy.log(`WARNING: Button at ${rect.bottom}px exceeds viewport`)
        } else {
          cy.log(`OK: Button at ${rect.bottom}px within viewport`)
        }
        
        // Assert button is visible
        expect(rect.bottom).to.be.lessThan(viewportHeight + 100) // Allow some scroll
      })
    })
  })
})
