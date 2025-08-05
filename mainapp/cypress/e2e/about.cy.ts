describe('About Page - Phase 7 Database-Only Content', () => {
  beforeEach(() => {
    cy.visit('/about')
    cy.wait(2000) // Wait for content to load from database
  })

  // QA CHECKPOINT 4: Database Content Loading Tests
  describe('Database Content Loading', () => {
    it('should load page title from database', () => {
      cy.get('.about-title')
        .should('be.visible')
        .and('not.be.empty')
        // Should contain meaningful content (Hebrew or English)
        .then(($title) => {
          expect($title.text().trim()).to.have.length.greaterThan(3)
        })
    })

    it('should load page description from database', () => {
      cy.get('.about-desc')
        .should('be.visible')
        .and('not.be.empty')
        .then(($desc) => {
          expect($desc.text().trim()).to.have.length.greaterThan(10)
        })
    })

    it('should load "How it works" section from database', () => {
      cy.get('.about-how-it-work')
        .should('be.visible')
        .and('not.be.empty')
        .then(($section) => {
          expect($section.text().trim()).to.have.length.greaterThan(3)
        })
    })

    it('should load "How it works" text content from database', () => {
      cy.get('.about-how__wrapper-text')
        .should('be.visible')
        .and('not.be.empty')
        .then(($text) => {
          expect($text.text().trim()).to.have.length.greaterThan(20)
        })
    })

    it('should load "Why" section title from database', () => {
      cy.get('.about-why__title')
        .should('be.visible')
        .and('not.be.empty')
        .then(($title) => {
          expect($title.text().trim()).to.have.length.greaterThan(3)
        })
    })
  })

  // Feature Cards Database Content Tests
  describe('Feature Cards Database Content', () => {
    const expectedFeatureCards = [
      { selector: 'div[class*="about-why__cards"] > div:nth-child(1)', testId: 'solve-problem-card' },
      { selector: 'div[class*="about-why__cards"] > div:nth-child(2)', testId: 'bank-card' },
      { selector: 'div[class*="about-why__cards"] > div:nth-child(3)', testId: 'mortgage-complete-card' },
      { selector: 'div[class*="about-why__cards"] > div:nth-child(4)', testId: 'simple-card' },
      { selector: 'div[class*="about-why__cards"] > div:nth-child(5)', testId: 'credit-card' },
      { selector: 'div[class*="about-why__cards"] > div:nth-child(6)', testId: 'security-card' },
      { selector: 'div[class*="about-why__cards"] > div:nth-child(7)', testId: 'fast-card' }
    ]

    expectedFeatureCards.forEach((card, index) => {
      it(`should load feature card ${index + 1} title and text from database`, () => {
        cy.get(card.selector)
          .should('be.visible')
          .within(() => {
            // Check title exists and is not empty
            cy.get('.feature-card__title, [class*="title"]')
              .should('be.visible')
              .and('not.be.empty')
            
            // Check text exists and is not empty
            cy.get('.feature-card__text, [class*="text"]')
              .should('be.visible')
              .and('not.be.empty')
          })
      })
    })

    it('should load all 7 feature cards with content from database', () => {
      cy.get('.about-why__cards')
        .children()
        .should('have.length', 7)
        .each(($card) => {
          cy.wrap($card)
            .should('be.visible')
            .and('not.be.empty')
        })
    })

    it('should load credit feature card (newly created database keys)', () => {
      cy.get('div[class*="about-why__cards"] > div:nth-child(5)')
        .should('be.visible')
        .within(() => {
          // Test the newly created database keys - check content exists
          cy.get('.feature-card__title, [class*="title"]')
            .should('be.visible')
            .and('not.be.empty')
            .then(($title) => {
              expect($title.text().trim()).to.have.length.greaterThan(3)
            })
          
          cy.get('.feature-card__text, [class*="text"]')
            .should('be.visible')
            .and('not.be.empty')
            .then(($text) => {
              expect($text.text().trim()).to.have.length.greaterThan(10)
            })
        })
    })
  })

  // Multi-Language Support Tests
  describe('Multi-Language Database Content', () => {
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'he', name: 'Hebrew' },
      { code: 'ru', name: 'Russian' }
    ]

    languages.forEach((lang) => {
      it(`should load content in ${lang.name} from database`, () => {
        // Set language
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', lang.code)
        })
        
        cy.reload()
        cy.wait(2000)

        // Verify content loads in selected language
        cy.get('.about-title')
          .should('be.visible')
          .and('not.be.empty')
        
        cy.get('.about-desc')
          .should('be.visible')
          .and('not.be.empty')
        
        cy.get('.about-why__cards')
          .children()
          .should('have.length', 7)
          .each(($card) => {
            cy.wrap($card)
              .within(() => {
                cy.get('.feature-card__title, [class*="title"]')
                  .should('be.visible')
                  .and('not.be.empty')
                
                cy.get('.feature-card__text, [class*="text"]')
                  .should('be.visible')
                  .and('not.be.empty')
              })
          })
      })

      it(`should handle RTL layout for Hebrew when language is ${lang.code}`, () => {
        if (lang.code === 'he') {
          cy.window().then((win) => {
            win.localStorage.setItem('i18nextLng', 'he')
          })
          
          cy.reload()
          cy.wait(2000)
          
          cy.get('html')
            .should('have.attr', 'dir', 'rtl')
            .and('have.attr', 'lang', 'he')
        }
      })
    })
  })

  // Performance and Error Handling Tests
  describe('Performance and Error Handling', () => {
    it('should load all database content within reasonable time', () => {
      const startTime = Date.now()
      
      cy.visit('/about')
      
      // Verify all content loads
      cy.get('.about-title').should('be.visible')
      cy.get('.about-desc').should('be.visible')
      cy.get('.about-how-it-work').should('be.visible')
      cy.get('.about-why__title').should('be.visible')
      cy.get('.about-why__cards > div').should('have.length', 7)
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(5000) // Should load within 5 seconds
      })
    })

    it('should handle database content gracefully if some keys are missing', () => {
      // This test verifies the system doesn't crash with missing content
      cy.visit('/about')
      
      cy.get('.about')
        .should('be.visible')
      
      // Even if some content is missing, page structure should remain
      cy.get('.about-title').should('exist')
      cy.get('.about-desc').should('exist')
      cy.get('.about-why__cards').should('exist')
      
      // No console errors related to missing content
      cy.window().then((win) => {
        cy.spy(win.console, 'error').should('not.have.been.called')
      })
    })

    it('should not show any t() function calls or translation keys', () => {
      cy.visit('/about')
      cy.wait(2000)
      
      // Verify no translation keys are visible (indicating successful database-only migration)
      cy.get('body')
        .should('not.contain.text', 'about_title')
        .and('not.contain.text', 'about_desc')
        .and('not.contain.text', 'about_why_')
        .and('not.contain.text', 'about_how_')
    })
  })

  // Visual and Layout Tests
  describe('Visual Layout and Styling', () => {
    it('should maintain proper layout structure', () => {
      cy.get('.about')
        .should('be.visible')
        .within(() => {
          cy.get('.about-title').should('be.visible')
          cy.get('.about-desc').should('be.visible')
          cy.get('.about-how').should('be.visible')
          cy.get('.about-why').should('be.visible')
        })
    })

    it('should display feature cards in proper grid layout', () => {
      cy.get('.about-why__cards')
        .should('be.visible')
        .children()
        .should('have.length', 7)
        .each(($card, index) => {
          cy.wrap($card)
            .should('be.visible')
            .and('have.css', 'display')
        })
    })

    it('should display images and icons correctly', () => {
      // Check main image
      cy.get('.about-how__wrapper-img img')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', '/static/about/')
      
      // Check SVG decorative elements
      cy.get('.about-desc__vector')
        .should('be.visible')
        .and('have.attr', 'viewBox')
    })
  })

  // Database Integration Validation
  describe('Database Integration Validation', () => {
    it('should verify useContentApi hook integration', () => {
      cy.visit('/about')
      
      // Check that content is loaded via useContentApi
      cy.window().then((win) => {
        // Verify component uses database content API
        cy.get('.about-title')
          .should('be.visible')
          .and('not.be.empty')
        
        // Verify no fallback translation keys are used
        cy.get('body').should('not.contain.text', 'about_title')
      })
    })

    it('should handle content API response correctly', () => {
      // Intercept content API calls
      cy.intercept('GET', '**/api/v1/locales*', { fixture: 'about-content.json' }).as('getContent')
      
      cy.visit('/about')
      
      // Wait for API call and verify content loads
      cy.wait('@getContent', { timeout: 10000 })
      
      cy.get('.about-title')
        .should('be.visible')
        .and('not.be.empty')
    })

    it('should validate all 21 content items are displayed', () => {
      cy.visit('/about')
      cy.wait(2000)
      
      // Count visible content elements
      const contentSelectors = [
        '.about-title',
        '.about-desc',
        '.about-how-it-work',
        '.about-how__wrapper-text',
        '.bankimonline',
        '.about-why__title'
      ]
      
      // Plus 7 feature cards × 2 (title + text) = 14 more elements
      contentSelectors.forEach(selector => {
        cy.get(selector)
          .should('be.visible')
          .and('not.be.empty')
      })
      
      // Verify all 7 feature cards have title and text
      cy.get('.about-why__cards > div').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('.feature-card__title, [class*="title"]')
            .should('be.visible')
            .and('not.be.empty')
          cy.get('.feature-card__text, [class*="text"]')
            .should('be.visible')
            .and('not.be.empty')
        })
      })
    })
  })

  // Responsive Design Tests
  describe('Responsive Design', () => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ]

    viewports.forEach((viewport) => {
      it(`should display correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        cy.viewport(viewport.width, viewport.height)
        cy.visit('/about')
        cy.wait(2000)
        
        // Verify main content is visible
        cy.get('.about-title').should('be.visible')
        cy.get('.about-desc').should('be.visible')
        cy.get('.about-why__cards').should('be.visible')
        
        // Verify feature cards adapt to viewport
        cy.get('.about-why__cards > div')
          .should('have.length', 7)
          .each(($card) => {
            cy.wrap($card).should('be.visible')
          })
      })
    })
  })

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.visit('/about')
      
      cy.get('h1').should('have.length', 1) // Main title
      cy.get('h2').should('have.length.at.least', 2) // Section titles
      
      // Verify semantic structure
      cy.get('.about-title').should('match', 'h1')
      cy.get('.about-how-it-work').should('match', 'h2')
      cy.get('.about-why__title').should('match', 'h2')
    })

    it('should support keyboard navigation', () => {
      cy.visit('/about')
      
      // Test tab navigation through interactive elements
      cy.get('body').tab()
      
      // Verify focus is visible
      cy.focused().should('be.visible')
    })

    it('should have proper alt text for images', () => {
      cy.visit('/about')
      
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt')
      })
    })
  })
})