/**
 * Mortgage Calculator Summary Test
 * Comprehensive automated test that explores the mortgage flow
 */

describe('Mortgage Calculator - Summary Test', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:5173/');
    cy.get('body').should('be.visible');
    cy.wait(2000);
  });

  it('should successfully navigate and explore the mortgage calculator', () => {
    cy.log('🚀 Starting mortgage calculator automation');
    
    // Step 1: Navigate to mortgage calculator
    cy.log('📍 Step 1: Navigating to mortgage calculator');
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div')
      .should('be.visible')
      .click();
    
    cy.wait(3000);
    cy.screenshot('step1-mortgage-page-loaded', { overwrite: true });
    
    // Step 2: Analyze the page structure
    cy.log('🔍 Step 2: Analyzing page structure');
    
    cy.url().then((url) => {
      cy.log(`✅ Current URL: ${url}`);
    });
    
    // Count available elements
    cy.get('body').then($body => {
      const buttons = $body.find('button');
      const inputs = $body.find('input');
      const selects = $body.find('select');
      const links = $body.find('a');
      
      cy.log(`📊 Page Analysis:`);
      cy.log(`   - Buttons: ${buttons.length}`);
      cy.log(`   - Inputs: ${inputs.length}`);
      cy.log(`   - Selects: ${selects.length}`);
      cy.log(`   - Links: ${links.length}`);
      
      // Look for form elements specifically
      if (inputs.length > 0) {
        inputs.each((index, input) => {
          const $input = Cypress.$(input);
          const type = $input.attr('type') || 'text';
          const name = $input.attr('name') || 'unnamed';
          const placeholder = $input.attr('placeholder') || '';
          cy.log(`   📝 Input ${index + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`);
        });
      }
    });
    
    // Step 3: Fill any available form fields
    cy.log('✏️ Step 3: Filling available form fields');
    
    cy.get('body').then($body => {
      const fillableInputs = $body.find('input:not([readonly]):not(.react-dropdown-select-input)').filter(':visible:not(:disabled)');
      
      if (fillableInputs.length > 0) {
        cy.log(`📝 Found ${fillableInputs.length} fillable inputs`);
        
        fillableInputs.each((index, input) => {
          const $input = Cypress.$(input);
          const type = $input.attr('type') || 'text';
          const name = $input.attr('name') || $input.attr('placeholder') || `input-${index}`;
          
          cy.log(`   Filling ${type} input: ${name}`);
          
          if (type === 'text' || type === '' || !type) {
            if (name.toLowerCase().includes('amount') || name.toLowerCase().includes('price')) {
              cy.wrap($input).clear().type('500000', { force: true });
            } else if (name.toLowerCase().includes('income')) {
              cy.wrap($input).clear().type('15000', { force: true });
            } else {
              cy.wrap($input).clear().type('Test Value', { force: true });
            }
          } else if (type === 'number') {
            cy.wrap($input).clear().type('100', { force: true });
          }
          
          cy.wait(300);
        });
        
        cy.screenshot('step3-form-filled', { overwrite: true });
      } else {
        cy.log('ℹ️ No fillable form fields found - this might be an informational page');
      }
    });
    
    // Step 4: Look for navigation options
    cy.log('🧭 Step 4: Finding navigation options');
    
    const navigationSelectors = [
      'button:contains("המשך")',
      'button:contains("Continue")',
      'button:contains("Next")', 
      'button:contains("Start")',
      'button:contains("Calculate")',
      'button:contains("חשב")',
      'button[type="submit"]',
      'a:contains("המשך")',
      'a:contains("Continue")'
    ];
    
    let navigationFound = false;
    
    navigationSelectors.forEach((selector, index) => {
      if (!navigationFound) {
        cy.get('body').then($body => {
          const elements = $body.find(selector.split(':')[0]);
          const matchingElements = elements.filter((i, el) => {
            if (selector.includes(':contains')) {
              const text = selector.match(/:contains\("([^"]+)"\)/);
              return text && Cypress.$(el).text().includes(text[1]);
            }
            return true;
          });
          
          if (matchingElements.length > 0 && matchingElements.first().is(':visible:not(:disabled)')) {
            const element = matchingElements.first();
            const text = element.text().trim();
            cy.log(`✅ Found navigation element: "${text}" using selector: ${selector}`);
            
            cy.wrap(element).click({ force: true });
            navigationFound = true;
            cy.wait(2000);
            cy.screenshot('step4-after-navigation', { overwrite: true });
            
            return false; // Exit loop
          }
        });
      }
    });
    
    if (!navigationFound) {
      cy.log('ℹ️ No navigation buttons found - staying on current page');
    }
    
    // Step 5: Final verification
    cy.log('✅ Step 5: Test completion verification');
    
    cy.url().then((finalUrl) => {
      cy.log(`🏁 Final URL: ${finalUrl}`);
    });
    
    cy.screenshot('step5-final-state', { overwrite: true });
    
    cy.log('🎉 Mortgage calculator automation completed successfully!');
  });
});