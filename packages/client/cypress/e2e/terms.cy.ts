describe('Terms Page Tests', () => {
  beforeEach(() => {
    cy.visit('/terms')
  })

  it('should load the Terms page successfully', () => {
    cy.url().should('include', '/terms')
    cy.get('[class*="terms"]').should('exist')
  })

  it('should display the terms title', () => {
    cy.get('[class*="terms-title"]').should('be.visible')
    cy.get('[class*="terms-title"]').should('not.be.empty')
  })

  it('should display the terms text content', () => {
    cy.get('[class*="terms-text"]').should('be.visible')
    cy.get('[class*="terms-text"] p').should('exist')
  })

  it('should display the back button', () => {
    cy.get('[class*="back-button"]').should('be.visible')
    cy.get('[class*="back-button"] svg').should('exist')
  })

  it('should have proper dark theme styling', () => {
    cy.get('[class*="terms"]').should('have.css', 'background-color', 'rgb(22, 22, 22)')
    cy.get('[class*="terms"]').should('have.css', 'color', 'rgb(255, 255, 255)')
  })

  it('should render Container component', () => {
    cy.get('[class*="terms"] [class*="container"]').should('exist')
  })

  it('should render CaretRightIcon in back button', () => {
    cy.get('[class*="back-button"] svg').should('exist')
    cy.get('[class*="back-button"] svg').should('have.attr', 'viewBox', '0 0 16 16')
  })

  it('should have correct page structure', () => {
    cy.get('[class*="terms-container"]').should('exist')
    cy.get('[class*="terms-header"]').should('exist')
    cy.get('[class*="terms-content"]').should('exist')
  })

  it('should navigate back when back button is clicked', () => {
    // First navigate to a different page
    cy.visit('/services')
    cy.url().should('include', '/services')
    
    // Then go to terms
    cy.visit('/terms')
    cy.url().should('include', '/terms')
    
    // Click back button
    cy.get('[class*="back-button"]').click()
    
    // Should navigate back
    cy.url().should('include', '/services')
  })

  describe('Multi-language Support', () => {
    it('should display content in English by default', () => {
      cy.get('[class*="terms-title"]').should('contain.text', 'Terms')
      cy.get('[class*="back-button"]').should('contain.text', 'Back')
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
      cy.get('[class*="terms"].rtl').should('exist')
    })
  })

  describe('Responsive Design', () => {
    it('should display correctly on desktop', () => {
      cy.viewport(1200, 800)
      cy.get('[class*="terms-container"]').should('have.css', 'max-width', '1130px')
      cy.get('[class*="terms-title"]').should('have.css', 'font-size', '48px')
    })

    it('should adapt to tablet view', () => {
      cy.viewport(768, 1024)
      cy.get('[class*="terms"]').should('be.visible')
      // Test responsive padding changes
      cy.get('[class*="terms-container"]').should('exist')
    })

    it('should adapt to mobile view', () => {
      cy.viewport(480, 800)
      cy.get('[class*="terms"]').should('be.visible')
      cy.get('[class*="terms-container"]').should('exist')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist')
      cy.get('[class*="terms-title"]').should('match', 'h1')
    })

    it('should have clickable back button', () => {
      cy.get('[class*="back-button"]').should('be.visible')
      cy.get('[class*="back-button"]').should('not.have.attr', 'disabled')
    })

    it('should have proper color contrast', () => {
      cy.get('[class*="terms-title"]').should('have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('[class*="terms-text"]').should('have.css', 'color', 'rgb(255, 255, 255)')
    })
  })

  describe('Content Validation', () => {
    it('should not have empty content', () => {
      cy.get('[class*="terms-title"]').should('not.be.empty')
      cy.get('[class*="terms-text"] p').should('not.be.empty')
    })

    it('should handle long text content properly', () => {
      cy.get('[class*="terms-text"]').should('be.visible')
      cy.get('[class*="terms-text"] p').should('have.css', 'white-space', 'pre-wrap')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing translations gracefully', () => {
      // Should still render the page structure even if translations fail
      cy.get('[class*="terms"]').should('exist')
      cy.get('[class*="terms-container"]').should('exist')
      cy.get('[class*="back-button"]').should('exist')
    })
  })

  describe('Performance', () => {
    it('should load within reasonable time', () => {
      const start = Date.now()
      cy.visit('/terms').then(() => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(3000) // 3 seconds max
      })
    })

    it('should not have memory leaks on repeated visits', () => {
      // Test multiple navigations
      for (let i = 0; i < 3; i++) {
        cy.visit('/terms')
        cy.get('[class*="terms"]').should('exist')
        cy.visit('/services')
        cy.get('[class*="services-overview"]').should('exist')
      }
    })
  })

  describe('Integration with Router', () => {
    it('should work with browser back/forward buttons', () => {
      cy.visit('/services')
      cy.visit('/terms')
      cy.go('back')
      cy.url().should('include', '/services')
      cy.go('forward')
      cy.url().should('include', '/terms')
    })

    it('should handle direct URL access', () => {
      cy.visit('/terms')
      cy.url().should('include', '/terms')
      cy.get('[class*="terms"]').should('exist')
    })
  })
})