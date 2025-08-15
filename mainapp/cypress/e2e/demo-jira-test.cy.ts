/**
 * Demo Jira Integration Test
 * This test intentionally fails to demonstrate comprehensive Jira bug filing
 */

describe('Demo Jira Integration - Mortgage Calculator', () => {
  it('should demonstrate bilingual bug filing (intentional failure)', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait for page to load
    cy.get('[data-testid="property-value"]', { timeout: 10000 }).should('be.visible');
    
    // Add some realistic test steps that will be logged
    cy.get('[data-testid="property-value"]').type('500000');
    cy.get('[data-testid="down-payment-slider"]').should('be.visible');
    
    // Intentional failure to test comprehensive Jira integration
    cy.get('[data-testid="non-existent-demo-element"]')
      .should('exist'); // This will fail and trigger detailed Jira bug creation
  });

  it('should create different bug for calculation error (intentional failure)', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Fill in form data
    cy.get('[data-testid="property-value"]', { timeout: 10000 }).type('400000');
    cy.get('[data-testid="down-payment-slider"]').should('be.visible');
    
    // Different type of failure to test deduplication
    cy.get('[data-testid="down-payment-display"]')
      .should('contain.text', 'Invalid Expected Text'); // Different error = different bug
  });
});