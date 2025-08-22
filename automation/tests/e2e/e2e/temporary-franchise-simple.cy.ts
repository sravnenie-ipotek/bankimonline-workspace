describe('TemporaryFranchise - Quick Validation', () => {
  it('should load the page and display basic content', () => {
    cy.visit('/Real-Estate-Brokerage', { timeout: 15000 })
    cy.wait(3000)
    
    // Verify page loads
    cy.url().should('include', '/Real-Estate-Brokerage')
    
    // Verify basic sections exist
    cy.get('[class*="main-hero-section"]').should('exist')
    cy.get('[class*="main-hero-title"]').should('be.visible').and('not.be.empty')
    
    // Verify database content is working (no fallback keys visible)
    cy.get('body').should('not.contain.text', 'franchise_main_hero_title')
    
    // Take screenshot for verification
    cy.screenshot('temporary-franchise-loaded')
  })
})