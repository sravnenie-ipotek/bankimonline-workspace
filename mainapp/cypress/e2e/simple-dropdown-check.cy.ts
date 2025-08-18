describe('Simple Dropdown Check', () => {
    it('Checks dropdowns on mortgage step 1', () => {
        cy.viewport(1920, 1080);
        
        // Visit the mortgage calculator
        cy.visit('/calculate-mortgage');
        
        // Wait for the page to load
        cy.wait(3000);
        
        // Log all dropdowns found
        cy.get('select').then($selects => {
            console.log(`Found ${$selects.length} select elements`);
            
            $selects.each((index, select) => {
                const $select = Cypress.$(select);
                const id = $select.attr('id') || 'no-id';
                const name = $select.attr('name') || 'no-name';
                const dataTestId = $select.attr('data-testid') || 'no-test-id';
                const options = $select.find('option');
                
                console.log(`Dropdown ${index + 1}:`);
                console.log(`  ID: ${id}`);
                console.log(`  Name: ${name}`);
                console.log(`  Test ID: ${dataTestId}`);
                console.log(`  Options: ${options.length}`);
                
                // Log first 3 options
                options.slice(0, 3).each((i, opt) => {
                    console.log(`    Option ${i + 1}: value="${Cypress.$(opt).val()}", text="${Cypress.$(opt).text()}"`);
                });
            });
        });
        
        // Also check for divs with role="combobox" (MUI dropdowns)
        cy.get('[role="combobox"], [role="button"][aria-haspopup="listbox"], .MuiSelect-select').then($combos => {
            console.log(`Found ${$combos.length} combobox/MUI elements`);
            
            $combos.each((index, combo) => {
                const $combo = Cypress.$(combo);
                const id = $combo.attr('id') || 'no-id';
                const ariaLabel = $combo.attr('aria-label') || 'no-label';
                const text = $combo.text();
                
                console.log(`Combobox ${index + 1}:`);
                console.log(`  ID: ${id}`);
                console.log(`  Label: ${ariaLabel}`);
                console.log(`  Text: ${text}`);
            });
        });
        
        // Check for any elements with data-testid containing "dropdown"
        cy.get('[data-testid*="dropdown"]').then($dropdowns => {
            console.log(`Found ${$dropdowns.length} elements with dropdown test IDs`);
            
            $dropdowns.each((index, dropdown) => {
                const $dropdown = Cypress.$(dropdown);
                const testId = $dropdown.attr('data-testid');
                const tagName = $dropdown.prop('tagName');
                const text = $dropdown.text().substring(0, 50);
                
                console.log(`Test Dropdown ${index + 1}:`);
                console.log(`  Test ID: ${testId}`);
                console.log(`  Tag: ${tagName}`);
                console.log(`  Text: ${text}...`);
            });
        });
        
        // Take a screenshot for visual inspection
        cy.screenshot('mortgage-step1-dropdowns');
    });
});