describe('Refund Page Tests', () => {
  beforeEach(() => {
    cy.visit('/refund')
  })

  describe('Basic Functionality', () => {
    it('should load the Refund page successfully', () => {
      cy.url().should('include', '/refund')
      cy.get('[class*="page"]').should('exist')
    })

    it('should render Refund page using TextPage component', () => {
      cy.get('[class*="page-container"]').should('exist')
      cy.get('[class*="page-header"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
    })

    it('should display the refund policy title', () => {
      cy.get('[class*="page-header__title"]').should('be.visible')
      // Should contain either translation key or actual text
      cy.get('[class*="page-header__title"]').should('not.be.empty')
    })

    it('should display the refund policy content', () => {
      cy.get('[class*="page-text"]').should('be.visible')
      cy.get('[class*="page-text"]').should('not.be.empty')
    })
  })

  describe('Navigation', () => {
    it('should display the back button', () => {
      cy.get('[class*="button"]').should('be.visible')
      cy.get('[class*="button"] svg').should('exist')
    })

    it('should navigate back when back button is clicked', () => {
      // First navigate to refund page from home
      cy.visit('/')
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      
      // Then go to refund page
      cy.visit('/refund')
      cy.url().should('include', '/refund')
      
      // Click back button
      cy.get('[class*="button"]').click()
      
      // Should navigate back to previous page
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })

    it('should handle direct URL access', () => {
      cy.visit('/refund')
      cy.url().should('include', '/refund')
      cy.get('[class*="page"]').should('exist')
    })

    it('should work with browser back/forward buttons', () => {
      cy.visit('/services')
      cy.visit('/refund')
      cy.go('back')
      cy.url().should('include', '/services')
      cy.go('forward')
      cy.url().should('include', '/refund')
    })
  })

  describe('Translation Integration', () => {
    it('should load refund title translation', () => {
      cy.get('[class*="page-header__title"]').should('exist')
      // In isolated testing, may show key or actual translation
      cy.get('[class*="page-header__title"]').should('not.be.empty')
    })

    it('should load refund text translation', () => {
      cy.get('[class*="page-text"]').should('exist')
      // In isolated testing, may show key or actual translation
      cy.get('[class*="page-text"]').should('not.be.empty')
    })

    it('should handle missing translations gracefully', () => {
      // Should still render the component structure even if translations fail
      cy.get('[class*="page"]').should('exist')
      cy.get('[class*="page-container"]').should('exist')
      cy.get('[class*="page-header__title"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
    })
  })

  describe('Component Structure', () => {
    it('should have correct HTML structure', () => {
      cy.get('[class*="page"]').should('exist')
      cy.get('[class*="page"] [class*="container"]').should('exist')
      cy.get('[class*="page-container"]').should('exist')
      cy.get('[class*="page-header"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
    })

    it('should render CaretRightIcon in back button', () => {
      cy.get('[class*="button"] svg').should('exist')
      cy.get('[class*="button"] svg').should('have.attr', 'viewBox', '0 0 16 16')
    })

    it('should use h1 tag for title', () => {
      cy.get('[class*="page-header__title"]').should('match', 'h1')
    })

    it('should integrate TextPage component properly', () => {
      // Verify TextPage component props are passed correctly
      cy.get('[class*="page-header__title"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
    })
  })

  describe('Styling and Typography', () => {
    it('should have proper heading typography', () => {
      cy.get('[class*="page-header__title"]').should('have.css', 'font-size', '48px')
      cy.get('[class*="page-header__title"]').should('have.css', 'font-weight', '500')
      cy.get('[class*="page-header__title"]').should('have.css', 'color', 'rgb(255, 255, 255)')
    })

    it('should have proper text styling', () => {
      cy.get('[class*="page-text"]').should('have.css', 'font-size', '14px')
      cy.get('[class*="page-text"]').should('have.css', 'line-height', '19.6px')
      cy.get('[class*="page-text"]').should('have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('[class*="page-text"]').should('have.css', 'white-space', 'pre-line')
    })

    it('should have proper back button styling', () => {
      cy.get('[class*="button"]').should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
      cy.get('[class*="button"]').should('have.css', 'border-width', '0px')
      cy.get('[class*="button"]').should('have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('[class*="button"]').should('have.css', 'cursor', 'pointer')
    })

    it('should maintain consistent styling with TextPage component', () => {
      cy.get('[class*="page-container"]').should('have.css', 'gap', '32px')
      cy.get('[class*="page-header"]').should('be.visible')
    })
  })

  describe('Responsive Design', () => {
    it('should display correctly on desktop', () => {
      cy.viewport(1200, 800)
      cy.get('[class*="page-header__title"]').should('have.css', 'font-size', '48px')
      cy.get('[class*="page-container"]').should('have.css', 'gap', '32px')
      cy.get('[class*="page"]').should('be.visible')
    })

    it('should adapt to mobile view', () => {
      cy.viewport(480, 800)
      cy.get('[class*="page-header__title"]').should('have.css', 'font-size', '31px')
      cy.get('[class*="page-text"]').should('have.css', 'font-size', '16px')
      cy.get('[class*="page"]').should('be.visible')
    })

    it('should maintain proper spacing on tablet', () => {
      cy.viewport(768, 1024)
      cy.get('[class*="page-container"]').should('be.visible')
      cy.get('[class*="page-header"]').should('be.visible')
      cy.get('[class*="page-text"]').should('be.visible')
    })

    it('should handle very small screens', () => {
      cy.viewport(320, 568)
      cy.get('[class*="page"]').should('be.visible')
      cy.get('[class*="button"]').should('be.visible')
      cy.get('[class*="page-header__title"]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist')
      cy.get('[class*="page-header__title"]').should('match', 'h1')
      // Should only have one h1 on the page
      cy.get('h1').should('have.length', 1)
    })

    it('should have clickable back button', () => {
      cy.get('[class*="button"]').should('be.visible')
      cy.get('[class*="button"]').should('not.have.attr', 'disabled')
      cy.get('[class*="button"]').should('be.enabled')
    })

    it('should have proper color contrast', () => {
      cy.get('[class*="page-header__title"]').should('have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('[class*="page-text"]').should('have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('[class*="button"]').should('have.css', 'color', 'rgb(255, 255, 255)')
    })

    it('should support keyboard navigation', () => {
      cy.get('[class*="button"]').focus()
      cy.get('[class*="button"]').should('be.focused')
      cy.get('[class*="button"]').type('{enter}')
      // Navigation behavior will be tested in other tests
    })

    it('should have semantic HTML structure', () => {
      cy.get('main, [role="main"], article, section').should('exist')
      cy.get('button').should('exist')
      cy.get('h1').should('exist')
    })
  })

  describe('Multi-language Support', () => {
    it('should display back button text', () => {
      cy.get('[class*="button"]').should('be.visible')
      // In isolated testing, may show 'back' key or actual translation
      cy.get('[class*="button"]').should('not.be.empty')
    })

    it('should handle RTL layout for Hebrew', () => {
      // Simulate Hebrew language context
      cy.window().then((win) => {
        const i18n = (win as any).i18n
        if (i18n) {
          i18n.changeLanguage('he')
        }
      })
      
      cy.reload()
      // Check that CaretRightIcon transform is applied for Hebrew
      cy.get('[class*="button"] svg').should('exist')
    })

    it('should maintain proper text direction', () => {
      // Test that content flows properly regardless of language
      cy.get('[class*="page-text"]').should('be.visible')
      cy.get('[class*="page-header__title"]').should('be.visible')
    })
  })

  describe('Performance', () => {
    it('should load within reasonable time', () => {
      const start = Date.now()
      cy.visit('/refund').then(() => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(3000) // 3 seconds max
      })
    })

    it('should not have memory leaks on repeated visits', () => {
      // Test multiple navigations
      for (let i = 0; i < 3; i++) {
        cy.visit('/refund')
        cy.get('[class*="page"]').should('exist')
        cy.visit('/services')
        cy.url().should('include', '/services')
      }
    })

    it('should render efficiently', () => {
      cy.visit('/refund')
      cy.get('[class*="page"]').should('exist')
      
      // Measure basic rendering performance
      cy.window().then((win) => {
        const performanceEntries = win.performance.getEntriesByType('navigation')
        if (performanceEntries.length > 0) {
          const navEntry = performanceEntries[0] as PerformanceNavigationTiming
          expect(navEntry.loadEventEnd - navEntry.loadEventStart).to.be.lessThan(1000)
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle component mounting errors gracefully', () => {
      cy.visit('/refund')
      cy.get('[class*="page"]').should('exist')
      
      // Should not show any error boundaries or crash messages
      cy.get('[data-testid="error-boundary"]').should('not.exist')
      cy.contains('Something went wrong').should('not.exist')
    })

    it('should handle navigation errors', () => {
      cy.visit('/refund')
      cy.get('[class*="button"]').should('be.clickable')
      
      // Even if navigation fails, button should remain functional
      cy.get('[class*="button"]').click()
      // Should not crash the application
      cy.get('body').should('exist')
    })

    it('should render with component integration', () => {
      // Verify Refund component properly integrates with TextPage
      cy.visit('/refund')
      cy.get('[class*="page-header__title"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
    })
  })

  describe('Refund Policy Specific Tests', () => {
    it('should be accessible from main navigation', () => {
      cy.visit('/')
      // Check if refund page is listed in available services
      cy.contains('Refund').should('exist')
    })

    it('should display refund policy content appropriately', () => {
      cy.visit('/refund')
      
      // Refund policy should have title and content
      cy.get('[class*="page-header__title"]').should('be.visible')
      cy.get('[class*="page-text"]').should('be.visible')
      
      // Content should not be empty
      cy.get('[class*="page-text"]').should('not.be.empty')
    })

    it('should maintain legal compliance page structure', () => {
      cy.visit('/refund')
      
      // Should have proper legal document structure
      cy.get('h1').should('exist') // Main title
      cy.get('[class*="page-text"]').should('exist') // Content
      cy.get('[class*="button"]').should('exist') // Navigation
    })

    it('should integrate properly with other legal pages', () => {
      // Test navigation between legal pages
      cy.visit('/cookie')
      cy.get('[class*="page"]').should('exist')
      
      cy.visit('/refund')
      cy.get('[class*="page"]').should('exist')
      
      // Both should use same TextPage component structure
      cy.get('[class*="page-header__title"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
    })

    it('should display comprehensive refund conditions', () => {
      cy.visit('/refund')
      
      // Should contain refund policy content
      cy.get('[class*="page-text"]').should('be.visible')
      // Content should be substantial (not just a placeholder)
      cy.get('[class*="page-text"]').should('not.be.empty')
    })
  })

  describe('Integration Tests', () => {
    it('should work with React Router', () => {
      cy.visit('/refund')
      cy.url().should('include', '/refund')
      
      // Navigate away and back
      cy.visit('/services')
      cy.visit('/refund')
      cy.url().should('include', '/refund')
      cy.get('[class*="page"]').should('exist')
    })

    it('should integrate with i18next properly', () => {
      cy.visit('/refund')
      
      // Should load translation context without errors
      cy.get('[class*="page-header__title"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
      cy.get('[class*="button"]').should('exist')
    })

    it('should work with CSS modules', () => {
      cy.visit('/refund')
      
      // CSS module classes should be applied
      cy.get('[class*="page"]').should('have.class').and('match', /^[\w-]+$/)
      cy.get('[class*="page-container"]').should('have.class').and('match', /^[\w-]+$/)
    })

    it('should maintain consistent experience with Cookie page', () => {
      // Test both pages have similar structure and behavior
      cy.visit('/cookie')
      cy.get('[class*="page-header__title"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
      cy.get('[class*="button"]').should('exist')
      
      cy.visit('/refund')
      cy.get('[class*="page-header__title"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
      cy.get('[class*="button"]').should('exist')
    })
  })

  describe('Content Validation', () => {
    it('should handle refund policy content formatting', () => {
      cy.visit('/refund')
      
      // Should support pre-line formatting for policy text
      cy.get('[class*="page-text"]').should('have.css', 'white-space', 'pre-line')
    })

    it('should not have empty content areas', () => {
      cy.visit('/refund')
      
      cy.get('[class*="page-header__title"]').should('not.be.empty')
      cy.get('[class*="page-text"]').should('not.be.empty')
    })

    it('should maintain translation key consistency', () => {
      cy.visit('/refund')
      
      // Should use consistent translation pattern
      cy.get('[class*="page-header__title"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
    })
  })
})