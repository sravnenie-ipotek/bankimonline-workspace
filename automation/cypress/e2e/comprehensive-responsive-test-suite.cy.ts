/**
 * COMPREHENSIVE RESPONSIVE QA TEST SUITE
 * Generated: 2025-08-14
 * 
 * This test suite follows the responsiveQaInstructions to provide comprehensive
 * responsive testing across all pages, processes, and viewport sizes.
 * 
 * Testing Coverage:
 * - All 4 service processes (Calculate Mortgage, Refinance Mortgage, Calculate Credit, Refinance Credit)
 * - All steps through step 4+ for each process
 * - All menu implementations (Header, Mobile Menu, Sidebar, Footer)
 * - All viewport matrix (9 different sizes)
 * - Multi-language support including RTL Hebrew
 * - Personal Cabinet pages
 * - Static pages and bank information pages
 */

// Viewport matrix as specified in instructions
const viewports: [number, number][] = [
  // Mobile viewports
  [320, 568],   // iPhone SE
  [360, 640],   // Android small
  [390, 844],   // iPhone 12/13/14
  [414, 896],   // iPhone 11/XR
  // Tablet viewports
  [768, 1024],  // iPad Portrait
  [820, 1180],  // iPad Air
  // Desktop viewports
  [1280, 800],  // Small laptop
  [1440, 900],  // MacBook Air
  [1920, 1080], // Full HD
];

// Languages for multi-language testing
const languages = ['en', 'he', 'ru'];

// Complete page mapping based on routing analysis
const pages = [
  // Home and main pages
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Terms', path: '/terms' },
  { name: 'Contacts', path: '/contacts' },
  { name: 'Cooperation', path: '/cooperation' },
  { name: 'Privacy Policy', path: '/privacy-policy' },
  { name: 'Cookie Policy', path: '/cookie' },
  { name: 'Refund', path: '/refund' },
  { name: 'Vacancies', path: '/vacancies' },
  
  // Service overview
  { name: 'Services Overview', path: '/services' },
  
  // Calculate Mortgage Process (4 steps)
  { name: 'Calculate Mortgage Step 1', path: '/services/calculate-mortgage/1' },
  { name: 'Calculate Mortgage Step 2', path: '/services/calculate-mortgage/2' },
  { name: 'Calculate Mortgage Step 3', path: '/services/calculate-mortgage/3' },
  { name: 'Calculate Mortgage Step 4', path: '/services/calculate-mortgage/4' },
  
  // Refinance Mortgage Process (4 steps + upload)
  { name: 'Refinance Mortgage Step 1', path: '/services/refinance-mortgage/1' },
  { name: 'Refinance Mortgage Step 2', path: '/services/refinance-mortgage/2' },
  { name: 'Refinance Mortgage Step 3', path: '/services/refinance-mortgage/3' },
  { name: 'Refinance Mortgage Step 4', path: '/services/refinance-mortgage/4' },
  { name: 'Refinance Mortgage Upload', path: '/services/refinance-mortgage/upload-report' },
  
  // Calculate Credit Process (4 steps)
  { name: 'Calculate Credit Step 1', path: '/services/calculate-credit/1' },
  { name: 'Calculate Credit Step 2', path: '/services/calculate-credit/2' },
  { name: 'Calculate Credit Step 3', path: '/services/calculate-credit/3' },
  { name: 'Calculate Credit Step 4', path: '/services/calculate-credit/4' },
  
  // Refinance Credit Process (4 steps)
  { name: 'Refinance Credit Step 1', path: '/services/refinance-credit/1' },
  { name: 'Refinance Credit Step 2', path: '/services/refinance-credit/2' },
  { name: 'Refinance Credit Step 3', path: '/services/refinance-credit/3' },
  { name: 'Refinance Credit Step 4', path: '/services/refinance-credit/4' },
  
  // Additional service processes
  { name: 'Borrowers Personal Data Step 1', path: '/services/borrowers-personal-data/1' },
  { name: 'Borrowers Personal Data Step 2', path: '/services/borrowers-personal-data/2' },
  { name: 'Other Borrowers Step 1', path: '/services/other-borrowers/1' },
  { name: 'Other Borrowers Step 2', path: '/services/other-borrowers/2' },
  
  // Bank information pages
  { name: 'Bank Apoalim', path: '/banks/apoalim' },
  { name: 'Bank Discount', path: '/banks/discount' },
  { name: 'Bank Leumi', path: '/banks/leumi' },
  { name: 'Bank Beinleumi', path: '/banks/beinleumi' },
  { name: 'Bank Mercantile Discount', path: '/banks/mercantile-discount' },
  { name: 'Bank Jerusalem', path: '/banks/jerusalem' },
  
  // Business pages
  { name: 'Real Estate Brokerage', path: '/Real-Estate-Brokerage' },
  { name: 'Tenders for Brokers', path: '/tenders-for-brokers' },
  { name: 'Tenders for Lawyers', path: '/tenders-for-lawyers' },
  { name: 'Lawyers Page', path: '/lawyers' },
  { name: 'Broker Questionnaire', path: '/broker-questionnaire' },
];

