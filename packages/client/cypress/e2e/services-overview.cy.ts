describe('ServicesOverview Page', () => {
  beforeEach(() => {
    // Visit the ServicesOverview page
    cy.visit('/services')
  })

  it('should display services overview page with all required elements', () => {
    // Check if the main container is visible
    cy.get('.services-overview').should('be.visible')
    
    // Check if the services container is visible
    cy.get('.services-container').should('be.visible')
    
    // Check if the header section is displayed
    cy.get('.services-header').should('be.visible')
    
    // Check if the main title is displayed
    cy.get('.services-title').should('be.visible')
    
    // Check if the subtitle is displayed
    cy.get('.services-subtitle').should('be.visible').and('contain.text', 'בחרו את השירות הפיננסי המתאים לכם')
    
    // Check if the services grid is displayed
    cy.get('.services-grid').should('be.visible')
    
    // Check if all 4 service cards are displayed
    cy.get('.service-card').should('have.length', 4)
  })

  it('should display all service cards with correct content', () => {
    // Check Calculate Mortgage card
    cy.get('.service-card').first().within(() => {
      cy.get('img').should('be.visible').and('have.attr', 'src', '/static/calculate-mortgage-icon.png')
      cy.get('.service-title').should('be.visible')
      cy.get('.service-description').should('be.visible').and('contain.text', 'חישוב משכנתא מותאמת אישית')
      cy.get('.service-arrow').should('be.visible')
    })
    
    // Check Refinance Mortgage card
    cy.get('.service-card').eq(1).within(() => {
      cy.get('img').should('be.visible').and('have.attr', 'src', '/static/refinance-mortgage-icon.png')
      cy.get('.service-title').should('be.visible')
      cy.get('.service-description').should('be.visible').and('contain.text', 'מחזור משכנתא קיימת')
      cy.get('.service-arrow').should('be.visible')
    })
    
    // Check Calculate Credit card
    cy.get('.service-card').eq(2).within(() => {
      cy.get('img').should('be.visible').and('have.attr', 'src', '/static/calculate-credit-icon.png')
      cy.get('.service-title').should('be.visible')
      cy.get('.service-description').should('be.visible').and('contain.text', 'חישוב אשראי אישי')
      cy.get('.service-arrow').should('be.visible')
    })
    
    // Check Refinance Credit card
    cy.get('.service-card').eq(3).within(() => {
      cy.get('img').should('be.visible').and('have.attr', 'src', '/static/refinance-credit-icon.png')
      cy.get('.service-title').should('be.visible')
      cy.get('.service-description').should('be.visible').and('contain.text', 'מחזור אשראי קיים')
      cy.get('.service-arrow').should('be.visible')
    })
  })

  it('should have correct RTL layout for Hebrew', () => {
    // Check if body has RTL class
    cy.get('body').should('have.class', 'rtl')
    
    // Check if HTML direction is RTL
    cy.get('html').should('have.attr', 'dir', 'rtl')
    
    // Check if services overview has RTL class
    cy.get('.services-overview').should('have.class', 'rtl')
    
    // Check if text alignment is correct for RTL
    cy.get('.services-header').should('have.css', 'text-align', 'center')
    
    // Check if arrow icons are rotated for RTL
    cy.get('.service-arrow svg').first().should('have.attr', 'style').and('include', 'rotate(180deg)')
  })

  it('should handle service card interactions correctly', () => {
    // Test Calculate Mortgage card click
    cy.get('.service-card').first().click()
    cy.url().should('include', '/services/calculate-mortgage/1')
    
    // Navigate back
    cy.go('back')
    cy.url().should('include', '/services')
    
    // Test keyboard navigation with Enter key
    cy.get('.service-card').eq(1).focus().type('{enter}')
    cy.url().should('include', '/services/refinance-mortgage/1')
    
    // Navigate back
    cy.go('back')
    
    // Test keyboard navigation with Space key
    cy.get('.service-card').eq(2).focus().type(' ')
    cy.url().should('include', '/services/calculate-credit/1')
    
    // Navigate back
    cy.go('back')
    
    // Test last card click
    cy.get('.service-card').eq(3).click()
    cy.url().should('include', '/services/refinance-credit/1')
  })

  it('should have proper accessibility attributes', () => {
    // Check if service cards have proper role
    cy.get('.service-card').each(($card) => {
      cy.wrap($card).should('have.attr', 'role', 'button')
      cy.wrap($card).should('have.attr', 'tabindex', '0')
    })
    
    // Check if images have alt attributes
    cy.get('.service-card img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt')
    })
    
    // Check if cards are focusable
    cy.get('.service-card').first().focus().should('have.focus')
  })

  it('should display correctly on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport(375, 667)
    
    // Check if container is responsive
    cy.get('.services-container').should('be.visible')
    
    // Check if grid switches to single column on mobile
    cy.get('.services-grid').should('have.css', 'grid-template-columns', '1fr')
    
    // Check if all service cards are still visible
    cy.get('.service-card').should('have.length', 4).and('be.visible')
    
    // Check if header content is still visible
    cy.get('.services-title').should('be.visible')
    cy.get('.services-subtitle').should('be.visible')
  })

  it('should support multiple languages', () => {
    // Test English
    cy.window().then((win) => {
      // @ts-ignore
      win.i18n.changeLanguage('en')
    })
    
    cy.get('.services-subtitle').should('contain.text', 'Choose the financial service that suits you')
    cy.get('.service-description').first().should('contain.text', 'Personalized mortgage calculation')
    cy.get('body').should('have.class', 'ltr')
    cy.get('.service-arrow svg').first().should('have.attr', 'style').and('include', 'rotate(0deg)')
    
    // Test Russian
    cy.window().then((win) => {
      // @ts-ignore
      win.i18n.changeLanguage('ru')
    })
    
    cy.get('.services-subtitle').should('contain.text', 'Выберите подходящую финансовую услугу')
    cy.get('.service-description').first().should('contain.text', 'Персонализированный расчет ипотеки')
    cy.get('body').should('have.class', 'ltr')
    
    // Back to Hebrew
    cy.window().then((win) => {
      // @ts-ignore
      win.i18n.changeLanguage('he')
    })
    
    cy.get('.services-subtitle').should('contain.text', 'בחרו את השירות הפיננסי המתאים לכם')
    cy.get('body').should('have.class', 'rtl')
  })

  it('should have proper semantic HTML structure', () => {
    // Check main container
    cy.get('div.services-overview').should('exist')
    
    // Check semantic structure
    cy.get('.services-container').should('exist')
    cy.get('.services-header').should('exist')
    cy.get('.services-grid').should('exist')
    
    // Check heading hierarchy
    cy.get('h1.services-title').should('exist')
    cy.get('p.services-subtitle').should('exist')
    cy.get('h3.service-title').should('have.length', 4)
    
    // Check service descriptions
    cy.get('p.service-description').should('have.length', 4)
  })

  it('should load without JavaScript errors', () => {
    // Check for console errors
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError')
    })
    
    cy.visit('/services')
    cy.get('@consoleError').should('not.have.been.called')
  })

  it('should handle hover states correctly', () => {
    // Test hover effects on service cards
    cy.get('.service-card').first().trigger('mouseover')
    
    // Verify hover effects are applied (this would need specific CSS checks based on implementation)
    cy.get('.service-card').first().should('be.visible')
    
    cy.get('.service-card').first().trigger('mouseout')
  })

  it('should be accessible via different routes', () => {
    // Test /services route
    cy.visit('/services')
    cy.get('.services-overview').should('be.visible')
    
    // Test /services/overview route
    cy.visit('/services/overview')
    cy.get('.services-overview').should('be.visible')
  })

  it('should have proper CSS animations', () => {
    // Check if service cards have fade-in animation
    cy.get('.service-card').each(($card, index) => {
      cy.wrap($card).should('have.css', 'animation')
      
      // Check animation delay for staggered effect
      if (index > 0) {
        cy.wrap($card).should('have.css', 'animation-delay')
      }
    })
  })

  it('should handle missing icons gracefully', () => {
    // Intercept image requests and return 404 for icons
    cy.intercept('GET', '/static/*.png', { statusCode: 404 }).as('iconRequest')
    
    cy.visit('/services')
    
    // Wait for icon requests
    cy.wait('@iconRequest')
    
    // Page should still be functional
    cy.get('.services-overview').should('be.visible')
    cy.get('.service-card').should('have.length', 4)
    
    // Service cards should still be clickable
    cy.get('.service-card').first().click()
    cy.url().should('include', '/services/calculate-mortgage/1')
  })

  it('should maintain focus management for keyboard users', () => {
    // Tab through service cards
    cy.get('body').tab()
    cy.focused().should('have.class', 'service-card')
    
    cy.focused().tab()
    cy.focused().should('have.class', 'service-card')
    
    cy.focused().tab()
    cy.focused().should('have.class', 'service-card')
    
    cy.focused().tab()
    cy.focused().should('have.class', 'service-card')
  })

  it('should display container with proper max-width', () => {
    // Check desktop layout
    cy.viewport(1920, 1080)
    cy.get('.services-container').should('have.css', 'max-width', '1200px')
    
    // Check tablet layout
    cy.viewport(768, 1024)
    cy.get('.services-container').should('be.visible')
    
    // Check mobile layout
    cy.viewport(375, 667)
    cy.get('.services-container').should('be.visible')
  })
})