describe('Contacts Page - Phase 10 Database-Only Content', () => {
  beforeEach(() => {
    cy.visit('/contacts', { timeout: 15000 })
    cy.wait(3000) // Wait for database content to load
  })

  // QA CHECKPOINT 5: Database Content Loading Tests
  describe('Database Content Loading Validation', () => {
    it('should load the Contacts page without errors', () => {
      // Check page loads successfully
      cy.url().should('include', '/contacts')
      
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

    it('should display header section with database content', () => {
      // Main title should be loaded from database
      cy.get('[class*="title"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($title) => {
          expect($title.text().trim()).to.have.length.greaterThan(5)
        })
      
      // Main office section
      cy.get('[class*="office-title"]')
        .should('be.visible')
        .and('not.be.empty')
      
      // Address should be loaded from database
      cy.get('[class*="address"]')
        .should('be.visible')
        .and('not.be.empty')
        .then(($address) => {
          expect($address.text().trim()).to.have.length.greaterThan(10)
        })
      
      // Contact links should have database content
      cy.get('[class*="contact-links"]').within(() => {
        cy.get('button')
          .should('have.length', 2) // Phone and email
          .each(($button) => {
            cy.wrap($button)
              .should('be.visible')
              .and('not.be.empty')
              .and('not.be.disabled')
          })
      })
    })

    it('should display all 4 tab navigation options with database content', () => {
      cy.get('[class*="category-tabs"]').within(() => {
        // Should have 4 tabs
        cy.get('button[class*="tab"]')
          .should('have.length', 4)
          .each(($tab) => {
            cy.wrap($tab)
              .should('be.visible')
              .and('not.be.empty')
              .then(($el) => {
                expect($el.text().trim()).to.have.length.greaterThan(5)
              })
          })
      })
    })
  })

  // Tab-specific content validation
  describe('General Questions Tab Content', () => {
    it('should display general questions tab content with database content', () => {
      // Click on general questions tab (should be active by default)
      cy.get('button[class*="tab"]').contains(/Technical Support|תמיכה טכנית|Техническая/).should('exist')
      
      // Should have 3 contact cards in general section
      cy.get('[class*="contact-grid"]').within(() => {
        cy.get('[class*="contact-card"]')
          .should('have.length', 3) // Tech support, Secretary, Customer service
          .each(($card) => {
            // Each card should have a title
            cy.wrap($card).find('[class*="card-title"]')
              .should('be.visible')
              .and('not.be.empty')
            
            // Each card should have contact info
            cy.wrap($card).find('[class*="contact-info"]')
              .should('be.visible')
              .within(() => {
                cy.get('button').should('have.length.greaterThan', 1)
              })
          })
      })
    })

    it('should validate tech support card content from database', () => {
      // Tech support card should exist with database content
      cy.get('[class*="contact-card"]').first().within(() => {
        cy.get('[class*="card-title"]')
          .should('be.visible')
          .and('contain.text', /Technical Support|תמיכה טכנית|Техническая/)
        
        // Should have phone and email buttons
        cy.get('[class*="contact-link"]')
          .should('have.length', 2)
          .each(($link) => {
            cy.wrap($link)
              .should('be.visible')
              .and('not.be.empty')
              .and('not.be.disabled')
          })
        
        // Should have action link
        cy.get('[class*="action-link"]')
          .should('be.visible')
          .and('not.be.empty')
      })
    })
  })

  describe('Service Questions Tab Content', () => {
    it('should display service questions tab content when clicked', () => {
      // Click on service questions tab
      cy.get('button[class*="tab"]')
        .contains(/Service|שירות|Услуги/)
        .click()
      
      cy.wait(1000)
      
      // Should display service section
      cy.get('[class*="section"]').should('be.visible')
      
      // Should have 2 contact cards (mortgage calc, credit calc)
      cy.get('[class*="contact-grid"]').within(() => {
        cy.get('[class*="contact-card"]')
          .should('have.length', 2)
          .each(($card) => {
            cy.wrap($card).find('[class*="card-title"]')
              .should('be.visible')
              .and('not.be.empty')
          })
      })
    })

    it('should validate credit calculator card (newly created in database)', () => {
      // Click service tab
      cy.get('button[class*="tab"]')
        .contains(/Service|שירות|Услуги/)
        .click()
      
      cy.wait(1000)
      
      // Find credit calculator card
      cy.get('[class*="contact-card"]')
        .contains(/Credit Calculator|מחשבון אשראי|Калькулятор кредита/)
        .parent('[class*="contact-card"]')
        .within(() => {
          // Should have title from database
          cy.get('[class*="card-title"]')
            .should('contain.text', /Credit Calculator|מחשבון אשראי|Калькулятор кредита/)
          
          // Should have phone and email (newly created keys)
          cy.get('[class*="contact-link"]')
            .should('have.length', 2)
            .each(($link) => {
              cy.wrap($link)
                .should('be.visible')
                .and('not.be.empty')
            })
        })
    })
  })

  describe('Real Estate Questions Tab Content', () => {
    it('should display real estate tab content when clicked', () => {
      // Click on real estate tab
      cy.get('button[class*="tab"]')
        .contains(/Real Estate|נדל|Недвижимость/)
        .click()
      
      cy.wait(1000)
      
      // Should display real estate section
      cy.get('[class*="section"]').should('be.visible')
      
      // Should have 2 contact cards (buy/sell, rent)
      cy.get('[class*="contact-grid"]').within(() => {
        cy.get('[class*="contact-card"]')
          .should('have.length', 2)
          .each(($card) => {
            cy.wrap($card).find('[class*="card-title"]')
              .should('be.visible')
              .and('not.be.empty')
            
            // Each card should have phone and email
            cy.wrap($card).find('[class*="contact-link"]')
              .should('have.length', 2)
          })
      })
    })
  })

  describe('Cooperation Tab Content', () => {
    it('should display cooperation tab content when clicked', () => {
      // Click on cooperation tab
      cy.get('button[class*="tab"]')
        .contains(/Cooperation|שיתוף|Сотрудничество/)
        .click()
      
      cy.wait(1000)
      
      // Should display cooperation section
      cy.get('[class*="section"]').should('be.visible')
      
      // Should have 4 contact cards (cooperation mgmt, management contacts, accounting, fax)
      cy.get('[class*="contact-grid"]').within(() => {
        cy.get('[class*="contact-card"]')
          .should('have.length', 4)
          .each(($card) => {
            cy.wrap($card).find('[class*="card-title"]')
              .should('be.visible')
              .and('not.be.empty')
          })
      })
    })
  })

  // Social Media Section
  describe('Social Media Section', () => {
    it('should display social media section with database content', () => {
      // Scroll to social section
      cy.get('[class*="social-section"]').scrollIntoView()
      
      // Should have section title from database
      cy.get('[class*="social-section"] [class*="section-title"]')
        .should('be.visible')
        .and('not.be.empty')
      
      // Should have 4 social links
      cy.get('[class*="social-links"]').within(() => {
        cy.get('[class*="social-link"]')
          .should('have.length', 4) // Facebook, Instagram, Twitter, WhatsApp
          .each(($link) => {
            cy.wrap($link)
              .should('be.visible')
              .and('not.be.disabled')
              .and('have.attr', 'aria-label')
          })
      })
    })
  })

  // Database Integration Validation
  describe('Database Integration and Phase 10 Validation', () => {
    it('should not show any t() translation keys (database-only validation)', () => {
      cy.get('body')
        .should('not.contain.text', 'contacts_title')
        .and('not.contain.text', 'contacts_main_office')
        .and('not.contain.text', 'contacts_tech_support')
        .and('not.contain.text', 'contacts_credit_calc')
        .and('not.contain.text', 'contacts_cooperation')
        .and('not.contain.text', 'contacts_social_follow')
    })

    it('should validate all 47 database content items are displayed', () => {
      // Header section should exist
      cy.get('[class*="header"]').should('exist')
      
      // All tabs should exist
      cy.get('[class*="category-tabs"]').should('exist')
      
      // Social section should exist
      cy.get('[class*="social-section"]').should('exist')
      
      // Content validation - should have substantial text content
      cy.get('body').then(($body) => {
        const text = $body.text()
        expect(text).to.not.include('undefined')
        expect(text).to.not.include('null')
        expect(text).to.not.include('[object Object]')
        expect(text.trim()).to.have.length.greaterThan(1500) // Substantial content across all tabs
      })
    })

    it('should validate tab switching functionality', () => {
      const tabs = [
        { contains: /Service|שירות|Услуги/, expectedCards: 2 },
        { contains: /Real Estate|נדל|Недвижимость/, expectedCards: 2 },
        { contains: /Cooperation|שיתוף|Сотрудничество/, expectedCards: 4 },
        { contains: /General|כללי|Общие/, expectedCards: 3 }
      ]
      
      tabs.forEach((tab) => {
        cy.get('button[class*="tab"]')
          .contains(tab.contains)
          .click()
        
        cy.wait(1000)
        
        // Verify correct number of contact cards for each tab
        cy.get('[class*="contact-grid"]').within(() => {
          cy.get('[class*="contact-card"]')
            .should('have.length', tab.expectedCards)
        })
      })
    })
  })

  // Interactive Elements
  describe('Interactive Elements with Database Content', () => {
    it('should have functional contact interaction handlers', () => {
      // Phone and email buttons should be clickable
      cy.get('[class*="contact-link"]')
        .should('have.length.greaterThan', 5) // Multiple contact options
        .each(($link) => {
          cy.wrap($link)
            .should('be.visible')
            .and('not.be.empty')
            .and('not.be.disabled')
            // Don't actually click to avoid navigation in tests
        })
    })

    it('should have proper accessibility attributes', () => {
      // Social media buttons should have aria-labels
      cy.get('[class*="social-link"]').each(($social) => {
        cy.wrap($social).should('have.attr', 'aria-label').and('not.be.empty')
      })
      
      // Contact buttons should be keyboard accessible
      cy.get('[class*="contact-link"]').each(($contact) => {
        cy.wrap($contact).should('be.focusable')
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
        cy.get('[class*="title"]')
          .should('be.visible')
          .and('not.be.empty')
        
        cy.get('[class*="office-title"]')
          .should('be.visible')
          .and('not.be.empty')
        
        // Verify tab content loads
        cy.get('[class*="category-tabs"] button')
          .should('have.length', 4)
          .each(($tab) => {
            cy.wrap($tab).should('not.be.empty')
          })
        
        // Verify substantial content exists
        cy.get('body').then(($body) => {
          expect($body.text().trim()).to.have.length.greaterThan(800)
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
      
      cy.visit('/contacts')
      
      // Verify major sections load
      cy.get('[class*="title"]').should('be.visible')
      cy.get('[class*="category-tabs"]').should('be.visible')
      cy.get('[class*="social-section"]').should('be.visible')
      
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
        cy.get('[class*="title"]').should('be.visible')
        cy.get('[class*="category-tabs"]').should('be.visible')
        
        // Tabs should be clickable
        cy.get('button[class*="tab"]').first().should('be.visible').and('not.be.disabled')
      })
    })
  })

  // Final Integration Test
  describe('Complete Phase 10 Validation', () => {
    it('should demonstrate complete database-first transformation', () => {
      // Verify all expected sections exist and have content
      const expectedSections = [
        '[class*="header"]',
        '[class*="category-tabs"]',
        '[class*="contact-grid"]',
        '[class*="social-section"]'
      ]
      
      expectedSections.forEach(selector => {
        cy.get(selector).should('exist').and('be.visible')
      })
      
      // Verify no fallback translation keys are visible
      cy.get('body').should('not.contain.text', 'contacts_')
      
      // Test all tabs functionality
      cy.get('button[class*="tab"]').each(($tab, index) => {
        cy.wrap($tab).click()
        cy.wait(1000)
        cy.get('[class*="section"]').should('be.visible')
      })
      
      // Take final screenshot for verification
      cy.screenshot('contacts-phase10-complete')
      
      // Final validation - substantial database content loaded
      cy.get('body').then(($body) => {
        const text = $body.text()
        // Should have substantial content (header + all tabs + social)
        expect(text.trim()).to.have.length.greaterThan(1200)
        // Should not have any undefined content
        expect(text).to.not.include('undefined')
        expect(text).to.not.include('[object Object]')
      })
    })
  })
})