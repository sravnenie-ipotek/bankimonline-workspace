/// <reference types="cypress" />

describe('Phase 5 Debug - API Investigation', () => {
  it('Should capture all network requests', () => {
    // Intercept all API calls to see what's actually being called
    cy.intercept('GET', '**/api/**').as('anyApiCall');
    cy.intercept('GET', '**').as('allRequests');
    
    // Visit the page
    cy.visit('/services/calculate-mortgage/1');
    
    // Wait a bit for page to load
    cy.wait(3000);
    
    // Log all intercepted requests
    cy.get('@allRequests.all').then((interceptions) => {
      console.log('Total requests:', interceptions.length);
      interceptions.forEach((interception) => {
        if (interception.request.url.includes('api')) {
          console.log('API Request:', interception.request.url);
        }
      });
    });
    
    // Check if form loaded
    cy.get('input[placeholder="1,000,000"]').should('be.visible');
    
    // Take screenshot
    cy.screenshot('api-debug-page-loaded');
  });
  
  it('Should test without waiting for specific APIs', () => {
    // Just visit and interact without waiting
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000); // Simple wait
    
    // Fill property price
    cy.get('input[placeholder="1,000,000"]')
      .should('be.visible')
      .clear()
      .type('2000000');
    
    // Try to click first dropdown we can find
    cy.get('.mantine-Select-root').first().click();
    cy.wait(500);
    
    // Check if dropdown opened
    cy.get('.mantine-Select-dropdown').should('be.visible');
    cy.get('.mantine-Select-item').should('exist');
    
    // Select first item
    cy.get('.mantine-Select-item').first().click();
    
    // Continue with other dropdowns
    cy.get('.mantine-Select-root').eq(1).click();
    cy.wait(500);
    cy.get('.mantine-Select-item').first().click();
    
    cy.get('.mantine-Select-root').eq(2).click();
    cy.wait(500);
    cy.get('.mantine-Select-item').first().click();
    
    // Take screenshot of progress
    cy.screenshot('api-debug-form-interaction');
  });
});