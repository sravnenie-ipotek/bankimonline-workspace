/// <reference types="cypress" />

describe('Menu Navigation QA - Comprehensive Testing', () => {
  beforeEach(() => {
    // Visit home page before each test
    cy.visit('/')
    cy.wait(2000) // Allow page to load
  })

  describe('Critical Navigation Bug Test (Fixed)', () => {
    it('should maintain menu button visibility after service navigation', () => {
      // Test the critical navigation bug mentioned in instructions
      // Bug: Menu button disappears after navigating from service pages back to home via logo
      
      // Step 1: Navigate to services menu
      cy.get('[data-testid="services-menu"], .services-menu, [href*="services"]')
        .first()
        .should('be.visible')
        .click()
      
      // Step 2: Wait for dropdown/navigation
      cy.wait(1000)
      
      // Step 3: Navigate to mortgage calculator (using Hebrew text from instructions)
      cy.contains('חישוב משכנתא')
        .should('be.visible')
        .click()
      
      // Step 4: Wait for page load
      cy.wait(2000)
      cy.url().should('include', 'mortgage')
      
      // Step 5: Click logo to navigate home
      cy.get('[data-testid="logo"], .logo, img[alt*="logo"]')
        .first()
        .should('be.visible')
        .click()
      
      // Step 6: CRITICAL TEST - Verify menu button is visible and clickable
      cy.get('[data-testid="menu-button"], .menu-button, .hamburger-menu')
        .first()
        .should('be.visible')
        .should('not.be.disabled')
        .should('be.clickable')
      
      // Step 7: Verify menu opens without requiring page refresh
      cy.get('[data-testid="menu-button"], .menu-button, .hamburger-menu')
        .first()
        .click()
      
      cy.get('[data-testid="main-menu"], .main-menu, .navigation-menu')
        .should('be.visible')
    })
  })

  describe('Main Navigation Menu Tests', () => {
    it('should display and interact with main navigation menu', () => {
      // Test main navigation menu visibility and functionality
      cy.get('[data-testid="main-menu"], .main-menu, .navigation, nav')
        .should('be.visible')
    })

    it('should navigate to services menu and display dropdown', () => {
      // Test services menu dropdown
      cy.get('[data-testid="services-menu"], .services-menu, [href*="services"]')
        .first()
        .should('be.visible')
        .click()
      
      // Verify dropdown appears
      cy.get('[data-testid="services-dropdown"], .services-dropdown, .dropdown-menu')
        .should('be.visible')
    })
  })

  describe('Mobile Hamburger Menu Tests', () => {
    it('should work on mobile viewport', () => {
      // Test mobile hamburger menu
      cy.viewport(375, 667) // iPhone SE viewport
      
      cy.get('[data-testid="menu-button"], .menu-button, .hamburger-menu')
        .should('be.visible')
        .click()
      
      cy.get('[data-testid="mobile-menu"], .mobile-menu, .navigation-menu')
        .should('be.visible')
    })
  })

  describe('All Menu Items Accessibility', () => {
    it('should have accessible menu items', () => {
      // Test accessibility of menu items
      cy.get('nav, [role="navigation"]')
        .should('be.visible')
      
      // Check for accessible links
      cy.get('nav a, [role="navigation"] a')
        .should('have.length.greaterThan', 0)
        .each(($link) => {
          cy.wrap($link).should('be.visible')
        })
    })
  })

  describe('Service Navigation Tests', () => {
    const serviceRoutes = [
      { name: 'Mortgage Calculator', path: '/services/calculate-mortgage', hebrew: 'חישוב משכנתא' },
      { name: 'Credit Calculator', path: '/services/calculate-credit', hebrew: 'חישוב אשראי' },
      { name: 'Refinance Mortgage', path: '/services/refinance-mortgage', hebrew: 'מחזור משכנתא' },
      { name: 'Refinance Credit', path: '/services/refinance-credit', hebrew: 'מחזור אשראי' }
    ]

    serviceRoutes.forEach((service) => {
      it(`should navigate to ${service.name}`, () => {
        // Navigate to services
        cy.get('[data-testid="services-menu"], .services-menu, [href*="services"]')
          .first()
          .should('be.visible')
          .click()
        
        // Click on specific service (try Hebrew first, then English)
        cy.get('body').then(($body) => {
          if ($body.text().includes(service.hebrew)) {
            cy.contains(service.hebrew).click()
          } else {
            cy.contains(service.name).click()
          }
        })
        
        // Verify navigation
        cy.url().should('include', service.path.split('/').pop())
        
        // Verify page loads and is not empty
        cy.get('body').should('not.be.empty')
        cy.get('main, [data-testid="main-content"], .main-content')
          .should('exist')
          .should('be.visible')
        
        // Check that page has meaningful content (not just loading)
        cy.contains('Loading...').should('not.exist')
        cy.get('h1, h2, .title, [data-testid="page-title"]')
          .should('be.visible')
      })
    })
  })

  describe('Footer Navigation Tests', () => {
    it('should have working footer links', () => {
      // Scroll to footer
      cy.scrollTo('bottom')
      
      // Test footer navigation exists
      cy.get('footer, [data-testid="footer"]')
        .should('be.visible')
      
      // Test footer links
      cy.get('footer a, [data-testid="footer"] a')
        .should('have.length.greaterThan', 0)
    })
  })

  describe('Language Switching Tests', () => {
    it('should handle language switching without breaking navigation', () => {
      // Find language switcher
      cy.get('[data-testid="language-switcher"], .language-switcher, .lang-switcher')
        .should('be.visible')
      
      // Try switching language
      cy.get('[data-testid="language-switcher"], .language-switcher, .lang-switcher')
        .click()
      
      // Verify menu still works after language switch
      cy.wait(1000)
      cy.get('[data-testid="services-menu"], .services-menu, [href*="services"]')
        .first()
        .should('be.visible')
        .should('be.clickable')
    })
  })

  describe('Responsive Menu Tests', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ]

    viewports.forEach((viewport) => {
      it(`should work on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        cy.viewport(viewport.width, viewport.height)
        
        // Ensure menu is accessible on this viewport
        cy.get('[data-testid="menu-button"], .menu-button, [data-testid="services-menu"], .services-menu')
          .should('be.visible')
          .first()
          .click()
        
        // Verify menu functionality
        cy.get('[data-testid="main-menu"], .main-menu, [data-testid="services-dropdown"], .services-dropdown')
          .should('be.visible')
      })
    })
  })

  describe('Empty Page Detection', () => {
    it('should detect and fail on empty pages', () => {
      // Navigate through all main menu items and ensure no empty pages
      const menuSelectors = [
        '[data-testid="services-menu"]',
        '.services-menu',
        '[href*="services"]',
        '[href*="about"]',
        '[href*="contact"]'
      ]

      menuSelectors.forEach((selector) => {
        cy.get('body').then(($body) => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).first().click()
            cy.wait(2000)
            
            // Verify page is not empty
            cy.get('body').should('not.be.empty')
            cy.get('main, [data-testid="main-content"], .content')
              .should('exist')
              .should('be.visible')
            
            // Ensure meaningful content exists
            cy.get('h1, h2, h3, p, .title')
              .should('have.length.greaterThan', 0)
            
            // Go back to home
            cy.visit('/')
            cy.wait(1000)
          }
        })
      })
    })
  })

  describe('Console Error Detection', () => {
    it('should not have console errors during navigation', () => {
      // Monitor console errors
      cy.window().then((win) => {
        cy.stub(win.console, 'error').as('consoleError')
      })
      
      // Navigate through menu
      cy.get('[data-testid="services-menu"], .services-menu, [href*="services"]')
        .first()
        .should('be.visible')
        .click()
      
      cy.wait(1000)
      
      // Check for console errors
      cy.get('@consoleError').should('not.have.been.called')
    })
  })

  afterEach(() => {
    // Take screenshot on failure for debugging
    cy.screenshot({ capture: 'viewport', onlyOnFailure: true })
  })
})