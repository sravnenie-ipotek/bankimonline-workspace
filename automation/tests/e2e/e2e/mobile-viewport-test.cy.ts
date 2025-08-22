/// <reference types="cypress" />

describe('Mobile Viewport Responsive Tests', () => {
  const mobileViewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Samsung Galaxy S20', width: 412, height: 915 },
    { name: 'iPad Mini', width: 768, height: 1024 }
  ];

  const criticalPages = [
    '/services/refinance-mortgage/1',
    '/services/refinance-mortgage/2',
    '/services/calculate-mortgage/1',
    '/services/calculate-credit/1',
    '/services/borrowers-personal-data/1',
    '/services/borrowers-personal-data/2'
  ];

  mobileViewports.forEach(viewport => {
    describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      beforeEach(() => {
        cy.viewport(viewport.width, viewport.height);
      });

      criticalPages.forEach(page => {
        it(`should have accessible buttons on ${page}`, () => {
          cy.visit(page);
          cy.wait(2000); // Wait for page load

          // Check for submit/continue buttons
          cy.get('button[type="submit"], button:contains("המשך"), button:contains("שמור"), button:contains("חזור")').each($button => {
            // Check if button is visible in viewport
            cy.wrap($button).should('be.visible');
            
            // Check if button is within viewport bounds
            cy.wrap($button).then($el => {
              const rect = $el[0].getBoundingClientRect();
              
              // Button should be fully within viewport
              expect(rect.top, 'Button top position').to.be.at.least(0);
              expect(rect.bottom, 'Button bottom position').to.be.at.most(viewport.height);
              expect(rect.left, 'Button left position').to.be.at.least(0);
              expect(rect.right, 'Button right position').to.be.at.most(viewport.width);
              
              // Button should have minimum touch target size (44x44 iOS guideline)
              expect(rect.height, 'Button height').to.be.at.least(44);
              expect(rect.width, 'Button width').to.be.at.least(44);
            });
          });

          // Check for overflow issues
          cy.get('body').then($body => {
            const bodyRect = $body[0].getBoundingClientRect();
            expect(bodyRect.width, 'Body width should not exceed viewport').to.be.at.most(viewport.width);
          });

          // Check main form container
          cy.get('form, .form-container, [class*="container"]').first().then($form => {
            if ($form.length) {
              const formRect = $form[0].getBoundingClientRect();
              
              // Form should not extend beyond viewport
              expect(formRect.right, 'Form right edge').to.be.at.most(viewport.width + 20); // Small margin for scrollbar
              
              // Check if form is scrollable when needed
              if (formRect.height > viewport.height) {
                cy.wrap($form).should('have.css', 'overflow-y').and('not.equal', 'hidden');
              }
            }
          });

          // Specific check for the yellow submit button
          cy.get('button[type="submit"]').last().then($submitBtn => {
            if ($submitBtn.length) {
              const btnRect = $submitBtn[0].getBoundingClientRect();
              
              // Critical: Submit button must be fully visible
              expect(btnRect.bottom, `Submit button on ${page} is cut off`).to.be.at.most(viewport.height);
              
              // Should be clickable
              cy.wrap($submitBtn).should('not.be.disabled');
              
              // Test actual clickability (force not needed if properly visible)
              cy.wrap($submitBtn).click({ force: false });
            }
          });

          // Take screenshot for visual regression
          cy.screenshot(`mobile-${viewport.name.replace(' ', '-')}-${page.replace(/\//g, '-')}`);
        });
      });

      it('should handle RTL layout correctly', () => {
        cy.visit('/');
        
        // Check RTL direction is set
        cy.get('html').should('have.attr', 'dir', 'rtl');
        
        // Check elements are properly aligned for RTL
        cy.get('button, input, select').each($el => {
          cy.wrap($el).then(element => {
            const rect = element[0].getBoundingClientRect();
            // Elements should be within viewport
            expect(rect.left).to.be.at.least(0);
            expect(rect.right).to.be.at.most(viewport.width);
          });
        });
      });
    });
  });

  // Specific test for the reported issue
  it('should not have buttons outside viewport on refinance-mortgage page', () => {
    cy.viewport('iphone-x'); // 375x812
    cy.visit('/services/refinance-mortgage/1');
    cy.wait(2000);

    // Get the main form
    cy.get('form').should('exist');

    // Check the yellow "Save and Continue" button
    cy.contains('button', 'שמור והמשך').should($btn => {
      const rect = $btn[0].getBoundingClientRect();
      const viewportHeight = Cypress.config('viewportHeight');
      
      // This should FAIL with current bug
      expect(rect.bottom, 'Button bottom is outside viewport!').to.be.at.most(viewportHeight);
      expect(rect.top, 'Button should be visible').to.be.at.least(0);
    });

    // Check if parent container has proper mobile styles
    cy.get('.form-container, [class*="container"]').first().should($container => {
      const styles = window.getComputedStyle($container[0]);
      
      // Container should have proper mobile padding
      const paddingBottom = parseInt(styles.paddingBottom);
      expect(paddingBottom, 'Container needs padding for button').to.be.at.least(80);
    });
  });
});

// Additional visual regression test
describe('Mobile Visual Regression', () => {
  it('should capture mobile layout issues', () => {
    const criticalMobilePages = [
      { url: '/services/refinance-mortgage/1', name: 'refinance-mortgage-step1' },
      { url: '/services/borrowers-personal-data/2', name: 'borrowers-step2' }
    ];

    cy.viewport('iphone-x');

    criticalMobilePages.forEach(page => {
      cy.visit(page.url);
      cy.wait(2000);
      
      // Capture full page including elements outside viewport
      cy.document().then(doc => {
        const body = doc.body;
        const html = doc.documentElement;
        
        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );

        // Log if content exceeds viewport
        if (height > 812) { // iPhone X height
          cy.log(`⚠️ Page content (${height}px) exceeds viewport (812px)`);
        }
      });

      // Take screenshot
      cy.screenshot(`mobile-issue-${page.name}`, {
        capture: 'fullPage',
        overwrite: true
      });
    });
  });
});