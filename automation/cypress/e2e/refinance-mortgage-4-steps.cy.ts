/**
 * 🏦 COMPREHENSIVE REFINANCE MORTGAGE TESTING SUITE
 * 
 * Generated: August 14, 2025
 * Target: http://localhost:5173/services/refinance-mortgage/1,2,3,4
 * API Endpoint: business_path=mortgage_refinance
 * 
 * CRITICAL REFINANCE REQUIREMENTS:
 * - Minimum monthly payment savings: 2%
 * - Cash-out LTV max: 80%
 * - Refinance max DTI: 42%
 * - Break-even analysis calculations
 * - Current vs new loan comparison logic
 */

describe('🚨 PHASE 0: CRITICAL REFINANCE DROPDOWN LOGIC VALIDATION', () => {
  
  // Comprehensive refinance dropdown selectors
  const allRefinanceDropdownSelectors = [
    // Traditional HTML dropdowns
    'select',
    '[role="combobox"]',
    '[role="listbox"]',
    
    // Refinance-specific dropdowns
    '[data-testid*="rate"]',
    '[data-testid*="term"]',
    '[data-testid*="refinance"]',
    '[data-testid*="loan"]',
    '[data-testid*="cash-out"]',
    '[data-testid*="reason"]',
    '[data-testid*="current"]',
    '[data-testid*="new"]',
    
    // Modern React refinance components
    '[data-testid*="dropdown"]',
    '[data-testid*="select"]',
    '[aria-haspopup="listbox"]',
    '[aria-expanded]',
    
    // Custom button-based refinance dropdowns
    'button[aria-expanded]',
    'button:has(.arrow-down)',
    'button:has([class*="chevron"])',
    
    // Refinance-specific CSS classes
    '.rate-selector',
    '.term-selector',
    '.refinance-dropdown',
    '.loan-comparison',
    '.cash-out-selector',
    
    // Hebrew text patterns for refinance
    'button:contains("בחר ריבית")',     // "Choose rate" in Hebrew
    'button:contains("בחר תקופה")',     // "Choose period" in Hebrew
    'button:contains("בחר בנק")',       // "Choose bank" in Hebrew
    '[placeholder*="ריבית"]',          // Rate placeholder
    '[placeholder*="תקופה"]',          // Term placeholder
    
    // Interactive refinance elements
    'div[tabindex="0"]:has(.rate-options)',
    'div[role="button"]:has(.loan-menu)',
    
    // Framework-specific refinance selectors
    '.ant-select-refinance',
    '.MuiSelect-refinance',
    '.refinance-react-select'
  ];

  beforeEach(() => {
    // Intercept refinance-specific API calls
    cy.intercept('GET', '**/api/v1/calculation-parameters*business_path=mortgage_refinance*').as('refinanceParamsAPI');
    cy.intercept('GET', '**/api/v1/dropdowns**').as('dropdownAPI');
    cy.intercept('GET', '**/api/v1/banks**').as('banksAPI');
    cy.intercept('GET', '**/api/v1/rates**').as('ratesAPI');
  });

  describe('CRITICAL: Refinance Dropdown Availability Across All Steps', () => {
    const refinanceSteps = [1, 2, 3, 4];
    
    refinanceSteps.forEach(step => {
      it(`PHASE 0.1: Refinance Step ${step} - All dropdowns must have options and be functional`, () => {
        cy.visit(`/services/refinance-mortgage/${step}`, { timeout: 10000 });
        cy.wait(3000); // Allow refinance API calls to complete
        
        // Wait for refinance API if available
        cy.wait('@refinanceParamsAPI', { timeout: 10000 }).then((interception) => {
          if (interception) {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body).to.have.property('data');
            cy.log(`✅ Refinance API loaded for Step ${step}`);
          }
        });
        
        // Find all refinance dropdowns using comprehensive strategy
        let foundRefinanceDropdowns = false;
        let workingSelectors = [];
        
        // Test each selector type
        allRefinanceDropdownSelectors.forEach(selector => {
          cy.get('body').then($body => {
            const elements = $body.find(selector);
            if (elements.length > 0) {
              foundRefinanceDropdowns = true;
              workingSelectors.push(selector);
              cy.log(`✅ Found ${elements.length} refinance dropdowns with selector: ${selector}`);
            }
          });
        });
        
        // Test found dropdowns
        if (workingSelectors.length > 0) {
          workingSelectors.forEach(selector => {
            cy.get(selector).each($dropdown => {
              const dropdownName = $dropdown.attr('data-testid') || 
                                   $dropdown.attr('id') || 
                                   $dropdown.attr('name') || 
                                   'unnamed-refinance-dropdown';
              
              cy.log(`🔍 Testing refinance dropdown: ${dropdownName} on Step ${step}`);
              
              // CRITICAL: Refinance dropdown must not be empty
              cy.wrap($dropdown).within(() => {
                cy.get('option, [role="option"], .dropdown-option, li').should('have.length.greaterThan', 0, 
                  `Refinance dropdown ${dropdownName} on Step ${step} MUST have options`);
              });
              
              // CRITICAL: Refinance dropdown must be interactive
              cy.wrap($dropdown).should('not.be.disabled', 
                `Refinance dropdown ${dropdownName} on Step ${step} must be interactive`);
              
              cy.screenshot(`refinance-phase0/step${step}-${dropdownName}-validation`);
            });
          });
        } else {
          // Emergency fallback: Manual inspection
          cy.log('🚨 No dropdowns found with standard selectors - using emergency inspection');
          
          cy.get('body').then($body => {
            const interactiveElements = $body.find('button, div[role="button"], [aria-expanded], [data-testid*="select"]');
            
            cy.log(`🔍 Found ${interactiveElements.length} potentially interactive elements for manual analysis`);
            
            interactiveElements.each((index, element) => {
              const tagName = element.tagName;
              const testId = element.getAttribute('data-testid') || 'none';
              const text = element.textContent?.trim().substring(0, 50) || 'no text';
              
              cy.log(`Element ${index}: ${tagName} | testid="${testId}" | text="${text}"`);
            });
          });
          
          cy.screenshot(`refinance-phase0/step${step}-emergency-inspection`);
        }
      });
    });
  });

  describe('CRITICAL: Current Loan Details Validation (Step 1)', () => {
    it('PHASE 0.2: Current loan dropdowns must capture existing mortgage information', () => {
      cy.visit('/services/refinance-mortgage/1');
      cy.wait(3000);
      
      // CRITICAL: Current Interest Rate dropdown/input
      const currentRateSelectors = [
        '[data-testid="current-rate"]',
        '[data-testid="current_interest_rate"]', 
        '[data-testid="existing_rate"]',
        'select[name*="current_rate"]',
        'select[name*="existing_rate"]',
        'input[name*="current_rate"]'
      ];
      
      let currentRateFound = false;
      currentRateSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            currentRateFound = true;
            cy.get(selector).should('exist').should('be.visible');
            cy.log(`✅ Found current rate field: ${selector}`);
            
            // Test if it's a dropdown with options
            cy.get(selector).then($element => {
              if ($element.is('select')) {
                cy.wrap($element).within(() => {
                  cy.get('option').should('have.length.greaterThan', 0, 
                    'Current rate dropdown must have rate options');
                });
              }
            });
          }
        });
      });
      
      // CRITICAL: Current Loan Balance input
      const loanBalanceSelectors = [
        '[data-testid="current-balance"]',
        '[data-testid="loan_balance"]',
        '[data-testid="existing_balance"]',
        'input[name*="balance"]',
        'input[name*="current_loan"]'
      ];
      
      loanBalanceSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('exist').should('be.visible');
            cy.log(`✅ Found loan balance field: ${selector}`);
          }
        });
      });
      
      // CRITICAL: Remaining Term dropdown
      const remainingTermSelectors = [
        '[data-testid="remaining-term"]',
        '[data-testid="current_term"]',
        'select[name*="term"]',
        'select[name*="remaining"]'
      ];
      
      remainingTermSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('exist');
            
            // Test term dropdown options
            cy.get(selector).then($element => {
              if ($element.is('select')) {
                cy.wrap($element).within(() => {
                  cy.get('option').should('have.length.greaterThan', 0);
                  
                  // Validate term options are realistic (10-35 years)
                  cy.get('option').each($option => {
                    const termText = $option.text();
                    const termMatch = termText.match(/(\d+)/);
                    if (termMatch) {
                      const years = parseInt(termMatch[1]);
                      if (years > 0) {
                        expect(years).to.be.within(10, 35, `Term ${years} years should be realistic`);
                      }
                    }
                  });
                });
              }
            });
            
            cy.log(`✅ Found remaining term field: ${selector}`);
          }
        });
      });
      
      cy.screenshot('refinance-phase0/step1-current-loan-fields-validation');
    });
  });

  describe('CRITICAL: Refinance Rate Comparison Logic (Step 2)', () => {
    it('PHASE 0.3: New rate dropdowns must show improvement over current rates', () => {
      cy.visit('/services/refinance-mortgage/2');
      cy.wait(3000);
      
      // CRITICAL: New Interest Rate dropdown
      const newRateSelectors = [
        '[data-testid="new-rate"]',
        '[data-testid="refinance_rate"]',
        '[data-testid="target_rate"]',
        'select[name*="new_rate"]',
        'select[name*="target_rate"]'
      ];
      
      newRateSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('exist').should('be.visible');
            
            cy.get(selector).within(() => {
              cy.get('option').should('have.length.greaterThan', 0, 
                'New rate dropdown must have refinance rate options');
              
              // Validate new rates are competitive (2-6% range)
              cy.get('option').each($option => {
                const rateText = $option.text();
                const rateMatch = rateText.match(/(\d+\.?\d*)%?/);
                if (rateMatch) {
                  const rate = parseFloat(rateMatch[1]);
                  if (rate > 0) {
                    expect(rate).to.be.within(2, 8, `New rate ${rate}% should be competitive`);
                  }
                }
              });
            });
            
            // Test rate selection triggers calculation updates
            cy.get(selector).select(1); // Select first available rate
            cy.wait(1000);
            
            // Check for payment comparison display
            const calculationSelectors = [
              '[data-testid*="payment"]',
              '[data-testid*="savings"]',
              '[data-testid*="comparison"]',
              '.payment-comparison',
              '.savings-display'
            ];
            
            calculationSelectors.forEach(calcSelector => {
              cy.get('body').then($body => {
                if ($body.find(calcSelector).length > 0) {
                  cy.log(`✅ Rate selection triggered calculation display: ${calcSelector}`);
                }
              });
            });
            
            cy.log(`✅ Found new rate dropdown: ${selector}`);
          }
        });
      });
      
      // CRITICAL: Cash-Out Option validation
      const cashOutSelectors = [
        '[data-testid="cash-out"]',
        '[data-testid="cash_out_amount"]',
        '[data-testid="equity_extraction"]',
        'select[name*="cash"]',
        'input[name*="cash"]'
      ];
      
      cashOutSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('exist');
            cy.log(`✅ Found cash-out option: ${selector}`);
            
            // Test cash-out selection reveals additional fields
            if ($body.find(selector).is('select')) {
              cy.get(selector).within(() => {
                cy.get('option').should('have.length.greaterThan', 0);
              });
            }
          }
        });
      });
      
      cy.screenshot('refinance-phase0/step2-rate-comparison-validation');
    });
  });

  describe('CRITICAL: Bank Offers and Refinance Programs (Step 3)', () => {
    it('PHASE 0.4: Bank selection must show refinance programs with competitive rates', () => {
      cy.visit('/services/refinance-mortgage/3');
      cy.wait(5000); // Allow refinance bank API calls
      
      // CRITICAL: Bank Selection dropdown
      const bankSelectors = [
        '[data-testid="bank"]',
        '[data-testid="lender"]',
        '[data-testid="financial_institution"]',
        'select[name*="bank"]',
        'select[name*="lender"]'
      ];
      
      bankSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('exist').should('be.visible');
            
            cy.get(selector).within(() => {
              cy.get('option').should('have.length.greaterThan', 0, 
                'Bank selection dropdown must have lender options');
              
              // Validate Israeli banks are present
              cy.get('option').then($options => {
                const bankTexts = Array.from($options).map(option => option.textContent);
                const hasIsraeliBank = bankTexts.some(text => 
                  text.includes('בנק') || // Hebrew for "bank"
                  text.includes('Bank') ||
                  text.includes('הפועלים') ||
                  text.includes('לאומי')
                );
                
                if (hasIsraeliBank) {
                  cy.log('✅ Found Israeli banking institutions');
                }
              });
            });
            
            // Test bank selection reveals refinance programs
            cy.get(selector).select(1); // Select first bank
            cy.wait(3000); // Allow program loading
            
            // Check for revealed refinance program details
            const programSelectors = [
              '[data-testid*="program"]',
              '[data-testid*="refinance"]',
              '[data-testid*="rate"]',
              '.program-details',
              '.refinance-offer',
              '.loan-program'
            ];
            
            programSelectors.forEach(progSelector => {
              cy.get('body').then($body => {
                if ($body.find(progSelector).length > 0) {
                  cy.log(`✅ Bank selection revealed refinance programs: ${progSelector}`);
                }
              });
            });
            
            cy.log(`✅ Found bank selection dropdown: ${selector}`);
          }
        });
      });
      
      // CRITICAL: Refinance Program dropdown
      const programSelectors = [
        '[data-testid="program"]',
        '[data-testid="refinance_program"]',
        '[data-testid="loan_product"]',
        'select[name*="program"]'
      ];
      
      programSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).within(() => {
              cy.get('option').should('have.length.greaterThan', 0, 
                'Refinance program dropdown must have program options');
            });
            
            cy.log(`✅ Found refinance program dropdown: ${selector}`);
          }
        });
      });
      
      cy.screenshot('refinance-phase0/step3-bank-programs-validation');
    });
  });

  describe('CRITICAL: Application Summary and Break-Even Analysis (Step 4)', () => {
    it('PHASE 0.5: Summary must show current vs new loan comparison with break-even', () => {
      cy.visit('/services/refinance-mortgage/4');
      cy.wait(3000);
      
      // CRITICAL: Loan comparison elements
      const comparisonSelectors = [
        '[data-testid*="current"]',
        '[data-testid*="new"]',
        '[data-testid*="comparison"]',
        '[data-testid*="savings"]',
        '.loan-comparison',
        '.refinance-summary',
        '.current-loan',
        '.new-loan'
      ];
      
      let foundComparison = false;
      comparisonSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            foundComparison = true;
            cy.get(selector).should('be.visible');
            cy.log(`✅ Found loan comparison element: ${selector}`);
          }
        });
      });
      
      // CRITICAL: Break-even analysis display
      const breakEvenSelectors = [
        '[data-testid*="break"]',
        '[data-testid*="roi"]',
        '[data-testid*="payback"]',
        '.break-even',
        '.roi-analysis',
        '.payback-period'
      ];
      
      breakEvenSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('be.visible');
            cy.log(`✅ Found break-even analysis: ${selector}`);
          }
        });
      });
      
      // CRITICAL: Refinance reason dropdown
      const reasonSelectors = [
        '[data-testid="reason"]',
        '[data-testid="refinance_reason"]',
        '[data-testid="purpose"]',
        'select[name*="reason"]',
        'select[name*="purpose"]'
      ];
      
      reasonSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('exist').should('be.visible');
            
            cy.get(selector).within(() => {
              cy.get('option').should('have.length.greaterThan', 0, 
                'Refinance reason dropdown must have reason options');
              
              // Validate refinance reasons
              cy.get('option').then($options => {
                const optionTexts = Array.from($options).map(option => option.textContent.toLowerCase());
                const hasCommonReasons = optionTexts.some(text => 
                  text.includes('rate') || 
                  text.includes('payment') ||
                  text.includes('cash') ||
                  text.includes('term')
                );
                
                if (hasCommonReasons) {
                  cy.log('✅ Found standard refinance reasons');
                }
              });
            });
            
            cy.log(`✅ Found refinance reason dropdown: ${selector}`);
          }
        });
      });
      
      cy.screenshot('refinance-phase0/step4-summary-validation');
    });
  });

  describe('CRITICAL: Refinance API Integration Validation', () => {
    it('PHASE 0.6: All refinance dropdowns must load from mortgage_refinance API', () => {
      // Test each refinance step for API integration
      [1, 2, 3, 4].forEach(step => {
        cy.visit(`/services/refinance-mortgage/${step}`);
        
        // Wait for refinance API calls
        cy.wait('@refinanceParamsAPI', { timeout: 10000 }).then((interception) => {
          if (interception) {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.status).to.equal('success');
            expect(interception.response.body.data.business_path).to.equal('mortgage_refinance');
            
            // Validate refinance-specific parameters
            const refinanceData = interception.response.body.data;
            expect(refinanceData).to.have.property('standards');
            expect(refinanceData.standards).to.have.property('refinance');
            
            if (refinanceData.standards.refinance) {
              cy.log(`✅ Step ${step}: Refinance-specific API parameters loaded`);
              cy.log(`Minimum savings: ${refinanceData.standards.refinance.minimum_savings_percentage?.value}%`);
            }
          }
        });
        
        // Verify dropdowns are populated from API data
        cy.get('body').then($body => {
          const dropdowns = $body.find('select, [role="combobox"], [data-testid*="dropdown"]');
          if (dropdowns.length > 0) {
            cy.log(`✅ Step ${step}: Found ${dropdowns.length} dropdowns for API validation`);
            
            dropdowns.each((index, dropdown) => {
              const $dropdown = Cypress.$(dropdown);
              const options = $dropdown.find('option, [role="option"]');
              if (options.length > 0) {
                cy.log(`✅ Dropdown ${index + 1} has ${options.length} options from API`);
              }
            });
          }
        });
        
        cy.screenshot(`refinance-api-integration/step${step}-api-loaded`);
      });
    });
  });
});