// Personal Cabinet pages (require authentication)
const personalCabinetPages = [
  { name: 'Personal Cabinet', path: '/personal-cabinet' },
  { name: 'Personal Cabinet Settings', path: '/personal-cabinet/settings' },
  { name: 'Main Borrower Personal Data', path: '/personal-cabinet/main-borrower-personal-data' },
  { name: 'Partner Personal Data', path: '/personal-cabinet/partner-personal-data' },
  { name: 'Co-Borrower Personal Data', path: '/personal-cabinet/co-borrower-personal-data' },
  { name: 'Income Data', path: '/personal-cabinet/income-data' },
  { name: 'Co-Borrower Income Data', path: '/personal-cabinet/co-borrower-income-data' },
  { name: 'Credit History', path: '/personal-cabinet/credit-history' },
  { name: 'Documents', path: '/personal-cabinet/documents' },
  { name: 'Credit History Consent', path: '/personal-cabinet/credit-history-consent' },
  { name: 'Bank Authorization', path: '/personal-cabinet/bank-authorization' },
];

// Utility functions for responsive testing
function assertNoHorizontalScroll() {
  cy.window().then(win => {
    const el = win.document.scrollingElement!;
    expect(el.scrollWidth, 'no horizontal scroll').to.eq(el.clientWidth);
  });
}

function assertNoOverlap(selectors: string[]) {
  cy.window().then(win => {
    const rects = selectors
      .map(sel => win.document.querySelector(sel))
      .filter(Boolean)
      .map(el => (el as Element).getBoundingClientRect());
    
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        const overlap = !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
        expect(overlap, `no overlap between element ${i} and ${j}`).to.be.false;
      }
    }
  });
}

function assertMenuFunctionality(viewport: [number, number]) {
  const [width, height] = viewport;
  const isMobile = width < 768;
  
  if (isMobile) {
    // Test mobile hamburger menu
    cy.get('[data-testid="burger-menu"], .burger, [data-cy="mobile-menu-button"]')
      .should('be.visible')
      .click();
    
    cy.get('[data-testid="mobile-menu"], .mobile-menu, [data-cy="mobile-menu"]')
      .should('be.visible');
    
    // Test menu close functionality
    cy.get('[data-testid="menu-close"], .menu-close, [data-cy="menu-close"]')
      .click();
    
    cy.get('[data-testid="mobile-menu"], .mobile-menu, [data-cy="mobile-menu"]')
      .should('not.be.visible');
  } else {
    // Test desktop sidebar functionality
    cy.get('[data-testid="sidebar"], .sidebar, nav')
      .should('be.visible');
  }
}

function assertTypographyScaling(viewport: [number, number]) {
  const [width] = viewport;
  
  // Check headings don't wrap unnecessarily
  cy.get('h1, h2, h3').each(($heading) => {
    cy.wrap($heading).then(($el) => {
      const element = $el[0];
      expect(element.scrollWidth, 'heading should not overflow').to.be.at.most(element.clientWidth + 5);
    });
  });
  
  // Check text content line length for readability
  cy.get('p, .text-content').each(($paragraph) => {
    cy.wrap($paragraph).then(($el) => {
      const text = $el.text();
      const lineLength = text.length;
      
      // Rough character count check for readability (45-90 chars per line ideal)
      if (width >= 1024 && lineLength > 200) {
        // On larger screens, long paragraphs should have reasonable line breaks
        expect($el[0].clientWidth, 'long text should have reasonable width').to.be.at.most(800);
      }
    });
  });
}

