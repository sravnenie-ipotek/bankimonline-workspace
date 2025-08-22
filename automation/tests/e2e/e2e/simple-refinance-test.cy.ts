describe('Simple Refinance Test', () => {
  it('Check what is actually on refinance step 1', () => {
    cy.visit('/services/refinance-mortgage/1', { timeout: 10000 });
    cy.wait(2000);
    
    // Take screenshot to see what's actually there
    cy.screenshot('refinance-step1-current-state');
    
    // Log all dropdowns found
    cy.get('body').then($body => {
      const selects = $body.find('select');
      const comboboxes = $body.find('[role="combobox"]');
      const dropdowns = $body.find('.dropdown, [class*="dropdown"]');
      const buttons = $body.find('button');
      const inputs = $body.find('input');
      
      cy.log(`Found ${selects.length} <select> elements`);
      cy.log(`Found ${comboboxes.length} [role="combobox"] elements`);
      cy.log(`Found ${dropdowns.length} dropdown class elements`);
      cy.log(`Found ${buttons.length} button elements`);
      cy.log(`Found ${inputs.length} input elements`);
      
      // Log all interactive elements with their text content
      const interactiveElements = $body.find('button, input, select, [role="button"], [tabindex]');
      cy.log(`Found ${interactiveElements.length} total interactive elements`);
      
      interactiveElements.each((index, element) => {
        const tagName = element.tagName;
        const type = element.getAttribute('type') || 'none';
        const testId = element.getAttribute('data-testid') || 'none';
        const name = element.getAttribute('name') || 'none';
        const placeholder = element.getAttribute('placeholder') || 'none';
        const text = element.textContent?.trim().substring(0, 30) || 'no text';
        
        cy.log(`Element ${index}: ${tagName} | type="${type}" | testid="${testId}" | name="${name}" | placeholder="${placeholder}" | text="${text}"`);
      });
      
      // Look specifically for Hebrew text patterns
      const hebrewElements = $body.find('*').filter((index, element) => {
        const text = element.textContent || '';
        return /[\u0590-\u05FF]/.test(text);
      });
      
      cy.log(`Found ${hebrewElements.length} elements with Hebrew text`);
      
      // Log form structure
      const forms = $body.find('form');
      cy.log(`Found ${forms.length} form elements`);
      
      if (forms.length > 0) {
        forms.each((index, form) => {
          const formInputs = $(form).find('input, select, textarea, button');
          cy.log(`Form ${index + 1} has ${formInputs.length} form controls`);
        });
      }
    });
  });
});