/// <reference types="cypress" />

describe('Phase 5 E2E - Dropdown API Integration', () => {
  beforeEach(() => {
    // Set up API intercepts
    cy.intercept('GET', '/api/v1/dropdowns?screen_location=mortgage_step1*').as('dropdownData');
    cy.intercept('GET', '/api/v1/calculation-parameters*').as('calculationParams');
    cy.intercept('GET', '/api/get-cities*').as('cities');
  });
  
  it('Should fetch all dropdown data from database on page load', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait for dropdown API call
    cy.wait('@dropdownData').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.status).to.equal('success');
      
      const data = interception.response.body.data;
      
      // Verify all required dropdowns are present
      expect(data).to.have.property('when_needed');
      expect(data).to.have.property('type');
      expect(data).to.have.property('first_home');
      expect(data).to.have.property('property_ownership');
      
      // Verify dropdown structure
      Object.keys(data).forEach(key => {
        const dropdown = data[key];
        expect(dropdown).to.have.property('label');
        expect(dropdown).to.have.property('placeholder');
        expect(dropdown).to.have.property('options');
        expect(dropdown.options).to.be.an('array');
        expect(dropdown.options.length).to.be.at.least(1);
        
        // Verify option structure
        dropdown.options.forEach(option => {
          expect(option).to.have.property('value');
          expect(option).to.have.property('label');
        });
      });
    });
  });
  
  it('Should fetch calculation parameters for LTV ratios', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    cy.wait('@calculationParams').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      
      const data = interception.response.body.data;
      expect(data).to.have.property('property_ownership_ltvs');
      
      const ltvs = data.property_ownership_ltvs;
      expect(ltvs).to.have.property('no_property');
      expect(ltvs.no_property.ltv).to.equal(75);
      
      expect(ltvs).to.have.property('has_property');
      expect(ltvs.has_property.ltv).to.equal(50);
      
      expect(ltvs).to.have.property('selling_property');
      expect(ltvs.selling_property.ltv).to.equal(70);
    });
  });
  
  it('Should display fetched dropdown options in the form', () => {
    cy.visit('/services/calculate-mortgage/1');
    cy.wait('@dropdownData');
    
    // Test property ownership dropdown
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    
    // Should have at least 3 options
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .should('have.length.at.least', 3);
    
    // Close dropdown
    cy.get('body').click();
    
    // Test other dropdowns
    const dropdowns = [
      'when-needed-dropdown',
      'property-type-dropdown',
      'first-home-dropdown'
    ];
    
    dropdowns.forEach(dropdown => {
      cy.get(`[data-testid="${dropdown}"]`).click();
      cy.get(`[data-testid="${dropdown}"] .mantine-Select-item`)
        .should('have.length.at.least', 1);
      cy.get('body').click();
    });
  });
  
  it('Should handle API errors gracefully', () => {
    // Simulate API failure
    cy.intercept('GET', '/api/v1/dropdowns?screen_location=mortgage_step1*', {
      statusCode: 500,
      body: { status: 'error', message: 'Server error' }
    }).as('dropdownError');
    
    cy.visit('/services/calculate-mortgage/1');
    cy.wait('@dropdownError');
    
    // Form should still be usable with fallback behavior
    cy.get('[data-testid="property-price-input"]').should('be.visible');
    
    // Error messages should be displayed for failed dropdowns
    cy.contains('Failed to load').should('be.visible');
  });
});