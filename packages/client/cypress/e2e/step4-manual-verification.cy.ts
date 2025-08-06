describe('Manual Step 4 Verification with State Setup', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    // Set up minimal required state for step 4 access
    cy.window().then((win) => {
      // Mock authentication state
      win.localStorage.setItem('persist:auth', JSON.stringify({
        isAuthenticated: true,
        token: 'mock-token',
        user: { phone: '972544123456' }
      }));
      
      // Mock basic form data to allow step 4 access
      win.localStorage.setItem('persist:calculateMortgage', JSON.stringify({
        propertyValue: 2500000,
        requestedAmount: 2000000,
        loanPeriod: 30,
        city: 'tel-aviv',
        propertyOwnership: 'no_property'
      }));
      
      win.localStorage.setItem('persist:borrowersPersonalData', JSON.stringify({
        nameSurname: 'Test User',
        birthday: '15/05/1985',
        education: 'university'
      }));
    });
  });

  const processes = [
    { name: 'Calculate Mortgage', url: '/services/calculate-mortgage/4' },
    { name: 'Calculate Credit', url: '/services/calculate-credit/4' },
    { name: 'Refinance Mortgage', url: '/services/refinance-mortgage/4' },
    { name: 'Refinance Credit', url: '/services/refinance-credit/4' }
  ];

  processes.forEach(process => {
    it(`${process.name} - Manual step 4 verification`, () => {
      cy.visit(process.url);
      cy.wait(3000);
      
      // Check if we successfully stayed on step 4 or got redirected
      cy.url().then(url => {
        if (url.includes('/4')) {
          cy.log(`✅ Successfully accessed ${process.name} step 4`);
          
          // Take screenshot
          cy.screenshot(`${process.name.replace(/\s+/g, '-')}-step4-success`);
          
          // Quick dropdown count
          cy.get('body').then($body => {
            const dropdowns = $body.find('select, [class*="dropdown"], [class*="select"]').length;
            cy.log(`Found ${dropdowns} dropdowns`);
          });
          
        } else {
          cy.log(`❌ Redirected away from step 4 for ${process.name}`);
          cy.log(`Current URL: ${url}`);
          
          // Take screenshot of where we ended up
          cy.screenshot(`${process.name.replace(/\s+/g, '-')}-redirected`);
        }
      });
    });
  });
});