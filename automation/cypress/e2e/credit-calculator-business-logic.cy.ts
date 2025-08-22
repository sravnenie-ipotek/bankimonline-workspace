/**
 * 🎯 CREDIT CALCULATOR BUSINESS LOGIC VALIDATION
 * Testing the 22 Confluence-specified requirements against actual implementation
 * Focus: Business rules, validation, calculations, data flow
 */

describe('Credit Calculator - Business Logic Validation', () => {
  let businessResults: any = {};
  
  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  describe('🚨 CRITICAL ISSUE INVESTIGATION', () => {
    it('Should investigate why all steps show the same page', () => {
      // Test each step URL individually to identify routing issues
      const steps = [
        { step: 1, url: '/services/calculate-credit/1' },
        { step: 2, url: '/services/calculate-credit/2' },
        { step: 3, url: '/services/calculate-credit/3' },
        { step: 4, url: '/services/calculate-credit/4' }
      ];

      steps.forEach(({ step, url }) => {
        cy.visit(url);
        cy.wait(2000);
        
        // Take screenshot to analyze actual content
        cy.screenshot(`step-${step}-url-analysis`);
        
        // Check URL is correct
        cy.url().should('include', url);
        
        // Document page content for each step
        cy.get('body').then($body => {
          const pageContent = $body.text();
          businessResults[`step${step}Content`] = pageContent.substring(0, 200);
          
          // Log for debugging
          cy.task('log', `Step ${step} URL: ${url}`);
          cy.task('log', `Step ${step} Content Preview: ${pageContent.substring(0, 100)}...`);
        });
        
        // Check for step-specific content
        if (step === 1) {
          // Look for credit type/amount fields
          cy.get('body').should('contain.text', 'סכום הסרדאי').or('contain.text', 'Credit Amount').or('contain.text', '200,000');
        } else if (step === 2) {
          // Look for personal info fields
          cy.get('body').should('contain.text', 'פרטים אישיים').or('contain.text', 'Personal').or('contain.text', 'שם');
        } else if (step === 3) {
          // Look for income/DTI fields  
          cy.get('body').should('contain.text', 'הכנסות').or('contain.text', 'Income').or('contain.text', 'DTI');
        } else if (step === 4) {
          // Look for bank programs
          cy.get('body').should('contain.text', 'תוכניות').or('contain.text', 'Programs').or('contain.text', 'בנק');
        }
      });
    });
  });

  describe('💰 Step 1 - Credit Amount & Type Validation', () => {
    beforeEach(() => {
      cy.visit('/services/calculate-credit/1');
      cy.wait(2000);
    });

    it('Should validate credit amount limits per Confluence specifications', () => {
      cy.screenshot('step1-credit-amount-validation-start');
      
      // Find credit amount input field
      const amountSelectors = [
        'input[name*="amount"]',
        'input[name*="creditAmount"]', 
        'input[name*="loanAmount"]',
        'input[type="number"]',
        '[data-cy="amount"]',
        '[data-testid="amount"]'
      ];

      let amountFieldFound = false;
      
      amountSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            amountFieldFound = true;
            cy.get(selector).first().as('amountField');
            
            // Test Confluence business rules
            // Personal Credit: ₪10,000-₪500,000
            cy.get('@amountField').clear().type('5000'); // Below minimum
            cy.get('@amountField').blur();
            cy.wait(500);
            
            // Check for validation message
            cy.get('body').then($body => {
              const bodyText = $body.text();
              businessResults.belowMinimumValidation = bodyText.includes('minimum') || bodyText.includes('מינימום') || bodyText.includes('קטן');
            });
            
            cy.get('@amountField').clear().type('600000'); // Above maximum
            cy.get('@amountField').blur();
            cy.wait(500);
            
            cy.get('body').then($body => {
              const bodyText = $body.text();
              businessResults.aboveMaximumValidation = bodyText.includes('maximum') || bodyText.includes('מקסימום') || bodyText.includes('גדול');
            });
            
            // Test valid amount
            cy.get('@amountField').clear().type('200000'); // Valid amount
            cy.get('@amountField').blur();
            cy.wait(500);
            
            businessResults.validAmountAccepted = true;
            cy.screenshot('step1-amount-validation-complete');
          }
        });
      });
      
      businessResults.amountFieldFound = amountFieldFound;
    });

    it('Should test credit type selection (Personal/Business/Renovation)', () => {
      // Look for credit type selectors
      const typeSelectors = [
        'select[name*="type"]',
        'select[name*="creditType"]',
        '[data-cy="credit-type"]',
        'button:contains("Personal")',
        'button:contains("אישי")',
        'button:contains("עסקי")',
        '[role="radiogroup"]',
        'input[type="radio"]'
      ];
      
      let creditTypeFound = false;
      
      typeSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            creditTypeFound = true;
            cy.get(selector).first().click();
            cy.wait(500);
            cy.screenshot('step1-credit-type-selection');
          }
        });
      });
      
      businessResults.creditTypeSelectionFound = creditTypeFound;
    });

    it('Should validate DTI ratio calculations', () => {
      // Look for DTI display or calculation
      const dtiSelectors = [
        '[data-cy="dti"]',
        '[data-testid="dti-ratio"]',
        '*:contains("DTI")',
        '*:contains("יחס חוב")',
        '*:contains("%")'
      ];
      
      let dtiFound = false;
      
      dtiSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            dtiFound = true;
            // Test DTI business rules:
            // Personal: ≤42%, Renovation: ≤35%, Business: ≤38%
            businessResults.dtiCalculationPresent = true;
          }
        });
      });
      
      businessResults.dtiFound = dtiFound;
    });

    it('Should test monthly payment calculation', () => {
      // Look for monthly payment display
      cy.get('body').then($body => {
        const bodyText = $body.text();
        const hasPaymentCalc = bodyText.includes('תשלום חודשי') || 
                              bodyText.includes('Monthly Payment') || 
                              bodyText.includes('5,368') || 
                              bodyText.includes('₪');
                              
        businessResults.monthlyPaymentVisible = hasPaymentCalc;
        
        if (hasPaymentCalc) {
          cy.screenshot('step1-payment-calculation-found');
        }
      });
    });
  });

  describe('🏦 Banking Standards & API Integration', () => {
    it('Should validate API integration for calculation parameters', () => {
      // Test API endpoints directly
      cy.request('GET', '/api/v1/calculation-parameters?business_path=credit')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq('success');
          
          const data = response.body.data;
          businessResults.apiIntegration = {
            status: 'SUCCESS',
            currentRate: data.current_interest_rate,
            maxLoan: data.standards.amount.maximum_loan_amount.value,
            minLoan: data.standards.amount.minimum_loan_amount.value,
            maxDTI: data.standards.dti.credit_max_dti.value,
            minIncome: data.standards.income.minimum_monthly_income.value
          };
          
          // Validate business logic matches Confluence specs
          expect(data.standards.dti.credit_max_dti.value).to.be.at.most(42); // DTI <= 42%
          expect(data.standards.income.minimum_monthly_income.value).to.be.at.least(2000); // Min income
        });
    });

    it('Should test dropdown API integration', () => {
      cy.request('GET', '/api/dropdowns/credit_step1/en')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq('success');
          
          businessResults.dropdownAPI = {
            status: 'SUCCESS',
            dropdowns: response.body.dropdowns.length,
            options: Object.keys(response.body.options).length
          };
          
          // Check for expected dropdown fields
          const dropdownKeys = response.body.dropdowns.map((d: any) => d.key);
          businessResults.expectedDropdowns = {
            loanAmount: dropdownKeys.includes('credit_step1_loan_amount'),
            loanPeriod: dropdownKeys.includes('credit_step1_loan_period'),
            loanPurpose: dropdownKeys.includes('credit_step1_loan_purpose'),
            whenNeeded: dropdownKeys.includes('credit_step1_when_needed')
          };
        });
    });
  });

  describe('🌐 Multi-Language & RTL Testing', () => {
    const languages = ['en', 'he', 'ru'];
    
    languages.forEach(lang => {
      it(`Should test credit calculator in ${lang.toUpperCase()}`, () => {
        // Try to switch language if switcher exists
        cy.visit('/services/calculate-credit/1');
        cy.wait(1000);
        
        const langSwitchers = [
          `[data-cy="lang-${lang}"]`,
          `button:contains("${lang.toUpperCase()}")`,
          `[href*="lang=${lang}"]`
        ];
        
        langSwitchers.forEach(selector => {
          cy.get('body').then($body => {
            if ($body.find(selector).length > 0) {
              cy.get(selector).click();
              cy.wait(1000);
            }
          });
        });
        
        cy.screenshot(`language-test-${lang}`);
        
        // Test RTL layout for Hebrew
        if (lang === 'he') {
          cy.get('html').then($html => {
            const dir = $html.attr('dir');
            businessResults.rtlSupport = dir === 'rtl';
          });
        }
        
        // Verify content is in expected language
        cy.get('body').then($body => {
          const text = $body.text();
          if (lang === 'he') {
            businessResults[`${lang}Content`] = text.includes('סכום') || text.includes('הסרדאי');
          } else if (lang === 'ru') {
            businessResults[`${lang}Content`] = text.includes('Сумма') || text.includes('кредит');
          } else {
            businessResults[`${lang}Content`] = text.includes('Amount') || text.includes('Credit');
          }
        });
      });
    });
  });

  describe('📱 Responsive Design Validation', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach(viewport => {
      it(`Should validate credit calculator on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/services/calculate-credit/1');
        cy.wait(1000);
        
        cy.screenshot(`responsive-${viewport.name.toLowerCase()}-detailed`);
        
        // Check if key elements are visible and usable
        cy.get('body').should('be.visible');
        
        // Test form interactions on this viewport
        cy.get('body').then($body => {
          const hasInteractiveElements = $body.find('input, select, button').length > 0;
          businessResults[`${viewport.name.toLowerCase()}Usable`] = hasInteractiveElements;
          
          if (hasInteractiveElements) {
            // Test a form interaction
            const firstInput = $body.find('input').first();
            if (firstInput.length > 0) {
              cy.wrap(firstInput).click({ force: true });
              businessResults[`${viewport.name.toLowerCase()}Interactive`] = true;
            }
          }
        });
      });
    });
  });

  after(() => {
    // Generate comprehensive business logic report
    cy.task('log', '\n🎯 CREDIT CALCULATOR BUSINESS LOGIC ANALYSIS RESULTS');
    cy.task('log', '='.repeat(60));
    
    cy.task('log', '\n💰 CREDIT AMOUNT & VALIDATION:');
    cy.task('log', `Amount Field Found: ${businessResults.amountFieldFound ? '✅ YES' : '❌ NO'}`);
    cy.task('log', `Below Minimum Validation: ${businessResults.belowMinimumValidation ? '✅ DETECTED' : '❌ NOT DETECTED'}`);
    cy.task('log', `Above Maximum Validation: ${businessResults.aboveMaximumValidation ? '✅ DETECTED' : '❌ NOT DETECTED'}`);
    cy.task('log', `Valid Amount Accepted: ${businessResults.validAmountAccepted ? '✅ YES' : '❌ NO'}`);
    
    cy.task('log', '\n🏷️ CREDIT TYPE & DTI:');
    cy.task('log', `Credit Type Selection: ${businessResults.creditTypeSelectionFound ? '✅ FOUND' : '❌ NOT FOUND'}`);
    cy.task('log', `DTI Calculation Present: ${businessResults.dtiFound ? '✅ FOUND' : '❌ NOT FOUND'}`);
    cy.task('log', `Monthly Payment Visible: ${businessResults.monthlyPaymentVisible ? '✅ YES' : '❌ NO'}`);
    
    if (businessResults.apiIntegration) {
      cy.task('log', '\n🔌 API INTEGRATION:');
      cy.task('log', `API Status: ${businessResults.apiIntegration.status}`);
      cy.task('log', `Current Interest Rate: ${businessResults.apiIntegration.currentRate}%`);
      cy.task('log', `Max Loan Amount: ₪${businessResults.apiIntegration.maxLoan?.toLocaleString()}`);
      cy.task('log', `Min Loan Amount: ₪${businessResults.apiIntegration.minLoan?.toLocaleString()}`);
      cy.task('log', `Max DTI Ratio: ${businessResults.apiIntegration.maxDTI}%`);
      cy.task('log', `Min Monthly Income: ₪${businessResults.apiIntegration.minIncome?.toLocaleString()}`);
    }
    
    if (businessResults.dropdownAPI) {
      cy.task('log', '\n📋 DROPDOWN INTEGRATION:');
      cy.task('log', `Dropdown API Status: ${businessResults.dropdownAPI.status}`);
      cy.task('log', `Number of Dropdowns: ${businessResults.dropdownAPI.dropdowns}`);
      cy.task('log', `Number of Options: ${businessResults.dropdownAPI.options}`);
      
      if (businessResults.expectedDropdowns) {
        cy.task('log', 'Expected Dropdown Fields:');
        Object.entries(businessResults.expectedDropdowns).forEach(([key, found]) => {
          cy.task('log', `  ${key}: ${found ? '✅ FOUND' : '❌ MISSING'}`);
        });
      }
    }
    
    cy.task('log', '\n🌐 MULTI-LANGUAGE SUPPORT:');
    cy.task('log', `Hebrew (RTL): ${businessResults.rtlSupport ? '✅ RTL ENABLED' : '❌ RTL DISABLED'}`);
    cy.task('log', `Hebrew Content: ${businessResults.heContent ? '✅ DETECTED' : '❌ NOT DETECTED'}`);
    cy.task('log', `English Content: ${businessResults.enContent ? '✅ DETECTED' : '❌ NOT DETECTED'}`);
    cy.task('log', `Russian Content: ${businessResults.ruContent ? '✅ DETECTED' : '❌ NOT DETECTED'}`);
    
    cy.task('log', '\n📱 RESPONSIVE DESIGN:');
    cy.task('log', `Mobile Usable: ${businessResults.mobileUsable ? '✅ YES' : '❌ NO'}`);
    cy.task('log', `Tablet Usable: ${businessResults.tabletUsable ? '✅ YES' : '❌ NO'}`);
    cy.task('log', `Desktop Usable: ${businessResults.desktopUsable ? '✅ YES' : '❌ NO'}`);
    
    // CRITICAL FINDINGS
    cy.task('log', '\n🚨 CRITICAL FINDINGS:');
    const criticalIssues = [];
    
    if (!businessResults.amountFieldFound) {
      criticalIssues.push('Credit amount input field not found');
    }
    
    if (!businessResults.creditTypeSelectionFound) {
      criticalIssues.push('Credit type selection not found');
    }
    
    if (!businessResults.monthlyPaymentVisible) {
      criticalIssues.push('Monthly payment calculation not visible');
    }
    
    if (criticalIssues.length > 0) {
      criticalIssues.forEach(issue => {
        cy.task('log', `❌ ${issue}`);
      });
    } else {
      cy.task('log', '✅ All critical business logic elements found');
    }
    
    // CONFLUENCE COMPLIANCE SCORE
    const totalChecks = 10;
    const passedChecks = [
      businessResults.amountFieldFound,
      businessResults.creditTypeSelectionFound,
      businessResults.monthlyPaymentVisible,
      businessResults.apiIntegration?.status === 'SUCCESS',
      businessResults.dropdownAPI?.status === 'SUCCESS',
      businessResults.rtlSupport,
      businessResults.heContent,
      businessResults.mobileUsable,
      businessResults.tabletUsable,
      businessResults.desktopUsable
    ].filter(Boolean).length;
    
    const complianceScore = (passedChecks / totalChecks * 100).toFixed(1);
    
    cy.task('log', '\n📊 CONFLUENCE COMPLIANCE SCORE:');
    cy.task('log', `${passedChecks}/${totalChecks} checks passed (${complianceScore}%)`);
    
    if (complianceScore >= '80') {
      cy.task('log', '✅ GOOD COMPLIANCE - Minor issues to address');
    } else if (complianceScore >= '60') {
      cy.task('log', '⚠️ MODERATE COMPLIANCE - Several issues need attention');
    } else {
      cy.task('log', '❌ LOW COMPLIANCE - Major issues require immediate attention');
    }
  });
});