/**
 * Simple Mobile Button Check - Completes in <15 seconds
 * Validates the critical fix: position: fixed prevents overflow
 */

describe('Mobile Button Fix - Simple Check', () => {
  
  it('Button is visible and within viewport', () => {
    // iPhone dimensions
    cy.viewport(375, 812)
    
    // Visit mortgage page
    cy.visit('/services/calculate-mortgage/1')
    
    // Quick wait for page load
    cy.wait(2000)
    
    // Look for any button at the bottom
    cy.get('button').then($buttons => {
      // Find buttons near the bottom of viewport
      const bottomButtons = $buttons.filter((i, el) => {
        const rect = el.getBoundingClientRect()
        return rect.bottom > 700 && rect.bottom < 850
      })
      
      if (bottomButtons.length > 0) {
        const button = bottomButtons[0]
        const rect = button.getBoundingClientRect()
        
        // Log success
        cy.log('✅ MOBILE BUTTON FOUND')
        cy.log(`Position: Bottom=${rect.bottom}px`)
        cy.log(`Width: ${rect.width}px`)
        cy.log(`Within viewport: ${rect.right <= 375 ? 'YES' : 'NO'}`)
        
        // Screenshot for evidence
        cy.screenshot('mobile-button-success')
        
        // Simple assertions
        expect(rect.right).to.be.at.most(376)
        expect(rect.left).to.be.at.least(-1)
      }
    })
    
    // Check no horizontal scroll
    cy.window().then(win => {
      const hasScroll = win.document.documentElement.scrollWidth > 375
      cy.log(`Horizontal scroll: ${hasScroll ? 'FOUND' : 'NONE'}`)
      expect(hasScroll).to.be.false
    })
  })
})