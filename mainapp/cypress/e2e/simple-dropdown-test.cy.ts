describe('Simple Dropdown Test', () => {
  it('Check what is actually on step 1', () => {
    cy.visit('/services/calculate-mortgage/1', { timeout: 10000 });
    cy.wait(2000);
    
    // Take screenshot to see what's actually there
    cy.screenshot('step1-current-state');
    
    // Log all dropdowns found
    cy.get('body').then($body => {
      const selects = $body.find('select');
      const comboboxes = $body.find('[role="combobox"]');
      const dropdowns = $body.find('.dropdown, [class*="dropdown"]');
      
      cy.log(`Found ${selects.length} <select> elements`);
      cy.log(`Found ${comboboxes.length} [role="combobox"] elements`);
      cy.log(`Found ${dropdowns.length} dropdown class elements`);
      
      if (selects.length > 0) {
        selects.each((index, el) => {
          const name = el.getAttribute('name') || el.getAttribute('id') || `select-${index}`;
          const options = el.querySelectorAll('option').length;
          cy.log(`Select "${name}": ${options} options`);
        });
      }
      
      if (comboboxes.length > 0) {
        comboboxes.each((index, el) => {
          const name = el.getAttribute('data-testid') || el.getAttribute('id') || `combobox-${index}`;
          cy.log(`Combobox "${name}" found`);
        });
      }
      
      // If no standard dropdowns, log what form elements exist
      if (selects.length === 0 && comboboxes.length === 0) {
        const inputs = $body.find('input, textarea, button');
        cy.log(`No dropdowns found. Found ${inputs.length} other form elements`);
      }
    });
  });
});