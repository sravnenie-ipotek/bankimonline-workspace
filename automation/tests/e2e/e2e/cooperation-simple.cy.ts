describe('Cooperation - Phase 9 Quick Validation', () => {
  it('should load the page and display basic database content', () => {
    cy.visit('/cooperation', { timeout: 15000 })
    cy.wait(3000)
    
    // Verify page loads
    cy.url().should('include', '/cooperation')
    
    // Verify basic sections exist with database content
    cy.get('[class*="hero"]').should('exist')
    cy.get('[class*="heroTitle"]').should('be.visible').and('not.be.empty')
    
    // Verify database content is working (no fallback keys visible)
    cy.get('body').should('not.contain.text', 'cooperation_title')
    cy.get('body').should('not.contain.text', 'marketplace_title')
    
    // Verify substantial content from database
    cy.get('body').then(($body) => {
      const text = $body.text().trim()
      expect(text).to.have.length.greaterThan(400)
      expect(text).to.not.include('undefined')
    })
    
    // Take screenshot for verification
    cy.screenshot('cooperation-phase9-loaded')
  })
})