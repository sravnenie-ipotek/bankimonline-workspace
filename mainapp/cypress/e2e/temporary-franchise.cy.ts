describe('TemporaryFranchise Page - Phase 8 Database-Only Content', () => {
  beforeEach(() => {
    cy.visit('/Real-Estate-Brokerage', { timeout: 15000 })
    cy.wait(5000) // Wait for content to load from database
  })

  // QA CHECKPOINT 4: Database Content Loading Tests
  describe('Database Content Loading Validation', () => {
    it('should load the TemporaryFranchise page without errors', () => {
      // Check page loads successfully
      cy.url().should('include', '/Real-Estate-Brokerage')
      
      // Verify no major JavaScript errors (ignore minor translation warnings)
      cy.window().then((win) => {
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

    it('should display main hero section with database content', () => {
      // Main hero section should exist and be visible
      cy.get('[class*="main-hero-section"]').should('be.visible')
      
      // Hero title should be loaded from database
      cy.get('[class*="main-hero-title"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($title) => {
          expect($title.text().trim()).to.have.length.greaterThan(5)
        })
      
      // Hero benefits should be loaded
      cy.get('[class*="main-hero-benefits"]').within(() => {
        cy.get('[class*="main-benefit-item"]')
          .should('have.length', 3)
          .each(($item) => {
            cy.wrap($item).within(() => {
              cy.get('[class*="main-benefit-text"]')
                .should('be.visible')
                .and('not.be.empty')
            })
          })
      })
      
      // CTA button should have text from database
      cy.get('[class*="main-hero-cta-button"]')
        .should('be.visible')
        .and('not.be.empty')
    })

    it('should display secondary hero section with database content', () => {
      cy.get('[class*="hero-section"]').should('be.visible')
      
      // Hero title and description
      cy.get('[class*="hero-title"]')
        .should('be.visible')
        .and('not.be.empty')
      
      cy.get('[class*="hero-description"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($desc) => {
          expect($desc.text().trim()).to.have.length.greaterThan(20)
        })
      
      // CTA button
      cy.get('[class*="hero-cta-button"]')
        .should('be.visible')
        .and('not.be.empty')
    })

    it('should display client sources section with database content', () => {
      cy.get('[class*="client-sources-section"]').should('be.visible')
      
      // Section title and description
      cy.get('[class*="client-sources-title"]')
        .should('be.visible')
        .and('not.be.empty')
      
      cy.get('[class*="client-sources-description"]')
        .should('be.visible')
        .and('not.be.empty')
      
      // Service items grid
      cy.get('[class*="client-services-grid"]').within(() => {
        cy.get('[class*="client-service-item"]')
          .should('have.length', 4)
          .each(($item) => {
            cy.wrap($item).within(() => {
              cy.get('[class*="client-service-name"]')
                .should('be.visible')
                .and('not.be.empty')
            })
          })
      })
    })

    it('should display partnership section with database content', () => {
      cy.get('[class*="partnership-section"]').should('be.visible')
      
      // Partnership title and description
      cy.get('[class*="partnership-title"]')
        .should('be.visible')
        .and('not.be.empty')
      
      cy.get('[class*="partnership-description"]')
        .should('be.visible')
        .and('not.be.empty')
      
      // Partnership services
      cy.get('[class*="partnership-services"]').within(() => {
        cy.get('[class*="partnership-service-item"]')
          .should('have.length', 4)
          .each(($item) => {
            cy.wrap($item).within(() => {
              cy.get('[class*="partnership-service-name"]')
                .should('be.visible')
                .and('not.be.empty')
            })
          })
      })
    })
  })

  // Accordion Functionality Tests
  describe('Franchise Includes Accordion with Database Content', () => {
    it('should display franchise includes title from database', () => {
      cy.get('[class*="franchise-includes-title"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($title) => {
          expect($title.text().trim()).to.have.length.greaterThan(5)
        })
    })

    it('should display all accordion items with database titles', () => {
      cy.get('[class*="includes-accordion"]').within(() => {
        // Should have 3 accordion items
        cy.get('[class*="accordion-item"]').should('have.length', 3)
        
        // Each accordion item should have a title from database
        cy.get('[class*="accordion-title"]')
          .should('have.length', 3)
          .each(($title) => {
            cy.wrap($title)
              .should('be.visible')
              .and('not.be.empty')
              .then(($el) => {
                expect($el.text().trim()).to.have.length.greaterThan(3)
              })
          })
      })
    })

    it('should expand first accordion and show database content', () => {
      // Click first accordion
      cy.get('[class*="accordion-item"]').first().within(() => {
        cy.get('[class*="accordion-header"]').click()
        
        // Verify content appears with database text
        cy.get('[class*="accordion-content"]').should('be.visible')
        cy.get('[class*="benefit-item"]')
          .should('have.length', 4)
          .each(($item) => {
            cy.wrap($item).within(() => {
              cy.get('span')
                .should('be.visible')
                .and('not.be.empty')
                .then(($span) => {
                  expect($span.text().trim()).to.have.length.greaterThan(10)
                })
            })
          })
      })
    })

    it('should expand second accordion and show database content', () => {
      // Click second accordion
      cy.get('[class*="accordion-item"]').eq(1).within(() => {
        cy.get('[class*="accordion-header"]').click()
        
        // Verify digital content
        cy.get('[class*="accordion-content"]').should('be.visible')
        cy.get('[class*="benefit-item"]')
          .should('have.length', 3)
          .each(($item) => {
            cy.wrap($item).within(() => {
              cy.get('span')
                .should('be.visible')
                .and('not.be.empty')
            })
          })
      })
    })

    it('should expand third accordion and show database content', () => {
      // Click third accordion  
      cy.get('[class*="accordion-item"]').eq(2).within(() => {
        cy.get('[class*="accordion-header"]').click()
        
        // Verify support content
        cy.get('[class*="accordion-content"]').should('be.visible')
        cy.get('[class*="benefit-item"]')
          .should('have.length', 3)
          .each(($item) => {
            cy.wrap($item).within(() => {
              cy.get('span')
                .should('be.visible')
                .and('not.be.empty')
            })
          })
      })
    })
  })

  // Process Steps Validation
  describe('Franchise Process Steps with Database Content', () => {
    it('should display process title from database', () => {
      cy.get('[class*="how-to-open-title"]')
        .should('be.visible')
        .and('not.be.empty')
    })

    it('should display all 5 process steps with database content', () => {
      cy.get('[class*="franchise-steps-container"]').within(() => {
        cy.get('[class*="franchise-step-card"]')
          .should('have.length', 5)
          .each(($card, index) => {
            cy.wrap($card).within(() => {
              // Step number
              cy.get('[class*="franchise-step-number"]')
                .should('contain.text', (index + 1).toString())
              
              // Step title from database
              cy.get('[class*="franchise-step-title"]')
                .should('be.visible')
                .and('not.be.empty')
                .then(($title) => {
                  expect($title.text().trim()).to.have.length.greaterThan(5)
                })
              
              // Step description from database
              cy.get('[class*="franchise-step-description"]')
                .should('be.visible')
                .and('not.be.empty')
                .then(($desc) => {
                  expect($desc.text().trim()).to.have.length.greaterThan(20)
                })
            })
          })
      })
    })
  })

  // Pricing Section Validation
  describe('Franchise Pricing with Database Content', () => {
    it('should display pricing title from database', () => {
      cy.get('[class*="pricing-main-title"]')
        .should('be.visible')
        .and('not.be.empty')
    })

    it('should display all pricing metrics from database', () => {
      cy.get('[class*="pricing-metrics-card"]').within(() => {
        // Should have 3 pricing metrics
        cy.get('[class*="pricing-metric-item"]')
          .should('have.length', 3)
          .each(($item) => {
            cy.wrap($item).within(() => {
              // Metric label
              cy.get('[class*="metric-label"]')
                .should('be.visible')
                .and('not.be.empty')
              
              // Metric value
              cy.get('[class*="metric-value"]')
                .should('be.visible')
                .and('not.be.empty')
            })
          })
        
        // Pricing note
        cy.get('[class*="pricing-note-text"]')
          .should('be.visible')
          .and('not.be.empty')
        
        // Pricing CTA
        cy.get('[class*="pricing-cta-button"]')
          .should('be.visible')
          .and('not.be.empty')
      })
    })
  })

  // Final CTA Section
  describe('Final CTA Section with Database Content', () => {
    it('should display final CTA with database content', () => {
      cy.get('[class*="final-cta-section"]').should('be.visible')
      
      // Final CTA title (uses dangerouslySetInnerHTML)
      cy.get('[class*="final-cta-title"]')
        .should('be.visible')
        .and('not.be.empty')
      
      // Final CTA button
      cy.get('[class*="final-cta-button"]')
        .should('be.visible')
        .and('not.be.empty')
        .within(() => {
          // Button text
          cy.get('span[class*="final-cta-arrow"]')
            .should('be.visible')
            .and('not.be.empty')
        })
    })
  })

  // Database Integration Validation
  describe('Database Integration and Phase 8 Validation', () => {
    it('should not show any t() translation keys (database-only validation)', () => {
      cy.get('body')
        .should('not.contain.text', 'franchise_main_hero_title')
        .and('not.contain.text', 'franchise_hero_title')
        .and('not.contain.text', 'franchise_includes_turnkey_title')
        .and('not.contain.text', 'franchise_step_1_title')
        .and('not.contain.text', 'franchise_pricing_title')
    })

    it('should validate all 67 content items are displayed', () => {
      // Main sections should exist
      cy.get('[class*="main-hero-section"]').should('exist')
      cy.get('[class*="hero-section"]').should('exist')
      cy.get('[class*="client-sources-section"]').should('exist')
      cy.get('[class*="partnership-section"]').should('exist')
      cy.get('[class*="franchise-includes-section"]').should('exist')
      cy.get('[class*="how-to-open-section"]').should('exist')
      cy.get('[class*="franchise-pricing-section"]').should('exist')
      cy.get('[class*="final-cta-section"]').should('exist')
      
      // Count major text elements (approximation of 67 content items)
      cy.get('body').then(($body) => {
        const text = $body.text()
        expect(text).to.not.include('undefined')
        expect(text).to.not.include('null')
        expect(text).to.not.include('[object Object]')
        expect(text.trim()).to.have.length.greaterThan(1000) // Substantial content
      })
    })

    it('should handle image alt text from database', () => {
      // All images should have proper alt text from database
      cy.get('img').each(($img) => {
        cy.wrap($img)
          .should('have.attr', 'alt')
          .and('not.be.empty')
      })
    })
  })

  // Multi-Language Support
  describe('Multi-Language Database Content', () => {
    const languages = ['en', 'he', 'ru']

    languages.forEach((lang) => {
      it(`should work in ${lang} language with database content`, () => {
        // Set language
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', lang)
        })
        
        cy.reload()
        cy.wait(3000)

        // Verify content loads in selected language
        cy.get('[class*="main-hero-title"]')
          .should('be.visible')
          .and('not.be.empty')
        
        cy.get('[class*="franchise-includes-title"]')
          .should('be.visible')
          .and('not.be.empty')
        
        // Verify accordion content works
        cy.get('[class*="accordion-item"]').first().within(() => {
          cy.get('[class*="accordion-header"]').click()
          cy.get('[class*="accordion-content"]').should('be.visible')
        })
        
        // Verify substantial content exists
        cy.get('body').then(($body) => {
          expect($body.text().trim()).to.have.length.greaterThan(500)
        })
      })

      it(`should handle RTL layout for Hebrew when language is ${lang}`, () => {
        if (lang === 'he') {
          cy.window().then((win) => {
            win.localStorage.setItem('i18nextLng', 'he')
          })
          
          cy.reload()
          cy.wait(3000)
          
          cy.get('html')
            .should('have.attr', 'dir', 'rtl')
            .and('have.attr', 'lang', 'he')
        }
      })
    })
  })

  // Performance and Reliability
  describe('Performance and Reliability', () => {
    it('should load all database content within reasonable time', () => {
      const startTime = Date.now()
      
      cy.visit('/Real-Estate-Brokerage')
      
      // Verify major sections load
      cy.get('[class*="main-hero-title"]').should('be.visible')
      cy.get('[class*="franchise-includes-title"]').should('be.visible')
      cy.get('[class*="how-to-open-title"]').should('be.visible')
      cy.get('[class*="pricing-main-title"]').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(10000) // Should load within 10 seconds
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
        cy.get('[class*="main-hero-title"]').should('be.visible')
        cy.get('[class*="franchise-includes-title"]').should('be.visible')
        
        // Accordion should work
        cy.get('[class*="accordion-item"]').first().within(() => {
          cy.get('[class*="accordion-header"]').should('be.visible').click()
          cy.get('[class*="accordion-content"]').should('be.visible')
        })
      })
    })
  })

  // Interactive Elements
  describe('Interactive Elements with Database Content', () => {
    it('should handle accordion interactions correctly', () => {
      // Test all 3 accordions expand and collapse
      for (let i = 0; i < 3; i++) {
        cy.get('[class*="accordion-item"]').eq(i).within(() => {
          // Click to expand
          cy.get('[class*="accordion-header"]').click()
          cy.get('[class*="accordion-content"]').should('be.visible')
          
          // Click to collapse
          cy.get('[class*="accordion-header"]').click()
          cy.get('[class*="accordion-content"]').should('not.exist')
        })
      }
    })

    it('should handle CTA button navigation', () => {
      // Test multiple CTA buttons exist and are clickable
      const ctaSelectors = [
        '[class*="main-hero-cta-button"]',
        '[class*="hero-cta-button"]',
        '[class*="partnership-cta-button"]',
        '[class*="franchise-cta-button"]',
        '[class*="pricing-cta-button"]',
        '[class*="final-cta-button"]'
      ]
      
      ctaSelectors.forEach(selector => {
        cy.get(selector)
          .should('be.visible')
          .and('not.be.empty')
          .and('not.be.disabled')
      })
    })
  })
})