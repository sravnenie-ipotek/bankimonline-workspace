/// <reference types="cypress" />

describe('Phase 5 E2E - Form Validation Rules', () => {
  beforeEach(() => {
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(1000); // Wait for form to initialize
  });
  
  it('Should validate required fields', () => {
    // Try to submit without filling required fields
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.contains('City is required').should('be.visible');
    cy.contains('when you need the mortgage').should('be.visible');
    cy.contains('Mortgage type is required').should('be.visible');
    cy.contains('first home').should('be.visible');
    cy.contains('Property ownership status is required').should('be.visible');
  });
  
  it('Should validate property price constraints', () => {
    // Test maximum value
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type('15000000');
    
    cy.get('button[type="submit"]').click();
    cy.contains('Maximum property value is 10,000,000').should('be.visible');
    
    // Test minimum value (implicit through initial payment)
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type('0');
    
    // Initial payment should be disabled or show error
    cy.get('[data-testid="initial-fee-input"]').should('have.attr', 'disabled');
  });
  
  it('Should validate initial payment based on property ownership', () => {
    // Set property price
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type('1000000');
    
    // Select "no property" (25% minimum down payment)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .first()
      .click();
    
    // Try to set initial payment below 25%
    cy.get('[data-testid="initial-fee-input"] input')
      .clear()
      .type('200000');
    
    // Should auto-adjust to minimum
    cy.get('[data-testid="initial-fee-input"] input')
      .should('have.value', '250,000');
  });
  
  it('Should validate mortgage period constraints', () => {
    // Fill required fields first
    cy.get('[data-testid="property-price-input"]').type('1000000');
    cy.get('[data-testid="city-dropdown"]').click();
    cy.get('[data-testid="city-dropdown"] .mantine-Select-item').first().click();
    
    // Test minimum period
    cy.get('input[name="period"]')
      .clear()
      .type('3');
    
    cy.get('button[type="submit"]').click();
    cy.contains('Minimum period is 4 years').should('be.visible');
    
    // Test maximum period
    cy.get('input[name="period"]')
      .clear()
      .type('35');
    
    cy.get('button[type="submit"]').click();
    cy.contains('Maximum period is 30 years').should('be.visible');
  });
  
  it('Should validate monthly payment constraints', () => {
    // Fill required fields
    cy.get('[data-testid="property-price-input"]').type('1000000');
    
    // Test minimum monthly payment
    cy.get('input[name="monthlyPayment"]')
      .clear()
      .type('1000');
    
    cy.get('button[type="submit"]').click();
    cy.contains('Minimum monthly payment').should('be.visible');
  });
  
  it('Should handle field dependencies correctly', () => {
    // Property ownership affects initial payment
    cy.get('[data-testid="property-price-input"]').type('2000000');
    
    // Select different property ownership options and verify constraints
    const ownershipTests = [
      { option: 0, minPercent: 25 }, // no property
      { option: 1, minPercent: 50 }, // has property
      { option: 2, minPercent: 30 }  // selling property
    ];
    
    ownershipTests.forEach(test => {
      cy.get('[data-testid="property-ownership-dropdown"]').click();
      cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
        .eq(test.option)
        .click();
      
      // Verify minimum is enforced
      const minValue = 2000000 * test.minPercent / 100;
      cy.get('[data-testid="initial-fee-input"] input')
        .invoke('val')
        .then(val => {
          const numericValue = parseInt(val.toString().replace(/,/g, ''));
          expect(numericValue).to.be.at.least(minValue);
        });
    });
  });
});