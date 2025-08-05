/**
 * Comprehensive test for all 4 calculator processes
 * Checks if each process can reach step 4 and reports translation issues
 */

describe('All Calculator Processes - Translation and Error Check', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  const processes = [
    { name: 'Calculate Mortgage', path: '/services/calculate-mortgage/1' },
    { name: 'Calculate Credit', path: '/services/calculate-credit/1' },
    { name: 'Refinance Mortgage', path: '/services/refinance-mortgage/1' },
    { name: 'Refinance Credit', path: '/services/refinance-credit/1' }
  ];

  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  processes.forEach((process) => {
    it(`${process.name} - should reach step 4 and check for translation issues`, () => {
      const results = {
        processName: process.name,
        reachedStep4: false,
        translationIssues: [],
        errors: [],
        missingTranslations: [],
        consoleErrors: []
      };

      // Capture console errors
      cy.on('window:console', (msg) => {
        if (msg.type === 'error') {
          results.consoleErrors.push(msg.text);
        }
      });

      // Visit the process
      cy.visit(process.path);
      cy.wait(5000);
      
      cy.log(`🔍 Testing ${process.name}`);
      
      // Check for missing translations on step 1
      cy.get('body').then($body => {
        // Look for common translation missing patterns
        const bodyText = $body.text();
        if (bodyText.includes('translation.json')) {
          results.missingTranslations.push('Translation file reference found in UI');
        }
        if (bodyText.match(/[a-z_]+\.[a-z_]+/g)) {
          const potentialKeys = bodyText.match(/[a-z_]+\.[a-z_]+/g);
          potentialKeys.forEach(key => {
            if (key.includes('_')) {
              results.missingTranslations.push(`Potential translation key visible: ${key}`);
            }
          });
        }
      });

      // Generic form filling for step 1
      cy.get('input[type="text"]').first().then($input => {
        if ($input.length) {
          cy.wrap($input).clear().type('2000000');
        }
      });

      // Fill dropdowns
      cy.get('.react-dropdown-select, [class*="dropdown"]:not(input), select').each(($el, index) => {
        if (index < 6) {
          cy.wrap($el).click({ force: true });
          cy.wait(300);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
            .first()
            .click({ force: true });
          cy.wait(300);
        }
      });

      // Additional inputs based on process type
      if (process.name.includes('Mortgage')) {
        // Try to fill initial payment
        cy.get('input[type="text"]').eq(1).then($input => {
          if ($input.length) {
            cy.wrap($input).clear().type('500000');
          }
        });
      }

      // Click continue
      cy.get('button').then($buttons => {
        const continueBtn = Array.from($buttons).find(btn => {
          const text = btn.textContent || '';
          return (text.includes('הבא') || text.includes('המשך') || text.includes('Next') || text.includes('Continue')) && 
                 !btn.disabled;
        });
        
        if (continueBtn) {
          cy.wrap(continueBtn).click();
        }
      });

      cy.wait(3000);

      // Handle authentication if needed
      cy.get('body').then($body => {
        if ($body.find('input[type="tel"]').length > 0) {
          cy.get('input[type="tel"]').first().type(testPhone);
          cy.wait(500);
          
          cy.get('button').then($btns => {
            const sendBtn = Array.from($btns).find(btn => 
              btn.textContent && (btn.textContent.includes('קבל') || btn.textContent.includes('שלח') || btn.textContent.includes('Send'))
            );
            if (sendBtn) cy.wrap(sendBtn).click();
          });
          
          cy.wait(2000);
          cy.get('input').last().type(testOTP);
          
          cy.get('button').then($btns => {
            const verifyBtn = Array.from($btns).find(btn => 
              btn.textContent && (btn.textContent.includes('אמת') || btn.textContent.includes('אישור') || btn.textContent.includes('Verify'))
            );
            if (verifyBtn) cy.wrap(verifyBtn).click();
          });
          
          cy.wait(3000);
        }
      });

      // Quick fill remaining steps to reach step 4
      // Step 2
      cy.url().then(url => {
        if (url.includes('/2')) {
          cy.log('Step 2 reached');
          
          // Fill required fields quickly
          cy.get('input[type="text"]').first().type('Test User');
          cy.get('input').eq(1).type('01/01/1990');
          
          // Fill dropdowns with first option
          cy.get('.react-dropdown-select, [class*="dropdown"], select').each(($el, index) => {
            if (index < 5) {
              cy.wrap($el).click({ force: true });
              cy.wait(200);
              cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
                .first()
                .click({ force: true });
            }
          });
          
          // Continue
          cy.get('button').last().click({ force: true });
          cy.wait(3000);
        }
      });

      // Step 3
      cy.url().then(url => {
        if (url.includes('/3')) {
          cy.log('Step 3 reached');
          
          // Select employed
          cy.get('.react-dropdown-select, [class*="dropdown"], select').first().click({ force: true });
          cy.wait(300);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
            .first()
            .click({ force: true });
          
          // Income
          cy.get('input[type="text"], input[type="number"]').first().type('20000');
          
          // Fill remaining dropdowns
          cy.get('.react-dropdown-select, [class*="dropdown"], select').each(($el, index) => {
            if (index > 0 && index < 3) {
              cy.wrap($el).click({ force: true });
              cy.wait(200);
              cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
                .first()
                .click({ force: true });
            }
          });
          
          // Continue
          cy.get('button').last().click({ force: true });
          cy.wait(5000);
        }
      });

      // Check if we reached step 4
      cy.url().then(url => {
        if (url.includes('/4')) {
          results.reachedStep4 = true;
          cy.log(`✅ ${process.name} - Reached Step 4!`);
          
          // Check for translation issues on step 4
          cy.get('body').then($body => {
            const bodyText = $body.text();
            
            // Check for untranslated keys
            const translationKeyPattern = /[a-z_]+_[a-z_]+_[a-z_]+/g;
            const matches = bodyText.match(translationKeyPattern);
            if (matches) {
              matches.forEach(match => {
                if (!match.includes('class') && !match.includes('data')) {
                  results.translationIssues.push(`Step 4: Possible untranslated key: ${match}`);
                }
              });
            }
            
            // Check for mixed languages
            const hasHebrew = /[\u0590-\u05FF]/.test(bodyText);
            const hasEnglish = /[a-zA-Z]{5,}/.test(bodyText);
            const hasRussian = /[\u0400-\u04FF]/.test(bodyText);
            
            const languageCount = [hasHebrew, hasEnglish, hasRussian].filter(Boolean).length;
            if (languageCount > 1) {
              results.translationIssues.push('Mixed languages detected on step 4');
            }
          });
        } else {
          results.errors.push(`Failed to reach step 4. Current URL: ${url}`);
          cy.log(`❌ ${process.name} - Failed to reach Step 4`);
        }
      });

      // Log results
      cy.log('📊 Test Results:', JSON.stringify(results, null, 2));
      
      // Take final screenshot
      cy.screenshot(`${process.name.replace(/\s/g, '-')}-final-state`);
      
      // Assert that we reached step 4
      cy.wrap(results.reachedStep4).should('be.true', `${process.name} should reach step 4`);
      
      // Log any issues found
      if (results.translationIssues.length > 0) {
        cy.log('⚠️ Translation Issues:', results.translationIssues.join(', '));
      }
      
      if (results.errors.length > 0) {
        cy.log('❌ Errors:', results.errors.join(', '));
      }
      
      if (results.consoleErrors.length > 0) {
        cy.log('🔴 Console Errors:', results.consoleErrors.join(', '));
      }
    });
  });

  after(() => {
    cy.log('🏁 All process tests completed');
  });
});