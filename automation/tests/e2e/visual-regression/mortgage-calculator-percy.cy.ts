/**
 * 🏦 MORTGAGE CALCULATOR - PERCY VISUAL REGRESSION TESTS
 * 
 * Comprehensive visual regression testing for the mortgage calculation workflow
 * Features:
 * - Multi-language support (Hebrew RTL, English, Russian)
 * - Mobile responsiveness with button overflow detection
 * - Banking security compliance with data masking
 * - Complete user journey documentation
 * - Integration with Jira for regression tracking
 */

/// <reference types="cypress" />

describe('🏦 Mortgage Calculator - Percy Visual Regression', () => {
  
  beforeEach(() => {
    // Clear all storage and set Hebrew as default
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.setupPercyLanguage('he')
    
    // Set up banking test context
    cy.window().then((win) => {
      win.localStorage.setItem('percy-test-mode', 'true')
      win.localStorage.setItem('banking-test-context', JSON.stringify({
        feature: 'mortgage',
        testRun: new Date().toISOString(),
        environment: 'visual-regression'
      }))
    })
  })

  context('📍 Step 1: Calculation Parameters', () => {
    
    it('🎯 Initial State - Clean Form Layout', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Take comprehensive baseline snapshots
      cy.percySnapshotBanking('Mortgage Step 1 - Initial State', {
        maskSensitiveData: true,
        highlightInteractiveElements: false
      })
      
      // Test responsive design
      cy.percySnapshotResponsive('Mortgage Step 1 - Initial Responsive')
      
      // Test mobile with button overflow detection
      cy.percySnapshotMobile('Mortgage Step 1 - Initial Mobile')
    })

    it('🌐 Multi-language UI Comparison', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Test all languages with proper RTL support
      cy.percySnapshotMultiLang('Mortgage Step 1 - Multi-language', {
        highlightInteractiveElements: true
      })
    })

    it('📝 Form Filled State with Validation', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Fill form with realistic Israeli banking data
      cy.fillFormField('property_value', '1200000') // 1.2M ILS
      cy.fillFormField('down_payment', '240000')    // 20% down payment
      cy.fillFormField('loan_period', '25')         // 25 years
      
      // Handle property ownership dropdown (critical business logic)
      cy.get('body').then($body => {
        const dropdown = $body.find('[class*="dropdown"], select, [role="combobox"]')
        if (dropdown.length > 0) {
          cy.get(dropdown.first()).click()
          cy.wait(500)
          
          // Select "אין לי נכס" (No property) - 75% LTV
          cy.get('[class*="option"], option, [role="option"]')
            .contains(/אין לי נכס|No property/i)
            .click()
        }
      })
      
      cy.wait(1000)
      
      // Visual snapshot with filled form
      cy.percyBankingFlow({
        testName: 'Form Filled State',
        currentStep: 1,
        bankingFeature: 'mortgage',
        userFlow: 'calculation-parameters'
      }, {
        percyCSS: `
          /* Highlight filled fields for visual documentation */
          input[value]:not([value=""]) {
            border: 2px solid #4CAF50 !important;
            background-color: rgba(76, 175, 80, 0.1) !important;
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.3) !important;
          }
          
          /* Highlight selected dropdown */
          select:not([value=""]), [aria-selected="true"] {
            border: 2px solid #2196F3 !important;
            background-color: rgba(33, 150, 243, 0.1) !important;
          }
        `
      })
    })

    it('⚠️ Validation Error States', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Try to submit empty form to trigger validation
      cy.get('button').contains(/המשך|Continue|Продолжить/).click()
      cy.wait(1500)
      
      // Capture validation error state
      cy.percySnapshotBanking('Mortgage Step 1 - Validation Errors', {
        maskSensitiveData: true,
        percyCSS: `
          /* Highlight validation errors */
          .error, [class*="error"], .invalid, [class*="invalid"] {
            border: 3px solid #f44336 !important;
            background-color: rgba(244, 67, 54, 0.1) !important;
            box-shadow: 0 0 10px rgba(244, 67, 54, 0.3) !important;
          }
          
          /* Error messages */
          [class*="error-message"], [role="alert"] {
            background-color: #ffebee !important;
            border-left: 4px solid #f44336 !important;
            padding: 8px !important;
          }
        `
      })
      
      // Test validation errors across all languages
      cy.percySnapshotMultiLang('Mortgage Step 1 - Validation Errors')
    })

    it('💰 Property Ownership Business Logic Visual Test', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Test each property ownership option with different LTV rules
      const ownershipOptions = [
        { text: 'אין לי נכס', ltv: '75%', description: 'No Property - 75% LTV' },
        { text: 'יש לי נכס', ltv: '50%', description: 'Has Property - 50% LTV' },
        { text: 'מוכר נכס', ltv: '70%', description: 'Selling Property - 70% LTV' }
      ]
      
      ownershipOptions.forEach((option, index) => {
        if (index > 0) {
          cy.reload()
          cy.waitForBankingPageLoad()
        }
        
        // Fill basic fields
        cy.fillFormField('property_value', '1200000')
        
        // Select property ownership option
        cy.get('body').then($body => {
          const dropdown = $body.find('[class*="dropdown"], select')
          if (dropdown.length > 0) {
            cy.get(dropdown.first()).click()
            cy.wait(500)
            cy.get('[class*="option"], option').contains(option.text).click()
            cy.wait(1000)
          }
        })
        
        // Visual snapshot for each business logic scenario
        cy.percyBankingFlow({
          testName: `Property Ownership - ${option.description}`,
          currentStep: 1,
          bankingFeature: 'mortgage',
          userFlow: 'property-ownership-logic'
        })
      })
    })
  })

  context('📍 Step 2: Personal Information', () => {
    
    beforeEach(() => {
      // Navigate to step 2 with valid step 1 data
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Fill step 1 required fields
      cy.fillFormField('property_value', '1200000')
      cy.fillFormField('down_payment', '240000')
      cy.fillFormField('loan_period', '25')
      
      // Continue to step 2
      cy.get('button').contains(/המשך|Continue/).click()
      cy.url().should('include', '/2')
      cy.waitForBankingPageLoad()
    })

    it('👤 Personal Information Form - Initial State', () => {
      cy.percyBankingFlow({
        testName: 'Personal Info Initial State',
        currentStep: 2,
        bankingFeature: 'mortgage',
        userFlow: 'personal-information'
      })
      
      // Mobile-specific test with Hebrew RTL
      cy.percySnapshotRTL('Mortgage Step 2 - Personal Info Hebrew')
    })

    it('📱 Mobile Form Layout with RTL Support', () => {
      // Test mobile viewport with Hebrew RTL
      cy.viewport(375, 812)
      cy.wait(1000)
      
      cy.percySnapshotBanking('Mortgage Step 2 - Mobile RTL', {
        testButtonOverflow: true,
        rtlTest: true,
        percyCSS: `
          /* Mobile RTL enhancements */
          .mobile-form-indicator::before {
            content: "📱 MOBILE RTL - עברית";
            position: fixed;
            top: 0;
            right: 0;
            background: rgba(255, 165, 0, 0.9);
            color: black;
            padding: 4px 8px;
            font-size: 12px;
            z-index: 10000;
          }
        `
      })
    })

    it('✍️ Form Filled with Hebrew Names', () => {
      // Fill personal information with Hebrew names
      cy.fillFormField('first_name', 'יוסי')
      cy.fillFormField('last_name', 'כהן')
      cy.fillFormField('email', 'yossi.cohen@example.com')
      cy.fillFormField('phone', '0501234567')
      
      // Handle date picker if present
      cy.get('body').then($body => {
        const dateInput = $body.find('input[type="date"], [class*="date"]')
        if (dateInput.length > 0) {
          cy.get(dateInput.first()).type('1985-05-15')
        }
      })
      
      cy.wait(1000)
      
      cy.percyBankingFlow({
        testName: 'Personal Info Filled Hebrew',
        currentStep: 2,
        bankingFeature: 'mortgage',
        userFlow: 'personal-information'
      }, {
        percyCSS: `
          /* Hebrew text highlighting */
          input[value*="י"], input[value*="ו"], input[value*="ש"] {
            border: 2px solid #FF9800 !important;
            background: rgba(255, 152, 0, 0.1) !important;
          }
        `
      })
    })

    it('🔒 Security Compliance - Data Masking', () => {
      // Fill with sensitive data
      cy.fillFormField('id_number', '123456789')
      cy.fillFormField('phone', '0501234567')
      cy.fillFormField('email', 'sensitive@example.com')
      
      // Test secure visual snapshot
      cy.percySnapshotSecure('Mortgage Step 2 - Personal Info', {
        maskSensitiveData: true
      })
    })
  })

  context('📍 Step 3: Income & Employment', () => {
    
    beforeEach(() => {
      // Navigate through steps 1-2 to reach step 3
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Complete step 1
      cy.fillFormField('property_value', '1200000')
      cy.fillFormField('down_payment', '240000')
      cy.get('button').contains(/המשך|Continue/).click()
      cy.wait(1000)
      
      // Complete step 2
      cy.fillFormField('first_name', 'יוסי')
      cy.fillFormField('last_name', 'כהן')
      cy.get('button').contains(/המשך|Continue/).click()
      cy.url().should('include', '/3')
      cy.waitForBankingPageLoad()
    })

    it('💼 Employment Information Form', () => {
      cy.percyBankingFlow({
        testName: 'Income Employment Initial',
        currentStep: 3,
        bankingFeature: 'mortgage',
        userFlow: 'income-employment'
      })
    })

    it('💰 Income Data Filled State', () => {
      // Fill employment information
      cy.fillFormField('monthly_income', '18000')   // 18K ILS
      cy.fillFormField('years_employed', '5')       // 5 years experience
      
      // Handle employment type dropdown
      cy.get('body').then($body => {
        const employmentDropdown = $body.find('[class*="employment"], [name*="employment"], select')
        if (employmentDropdown.length > 0) {
          cy.get(employmentDropdown.first()).click()
          cy.wait(500)
          cy.get('[class*="option"], option').contains(/שכיר|Employee/).click()
        }
      })
      
      cy.wait(1000)
      
      cy.percyBankingFlow({
        testName: 'Income Employment Filled',
        currentStep: 3,
        bankingFeature: 'mortgage',
        userFlow: 'income-employment'
      }, {
        percyCSS: `
          /* Income field highlighting */
          input[name*="income"], input[name*="salary"] {
            border: 2px solid #4CAF50 !important;
            background: rgba(76, 175, 80, 0.1) !important;
          }
        `
      })
    })

    it('📊 Income Sources Modal Testing', () => {
      // Try to open income sources modal
      cy.get('body').then($body => {
        const modalTrigger = $body.find('button[class*="modal"], [data-test*="modal"], button[class*="source"]')
        if (modalTrigger.length > 0) {
          cy.get(modalTrigger.first()).click()
          cy.wait(1500)
          
          // Snapshot of modal with overlay
          cy.percySnapshotBanking('Mortgage Step 3 - Income Sources Modal', {
            percyCSS: `
              /* Modal enhancement */
              [class*="modal"], [class*="overlay"], .modal, .overlay {
                z-index: 9999 !important;
                background: rgba(0,0,0,0.8) !important;
              }
              
              [class*="modal-content"] {
                border: 2px solid #2196F3 !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
              }
            `
          })
        }
      })
    })
  })

  context('📍 Step 4: Bank Offers & Results', () => {
    
    beforeEach(() => {
      // Complete entire journey to step 4
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Use quick progression through all steps
      cy.fillAllFormFields()
      
      // Navigate through steps
      cy.get('button').contains(/המשך|Continue/).click()
      cy.wait(1000)
      cy.get('button').contains(/המשך|Continue/).click()
      cy.wait(1000)
      cy.get('button').contains(/המשך|Continue/).click()
      
      // Wait for step 4 to load
      cy.url().should('include', '/4')
      cy.waitForBankingPageLoad()
    })

    it('🏦 Bank Offers Display', () => {
      cy.percyBankingFlow({
        testName: 'Bank Offers Results',
        currentStep: 4,
        bankingFeature: 'mortgage',
        userFlow: 'bank-offers-results'
      }, {
        waitForSelector: '[class*="offer"], [class*="result"], [class*="bank"], table',
        percyCSS: `
          /* Bank offers highlighting */
          [class*="bank-offer"], [class*="offer"], .offer {
            border: 2px solid #2196F3 !important;
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2) !important;
          }
          
          /* Interest rate highlighting */
          [class*="rate"], [class*="interest"] {
            background: rgba(255, 193, 7, 0.2) !important;
            font-weight: bold !important;
          }
        `
      })
    })

    it('📊 Loan Comparison Table', () => {
      // Wait for comparison table to load
      cy.get('body').then($body => {
        if ($body.find('table, [class*="comparison"], [class*="grid"]').length > 0) {
          cy.wait(2000)
          cy.percySnapshotBanking('Mortgage Step 4 - Comparison Table', {
            scope: 'table, [class*="comparison"], [class*="grid"]'
          })
        }
      })
    })

    it('📱 Mobile Bank Offers Responsive', () => {
      cy.percySnapshotResponsive('Mortgage Step 4 - Bank Offers Responsive')
      
      // Test mobile-specific layout
      cy.viewport(375, 812)
      cy.wait(1000)
      cy.percyTestButtonOverflow('Bank Offers Mobile')
    })
  })

  context('🔄 Complete User Journey Documentation', () => {
    
    it('📈 End-to-End Visual Journey', () => {
      // Document the complete user journey with screenshots
      for (let step = 1; step <= 4; step++) {
        cy.visit(`/services/calculate-mortgage/${step}`)
        cy.waitForBankingPageLoad()
        
        if (step < 4) {
          // Fill appropriate fields for progression
          if (step === 1) {
            cy.fillFormField('property_value', '1200000')
            cy.fillFormField('down_payment', '240000')
          } else if (step === 2) {
            cy.fillFormField('first_name', 'יוסי')
            cy.fillFormField('last_name', 'כהן')
          } else if (step === 3) {
            cy.fillFormField('monthly_income', '18000')
          }
          
          cy.wait(1000)
          cy.percyBankingFlow({
            testName: `Complete Journey Step ${step}`,
            currentStep: step,
            bankingFeature: 'mortgage',
            userFlow: 'complete-journey'
          })
        } else {
          cy.percyBankingFlow({
            testName: `Complete Journey Results`,
            currentStep: 4,
            bankingFeature: 'mortgage',
            userFlow: 'complete-journey'
          })
        }
      }
    })

    it('⚠️ Error State Documentation', () => {
      // Test error handling on each step
      for (let step = 1; step <= 3; step++) {
        cy.visit(`/services/calculate-mortgage/${step}`)
        cy.waitForBankingPageLoad()
        
        // Try to continue without filling required fields
        cy.get('button').contains(/המשך|Continue/).click()
        cy.wait(1500)
        
        cy.percyBankingFlow({
          testName: `Error State Step ${step}`,
          currentStep: step,
          bankingFeature: 'mortgage',
          userFlow: 'error-states'
        })
      }
    })
  })

  context('🔐 Banking Security & Compliance', () => {
    
    it('🛡️ Security Data Masking Comprehensive', () => {
      cy.visit('/services/calculate-mortgage/2')
      cy.waitForBankingPageLoad()
      
      // Fill with various types of sensitive data
      const sensitiveData = {
        id_number: '123456789',
        phone: '0501234567',
        email: 'sensitive@email.com',
        bank_account: '123456789',
        credit_card: '4580123456789012'
      }
      
      Object.entries(sensitiveData).forEach(([field, value]) => {
        cy.fillFormField(field, value)
      })
      
      // Test comprehensive security masking
      cy.percySnapshotSecure('Mortgage Security Compliance Test', {
        maskSensitiveData: true,
        percyCSS: `
          /* Enhanced security indicators */
          [data-percy-sensitive]::after {
            content: "🔒 MASKED";
            position: absolute;
            top: -15px;
            right: 0;
            font-size: 10px;
            background: #4CAF50;
            color: white;
            padding: 2px 4px;
            border-radius: 2px;
          }
        `
      })
    })

    it('✅ Banking Form Validation Security', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Test with edge case values that should be validated
      cy.fillFormField('property_value', '99999999')  // Extreme value
      cy.fillFormField('down_payment', '88888888')    // Invalid ratio
      
      cy.percySnapshotSecure('Mortgage Security Validation', {
        maskSensitiveData: true,
        percyCSS: `
          /* Security validation indicators */
          input[value="99999999"], input[value="88888888"] {
            border: 3px solid #FF5722 !important;
            background: rgba(255, 87, 34, 0.1) !important;
          }
          
          input[value="99999999"]::after {
            content: "⚠️ VALIDATION REQUIRED";
            position: absolute;
            background: #FF5722;
            color: white;
            font-size: 10px;
            padding: 2px;
          }
        `
      })
    })
  })

  // Test failure integration with Percy + Jira
  afterEach(function() {
    if (this.currentTest && this.currentTest.state === 'failed') {
      const testName = this.currentTest.title
      const spec = Cypress.spec.relative
      
      // Enhanced Percy failure reporting
      cy.task('createVisualRegressionJira', {
        testName: testName,
        snapshots: [`${testName} - Failure Screenshot`],
        percyBuildUrl: Cypress.env('PERCY_BUILD_URL'),
        visualDifferences: [{
          elementName: 'Unknown Element',
          changeType: 'layout' as const,
          severity: 'high' as const
        }],
        affectedLanguages: ['he', 'en'],
        affectedViewports: [375, 768, 1280],
        bankingImpact: 'ui-only' as const,
        screenshots: [],
        specFile: spec,
        branch: Cypress.env('BRANCH_NAME') || 'main',
        commit: Cypress.env('COMMIT_SHA') || 'unknown'
      }, { log: false }).then((result: any) => {
        if (result && result.issueKey) {
          cy.log(`🎨 Percy visual regression reported: ${result.issueKey}`)
        }
      })
    }
  })
})