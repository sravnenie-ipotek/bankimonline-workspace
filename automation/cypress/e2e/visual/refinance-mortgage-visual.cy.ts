/**
 * 🎨 REFINANCE MORTGAGE - VISUAL REGRESSION TESTS
 * 
 * Comprehensive visual testing for the mortgage refinancing flow
 * - Multi-language support (Hebrew RTL, English, Russian)  
 * - Mortgage-specific refinancing calculations
 * - Interest rate comparison visualization
 * - Banking security compliance
 * 
 * NOTE: This flow has partial functionality (57.1% pass rate)
 * Missing core break-even analysis features
 */

describe('Refinance Mortgage - Visual Regression', () => {
  
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.localStorage.setItem('language', 'he')
    })
  })

  context('Step 1: Refinancing Goals & Current Mortgage', () => {
    
    it('Initial refinancing form', () => {
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(3000)
      
      cy.percySnapshot('Refinance Mortgage Step 1 - Initial State', {
        waitForSelector: '.refinance-mortgage-form, .mortgage-refinance-form'
      })
    })

    it('Refinancing purpose selection', () => {
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      // Test refinancing purpose dropdown
      cy.get('body').then($body => {
        const purposeDropdown = $body.find('[class*="purpose"], [name*="purpose"], [class*="refinancing"]')
        if (purposeDropdown.length > 0) {
          cy.get(purposeDropdown.first()).click()
          cy.wait(500)
          
          cy.percySnapshot('Refinance Mortgage Step 1 - Purpose Options')
          
          // Select an option
          cy.get('[class*="option"]').contains('שיפור ריבית').click()
          cy.wait(1000)
          
          cy.percySnapshot('Refinance Mortgage Step 1 - Purpose Selected')
        }
      })
    })

    it('Current mortgage details', () => {
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      // Fill current mortgage information
      cy.fillFormField('current_loan_amount', '800000')
      cy.fillFormField('current_monthly_payment', '3500')
      cy.fillFormField('current_interest_rate', '4.2')
      cy.fillFormField('remaining_months', '180')
      
      cy.wait(1000)
      cy.percySnapshot('Refinance Mortgage Step 1 - Current Mortgage Filled')
    })

    it('Property value update', () => {
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      // Fill property value (may have appreciated)
      cy.fillFormField('current_property_value', '1400000')
      cy.fillFormField('original_property_value', '1200000')
      
      cy.wait(1000)
      cy.percySnapshot('Refinance Mortgage Step 1 - Property Value Updated')
    })

    it('Multi-language refinancing form', () => {
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      cy.percySnapshotMultiLang('Refinance Mortgage Step 1 - Multi-language')
    })
  })

  context('Step 2: Personal & Financial Update', () => {
    
    beforeEach(() => {
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      // Fill step 1 data
      cy.fillFormField('current_loan_amount', '800000')
      cy.fillFormField('current_monthly_payment', '3500')
      cy.get('button').contains('המשך').click()
      cy.url().should('include', '/2')
      cy.wait(2000)
    })

    it('Updated personal information', () => {
      cy.percySnapshot('Refinance Mortgage Step 2 - Initial State')
    })

    it('Income changes since original mortgage', () => {
      // Fill updated income information
      cy.fillFormField('current_monthly_income', '22000')
      cy.fillFormField('original_monthly_income', '18000')
      cy.fillFormField('additional_income', '4000')
      
      cy.wait(1000)
      cy.percySnapshot('Refinance Mortgage Step 2 - Income Updated')
    })

    it('Employment status update', () => {
      // Update employment information
      cy.get('body').then($body => {
        const employmentDropdown = $body.find('[class*="employment"], [name*="employment"]')
        if (employmentDropdown.length > 0) {
          cy.get(employmentDropdown.first()).click()
          cy.wait(500)
          cy.get('[class*="option"]').contains('שכיר בכיר').click()
        }
      })
      
      cy.fillFormField('employment_years', '8')
      cy.fillFormField('employer_name', 'חברת הייטק גדולה')
      
      cy.wait(1000)
      cy.percySnapshot('Refinance Mortgage Step 2 - Employment Updated')
    })

    it('Additional assets and liabilities', () => {
      // Fill additional financial information
      cy.fillFormField('additional_assets', '150000')
      cy.fillFormField('current_debts', '25000')
      cy.fillFormField('monthly_expenses', '12000')
      
      cy.wait(1000)
      cy.percySnapshot('Refinance Mortgage Step 2 - Financial Status')
    })
  })

  context('Step 3: New Mortgage Preferences', () => {
    
    beforeEach(() => {
      // Navigate to step 3
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      cy.fillFormField('current_loan_amount', '800000')
      cy.get('button').contains('המשך').click()
      cy.wait(1000)
      
      cy.fillFormField('current_monthly_income', '22000')
      cy.get('button').contains('המשך').click()
      cy.url().should('include', '/3')
      cy.wait(2000)
    })

    it('New mortgage parameters', () => {
      cy.percySnapshot('Refinance Mortgage Step 3 - Initial State')
    })

    it('Desired loan amount adjustment', () => {
      // Test loan amount adjustment options
      cy.get('body').then($body => {
        const adjustmentOptions = $body.find('[name*="adjustment"], [class*="adjustment"]')
        if (adjustmentOptions.length > 0) {
          cy.percySnapshot('Refinance Mortgage Step 3 - Adjustment Options')
        }
      })
      
      // Fill new loan parameters
      cy.fillFormField('new_loan_amount', '750000')
      cy.fillFormField('desired_monthly_payment', '3000')
      cy.fillFormField('new_loan_period', '25')
      
      cy.wait(1000)
      cy.percySnapshot('Refinance Mortgage Step 3 - New Parameters')
    })

    it('Interest rate type selection', () => {
      // Test interest rate type options
      cy.get('body').then($body => {
        const rateTypeDropdown = $body.find('[class*="rate-type"], [name*="rate_type"]')
        if (rateTypeDropdown.length > 0) {
          cy.get(rateTypeDropdown.first()).click()
          cy.wait(500)
          
          cy.percySnapshot('Refinance Mortgage Step 3 - Rate Type Options')
          
          cy.get('[class*="option"]').contains('קבועה').click()
          cy.wait(1000)
          
          cy.percySnapshot('Refinance Mortgage Step 3 - Rate Type Selected')
        }
      })
    })

    it('Track restructuring options', () => {
      // Test track/restructuring options
      cy.get('body').then($body => {
        const trackOptions = $body.find('[class*="track"], [name*="track"], [class*="restructure"]')
        if (trackOptions.length > 0) {
          cy.percySnapshot('Refinance Mortgage Step 3 - Track Options')
        }
      })
    })
  })

  context('Step 4: Refinancing Analysis & Offers', () => {
    
    beforeEach(() => {
      // Complete journey to step 4
      cy.visit('/services/refinance-mortgage/1')
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

    it('Refinancing offers display', () => {
      cy.percySnapshot('Refinance Mortgage Step 4 - Offers Display', {
        waitForSelector: '[class*="offer"], [class*="refinance-result"], [class*="analysis"]',
        waitForTimeout: 5000
      })
    })

    it('Interest rate comparison - MISSING FEATURE', () => {
      // Look for rate comparison that should exist
      cy.get('body').then($body => {
        if ($body.find('[class*="rate-comparison"], [class*="interest-comparison"]').length > 0) {
          cy.percySnapshot('Refinance Mortgage Step 4 - Rate Comparison Found')
        } else {
          cy.percySnapshot('Refinance Mortgage Step 4 - Rate Comparison Missing')
        }
      })
    })

    it('Break-even analysis - MISSING FEATURE', () => {
      // Check for break-even analysis that should exist
      cy.get('body').then($body => {
        if ($body.find('[class*="break-even"], [class*="breakeven"]').length > 0) {
          cy.percySnapshot('Refinance Mortgage Step 4 - Break-even Found')
        } else {
          cy.percySnapshot('Refinance Mortgage Step 4 - Break-even Missing')
        }
      })
    })

    it('Monthly savings calculation - MISSING FEATURE', () => {
      // Look for savings calculation
      cy.get('body').then($body => {
        if ($body.find('[class*="savings"], [class*="monthly-difference"]').length > 0) {
          cy.percySnapshot('Refinance Mortgage Step 4 - Savings Found')
        } else {
          cy.percySnapshot('Refinance Mortgage Step 4 - Savings Missing')
        }
      })
    })

    it('Total cost comparison - MISSING FEATURE', () => {
      // Check for total cost analysis
      cy.get('body').then($body => {
        if ($body.find('[class*="total-cost"], [class*="cost-comparison"]').length > 0) {
          cy.percySnapshot('Refinance Mortgage Step 4 - Cost Comparison Found')
        } else {
          cy.percySnapshot('Refinance Mortgage Step 4 - Cost Comparison Missing')
        }
      })
    })
  })

  context('Missing Features Documentation', () => {
    
    it('Expected vs actual functionality', () => {
      cy.visit('/services/refinance-mortgage/4')
      cy.wait(3000)
      
      // Document what's missing vs what should be there
      cy.percySnapshot('Refinance Mortgage - Missing Features Overview', {
        percyCSS: `
          /* Highlight where missing features should be */
          .main-content::after {
            content: "⚠️ MISSING: Break-even analysis, Rate comparison, Savings calculator" !important;
            position: fixed !important;
            bottom: 20px !important;
            left: 20px !important;
            right: 20px !important;
            background: #ff9800 !important;
            color: white !important;
            padding: 15px !important;
            border-radius: 5px !important;
            z-index: 1000 !important;
            font-weight: bold !important;
            text-align: center !important;
          }
        `
      })
    })

    it('Partial functionality baseline', () => {
      // Document current 57.1% functional state
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      cy.percySnapshot('Refinance Mortgage - Partial Functionality Baseline', {
        percyCSS: `
          /* Mark working vs broken elements */
          input:enabled, select:enabled, button:enabled {
            outline: 2px solid #4CAF50 !important; /* Working */
          }
          
          .disabled, [disabled], .not-implemented {
            outline: 2px solid #f44336 !important; /* Broken */
          }
          
          /* Add functionality indicator */
          body::before {
            content: "🔶 PARTIAL FUNCTIONALITY: 57.1% Working - Missing core features" !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: #ff9800 !important;
            color: white !important;
            padding: 10px !important;
            z-index: 10000 !important;
            text-align: center !important;
            font-weight: bold !important;
          }
        `
      })
    })
  })

  context('Form Validation & Working Features', () => {
    
    it('Working form validation', () => {
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      // Test form validation that should work
      cy.get('button').contains('המשך').click()
      cy.wait(1000)
      
      cy.percySnapshot('Refinance Mortgage - Working Validation')
    })

    it('Successful form progression', () => {
      // Test the parts that do work
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      cy.fillFormField('current_loan_amount', '800000')
      cy.fillFormField('current_monthly_payment', '3500')
      
      cy.get('button').contains('המשך').click()
      cy.wait(1000)
      
      // Document successful progression
      cy.percySnapshot('Refinance Mortgage - Successful Progression')
    })
  })

  context('Responsive Design Validation', () => {
    
    it('Mobile refinancing interface', () => {
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      cy.percySnapshotResponsive('Refinance Mortgage - Mobile Responsive')
    })

    it('Tablet mortgage refinancing', () => {
      cy.visit('/services/refinance-mortgage/2')
      cy.wait(2000)
      
      cy.viewport(768, 1024)
      cy.percySnapshot('Refinance Mortgage - Tablet Layout')
    })

    it('Desktop analysis view', () => {
      cy.visit('/services/refinance-mortgage/4')
      cy.wait(3000)
      
      cy.viewport(1920, 1080)
      cy.percySnapshot('Refinance Mortgage - Desktop Analysis')
    })
  })

  context('Security & Data Protection', () => {
    
    it('Mortgage data masking', () => {
      cy.visit('/services/refinance-mortgage/1')
      cy.wait(2000)
      
      // Fill sensitive mortgage data
      cy.fillFormField('current_loan_amount', '850000')
      cy.fillFormField('current_monthly_payment', '3800')
      cy.fillFormField('current_property_value', '1500000')
      
      cy.percySnapshotSecure('Refinance Mortgage - Sensitive Data Masked')
    })

    it('Financial information protection', () => {
      cy.visit('/services/refinance-mortgage/2')
      cy.wait(2000)
      
      // Fill financial details
      cy.fillFormField('current_monthly_income', '25000')
      cy.fillFormField('additional_assets', '200000')
      cy.fillFormField('current_debts', '50000')
      
      cy.percySnapshotSecure('Refinance Mortgage - Financial Data Protected')
    })
  })

  context('Complete Journey Documentation', () => {
    
    it('End-to-end refinancing journey', () => {
      // Document complete user journey (working parts)
      const steps = [
        { step: 1, name: 'Current Mortgage' },
        { step: 2, name: 'Financial Update' },
        { step: 3, name: 'New Preferences' },
        { step: 4, name: 'Analysis (Partial)' }
      ]
      
      steps.forEach(({ step, name }) => {
        cy.visit(`/services/refinance-mortgage/${step}`)
        cy.wait(2000)
        
        if (step < 4) {
          cy.fillAllFormFields()
        }
        
        cy.percySnapshot(`Refinance Mortgage Journey - ${name}`)
      })
    })

    it('Working vs broken features comparison', () => {
      // Create a comprehensive comparison
      cy.visit('/services/refinance-mortgage/4')
      cy.wait(3000)
      
      cy.percySnapshot('Refinance Mortgage - Feature Status Overview', {
        percyCSS: `
          /* Create visual indicators for feature status */
          body::after {
            content: "✅ Working: Form progression, Data entry, Basic validation\\A❌ Missing: Break-even analysis, Rate comparison, Savings calculation\\A🔶 Partial: User flow, Basic layout" !important;
            white-space: pre !important;
            position: fixed !important;
            bottom: 20px !important;
            left: 20px !important;
            background: rgba(0,0,0,0.8) !important;
            color: white !important;
            padding: 20px !important;
            border-radius: 10px !important;
            z-index: 10000 !important;
            font-family: monospace !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
          }
        `
      })
    })
  })
})