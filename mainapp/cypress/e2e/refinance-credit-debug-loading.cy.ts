/**
 * 🔍 REFINANCE CREDIT LOADING DEBUG TEST
 * 
 * Focused investigation of the "Loading translations" issue
 * Based on analysis: API endpoints work correctly, issue is in frontend useContentApi hook
 */

describe('🔍 REFINANCE CREDIT LOADING DEBUG', () => {
  const apiBaseUrl = 'http://localhost:8003';
  
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport(1920, 1080);
    
    // Intercept the specific API calls used by useContentApi
    cy.intercept('GET', '/api/content/**').as('getContent');
    cy.intercept('GET', '/api/dropdowns/**').as('getDropdowns');
  });

  /**
   * Debug the exact loading behavior of useContentApi hook
   */
  it('Should debug useContentApi loading behavior on refinance credit step 1', () => {
    cy.log('🔍 Debugging useContentApi loading behavior');
    
    // Visit the page and monitor network requests
    cy.visit('/refinance-credit/1', { failOnStatusCode: false });
    
    // Wait for potential API calls
    cy.wait(2000);
    
    // Check if content API calls were made
    cy.get('@getContent.all').then((contentCalls) => {
      cy.log(`📊 Content API calls made: ${contentCalls.length}`);
      
      if (contentCalls.length > 0) {
        contentCalls.forEach((call, index) => {
          cy.log(`Content Call ${index + 1}: ${call.request.url}`);
          cy.log(`Response status: ${call.response?.statusCode}`);
        });
      } else {
        cy.log('⚠️ No content API calls detected');
      }
    });
    
    // Check for any loading indicators in the DOM
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      const bodyHtml = $body.html();
      
      // Check for specific loading patterns
      const loadingPatterns = [
        'Loading translations',
        'Loading...',
        'loading',
        'Loading content',
        'useContentApi'
      ];
      
      let foundLoadingPatterns = [];
      loadingPatterns.forEach(pattern => {
        if (bodyText.toLowerCase().includes(pattern.toLowerCase())) {
          foundLoadingPatterns.push(pattern);
        }
      });
      
      if (foundLoadingPatterns.length > 0) {
        cy.log(`🚨 Loading patterns found: ${foundLoadingPatterns.join(', ')}`);
      } else {
        cy.log('✅ No loading patterns found in DOM');
      }
      
      // Check for React error boundaries or error states
      if (bodyText.includes('Error') || bodyText.includes('Something went wrong')) {
        cy.log('🚨 Error state detected in DOM');
      }
      
      // Log current DOM structure for analysis
      const interactiveElements = $body.find('input, select, button, [data-testid]').length;
      cy.log(`📊 Interactive elements: ${interactiveElements}`);
      
      const dropdownElements = $body.find('[data-testid*="dropdown"], .dropdown, select').length;
      cy.log(`📊 Dropdown elements: ${dropdownElements}`);
    });
    
    // Check browser console for errors
    cy.window().then((win) => {
      // Check if React DevTools or any errors are present
      if ((win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        cy.log('✅ React DevTools detected');
      }
      
      // Try to access Redux store if available
      if ((win as any).store) {
        const state = (win as any).store.getState();
        cy.log('✅ Redux store accessible');
        
        // Check refinance credit state
        if (state.refinanceCredit) {
          cy.log('✅ Refinance credit Redux state exists');
        } else {
          cy.log('⚠️ Refinance credit Redux state missing');
        }
        
        // Check language state
        if (state.language) {
          cy.log(`🌐 Current language: ${state.language.language || 'not set'}`);
        }
      } else {
        cy.log('⚠️ Redux store not accessible');
      }
    });
    
    // Test the API endpoints directly from browser context
    cy.window().then((win) => {
      if (win.fetch) {
        // Test content API call
        cy.wrap(
          win.fetch('/api/content/refinance_credit_1/en')
            .then(res => res.json())
            .then(data => {
              cy.log('🌐 Direct content API call successful');
              cy.log(`Content items: ${data.content_count || 0}`);
              return data;
            })
            .catch(err => {
              cy.log('🚨 Direct content API call failed', err.message);
              throw err;
            })
        ).as('directContentCall');
      }
    });
    
    // Wait longer to see if loading resolves
    cy.wait(5000);
    
    // Check final state after extended wait
    cy.get('body').then(($body) => {
      const finalText = $body.text();
      const stillLoading = finalText.toLowerCase().includes('loading');
      
      if (stillLoading) {
        cy.log('🚨 CONFIRMED: Still in loading state after 7 seconds total');
        
        // Take screenshot for analysis
        cy.screenshot('refinance-credit-loading-stuck');
        
        // Try to find specific loading components
        cy.get('[data-testid*="loading"], .loading, .spinner').then(($loadingElements) => {
          if ($loadingElements.length > 0) {
            cy.log(`🔍 Found ${$loadingElements.length} loading elements`);
            $loadingElements.each((index, el) => {
              cy.log(`Loading element ${index + 1}: ${el.className}, ${el.textContent}`);
            });
          }
        });
        
      } else {
        cy.log('✅ Loading resolved, checking functionality');
        
        // Test basic functionality
        cy.get('input, select, button').should('have.length.greaterThan', 0);
        cy.log('✅ Interactive elements available');
      }
    });
  });

  /**
   * Test all 4 refinance credit steps for loading issues
   */
  it('Should test loading behavior across all refinance credit steps', () => {
    cy.log('🔍 Testing loading across all refinance credit steps');
    
    const steps = [1, 2, 3, 4];
    
    steps.forEach(stepNumber => {
      cy.log(`\n=== Testing Step ${stepNumber} ===`);
      
      cy.visit(`/refinance-credit/${stepNumber}`, { failOnStatusCode: false });
      cy.wait(3000);
      
      cy.get('body').then(($body) => {
        const text = $body.text();
        const isLoading = text.toLowerCase().includes('loading');
        
        if (isLoading) {
          cy.log(`🚨 Step ${stepNumber}: LOADING STATE DETECTED`);
        } else {
          cy.log(`✅ Step ${stepNumber}: No loading state`);
        }
        
        // Count functional elements
        const elements = $body.find('input, select, button, [data-testid]').length;
        cy.log(`📊 Step ${stepNumber}: ${elements} interactive elements`);
      });
    });
  });

  /**
   * Test API responses to ensure they match useContentApi expectations
   */
  it('Should validate API response format matches useContentApi expectations', () => {
    cy.log('🔍 Validating API response format');
    
    // Test content API format
    cy.request('/api/content/refinance_credit_1/en').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('success');
      expect(response.body.content).to.exist;
      expect(response.body.content_count).to.be.greaterThan(0);
      
      cy.log(`✅ Content API: ${response.body.content_count} items`);
      
      // Check specific keys that useContentApi looks for
      const content = response.body.content;
      const sampleKeys = Object.keys(content).slice(0, 5);
      cy.log(`📋 Sample content keys: ${sampleKeys.join(', ')}`);
      
      // Validate structure matches useContentApi expectations
      sampleKeys.forEach(key => {
        const item = content[key];
        expect(item).to.have.property('value');
        expect(item).to.have.property('component_type');
        expect(item).to.have.property('language');
      });
      
      cy.log('✅ Content structure valid for useContentApi');
    });
    
    // Test dropdowns API format for comparison
    cy.request('/api/dropdowns/refinance_credit_step1/en').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('success');
      expect(response.body.dropdowns).to.exist;
      
      cy.log(`✅ Dropdowns API: ${response.body.dropdowns.length} dropdowns`);
    });
  });

  /**
   * Test browser networking to identify any connection issues
   */
  it('Should test browser network connectivity and CORS', () => {
    cy.log('🌐 Testing browser network connectivity');
    
    cy.visit('/refinance-credit/1');
    
    // Test CORS and network access
    cy.window().then((win) => {
      // Test fetch with full URL to check CORS
      cy.wrap(
        win.fetch('http://localhost:8003/api/health')
          .then(res => res.json())
          .then(data => {
            cy.log('✅ CORS and network connectivity working');
            cy.log(`Server status: ${data.status}`);
            return data;
          })
          .catch(err => {
            cy.log('🚨 Network/CORS issue detected', err.message);
            throw err;
          })
      );
      
      // Test relative URL (proxied)
      cy.wrap(
        win.fetch('/api/health')
          .then(res => res.json())
          .then(data => {
            cy.log('✅ Proxy routing working');
            return data;
          })
          .catch(err => {
            cy.log('🚨 Proxy routing issue', err.message);
            throw err;
          })
      );
    });
  });
});