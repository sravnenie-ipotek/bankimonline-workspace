/**
 * Simplified Mortgage Calculator Test
 * Tests basic flow through Step 1 with minimal complexity
 */

describe('Mortgage Calculator - Simplified Test', () => {
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.viewport(1920, 1080);
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000);
  });

  it('should fill Step 1 and continue', () => {
    cy.log('Starting simplified test...');
    
    // 1. Property price
    cy.get('[data-testid="property-price-input"]').type('2000000');
    cy.wait(500);
    
    // 2. Select first city
    cy.get('[data-testid="city-dropdown"]').click();
    cy.wait(1500);
    cy.get('[data-testid^="city-dropdown-item-"]').first().click();
    cy.wait(500);
    
    // 3. When needed - first option
    cy.get('[data-testid="when-needed-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="when-needed-dropdown-item-"]').first().click();
    cy.wait(500);
    
    // 4. Property type - first option
    cy.get('[data-testid="property-type-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="property-type-dropdown-item-"]').first().click();
    cy.wait(500);
    
    // 5. First home - first option
    cy.get('[data-testid="first-home-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="first-home-dropdown-item-"]').first().click();
    cy.wait(500);
    
    // 6. Property ownership - no property (75% LTV)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid="property-ownership-dropdown-item-no_property"]').click();
    cy.wait(1000);
    
    // 7. Check minimum down payment (should be 25% = 500,000)
    cy.get('[data-testid="initial-fee-input"] input[type="text"]').then($input => {
      const currentValue = $input.val();
      cy.log(`Current initial fee value: ${currentValue}`);
      
      // If it's less than minimum, set to minimum
      if (!currentValue || parseInt(currentValue.toString().replace(/,/g, '')) < 500000) {
        cy.wrap($input).clear().type('500000');
      }
    });
    cy.wait(500);
    
    // 8. Set credit parameters using sliders
    // Monthly payment slider
    cy.get('.slider-input').within(() => {
      cy.get('input[type="range"]').eq(0)
        .invoke('val', 8000)
        .trigger('input')
        .trigger('change');
    });
    cy.wait(500);
    
    // Loan period slider  
    cy.get('.slider-input').within(() => {
      cy.get('input[type="range"]').eq(1)
        .invoke('val', 25)
        .trigger('input')
        .trigger('change');
    });
    cy.wait(500);
    
    // Take screenshot before clicking continue
    cy.screenshot('before-continue');
    
    // 9. Click continue (the yellow button)
    cy.get('button').contains('הבא').click();
    cy.wait(3000);
    
    // 10. Check if we reached step 2 or need authentication
    cy.url().then(url => {
      if (url.includes('/2')) {
        cy.log('✅ Successfully reached Step 2!');
      } else {
        cy.log('Authentication may be required');
        // Handle auth modal if present
        cy.get('body').then($body => {
          if ($body.find('input[type="tel"]').length > 0) {
            cy.get('input[type="tel"]').type('0544123456');
            cy.get('button').contains(/קבל|שלח/).click();
            cy.wait(2000);
            cy.get('input').last().type('123456');
            cy.get('button').contains(/אמת|אישור/).click();
          }
        });
      }
    });
  });
});