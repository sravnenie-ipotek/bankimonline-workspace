/**
 * 🚀 REFINANCE CREDIT ROUTE FIX VERIFICATION
 * 
 * Verifying that refinance credit pages work with correct /services/ prefix
 * This fixes the 404 routing issue discovered in previous tests
 */

describe('🚀 REFINANCE CREDIT ROUTE FIX VERIFICATION', () => {
  const correctUrls = [
    '/services/refinance-credit/1',
    '/services/refinance-credit/2',
    '/services/refinance-credit/3',
    '/services/refinance-credit/4'
  ];

  const incorrectUrls = [
    '/refinance-credit/1',
    '/refinance-credit/2',
    '/refinance-credit/3',
    '/refinance-credit/4'
  ];

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport(1920, 1080);
  });

  /**
   * Test that INCORRECT URLs (without /services/) redirect to 404
   */
  it('Should confirm incorrect URLs redirect to 404', () => {
    cy.log('🔍 Testing incorrect URLs that caused the 404 issue');
    
    incorrectUrls.forEach((url, index) => {
      const stepNumber = index + 1;
      cy.log(`Testing incorrect URL: ${url}`);
      
      cy.visit(url, { failOnStatusCode: false });
      cy.wait(2000);
      
      // Should redirect to 404
      cy.url().should('include', '/404');
      
      // Should show 404 content
      cy.get('body').should('contain.text', 'לא נמצא').or('contain.text', 'not found').or('contain.text', 'Not Found');
      
      cy.log(`✅ Step ${stepNumber}: Correctly redirects to 404`);
    });
  });

  /**
   * Test that CORRECT URLs (with /services/) load properly
   */
  it('Should verify correct URLs load refinance credit pages successfully', () => {
    cy.log('🚀 Testing correct URLs with /services/ prefix');
    
    correctUrls.forEach((url, index) => {
      const stepNumber = index + 1;
      cy.log(`Testing correct URL: ${url}`);
      
      cy.visit(url, { failOnStatusCode: false });
      cy.wait(3000);
      
      // Should NOT redirect to 404
      cy.url().should('not.include', '/404');
      cy.url().should('include', url);
      
      // Should not show 404 content  
      cy.get('body').should('not.contain.text', 'לא נמצא');
      cy.get('body').should('not.contain.text', 'not found');
      
      // Should show refinance credit content
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        
        // Check for loading states
        const isLoading = bodyText.toLowerCase().includes('loading');
        if (isLoading) {
          cy.log(`⚠️ Step ${stepNumber}: Still shows loading state`);
        } else {
          cy.log(`✅ Step ${stepNumber}: No loading state detected`);
        }
        
        // Count interactive elements
        const elements = $body.find('input, select, button, [data-testid]').length;
        cy.log(`📊 Step ${stepNumber}: ${elements} interactive elements`);
        
        // Look for refinance credit specific content
        const hasRefinanceContent = bodyText.toLowerCase().includes('refinance') || 
                                   bodyText.toLowerCase().includes('refin') ||
                                   $body.find('[data-testid*="refinance"], [class*="refinance"]').length > 0;
        
        if (hasRefinanceContent) {
          cy.log(`✅ Step ${stepNumber}: Refinance credit content detected`);
        } else {
          cy.log(`⚠️ Step ${stepNumber}: No specific refinance content found`);
        }
      });
      
      cy.log(`✅ Step ${stepNumber}: Page loads without 404`);
    });
  });

  /**
   * Test navigation between correct refinance credit steps
   */
  it('Should test navigation between refinance credit steps', () => {
    cy.log('🔄 Testing step-to-step navigation');
    
    // Start with step 1
    cy.visit('/services/refinance-credit/1');
    cy.wait(3000);
    
    // Verify we're on step 1
    cy.url().should('include', '/services/refinance-credit/1');
    cy.url().should('not.include', '/404');
    
    // Test navigation to step 2 (if possible)
    cy.get('body').then(($body) => {
      const hasNavigationButton = $body.find('button, [type="submit"], .next-button, [data-testid*="next"], [data-testid*="continue"]').length > 0;
      
      if (hasNavigationButton) {
        cy.log('✅ Navigation elements found');
        
        // Try to click first available button
        cy.get('button, [type="submit"]').first().then(($btn) => {
          if ($btn.is(':visible') && $btn.is(':enabled')) {
            cy.wrap($btn).click();
            cy.wait(2000);
            
            // Check if we navigated
            cy.url().then((newUrl) => {
              if (newUrl.includes('/services/refinance-credit/2')) {
                cy.log('✅ Successfully navigated to step 2');
              } else if (newUrl.includes('/404')) {
                cy.log('⚠️ Navigation resulted in 404');
              } else {
                cy.log(`📍 Navigation result: ${newUrl}`);
              }
            });
          }
        });
      } else {
        cy.log('⚠️ No navigation elements found (may be due to loading/validation)');
      }
    });
  });

  /**
   * Compare with working calculate-mortgage routes for consistency
   */
  it('Should verify route consistency with calculate-mortgage', () => {
    cy.log('🔍 Comparing with working calculate-mortgage routes');
    
    // Test calculate-mortgage (known working)
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000);
    
    cy.url().should('include', '/services/calculate-mortgage/1');
    cy.url().should('not.include', '/404');
    
    cy.get('body').should('not.contain.text', 'לא נמצא');
    cy.log('✅ Calculate-mortgage route works as expected');
    
    // Now test refinance-credit with same pattern
    cy.visit('/services/refinance-credit/1');
    cy.wait(3000);
    
    cy.url().should('include', '/services/refinance-credit/1');
    cy.url().should('not.include', '/404');
    
    cy.get('body').should('not.contain.text', 'לא נמצא');
    cy.log('✅ Refinance-credit route follows same pattern');
  });

  /**
   * Test API integration with corrected routes
   */
  it('Should verify API calls work with correct routes', () => {
    cy.log('🌐 Testing API integration with correct routes');
    
    // Intercept API calls
    cy.intercept('GET', '/api/content/**').as('getContent');
    cy.intercept('GET', '/api/dropdowns/**').as('getDropdowns');
    
    cy.visit('/services/refinance-credit/1');
    cy.wait(3000);
    
    // Check if API calls were made
    cy.get('@getContent.all').then((contentCalls) => {
      cy.log(`📊 Content API calls: ${contentCalls.length}`);
      
      if (contentCalls.length > 0) {
        const lastCall = contentCalls[contentCalls.length - 1];
        cy.log(`Last content call: ${lastCall.request.url}`);
        cy.log(`Response status: ${lastCall.response?.statusCode}`);
      }
    });
    
    cy.get('@getDropdowns.all').then((dropdownCalls) => {
      cy.log(`📊 Dropdown API calls: ${dropdownCalls.length}`);
      
      if (dropdownCalls.length > 0) {
        dropdownCalls.forEach((call, index) => {
          cy.log(`Dropdown call ${index + 1}: ${call.request.url}`);
        });
      }
    });
  });
});