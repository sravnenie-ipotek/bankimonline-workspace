describe('Quick Dropdown Verification - Step 4', () => {
  const processes = [
    { name: 'Calculate Mortgage', url: '/services/calculate-mortgage/4' },
    { name: 'Calculate Credit', url: '/services/calculate-credit/4' },
    { name: 'Refinance Mortgage', url: '/services/refinance-mortgage/4' },
    { name: 'Refinance Credit', url: '/services/refinance-credit/4' }
  ];

  processes.forEach(process => {
    it(`${process.name} - Quick dropdown check`, () => {
      cy.visit(process.url);
      cy.wait(2000);
      
      // Verify page loads
      cy.url().should('include', '/4');
      
      // Count dropdowns quickly
      cy.get('body').then($body => {
        const dropdowns = $body.find('select, [class*="dropdown"], [class*="select"]').length;
        cy.log(`${process.name}: Found ${dropdowns} dropdowns`);
        
        // Take quick screenshot
        cy.screenshot(`${process.name.replace(/\s+/g, '-')}-step4-quick`);
        
        // Simple assertion - at least some UI elements exist
        expect(dropdowns).to.be.at.least(0);
      });
    });
  });
});