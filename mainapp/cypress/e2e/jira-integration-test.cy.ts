/**
 * Jira Integration Test
 * This test intentionally fails to verify Jira bug filing works correctly
 */

describe('Jira Integration Test', () => {
  it('should file bug when test fails (intentional failure)', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait for page to load
    cy.get('[data-testid="property-value"]', { timeout: 10000 }).should('be.visible');
    
    // Intentional failure to test Jira integration
    cy.get('[data-testid="non-existent-element-for-jira-test"]')
      .should('exist'); // This will fail and trigger Jira bug creation
  });

  it('should create different bug for different error (intentional failure)', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Different type of failure to test deduplication
    cy.get('[data-testid="property-value"]')
      .should('contain.text', 'This text does not exist'); // Different error = different bug
  });

  // This test should pass (no Jira bug created)
  it('should not file bug when test passes', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    cy.get('[data-testid="property-value"]', { timeout: 10000 }).should('be.visible');
    cy.log('✅ Test passed - no Jira bug should be created');
  });
});