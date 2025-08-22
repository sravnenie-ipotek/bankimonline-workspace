/**
 * 💳 CREDIT CALCULATOR - PERCY VISUAL REGRESSION TESTS
 * 
 * Comprehensive visual regression testing for the credit application workflow
 * Features:
 * - Personal loan and business credit flows
 * - Multi-language support with Hebrew RTL
 * - Mobile-first design testing
 * - Credit scoring visualization
 * - Banking compliance and data security
 */

/// <reference types="cypress" />

describe('💳 Credit Calculator - Percy Visual Regression', () => {
  
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.setupPercyLanguage('he')
    
    // Set up credit application test context
    cy.window().then((win) => {
      win.localStorage.setItem('percy-test-mode', 'true')
      win.localStorage.setItem('banking-test-context', JSON.stringify({
        feature: 'credit',
        testRun: new Date().toISOString(),
        environment: 'visual-regression'
      }))
    })
  })

  context('📍 Step 1: Credit Type & Amount', () => {
    
    it('💰 Credit Amount Calculator - Initial State', () => {
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      // Base visual state
      cy.percyBankingFlow({
        testName: 'Credit Amount Initial State',
        currentStep: 1,
        bankingFeature: 'credit',
        userFlow: 'credit-amount-selection'
      })
      
      // Mobile responsive test
      cy.percySnapshotMobile('Credit Step 1 - Mobile Layout')
    })

    it('🎯 Credit Type Selection Visual Test', () => {
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      // Test different credit types if available
      cy.get('body').then($body => {
        const creditTypes = $body.find('[class*="credit-type"], [name="credit_type"], select[name*="type"]')
        if (creditTypes.length > 0) {
          // Personal loan selection
          cy.get(creditTypes.first()).click()
          cy.wait(500)
          
          cy.get('[class*="option"], option').then($options => {
            if ($options.length > 0) {
              cy.get($options.first()).click()
              cy.wait(1000)
              
              cy.percyBankingFlow({
                testName: 'Credit Type Personal Loan',
                currentStep: 1,
                bankingFeature: 'credit',
                userFlow: 'personal-loan-selection'
              })
            }
          })
        }
      })
    })

    it('💵 Credit Amount Range Testing', () => {
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      // Test different credit amounts
      const creditAmounts = ['50000', '100000', '250000', '500000']
      
      creditAmounts.forEach((amount, index) => {
        if (index > 0) {
          cy.reload()
          cy.waitForBankingPageLoad()
        }
        
        cy.fillFormField('credit_amount', amount)
        cy.fillFormField('loan_period', '36') // 3 years
        cy.wait(1000)
        
        cy.percyBankingFlow({
          testName: `Credit Amount ${amount} ILS`,
          currentStep: 1,
          bankingFeature: 'credit',
          userFlow: 'amount-selection'
        }, {
          percyCSS: `
            /* Amount highlighting */
            input[value="${amount}"] {
              border: 3px solid #FF9800 !important;
              background: rgba(255, 152, 0, 0.1) !important;
              font-weight: bold !important;
              font-size: 16px !important;
            }
          `
        })
      })
    })

    it('📊 Interest Rate Calculator Visual', () => {
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      // Fill credit details to see interest calculation
      cy.fillFormField('credit_amount', '100000')
      cy.fillFormField('loan_period', '36')
      
      // Wait for calculations to appear
      cy.wait(2000)
      
      cy.percyBankingFlow({
        testName: 'Credit Interest Rate Display',
        currentStep: 1,
        bankingFeature: 'credit',
        userFlow: 'interest-calculation'
      }, {
        percyCSS: `
          /* Interest rate highlighting */
          [class*="interest"], [class*="rate"], [class*="payment"] {
            border: 2px solid #4CAF50 !important;
            background: rgba(76, 175, 80, 0.1) !important;
            padding: 8px !important;
            border-radius: 4px !important;
          }
        `
      })
    })

    it('🌐 Multi-language Credit Form', () => {
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      cy.percySnapshotMultiLang('Credit Step 1 - Credit Amount Form', {
        maskSensitiveData: true
      })
    })
  })

  context('📍 Step 2: Personal Information', () => {
    
    beforeEach(() => {
      // Navigate to step 2 with valid credit amount
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      cy.fillFormField('credit_amount', '100000')
      cy.fillFormField('loan_period', '36')
      
      cy.get('button').contains(/המשך|Continue/).click()
      cy.url().should('include', '/2')
      cy.waitForBankingPageLoad()
    })

    it('👤 Credit Application Personal Form', () => {
      cy.percyBankingFlow({
        testName: 'Credit Personal Info Form',
        currentStep: 2,
        bankingFeature: 'credit',
        userFlow: 'personal-information'
      })
    })

    it('🆔 ID Verification Fields', () => {
      // Fill personal information for credit application
      cy.fillFormField('first_name', 'אברהם')
      cy.fillFormField('last_name', 'לוי')
      cy.fillFormField('id_number', '123456789')
      cy.fillFormField('email', 'abraham.levi@example.com')
      cy.fillFormField('phone', '0521234567')
      
      // Handle date of birth if present
      cy.get('body').then($body => {
        const dateInput = $body.find('input[type="date"], [name*="birth"], [name*="date"]')
        if (dateInput.length > 0) {
          cy.get(dateInput.first()).type('1980-03-20')
        }
      })
      
      cy.wait(1000)
      
      // Use secure snapshot for sensitive data
      cy.percySnapshotSecure('Credit Step 2 - Personal Info with ID', {
        maskSensitiveData: true,
        percyCSS: `
          /* ID field security highlighting */
          input[name*="id"], input[placeholder*="זהות"] {
            border: 3px solid #FF5722 !important;
            background: rgba(255, 87, 34, 0.1) !important;
          }
          
          input[name*="id"]::after {
            content: "🔒 ID PROTECTED";
            position: absolute;
            top: -20px;
            right: 0;
            background: #FF5722;
            color: white;
            font-size: 10px;
            padding: 2px 4px;
          }
        `
      })
    })

    it('📱 Mobile Personal Info RTL', () => {
      cy.viewport(375, 812)
      cy.wait(1000)
      
      cy.percySnapshotRTL('Credit Step 2 - Mobile Personal Info Hebrew', {
        testButtonOverflow: true
      })
    })
  })

  context('📍 Step 3: Financial Information', () => {
    
    beforeEach(() => {
      // Navigate through to step 3
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      // Step 1
      cy.fillFormField('credit_amount', '100000')
      cy.fillFormField('loan_period', '36')
      cy.get('button').contains(/המשך|Continue/).click()
      cy.wait(1000)
      
      // Step 2
      cy.fillFormField('first_name', 'אברהם')
      cy.fillFormField('last_name', 'לוי')
      cy.get('button').contains(/המשך|Continue/).click()
      cy.url().should('include', '/3')
      cy.waitForBankingPageLoad()
    })

    it('💼 Employment & Income Information', () => {
      cy.percyBankingFlow({
        testName: 'Credit Financial Info Initial',
        currentStep: 3,
        bankingFeature: 'credit',
        userFlow: 'financial-information'
      })
    })

    it('💰 Income Sources & Employment Status', () => {
      // Fill financial information
      cy.fillFormField('monthly_income', '15000') // 15K ILS
      cy.fillFormField('years_employed', '3')
      cy.fillFormField('employer_name', 'היי-טק בע"מ')
      
      // Handle employment status dropdown
      cy.get('body').then($body => {
        const employmentDropdown = $body.find('[name*="employment"], [class*="employment"], select')
        if (employmentDropdown.length > 0) {
          cy.get(employmentDropdown.first()).click()
          cy.wait(500)
          cy.get('[class*="option"], option').contains(/שכיר|Employee/).click()
        }
      })
      
      cy.wait(1000)
      
      cy.percyBankingFlow({
        testName: 'Credit Financial Info Filled',
        currentStep: 3,
        bankingFeature: 'credit',
        userFlow: 'financial-information'
      }, {
        percyCSS: `
          /* Income highlighting */
          input[name*="income"], input[name*="salary"] {
            border: 3px solid #4CAF50 !important;
            background: rgba(76, 175, 80, 0.1) !important;
            font-weight: bold !important;
          }
          
          /* Employer field highlighting */
          input[name*="employer"] {
            border: 2px solid #2196F3 !important;
            background: rgba(33, 150, 243, 0.1) !important;
          }
        `
      })
    })

    it('📊 Existing Debts & Obligations', () => {
      // Handle existing debts section if present
      cy.get('body').then($body => {
        const debtSection = $body.find('[class*="debt"], [name*="debt"], [class*="obligation"]')
        if (debtSection.length > 0) {
          cy.fillFormField('existing_debt', '2000')
          cy.fillFormField('monthly_debt_payment', '500')
          
          cy.wait(1000)
          
          cy.percyBankingFlow({
            testName: 'Credit Existing Debts Info',
            currentStep: 3,
            bankingFeature: 'credit',
            userFlow: 'existing-debts'
          }, {
            percyCSS: `
              /* Debt highlighting */
              input[name*="debt"] {
                border: 2px solid #FF9800 !important;
                background: rgba(255, 152, 0, 0.1) !important;
              }
            `
          })
        }
      })
    })

    it('🔒 Financial Data Security Compliance', () => {
      // Fill with sensitive financial data
      cy.fillFormField('monthly_income', '25000')
      cy.fillFormField('bank_account', '123456789')
      cy.fillFormField('existing_debt', '50000')
      
      cy.percySnapshotSecure('Credit Step 3 - Financial Security', {
        maskSensitiveData: true,
        percyCSS: `
          /* Financial security indicators */
          input[name*="income"], input[name*="account"], input[name*="debt"] {
            filter: blur(5px) !important;
            background: #f0f0f0 !important;
          }
          
          input[name*="income"]::before {
            content: "💰 INCOME PROTECTED";
            position: absolute;
            top: -20px;
            left: 0;
            background: #4CAF50;
            color: white;
            font-size: 10px;
            padding: 2px 4px;
          }
        `
      })
    })
  })

  context('📍 Step 4: Credit Offers & Approval', () => {
    
    beforeEach(() => {
      // Complete journey to final step
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      // Quick progression using fillAllFormFields
      cy.fillAllFormFields()
      
      // Navigate through steps
      cy.get('button').contains(/המשך|Continue/).click()
      cy.wait(1000)
      cy.get('button').contains(/המשך|Continue/).click()
      cy.wait(1000)
      cy.get('button').contains(/המשך|Continue/).click()
      
      cy.url().should('include', '/4')
      cy.waitForBankingPageLoad()
    })

    it('🏦 Credit Offers & Terms Display', () => {
      cy.percyBankingFlow({
        testName: 'Credit Offers Results',
        currentStep: 4,
        bankingFeature: 'credit',
        userFlow: 'credit-offers'
      }, {
        waitForSelector: '[class*="offer"], [class*="result"], [class*="approval"]',
        percyCSS: `
          /* Credit offers styling */
          [class*="credit-offer"], [class*="offer"] {
            border: 3px solid #4CAF50 !important;
            box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3) !important;
            background: rgba(76, 175, 80, 0.05) !important;
          }
          
          /* Interest rate highlighting */
          [class*="rate"], [class*="apr"] {
            background: rgba(255, 193, 7, 0.3) !important;
            border: 2px solid #FFC107 !important;
            font-weight: bold !important;
            font-size: 18px !important;
          }
        `
      })
    })

    it('✅ Credit Approval Status', () => {
      // Check for approval/rejection status indicators
      cy.get('body').then($body => {
        const statusElements = $body.find('[class*="approval"], [class*="status"], [class*="decision"]')
        if (statusElements.length > 0) {
          cy.percyBankingFlow({
            testName: 'Credit Approval Status',
            currentStep: 4,
            bankingFeature: 'credit',
            userFlow: 'approval-status'
          }, {
            percyCSS: `
              /* Status indicators */
              [class*="approved"], [class*="success"] {
                border: 3px solid #4CAF50 !important;
                background: rgba(76, 175, 80, 0.2) !important;
                color: #2E7D32 !important;
              }
              
              [class*="rejected"], [class*="denied"] {
                border: 3px solid #f44336 !important;
                background: rgba(244, 67, 54, 0.2) !important;
                color: #C62828 !important;
              }
              
              [class*="pending"] {
                border: 3px solid #FF9800 !important;
                background: rgba(255, 152, 0, 0.2) !important;
                color: #F57C00 !important;
              }
            `
          })
        }
      })
    })

    it('📊 Credit Score Visualization', () => {
      // Look for credit score display elements
      cy.get('body').then($body => {
        const scoreElements = $body.find('[class*="score"], [class*="rating"], [class*="credit-rating"]')
        if (scoreElements.length > 0) {
          cy.percyBankingFlow({
            testName: 'Credit Score Display',
            currentStep: 4,
            bankingFeature: 'credit',
            userFlow: 'credit-score'
          }, {
            percyCSS: `
              /* Credit score styling */
              [class*="score"] {
                border: 3px solid #2196F3 !important;
                background: linear-gradient(45deg, #E3F2FD, #BBDEFB) !important;
                padding: 16px !important;
                border-radius: 8px !important;
                font-size: 24px !important;
                text-align: center !important;
              }
            `
          })
        }
      })
    })

    it('📱 Mobile Credit Offers Layout', () => {
      cy.percySnapshotMobile('Credit Step 4 - Mobile Offers')
      
      // Test button overflow specifically for mobile
      cy.viewport(375, 812)
      cy.wait(1000)
      cy.percyTestButtonOverflow('Credit Offers Mobile')
    })

    it('📄 Credit Terms & Conditions', () => {
      // Look for terms and conditions section
      cy.get('body').then($body => {
        const termsSection = $body.find('[class*="terms"], [class*="conditions"], [class*="agreement"]')
        if (termsSection.length > 0) {
          cy.percyBankingFlow({
            testName: 'Credit Terms Conditions',
            currentStep: 4,
            bankingFeature: 'credit',
            userFlow: 'terms-conditions'
          }, {
            scope: '[class*="terms"], [class*="conditions"]',
            percyCSS: `
              /* Terms highlighting */
              [class*="terms"], [class*="conditions"] {
                border: 2px solid #607D8B !important;
                background: rgba(96, 125, 139, 0.1) !important;
                padding: 12px !important;
              }
            `
          })
        }
      })
    })
  })

  context('🔄 Complete Credit Application Journey', () => {
    
    it('📈 End-to-End Credit Application Flow', () => {
      // Document complete credit application journey
      for (let step = 1; step <= 4; step++) {
        cy.visit(`/services/calculate-credit/${step}`)
        cy.waitForBankingPageLoad()
        
        if (step < 4) {
          // Fill appropriate fields for each step
          if (step === 1) {
            cy.fillFormField('credit_amount', '150000')
            cy.fillFormField('loan_period', '48')
          } else if (step === 2) {
            cy.fillFormField('first_name', 'שרה')
            cy.fillFormField('last_name', 'כהן')
            cy.fillFormField('email', 'sarah.cohen@example.com')
          } else if (step === 3) {
            cy.fillFormField('monthly_income', '20000')
            cy.fillFormField('years_employed', '4')
          }
          
          cy.wait(1000)
          cy.percyBankingFlow({
            testName: `Credit Journey Step ${step}`,
            currentStep: step,
            bankingFeature: 'credit',
            userFlow: 'complete-credit-journey'
          })
        } else {
          cy.percyBankingFlow({
            testName: 'Credit Journey Final Results',
            currentStep: 4,
            bankingFeature: 'credit',
            userFlow: 'complete-credit-journey'
          })
        }
      }
    })

    it('⚠️ Credit Application Error States', () => {
      // Test error states on each step
      for (let step = 1; step <= 3; step++) {
        cy.visit(`/services/calculate-credit/${step}`)
        cy.waitForBankingPageLoad()
        
        // Try to proceed without required information
        cy.get('button').contains(/המשך|Continue/).click()
        cy.wait(1500)
        
        cy.percyBankingFlow({
          testName: `Credit Error State Step ${step}`,
          currentStep: step,
          bankingFeature: 'credit',
          userFlow: 'error-validation'
        }, {
          percyCSS: `
            /* Error state styling */
            .error, [class*="error"], .invalid {
              border: 3px solid #f44336 !important;
              background: rgba(244, 67, 54, 0.1) !important;
              box-shadow: 0 0 10px rgba(244, 67, 54, 0.4) !important;
            }
          `
        })
      }
    })
  })

  context('🎯 Business Credit Application Flow', () => {
    
    it('🏢 Business Credit Form Differences', () => {
      // Test business credit flow if available
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      // Look for business credit option
      cy.get('body').then($body => {
        const businessOption = $body.find('[value*="business"], [class*="business"], option[value*="business"]')
        if (businessOption.length > 0) {
          cy.get(businessOption.first()).click()
          cy.wait(1000)
          
          cy.percyBankingFlow({
            testName: 'Business Credit Application',
            currentStep: 1,
            bankingFeature: 'credit',
            userFlow: 'business-credit'
          }, {
            percyCSS: `
              /* Business credit highlighting */
              [class*="business"], [value*="business"] {
                border: 3px solid #9C27B0 !important;
                background: rgba(156, 39, 176, 0.1) !important;
              }
            `
          })
        }
      })
    })
  })

  // Percy + Jira integration for visual regression failures
  afterEach(function() {
    if (this.currentTest && this.currentTest.state === 'failed') {
      const testName = this.currentTest.title
      const spec = Cypress.spec.relative
      
      cy.task('createVisualRegressionJira', {
        testName: `Credit Application - ${testName}`,
        snapshots: [`${testName} - Failure`],
        percyBuildUrl: Cypress.env('PERCY_BUILD_URL'),
        visualDifferences: [{
          elementName: 'Credit Form Element',
          changeType: 'layout' as const,
          severity: 'medium' as const
        }],
        affectedLanguages: ['he', 'en'],
        affectedViewports: [375, 768, 1280],
        bankingImpact: 'form-validation' as const,
        screenshots: [],
        specFile: spec,
        branch: Cypress.env('BRANCH_NAME') || 'main',
        commit: Cypress.env('COMMIT_SHA') || 'unknown'
      }, { log: false })
    }
  })
})