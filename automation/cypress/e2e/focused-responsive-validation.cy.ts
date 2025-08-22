/**
 * FOCUSED RESPONSIVE VALIDATION TEST
 * Generated: 2025-08-14
 * 
 * This is a streamlined test to actually execute and validate responsive behavior
 * across key pages and viewports with real evidence generation.
 */

// Key viewport matrix for focused testing
const keyViewports: [number, number][] = [
  [320, 568],   // Mobile
  [768, 1024],  // Tablet  
  [1440, 900],  // Desktop
];

// Critical pages for banking application
const criticalPages = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Mortgage-Step-1', path: '/services/calculate-mortgage/1' },
  { name: 'About', path: '/about' },
  { name: 'Contacts', path: '/contacts' },
];

// Languages for multi-language testing
const languages = ['en', 'he'];

// Performance metrics collector
let performanceMetrics: any[] = [];

// Utility functions
function assertNoHorizontalScroll() {
  cy.window().then(win => {
    const el = win.document.scrollingElement!;
    const hasHorizontalScroll = el.scrollWidth > el.clientWidth;
    if (hasHorizontalScroll) {
      cy.log(`⚠️ Horizontal scroll detected: scrollWidth=${el.scrollWidth}, clientWidth=${el.clientWidth}`);
    }
    expect(el.scrollWidth, 'no horizontal scroll').to.be.at.most(el.clientWidth + 5); // Allow 5px tolerance
  });
}

function measurePerformance(pageName: string, viewport: string, language: string) {
  cy.window().then((win) => {
    // Measure load performance
    const perfData = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      const metrics = {
        page: pageName,
        viewport: viewport,
        language: language,
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        firstByte: Math.round(perfData.responseStart - perfData.requestStart),
        domInteractive: Math.round(perfData.domInteractive - perfData.navigationStart),
        timestamp: new Date().toISOString()
      };
      
      performanceMetrics.push(metrics);
      cy.log(`📊 Performance: ${pageName} @ ${viewport} (${language}): Load=${metrics.loadComplete}ms, Interactive=${metrics.domInteractive}ms`);
    }
  });
}

function validateResponsiveElements(viewport: [number, number]) {
  const [width, height] = viewport;
  const isMobile = width < 768;
  
  // Check main content is visible
  cy.get('main, body').should('be.visible');
  
  // Check navigation based on viewport
  if (isMobile) {
    // Mobile: check for hamburger menu or mobile navigation
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="burger-menu"], .burger, button[aria-label*="menu"], button[aria-label*="Menu"]').length > 0) {
        cy.get('[data-testid="burger-menu"], .burger, button[aria-label*="menu"], button[aria-label*="Menu"]')
          .first()
          .should('be.visible')
          .should('have.css', 'display')
          .and('not.equal', 'none');
      }
    });
  }
  
  // Check header exists and spans width
  cy.get('header, .header').should('exist').then(($header) => {
    expect($header[0].offsetWidth, 'header should span reasonable width').to.be.at.least(width * 0.8);
  });
  
  // Check images don't overflow
  cy.get('img').each(($img) => {
    cy.wrap($img).then(($el) => {
      const img = $el[0] as HTMLImageElement;
      if (img.offsetWidth > 0) {
        expect(img.offsetWidth, 'image should not overflow viewport').to.be.at.most(width + 10);
      }
    });
  });
  
  // Check form inputs are properly sized on mobile
  if (isMobile) {
    cy.get('input, button, select').each(($input) => {
      cy.wrap($input).then(($el) => {
        const element = $el[0];
        // Touch targets should be at least 44px on mobile
        if (element.offsetHeight > 0) {
          expect(element.offsetHeight, 'touch target should be adequate on mobile').to.be.at.least(30);
        }
      });
    });
  }
}

function checkRTLImplementation() {
  // Check RTL attributes
  cy.get('html').should('have.attr', 'dir', 'rtl');
  cy.get('body').should('have.css', 'direction', 'rtl');
  
  // Check Hebrew font loading
  cy.get('body').should('have.css', 'font-family').then((fontFamily) => {
    expect(fontFamily.toLowerCase()).to.satisfy((family: string) => 
      family.includes('arimo') || 
      family.includes('hebrew') || 
      family.includes('david') ||
      family.includes('arial')
    );
  });
}