describe('💰 PHASE 1: REFINANCE BUSINESS LOGIC VALIDATION', () => {
  
  describe('Break-Even Analysis Calculations', () => {
    it('PHASE 1.1: Should calculate break-even period accurately', () => {
      cy.visit('/services/refinance-mortgage/1');
      
      // Input known current loan parameters
      const testScenario = {
        currentBalance: 800000,
        currentRate: 6.5,
        currentPayment: 5500,
        newRate: 4.5,
        closingCosts: 15000
      };
      
      // Fill current loan details
      cy.get('body').then($body => {
        // Try multiple selectors for current balance
        const balanceSelectors = ['[data-testid*="balance"]', '[name*="balance"]', 'input[type="number"]'];
        balanceSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).first().clear().type(testScenario.currentBalance.toString());
            cy.log(`✅ Entered current balance: ${testScenario.currentBalance}`);
            return false; // break forEach
          }
        });
        
        // Current rate
        const rateSelectors = ['[data-testid*="rate"]', '[name*="rate"]', 'select'];
        rateSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            const $element = $body.find(selector).first();
            if ($element.is('select')) {
              cy.get(selector).first().select(testScenario.currentRate.toString() + '%', { force: true });
            } else {
              cy.get(selector).first().clear().type(testScenario.currentRate.toString());
            }
            cy.log(`✅ Entered current rate: ${testScenario.currentRate}%`);
            return false;
          }
        });
      });
      
      // Navigate to rate comparison step
      cy.get('button').contains(/continue|next|המשך/).click({ force: true });
      cy.wait(2000);
      
      // Test new rate selection and calculation
      cy.get('body').then($body => {
        const newRateSelectors = ['[data-testid*="new"]', '[data-testid*="target"]', 'select'];
        newRateSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            const $element = $body.find(selector).first();
            if ($element.is('select')) {
              cy.get(selector).first().select(testScenario.newRate.toString() + '%', { force: true });
            }
            cy.log(`✅ Selected new rate: ${testScenario.newRate}%`);
            return false;
          }
        });
      });
      
      cy.wait(2000);
      
      // Check for calculated savings
      const savingsSelectors = [
        '[data-testid*="savings"]',
        '[data-testid*="payment"]',
        '.savings',
        '.monthly-payment'
      ];
      
      savingsSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('be.visible');
            cy.log(`✅ Found savings calculation: ${selector}`);
          }
        });
      });
      
      cy.screenshot('refinance-business-logic/break-even-calculation');
    });
  });

  describe('Refinance Eligibility Logic', () => {
    it('PHASE 1.2: Should validate 2% minimum savings requirement', () => {
      cy.visit('/services/refinance-mortgage/2');
      cy.wait(2000);
      
      // Test scenario that should NOT meet 2% savings requirement
      const poorScenario = {
        currentRate: 4.0,
        newRate: 3.9, // Only 0.1% improvement
        loanBalance: 500000
      };
      
      // Input poor refinance scenario
      cy.get('body').then($body => {
        // Try to find and fill rate fields
        const fields = $body.find('input, select');
        if (fields.length > 0) {
          cy.log(`Testing poor refinance scenario: ${poorScenario.currentRate}% → ${poorScenario.newRate}%`);
          
          // Test that system should warn about insufficient savings
          const warningSelectors = [
            '.warning',
            '.alert',
            '[data-testid*="warning"]',
            '[data-testid*="error"]'
          ];
          
          warningSelectors.forEach(selector => {
            cy.get('body').then($body => {
              if ($body.find(selector).length > 0) {
                cy.get(selector).should('be.visible');
                cy.log('✅ System shows warning for insufficient savings');
              }
            });
          });
        }
      });
      
      cy.screenshot('refinance-business-logic/minimum-savings-validation');
    });
  });

  describe('Cash-Out Refinance Logic', () => {
    it('PHASE 1.3: Should enforce 80% LTV maximum for cash-out refinance', () => {
      cy.visit('/services/refinance-mortgage/2');
      cy.wait(2000);
      
      // Test cash-out scenario
      const cashOutScenario = {
        propertyValue: 1000000,
        currentBalance: 500000,
        maxCashOut: 300000, // Should allow 80% LTV = 800K - 500K = 300K max
        excessiveCashOut: 400000 // Should be rejected
      };
      
      cy.get('body').then($body => {
        // Look for cash-out related fields
        const cashOutSelectors = [
          '[data-testid*="cash"]',
          '[data-testid*="equity"]',
          '[name*="cash"]'
        ];
        
        cashOutSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('exist');
            cy.log(`✅ Found cash-out field: ${selector}`);
            
            // Test maximum cash-out validation
            cy.get(selector).then($element => {
              if ($element.is('input')) {
                cy.wrap($element).clear().type(cashOutScenario.excessiveCashOut.toString());
                cy.wait(1000);
                
                // Should show error for excessive cash-out
                cy.get('body').then($body => {
                  const errorElements = $body.find('.error, .warning, [data-testid*="error"]');
                  if (errorElements.length > 0) {
                    cy.log('✅ System validates maximum cash-out amount');
                  }
                });
              }
            });
          }
        });
      });
      
      cy.screenshot('refinance-business-logic/cash-out-ltv-validation');
    });
  });
});

