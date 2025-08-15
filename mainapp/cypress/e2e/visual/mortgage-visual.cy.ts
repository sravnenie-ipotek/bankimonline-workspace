/**
 * 🎨 MORTGAGE CALCULATOR - VISUAL REGRESSION TESTS
 * 
 * Comprehensive visual testing for the mortgage calculation flow
 * - Multi-language support (Hebrew RTL, English, Russian)  
 * - Responsive design validation
 * - Banking security compliance
 * - Step-by-step form progression
 */

describe('Mortgage Calculator - Visual Regression', () => {
  
  beforeEach(() => {
    // Setup test environment with Hebrew as default
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.localStorage.setItem('language', 'he')
    })
  })

  context('Step 1: Calculation Parameters', () => {
    
    it('Initial state - Clean form', () => {
      cy.visit('/services/calculate-mortgage/1')
      
      // Wait for page to fully load
      cy.get('[data-test="mortgage-step1"], .mortgage-form, .calculation-form', { timeout: 10000 })
        .should('be.visible')
      
      // Wait for dropdowns to load
      cy.wait(3000)
      
      // Take baseline snapshot
      cy.percySnapshot('Mortgage Step 1 - Initial State', {
        waitForSelector: '[data-test="mortgage-step1"], .mortgage-form, .calculation-form'
      })
    })

    it('Multi-language comparison', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Take snapshots in all languages
      cy.percySnapshotMultiLang('Mortgage Step 1 - Multi-language')
    })

    it('Form filled state', () => {
      cy.visit('/services/calculate-mortgage/1')
      
      // Wait for form to load
      cy.get('.mortgage-form, .calculation-form', { timeout: 10000 }).should('be.visible')
      cy.wait(2000)
      
      // Fill form with realistic data
      cy.fillFormField('property_value', '1200000')
      cy.fillFormField('down_payment', '240000')
      cy.fillFormField('loan_period', '25')
      
      // Select property ownership dropdown if available
      cy.get('body').then($body => {
        if ($body.find('[class*="dropdown"], select').length > 0) {
          cy.get('[class*="dropdown"], select').first().click()
          cy.wait(500)
          cy.get('[class*="option"], option').contains('אין לי נכס').click()
        }
      })
      
      cy.wait(1000)
      
      // Take snapshot of filled form
      cy.percySnapshot('Mortgage Step 1 - Form Filled', {
        percyCSS: `
          /* Highlight filled fields */
          input[value]:not([value=""]) {
            border: 2px solid #4CAF50 !important;
            background-color: #f0f8f0 !important;
          }
        `
      })
    })

    it('Responsive design validation', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Test responsive breakpoints
      cy.percySnapshotResponsive('Mortgage Step 1 - Responsive')
    })

    it('Form validation errors', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Try to submit empty form to trigger validation
      cy.get('button').contains('המשך').click()
      cy.wait(1000)
      
      // Take snapshot of validation state
      cy.percySnapshot('Mortgage Step 1 - Validation Errors', {
        percyCSS: `
          /* Highlight validation errors */
          .error, [class*="error"], .invalid, [class*="invalid"] {
            border: 3px solid #f44336 !important;
            background-color: #ffebee !important;
            box-shadow: 0 0 10px rgba(244, 67, 54, 0.3) !important;
          }
        `
      })
    })
  })

  context('Step 2: Personal Information', () => {
    
    beforeEach(() => {
      // Navigate to step 2 with proper data
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Fill step 1 data
      cy.fillFormField('property_value', '1200000')
      cy.fillFormField('down_payment', '240000')
      cy.fillFormField('loan_period', '25')
      
      // Continue to step 2
      cy.get('button').contains('המשך').click()
      cy.url().should('include', '/2')
    })

    it('Personal info form - Initial state', () => {
      cy.wait(2000)
      cy.percySnapshot('Mortgage Step 2 - Initial State')
    })

    it('Personal info form - Filled state', () => {
      // Fill personal information
      cy.fillFormField('first_name', 'יוסי')
      cy.fillFormField('last_name', 'כהן')
      cy.fillFormField('email', 'yossi.cohen@example.com')
      cy.fillFormField('phone', '0501234567')
      
      // Handle date picker if present
      cy.get('body').then($body => {
        if ($body.find('[class*="date"], input[type="date"]').length > 0) {
          cy.get('[class*="date"], input[type="date"]').first().type('1985-05-15')
        }
      })
      
      cy.wait(1000)
      cy.percySnapshot('Mortgage Step 2 - Personal Info Filled')
    })

    it('Multi-language personal info', () => {
      cy.percySnapshotMultiLang('Mortgage Step 2 - Multi-language')
    })
  })

  context('Step 3: Income & Employment', () => {
    
    beforeEach(() => {
      // Navigate through steps 1-2 to reach step 3
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Step 1 data
      cy.fillFormField('property_value', '1200000')
      cy.fillFormField('down_payment', '240000')
      cy.get('button').contains('המשך').click()
      cy.wait(1000)
      
      // Step 2 data  
      cy.fillFormField('first_name', 'יוסי')
      cy.fillFormField('last_name', 'כהן')
      cy.get('button').contains('המשך').click()
      cy.url().should('include', '/3')
      cy.wait(2000)
    })

    it('Income form - Initial state', () => {
      cy.percySnapshot('Mortgage Step 3 - Initial State')
    })

    it('Income form - Employment data filled', () => {
      // Fill employment information
      cy.fillFormField('monthly_income', '18000')
      cy.fillFormField('years_employed', '5')
      
      // Handle employment type dropdown
      cy.get('body').then($body => {
        const employmentDropdown = $body.find('[class*="employment"], [name*="employment"]')
        if (employmentDropdown.length > 0) {
          cy.get(employmentDropdown.first()).click()
          cy.wait(500)
          cy.get('[class*="option"]').contains('שכיר').click()
        }
      })
      
      cy.wait(1000)
      cy.percySnapshot('Mortgage Step 3 - Employment Filled')
    })

    it('Income sources modal', () => {
      // Try to open income sources modal
      cy.get('body').then($body => {
        const modalTrigger = $body.find('[class*="modal"], [data-test*="modal"], button[class*="source"]')
        if (modalTrigger.length > 0) {
          cy.get(modalTrigger.first()).click()
          cy.wait(1000)
          
          // Snapshot of modal
          cy.percySnapshot('Mortgage Step 3 - Income Sources Modal', {
            percyCSS: `
              /* Highlight modal */
              [class*="modal"], [class*="overlay"] {
                z-index: 9999 !important;
                background: rgba(0,0,0,0.8) !important;
              }
            `
          })
        }
      })
    })
  })

  context('Step 4: Bank Offers & Results', () => {
    
    beforeEach(() => {
      // Complete journey to step 4
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Quick progression through all steps
      cy.fillAllFormFields()
      cy.get('button').contains('המשך').click({ multiple: true })
      cy.wait(2000)
      
      // Navigate to step 4
      cy.visit('/services/calculate-mortgage/4')
      cy.wait(3000)
    })

    it('Bank offers - Results display', () => {
      cy.percySnapshot('Mortgage Step 4 - Bank Offers', {
        waitForSelector: '[class*="offer"], [class*="result"], [class*="bank"]',
        waitForTimeout: 5000
      })
    })

    it('Loan comparison table', () => {
      // Wait for comparison table to load
      cy.get('body').then($body => {
        if ($body.find('table, [class*="comparison"], [class*="offers"]').length > 0) {
          cy.wait(2000)
          cy.percySnapshot('Mortgage Step 4 - Loan Comparison')
        }
      })
    })

    it('Mobile responsive offers', () => {
      cy.percySnapshotResponsive('Mortgage Step 4 - Responsive Offers')
    })
  })

  context('Complete Flow Documentation', () => {
    
    it('End-to-end visual journey', () => {
      // Document the complete user journey
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      cy.percySnapshot('Mortgage Journey - Step 1 Start')
      
      // Progress through each step with documentation
      for (let step = 1; step <= 4; step++) {
        cy.visit(`/services/calculate-mortgage/${step}`)
        cy.wait(2000)
        
        if (step < 4) {
          cy.fillAllFormFields()
          cy.wait(1000)
          cy.percySnapshot(`Mortgage Journey - Step ${step} Completed`)
        } else {
          cy.percySnapshot(`Mortgage Journey - Step ${step} Results`)
        }
      }
    })

    it('Error states across all steps', () => {
      // Test error handling on each step
      for (let step = 1; step <= 3; step++) {
        cy.visit(`/services/calculate-mortgage/${step}`)
        cy.wait(2000)
        
        // Try to continue without filling required fields
        cy.get('button').contains('המשך').click()
        cy.wait(1000)
        
        cy.percySnapshot(`Mortgage Error State - Step ${step}`)
      }
    })
  })

  context('Banking Security & Compliance', () => {
    
    it('Secure data masking', () => {
      cy.visit('/services/calculate-mortgage/2')
      cy.wait(2000)
      
      // Fill with sensitive data
      cy.fillFormField('id_number', '123456789')
      cy.fillFormField('phone', '0501234567')
      cy.fillFormField('email', 'sensitive@email.com')
      
      // Take secure snapshot with data masking
      cy.percySnapshotSecure('Mortgage - Secure Data Masked')
    })

    it('Form validation security', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Test with invalid inputs that should be masked
      cy.fillFormField('property_value', '99999999')
      cy.fillFormField('down_payment', '88888888')
      
      cy.percySnapshotSecure('Mortgage - Security Validation')
    })
  })
})