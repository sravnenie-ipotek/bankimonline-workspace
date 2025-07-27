/**
 * Comprehensive test for all 4 calculator processes
 * Fills all required data to reach step 4 and checks for translation issues
 */

describe('All Processes - Full Journey to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  const processes = [
    { 
      name: 'Calculate Mortgage', 
      path: '/services/calculate-mortgage/1',
      type: 'mortgage'
    },
    { 
      name: 'Calculate Credit', 
      path: '/services/calculate-credit/1',
      type: 'credit'
    },
    { 
      name: 'Refinance Mortgage', 
      path: '/services/refinance-mortgage/1',
      type: 'refinance-mortgage'
    },
    { 
      name: 'Refinance Credit', 
      path: '/services/refinance-credit/1',
      type: 'refinance-credit'
    }
  ];

  // Global report
  const globalReport = {
    timestamp: new Date().toISOString(),
    processes: []
  };

  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  processes.forEach((process) => {
    it(`${process.name} - Complete journey to step 4`, () => {
      const processReport = {
        name: process.name,
        type: process.type,
        stepsReached: {
          step1: false,
          step2: false,
          step3: false,
          step4: false
        },
        translationIssues: [],
        errors: [],
        warnings: [],
        mixedLanguages: []
      };

      // Capture console errors
      cy.on('window:console', (msg) => {
        if (msg.type === 'error') {
          processReport.errors.push(`Console error: ${msg.text}`);
        }
      });

      // Function to check for translation issues
      const checkTranslations = (stepNumber) => {
        cy.get('body').then($body => {
          const bodyText = $body.text();
          
          // Check for untranslated keys
          const keyPatterns = [
            /[a-z_]+_[a-z_]+_[a-z_]+/g,
            /translation\.[a-z_]+/gi,
            /\{\{[^}]+\}\}/g
          ];
          
          keyPatterns.forEach(pattern => {
            const matches = bodyText.match(pattern) || [];
            matches.forEach(match => {
              if (!match.includes('class') && !match.includes('data') && !match.includes('test')) {
                processReport.translationIssues.push({
                  step: stepNumber,
                  issue: `Possible untranslated key: ${match}`
                });
              }
            });
          });
          
          // Check for mixed languages
          const hasHebrew = /[\u0590-\u05FF]/.test(bodyText);
          const hasEnglish = /[a-zA-Z]{5,}/.test(bodyText);
          const hasRussian = /[\u0400-\u04FF]/.test(bodyText);
          
          if (hasHebrew && hasEnglish) {
            // Check for specific English text that shouldn't be there
            if (bodyText.includes('Select city') || bodyText.includes('Next') || bodyText.includes('Previous')) {
              processReport.mixedLanguages.push({
                step: stepNumber,
                issue: 'English text mixed with Hebrew UI'
              });
            }
          }
        });
      };

      // Start the process
      cy.visit(process.path);
      cy.wait(3000);
      
      // ========== STEP 1 ==========
      cy.url().then(url => {
        if (url.includes('/1')) {
          processReport.stepsReached.step1 = true;
          cy.log(`✅ ${process.name} - Step 1 loaded`);
          checkTranslations(1);
          
          // Fill step 1 based on process type
          if (process.type.includes('mortgage')) {
            // Property value
            cy.get('input[type="text"]').first().clear().type('2500000');
            
            // City dropdown
            cy.get('.react-dropdown-select, [class*="dropdown"]').first().click({ force: true });
            cy.wait(500);
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
            
            // When do you need money
            cy.get('.react-dropdown-select, [class*="dropdown"]').eq(1).click({ force: true });
            cy.wait(500);
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
            
            // Initial payment (if exists)
            cy.get('input[type="text"]').eq(1).then($input => {
              if ($input.length) {
                cy.wrap($input).clear().type('625000');
              }
            });
            
            // Property type
            cy.get('.react-dropdown-select, [class*="dropdown"]').eq(2).click({ force: true });
            cy.wait(500);
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
            
            // First home
            cy.get('.react-dropdown-select, [class*="dropdown"]').eq(3).click({ force: true });
            cy.wait(500);
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
            
            // Property ownership
            cy.get('.react-dropdown-select, [class*="dropdown"]').eq(4).click({ force: true });
            cy.wait(500);
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
            
          } else if (process.type.includes('credit')) {
            // Loan amount
            cy.get('input[type="text"]').first().clear().type('50000');
            
            // Purpose dropdown
            cy.get('.react-dropdown-select, [class*="dropdown"]').first().click({ force: true });
            cy.wait(500);
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
            
            // Fill any additional dropdowns
            for (let i = 1; i < 3; i++) {
              cy.get('.react-dropdown-select, [class*="dropdown"]').eq(i).then($el => {
                if ($el.length) {
                  cy.wrap($el).click({ force: true });
                  cy.wait(300);
                  cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
                }
              });
            }
          }
          
          // Period and monthly payment sliders if they exist
          cy.get('input[type="range"]').then($sliders => {
            if ($sliders.length > 0) {
              cy.wrap($sliders[0]).invoke('val', 20).trigger('input').trigger('change');
            }
            if ($sliders.length > 1) {
              cy.wrap($sliders[1]).invoke('val', 5000).trigger('input').trigger('change');
            }
          });
        }
      });

      // Click continue
      cy.get('button').then($buttons => {
        const continueBtn = Array.from($buttons).find(btn => {
          const text = btn.textContent || '';
          return (text.includes('הבא') || text.includes('המשך') || text.includes('Next')) && !btn.disabled;
        });
        if (continueBtn) cy.wrap(continueBtn).click({ force: true });
      });

      cy.wait(3000);

      // Handle authentication
      cy.get('body').then($body => {
        if ($body.find('input[type="tel"]').length > 0) {
          cy.log('🔐 Handling authentication');
          cy.get('input[type="tel"]').type(testPhone);
          cy.wait(500);
          
          cy.get('button').then($btns => {
            const sendBtn = Array.from($btns).find(btn => 
              btn.textContent && (btn.textContent.includes('קבל') || btn.textContent.includes('שלח'))
            );
            if (sendBtn) cy.wrap(sendBtn).click();
          });
          
          cy.wait(2000);
          cy.get('input').last().type(testOTP);
          
          cy.get('button').then($btns => {
            const verifyBtn = Array.from($btns).find(btn => 
              btn.textContent && (btn.textContent.includes('אמת') || btn.textContent.includes('אישור'))
            );
            if (verifyBtn) cy.wrap(verifyBtn).click();
          });
          
          cy.wait(3000);
        }
      });

      // ========== STEP 2 ==========
      cy.url().then(url => {
        if (url.includes('/2')) {
          processReport.stepsReached.step2 = true;
          cy.log(`✅ ${process.name} - Step 2 reached`);
          checkTranslations(2);
          
          // Name
          cy.get('input[name="nameSurname"], input[type="text"]').first().clear().type('Test User מבדק');
          
          // Birthday
          cy.get('input[name="birthday"], input[type="date"]').first().then($input => {
            if ($input.attr('type') === 'date') {
              cy.wrap($input).type('1985-05-15');
            } else {
              cy.wrap($input).type('15/05/1985');
            }
          });
          
          // Education
          cy.get('.react-dropdown-select, [class*="dropdown"]').first().click({ force: true });
          cy.wait(300);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
          
          // Additional citizenships - No
          cy.get('.react-dropdown-select, [class*="dropdown"]').eq(1).click({ force: true });
          cy.wait(300);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').then($items => {
            const noOption = Array.from($items).find(item => 
              item.textContent && (item.textContent.includes('לא') || item.textContent.includes('No'))
            );
            if (noOption) cy.wrap(noOption).click({ force: true });
            else cy.wrap($items.first()).click({ force: true });
          });
          
          // Fill remaining dropdowns with "No" where applicable
          for (let i = 2; i < 7; i++) {
            cy.get('.react-dropdown-select, [class*="dropdown"]').eq(i).then($el => {
              if ($el.length) {
                cy.wrap($el).click({ force: true });
                cy.wait(200);
                cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').then($items => {
                  const noOption = Array.from($items).find(item => 
                    item.textContent && (item.textContent.includes('לא') || item.textContent.includes('No'))
                  );
                  if (noOption && i > 2) {
                    cy.wrap(noOption).click({ force: true });
                  } else {
                    cy.wrap($items.first()).click({ force: true });
                  }
                });
              }
            });
          }
          
          // Number of borrowers
          cy.get('input[name="borrowers"]').then($input => {
            if ($input.length) {
              cy.wrap($input).clear().type('1');
            }
          });
          
          // Family status
          cy.get('.react-dropdown-select, [class*="dropdown"]').last().click({ force: true });
          cy.wait(300);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
        }
      });

      // Continue to step 3
      cy.get('button').then($buttons => {
        const continueBtn = Array.from($buttons).find(btn => {
          const text = btn.textContent || '';
          return (text.includes('הבא') || text.includes('המשך')) && !btn.disabled;
        });
        if (continueBtn) cy.wrap(continueBtn).click({ force: true });
      });

      cy.wait(3000);

      // ========== STEP 3 ==========
      cy.url().then(url => {
        if (url.includes('/3')) {
          processReport.stepsReached.step3 = true;
          cy.log(`✅ ${process.name} - Step 3 reached`);
          checkTranslations(3);
          
          // Main source of income - Employed
          cy.get('.react-dropdown-select, [class*="dropdown"]').first().click({ force: true });
          cy.wait(500);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').then($items => {
            const employedOption = Array.from($items).find(item => 
              item.textContent && (item.textContent.includes('שכיר') || item.textContent.includes('Employed'))
            );
            if (employedOption) cy.wrap(employedOption).click({ force: true });
            else cy.wrap($items.first()).click({ force: true });
          });
          
          cy.wait(1000); // Wait for dynamic fields
          
          // Monthly income
          cy.get('input[name="monthlyIncome"], input[type="text"], input[type="number"]').first().clear().type('25000');
          
          // Start date
          cy.get('input[name="startDate"], input[type="date"]').first().then($input => {
            if ($input.length) {
              if ($input.attr('type') === 'date') {
                cy.wrap($input).type('2018-01-01');
              } else {
                cy.wrap($input).type('01/01/2018');
              }
            }
          });
          
          // Field of activity
          cy.get('.react-dropdown-select, [class*="dropdown"]').eq(1).click({ force: true });
          cy.wait(300);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
          
          // Profession
          cy.get('input[name="profession"]').then($input => {
            if ($input.length) {
              cy.wrap($input).type('Software Engineer');
            }
          });
          
          // Company name
          cy.get('input[name="companyName"]').then($input => {
            if ($input.length) {
              cy.wrap($input).type('Tech Company Ltd');
            }
          });
          
          // Additional income - No
          cy.get('.react-dropdown-select, [class*="dropdown"]').eq(2).click({ force: true });
          cy.wait(300);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
          
          // Obligations - No
          cy.get('.react-dropdown-select, [class*="dropdown"]').eq(3).click({ force: true });
          cy.wait(300);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
        }
      });

      // Continue to step 4
      cy.get('button').then($buttons => {
        const continueBtn = Array.from($buttons).find(btn => {
          const text = btn.textContent || '';
          return (text.includes('הבא') || text.includes('המשך')) && !btn.disabled;
        });
        if (continueBtn) cy.wrap(continueBtn).click({ force: true });
      });

      cy.wait(5000); // Wait for API calls

      // ========== STEP 4 ==========
      cy.url().then(url => {
        if (url.includes('/4')) {
          processReport.stepsReached.step4 = true;
          cy.log(`🎉 ${process.name} - Step 4 reached!`);
          checkTranslations(4);
          
          // Check for bank offers
          cy.get('body').then($body => {
            const hasBank = $body.text().includes('בנק') || 
                           $body.find('[class*="bank"]').length > 0 ||
                           $body.find('[class*="card"]').length > 0;
            
            if (!hasBank) {
              processReport.warnings.push('No bank offers visible on step 4');
            } else {
              cy.log('✅ Bank offers visible');
            }
          });
          
          // Take screenshot of final state
          cy.screenshot(`${process.name.replace(/\s/g, '-')}-step4-final`);
        } else {
          processReport.errors.push(`Failed to reach step 4. Final URL: ${url}`);
        }
      });

      // Add to global report
      globalReport.processes.push(processReport);
      
      // Log process summary
      cy.log('📊 Process Summary:');
      cy.log(`Steps reached: ${Object.values(processReport.stepsReached).filter(Boolean).length}/4`);
      cy.log(`Translation issues: ${processReport.translationIssues.length}`);
      cy.log(`Errors: ${processReport.errors.length}`);
    });
  });

  after(() => {
    // Generate final report
    cy.log('\n========== FINAL REPORT ==========\n');
    
    globalReport.processes.forEach(process => {
      cy.log(`\n${process.name}:`);
      cy.log(`  ✓ Steps completed: ${Object.values(process.stepsReached).filter(Boolean).length}/4`);
      cy.log(`  ✓ Reached Step 4: ${process.stepsReached.step4 ? 'YES ✅' : 'NO ❌'}`);
      
      if (process.translationIssues.length > 0) {
        cy.log(`  ⚠️  Translation Issues (${process.translationIssues.length}):`);
        process.translationIssues.forEach(issue => {
          cy.log(`     - Step ${issue.step}: ${issue.issue}`);
        });
      }
      
      if (process.mixedLanguages.length > 0) {
        cy.log(`  ⚠️  Mixed Languages (${process.mixedLanguages.length}):`);
        process.mixedLanguages.forEach(issue => {
          cy.log(`     - Step ${issue.step}: ${issue.issue}`);
        });
      }
      
      if (process.errors.length > 0) {
        cy.log(`  ❌ Errors (${process.errors.length}):`);
        process.errors.forEach(error => {
          cy.log(`     - ${error}`);
        });
      }
      
      if (process.warnings.length > 0) {
        cy.log(`  ⚠️  Warnings (${process.warnings.length}):`);
        process.warnings.forEach(warning => {
          cy.log(`     - ${warning}`);
        });
      }
    });
    
    // Save detailed report
    cy.writeFile('cypress/reports/all-processes-full-report.json', globalReport);
    cy.log('\n✅ Full report saved to: cypress/reports/all-processes-full-report.json');
  });
});