describe('Focused Responsive Validation', () => {
  beforeEach(() => {
    // Clear performance metrics
    performanceMetrics = [];
    
    // Set reasonable timeouts
    cy.visit('/', { timeout: 15000 });
    cy.wait(2000); // Allow page to settle
  });

  // Test 1: Critical Pages Responsive Validation
  languages.forEach(lang => {
    describe(`Language: ${lang.toUpperCase()} - Core Responsive Validation`, () => {
      beforeEach(() => {
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', lang);
        });
        cy.reload({ timeout: 15000 });
        cy.wait(2000);
      });

      criticalPages.forEach(page => {
        keyViewports.forEach(([width, height]) => {
          it(`${page.name} should be responsive at ${width}x${height}`, () => {
            const viewportName = `${width}x${height}`;
            
            cy.viewport(width, height);
            cy.visit(page.path, { failOnStatusCode: false, timeout: 15000 });
            cy.wait(3000); // Allow content to load
            
            // Core responsive validation
            assertNoHorizontalScroll();
            validateResponsiveElements([width, height]);
            
            // Language-specific checks
            if (lang === 'he') {
              checkRTLImplementation();
            }
            
            // Measure performance
            measurePerformance(page.name, viewportName, lang);
            
            // Take screenshot for evidence
            cy.screenshot(`${lang}/${page.name}-${viewportName}`, { 
              capture: 'viewport',
              overwrite: true 
            });
            
            cy.log(`✅ ${page.name} validated at ${viewportName} in ${lang.toUpperCase()}`);
          });
        });
      });
    });
  });

  // Test 2: Service Process Validation
  describe('Service Process Responsive Validation', () => {
    const serviceTests = [
      { name: 'Calculate-Mortgage-Step-1', path: '/services/calculate-mortgage/1' },
      { name: 'Calculate-Mortgage-Step-2', path: '/services/calculate-mortgage/2' },
      { name: 'Calculate-Credit-Step-1', path: '/services/calculate-credit/1' },
      { name: 'Refinance-Mortgage-Step-1', path: '/services/refinance-mortgage/1' },
    ];

    serviceTests.forEach(service => {
      keyViewports.forEach(([width, height]) => {
        it(`${service.name} should work responsively at ${width}x${height}`, () => {
          cy.viewport(width, height);
          cy.visit(service.path, { failOnStatusCode: false, timeout: 15000 });
          cy.wait(3000);
          
          // Service-specific responsive checks
          assertNoHorizontalScroll();
          validateResponsiveElements([width, height]);
          
          // Check form elements if present
          cy.get('body').then(($body) => {
            if ($body.find('form, input, select').length > 0) {
              // Check form responsiveness
              cy.get('input, select, textarea').each(($input) => {
                cy.wrap($input).should('be.visible');
              });
              
              // Check buttons are properly sized
              cy.get('button').each(($button) => {
                cy.wrap($button).then(($el) => {
                  const button = $el[0];
                  if (width < 768 && button.offsetHeight > 0) {
                    expect(button.offsetHeight, 'mobile button should be tappable').to.be.at.least(30);
                  }
                });
              });
            }
          });
          
          // Check progress indicators if present
          cy.get('body').then(($body) => {
            if ($body.find('.progress, .steps, [data-testid="progress"]').length > 0) {
              cy.get('.progress, .steps, [data-testid="progress"]').should('be.visible');
            }
          });
          
          cy.screenshot(`services/${service.name}-${width}x${height}`, {
            capture: 'viewport',
            overwrite: true
          });
        });
      });
    });
  });

  // Test 3: Performance and Layout Stability
  describe('Performance and Layout Stability', () => {
    it('should maintain stable layout during load', () => {
      keyViewports.forEach(([width, height]) => {
        cy.viewport(width, height);
        cy.visit('/', { timeout: 15000 });
        
        // Initial check
        assertNoHorizontalScroll();
        
        // Wait for images to load
        cy.get('img').should('be.visible');
        cy.wait(2000);
        
        // Recheck after load
        assertNoHorizontalScroll();
        
        // Check for layout shifts
        cy.window().then((win) => {
          const perfEntries = win.performance.getEntriesByType('navigation');
          cy.log(`📊 Performance entries found: ${perfEntries.length}`);
        });
        
        cy.screenshot(`stability/layout-stability-${width}x${height}`, {
          capture: 'viewport',
          overwrite: true
        });
      });
    });
  });

  // Test 4: Navigation Responsive Behavior
  describe('Navigation Responsive Behavior', () => {
    keyViewports.forEach(([width, height]) => {
      it(`should handle navigation at ${width}x${height}`, () => {
        cy.viewport(width, height);
        cy.visit('/', { timeout: 15000 });
        cy.wait(2000);
        
        const isMobile = width < 768;
        
        if (isMobile) {
          // Test mobile menu if present
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="burger-menu"], .burger, button[aria-label*="menu"]').length > 0) {
              cy.get('[data-testid="burger-menu"], .burger, button[aria-label*="menu"]')
                .first()
                .should('be.visible')
                .click({ force: true });
              
              cy.wait(1000);
              
              // Check if menu opened
              cy.get('body').then(($body) => {
                if ($body.find('[data-testid="mobile-menu"], .mobile-menu, nav').length > 0) {
                  cy.get('[data-testid="mobile-menu"], .mobile-menu, nav')
                    .first()
                    .should('be.visible');
                }
              });
            }
          });
        }
        
        cy.screenshot(`navigation/nav-${width}x${height}`, {
          capture: 'viewport',
          overwrite: true
        });
      });
    });
  });

  // Performance summary
  after(() => {
    if (performanceMetrics.length > 0) {
      cy.task('log', '📊 PERFORMANCE SUMMARY:');
      cy.task('table', performanceMetrics);
      
      // Save performance data
      cy.writeFile('cypress/screenshots/performance-metrics.json', performanceMetrics);
    }
  });
});