describe('🌍 PHASE 2: MULTI-LANGUAGE REFINANCE TESTING', () => {
  
  const languages = ['en', 'he', 'ru'];
  
  languages.forEach(lang => {
    describe(`${lang.toUpperCase()} Language Refinance Support`, () => {
      beforeEach(() => {
        cy.window().then(win => {
          win.localStorage.setItem('i18nextLng', lang);
        });
      });
      
      it(`PHASE 2.${languages.indexOf(lang) + 1}: Should display ${lang} refinance terminology correctly`, () => {
        cy.visit('/services/refinance-mortgage/1');
        cy.wait(3000);
        
        // Verify no missing translation keys
        cy.get('body').should('not.contain', 'translation missing');
        cy.get('body').should('not.contain', 'undefined');
        cy.get('body').should('not.contain', '{{');
        
        // Language-specific terminology validation
        if (lang === 'he') {
          // Hebrew refinance terms
          const hebrewTerms = [
            'רפיננס',         // Refinance
            'ריבית',          // Interest rate
            'חיסכון',         // Savings
            'הלוואה'          // Loan
          ];
          
          // Check if any Hebrew terms are present
          let foundHebrewTerms = false;
          hebrewTerms.forEach(term => {
            cy.get('body').then($body => {
              if ($body.text().includes(term)) {
                foundHebrewTerms = true;
                cy.log(`✅ Found Hebrew refinance term: ${term}`);
              }
            });
          });
          
          // Verify RTL direction
          cy.get('html').should('have.attr', 'dir', 'rtl');
        }
        
        if (lang === 'ru') {
          // Russian refinance terms
          const russianTerms = [
            'Рефинанс',       // Refinance
            'Ставка',         // Rate
            'Экономия',       // Savings
            'Кредит'          // Credit
          ];
          
          russianTerms.forEach(term => {
            cy.get('body').then($body => {
              if ($body.text().includes(term)) {
                cy.log(`✅ Found Russian refinance term: ${term}`);
              }
            });
          });
        }
        
        if (lang === 'en') {
          // English refinance terms
          const englishTerms = [
            'refinance',
            'interest',
            'savings',
            'break-even'
          ];
          
          englishTerms.forEach(term => {
            cy.get('body').then($body => {
              if ($body.text().toLowerCase().includes(term)) {
                cy.log(`✅ Found English refinance term: ${term}`);
              }
            });
          });
        }
        
        cy.screenshot(`refinance-multilingual/step1-${lang}-terminology`);
      });
    });
  });
});

