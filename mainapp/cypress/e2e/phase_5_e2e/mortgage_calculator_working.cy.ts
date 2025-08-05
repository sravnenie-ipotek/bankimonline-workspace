/// <reference types="cypress" />

describe('Phase 5 E2E - Mortgage Calculator Working Tests', () => {
  beforeEach(() => {
    // Set up API intercepts before visiting page
    cy.intercept('GET', '/api/v1/dropdowns?screen_location=mortgage_step1*').as('dropdownData');
    cy.intercept('GET', '/api/v1/calculation-parameters*').as('ltvParams');
    cy.intercept('GET', '/api/get-cities*').as('cities');
  });

  it('Should load mortgage calculator and verify dropdown data is fetched', () => {
    // Visit the page
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait for API calls to complete
    cy.wait('@dropdownData', { timeout: 10000 });
    cy.wait('@ltvParams', { timeout: 10000 });
    cy.wait('@cities', { timeout: 10000 });
    
    // Give the form time to render with the data
    cy.wait(2000);
    
    // Take a screenshot to see current state
    cy.screenshot('form-loaded-state');
    
    // Check that property price input is visible
    cy.get('input[placeholder="1,000,000"]').should('be.visible');
    
    // Try to interact with city dropdown using different selectors
    // Option 1: Using the Mantine Select component structure
    cy.get('.mantine-Select-root').first().within(() => {
      cy.get('input').click();
    });
    
    // Wait for dropdown to open
    cy.wait(500);
    
    // Check if dropdown items are visible
    cy.get('.mantine-Select-dropdown').should('be.visible');
    cy.get('.mantine-Select-item').should('have.length.at.least', 1);
    
    // Close dropdown
    cy.get('body').click(0, 0);
    
    // Take screenshot after interaction
    cy.screenshot('after-city-dropdown-interaction');
  });

  it('Should verify all form elements are present', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait for data to load
    cy.wait('@dropdownData');
    cy.wait('@ltvParams');
    cy.wait(2000);
    
    // Check for all form elements using various selectors
    
    // Property price - using placeholder
    cy.get('input[placeholder="1,000,000"]')
      .should('be.visible')
      .type('{selectall}2000000');
    
    // Find dropdowns by their container structure
    cy.get('.mantine-Select-root').should('have.length.at.least', 4);
    
    // Initial fee slider - look for slider component
    cy.get('.mantine-Slider-root').should('be.visible');
    
    // Credit params inputs
    cy.get('input[type="number"]').should('have.length.at.least', 2);
    
    // Submit button
    cy.get('button[type="submit"]').should('be.visible');
    
    cy.screenshot('all-form-elements');
  });

  it('Should interact with property ownership dropdown specifically', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait for data
    cy.wait('@dropdownData');
    cy.wait(2000);
    
    // Find property ownership dropdown - it should be the last dropdown in the form
    cy.get('.mantine-Select-root').last().within(() => {
      cy.get('input').click();
    });
    
    // Wait for dropdown to open
    cy.wait(500);
    
    // Verify options are present
    cy.get('.mantine-Select-dropdown').within(() => {
      cy.get('.mantine-Select-item').should('have.length.at.least', 3);
      
      // Click first option
      cy.get('.mantine-Select-item').first().click();
    });
    
    // Verify selection was made
    cy.get('.mantine-Select-root').last().within(() => {
      cy.get('input').should('not.have.value', '');
    });
    
    cy.screenshot('property-ownership-selected');
  });

  it('Should test the complete form flow without language switching', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait for all data to load
    cy.wait('@dropdownData');
    cy.wait('@ltvParams');
    cy.wait('@cities');
    cy.wait(2000);
    
    // Fill property price
    cy.get('input[placeholder="1,000,000"]')
      .clear()
      .type('2500000');
    
    // Select city (first dropdown)
    cy.get('.mantine-Select-root').eq(0).click();
    cy.wait(500);
    cy.get('.mantine-Select-item').first().click();
    
    // Select when needed (second dropdown)
    cy.get('.mantine-Select-root').eq(1).click();
    cy.wait(500);
    cy.get('.mantine-Select-item').first().click();
    
    // Set initial fee using the slider input
    cy.get('.mantine-Slider-root').parent().within(() => {
      cy.get('input[type="number"]').clear().type('750000');
    });
    
    // Select property type (third dropdown)
    cy.get('.mantine-Select-root').eq(2).click();
    cy.wait(500);
    cy.get('.mantine-Select-item').first().click();
    
    // Select first home (fourth dropdown)
    cy.get('.mantine-Select-root').eq(3).click();
    cy.wait(500);
    cy.get('.mantine-Select-item').first().click();
    
    // Select property ownership (fifth/last dropdown)
    cy.get('.mantine-Select-root').eq(4).click();
    cy.wait(500);
    cy.get('.mantine-Select-item').first().click();
    
    // Fill credit params
    cy.get('input[type="number"]').eq(1).clear().type('20'); // period
    cy.get('input[type="number"]').eq(2).clear().type('7000'); // monthly payment
    
    // Take screenshot of filled form
    cy.screenshot('form-filled-complete');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should show login modal
    cy.get('.mantine-Modal-root', { timeout: 5000 }).should('be.visible');
    
    cy.screenshot('login-modal-shown');
  });
});