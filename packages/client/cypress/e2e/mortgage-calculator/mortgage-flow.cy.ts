/**
 * Mortgage Calculator Flow Test - Robust Version
 * Tests the complete mortgage calculation process from homepage
 */

describe('Mortgage Calculator Flow', () => {
  beforeEach(() => {
    // Clear any existing data
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit homepage
    cy.visit('http://localhost:5173/');
    
    // Wait for page to load
    cy.get('body').should('be.visible');
    cy.wait(2000); // Allow for any loading animations
  });

  it('should navigate to mortgage calculator and explore the form', () => {
    // Step 1: Click on the first service (mortgage calculator)
    cy.log('Navigating to mortgage calculator');
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div')
      .should('be.visible')
      .click();
    
    // Wait for navigation and page load
    cy.wait(3000);
    
    // Step 2: Explore what's available on the page
    cy.log('Analyzing page structure');
    
    // Log current URL
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`);
    });
    
    // Find and log all buttons
    cy.get('button').then($buttons => {
      cy.log(`Found ${$buttons.length} buttons on the page`);
      $buttons.each((index, button) => {
        const text = Cypress.$(button).text().trim();
        const type = Cypress.$(button).attr('type') || 'no-type';
        const classes = Cypress.$(button).attr('class') || 'no-classes';
        cy.log(`Button ${index + 1}: "${text}" (type: ${type}, classes: ${classes})`);
      });
    });
    
    // Find and log all links that might be continue buttons
    cy.get('a').then($links => {
      const continueLinks = $links.filter((index, link) => {
        const text = Cypress.$(link).text().toLowerCase();
        return text.includes('continue') || text.includes('המשך') || text.includes('next') || text.includes('start');
      });
      cy.log(`Found ${continueLinks.length} potential continue links`);
    });
    
    // Find and log all inputs (check if any exist first)
    cy.get('body').then($body => {
      const inputs = $body.find('input');
      if (inputs.length > 0) {
        cy.log(`Found ${inputs.length} input fields`);
        inputs.each((index, input) => {
          const type = Cypress.$(input).attr('type') || 'text';
          const name = Cypress.$(input).attr('name') || 'unnamed';
          const placeholder = Cypress.$(input).attr('placeholder') || 'no-placeholder';
          cy.log(`Input ${index + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`);
        });
      } else {
        cy.log('No input fields found on this page');
      }
    });
    
    // Find and log all select elements (check if any exist first)
    cy.get('body').then($body => {
      const selects = $body.find('select');
      if (selects.length > 0) {
        cy.log(`Found ${selects.length} select dropdowns`);
      } else {
        cy.log('No select dropdowns found on this page');
      }
    });
    
    // Look for any elements with "continue", "next", "start" text
    cy.get('*').contains(/continue|המשך|next|start|begin|calculate|חשב/i).then($elements => {
      cy.log(`Found ${$elements.length} elements with continue/next/start text`);
      $elements.each((index, element) => {
        const tagName = element.tagName.toLowerCase();
        const text = Cypress.$(element).text().trim();
        const classes = Cypress.$(element).attr('class') || 'no-classes';
        cy.log(`Continue element ${index + 1}: <${tagName}> "${text}" (classes: ${classes})`);
      });
    });
  });

  it('should fill available form fields', () => {
    // Navigate to mortgage calculator
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    cy.wait(3000);
    
    // Check what types of inputs are actually available
    cy.get('body').then($body => {
      const allInputs = $body.find('input');
      cy.log(`Total inputs found: ${allInputs.length}`);
      
      if (allInputs.length > 0) {
        // Fill any text inputs that are found
        const textInputs = allInputs.filter('[type="text"], [type=""]').filter(':visible:not(:disabled)');
        if (textInputs.length > 0) {
          cy.log(`Found ${textInputs.length} text inputs`);
          textInputs.each((index, input) => {
            const $input = Cypress.$(input);
            const name = $input.attr('name') || $input.attr('placeholder') || `input-${index}`;
            cy.log(`Filling text input: ${name}`);
            
            // Fill with appropriate test data
            if (name.toLowerCase().includes('price') || name.toLowerCase().includes('amount')) {
              cy.wrap($input).clear().type('500000', { force: true });
            } else if (name.toLowerCase().includes('income')) {
              cy.wrap($input).clear().type('15000', { force: true });
            } else if (name.toLowerCase().includes('name')) {
              cy.wrap($input).clear().type('John Doe', { force: true });
            } else if (name.toLowerCase().includes('phone')) {
              cy.wrap($input).clear().type('0501234567', { force: true });
            } else if (name.toLowerCase().includes('email')) {
              cy.wrap($input).clear().type('test@example.com', { force: true });
            } else {
              cy.wrap($input).clear().type('Test Value', { force: true });
            }
            cy.wait(500);
          });
        } else {
          cy.log('No text inputs found');
        }
        
        // Fill any number inputs
        const numberInputs = allInputs.filter('[type="number"]').filter(':visible:not(:disabled)');
        if (numberInputs.length > 0) {
          cy.log(`Found ${numberInputs.length} number inputs`);
          numberInputs.each((index, input) => {
            const $input = Cypress.$(input);
            const name = $input.attr('name') || $input.attr('placeholder') || `number-${index}`;
            cy.log(`Filling number input: ${name}`);
            
            if (name.toLowerCase().includes('price') || name.toLowerCase().includes('amount')) {
              cy.wrap($input).clear().type('500000', { force: true });
            } else if (name.toLowerCase().includes('income')) {
              cy.wrap($input).clear().type('15000', { force: true });
            } else if (name.toLowerCase().includes('percent') || name.toLowerCase().includes('rate')) {
              cy.wrap($input).clear().type('3.5', { force: true });
            } else if (name.toLowerCase().includes('year')) {
              cy.wrap($input).clear().type('25', { force: true });
            } else {
              cy.wrap($input).clear().type('100', { force: true });
            }
            cy.wait(500);
          });
        } else {
          cy.log('No number inputs found');
        }
      } else {
        cy.log('No input fields found - this might not be a traditional form page');
      }
      
      // Handle select dropdowns
      const selects = $body.find('select');
      if (selects.length > 0) {
        cy.log(`Found ${selects.length} select dropdowns`);
        selects.filter(':visible:not(:disabled)').each((index, select) => {
          const $select = Cypress.$(select);
          cy.log(`Handling select dropdown ${index + 1}`);
          cy.wrap($select).find('option').then($options => {
            if ($options.length > 1) {
              const optionValue = $options.eq(1).val();
              const optionText = $options.eq(1).text();
              cy.log(`Selecting option: "${optionText}" (value: ${optionValue})`);
              cy.wrap($select).select(optionValue, { force: true });
              cy.wait(500);
            }
          });
        });
      } else {
        cy.log('No select dropdowns found');
      }
    });
    
    // Take a screenshot after attempting to fill
    cy.screenshot('mortgage-form-attempt', { overwrite: true });
  });

  it('should find and interact with any continue/submit mechanism', () => {
    // Navigate to mortgage calculator
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    cy.wait(3000);
    
    // Try to find any clickable element that might continue the flow
    const continueSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("המשך")',
      'button:contains("Continue")',
      'button:contains("Next")',
      'button:contains("Submit")',
      'button:contains("Calculate")',
      'button:contains("חשב")',
      'button:contains("התחל")',
      'button:contains("Start")',
      'a:contains("המשך")',
      'a:contains("Continue")',
      'a:contains("Next")',
      '.btn-primary',
      '.btn-continue',
      '.continue-btn',
      '.next-btn',
      '.submit-btn',
      '[data-testid="continue"]',
      '[data-testid="submit"]',
      '[data-testid="next"]'
    ];
    
    let buttonFound = false;
    
    continueSelectors.forEach((selector) => {
      if (!buttonFound) {
        cy.get('body').then($body => {
          const elements = $body.find(selector);
          if (elements.length > 0) {
            const element = elements.first();
            if (element.is(':visible') && !element.is(':disabled')) {
              const text = element.text().trim();
              const tagName = element.prop('tagName').toLowerCase();
              cy.log(`Found continue element: <${tagName}> "${text}" with selector: ${selector}`);
              
              // Try to click it
              cy.get(selector).first().click({ force: true });
              buttonFound = true;
              cy.wait(2000);
              
              // Take screenshot after click
              cy.screenshot('after-continue-click', { overwrite: true });
              
              return false; // Exit the loop
            }
          }
        });
      }
    });
    
    // If no button found, log what we tried
    if (!buttonFound) {
      cy.log('No continue button found. Tried the following selectors:');
      continueSelectors.forEach(selector => {
        cy.log(`- ${selector}`);
      });
    }
  });

  it('should complete a full exploration of the mortgage flow', () => {
    cy.log('Starting complete mortgage flow exploration');
    
    // Step 1: Navigate to mortgage calculator
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    cy.wait(3000);
    cy.screenshot('step-1-initial-page', { overwrite: true });
    
    // Step 2: Fill all available form fields
    cy.fillAllFormFields();
    cy.wait(1000);
    cy.screenshot('step-2-filled-form', { overwrite: true });
    
    // Step 3: Try to progress through multiple steps
    for (let step = 1; step <= 5; step++) {
      cy.log(`Attempting step ${step} progression`);
      
      // Look for any way to continue
      const found = cy.findAndClickContinue();
      
      if (found) {
        cy.wait(2000);
        cy.screenshot(`step-${step + 2}-after-continue`, { overwrite: true });
        
        // Fill any new fields that appeared
        cy.fillAllFormFields();
        cy.wait(1000);
      } else {
        cy.log(`No continue mechanism found at step ${step}`);
        break;
      }
    }
    
    // Final screenshot
    cy.screenshot('final-state', { overwrite: true });
  });
});

// Enhanced custom commands
Cypress.Commands.add('fillAllFormFields', () => {
  cy.log('Filling all available form fields');
  
  cy.get('body').then($body => {
    // Fill text inputs if they exist (skip readonly inputs)
    const textInputs = $body.find('input[type="text"], input[type=""], input:not([type])').filter(':visible:not(:disabled):not([readonly])');
    if (textInputs.length > 0) {
      cy.log(`Found ${textInputs.length} text inputs to fill`);
      textInputs.each((index, input) => {
        const $input = Cypress.$(input);
        const name = $input.attr('name') || $input.attr('placeholder') || `text-input-${index}`;
        const classes = $input.attr('class') || '';
        
        // Skip react-dropdown-select inputs as they're not meant to be filled directly
        if (classes.includes('react-dropdown-select-input')) {
          cy.log(`Skipping react-dropdown-select input: ${name}`);
          return;
        }
        
        cy.log(`Filling text input: ${name}`);
        
        if (name.toLowerCase().includes('price') || name.toLowerCase().includes('amount') || name.toLowerCase().includes('sum')) {
          cy.wrap($input).clear().type('500000', { force: true });
        } else if (name.toLowerCase().includes('income') || name.toLowerCase().includes('salary')) {
          cy.wrap($input).clear().type('15000', { force: true });
        } else if (name.toLowerCase().includes('name')) {
          cy.wrap($input).clear().type('John Doe', { force: true });
        } else if (name.toLowerCase().includes('phone') || name.toLowerCase().includes('telephone')) {
          cy.wrap($input).clear().type('0501234567', { force: true });
        } else if (name.toLowerCase().includes('email') || name.toLowerCase().includes('mail')) {
          cy.wrap($input).clear().type('test@example.com', { force: true });
        } else if (name.toLowerCase().includes('city') || name.toLowerCase().includes('address')) {
          cy.wrap($input).clear().type('Tel Aviv', { force: true });
        } else {
          cy.wrap($input).clear().type('Test Value', { force: true });
        }
        cy.wait(200);
      });
    } else {
      cy.log('No text inputs found');
    }
    
    // Fill number inputs if they exist
    const numberInputs = $body.find('input[type="number"]').filter(':visible:not(:disabled)');
    if (numberInputs.length > 0) {
      cy.log(`Found ${numberInputs.length} number inputs to fill`);
      numberInputs.each((index, input) => {
        const $input = Cypress.$(input);
        const name = $input.attr('name') || $input.attr('placeholder') || `number-input-${index}`;
        cy.log(`Filling number input: ${name}`);
        
        if (name.toLowerCase().includes('price') || name.toLowerCase().includes('amount') || name.toLowerCase().includes('sum')) {
          cy.wrap($input).clear().type('500000', { force: true });
        } else if (name.toLowerCase().includes('income') || name.toLowerCase().includes('salary')) {
          cy.wrap($input).clear().type('15000', { force: true });
        } else if (name.toLowerCase().includes('percent') || name.toLowerCase().includes('rate') || name.toLowerCase().includes('%')) {
          cy.wrap($input).clear().type('3.5', { force: true });
        } else if (name.toLowerCase().includes('year') || name.toLowerCase().includes('period')) {
          cy.wrap($input).clear().type('25', { force: true });
        } else if (name.toLowerCase().includes('age')) {
          cy.wrap($input).clear().type('35', { force: true });
        } else {
          cy.wrap($input).clear().type('100', { force: true });
        }
        cy.wait(200);
      });
    } else {
      cy.log('No number inputs found');
    }
    
    // Handle select dropdowns if they exist
    const selects = $body.find('select').filter(':visible:not(:disabled)');
    if (selects.length > 0) {
      cy.log(`Found ${selects.length} select dropdowns to handle`);
      selects.each((index, select) => {
        const $select = Cypress.$(select);
        cy.log(`Handling select dropdown ${index + 1}`);
        cy.wrap($select).find('option').then($options => {
          if ($options.length > 1) {
            const optionValue = $options.eq(1).val();
            const optionText = $options.eq(1).text();
            cy.log(`Selecting: "${optionText}"`);
            cy.wrap($select).select(optionValue, { force: true });
            cy.wait(200);
          }
        });
      });
    } else {
      cy.log('No select dropdowns found');
    }
    
    // Handle checkboxes that might be required
    const checkboxes = $body.find('input[type="checkbox"]').filter(':visible');
    if (checkboxes.length > 0) {
      cy.log(`Found ${checkboxes.length} checkboxes`);
      checkboxes.each((index, checkbox) => {
        const $checkbox = Cypress.$(checkbox);
        const name = $checkbox.attr('name') || `checkbox-${index}`;
        if (name.toLowerCase().includes('terms') || name.toLowerCase().includes('agree') || name.toLowerCase().includes('accept')) {
          cy.log(`Checking checkbox: ${name}`);
          cy.wrap($checkbox).check({ force: true });
          cy.wait(200);
        }
      });
    } else {
      cy.log('No checkboxes found');
    }
  });
});

Cypress.Commands.add('findAndClickContinue', () => {
  const selectors = [
    'button[type="submit"]:visible:not(:disabled)',
    'input[type="submit"]:visible:not(:disabled)',
    'button:contains("המשך"):visible:not(:disabled)',
    'button:contains("Continue"):visible:not(:disabled)',
    'button:contains("Next"):visible:not(:disabled)',
    'button:contains("Submit"):visible:not(:disabled)',
    'button:contains("Calculate"):visible:not(:disabled)',
    'button:contains("חשב"):visible:not(:disabled)',
    'button:contains("התחל"):visible:not(:disabled)',
    'a:contains("המשך"):visible',
    'a:contains("Continue"):visible',
    '.btn-primary:visible:not(:disabled)',
    '.continue-btn:visible:not(:disabled)',
    '.next-btn:visible:not(:disabled)'
  ];
  
  let found = false;
  
  selectors.forEach((selector) => {
    if (!found) {
      cy.get('body').then($body => {
        const elements = $body.find(selector.split(':visible')[0]);
        const visibleElements = elements.filter(':visible:not(:disabled)');
        
        if (visibleElements.length > 0) {
          const element = visibleElements.first();
          const text = element.text().trim();
          cy.log(`Found and clicking: "${text}" with selector: ${selector}`);
          
          cy.wrap(element).click({ force: true });
          found = true;
          return false;
        }
      });
    }
  });
  
  return cy.wrap(found);
});

declare global {
  namespace Cypress {
    interface Chainable {
      fillAllFormFields(): Chainable<void>
      findAndClickContinue(): Chainable<boolean>
    }
  }
}

export {};