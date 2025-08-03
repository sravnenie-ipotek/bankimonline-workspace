/// <reference types="cypress" />

/**
 * Quick Dropdown Diagnostic Test
 * 
 * Simple, fast test to identify dropdown issues without timeouts
 */

describe('Quick Dropdown Diagnostic', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  it('Should quickly check dropdown presence on key pages', () => {
    const testPages = [
      { name: 'Calculate Mortgage Step 1', url: '/services/calculate-mortgage/1' },
      { name: 'Calculate Mortgage Step 4', url: '/services/calculate-mortgage/4' },
      { name: 'Refinance Mortgage Step 3', url: '/services/refinance-mortgage/3' }
    ];

    testPages.forEach(page => {
      cy.log(`\n=== Testing ${page.name} ===`);
      
      // Visit page with short timeout
      cy.visit(page.url, { timeout: 10000 });
      cy.wait(2000);
      
      // Quick dropdown detection
      cy.get('body').then($body => {
        const dropdownSelectors = [
          'select',
          '[class*="dropdown"]',
          '[class*="select"]',
          '[role="combobox"]'
        ];
        
        let totalDropdowns = 0;
        dropdownSelectors.forEach(selector => {
          const count = $body.find(selector).length;
          totalDropdowns += count;
          if (count > 0) {
            cy.log(`Found ${count} elements with selector: ${selector}`);
          }
        });
        
        cy.log(`${page.name}: ${totalDropdowns} total dropdowns found`);
        
        // Test first dropdown if any exist
        if (totalDropdowns > 0) {
          const firstDropdown = $body.find('[class*="dropdown"], [class*="select"], select').first();
          if (firstDropdown.length > 0) {
            cy.log(`Testing first dropdown on ${page.name}`);
            cy.wrap(firstDropdown).click({ force: true, timeout: 5000 });
            cy.wait(500);
            
            // Check if options appeared
            cy.get('body').then($afterClick => {
              const optionCount = $afterClick.find('[class*="option"], [class*="item"], li[role="option"]').length;
              cy.log(`Options found after click: ${optionCount}`);
            });
          }
        }
        
        // Take screenshot for reference
        cy.screenshot(`${page.name.replace(/\s+/g, '-')}-diagnostic`);
      });
    });
  });

  it('Should test Step 3 validation components specifically', () => {
    cy.log('Testing Refinance Mortgage Step 3 - Validation Fix Components');
    
    cy.visit('/services/refinance-mortgage/3');
    cy.wait(3000);
    
    // Look for the specific components that were fixed
    const components = [
      'AdditionalIncome',
      'Obligation', 
      'MainSourceOfIncome'
    ];
    
    components.forEach(component => {
      cy.log(`Looking for ${component} component`);
      
      cy.get('body').then($body => {
        // Look for component by text content or common patterns
        const componentSelectors = [
          `[data-testid*="${component.toLowerCase()}"]`,
          `[class*="${component.toLowerCase()}"]`,
          `div:contains("${component}")`
        ];
        
        let found = false;
        componentSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            cy.log(`✅ Found ${component} with selector: ${selector}`);
            found = true;
            
            // Quick interaction test
            cy.get(selector).first().then($el => {
              if ($el.find('[class*="dropdown"], [class*="select"]').length > 0) {
                cy.log(`${component} has dropdown elements`);
                cy.wrap($el).find('[class*="dropdown"], [class*="select"]').first().click({ force: true });
                cy.wait(300);
              }
            });
          }
        });
        
        if (!found) {
          cy.log(`⚠️ ${component} not found on page`);
        }
      });
    });
    
    cy.screenshot('step3-validation-components-diagnostic');
  });
});