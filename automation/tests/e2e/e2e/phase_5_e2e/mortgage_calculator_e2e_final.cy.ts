/// <reference types="cypress" />

describe('Phase 5 E2E - Mortgage Calculator Happy Path', () => {
  const languages = ['en', 'he', 'ru'];
  
  languages.forEach((lang) => {
    it(`Should complete mortgage calculator flow in ${lang.toUpperCase()}`, () => {
      // Visit the mortgage calculator with correct route
      cy.visit('/services/calculate-mortgage/1');
      
      // Fix language switching - set language after page load
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', lang);
        // Also set the language in the i18n instance directly
        if (win.i18next) {
          win.i18next.changeLanguage(lang);
        }
      });
      
      // Reload to apply language change
      cy.reload();
      
      // Wait for page to load and verify language
      cy.wait(2000);
      
      // Verify language was set
      cy.window().then((win) => {
        const storedLang = win.localStorage.getItem('i18nextLng');
        expect(storedLang).to.equal(lang);
      });
      
      // Step 1: Fill mortgage calculator form
      // Use actual data-testid attributes from the form
      
      // Property price input
      cy.get('[data-testid="property-price-input"]')
        .should('be.visible')
        .clear()
        .type('2000000');
      
      // City dropdown - using dataTestId from DropdownMenu component
      cy.get('[data-testid="city-dropdown"]')
        .should('be.visible')
        .click();
      cy.get('[data-testid="city-dropdown"] .mantine-Select-item')
        .first()
        .click();
      
      // When needed dropdown
      cy.get('[data-testid="when-needed-dropdown"]')
        .should('be.visible')
        .click();
      cy.get('[data-testid="when-needed-dropdown"] .mantine-Select-item')
        .first()
        .click();
      
      // Initial fee slider/input
      cy.get('[data-testid="initial-fee-input"]')
        .should('be.visible');
      // The SliderInput component should have the input field
      cy.get('[data-testid="initial-fee-input"] input')
        .clear()
        .type('500000');
      
      // Property type dropdown
      cy.get('[data-testid="property-type-dropdown"]')
        .should('be.visible')
        .click();
      cy.get('[data-testid="property-type-dropdown"] .mantine-Select-item')
        .first()
        .click();
      
      // First home dropdown
      cy.get('[data-testid="first-home-dropdown"]')
        .should('be.visible')
        .click();
      cy.get('[data-testid="first-home-dropdown"] .mantine-Select-item')
        .first()
        .click();
      
      // Property ownership dropdown (most important for Phase 5)
      cy.get('[data-testid="property-ownership-dropdown"]')
        .should('be.visible')
        .click();
      
      // Verify dropdown options are loaded from database
      cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
        .should('have.length.at.least', 3);
      
      // Select first option (no property - 75% LTV)
      cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
        .first()
        .click();
      
      // Fill credit params (period and monthly payment)
      // These are in the CreditParams component
      cy.get('input[name="period"]')
        .should('be.visible')
        .clear()
        .type('25');
      
      cy.get('input[name="monthlyPayment"]')
        .should('be.visible')
        .clear()
        .type('5000');
      
      // Verify API calls for dropdown data
      cy.intercept('GET', '/api/v1/dropdowns?screen_location=mortgage_step1*').as('dropdownData');
      
      // Submit form (continue button)
      cy.get('button[type="submit"]')
        .should('be.visible')
        .click();
      
      // Should show login modal for non-authenticated users
      cy.get('.modal', { timeout: 5000 }).should('be.visible');
    });
  });
  
  // Additional test to verify dropdown data is from database
  it('Should fetch dropdown data from database API', () => {
    // Set up intercepts before visiting
    cy.intercept('GET', '/api/v1/dropdowns?screen_location=mortgage_step1*').as('dropdownData');
    cy.intercept('GET', '/api/v1/calculation-parameters*').as('ltvParams');
    cy.intercept('GET', '/api/get-cities*').as('cities');
    
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait for API calls
    cy.wait('@dropdownData').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body).to.have.property('status', 'success');
      expect(interception.response.body.data).to.be.an('object');
      
      // Verify dropdown data structure
      const dropdowns = interception.response.body.data;
      expect(dropdowns).to.have.property('property_ownership');
      expect(dropdowns.property_ownership).to.have.property('options');
      expect(dropdowns.property_ownership.options).to.be.an('array');
      expect(dropdowns.property_ownership.options.length).to.be.at.least(3);
    });
    
    // Verify LTV parameters are fetched
    cy.wait('@ltvParams').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      const data = interception.response.body.data;
      expect(data).to.have.property('property_ownership_ltvs');
      expect(data.property_ownership_ltvs).to.have.property('no_property');
      expect(data.property_ownership_ltvs).to.have.property('has_property');
      expect(data.property_ownership_ltvs).to.have.property('selling_property');
    });
    
    // Verify cities are fetched
    cy.wait('@cities').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body).to.have.property('status', 'success');
      expect(interception.response.body.data).to.be.an('array');
    });
  });
  
  // Test property ownership affects initial payment validation
  it('Should enforce minimum down payment based on property ownership', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Set property price
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type('1000000');
    
    // Select "no property" (75% LTV = 25% min down payment)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown"] .mantine-Select-item')
      .first()
      .click();
    
    // Try to set initial payment below minimum (less than 250,000)
    cy.get('[data-testid="initial-fee-input"] input')
      .clear()
      .type('200000');
    
    // Blur to trigger validation
    cy.get('[data-testid="property-price-input"]').click();
    
    // Check that the value was auto-adjusted to minimum
    cy.get('[data-testid="initial-fee-input"] input')
      .should('have.value', '250,000');
    
    // Now select "has property" (50% LTV = 50% min down payment)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.contains('.mantine-Select-item', /own.*property|יש לי נכס|есть недвижимость/i)
      .click();
    
    // Value should auto-adjust to new minimum (500,000)
    cy.get('[data-testid="initial-fee-input"] input')
      .should('have.value', '500,000');
  });
});