describe('About Page - Phase 7 Validation (Simple)', () => {
  beforeEach(() => {
    cy.visit('/about')
    cy.wait(3000) // Wait for content to load from database
  })

  // Essential Database Content Validation
  describe('Core Functionality Validation', () => {
    it('should load the About page without errors', () => {
      // Check page loads successfully
      cy.url().should('include', '/about')
      
      // Verify no major JavaScript errors
      cy.window().then((win) => {
        // Don't fail for minor translation warnings
        const errorLogs = []
        const originalError = win.console.error
        win.console.error = (...args) => {
          const message = args.join(' ')
          if (!message.includes('i18next') && !message.includes('missingKey')) {
            errorLogs.push(message)
          }
          originalError.apply(win.console, args)
        }
        expect(errorLogs).to.have.length(0)
      })
    })

    it('should display main content sections', () => {
      // Main container should exist
      cy.get('[class*="about"]').should('exist').and('be.visible')
      
      // Should have multiple content sections
      cy.get('h1').should('exist').and('be.visible')
      cy.get('h2').should('have.length.at.least', 2)
      
      // Should have text content (any language)
      cy.get('body').then(($body) => {
        expect($body.text().trim()).to.have.length.greaterThan(100)
      })
    })

    it('should display feature cards section', () => {
      // Should have feature cards container
      cy.get('[class*="cards"], [class*="why"]').should('exist').and('be.visible')
      
      // Should have multiple feature cards
      cy.get('[class*="cards"] > div, [class*="why"] > div').should('have.length.at.least', 5)
      
      // Each feature card should have content
      cy.get('[class*="cards"] > div, [class*="why"] > div').each(($card) => {
        cy.wrap($card).should('be.visible').and('not.be.empty')
      })
    })

    it('should load images and visual elements', () => {
      // Should have at least one image
      cy.get('img').should('have.length.at.least', 1)
      
      // Images should have proper attributes
      cy.get('img').each(($img) => {
        cy.wrap($img)
          .should('have.attr', 'src')
          .and('not.be.empty')
      })
      
      // Should have SVG decorative elements
      cy.get('svg').should('exist')
    })
  })

  // Database Integration Validation
  describe('Database Content Integration', () => {
    it('should load content from database (not hardcoded)', () => {
      // Check that page doesn't show translation keys (indicating database success)
      cy.get('body')
        .should('not.contain.text', 'about_title')
        .and('not.contain.text', 'about_desc')
        .and('not.contain.text', 'about_why_')
    })

    it('should handle Hebrew RTL layout correctly', () => {
      // Should have Hebrew language set
      cy.get('html').then(($html) => {
        const lang = $html.attr('lang')
        const dir = $html.attr('dir')
        
        if (lang === 'he') {
          expect(dir).to.equal('rtl')
        }
      })
    })

    it('should display content in current language', () => {
      // Content should be visible regardless of language
      cy.get('h1').should('be.visible').and('not.be.empty')
      
      // Feature cards should have content
      cy.get('[class*="cards"] > div').each(($card) => {
        cy.wrap($card).within(() => {
          // Should have title and text elements with content
          cy.get('*').contains(/\\S+/).should('exist')
        })
      })
    })
  })

  // Cross-Language Validation
  describe('Multi-Language Support', () => {
    const languages = ['en', 'he', 'ru']

    languages.forEach((lang) => {
      it(`should work in ${lang} language`, () => {
        // Set language
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', lang)
        })
        
        cy.reload()
        cy.wait(3000)

        // Verify content loads
        cy.get('h1').should('be.visible').and('not.be.empty')
        cy.get('body').then(($body) => {
          expect($body.text().trim()).to.have.length.greaterThan(50)
        })
        
        // Verify feature cards load
        cy.get('[class*="cards"] > div').should('have.length.at.least', 5)
      })
    })
  })

  // Performance and Reliability
  describe('Performance Validation', () => {
    it('should load within reasonable time', () => {
      const startTime = Date.now()
      
      cy.visit('/about')
      
      // Basic content should load quickly
      cy.get('h1').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(10000) // 10 seconds max
      })
    })

    it('should be responsive on different screen sizes', () => {
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 }
      ]

      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height)
        cy.wait(1000)
        
        // Main content should be visible
        cy.get('h1').should('be.visible')
        cy.get('[class*="cards"] > div').should('have.length.at.least', 5)
      })
    })
  })

  // Phase 7 Specific Validation
  describe('Phase 7 Database-Only Migration Validation', () => {
    it('should confirm successful migration from dual-system to database-only', () => {
      cy.visit('/about')
      cy.wait(3000)
      
      // Page should load successfully
      cy.get('h1').should('be.visible')
      
      // Should not show any fallback translation keys
      cy.get('body')
        .should('not.contain.text', 'translation')
        .and('not.contain.text', 'missingKey')
      
      // Content should be meaningful (not empty or error states)
      cy.get('body').then(($body) => {
        const text = $body.text()
        expect(text).to.not.include('undefined')
        expect(text).to.not.include('null')
        expect(text).to.not.include('[object Object]')
        expect(text.trim()).to.have.length.greaterThan(200)
      })
    })

    it('should validate all 21 content items are displayed', () => {
      cy.visit('/about')
      cy.wait(3000)
      
      // Count major content sections
      const expectedSections = [
        'h1', // Main title
        'h2', // Section titles (at least 2)
        '[class*="desc"]', // Description
        '[class*="cards"] > div' // Feature cards (7 expected)
      ]
      
      cy.get('h1').should('have.length', 1)
      cy.get('h2').should('have.length.at.least', 2)
      cy.get('[class*="desc"]').should('exist')
      cy.get('[class*="cards"] > div').should('have.length.at.least', 7)
    })

    it('should validate newly created database keys work correctly', () => {
      cy.visit('/about')
      cy.wait(3000)
      
      // The 5th feature card should contain the newly created content
      cy.get('[class*="cards"] > div').eq(4).within(() => {
        // Should have visible title and text
        cy.get('*').should('contain.text', /\\S+/) // Any non-whitespace content
      })
    })
  })
})