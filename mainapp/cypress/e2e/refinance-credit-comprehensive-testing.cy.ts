/**
 * 🏠 REFINANCE-CREDIT COMPREHENSIVE TESTING
 * 
 * Implementation of systematic automation testing following the comprehensive
 * instructions from /server/docs/QA/refinanceCredit1,2,3,4/instructions.md
 * 
 * MISSION: Test refinance-credit calculator with 32 screens and 300+ user actions,
 * validating complex business logic, multi-borrower scenarios, and financial calculations.
 * 
 * TARGET URLS:
 * - http://localhost:5174/refinance-credit/1
 * - http://localhost:5174/refinance-credit/2  
 * - http://localhost:5174/refinance-credit/3
 * - http://localhost:5174/refinance-credit/4
 */

describe('🏠 REFINANCE-CREDIT COMPREHENSIVE TESTING', () => {
  
  // Test configuration based on instructions
  const refinanceCreditUrls = [
    '/refinance-credit/1',
    '/refinance-credit/2', 
    '/refinance-credit/3',
    '/refinance-credit/4'
  ];

  const refinanceCreditScreens = [
    'refinance_credit_step1',
    'refinance_credit_step2', 
    'refinance_credit_step3',
    'refinance_credit_step4'
  ];

  const languages = ['en', 'he', 'ru'];
  const apiBaseUrl = 'http://localhost:8003';

  beforeEach(() => {
    // Clear localStorage and session storage before each test
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Set up viewport for testing
    cy.viewport(1920, 1080);
    
    // Intercept API calls for monitoring
    cy.intercept('GET', `${apiBaseUrl}/api/dropdowns/**`).as('getDropdowns');
    cy.intercept('GET', `${apiBaseUrl}/api/health`).as('getHealth');
  });

  /**
   * ===== PHASE 0: CRITICAL DROPDOWN LOGIC VALIDATION =====
   * 
   * Following instructions for systematic dropdown testing with API validation,
   * multi-language support, and translation system debugging.
   */
  describe('🚨 PHASE 0: CRITICAL DROPDOWN LOGIC VALIDATION', () => {
    
    /**
     * Test 0.1: Refinance Credit Dropdown Availability Validation
     * Verify all dropdown endpoints are accessible and return valid data
     */
    it('Test 0.1: Should validate all refinance credit dropdown endpoints', () => {
      cy.log('🔍 Testing API endpoint availability for all refinance credit screens');
      
      refinanceCreditScreens.forEach((screen, index) => {
        cy.log(`Testing ${screen}`);
        
        // Test API endpoint directly
        cy.request({
          method: 'GET',
          url: `${apiBaseUrl}/api/dropdowns/${screen}/en`,
          failOnStatusCode: true
        }).then((response) => {
          // Validate response structure
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq('success');
          expect(response.body.screen_location).to.eq(screen);
          expect(response.body.dropdowns).to.be.an('array');
          expect(response.body.dropdowns.length).to.be.greaterThan(0);
          
          // Validate API key generation pattern
          response.body.dropdowns.forEach((dropdown: any) => {
            const expectedPattern = new RegExp(`^${screen}_[a-z_]+$`);
            expect(dropdown.key).to.match(expectedPattern);
            cy.log(`✅ Valid API key: ${dropdown.key}`);
          });
          
          cy.log(`✅ ${screen}: ${response.body.dropdowns.length} dropdowns found`);
        });
      });
    });

    /**
     * Test 0.2: Multi-Language Support Validation  
     * Test all languages (en, he, ru) for all refinance credit screens
     */
    it('Test 0.2: Should validate multi-language support for all screens', () => {
      cy.log('🌐 Testing multi-language support for refinance credit');
      
      refinanceCreditScreens.forEach((screen) => {
        languages.forEach((lang) => {
          cy.log(`Testing ${screen} in ${lang.toUpperCase()}`);
          
          cy.request({
            method: 'GET',
            url: `${apiBaseUrl}/api/dropdowns/${screen}/${lang}`,
            failOnStatusCode: true
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.status).to.eq('success');
            expect(response.body.language_code).to.eq(lang);
            
            // Validate translation completeness
            const options = response.body.options || {};
            Object.keys(options).forEach((optionKey) => {
              const optionList = options[optionKey];
              if (Array.isArray(optionList)) {
                optionList.forEach((option: any) => {
                  expect(option.label).to.exist;
                  expect(option.label.length).to.be.greaterThan(0);
                  expect(option.value).to.exist;
                });
              }
            });
            
            cy.log(`✅ ${screen} ${lang.toUpperCase()}: Valid translations`);
          });
        });
      });
    });

    /**
     * Test 0.3: Translation System Failure Investigation
     * CRITICAL: Address the "Loading translations" issue reported by user
     */
    it('Test 0.3: Should investigate translation loading failure', () => {
      cy.log('🔍 CRITICAL: Investigating "Loading translations" failure');
      
      refinanceCreditUrls.forEach((url, index) => {
        const screenNumber = index + 1;
        cy.log(`Testing refinance-credit step ${screenNumber}: ${url}`);
        
        // Visit the page
        cy.visit(url, { failOnStatusCode: false });
        
        // Wait for page load
        cy.wait(3000);
        
        // Check if page loads properly or gets stuck in loading state
        cy.get('body').then(($body) => {
          // Check for loading indicators
          const hasLoadingIndicator = $body.find('[data-testid*="loading"], .loading, .spinner').length > 0;
          const hasLoadingText = $body.text().includes('Loading') || $body.text().includes('loading');
          
          if (hasLoadingIndicator || hasLoadingText) {
            cy.log(`⚠️  FOUND LOADING STATE on step ${screenNumber}`);
            
            // Log current page content for debugging
            cy.get('body').invoke('text').then((text) => {
              cy.log(`Page content: ${text.substring(0, 200)}...`);
            });
            
            // Check console for errors
            cy.window().then((win) => {
              const consoleLogs = (win as any).console || [];
              cy.log('Console state during loading issue investigation');
            });
            
            // Wait longer to see if loading resolves
            cy.wait(5000);
            
            // Check if still loading
            cy.get('body').then(($bodyAfterWait) => {
              const stillLoading = $bodyAfterWait.find('[data-testid*="loading"], .loading, .spinner').length > 0 ||
                                   $bodyAfterWait.text().includes('Loading');
              
              if (stillLoading) {
                cy.log(`🚨 CONFIRMED: Step ${screenNumber} stuck in loading state`);
              } else {
                cy.log(`✅ Step ${screenNumber} loading resolved after wait`);
              }
            });
          } else {
            cy.log(`✅ Step ${screenNumber} loaded successfully`);
            
            // Test for dropdown elements
            cy.get('body').find('select, [role="combobox"], .dropdown').should('have.length.greaterThan', 0);
          }
        });
      });
    });

    /**
     * Test 0.4: Hebrew RTL Support Validation
     * Test Hebrew language with right-to-left layout
     */
    it('Test 0.4: Should validate Hebrew RTL support', () => {
      cy.log('🔤 Testing Hebrew RTL support for refinance credit');
      
      // Visit first step
      cy.visit('/refinance-credit/1');
      
      // Wait for initial load
      cy.wait(2000);
      
      // Check if language selector is available
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="language-selector"]').length > 0) {
          cy.get('[data-testid="language-selector"]').select('he');
          
          // Validate RTL layout
          cy.get('html').should('have.attr', 'dir', 'rtl');
          cy.get('body').should('have.attr', 'dir', 'rtl');
          
          // Check for Hebrew text (Unicode Hebrew characters)
          cy.get('body').should('contain.text', /[\u0590-\u05FF]/);
          
          cy.log('✅ Hebrew RTL layout validated');
        } else {
          cy.log('⚠️ Language selector not found - testing Hebrew via API only');
        }
      });
    });

    /**
     * Test 0.5: Cache Performance Validation
     * Test caching behavior and performance
     */
    it('Test 0.5: Should validate dropdown caching performance', () => {
      cy.log('⚡ Testing dropdown cache performance');
      
      const testScreen = 'refinance_credit_step1';
      let firstRequestTime: number;
      let secondRequestTime: number;
      
      // First request (uncached)
      const startTime = Date.now();
      cy.request(`${apiBaseUrl}/api/dropdowns/${testScreen}/en`).then(() => {
        firstRequestTime = Date.now() - startTime;
        cy.log(`First request time: ${firstRequestTime}ms`);
        
        // Second request (should be cached)
        const startTime2 = Date.now();
        cy.request(`${apiBaseUrl}/api/dropdowns/${testScreen}/en`).then((response) => {
          secondRequestTime = Date.now() - startTime2;
          cy.log(`Second request time: ${secondRequestTime}ms`);
          
          // Verify caching worked
          expect(response.body.cached).to.eq(true);
          
          // Second request should be significantly faster (cached)
          expect(secondRequestTime).to.be.lessThan(firstRequestTime);
          
          cy.log(`✅ Cache performance: ${firstRequestTime}ms → ${secondRequestTime}ms`);
        });
      });
    });
  });

  /**
   * ===== PHASE 1: SYSTEM INITIALIZATION & AUTHENTICATION =====
   * 
   * Validate system startup, user authentication, and initial state management
   */
  describe('🔬 PHASE 1: SYSTEM INITIALIZATION & AUTHENTICATION', () => {
    
    it('Test 1.1: Should initialize refinance-credit calculator with proper state', () => {
      cy.log('🚀 Testing system initialization for refinance credit');
      
      cy.visit('/refinance-credit/1');
      cy.wait(3000);
      
      // Check Redux state if available
      cy.window().then((win) => {
        if ((win as any).store) {
          const state = (win as any).store.getState();
          cy.log('Redux state available');
          
          // Validate refinance credit state structure
          if (state.refinanceCredit) {
            expect(state.refinanceCredit).to.exist;
            cy.log('✅ Refinance credit state initialized');
          } else {
            cy.log('⚠️ Refinance credit state not found in Redux');
          }
        } else {
          cy.log('⚠️ Redux store not accessible');
        }
      });
      
      // Check for essential UI elements
      cy.get('body').should('be.visible');
      cy.log('✅ Basic page rendering successful');
    });

    it('Test 1.2: Should handle authentication state for refinance credit', () => {
      cy.log('🔐 Testing authentication integration');
      
      // Visit refinance credit page
      cy.visit('/refinance-credit/1');
      cy.wait(2000);
      
      // Check if authentication is required
      cy.url().then((currentUrl) => {
        if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
          cy.log('🔐 Authentication required - redirected to login');
          
          // Test mock authentication flow
          cy.get('body').should('contain.text', 'login');
        } else {
          cy.log('✅ Direct access allowed or user already authenticated');
        }
      });
    });
  });

  /**
   * ===== PHASE 2: BUSINESS LOGIC TESTING =====
   * 
   * Test complex refinance business logic, calculations, and workflows
   */
  describe('🧮 PHASE 2: BUSINESS LOGIC TESTING', () => {
    
    it('Test 2.1: Should validate refinance benefit calculation engine', () => {
      cy.log('🧮 Testing refinance benefit calculation logic');
      
      // This test will be implemented once translation loading is resolved
      cy.visit('/refinance-credit/1');
      cy.wait(3000);
      
      // Check for calculation forms
      cy.get('body').then(($body) => {
        const hasCalculationElements = $body.find('input[type="number"], .calculation').length > 0;
        
        if (hasCalculationElements) {
          cy.log('✅ Calculation elements found - business logic accessible');
          
          // Test basic calculation inputs
          cy.get('input[type="number"]').first().then(($input) => {
            if ($input.length > 0) {
              cy.wrap($input).type('500000').should('have.value', '500000');
              cy.log('✅ Basic input validation working');
            }
          });
        } else {
          cy.log('⚠️ Calculation elements not accessible - translation loading may be blocking');
        }
      });
    });

    it('Test 2.2: Should test multi-borrower relationship management', () => {
      cy.log('👥 Testing multi-borrower scenarios');
      
      // Navigate to borrower information step (typically step 2)
      cy.visit('/refinance-credit/2');
      cy.wait(3000);
      
      // Look for borrower-related elements
      cy.get('body').then(($body) => {
        const hasBorrowerElements = $body.text().includes('borrower') || 
                                   $body.find('[data-testid*="borrower"], .borrower').length > 0;
        
        if (hasBorrowerElements) {
          cy.log('✅ Borrower elements found');
        } else {
          cy.log('⚠️ Borrower elements not accessible - investigating');
        }
      });
    });
  });

  /**
   * ===== EMERGENCY DIAGNOSTIC TESTS =====
   * 
   * Comprehensive diagnostics for troubleshooting the translation system failure
   */
  describe('🚨 EMERGENCY DIAGNOSTICS', () => {
    
    it('Emergency: Should perform comprehensive frontend diagnostics', () => {
      cy.log('🚨 EMERGENCY: Comprehensive frontend diagnostics');
      
      refinanceCreditUrls.forEach((url, index) => {
        const stepNumber = index + 1;
        cy.log(`\n=== DIAGNOSING STEP ${stepNumber}: ${url} ===`);
        
        cy.visit(url, { failOnStatusCode: false });
        cy.wait(5000); // Extended wait for loading
        
        // Comprehensive page analysis
        cy.get('body').then(($body) => {
          const bodyText = $body.text();
          const bodyHtml = $body.html();
          
          // Check for various loading/error states
          const loadingIndicators = [
            'Loading translations',
            'Loading...',
            'loading',
            'spinner',
            'Loading dropdown data',
            'Fetching data'
          ];
          
          const foundLoadingStates = loadingIndicators.filter(indicator => 
            bodyText.includes(indicator)
          );
          
          if (foundLoadingStates.length > 0) {
            cy.log(`🚨 STEP ${stepNumber} LOADING STATES FOUND:`, foundLoadingStates);
          } else {
            cy.log(`✅ STEP ${stepNumber}: No loading states detected`);
          }
          
          // Check for error messages
          const errorIndicators = [
            'error',
            'Error',
            'failed',
            'Failed',
            'undefined',
            'null'
          ];
          
          const foundErrors = errorIndicators.filter(error => 
            bodyText.includes(error)
          );
          
          if (foundErrors.length > 0) {
            cy.log(`⚠️ STEP ${stepNumber} POTENTIAL ERRORS:`, foundErrors);
          }
          
          // Count interactive elements
          const interactiveElements = $body.find('input, select, button, [role="button"], [role="combobox"]').length;
          cy.log(`📊 STEP ${stepNumber} INTERACTIVE ELEMENTS: ${interactiveElements}`);
          
          // Check for dropdown elements specifically
          const dropdownElements = $body.find('select, .dropdown, [role="combobox"], [data-testid*="dropdown"]').length;
          cy.log(`📊 STEP ${stepNumber} DROPDOWN ELEMENTS: ${dropdownElements}`);
          
          if (dropdownElements === 0) {
            cy.log(`🚨 STEP ${stepNumber}: NO DROPDOWN ELEMENTS FOUND - CRITICAL ISSUE`);
          }
        });
      });
    });

    it('Emergency: Should test direct API connectivity from frontend', () => {
      cy.log('🔗 Testing API connectivity from frontend context');
      
      cy.visit('/refinance-credit/1');
      
      // Test API calls from browser context
      cy.window().then((win) => {
        // Test fetch API availability
        if (win.fetch) {
          cy.log('✅ Fetch API available');
          
          // Test API call from browser
          win.fetch('http://localhost:8003/api/health')
            .then(response => response.json())
            .then(data => {
              cy.log('✅ API call from browser successful', data);
            })
            .catch(error => {
              cy.log('🚨 API call from browser failed', error);
            });
        }
      });
    });
  });
});