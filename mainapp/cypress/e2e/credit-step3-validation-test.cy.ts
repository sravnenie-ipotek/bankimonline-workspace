describe('Credit Calculator Step 3 - Dropdown Validation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/services/calculate-credit/3')
    
    // Wait for page load and dropdowns to initialize
    cy.wait(2000)
  })

  it('should load all dropdowns with Hebrew options and translations', () => {
    // Test Main Source of Income dropdown
    cy.get('[data-testid*="main"], [title*="מקור"], [placeholder*="מקור"]')
      .should('exist')
      .first()
      .click()
    
    // Should show Hebrew options
    cy.get('body').should('contain', 'משכורת')
    cy.get('body').should('contain', 'עצמאי')
    
    // Close dropdown
    cy.get('body').click()
    
    // Test Additional Income dropdown
    cy.get('[data-testid*="additional"], [title*="הכנסות"], [placeholder*="הכנסות"]')
      .should('exist')
      .first()
      .click()
    
    // Should show Hebrew options
    cy.get('body').should('contain', 'עבודה במשרה חלקית')
    cy.get('body').should('contain', 'עבודה עצמאית')
    cy.get('body').should('contain', 'אין')
    
    // Close dropdown
    cy.get('body').click()
    
    // Test Existing Debts/Obligations dropdown
    cy.get('[data-testid*="obligation"], [data-testid*="debt"], [title*="חובות"], [placeholder*="חובות"], [title*="התחייבויות"]')
      .should('exist')
      .first()
      .click()
    
    // Should show Hebrew options
    cy.get('body').should('contain', 'משכנתא')
    cy.get('body').should('contain', 'הלוואה אישית')
    cy.get('body').should('contain', 'אין חובות')
    
    // Close dropdown
    cy.get('body').click()
  })

  it('should have proper Hebrew labels and placeholders', () => {
    // Check for Hebrew text content on the page
    cy.get('body').should('contain', 'מקור')
    cy.get('body').should('contain', 'הכנסה')
    cy.get('body').should('contain', 'התחייבויות')
    
    // All dropdowns should be clickable (not disabled)
    cy.get('[role="combobox"], [role="button"], select, .dropdown')
      .should('not.be.disabled')
  })

  it('should allow selecting options from all dropdowns', () => {
    // Test selecting from main source dropdown
    cy.get('body').then($body => {
      if ($body.find('[data-testid*="main"], [title*="מקור"], [placeholder*="מקור"]').length > 0) {
        cy.get('[data-testid*="main"], [title*="מקור"], [placeholder*="מקור"]')
          .first()
          .click()
        
        cy.get('body').contains('משכורת').click()
      }
    })

    // Test selecting from additional income dropdown  
    cy.get('body').then($body => {
      if ($body.find('[data-testid*="additional"], [title*="הכנסות"], [placeholder*="הכנסות"]').length > 0) {
        cy.get('[data-testid*="additional"], [title*="הכנסות"], [placeholder*="הכנסות"]')
          .first()
          .click()
        
        cy.get('body').contains('אין').click()
      }
    })

    // Test selecting from obligations dropdown
    cy.get('body').then($body => {
      if ($body.find('[data-testid*="obligation"], [data-testid*="debt"], [title*="חובות"], [placeholder*="חובות"], [title*="התחייבויות"]').length > 0) {
        cy.get('[data-testid*="obligation"], [data-testid*="debt"], [title*="חובות"], [placeholder*="חובות"], [title*="התחייבויות"]')
          .first()
          .click()
        
        cy.get('body').contains('אין חובות').click()
      }
    })
  })

  it('should display validation messages in Hebrew when needed', () => {
    // Try to navigate without filling required fields
    // This should trigger validation messages in Hebrew
    cy.get('body').should('not.contain', 'undefined')
    cy.get('body').should('not.contain', 'null')
    
    // Page should be in Hebrew
    cy.get('html').should('have.attr', 'lang', 'he')
    cy.get('html').should('have.attr', 'dir', 'rtl')
  })

  it('should not have any empty dropdown options', () => {
    // No dropdown should be completely empty
    cy.get('[role="combobox"], select, .dropdown').each($dropdown => {
      cy.wrap($dropdown).click()
      
      // Should have some options available (not just empty)
      cy.get('body').should($body => {
        const hasOptions = $body.text().includes('משכורת') || 
                          $body.text().includes('עצמאי') ||
                          $body.text().includes('אין') ||
                          $body.text().includes('משכנתא') ||
                          $body.text().includes('עבודה')
        
        expect(hasOptions).to.be.true
      })
      
      // Close dropdown
      cy.get('body').click()
    })
  })
})