/**
 * Live Jira Integration Demo
 * This test will intentionally fail to demonstrate real-world Jira bug creation
 */

describe('Live Jira Demo - Mortgage Calculator Real Test', () => {
  beforeEach(() => {
    // Visit the mortgage calculator page
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait for the page to fully load
    cy.get('[data-testid="property-value"]', { timeout: 15000 }).should('be.visible');
  });

  it('should fail on property ownership dropdown validation (INTENTIONAL FAILURE)', () => {
    // This test will demonstrate real Cypress failure with Jira integration
    
    // Step 1: Fill in property value
    cy.get('[data-testid="property-value"]').clear().type('500000');
    cy.log('✅ Property value entered: 500000');
    
    // Step 2: Navigate to next step or find dropdown
    cy.wait(1000);
    
    // Step 3: Look for property ownership dropdown (this will likely fail)
    cy.get('[data-testid="property-ownership-dropdown"]', { timeout: 10000 })
      .should('be.visible');
    
    // Step 4: INTENTIONAL FAILURE - Look for specific dropdown option that doesn't exist
    cy.get('[data-testid="property-ownership-dropdown"]')
      .should('contain.text', 'I own 5 properties and a castle');  // This will definitely fail!
  });

  it('should fail on calculation result validation (DIFFERENT FAILURE)', () => {
    // Different type of failure to test deduplication
    
    // Fill some data first
    cy.get('[data-testid="property-value"]').clear().type('400000');
    cy.log('✅ Property value entered: 400000');
    
    // Look for calculation results that don't exist yet
    cy.get('[data-testid="monthly-payment-display"]', { timeout: 5000 })
      .should('contain.text', '¥999,999 per month in Japanese Yen'); // Definitely will fail!
  });
});