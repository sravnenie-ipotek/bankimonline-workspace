/**
 * E2E Test Suite for Database Translation System Verification
 * Tests all 6 problematic pages identified in the audit
 * Ensures database-first translation system is working correctly
 */

describe('Database Translation System Verification', () => {
  const API_BASE_URL = 'http://localhost:8003'
  const APP_BASE_URL = 'http://localhost:5173'
  
  // Test for different languages
  const languages = ['en', 'he', 'ru']
  
  beforeEach(() => {
    // Clear any cached content
    cy.request('POST', `${API_BASE_URL}/api/cache/clear`)
    cy.visit('/')
  })

  describe('1. Home Page Translations', () => {
    it('should display all home page content from database', () => {
      cy.visit('/')
      
      // Check that key UI elements have translations (not raw keys)
      cy.get('[data-testid="video-poster-title"]').should('exist')
        .and('not.contain', 'title_compare')
        .and('not.be.empty')
      
      // Check service cards have proper translations
      cy.get('[data-testid="service-card"]').should('have.length.at.least', 4)
      cy.get('[data-testid="service-card"]').first()
        .should('not.contain', 'calculate_mortgage')
        .and('not.be.empty')
      
      // Verify no raw translation keys are visible
      cy.get('body').should('not.contain', 'app.home.')
      cy.get('body').should('not.contain', 'calculate_mortgage_')
      cy.get('body').should('not.contain', 'refinance_mortgage_')
    })

    it('should fetch content from database API', () => {
      // Verify API endpoint is working
      cy.request(`${API_BASE_URL}/api/content/home_page/en`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.status).to.eq('success')
        expect(response.body.content).to.be.an('object')
        expect(Object.keys(response.body.content)).to.have.length.greaterThan(0)
      })
    })
  })

  describe('2. Services Landing Page Translations', () => {
    it('should display services with database translations', () => {
      cy.visit('/services')
      
      // Check service titles are translated
      cy.contains('button', /mortgage|credit/i).should('exist')
      
      // Verify no raw keys
      cy.get('body').should('not.contain', 'services_landing')
      cy.get('body').should('not.contain', 'calculate_')
      cy.get('body').should('not.contain', 'refinance_')
    })
  })

  describe('3. Mortgage Step 1 Form Translations', () => {
    it('should display form fields with database translations', () => {
      cy.visit('/services/calculate-mortgage')
      
      // Check critical form fields
      // Property ownership dropdown
      cy.get('select, [role="combobox"]').should('exist')
      cy.get('label').should('not.contain', 'calculate_mortgage_property_ownership')
      
      // Check dropdown options are translated
      cy.get('select option, [role="option"]').should('have.length.greaterThan', 0)
      cy.get('select option, [role="option"]').first()
        .should('not.contain', '_option_1')
        .and('not.be.empty')
      
      // Verify form labels are translated
      cy.get('label').each(($label) => {
        cy.wrap($label).should('not.match', /calculate_mortgage_\w+/)
        cy.wrap($label).should('not.be.empty')
      })
    })

    it('should fetch dropdown data from database', () => {
      cy.request(`${API_BASE_URL}/api/dropdowns/mortgage_step1/en`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.status).to.eq('success')
        expect(response.body.dropdowns).to.be.an('array')
        
        // Check property ownership dropdown exists
        const propertyDropdown = response.body.dropdowns.find(d => 
          d.key.includes('property_ownership')
        )
        expect(propertyDropdown).to.exist
        expect(propertyDropdown.options).to.have.length.greaterThan(0)
      })
    })
  })

  describe('4. Credit Step 1 Form Translations', () => {
    it('should display credit form with database translations', () => {
      cy.visit('/services/calculate-credit')
      
      // Similar checks as mortgage but for credit
      cy.get('select, [role="combobox"]').should('exist')
      cy.get('label').should('not.contain', 'calculate_credit_')
      
      // Verify placeholders are translated
      cy.get('input[placeholder], select[placeholder]').each(($element) => {
        const placeholder = $element.attr('placeholder')
        if (placeholder) {
          expect(placeholder).not.to.match(/_ph$/)
          expect(placeholder).not.to.be.empty
        }
      })
    })
  })

  describe('5. Contact Page Translations', () => {
    it('should display contact form with database translations', () => {
      cy.visit('/contact')
      
      // Check form fields
      cy.get('input[name="name"], input[type="text"]').should('exist')
      cy.get('input[name="email"], input[type="email"]').should('exist')
      cy.get('textarea').should('exist')
      
      // Check labels don't contain raw keys
      cy.get('label').each(($label) => {
        cy.wrap($label).should('not.contain', 'contact_')
        cy.wrap($label).should('not.be.empty')
      })
      
      // Check submit button is translated
      cy.get('button[type="submit"]')
        .should('not.contain', 'contact_submit')
        .and('not.be.empty')
    })
  })

  describe('6. Multi-Language Support', () => {
    it('should switch languages and load correct translations', () => {
      languages.forEach((lang) => {
        // Change language
        cy.visit(`/?lang=${lang}`)
        cy.wait(500) // Wait for language change
        
        // Verify content changes with language
        cy.request(`${API_BASE_URL}/api/content/home_page/${lang}`).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.language_code).to.eq(lang)
          expect(response.body.content).to.be.an('object')
        })
        
        // Check RTL for Hebrew
        if (lang === 'he') {
          cy.get('html').should('have.attr', 'dir', 'rtl')
        } else {
          cy.get('html').should('not.have.attr', 'dir', 'rtl')
        }
      })
    })
  })

  describe('7. Cache Performance', () => {
    it('should serve cached content on subsequent requests', () => {
      // First request - not cached
      cy.request(`${API_BASE_URL}/api/content/home_page/en`).then((response1) => {
        expect(response1.body.cached).to.be.false
        
        // Second request - should be cached
        cy.request(`${API_BASE_URL}/api/content/home_page/en`).then((response2) => {
          expect(response2.body.cached).to.be.true
          expect(response2.body.content).to.deep.equal(response1.body.content)
        })
      })
    })
  })

  describe('8. Error Handling', () => {
    it('should fallback gracefully when database is unavailable', () => {
      // Visit page (even if API has issues, page should load)
      cy.visit('/', { failOnStatusCode: false })
      
      // Page should still be functional
      cy.get('body').should('exist')
      cy.get('nav').should('exist')
      
      // Should fall back to i18next if database fails
      // But shouldn't show raw keys
      cy.get('body').invoke('text').then((text) => {
        expect(text).not.to.match(/\w+_\w+_\w+/) // No snake_case keys
        expect(text).not.to.match(/app\.\w+\./) // No dot notation keys
      })
    })
  })

  describe('9. Database Content Completeness', () => {
    it('should have all required content items in database', () => {
      const requiredScreens = [
        'home_page',
        'services_landing',
        'mortgage_step1',
        'credit_step1',
        'contact_page'
      ]
      
      requiredScreens.forEach((screen) => {
        cy.request(`${API_BASE_URL}/api/content/${screen}/en`).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.content_count).to.be.greaterThan(0)
          
          // Log for debugging
          cy.log(`${screen}: ${response.body.content_count} items`)
        })
      })
    })
  })

  describe('10. Console Error Check', () => {
    it('should not have i18next missing key warnings', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.spy(win.console, 'warn')
          cy.spy(win.console, 'error')
        }
      })
      
      cy.wait(1000) // Wait for all translations to load
      
      // Check console for i18next warnings
      cy.window().then((win) => {
        const warnings = win.console.warn as any
        const errors = win.console.error as any
        
        // No missing key warnings
        expect(warnings).to.not.be.calledWithMatch('missingKey')
        expect(warnings).to.not.be.calledWithMatch('i18next')
        
        // No translation errors
        expect(errors).to.not.be.calledWithMatch('translation')
        expect(errors).to.not.be.calledWithMatch('content')
      })
    })
  })
})

// Helper command to check for raw translation keys
Cypress.Commands.add('checkNoRawKeys', () => {
  cy.get('body').invoke('text').then((text) => {
    // Common patterns for raw translation keys
    const rawKeyPatterns = [
      /calculate_\w+_\w+/,
      /app\.\w+\.\w+/,
      /_option_\d+/,
      /_ph$/,
      /\w+_\w+_\w+_\w+/ // Long snake_case keys
    ]
    
    rawKeyPatterns.forEach((pattern) => {
      expect(text).not.to.match(pattern)
    })
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      checkNoRawKeys(): Chainable<void>
    }
  }
}

export {}