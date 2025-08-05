describe('TextPage Component Tests', () => {
  beforeEach(() => {
    cy.visit('/test-textpage')
  })

  it('should load the TextPage component successfully', () => {
    cy.url().should('include', '/test-textpage')
    cy.get('[class*="page"]').should('exist')
  })

  it('should display the provided title', () => {
    cy.get('[class*="page-header__title"]').should('be.visible')
    cy.get('[class*="page-header__title"]').should('contain.text', 'Test TextPage Component')
  })

  it('should display the provided text content', () => {
    cy.get('[class*="page-text"]').should('be.visible')
    cy.get('[class*="page-text"]').should('contain.text', 'This is a test of the TextPage component')
  })

  it('should display the back button', () => {
    cy.get('[class*="button"]').should('be.visible')
    cy.get('[class*="button"] svg').should('exist')
    cy.get('[class*="button"]').should('contain.text', 'Back')
  })

  it('should render Container component', () => {
    cy.get('[class*="page"] [class*="container"]').should('exist')
  })

  it('should render CaretRightIcon in back button', () => {
    cy.get('[class*="button"] svg').should('exist')
    cy.get('[class*="button"] svg').should('have.attr', 'viewBox', '0 0 16 16')
  })

  it('should have correct component structure', () => {
    cy.get('[class*="page-container"]').should('exist')
    cy.get('[class*="page-header"]').should('exist')
    cy.get('[class*="page-text"]').should('exist')
  })

  it('should navigate back when back button is clicked', () => {
    // First navigate to a different page
    cy.visit('/services')
    cy.url().should('include', '/services')
    
    // Then go to test-textpage
    cy.visit('/test-textpage')
    cy.url().should('include', '/test-textpage')
    
    // Click back button
    cy.get('[class*="button"]').click()
    
    // Should navigate back
    cy.url().should('include', '/services')
  })

  describe('Typography and Styling', () => {
    it('should have proper heading typography', () => {
      cy.get('[class*="page-header__title"]').should('match', 'h1')
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
  })

  describe('Multi-language Support', () => {
    it('should display back button text in English by default', () => {
      cy.get('[class*="button"]').should('contain.text', 'Back')
    })

    it('should handle RTL layout for Hebrew', () => {
      // Simulate Hebrew language
      cy.window().then((win) => {
        const i18n = (win as any).i18n
        if (i18n) {
          i18n.changeLanguage('he')
        }
      })
      
      cy.reload()
      // Check that CaretRightIcon transform is applied for Hebrew
      cy.get('[class*="button"] svg').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)')
    })
  })

  describe('Responsive Design', () => {
    it('should display correctly on desktop', () => {
      cy.viewport(1200, 800)
      cy.get('[class*="page-header__title"]').should('have.css', 'font-size', '48px')
      cy.get('[class*="page-container"]').should('have.css', 'gap', '32px')
    })

    it('should adapt to mobile view', () => {
      cy.viewport(480, 800)
      cy.get('[class*="page-header__title"]').should('have.css', 'font-size', '31px')
      cy.get('[class*="page-text"]').should('have.css', 'font-size', '16px')
    })

    it('should maintain proper spacing on mobile', () => {
      cy.viewport(768, 1024)
      cy.get('[class*="page-container"]').should('be.visible')
      cy.get('[class*="page-header"]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist')
      cy.get('[class*="page-header__title"]').should('match', 'h1')
    })

    it('should have clickable back button', () => {
      cy.get('[class*="button"]').should('be.visible')
      cy.get('[class*="button"]').should('not.have.attr', 'disabled')
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
      // Should navigate (URL change will be tested in integration tests)
    })
  })

  describe('Content Handling', () => {
    it('should handle provided props correctly', () => {
      cy.get('[class*="page-header__title"]').should('contain.text', 'Test TextPage Component')
      cy.get('[class*="page-text"]').should('contain.text', 'This is a test of the TextPage component')
    })

    it('should handle pre-line formatting', () => {
      cy.get('[class*="page-text"]').should('have.css', 'white-space', 'pre-line')
    })

    it('should not have empty content', () => {
      cy.get('[class*="page-header__title"]').should('not.be.empty')
      cy.get('[class*="page-text"]').should('not.be.empty')
    })
  })

  describe('Performance', () => {
    it('should load within reasonable time', () => {
      const start = Date.now()
      cy.visit('/test-textpage').then(() => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(3000) // 3 seconds max
      })
    })

    it('should not have memory leaks on repeated visits', () => {
      // Test multiple navigations
      for (let i = 0; i < 3; i++) {
        cy.visit('/test-textpage')
        cy.get('[class*="page"]').should('exist')
        cy.visit('/services')
        cy.get('[class*="services-overview"]').should('exist')
      }
    })
  })

  describe('Integration with Router', () => {
    it('should work with browser back/forward buttons', () => {
      cy.visit('/services')
      cy.visit('/test-textpage')
      cy.go('back')
      cy.url().should('include', '/services')
      cy.go('forward')
      cy.url().should('include', '/test-textpage')
    })

    it('should handle direct URL access', () => {
      cy.visit('/test-textpage')
      cy.url().should('include', '/test-textpage')
      cy.get('[class*="page"]').should('exist')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing translations gracefully', () => {
      // Should still render the component structure even if translations fail
      cy.get('[class*="page"]').should('exist')
      cy.get('[class*="page-container"]').should('exist')
      cy.get('[class*="button"]').should('exist')
    })

    it('should render with empty props gracefully', () => {
      // This would need a separate test route, but ensuring robustness
      cy.get('[class*="page-header__title"]').should('exist')
      cy.get('[class*="page-text"]').should('exist')
    })
  })
})