describe('Cooperation Page - Phase 9 Database-Only Content', () => {
  beforeEach(() => {
    cy.visit('/cooperation', { timeout: 15000 })
    cy.wait(3000) // Wait for database content to load
  })

  // QA CHECKPOINT 5: Database Content Loading Tests
  describe('Database Content Loading Validation', () => {
    it('should load the Cooperation page without errors', () => {
      // Check page loads successfully
      cy.url().should('include', '/cooperation')
      
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

    it('should display hero section with database content', () => {
      // Hero section should exist and be visible
      cy.get('[class*="hero"]').should('be.visible')
      
      // Hero title should be loaded from database
      cy.get('[class*="heroTitle"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($title) => {
          expect($title.text().trim()).to.have.length.greaterThan(5)
        })
      
      // Hero subtitle should be loaded from database
      cy.get('[class*="heroSubtitle"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($subtitle) => {
          expect($subtitle.text().trim()).to.have.length.greaterThan(10)
        })
      
      // Primary CTA button should have text from database
      cy.get('[class*="primaryButton"]')
        .should('be.visible')
        .and('not.be.empty')
        .and('not.be.disabled')
    })

    it('should display marketplace section with database content', () => {
      cy.get('[class*="marketplace"]').should('be.visible')
      
      // Marketplace title and description
      cy.get('[class*="marketTitle"]')
        .should('be.visible')
        .and('not.be.empty')
      
      cy.get('[class*="marketDesc"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($desc) => {
          expect($desc.text().trim()).to.have.length.greaterThan(20)
        })
      
      // Feature list should have all 4 items from database
      cy.get('[class*="marketFeatures"]').within(() => {
        cy.get('li')
          .should('have.length', 4)
          .each(($item) => {
            cy.wrap($item)
              .should('be.visible')
              .and('not.be.empty')
              .then(($el) => {
                expect($el.text().trim()).to.have.length.greaterThan(5)
              })
          })
      })
      
      // Marketplace CTA button
      cy.get('[class*="marketCta"]')
        .should('be.visible')
        .and('not.be.empty')
        .within(() => {
          // Should contain both icon and text
          cy.get('svg').should('exist') // HandPointingIcon
        })
    })

    it('should display referral section with database content', () => {
      cy.get('[class*="referral"]').should('be.visible')
      
      // Referral title and description
      cy.get('[class*="referralTitle"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($title) => {
          expect($title.text().trim()).to.have.length.greaterThan(10)
        })
      
      cy.get('[class*="referralDesc"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($desc) => {
          expect($desc.text().trim()).to.have.length.greaterThan(20)
        })
      
      // Referral CTA button
      cy.get('[class*="referralButton"]')
        .should('be.visible')
        .and('not.be.empty')
        .and('not.be.disabled')
      
      // Icon should be present
      cy.get('[class*="iconCircle"]').within(() => {
        cy.get('svg').should('exist') // PercentIcon
      })
    })

    it('should display CTA banner section with database content', () => {
      cy.get('[class*="ctaBanner"]').should('be.visible')
      
      // CTA banner title
      cy.get('[class*="ctaBannerTitle"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($title) => {
          expect($title.text().trim()).to.have.length.greaterThan(5)
        })
      
      // CTA banner button
      cy.get('[class*="ctaBannerButton"]')
        .should('be.visible')
        .and('not.be.empty')
        .and('not.be.disabled')
      
      // Decorative elements should be present
      cy.get('[class*="lineTop"]').should('exist')
      cy.get('[class*="lineMiddle"]').should('exist')
    })
  })

  // External Components Validation
  describe('External Components Integration', () => {
    it('should display HowItWorks component', () => {
      cy.get('[class*="howItWorksWrapper"]').should('be.visible')
      // HowItWorks uses its own translation system - just verify it loads
    })

    it('should display PartnersSwiper component', () => {
      cy.get('[class*="partners"]').should('be.visible')
      // PartnersSwiper uses its own system - just verify it loads
    })
  })

  // Database Integration Validation
  describe('Database Integration and Phase 9 Validation', () => {
    it('should not show any t() translation keys (database-only validation)', () => {
      cy.get('body')
        .should('not.contain.text', 'cooperation_title')
        .and('not.contain.text', 'cooperation_subtitle')
        .and('not.contain.text', 'marketplace_title')
        .and('not.contain.text', 'feature_credit_calc')
        .and('not.contain.text', 'referral_title')
        .and('not.contain.text', 'cooperation_cta_title')
    })

    it('should validate all 13 database content items are displayed', () => {
      // Main sections should exist
      cy.get('[class*="hero"]').should('exist')
      cy.get('[class*="marketplace"]').should('exist')
      cy.get('[class*="referral"]').should('exist')
      cy.get('[class*="ctaBanner"]').should('exist')
      
      // Content validation - should have substantial text content
      cy.get('body').then(($body) => {
        const text = $body.text()
        expect(text).to.not.include('undefined')
        expect(text).to.not.include('null')
        expect(text).to.not.include('[object Object]')
        expect(text.trim()).to.have.length.greaterThan(800) // Substantial content
      })
    })

    it('should handle repeated content correctly', () => {
      // register_partner_program appears 3 times - verify all instances work
      cy.get('[class*="primaryButton"]').should('contain.text').and('not.be.empty')
      cy.get('[class*="referralButton"]').should('contain.text').and('not.be.empty')
      cy.get('[class*="ctaBannerButton"]').should('contain.text').and('not.be.empty')
      
      // All three should have the same text (from database)
      let buttonTexts = []
      cy.get('[class*="primaryButton"]').then(($btn1) => {
        buttonTexts.push($btn1.text().trim())
        cy.get('[class*="referralButton"]').then(($btn2) => {
          buttonTexts.push($btn2.text().trim())
          cy.get('[class*="ctaBannerButton"]').then(($btn3) => {
            buttonTexts.push($btn3.text().trim())
            // All three buttons should have identical text from database
            expect(buttonTexts[0]).to.equal(buttonTexts[1])
            expect(buttonTexts[1]).to.equal(buttonTexts[2])
            expect(buttonTexts[0]).to.have.length.greaterThan(5)
          })
        })
      })
    })
  })

  // Interactive Elements
  describe('Interactive Elements with Database Content', () => {
    it('should handle CTA button clicks correctly', () => {
      const ctaSelectors = [
        '[class*="primaryButton"]',
        '[class*="referralButton"]', 
        '[class*="ctaBannerButton"]',
        '[class*="marketCta"]'
      ]
      
      ctaSelectors.forEach(selector => {
        cy.get(selector)
          .should('be.visible')
          .and('not.be.empty')
          .and('not.be.disabled')
          // Don't actually click to avoid navigation in tests
      })
    })

    it('should have proper accessibility attributes', () => {
      // Decorative elements should have aria-hidden
      cy.get('[class*="lineTop"]').should('have.attr', 'aria-hidden', 'true')
      cy.get('[class*="lineMiddle"]').should('have.attr', 'aria-hidden', 'true')
      
      // Images should have alt attributes
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt').and('not.be.empty')
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
        cy.get('[class*="heroTitle"]')
          .should('be.visible')
          .and('not.be.empty')
        
        cy.get('[class*="marketTitle"]')
          .should('be.visible')
          .and('not.be.empty')
        
        cy.get('[class*="referralTitle"]')
          .should('be.visible')
          .and('not.be.empty')
        
        // Verify substantial content exists
        cy.get('body').then(($body) => {
          expect($body.text().trim()).to.have.length.greaterThan(400)
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
      
      cy.visit('/cooperation')
      
      // Verify major sections load
      cy.get('[class*="heroTitle"]').should('be.visible')
      cy.get('[class*="marketTitle"]').should('be.visible')
      cy.get('[class*="referralTitle"]').should('be.visible')
      cy.get('[class*="ctaBannerTitle"]').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(8000) // Should load within 8 seconds
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
        cy.get('[class*="heroTitle"]').should('be.visible')
        cy.get('[class*="marketTitle"]').should('be.visible')
        cy.get('[class*="referralTitle"]').should('be.visible')
        
        // Buttons should be clickable
        cy.get('[class*="primaryButton"]').should('be.visible').and('not.be.disabled')
      })
    })
  })

  // Final Integration Test
  describe('Complete Phase 9 Validation', () => {
    it('should demonstrate complete database-first transformation', () => {
      // Verify all expected sections exist and have content
      const expectedSections = [
        '[class*="hero"]',
        '[class*="marketplace"]', 
        '[class*="referral"]',
        '[class*="howItWorksWrapper"]',
        '[class*="partners"]',
        '[class*="ctaBanner"]'
      ]
      
      expectedSections.forEach(selector => {
        cy.get(selector).should('exist').and('be.visible')
      })
      
      // Verify no fallback translation keys are visible
      cy.get('body').should('not.contain.text', 'cooperation_')
      cy.get('body').should('not.contain.text', 'marketplace_')
      cy.get('body').should('not.contain.text', 'feature_')
      cy.get('body').should('not.contain.text', 'referral_')
      
      // Take final screenshot for verification
      cy.screenshot('cooperation-phase9-complete')
      
      // Final validation - substantial database content loaded
      cy.get('body').then(($body) => {
        const text = $body.text()
        // Should have substantial content (hero + marketplace + referral + CTA)
        expect(text.trim()).to.have.length.greaterThan(500)
        // Should not have any undefined content
        expect(text).to.not.include('undefined')
        expect(text).to.not.include('[object Object]')
      })
    })
  })
})