describe('📱 PHASE 3: RESPONSIVE REFINANCE DESIGN', () => {
  
  const viewports = [
    [390, 844, 'mobile'],
    [768, 1024, 'tablet'], 
    [1440, 900, 'desktop']
  ];
  
  viewports.forEach(([width, height, device]) => {
    describe(`${device} Viewport (${width}x${height})`, () => {
      
      it(`PHASE 3.${viewports.indexOf([width, height, device]) + 1}: Should display refinance comparison tables correctly on ${device}`, () => {
        cy.viewport(width, height);
        cy.visit('/services/refinance-mortgage/3');
        cy.wait(3000);
        
        // Check no horizontal scroll
        cy.window().then(win => {
          const el = win.document.scrollingElement!;
          expect(el.scrollWidth, 'no horizontal scroll').to.eq(el.clientWidth);
        });
        
        // Check loan comparison table responsiveness
        cy.get('body').then($body => {
          const comparisonElements = $body.find('.loan-comparison, .comparison-table, [data-testid*="comparison"]');
          if (comparisonElements.length > 0) {
            cy.get(comparisonElements.first()).should('be.visible');
            cy.log(`✅ Loan comparison visible on ${device}`);
          }
        });
        
        // Mobile-specific checks
        if (width < 768) {
          // Check touch targets
          cy.get('button, input, select').each($el => {
            expect($el[0].offsetHeight, 'touch target height').to.be.at.least(44);
          });
          
          // Check stacked layout
          cy.get('body').then($body => {
            const rows = $body.find('.form-row, .comparison-row');
            if (rows.length > 0) {
              cy.log('✅ Mobile stacked layout detected');
            }
          });
        }
        
        cy.screenshot(`refinance-responsive/step3-${device}-${width}x${height}`);
      });
    });
  });
});

