
describe('Mobile Button Overflow Check', () => {
    it('should detect button positions on mobile', () => {
        cy.viewport(375, 812);
        cy.visit('/services/calculate-mortgage/1');
        cy.wait(2000);
        
        // Take screenshot
        cy.screenshot('mobile-button-check', { capture: 'fullPage' });
        
        // Check for buttons
        cy.get('button').then($buttons => {
            cy.log(`Found ${$buttons.length} buttons`);
            
            let overflowDetected = false;
            $buttons.each((index, button) => {
                const rect = button.getBoundingClientRect();
                if (rect.bottom > 812) {
                    cy.log(`⚠️ OVERFLOW: Button at ${rect.bottom}px exceeds viewport`);
                    overflowDetected = true;
                }
            });
            
            if (overflowDetected) {
                cy.screenshot('button-overflow-detected', { capture: 'viewport' });
            }
        });
    });
});
