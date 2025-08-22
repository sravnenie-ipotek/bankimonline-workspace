/**
 * 🎨 CREDIT CALCULATOR - VISUAL REGRESSION TESTS
 * 
 * Comprehensive visual testing for the credit calculation flow
 * - Multi-language support (Hebrew RTL, English, Russian)  
 * - Credit-specific form validation
 * - Banking security compliance
 * - Credit scoring visualization
 */

describe('Credit Calculator - Visual Regression', () => {
  
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.localStorage.setItem('language', 'he')
    })
  })

  context('Step 1: Credit Parameters', () => {
    
    it('Initial credit form', () => {
      cy.visit('/services/calculate-credit/1')
      cy.wait(3000)
      
      cy.percySnapshot('Credit Step 1 - Initial State', {
        waitForSelector: '[data-test="credit-form"], .credit-calculation, .loan-form'
      })
    })

    it('Credit purpose selection', () => {
      cy.visit('/services/calculate-credit/1')
      cy.wait(2000)
      
      // Fill credit amount
      cy.fillFormField('credit_amount', '150000')
      cy.fillFormField('loan_period', '60')
      
      // Select credit purpose if available
      cy.get('body').then($body => {
        const purposeDropdown = $body.find('[class*="purpose"], [name*="purpose"]')
        if (purposeDropdown.length > 0) {
          cy.get(purposeDropdown.first()).click()
          cy.wait(500)
          cy.get('[class*="option"]').contains('שיפוץ').click()
        }
      })
      
      cy.wait(1000)
      cy.percySnapshot('Credit Step 1 - Purpose Selected')
    })

    it('Credit amount slider interaction', () => {
      cy.visit('/services/calculate-credit/1')
      cy.wait(2000)
      
      // Interact with amount slider if present
      cy.get('body').then($body => {
        const slider = $body.find('[class*="slider"], input[type="range"]')
        if (slider.length > 0) {
          // Move slider to different positions
          cy.get(slider.first()).invoke('val', 200000).trigger('input')
          cy.wait(500)
          
          cy.percySnapshot('Credit Step 1 - Slider Interaction')
        }
      })
    })

    it('Multi-language credit form', () => {
      cy.visit('/services/calculate-credit/1')
      cy.wait(2000)
      
      cy.percySnapshotMultiLang('Credit Step 1 - Multi-language')
    })
  })

  context('Step 2: Personal Information', () => {
    
    beforeEach(() => {
      cy.visit('/services/calculate-credit/1')
      cy.wait(2000)
      
      // Fill step 1 data
      cy.fillFormField('credit_amount', '150000')
      cy.fillFormField('loan_period', '60')
      cy.get('button').contains('המשך').click()
      cy.url().should('include', '/2')
      cy.wait(2000)
    })

    it('Personal details form', () => {
      cy.percySnapshot('Credit Step 2 - Initial State')
    })

    it('Identity verification fields', () => {
      // Fill identity fields
      cy.fillFormField('first_name', 'דוד')
      cy.fillFormField('last_name', 'לוי')
      cy.fillFormField('id_number', '123456789')
      cy.fillFormField('birth_date', '1980-03-20')
      
      cy.wait(1000)
      cy.percySnapshot('Credit Step 2 - Identity Filled')
    })

    it('Contact information', () => {
      // Fill contact details
      cy.fillFormField('email', 'david.levi@example.com')
      cy.fillFormField('phone', '0521234567')
      cy.fillFormField('address', 'רחוב הרצל 123, תל אביב')
      
      cy.wait(1000)
      cy.percySnapshot('Credit Step 2 - Contact Info')
    })

    it('Marital status selection', () => {
      cy.get('body').then($body => {
        const maritalDropdown = $body.find('[class*="marital"], [name*="marital"]')
        if (maritalDropdown.length > 0) {
          cy.get(maritalDropdown.first()).click()
          cy.wait(500)
          cy.get('[class*="option"]').contains('נשוי').click()
          
          cy.wait(1000)
          cy.percySnapshot('Credit Step 2 - Marital Status')
        }
      })
    })
  })

  context('Step 3: Income & Employment', () => {
    
    beforeEach(() => {
      // Navigate to step 3
      cy.visit('/services/calculate-credit/1')
      cy.wait(2000)
      
      cy.fillFormField('credit_amount', '150000')
      cy.get('button').contains('המשך').click()
      cy.wait(1000)
      
      cy.fillFormField('first_name', 'דוד')
      cy.fillFormField('last_name', 'לוי')
      cy.get('button').contains('המשך').click()
      cy.url().should('include', '/3')
      cy.wait(2000)
    })

    it('Employment information form', () => {
      cy.percySnapshot('Credit Step 3 - Initial State')
    })

    it('Income source selection', () => {
      // Test main income source dropdown
      cy.get('body').then($body => {
        const incomeDropdown = $body.find('[class*="income"], [name*="income"], [class*="source"]')
        if (incomeDropdown.length > 0) {
          cy.get(incomeDropdown.first()).click()
          cy.wait(500)
          
          // Take snapshot of dropdown options
          cy.percySnapshot('Credit Step 3 - Income Source Options')
          
          // Select employment option
          cy.get('[class*="option"]').contains('שכיר').click()
          cy.wait(1000)
          
          cy.percySnapshot('Credit Step 3 - Income Source Selected')
        }
      })
    })

    it('Monthly income and expenses', () => {
      // Fill income details
      cy.fillFormField('monthly_income', '15000')
      cy.fillFormField('monthly_expenses', '8000')
      cy.fillFormField('existing_loans', '2000')
      
      cy.wait(1000)
      cy.percySnapshot('Credit Step 3 - Income Details')
    })

    it('Employment duration and type', () => {
      // Fill employment duration
      cy.fillFormField('employment_years', '3')
      cy.fillFormField('employment_months', '6')
      
      // Employment type dropdown
      cy.get('body').then($body => {
        const empTypeDropdown = $body.find('[class*="employment-type"], [name*="employment_type"]')
        if (empTypeDropdown.length > 0) {
          cy.get(empTypeDropdown.first()).click()
          cy.wait(500)
          cy.get('[class*="option"]').contains('מלא').click()
        }
      })
      
      cy.wait(1000)
      cy.percySnapshot('Credit Step 3 - Employment Details')
    })

    it('Additional income sources modal', () => {
      // Try to open additional income modal
      cy.get('body').then($body => {
        const addIncomeBtn = $body.find('[class*="add-income"], [data-test*="add"], button[class*="additional"]')
        if (addIncomeBtn.length > 0) {
          cy.get(addIncomeBtn.first()).click()
          cy.wait(1000)
          
          cy.percySnapshot('Credit Step 3 - Additional Income Modal')
        }
      })
    })
  })

  context('Step 4: Credit Offers & Approval', () => {
    
    beforeEach(() => {
      // Complete journey to step 4
      cy.visit('/services/calculate-credit/1')
      cy.wait(2000)
      
      // Quick form completion
      cy.fillAllFormFields()
      
      // Navigate through steps
      for (let i = 0; i < 3; i++) {
        cy.get('button').contains('המשך').click()
        cy.wait(1000)
      }
      
      cy.url().should('include', '/4')
      cy.wait(3000)
    })

    it('Credit offers display', () => {
      cy.percySnapshot('Credit Step 4 - Offers Display', {
        waitForSelector: '[class*="offer"], [class*="credit-result"], [class*="approval"]',
        waitForTimeout: 5000
      })
    })

    it('Credit approval status', () => {
      // Look for approval indicators
      cy.get('body').then($body => {
        if ($body.find('[class*="approved"], [class*="status"]').length > 0) {
          cy.percySnapshot('Credit Step 4 - Approval Status')
        }
      })
    })

    it('Interest rate comparison', () => {
      // Check for rate comparison table
      cy.get('body').then($body => {
        if ($body.find('table, [class*="comparison"], [class*="rates"]').length > 0) {
          cy.percySnapshot('Credit Step 4 - Rate Comparison')
        }
      })
    })

    it('Monthly payment breakdown', () => {
      // Look for payment breakdown
      cy.get('body').then($body => {
        if ($body.find('[class*="breakdown"], [class*="payment-plan"]').length > 0) {
          cy.percySnapshot('Credit Step 4 - Payment Breakdown')
        }
      })
    })
  })

  context('Credit Score & Risk Assessment', () => {
    
    it('Credit score visualization', () => {
      cy.visit('/services/calculate-credit/4')
      cy.wait(3000)
      
      // Look for credit score display
      cy.get('body').then($body => {
        if ($body.find('[class*="score"], [class*="rating"], [class*="gauge"]').length > 0) {
          cy.percySnapshot('Credit - Score Visualization')
        }
      })
    })

    it('Risk assessment indicators', () => {
      cy.visit('/services/calculate-credit/4')
      cy.wait(3000)
      
      // Check for risk indicators
      cy.get('body').then($body => {
        if ($body.find('[class*="risk"], [class*="assessment"], [class*="indicator"]').length > 0) {
          cy.percySnapshot('Credit - Risk Assessment')
        }
      })
    })
  })

  context('Form Validation & Error States', () => {
    
    it('Required field validation', () => {
      cy.visit('/services/calculate-credit/1')
      cy.wait(2000)
      
      // Try to submit empty form
      cy.get('button').contains('המשך').click()
      cy.wait(1000)
      
      cy.percySnapshot('Credit - Required Field Errors')
    })

    it('Credit amount limits validation', () => {
      cy.visit('/services/calculate-credit/1')
      cy.wait(2000)
      
      // Test with extreme values
      cy.fillFormField('credit_amount', '999999999')
      cy.fillFormField('loan_period', '999')
      
      cy.get('button').contains('המשך').click()
      cy.wait(1000)
      
      cy.percySnapshot('Credit - Amount Limit Validation')
    })

    it('Income validation errors', () => {
      cy.visit('/services/calculate-credit/3')
      cy.wait(2000)
      
      // Enter unrealistic income values
      cy.fillFormField('monthly_income', '0')
      cy.fillFormField('monthly_expenses', '999999')
      
      cy.get('button').contains('המשך').click()
      cy.wait(1000)
      
      cy.percySnapshot('Credit - Income Validation Errors')
    })
  })

  context('Responsive Design Validation', () => {
    
    it('Mobile credit calculator', () => {
      cy.visit('/services/calculate-credit/1')
      cy.wait(2000)
      
      cy.percySnapshotResponsive('Credit Calculator - Mobile Responsive')
    })

    it('Tablet credit form layout', () => {
      cy.visit('/services/calculate-credit/2')
      cy.wait(2000)
      
      cy.viewport(768, 1024)
      cy.percySnapshot('Credit Form - Tablet Layout')
    })

    it('Desktop credit results', () => {
      cy.visit('/services/calculate-credit/4')
      cy.wait(3000)
      
      cy.viewport(1920, 1080)
      cy.percySnapshot('Credit Results - Desktop Layout')
    })
  })

  context('Security & Data Protection', () => {
    
    it('Sensitive data masking', () => {
      cy.visit('/services/calculate-credit/2')
      cy.wait(2000)
      
      // Fill with sensitive information
      cy.fillFormField('id_number', '123456789')
      cy.fillFormField('phone', '0521234567')
      cy.fillFormField('monthly_income', '25000')
      
      // Take secure snapshot
      cy.percySnapshotSecure('Credit - Sensitive Data Masked')
    })

    it('Financial data protection', () => {
      cy.visit('/services/calculate-credit/3')
      cy.wait(2000)
      
      // Fill financial details
      cy.fillFormField('monthly_income', '18000')
      cy.fillFormField('existing_loans', '5000')
      cy.fillFormField('monthly_expenses', '12000')
      
      cy.percySnapshotSecure('Credit - Financial Data Protected')
    })
  })

  context('Complete Credit Journey', () => {
    
    it('End-to-end credit application', () => {
      // Document complete user journey
      const steps = [
        { step: 1, name: 'Parameters' },
        { step: 2, name: 'Personal Info' },
        { step: 3, name: 'Income' },
        { step: 4, name: 'Results' }
      ]
      
      steps.forEach(({ step, name }) => {
        cy.visit(`/services/calculate-credit/${step}`)
        cy.wait(2000)
        
        if (step < 4) {
          cy.fillAllFormFields()
        }
        
        cy.percySnapshot(`Credit Journey - ${name}`)
      })
    })
  })
})