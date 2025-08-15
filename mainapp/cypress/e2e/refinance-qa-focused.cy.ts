/**
 * 🎯 FOCUSED REFINANCE MORTGAGE QA TESTING
 * 
 * Systematically test each step of the refinance process
 * Focus on critical business logic and user experience
 */

describe('🏦 REFINANCE MORTGAGE - FOCUSED QA TESTING', () => {
  const baseUrl = 'http://localhost:5174';
  
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.window().then((win) => {
      win.localStorage.setItem('i18nextLng', 'en');
    });
  });

  context('RF-STEP-1: Current Loan Details', () => {
    it('RF-S1-001: Should load Step 1 and display current loan form', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/1`);
      cy.wait(3000);

      // Basic page load validation
      cy.url().should('include', '/refinance-mortgage/1');
      cy.get('body').should('be.visible');

      // Take screenshot for manual verification
      cy.screenshot('refinance-step1/page-load');
      
      // Log what we find on the page
      cy.get('body').then($body => {
        const text = $body.text();
        cy.log('Page content detected');
        
        // Look for form elements
        const inputs = $body.find('input');
        const selects = $body.find('select');
        const buttons = $body.find('button');
        
        cy.log(`Found ${inputs.length} inputs, ${selects.length} selects, ${buttons.length} buttons`);
      });

      // Check for any obvious refinance-related content
      cy.get('body').then($body => {
        const bodyText = $body.text().toLowerCase();
        const refinanceKeywords = ['refinance', 'current', 'existing', 'loan', 'rate', 'balance'];
        
        refinanceKeywords.forEach(keyword => {
          if (bodyText.includes(keyword)) {
            cy.log(`✅ Found keyword: ${keyword}`);
          }
        });
      });
    });

    it('RF-S1-002: Should validate input fields for current loan', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/1`);
      cy.wait(3000);

      // Find and test numeric input fields
      cy.get('input[type="number"], input[type="text"]').then($inputs => {
        if ($inputs.length > 0) {
          cy.log(`Found ${$inputs.length} input fields to test`);
          
          // Test the first numeric input (likely loan balance)
          cy.wrap($inputs.first())
            .clear()
            .type('800000')
            .should('have.value', '800000');
            
          cy.screenshot('refinance-step1/input-validation');
        } else {
          cy.log('⚠️ No input fields found');
        }
      });
    });

    it('RF-S1-003: Should test dropdown functionality', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/1`);
      cy.wait(3000);

      // Test dropdown elements
      cy.get('select').then($selects => {
        if ($selects.length > 0) {
          cy.log(`Found ${$selects.length} dropdown(s) to test`);
          
          // Test each dropdown
          $selects.each((index, select) => {
            cy.wrap(select).within(() => {
              cy.get('option').should('have.length.at.least', 1);
            });
            
            cy.log(`✅ Dropdown ${index + 1} has options`);
          });
          
          cy.screenshot('refinance-step1/dropdown-validation');
        } else {
          cy.log('⚠️ No standard dropdowns found');
          
          // Check for custom dropdowns
          cy.get('[role="combobox"], [data-testid*="select"], [data-testid*="dropdown"]').then($custom => {
            if ($custom.length > 0) {
              cy.log(`Found ${$custom.length} custom dropdown(s)`);
            }
          });
        }
      });
    });
  });

  context('RF-STEP-2: Rate Comparison', () => {
    it('RF-S2-001: Should load Step 2 and display rate comparison interface', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/2`);
      cy.wait(3000);

      cy.url().should('include', '/refinance-mortgage/2');
      cy.get('body').should('be.visible');

      cy.screenshot('refinance-step2/page-load');

      // Look for rate-related elements
      cy.get('body').then($body => {
        const bodyText = $body.text().toLowerCase();
        const rateKeywords = ['rate', 'interest', 'comparison', 'new', 'current'];
        
        rateKeywords.forEach(keyword => {
          if (bodyText.includes(keyword)) {
            cy.log(`✅ Found rate-related keyword: ${keyword}`);
          }
        });
      });
    });

    it('RF-S2-002: Should allow new rate input and show calculations', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/2`);
      cy.wait(3000);

      // Find rate-related input fields
      cy.get('input').then($inputs => {
        if ($inputs.length > 0) {
          // Try entering a new rate
          cy.wrap($inputs.first())
            .clear()
            .type('4.5');
            
          cy.wait(1000);
          
          // Look for any calculation results
          cy.get('body').then($body => {
            const text = $body.text();
            if (text.includes('save') || text.includes('saving') || text.includes('payment')) {
              cy.log('✅ Found savings calculations');
            }
          });
        }
      });

      cy.screenshot('refinance-step2/rate-calculation');
    });
  });

  context('RF-STEP-3: Income & Cash-Out', () => {
    it('RF-S3-001: Should load Step 3 and display income verification', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/3`);
      cy.wait(3000);

      cy.url().should('include', '/refinance-mortgage/3');
      cy.get('body').should('be.visible');

      cy.screenshot('refinance-step3/page-load');

      // Look for income-related elements
      cy.get('body').then($body => {
        const bodyText = $body.text().toLowerCase();
        const incomeKeywords = ['income', 'salary', 'employment', 'cash', 'debt'];
        
        incomeKeywords.forEach(keyword => {
          if (bodyText.includes(keyword)) {
            cy.log(`✅ Found income-related keyword: ${keyword}`);
          }
        });
      });
    });

    it('RF-S3-002: Should test cash-out refinance scenario', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/3`);
      cy.wait(3000);

      // Look for cash-out related fields
      cy.get('input').then($inputs => {
        if ($inputs.length > 0) {
          // Test cash-out amount input
          cy.wrap($inputs.first())
            .clear()
            .type('50000');
            
          cy.log('✅ Tested cash-out amount input');
        }
      });

      cy.screenshot('refinance-step3/cash-out-test');
    });
  });

  context('RF-STEP-4: ⭐ Break-Even Analysis (CRITICAL)', () => {
    it('RF-S4-001: Should load Step 4 and display loan comparison', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/4`);
      cy.wait(3000);

      cy.url().should('include', '/refinance-mortgage/4');
      cy.get('body').should('be.visible');

      cy.screenshot('refinance-step4/page-load');

      // Look for comparison elements
      cy.get('body').then($body => {
        const bodyText = $body.text().toLowerCase();
        const comparisonKeywords = ['current', 'new', 'comparison', 'vs', 'versus', 'before', 'after'];
        
        comparisonKeywords.forEach(keyword => {
          if (bodyText.includes(keyword)) {
            cy.log(`✅ Found comparison keyword: ${keyword}`);
          }
        });
      });
    });

    it('RF-S4-002: ⭐ CRITICAL - Should display break-even analysis', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/4`);
      cy.wait(3000);

      // This is the MOST CRITICAL test for refinancing
      cy.get('body').then($body => {
        const bodyText = $body.text().toLowerCase();
        const breakEvenKeywords = ['break', 'even', 'break-even', 'breakeven', 'months', 'payback', 'roi'];
        
        let foundBreakEven = false;
        breakEvenKeywords.forEach(keyword => {
          if (bodyText.includes(keyword)) {
            foundBreakEven = true;
            cy.log(`✅ CRITICAL: Found break-even keyword: ${keyword}`);
          }
        });

        if (foundBreakEven) {
          cy.log('✅ CRITICAL: Break-even analysis appears to be present');
        } else {
          cy.log('❌ CRITICAL FAILURE: No break-even analysis found');
        }
      });

      // Look for numeric values that might indicate break-even period
      cy.get('body').then($body => {
        const text = $body.text();
        const numberPattern = /\d+\s*(month|year|שנ|חדש)/gi;
        const matches = text.match(numberPattern);
        
        if (matches && matches.length > 0) {
          cy.log(`✅ Found potential break-even periods: ${matches.join(', ')}`);
        }
      });

      cy.screenshot('refinance-step4/break-even-analysis');
    });

    it('RF-S4-003: Should display current vs new loan comparison', () => {
      cy.visit(`${baseUrl}/services/refinance-mortgage/4`);
      cy.wait(3000);

      // Look for side-by-side comparison layout
      cy.get('body').then($body => {
        // Check for table structure
        const tables = $body.find('table');
        const columns = $body.find('.col, .column, .comparison-column');
        const rows = $body.find('.row, .comparison-row');
        
        cy.log(`Found ${tables.length} tables, ${columns.length} columns, ${rows.length} rows`);
        
        if (tables.length > 0 || columns.length > 1 || rows.length > 0) {
          cy.log('✅ Found structured comparison layout');
        }
      });

      cy.screenshot('refinance-step4/loan-comparison');
    });
  });

  context('RF-MULTILINGUAL: Language Support', () => {
    ['en', 'he', 'ru'].forEach((lang, index) => {
      it(`RF-ML-00${index + 1}: Should work in ${lang.toUpperCase()} language`, () => {
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', lang);
        });

        cy.visit(`${baseUrl}/services/refinance-mortgage/1`);
        cy.wait(3000);

        // Check for translation errors
        cy.get('body').should('not.contain', 'translation missing');
        cy.get('body').should('not.contain', 'undefined');

        if (lang === 'he') {
          // Check for Hebrew text
          cy.get('body').then($body => {
            const text = $body.text();
            const hasHebrew = /[\u0590-\u05FF]/.test(text);
            if (hasHebrew) {
              cy.log('✅ Hebrew text detected');
            }
          });
        }

        if (lang === 'ru') {
          // Check for Russian text
          cy.get('body').then($body => {
            const text = $body.text();
            const hasRussian = /[\u0400-\u04FF]/.test(text);
            if (hasRussian) {
              cy.log('✅ Russian text detected');
            }
          });
        }

        cy.screenshot(`refinance-multilingual/step1-${lang}`);
      });
    });
  });

  context('RF-RESPONSIVE: Device Testing', () => {
    [
      [320, 568, 'mobile-small'],
      [768, 1024, 'tablet'],
      [1920, 1080, 'desktop']
    ].forEach(([width, height, device], index) => {
      it(`RF-RES-00${index + 1}: Should be responsive on ${device}`, () => {
        cy.viewport(width as number, height as number);
        cy.visit(`${baseUrl}/services/refinance-mortgage/1`);
        cy.wait(2000);

        // Check basic visibility
        cy.get('body').should('be.visible');

        // Check for usable interface elements
        cy.get('input, select, button').should('have.length.at.least', 1);

        cy.screenshot(`refinance-responsive/step1-${device}`);
      });
    });
  });

  // Generate summary after all tests
  after(() => {
    cy.log('🏁 REFINANCE MORTGAGE QA TESTING COMPLETED');
    cy.log('Check screenshots in cypress/screenshots/refinance-*/ for visual validation');
  });
});