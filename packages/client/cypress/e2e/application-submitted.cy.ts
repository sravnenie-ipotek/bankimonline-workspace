describe('ApplicationSubmitted Service', () => {
  beforeEach(() => {
    // Visit the ApplicationSubmitted page
    cy.visit('/services/application-submitted')
  })

  it('should display success page with all required elements', () => {
    // Check if the success icon is visible
    cy.get('[role="img"][aria-label="Success"]').should('be.visible')
    
    // Check if the title is displayed
    cy.get('h2').should('be.visible').and('contain.text', 'הבקשה נשלחה בהצלחה')
    
    // Check if the description is displayed
    cy.get('p').should('be.visible').and('contain.text', 'נציגינו יצרו איתך קשר בקרוב')
    
    // Check if the button is displayed and clickable
    cy.get('a').should('be.visible').and('contain.text', 'מעבר להתכתבויות')
  })

  it('should have correct RTL layout for Hebrew', () => {
    // Check if body has RTL class
    cy.get('body').should('have.class', 'rtl')
    
    // Check if HTML direction is RTL
    cy.get('html').should('have.attr', 'dir', 'rtl')
    
    // Check if text alignment is correct for RTL
    cy.get('.application-submitted-container').should('have.css', 'text-align', 'center')
  })

  it('should have proper accessibility attributes', () => {
    // Check success icon accessibility
    cy.get('[role="img"][aria-label="Success"]').should('exist')
    
    // Check if headings are properly structured
    cy.get('h2').should('exist')
    
    // Check if button is focusable
    cy.get('a[href="/personal-cabinet"]').should('be.visible').focus().should('have.focus')
  })

  it('should handle button click correctly', () => {
    // Click the correspondence button
    cy.get('a[href="/personal-cabinet"]').click()
    
    // Should navigate to personal cabinet (will show 404 since not migrated yet)
    cy.url().should('include', '/personal-cabinet')
    cy.contains('404 - Page Not Found').should('be.visible')
  })

  it('should display correctly on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport(375, 667)
    
    // Check if container is responsive
    cy.get('.application-submitted-container').should('be.visible')
    
    // Check if all elements are still visible
    cy.get('[role="img"][aria-label="Success"]').should('be.visible')
    cy.get('h2').should('be.visible')
    cy.get('p').should('be.visible')
    cy.get('a').should('be.visible')
  })

  it('should support multiple languages', () => {
    // Test English
    cy.window().then((win) => {
      // @ts-ignore
      win.i18n.changeLanguage('en')
    })
    
    cy.get('h2').should('contain.text', 'Application Submitted Successfully')
    cy.get('body').should('have.class', 'ltr')
    
    // Test Russian
    cy.window().then((win) => {
      // @ts-ignore
      win.i18n.changeLanguage('ru')
    })
    
    cy.get('h2').should('contain.text', 'Заявка успешно отправлена')
    cy.get('body').should('have.class', 'ltr')
    
    // Back to Hebrew
    cy.window().then((win) => {
      // @ts-ignore
      win.i18n.changeLanguage('he')
    })
    
    cy.get('h2').should('contain.text', 'הבקשה נשלחה בהצלחה')
    cy.get('body').should('have.class', 'rtl')
  })

  it('should load without JavaScript errors', () => {
    // Check for console errors
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError')
    })
    
    cy.visit('/services/application-submitted')
    cy.get('@consoleError').should('not.have.been.called')
  })

  it('should have proper semantic HTML structure', () => {
    // Check semantic structure
    cy.get('div.application-submitted').should('exist')
    cy.get('div.application-submitted-container').should('exist')
    cy.get('div.application-submitted-header').should('exist')
    cy.get('div.application-submitted-footer').should('exist')
    
    // Check heading hierarchy
    cy.get('h2').should('exist')
    
    // Check paragraph
    cy.get('p').should('exist')
    
    // Check link
    cy.get('a[href="/personal-cabinet"]').should('exist')
  })
})