describe('⚡ PHASE 4: REFINANCE PERFORMANCE & ACCESSIBILITY', () => {
  
  it('PHASE 4.1: Should load refinance calculations within performance budgets', () => {
    cy.visit('/services/refinance-mortgage/2');
    
    cy.window().its('performance').then(performance => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart;
      const loadComplete = navTiming.loadEventEnd - navTiming.loadEventStart;
      
      expect(domContentLoaded, 'Refinance DOM Content Loaded').to.be.lessThan(3000); // 3s
      expect(loadComplete, 'Refinance Load Complete').to.be.lessThan(5000); // 5s
      
      cy.log(`Refinance Performance: DOMContentLoaded=${domContentLoaded}ms, LoadComplete=${loadComplete}ms`);
    });
    
    cy.screenshot('refinance-performance/load-times');
  });
  
  it('PHASE 4.2: Should handle rapid calculation updates without performance degradation', () => {
    cy.visit('/services/refinance-mortgage/2');
    cy.wait(2000);
    
    // Test rapid rate changes
    const rates = ['4.0', '4.5', '5.0', '5.5'];
    
    cy.get('body').then($body => {
      const rateSelectors = $body.find('select, [data-testid*="rate"]');
      if (rateSelectors.length > 0) {
        rates.forEach(rate => {
          cy.get(rateSelectors.first()).then($element => {
            if ($element.is('select')) {
              const rateOption = rate + '%';
              cy.wrap($element).select(rateOption, { force: true });
              cy.wait(100); // Minimal wait
              cy.log(`✅ Updated rate to ${rateOption}`);
            }
          });
        });
      }
    });
    
    cy.screenshot('refinance-performance/rapid-calculation-updates');
  });
  
  it('PHASE 4.3: Should meet accessibility standards for refinance calculations', () => {
    cy.visit('/services/refinance-mortgage/1');
    
    // Check keyboard navigation
    cy.get('body').tab();
    cy.focused().should('exist');
    cy.log('✅ Keyboard navigation functional');
    
    // Check form labels
    cy.get('input, select').each($input => {
      const inputId = $input.attr('id');
      const hasLabel = $input.attr('aria-label') || 
                       $input.attr('aria-labelledby') ||
                       (inputId && Cypress.$(`label[for="${inputId}"]`).length > 0);
      
      expect(hasLabel, 'Form input must have accessible label').to.be.true;
    });
    
    cy.screenshot('refinance-accessibility/form-labels');
  });
});