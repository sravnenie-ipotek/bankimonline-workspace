/// <reference types="cypress" />

describe('PrivacyPolicy Page Migration Tests', () => {
  beforeEach(() => {
    // Visit the privacy policy page directly
    cy.visit('/privacy-policy')
  })

  describe('Phase 6: PrivacyPolicy Migration - Database-First Translation System', () => {
    it('should successfully load the privacy policy page', () => {
      cy.url().should('include', '/privacy-policy')
      cy.get('[data-testid="text-page"]').should('exist')
    })

    it('should display the page title from database', () => {
      cy.get('h1').should('contain.text', 'Privacy Policy')
      cy.get('h1').should('be.visible')
    })

    it('should display privacy policy content as HTML', () => {
      cy.get('[data-testid="text-page"]').within(() => {
        // Check for HTML structure from database
        cy.get('div').should('contain.html', '<p><strong>Bankimonline Privacy Policy</strong></p>')
        cy.get('div').should('contain.html', '<h2><strong>1. Information We Collect</strong></h2>')
        cy.get('div').should('contain.html', '<h2><strong>2. Use of Information</strong></h2>')
        cy.get('div').should('contain.html', '<h2><strong>3. Information Sharing</strong></h2>')
        cy.get('div').should('contain.html', '<h2><strong>4. Information Security</strong></h2>')
        cy.get('div').should('contain.html', '<h2><strong>5. Your Rights</strong></h2>')
        cy.get('div').should('contain.html', '<h2><strong>6. Contact Us</strong></h2>')
      })
    })

    it('should display key privacy policy sections', () => {
      // Test for main sections that should be visible
      cy.contains('Personal Information').should('be.visible')
      cy.contains('Financial Information').should('be.visible')
      cy.contains('Technical Information').should('be.visible')
      cy.contains('Service Purpose').should('be.visible')
      cy.contains('Partner Banks').should('be.visible')
      cy.contains('Encryption').should('be.visible')
      cy.contains('Right of Access').should('be.visible')
      cy.contains('privacy@bankimonline.com').should('be.visible')
    })

    it('should have working back button navigation', () => {
      cy.get('button').contains('Back').should('be.visible')
      cy.get('button').contains('Back').click()
      
      // Should navigate to previous page (likely home)
      cy.url().should('not.include', '/privacy-policy')
    })

    it('should use TextPage component architecture', () => {
      // Verify the component structure matches TextPage pattern
      cy.get('.page').should('exist')
      cy.get('.page-container').should('exist')
      cy.get('.page-header').should('exist')
      cy.get('.page-header__title').should('exist')
      cy.get('.page-text').should('exist')
    })

    it('should handle database content loading', () => {
      cy.intercept('GET', '**/api/content/privacy_policy/en', {
        fixture: 'privacy-policy-content.json'
      }).as('getPrivacyContent')
      
      cy.visit('/privacy-policy')
      cy.wait('@getPrivacyContent')
      
      cy.get('h1').should('contain.text', 'Privacy Policy')
    })

    it('should handle database content loading failure with JSON fallback', () => {
      cy.intercept('GET', '**/api/content/privacy_policy/en', {
        statusCode: 500,
        body: { error: 'Database error' }
      }).as('getPrivacyContentError')
      
      cy.visit('/privacy-policy')  
      cy.wait('@getPrivacyContentError')
      
      // Should still display content via JSON fallback
      cy.get('h1').should('be.visible')
      cy.get('[data-testid="text-page"]').should('exist')
    })
  })

  describe('Multi-language Support Tests', () => {
    it('should support Hebrew language with RTL layout', () => {
      // Switch to Hebrew
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'he')
      })
      cy.visit('/privacy-policy')
      
      cy.get('h1').should('contain.text', 'מדיניות פרטיות')
      cy.get('html').should('have.attr', 'dir', 'rtl')
    })

    it('should support Russian language', () => {
      // Switch to Russian
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'ru')
      })
      cy.visit('/privacy-policy')
      
      cy.get('h1').should('contain.text', 'Политика конфиденциальности')
    })

    it('should handle language switching dynamically', () => {
      // Test language switching on the page
      cy.get('h1').should('contain.text', 'Privacy Policy')
      
      // Switch language programmatically
      cy.window().its('store').invoke('dispatch', {
        type: 'language/setLanguage',
        payload: 'he'
      })
      
      cy.get('h1').should('contain.text', 'מדיניות פרטיות')
    })
  })

  describe('Responsive Design Tests', () => {
    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x')
      cy.get('[data-testid="text-page"]').should('be.visible')
      cy.get('h1').should('be.visible')
      cy.get('button').contains('Back').should('be.visible')
    })

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2')
      cy.get('[data-testid="text-page"]').should('be.visible')
      cy.get('h1').should('be.visible')
    })

    it('should be responsive on desktop', () => {
      cy.viewport(1920, 1080)
      cy.get('[data-testid="text-page"]').should('be.visible')
      cy.get('h1').should('be.visible')
    })
  })

  describe('Performance Tests', () => {
    it('should load within acceptable time limits', () => {
      const startTime = Date.now()
      cy.visit('/privacy-policy')
      cy.get('h1').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000) // 3 seconds max
      })
    })

    it('should have minimal DOM elements (efficient architecture)', () => {
      cy.get('*').should('have.length.lessThan', 100) // TextPage should be minimal
    })
  })

  describe('Accessibility Tests', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1)
      cy.get('h2').should('have.length.greaterThan', 0)
    })

    it('should have accessible back button', () => {
      cy.get('button').contains('Back').should('be.visible')
      cy.get('button').contains('Back').should('not.have.attr', 'disabled')
    })

    it('should have proper page structure for screen readers', () => {
      cy.get('main, [role="main"]').should('exist')
      cy.get('h1').should('exist')
    })

    it('should support keyboard navigation', () => {
      cy.get('button').contains('Back').focus()
      cy.focused().should('contain.text', 'Back')
      cy.focused().type('{enter}')
      cy.url().should('not.include', '/privacy-policy')
    })
  })

  describe('Integration Tests', () => {
    it('should integrate properly with routing system', () => {
      cy.visit('/')
      cy.contains('Privacy Policy').click()
      cy.url().should('include', '/privacy-policy')
      cy.get('h1').should('contain.text', 'Privacy Policy')
    })

    it('should maintain state across navigation', () => {
      cy.visit('/privacy-policy')
      cy.get('h1').should('be.visible')
      cy.go('back')
      cy.go('forward')
      cy.get('h1').should('contain.text', 'Privacy Policy')
    })

    it('should work with browser refresh', () => {
      cy.visit('/privacy-policy')
      cy.get('h1').should('be.visible')
      cy.reload()
      cy.get('h1').should('contain.text', 'Privacy Policy')
    })
  })

  describe('Migration Validation Tests', () => {
    it('should have reduced component complexity (Phase 6 success metric)', () => {
      // Original: 180 lines, Migrated: ~11 lines
      cy.get('[data-testid="text-page"]').should('exist')
      cy.get('.privacy-policy-container').should('not.exist') // Old structure removed
      cy.get('.privacy-policy-header').should('not.exist') // Old structure removed
      cy.get('.privacy-policy-content').should('not.exist') // Old structure removed
    })

    it('should preserve all essential functionality after migration', () => {
      // Title display
      cy.get('h1').should('be.visible')
      
      // Content display
      cy.get('[data-testid="text-page"]').should('contain.text', 'Bankimonline')
      
      // Navigation
      cy.get('button').contains('Back').should('be.visible')
      
      // Content sections
      cy.contains('Information We Collect').should('be.visible')
      cy.contains('privacy@bankimonline.com').should('be.visible')
    })

    it('should use database-first translation system', () => {
      cy.intercept('GET', '**/api/content/privacy_policy/en').as('getDatabaseContent')
      cy.visit('/privacy-policy')
      
      // Should make API call to database
      cy.wait('@getDatabaseContent')
      
      // Content should be from database, not hardcoded
      cy.get('h1').should('contain.text', 'Privacy Policy')
    })

    it('should match design consistency with other TextPage migrations', () => {
      // Compare with Terms page (previous migration)
      cy.visit('/terms')
      cy.get('[data-testid="text-page"]').should('exist')
      
      // Same component structure
      cy.visit('/privacy-policy') 
      cy.get('[data-testid="text-page"]').should('exist')
      
      // Same CSS classes and layout
      cy.get('.page').should('exist')
      cy.get('.page-header').should('exist')
      cy.get('.page-text').should('exist')
    })
  })

  describe('Error Handling Tests', () => {
    it('should handle missing translation keys gracefully', () => {
      cy.intercept('GET', '**/api/content/privacy_policy/en', {
        body: { status: 'success', content: {} }
      }).as('getEmptyContent')
      
      cy.visit('/privacy-policy')
      cy.wait('@getEmptyContent')
      
      // Should fall back to JSON translations
      cy.get('[data-testid="text-page"]').should('exist')
    })

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '**/api/content/privacy_policy/en', {
        forceNetworkError: true
      }).as('getNetworkError')
      
      cy.visit('/privacy-policy')
      cy.wait('@getNetworkError')
      
      // Should still render with fallback content
      cy.get('[data-testid="text-page"]').should('exist')
    })
  })
})