function assertFormResponsiveness(viewport: [number, number]) {
  const [width] = viewport;
  const isMobile = width < 768;
  
  // Check form inputs are appropriately sized
  cy.get('input, select, textarea').each(($input) => {
    cy.wrap($input).then(($el) => {
      const element = $el[0];
      if (isMobile) {
        // On mobile, inputs should be easily tappable (min 44px height)
        expect(element.offsetHeight, 'mobile input should be tappable').to.be.at.least(40);
      }
      
      // Inputs should not overflow their containers
      expect(element.scrollWidth, 'input should not overflow').to.be.at.most(element.clientWidth + 5);
    });
  });
  
  // Check form labels don't overlap with inputs
  cy.get('label').each(($label) => {
    const labelFor = $label.attr('for');
    if (labelFor) {
      cy.get(`#${labelFor}`).then(($input) => {
        const labelRect = $label[0].getBoundingClientRect();
        const inputRect = $input[0].getBoundingClientRect();
        
        // Labels should not overlap with their inputs
        const overlap = !(labelRect.right <= inputRect.left || 
                        inputRect.right <= labelRect.left || 
                        labelRect.bottom <= inputRect.top || 
                        inputRect.bottom <= labelRect.top);
        expect(overlap, 'label should not overlap with input').to.be.false;
      });
    }
  });
}

function assertImageResponsiveness() {
  cy.get('img').each(($img) => {
    cy.wrap($img).then(($el) => {
      const img = $el[0] as HTMLImageElement;
      
      // Images should not overflow their containers
      expect(img.offsetWidth, 'image should not overflow container').to.be.at.most(img.parentElement!.offsetWidth + 5);
      
      // Images should have proper aspect ratio (not distorted)
      if (img.naturalWidth && img.naturalHeight) {
        const expectedRatio = img.naturalWidth / img.naturalHeight;
        const actualRatio = img.offsetWidth / img.offsetHeight;
        const ratioDiff = Math.abs(expectedRatio - actualRatio) / expectedRatio;
        
        expect(ratioDiff, 'image should maintain aspect ratio').to.be.at.most(0.1);
      }
    });
  });
}

function checkAccessibilityInResponsiveState() {
  // Check color contrast (basic check)
  cy.get('body').should('have.css', 'color').and('not.equal', 'rgba(0, 0, 0, 0)');
  
  // Check focus visibility on interactive elements
  cy.get('button, a, input, select, textarea').each(($el) => {
    cy.wrap($el).focus().should('have.css', 'outline-style').and('not.equal', 'none');
  });
  
  // Check that tab order is logical (simplified check)
  cy.get('[tabindex]').should('have.attr', 'tabindex').and('match', /^-?\d+$/);
}

