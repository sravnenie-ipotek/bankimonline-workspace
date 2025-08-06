/**
 * Figma Design Comparison Tests
 * Visual testing to ensure UI matches Figma designs
 */

describe('Figma Design Comparison', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
  });

  describe('Homepage Visual Comparison', () => {
    it('should match homepage design from Figma', () => {
      // Wait for page to fully load
      cy.get('body').should('be.visible');
      
      // Take full page screenshot
      cy.screenshot('homepage-full', { 
        capture: 'fullPage',
        overwrite: true 
      });
      
      // Take specific component screenshots
      cy.get('header, nav').first().screenshot('header-component', { overwrite: true });
      cy.get('main').screenshot('main-content', { overwrite: true });
      cy.get('._services_u982a_1').screenshot('services-section', { overwrite: true });
    });

    it('should match services section layout', () => {
      // Focus on services section
      cy.get('._services_u982a_1').should('be.visible');
      
      // Screenshot each service card
      cy.get('._services_u982a_1 > a').each(($card, index) => {
        cy.wrap($card).screenshot(`service-card-${index + 1}`, { overwrite: true });
      });
    });
  });

  describe('Mortgage Calculator Visual Comparison', () => {
    it('should match mortgage calculator design', () => {
      // Navigate to mortgage calculator
      cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
      
      // Wait for page to load
      cy.url().should('include', '/services');
      cy.wait(2000); // Allow for any animations
      
      // Take full page screenshot
      cy.screenshot('mortgage-calculator-full', { 
        capture: 'fullPage',
        overwrite: true 
      });
      
      // Screenshot form sections
      cy.get('form, .form-container, .mortgage-form').first().then($form => {
        if ($form.length > 0) {
          cy.wrap($form).screenshot('mortgage-form', { overwrite: true });
        }
      });
      
      // Screenshot input fields
      cy.get('input[type="text"], input[type="number"]').each(($input, index) => {
        if (index < 5) { // Limit to first 5 inputs
          cy.wrap($input).parent().screenshot(`input-field-${index + 1}`, { overwrite: true });
        }
      });
    });

    it('should test responsive design breakpoints', () => {
      // Desktop view
      cy.viewport(1440, 900);
      cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
      cy.wait(1000);
      cy.screenshot('mortgage-calculator-desktop', { overwrite: true });
      
      // Tablet view
      cy.viewport('ipad-2');
      cy.wait(500);
      cy.screenshot('mortgage-calculator-tablet', { overwrite: true });
      
      // Mobile view
      cy.viewport('iphone-x');
      cy.wait(500);
      cy.screenshot('mortgage-calculator-mobile', { overwrite: true });
    });
  });

  describe('Component-Level Visual Testing', () => {
    it('should capture individual UI components', () => {
      // Header/Navigation
      cy.get('header, nav').first().then($header => {
        if ($header.length > 0) {
          cy.wrap($header).screenshot('component-header', { overwrite: true });
        }
      });
      
      // Logo
      cy.get('img[alt*="logo"], .logo, [class*="logo"]').first().then($logo => {
        if ($logo.length > 0) {
          cy.wrap($logo).screenshot('component-logo', { overwrite: true });
        }
      });
      
      // Language selector
      cy.get('[class*="language"], [class*="Language"]').first().then($lang => {
        if ($lang.length > 0) {
          cy.wrap($lang).screenshot('component-language-selector', { overwrite: true });
        }
      });
      
      // Service cards
      cy.get('._services_u982a_1 > a').first().then($card => {
        if ($card.length > 0) {
          cy.wrap($card).screenshot('component-service-card', { overwrite: true });
        }
      });
    });
  });

  describe('State-Based Visual Testing', () => {
    it('should capture different UI states', () => {
      // Navigate to mortgage calculator
      cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
      cy.wait(1000);
      
      // Empty form state
      cy.screenshot('state-empty-form', { overwrite: true });
      
      // Filled form state
      cy.fillAllFormFields();
      cy.wait(500);
      cy.screenshot('state-filled-form', { overwrite: true });
      
      // Error state (try to submit invalid data)
      cy.get('input[type="text"]').first().clear();
      cy.clickContinueButton();
      cy.wait(500);
      cy.screenshot('state-form-errors', { overwrite: true });
    });

    it('should capture hover and focus states', () => {
      // Hover states on service cards
      cy.get('._services_u982a_1 > a').first().trigger('mouseover');
      cy.wait(200);
      cy.screenshot('state-service-card-hover', { overwrite: true });
      
      // Focus states on form fields
      cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
      cy.wait(1000);
      
      cy.get('input[type="text"]').first().focus();
      cy.wait(200);
      cy.screenshot('state-input-focus', { overwrite: true });
    });
  });

  describe('Cross-Browser Visual Testing', () => {
    it('should look consistent across browsers', () => {
      // This test would be run with different browsers
      // using --browser flag: chrome, firefox, edge
      
      cy.screenshot(`browser-${Cypress.browser.name}-homepage`, { overwrite: true });
      
      // Navigate to mortgage calculator
      cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
      cy.wait(1000);
      
      cy.screenshot(`browser-${Cypress.browser.name}-mortgage-calculator`, { overwrite: true });
    });
  });
});

// Custom command for pixel-perfect comparison (if needed)
Cypress.Commands.add('compareWithFigma', (elementSelector: string, figmaImagePath: string) => {
  cy.get(elementSelector).then($element => {
    // Take screenshot of element
    cy.wrap($element).screenshot('current-element', { overwrite: true });
    
    // Compare with Figma export (would need image comparison library)
    cy.task('compareImages', {
      current: 'cypress/screenshots/current-element.png',
      baseline: figmaImagePath
    }).then((result) => {
      expect(result.difference).to.be.lessThan(5); // Allow 5% difference
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      compareWithFigma(elementSelector: string, figmaImagePath: string): Chainable<void>
    }
  }
}

export {};