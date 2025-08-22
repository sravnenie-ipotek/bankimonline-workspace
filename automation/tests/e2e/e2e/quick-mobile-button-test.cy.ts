/// <reference types="cypress" />

describe('Mobile Button Overflow Test', () => {
  it('captures button overflow on refinance-mortgage page', () => {
    // Set iPhone X viewport
    cy.viewport(375, 812);
    
    // Visit the problematic page
    cy.visit('/services/refinance-mortgage/1');
    
    // Wait for page to load
    cy.wait(3000);
    
    // Take screenshot of full page
    cy.screenshot('refinance-mortgage-mobile-full', {
      capture: 'fullPage',
      overwrite: true
    });
    
    // Take viewport screenshot
    cy.screenshot('refinance-mortgage-mobile-viewport', {
      capture: 'viewport',
      overwrite: true
    });
    
    // Try to find the submit button
    cy.get('body').then($body => {
      // Log all buttons found
      const buttons = $body.find('button');
      cy.log(`Found ${buttons.length} buttons`);
      
      buttons.each((index, button) => {
        const rect = button.getBoundingClientRect();
        const text = button.innerText || button.textContent || '';
        cy.log(`Button ${index}: "${text}" at position Y: ${rect.top}, Height: ${rect.height}, Bottom: ${rect.bottom}`);
        
        // Check if button is outside viewport
        if (rect.bottom > 812) {
          cy.log(`⚠️ BUTTON OVERFLOW DETECTED: "${text}" is at ${rect.bottom}px (viewport height: 812px)`);
          
          // Take specific screenshot of the overflow issue
          cy.screenshot(`button-overflow-issue-${index}`, {
            capture: 'viewport',
            overwrite: true
          });
        }
      });
    });
    
    // Scroll to bottom to show button if it's below viewport
    cy.scrollTo('bottom');
    cy.wait(1000);
    cy.screenshot('refinance-mortgage-mobile-scrolled-bottom', {
      capture: 'viewport',
      overwrite: true
    });
    
    // Try to find yellow submit button specifically
    cy.get('button').then($buttons => {
      $buttons.each((index, el) => {
        const $el = Cypress.$(el);
        const bgColor = $el.css('background-color');
        const text = $el.text();
        
        // Check for yellow/gold colors or submit-like text
        if (bgColor.includes('rgb(255') || bgColor.includes('rgb(254') || 
            text.includes('המשך') || text.includes('שמור')) {
          cy.log(`Found submit button: "${text}" with color: ${bgColor}`);
          
          // Get button position
          const rect = el.getBoundingClientRect();
          if (rect.bottom > 812) {
            cy.log(`❌ SUBMIT BUTTON OVERFLOW: Bottom at ${rect.bottom}px exceeds viewport (812px)`);
          }
        }
      });
    });
  });

  it('checks button on borrowers page 2 with dropdown', () => {
    cy.viewport(375, 812);
    
    cy.visit('/services/borrowers-personal-data/2');
    cy.wait(3000);
    
    cy.screenshot('borrowers-page2-mobile', {
      capture: 'fullPage',
      overwrite: true
    });
    
    // Check for dropdown duplicates
    cy.get('select').each(($select, index) => {
      const options = [];
      $select.find('option').each((i, option) => {
        options.push(option.text);
      });
      
      const uniqueOptions = [...new Set(options)];
      if (options.length !== uniqueOptions.length) {
        cy.log(`❌ DUPLICATE OPTIONS in dropdown ${index}: ${options.length} total, ${uniqueOptions.length} unique`);
        cy.screenshot(`dropdown-duplicates-${index}`, {
          capture: 'viewport',
          overwrite: true
        });
      }
    });
  });
});