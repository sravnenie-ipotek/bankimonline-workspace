/// <reference types="cypress" />

describe('Phase 5 E2E - Property Ownership LTV Logic', () => {
  beforeEach(() => {
    // Intercept calculation parameters API
    cy.intercept('GET', '/api/v1/calculation-parameters*').as('ltvParams');
    cy.visit('/services/calculate-mortgage/1');
    cy.wait('@ltvParams');
  });
  
  it('Should apply correct LTV ratios based on property ownership', () => {
    const propertyValue = 1000000;
    
    // Set property value
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type(propertyValue.toString());
    
    // Test Case 1: No property (75% LTV = 25% min down payment)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .eq(0) // First option - no property
      .click();
    
    // Verify minimum initial payment is 250,000
    cy.get('[data-testid="initial-fee-input"] input')
      .invoke('attr', 'min')
      .should('equal', '250000');
    
    // Test Case 2: Has property (50% LTV = 50% min down payment)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .eq(1) // Second option - has property
      .click();
    
    // Initial payment should auto-adjust to 500,000
    cy.wait(500); // Wait for auto-adjustment
    cy.get('[data-testid="initial-fee-input"] input')
      .should('have.value', '500,000');
    
    // Test Case 3: Selling property (70% LTV = 30% min down payment)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .eq(2) // Third option - selling property
      .click();
    
    // Initial payment should adjust to 300,000
    cy.wait(500);
    cy.get('[data-testid="initial-fee-input"] input')
      .should('have.value', '300,000');
  });
  
  it('Should verify LTV data is fetched from database', () => {
    // Already intercepted in beforeEach
    cy.get('@ltvParams').then((interception) => {
      const ltvData = interception.response.body.data.property_ownership_ltvs;
      
      // Verify database values match business rules
      expect(ltvData.no_property.ltv).to.equal(75);
      expect(ltvData.has_property.ltv).to.equal(50);
      expect(ltvData.selling_property.ltv).to.equal(70);
      
      // Verify descriptions are present
      expect(ltvData.no_property.description).to.include('75%');
      expect(ltvData.has_property.description).to.include('50%');
      expect(ltvData.selling_property.description).to.include('70%');
    });
  });
  
  it('Should prevent manual entry below minimum down payment', () => {
    const propertyValue = 2000000;
    
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type(propertyValue.toString());
    
    // Select "has property" (50% min down payment = 1,000,000)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .eq(1)
      .click();
    
    // Try to manually enter value below minimum
    cy.get('[data-testid="initial-fee-input"] input')
      .clear()
      .type('800000');
    
    // Click away to trigger validation
    cy.get('[data-testid="property-price-input"]').click();
    
    // Value should auto-correct to minimum
    cy.get('[data-testid="initial-fee-input"] input')
      .should('have.value', '1,000,000');
  });
  
  it('Should update loan amount calculation when property ownership changes', () => {
    const propertyValue = 3000000;
    
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type(propertyValue.toString());
    
    // Start with "no property"
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .eq(0)
      .click();
    
    // Initial payment should be min 750,000 (25%)
    cy.get('[data-testid="initial-fee-input"] input')
      .should('have.value', '750,000');
    
    // Change to "selling property"
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .eq(2)
      .click();
    
    // Initial payment should update to 900,000 (30%)
    cy.wait(500);
    cy.get('[data-testid="initial-fee-input"] input')
      .should('have.value', '900,000');
  });
  
  it('Should handle edge cases in LTV calculations', () => {
    // Test with very high property value
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type('9999999');
    
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .eq(0)
      .click();
    
    // Should calculate 25% correctly
    cy.get('[data-testid="initial-fee-input"] input')
      .invoke('val')
      .then(val => {
        const numericValue = parseInt(val.toString().replace(/,/g, ''));
        expect(numericValue).to.be.closeTo(2499999, 1000);
      });
  });
});