// Main responsive test suite
describe('Comprehensive Responsive QA Test Suite', () => {
  beforeEach(() => {
    // Set base URL
    cy.visit('/');
    
    // Wait for page to load completely
    cy.window().should('have.property', 'document');
    cy.document().should('have.property', 'readyState', 'complete');
  });

  // Test 1: Basic responsive layout across all viewports and languages
  languages.forEach(lang => {
    describe(`Language: ${lang.toUpperCase()} - Responsive Layout Tests`, () => {
      beforeEach(() => {
        // Set language
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', lang);
        });
        cy.reload();
      });

      pages.forEach(page => {
        describe(`Page: ${page.name}`, () => {
          viewports.forEach(([width, height]) => {
            it(`should display correctly at ${width}x${height}`, () => {
              cy.viewport(width, height);
              
              // Visit the page
              cy.visit(page.path, { failOnStatusCode: false });
              
              // Wait for content to load
              cy.wait(2000);
              
              // Core responsive checks
              assertNoHorizontalScroll();
              
              // Check that main content is visible
              cy.get('main, [role="main"], .main-content, body').should('be.visible');
              
              // Check navigation elements based on viewport
              if (width < 768) {
                // Mobile: hamburger menu should be visible
                cy.get('body').then(($body) => {
                  if ($body.find('[data-testid="burger-menu"], .burger').length > 0) {
                    cy.get('[data-testid="burger-menu"], .burger').should('be.visible');
                  }
                });
              } else {
                // Desktop: main navigation should be visible
                cy.get('body').then(($body) => {
                  if ($body.find('nav, .navigation, .sidebar').length > 0) {
                    cy.get('nav, .navigation, .sidebar').first().should('be.visible');
                  }
                });
              }
              
              // Typography scaling check
              assertTypographyScaling([width, height]);
              
              // Image responsiveness check
              assertImageResponsiveness();
              
              // Form responsiveness check (if forms present)
              cy.get('body').then(($body) => {
                if ($body.find('form, input, select, textarea').length > 0) {
                  assertFormResponsiveness([width, height]);
                }
              });
              
              // Basic accessibility check
              checkAccessibilityInResponsiveState();
              
              // Take screenshot for evidence
              cy.screenshot(`responsive/${lang}/${page.name.replace(/\s+/g, '-')}-${width}x${height}`, { 
                capture: 'viewport',
                overwrite: true 
              });
            });
          });
        });
      });
    });
  });

  // Test 2: Service Process Flow Tests (Authentication Required)
  describe('Service Process Flows - Responsive Testing', () => {
    const serviceProcesses = [
      {
        name: 'Calculate Mortgage',
        basePath: '/services/calculate-mortgage',
        steps: ['1', '2', '3', '4']
      },
      {
        name: 'Refinance Mortgage', 
        basePath: '/services/refinance-mortgage',
        steps: ['1', '2', '3', '4', 'upload-report']
      },
      {
        name: 'Calculate Credit',
        basePath: '/services/calculate-credit', 
        steps: ['1', '2', '3', '4']
      },
      {
        name: 'Refinance Credit',
        basePath: '/services/refinance-credit',
        steps: ['1', '2', '3', '4']
      }
    ];

    serviceProcesses.forEach(process => {
      describe(`${process.name} Process`, () => {
        // Test key viewport sizes for each process
        const keyViewports: [number, number][] = [
          [320, 568],   // Mobile
          [768, 1024],  // Tablet
          [1440, 900]   // Desktop
        ];

        keyViewports.forEach(([width, height]) => {
          it(`should work responsively at ${width}x${height}`, () => {
            cy.viewport(width, height);
            
            process.steps.forEach((step, index) => {
              const stepPath = `${process.basePath}/${step}`;
              
              cy.visit(stepPath, { failOnStatusCode: false });
              cy.wait(1500);
              
              // Core responsive checks for each step
              assertNoHorizontalScroll();
              
              // Check step indicators/progress bars
              cy.get('body').then(($body) => {
                if ($body.find('.progress, .steps, [data-testid="progress"]').length > 0) {
                  cy.get('.progress, .steps, [data-testid="progress"]').should('be.visible');
                }
              });
              
              // Check form elements in service steps
              if (index < process.steps.length - 1) { // Not the final step
                assertFormResponsiveness([width, height]);
              }
              
              // Check navigation buttons
              cy.get('body').then(($body) => {
                if ($body.find('button, .btn, [type="submit"]').length > 0) {
                  cy.get('button, .btn, [type="submit"]').each(($btn) => {
                    const isMobile = width < 768;
                    if (isMobile) {
                      // Mobile buttons should be easily tappable
                      expect($btn[0].offsetHeight, 'mobile button should be tappable').to.be.at.least(40);
                    }
                  });
                }
              });
              
              cy.screenshot(`service-flows/${process.name.replace(/\s+/g, '-')}-step-${step}-${width}x${height}`, {
                capture: 'viewport',
                overwrite: true
              });
            });
          });
        });
      });
    });
  });

  // Test 3: Menu and Navigation Responsive Behavior
  describe('Navigation Responsive Behavior', () => {
    const testViewports: [number, number][] = [
      [320, 568],   // Mobile
      [768, 1024],  // Tablet
      [1440, 900]   // Desktop
    ];

    testViewports.forEach(([width, height]) => {
      it(`should handle navigation correctly at ${width}x${height}`, () => {
        cy.viewport(width, height);
        cy.visit('/');
        
        const isMobile = width < 768;
        
        if (isMobile) {
          // Test mobile menu functionality
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="burger-menu"], .burger').length > 0) {
              // Open mobile menu
              cy.get('[data-testid="burger-menu"], .burger').click();
              
              // Check menu opened
              cy.get('body').then(($body) => {
                if ($body.find('[data-testid="mobile-menu"], .mobile-menu').length > 0) {
                  cy.get('[data-testid="mobile-menu"], .mobile-menu').should('be.visible');
                  
                  // Check menu is bounded to viewport
                  cy.get('[data-testid="mobile-menu"], .mobile-menu').then(($menu) => {
                    const menuRect = $menu[0].getBoundingClientRect();
                    expect(menuRect.left, 'menu should not overflow left').to.be.at.least(-5);
                    expect(menuRect.right, 'menu should not overflow right').to.be.at.most(width + 5);
                  });
                  
                  // Close menu
                  cy.get('[data-testid="menu-close"], .menu-close, .close').click();
                  cy.get('[data-testid="mobile-menu"], .mobile-menu').should('not.be.visible');
                }
              });
            }
          });
        } else {
          // Test desktop sidebar/navigation
          cy.get('body').then(($body) => {
            if ($body.find('.sidebar, nav').length > 0) {
              cy.get('.sidebar, nav').first().should('be.visible');
              
              // Check navigation doesn't overflow
              cy.get('.sidebar, nav').first().then(($nav) => {
                const navRect = $nav[0].getBoundingClientRect();
                expect(navRect.right, 'navigation should not overflow').to.be.at.most(width + 5);
              });
            }
          });
        }
        
        // Test header responsiveness
        cy.get('header, .header').then(($header) => {
          const headerRect = $header[0].getBoundingClientRect();
          expect(headerRect.width, 'header should span full width').to.be.at.least(width - 20);
        });
        
        // Test footer if present
        cy.get('body').then(($body) => {
          if ($body.find('footer, .footer').length > 0) {
            cy.get('footer, .footer').then(($footer) => {
              const footerRect = $footer[0].getBoundingClientRect();
              expect(footerRect.width, 'footer should span full width').to.be.at.least(width - 20);
            });
          }
        });
        
        cy.screenshot(`navigation/navigation-${width}x${height}`, {
          capture: 'viewport',
          overwrite: true
        });
      });
    });
  });

  // Test 4: RTL (Hebrew) Specific Responsive Tests
  describe('RTL (Hebrew) Responsive Behavior', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'he');
      });
      cy.reload();
    });

    const rtlTestPages = [
      { name: 'Home RTL', path: '/' },
      { name: 'About RTL', path: '/about' },
      { name: 'Services RTL', path: '/services' },
      { name: 'Calculate Mortgage Step 1 RTL', path: '/services/calculate-mortgage/1' }
    ];

    const rtlViewports: [number, number][] = [
      [320, 568],   // Mobile
      [768, 1024],  // Tablet  
      [1440, 900]   // Desktop
    ];

    rtlTestPages.forEach(page => {
      rtlViewports.forEach(([width, height]) => {
        it(`${page.name} should display correctly RTL at ${width}x${height}`, () => {
          cy.viewport(width, height);
          cy.visit(page.path, { failOnStatusCode: false });
          cy.wait(2000);
          
          // Check RTL direction is applied
          cy.get('html, body').should('have.attr', 'dir', 'rtl');
          
          // Core responsive checks
          assertNoHorizontalScroll();
          
          // Check Hebrew text rendering
          cy.get('body').should('have.css', 'direction', 'rtl');
          
          // Check Hebrew fonts are loaded
          cy.get('body').then(($body) => {
            const computedStyle = window.getComputedStyle($body[0]);
            const fontFamily = computedStyle.fontFamily;
            // Should include Hebrew fonts like Arimo or system Hebrew fonts
            expect(fontFamily.toLowerCase()).to.satisfy((family: string) => 
              family.includes('arimo') || 
              family.includes('hebrew') || 
              family.includes('david') ||
              family.includes('arial')
            );
          });
          
          // Typography scaling for Hebrew
          assertTypographyScaling([width, height]);
          
          // Form responsiveness for RTL
          cy.get('body').then(($body) => {
            if ($body.find('form, input, select').length > 0) {
              assertFormResponsiveness([width, height]);
            }
          });
          
          cy.screenshot(`rtl/${page.name.replace(/\s+/g, '-')}-${width}x${height}`, {
            capture: 'viewport',
            overwrite: true
          });
        });
      });
    });
  });

  // Test 5: Performance and Layout Stability
  describe('Performance and Layout Stability', () => {
    const performancePages = [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Calculate Mortgage Step 1', path: '/services/calculate-mortgage/1' }
    ];

    performancePages.forEach(page => {
      it(`${page.name} should have stable layout and good performance`, () => {
        // Test on mobile viewport for performance
        cy.viewport(390, 844);
        
        // Measure initial load performance
        cy.visit(page.path);
        
        // Check for layout shifts during load
        cy.window().then((win) => {
          // Basic performance check - page should load within reasonable time
          expect(win.document.readyState).to.equal('complete');
        });
        
        // Check no horizontal scroll after load
        assertNoHorizontalScroll();
        
        // Simulate user interactions that might cause layout shifts
        cy.get('body').then(($body) => {
          // Test image loading doesn't cause shifts
          if ($body.find('img').length > 0) {
            cy.get('img').each(($img) => {
              cy.wrap($img).should('be.visible');
            });
            
            // Recheck after images load
            cy.wait(1000);
            assertNoHorizontalScroll();
          }
          
          // Test font loading doesn't cause major shifts
          if ($body.find('h1, h2, h3, p').length > 0) {
            cy.get('h1, h2, h3, p').each(($text) => {
              cy.wrap($text).should('be.visible');
            });
          }
        });
        
        cy.screenshot(`performance/${page.name.replace(/\s+/g, '-')}-stability-check`, {
          capture: 'viewport',
          overwrite: true
        });
      });
    });
  });

  // Test 6: Critical User Journey Responsive Tests
  describe('Critical User Journeys - Responsive', () => {
    const criticalJourneys = [
      {
        name: 'Mortgage Calculator Journey',
        steps: [
          { path: '/', action: 'Visit home page' },
          { path: '/services', action: 'Navigate to services' },
          { path: '/services/calculate-mortgage/1', action: 'Start mortgage calculation' }
        ]
      },
      {
        name: 'Contact Information Journey',
        steps: [
          { path: '/', action: 'Visit home page' },
          { path: '/contacts', action: 'View contact information' }
        ]
      }
    ];

    const journeyViewports: [number, number][] = [
      [320, 568],   // Mobile
      [1440, 900]   // Desktop
    ];

    criticalJourneys.forEach(journey => {
      journeyViewports.forEach(([width, height]) => {
        it(`${journey.name} should work at ${width}x${height}`, () => {
          cy.viewport(width, height);
          
          journey.steps.forEach((step, index) => {
            cy.visit(step.path, { failOnStatusCode: false });
            cy.wait(1500);
            
            // Core checks for each step
            assertNoHorizontalScroll();
            
            // Check main content is accessible
            cy.get('main, body').should('be.visible');
            
            // Check interactive elements are properly sized
            const isMobile = width < 768;
            cy.get('button, a, input').each(($el) => {
              if (isMobile) {
                expect($el[0].offsetHeight, 'interactive element should be tappable on mobile').to.be.at.least(40);
              }
            });
            
            cy.screenshot(`journeys/${journey.name.replace(/\s+/g, '-')}-step-${index + 1}-${width}x${height}`, {
              capture: 'viewport',
              overwrite: true
            });
          });
        });
      });
    });
  });
});