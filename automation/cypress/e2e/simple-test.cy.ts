describe('Simple Application Test', () => {
  it('should load the homepage', () => {
    cy.visit('/');
    cy.wait(3000);
    
    // Check if page loads
    cy.get('body').should('be.visible');
    
    // Take screenshot for verification
    cy.screenshot('homepage-loaded');
    
    cy.log('✅ Homepage loaded successfully');
  });
});