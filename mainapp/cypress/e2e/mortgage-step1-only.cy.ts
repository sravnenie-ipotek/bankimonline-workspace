/**
 * Mortgage Calculator - Step 1 Only Test
 * Focuses on properly filling out Step 1 with correct selectors
 */

describe('Mortgage Calculator - Step 1 Only', () => {
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.viewport(1920, 1080);
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000);
  });

  it('should properly fill all Step 1 fields', () => {
    cy.log('🏠 Testing Step 1 - Property Details');
    
    // 1. Property price - using the data-testid directly on the input
    cy.log('Setting property price...');
    cy.get('[data-testid="property-price-input"]')
      .should('be.visible')
      .type('2000000');
    cy.wait(500);
    cy.screenshot('01-property-price');
    
    // 2. City selection
    cy.log('Selecting city...');
    cy.get('[data-testid="city-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(2000); // Wait for cities to load
    // Select the first available city
    cy.get('[data-testid^="city-dropdown-item-"]')
      .should('have.length.greaterThan', 0)
      .first()
      .click();
    cy.wait(500);
    cy.screenshot('02-city-selected');
    
    // 3. When do you need the money
    cy.log('Selecting when money is needed...');
    cy.get('[data-testid="when-needed-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(500);
    cy.get('[data-testid^="when-needed-dropdown-item-"]')
      .should('exist')
      .first()
      .click();
    cy.wait(500);
    cy.screenshot('03-when-needed');
    
    // 4. Property type
    cy.log('Selecting property type...');
    cy.get('[data-testid="property-type-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(500);
    cy.get('[data-testid^="property-type-dropdown-item-"]')
      .should('exist')
      .first()
      .click();
    cy.wait(500);
    cy.screenshot('04-property-type');
    
    // 5. First home status
    cy.log('Selecting first home status...');
    cy.get('[data-testid="first-home-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(500);
    cy.get('[data-testid^="first-home-dropdown-item-"]')
      .should('exist')
      .first()
      .click();
    cy.wait(500);
    cy.screenshot('05-first-home');
    
    // 6. Property ownership - select "no property" for 75% LTV
    cy.log('Selecting property ownership (no property = 75% LTV)...');
    cy.get('[data-testid="property-ownership-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(500);
    cy.get('[data-testid="property-ownership-dropdown-item-no_property"]')
      .should('exist')
      .click();
    cy.wait(1000); // Wait for LTV calculation
    cy.screenshot('06-property-ownership');
    
    // 7. Initial payment (down payment)
    cy.log('Setting initial payment...');
    // The initial payment input should have the data-testid
    cy.get('[data-testid="initial-fee-input"]')
      .should('be.visible')
      .clear()
      .type('500000'); // 25% of 2,000,000
    cy.wait(500);
    cy.screenshot('07-initial-payment');
    
    // 8. Credit parameters - using class selectors since they don't have data-testids
    cy.log('Setting credit parameters...');
    
    // Find the credit params section by looking for the sliders
    cy.get('.slider-input').should('have.length.greaterThan', 0);
    
    // Monthly payment - usually the second slider section
    cy.get('.slider-input').eq(1).within(() => {
      // Type in the input field
      cy.get('input[type="text"]')
        .clear()
        .type('8000');
      
      // Or use the range slider
      cy.get('input[type="range"]')
        .invoke('val', 8000)
        .trigger('input')
        .trigger('change');
    });
    cy.wait(500);
    cy.screenshot('08-monthly-payment');
    
    // Loan period - usually the third slider section
    cy.get('.slider-input').eq(2).within(() => {
      // Type in the input field
      cy.get('input[type="text"]')
        .clear()
        .type('25');
        
      // Or use the range slider
      cy.get('input[type="range"]')
        .invoke('val', 25)
        .trigger('input')
        .trigger('change');
    });
    cy.wait(500);
    cy.screenshot('09-loan-period');
    
    // Take a final screenshot of the completed form
    cy.screenshot('10-form-complete');
    
    // 9. Verify all fields are filled
    cy.log('Verifying form completion...');
    
    // Check property price
    cy.get('[data-testid="property-price-input"]')
      .should('have.value', '2,000,000');
    
    // Check dropdowns have values selected
    cy.get('[data-testid="city-dropdown"] input')
      .should('not.have.value', '');
    
    cy.get('[data-testid="property-ownership-dropdown"] input')
      .should('have.value', 'אין לי נכס'); // Hebrew for "I don't own property"
    
    // 10. Click continue button
    cy.log('Clicking continue button...');
    cy.get('button')
      .contains('הבא') // Hebrew for "Next"
      .should('be.visible')
      .should('not.be.disabled')
      .click();
    
    cy.wait(3000);
    cy.screenshot('11-after-continue');
    
    // Check if we moved to step 2 or authentication modal
    cy.url().then(url => {
      cy.log(`Current URL: ${url}`);
      if (url.includes('/2')) {
        cy.log('✅ SUCCESS! Reached Step 2');
      } else {
        cy.log('📱 Authentication modal may be present');
      }
    });
  });

  it('should validate property ownership affects down payment minimum', () => {
    cy.log('🧪 Testing Property Ownership LTV Ratios');
    
    // Set property price first
    cy.get('[data-testid="property-price-input"]').type('1000000');
    cy.wait(500);
    
    // Test 1: No property (75% LTV = 25% minimum down)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown-item-no_property"]').click();
    cy.wait(1000);
    
    // Check that initial fee has minimum of 250,000
    cy.get('[data-testid="initial-fee-input"]').then($input => {
      const value = parseInt($input.val().toString().replace(/,/g, ''));
      expect(value).to.be.at.least(250000);
    });
    cy.screenshot('ltv-test-no-property');
    
    // Test 2: Has property (50% LTV = 50% minimum down)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown-item-has_property"]').click();
    cy.wait(1000);
    
    // Check that initial fee adjusted to minimum of 500,000
    cy.get('[data-testid="initial-fee-input"]').then($input => {
      const value = parseInt($input.val().toString().replace(/,/g, ''));
      expect(value).to.be.at.least(500000);
    });
    cy.screenshot('ltv-test-has-property');
    
    // Test 3: Selling property (70% LTV = 30% minimum down)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown-item-selling_property"]').click();
    cy.wait(1000);
    
    // Check that initial fee adjusted to minimum of 300,000
    cy.get('[data-testid="initial-fee-input"]').then($input => {
      const value = parseInt($input.val().toString().replace(/,/g, ''));
      expect(value).to.be.at.least(300000);
    });
    cy.screenshot('ltv-test-selling-property');
    
    cy.log('✅ Property ownership LTV tests passed!');
  });
});