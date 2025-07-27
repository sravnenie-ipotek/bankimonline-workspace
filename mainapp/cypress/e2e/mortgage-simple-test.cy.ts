describe('Simple Mortgage Test', () => {
  it('loads Step 1 directly', () => {
    // Visit Step 1 directly
    cy.visit('/services/calculate-mortgage/1')
    
    // Wait for load
    cy.wait(2000)
    
    // Check URL
    cy.url().should('include', 'calculate-mortgage/1')
    
    // Take screenshot
    cy.screenshot('step1-loaded')
    
    // Look for any form elements
    cy.get('input').should('exist')
    cy.get('button').should('exist')
    
    // Log what we see
    cy.get('body').then($body => {
      cy.log('Page title:', $body.find('h1, h2, h3').first().text())
      cy.log('Number of inputs:', $body.find('input').length)
      cy.log('Number of buttons:', $body.find('button').length)
      cy.log('Number of dropdowns:', $body.find('.dropdown-menu').length)
    })
  })
})