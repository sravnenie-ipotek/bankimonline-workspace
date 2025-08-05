/**
 * Quick check for all 4 calculator processes
 * Focus on reaching step 4 and identifying translation issues
 */

describe('Quick Process Check - All 4 Calculators', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  const processes = [
    { name: 'Calculate Mortgage', path: '/services/calculate-mortgage/1', id: 'calc-mortgage' },
    { name: 'Calculate Credit', path: '/services/calculate-credit/1', id: 'calc-credit' },
    { name: 'Refinance Mortgage', path: '/services/refinance-mortgage/1', id: 'ref-mortgage' },
    { name: 'Refinance Credit', path: '/services/refinance-credit/1', id: 'ref-credit' }
  ];

  // Test results collection
  const testResults = {
    summary: [],
    translationIssues: [],
    errors: []
  };

  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  processes.forEach((process) => {
    it(`${process.name} - Quick navigation to step 4`, () => {
      const processResult = {
        name: process.name,
        steps: {
          step1: false,
          step2: false,
          step3: false,
          step4: false
        },
        issues: []
      };

      // Visit process
      cy.visit(process.path);
      cy.wait(3000);
      
      // Check Step 1 loaded
      cy.url().then(url => {
        if (url.includes('/1')) {
          processResult.steps.step1 = true;
          cy.log(`✅ ${process.name} - Step 1 loaded`);
          
          // Check for translation issues
          cy.get('body').then($body => {
            const text = $body.text();
            // Look for translation keys pattern
            if (text.match(/[a-z]+_[a-z]+_[a-z]+/g)) {
              const keys = text.match(/[a-z]+_[a-z]+_[a-z]+/g);
              keys.forEach(key => {
                if (!key.includes('class') && !key.includes('data') && !key.includes('test')) {
                  processResult.issues.push(`Translation key visible: ${key}`);
                }
              });
            }
          });
        }
      });

      // Quick fill Step 1
      cy.get('input[type="text"]').first().then($input => {
        if ($input.length) {
          cy.wrap($input).clear().type('2000000', { delay: 0 });
        }
      });

      // Fill first 4 dropdowns quickly
      for (let i = 0; i < 4; i++) {
        cy.get('.react-dropdown-select, [class*="dropdown"]:not(input)').eq(i).then($el => {
          if ($el.length) {
            cy.wrap($el).click({ force: true });
            cy.wait(200);
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
          }
        });
      }

      // Continue to next step
      cy.get('button').filter((_, el) => {
        const text = el.textContent || '';
        return text.includes('הבא') || text.includes('Next') || text.includes('Continue');
      }).first().click({ force: true });

      cy.wait(2000);

      // Handle auth modal if appears
      cy.get('body').then($body => {
        if ($body.find('input[type="tel"]').length > 0) {
          cy.get('input[type="tel"]').type(testPhone, { delay: 0 });
          cy.get('button').contains(/שלח|Send/i).click();
          cy.wait(1000);
          cy.get('input').last().type(testOTP, { delay: 0 });
          cy.get('button').contains(/אמת|Verify/i).click();
          cy.wait(2000);
        }
      });

      // Check Step 2
      cy.url().then(url => {
        if (url.includes('/2')) {
          processResult.steps.step2 = true;
          cy.log(`✅ ${process.name} - Step 2 reached`);
          
          // Quick fill
          cy.get('input').first().type('Test User', { delay: 0 });
          cy.get('input').eq(1).type('01/01/1990', { delay: 0 });
          
          // Select first option in first 3 dropdowns
          for (let i = 0; i < 3; i++) {
            cy.get('.react-dropdown-select, [class*="dropdown"]').eq(i).click({ force: true });
            cy.wait(100);
            cy.get('.react-dropdown-select-item, li').first().click({ force: true });
          }
          
          cy.get('button').last().click({ force: true });
          cy.wait(2000);
        }
      });

      // Check Step 3
      cy.url().then(url => {
        if (url.includes('/3')) {
          processResult.steps.step3 = true;
          cy.log(`✅ ${process.name} - Step 3 reached`);
          
          // Select employed
          cy.get('.react-dropdown-select, [class*="dropdown"]').first().click({ force: true });
          cy.wait(200);
          cy.get('.react-dropdown-select-item, li').first().click({ force: true });
          
          // Income
          cy.get('input').first().type('20000', { delay: 0 });
          
          // Continue
          cy.get('button').last().click({ force: true });
          cy.wait(3000);
        }
      });

      // Check Step 4
      cy.url().then(url => {
        if (url.includes('/4')) {
          processResult.steps.step4 = true;
          cy.log(`🎉 ${process.name} - Step 4 reached!`);
          
          // Check for bank content
          cy.get('body').then($body => {
            const hasBank = $body.text().includes('bank') || 
                           $body.text().includes('בנק') ||
                           $body.find('[class*="bank"]').length > 0;
            
            if (!hasBank) {
              processResult.issues.push('No bank content visible on step 4');
            }
          });
        } else {
          processResult.issues.push(`Failed to reach step 4. Final URL: ${url}`);
        }
      });

      // Save results
      testResults.summary.push(processResult);
      
      // Log process result
      cy.log(`📊 ${process.name} Results:`, JSON.stringify(processResult, null, 2));
    });
  });

  after(() => {
    // Print final report
    cy.task('log', '========== FINAL REPORT ==========');
    cy.task('log', JSON.stringify(testResults, null, 2));
    
    testResults.summary.forEach(result => {
      const stepsReached = Object.values(result.steps).filter(Boolean).length;
      cy.task('log', `\n${result.name}:`);
      cy.task('log', `  Steps reached: ${stepsReached}/4`);
      cy.task('log', `  Reached Step 4: ${result.steps.step4 ? 'YES ✅' : 'NO ❌'}`);
      
      if (result.issues.length > 0) {
        cy.task('log', `  Issues found:`);
        result.issues.forEach(issue => {
          cy.task('log', `    - ${issue}`);
        });
      }
    });
  });
});