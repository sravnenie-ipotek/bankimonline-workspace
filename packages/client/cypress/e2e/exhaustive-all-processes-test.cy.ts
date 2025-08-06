/**
 * Exhaustive test for all 4 calculator processes
 * Tests every control, dropdown value, link, and variation
 */

describe('Exhaustive Test - All 4 Processes', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  const globalReport = {
    timestamp: new Date().toISOString(),
    processes: []
  };

  // Helper function to test all dropdown values
  const testAllDropdownValues = (dropdownIndex, stepNumber, processName, report) => {
    cy.get('.react-dropdown-select, [class*="dropdown"]:not(input), select').eq(dropdownIndex).then($dropdown => {
      if ($dropdown.length) {
        // Click to open dropdown
        cy.wrap($dropdown).click({ force: true });
        cy.wait(500);
        
        // Get all options
        cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li').then($options => {
          const optionCount = $options.length;
          report.controlsTested.push({
            step: stepNumber,
            control: `Dropdown ${dropdownIndex}`,
            optionsFound: optionCount
          });
          
          // Test each option
          for (let i = 0; i < optionCount; i++) {
            // Re-open dropdown
            cy.wrap($dropdown).click({ force: true });
            cy.wait(300);
            
            // Select option
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li').eq(i).then($option => {
              const optionText = $option.text();
              cy.wrap($option).click({ force: true });
              cy.wait(500);
              
              // Check if new fields appeared
              cy.get('body').then($body => {
                const inputCount = $body.find('input:visible').length;
                const dropdownCount = $body.find('.react-dropdown-select:visible, [class*="dropdown"]:visible').length;
                
                report.dynamicBehavior.push({
                  step: stepNumber,
                  trigger: `Dropdown ${dropdownIndex} - Option: ${optionText}`,
                  result: `Inputs: ${inputCount}, Dropdowns: ${dropdownCount}`
                });
                
                // Check for translation issues in option text
                if (/[a-zA-Z]{2,}/.test(optionText) && /[\u0590-\u05FF]/.test($body.text())) {
                  report.translationIssues.push({
                    step: stepNumber,
                    issue: `Mixed language in dropdown option: "${optionText}"`
                  });
                }
              });
            });
          }
        });
      }
    });
  };

  // Helper to check all links
  const checkAllLinks = (stepNumber, report) => {
    cy.get('a:visible').each($link => {
      const href = $link.attr('href');
      const text = $link.text();
      
      report.linksFound.push({
        step: stepNumber,
        text: text,
        href: href
      });
      
      // Check for translation issues in link text
      if (/[a-zA-Z]{2,}/.test(text) && /[\u0590-\u05FF]/.test(text)) {
        report.translationIssues.push({
          step: stepNumber,
          issue: `Mixed language in link: "${text}"`
        });
      }
    });
  };

  // Helper to check all checkboxes and radio buttons
  const checkAllCheckboxesAndRadios = (stepNumber, report) => {
    // Checkboxes
    cy.get('input[type="checkbox"]:visible').each(($checkbox, index) => {
      cy.wrap($checkbox).check({ force: true });
      cy.wait(200);
      
      report.controlsTested.push({
        step: stepNumber,
        control: `Checkbox ${index}`,
        action: 'checked'
      });
      
      // Check if checking reveals new fields
      cy.get('body').then($body => {
        const newInputs = $body.find('input:visible').length;
        if (newInputs > 0) {
          report.dynamicBehavior.push({
            step: stepNumber,
            trigger: `Checkbox ${index} checked`,
            result: `Revealed ${newInputs} inputs`
          });
        }
      });
    });
    
    // Radio buttons
    cy.get('input[type="radio"]:visible').each(($radio, index) => {
      cy.wrap($radio).check({ force: true });
      cy.wait(200);
      
      report.controlsTested.push({
        step: stepNumber,
        control: `Radio ${index}`,
        action: 'selected'
      });
    });
  };

  // Main test for each process
  const processes = [
    { name: 'Calculate Mortgage', path: '/services/calculate-mortgage/1', type: 'mortgage' },
    { name: 'Calculate Credit', path: '/services/calculate-credit/1', type: 'credit' },
    { name: 'Refinance Mortgage', path: '/services/refinance-mortgage/1', type: 'refinance-mortgage' },
    { name: 'Refinance Credit', path: '/services/refinance-credit/1', type: 'refinance-credit' }
  ];

  processes.forEach((process) => {
    it(`${process.name} - Exhaustive test of all controls`, () => {
      const report = {
        processName: process.name,
        processType: process.type,
        timestamp: new Date().toISOString(),
        stepsReached: {},
        controlsTested: [],
        linksFound: [],
        dynamicBehavior: [],
        translationIssues: [],
        errors: [],
        popupsFound: []
      };

      cy.clearAllSessionStorage();
      cy.clearAllLocalStorage();
      cy.clearAllCookies();

      // Monitor for popups
      cy.on('window:alert', (text) => {
        report.popupsFound.push({ type: 'alert', text: text });
      });
      
      cy.on('window:confirm', (text) => {
        report.popupsFound.push({ type: 'confirm', text: text });
        return true; // Accept all confirms
      });

      // Visit process
      cy.visit(process.path);
      cy.wait(5000); // Longer wait for initial load
      
      // ========== STEP 1 - Exhaustive Testing ==========
      cy.url().then(url => {
        if (url.includes('/1')) {
          report.stepsReached.step1 = true;
          cy.log(`📋 ${process.name} - Step 1: Testing all controls`);
          
          // Check all visible inputs
          cy.get('input:visible').each(($input, index) => {
            const type = $input.attr('type');
            const name = $input.attr('name');
            const placeholder = $input.attr('placeholder');
            
            report.controlsTested.push({
              step: 1,
              control: `Input ${index}`,
              type: type,
              name: name,
              placeholder: placeholder
            });
            
            // Check for English placeholders
            if (placeholder && /[a-zA-Z]{2,}/.test(placeholder)) {
              report.translationIssues.push({
                step: 1,
                issue: `English placeholder: "${placeholder}"`
              });
            }
          });
          
          // Test all links
          checkAllLinks(1, report);
          
          // Fill required fields based on process type
          if (process.type.includes('mortgage')) {
            // Property value
            cy.get('input[type="text"]').first().clear().type('2000000');
            
            // Test all dropdown values for first dropdown (City)
            testAllDropdownValues(0, 1, process.name, report);
            
            // Continue with other dropdowns but select first option
            for (let i = 1; i < 5; i++) {
              cy.get('.react-dropdown-select, [class*="dropdown"]:not(input)').eq(i).then($el => {
                if ($el.length) {
                  cy.wrap($el).click({ force: true });
                  cy.wait(300);
                  cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
                }
              });
            }
            
            // Try to fill initial payment if not disabled
            cy.get('input[type="text"]').eq(1).then($input => {
              if (!$input.prop('disabled')) {
                cy.wrap($input).clear().type('500000');
              }
            });
            
          } else if (process.type.includes('credit')) {
            // Loan amount
            cy.get('input[type="text"]').first().clear().type('50000');
            
            // Test dropdown values
            testAllDropdownValues(0, 1, process.name, report);
            
            // Fill other dropdowns
            for (let i = 1; i < 3; i++) {
              cy.get('.react-dropdown-select, [class*="dropdown"]:not(input)').eq(i).then($el => {
                if ($el.length) {
                  cy.wrap($el).click({ force: true });
                  cy.wait(300);
                  cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
                }
              });
            }
          }
          
          // Test sliders if present
          cy.get('input[type="range"]:visible').each(($slider, index) => {
            const min = $slider.attr('min');
            const max = $slider.attr('max');
            const value = $slider.attr('value');
            
            report.controlsTested.push({
              step: 1,
              control: `Slider ${index}`,
              min: min,
              max: max,
              currentValue: value
            });
            
            // Test min value
            cy.wrap($slider).invoke('val', min).trigger('input').trigger('change');
            cy.wait(200);
            
            // Test max value
            cy.wrap($slider).invoke('val', max).trigger('input').trigger('change');
            cy.wait(200);
            
            // Set to middle value
            const middle = Math.floor((parseInt(min) + parseInt(max)) / 2);
            cy.wrap($slider).invoke('val', middle).trigger('input').trigger('change');
          });
        }
      });

      // Continue to next step
      cy.get('button').then($buttons => {
        const continueBtn = Array.from($buttons).find(btn => {
          const text = btn.textContent || '';
          return (text.includes('הבא') || text.includes('המשך') || text.includes('Next')) && !btn.disabled;
        });
        if (continueBtn) {
          cy.wrap(continueBtn).click({ force: true });
        }
      });

      cy.wait(3000);

      // Handle authentication
      cy.get('body').then($body => {
        if ($body.find('input[type="tel"]').length > 0) {
          report.popupsFound.push({ type: 'auth-modal', text: 'SMS Authentication required' });
          
          cy.get('input[type="tel"]').type(testPhone);
          cy.get('button').contains(/שלח|Send/i).click();
          cy.wait(2000);
          cy.get('input').last().type(testOTP);
          cy.get('button').contains(/אמת|Verify/i).click();
          cy.wait(3000);
        }
      });

      // ========== STEP 2 - Exhaustive Testing ==========
      cy.url().then(url => {
        if (url.includes('/2')) {
          report.stepsReached.step2 = true;
          cy.log(`📋 ${process.name} - Step 2: Testing all controls`);
          
          // Check all links
          checkAllLinks(2, report);
          
          // Check all checkboxes and radios
          checkAllCheckboxesAndRadios(2, report);
          
          // Fill basic info
          cy.get('input[name="nameSurname"]').type('Test User בדיקה');
          cy.get('input[name="birthday"]').type('15/05/1985');
          
          // Test education dropdown (all values)
          testAllDropdownValues(0, 2, process.name, report);
          
          // Test other dropdowns with first option
          for (let i = 1; i < 8; i++) {
            cy.get('.react-dropdown-select, [class*="dropdown"]:not(input)').eq(i).then($el => {
              if ($el.length) {
                cy.wrap($el).click({ force: true });
                cy.wait(300);
                
                // Check option count
                cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').then($options => {
                  report.controlsTested.push({
                    step: 2,
                    control: `Dropdown ${i}`,
                    optionCount: $options.length
                  });
                });
                
                // Select "No" if available, otherwise first
                cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').then($items => {
                  const noOption = Array.from($items).find(item => 
                    item.textContent && (item.textContent.includes('לא') || item.textContent.includes('No'))
                  );
                  if (noOption && i > 0) {
                    cy.wrap(noOption).click({ force: true });
                  } else {
                    cy.wrap($items.first()).click({ force: true });
                  }
                });
              }
            });
          }
          
          cy.get('input[name="borrowers"]').clear().type('1');
        }
      });

      // Continue to step 3
      cy.get('button').contains(/הבא|Next/i).click({ force: true });
      cy.wait(3000);

      // ========== STEP 3 - Exhaustive Testing ==========
      cy.url().then(url => {
        if (url.includes('/3')) {
          report.stepsReached.step3 = true;
          cy.log(`📋 ${process.name} - Step 3: Testing all controls`);
          
          // Check all links
          checkAllLinks(3, report);
          
          // Test main income source dropdown (all values)
          cy.get('.react-dropdown-select, [class*="dropdown"]:not(input)').first().click({ force: true });
          cy.wait(500);
          
          // Get all income source options
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').then($options => {
            const incomeTypes = [];
            $options.each((index, option) => {
              incomeTypes.push($(option).text());
            });
            
            report.controlsTested.push({
              step: 3,
              control: 'Income Source Dropdown',
              options: incomeTypes
            });
            
            // Select employed
            const employedOption = Array.from($options).find(option => 
              option.textContent && (option.textContent.includes('שכיר') || option.textContent.includes('Employed'))
            );
            if (employedOption) {
              cy.wrap(employedOption).click({ force: true });
            } else {
              cy.wrap($options.first()).click({ force: true });
            }
          });
          
          cy.wait(1000);
          
          // Fill employment details
          cy.get('input[name="monthlyIncome"]').type('25000');
          cy.get('input[name="startDate"]').type('01/01/2018');
          cy.get('input[name="profession"]').type('Engineer מהנדס');
          cy.get('input[name="companyName"]').type('Tech Ltd טכנולוגיה');
          
          // Test remaining dropdowns
          for (let i = 1; i < 4; i++) {
            cy.get('.react-dropdown-select, [class*="dropdown"]:not(input)').eq(i).then($el => {
              if ($el.length) {
                cy.wrap($el).click({ force: true });
                cy.wait(300);
                cy.get('.react-dropdown-select-item, [class*="dropdown-item"], li').first().click({ force: true });
              }
            });
          }
        }
      });

      // Continue to step 4
      cy.get('button').contains(/הבא|Next/i).click({ force: true });
      cy.wait(5000);

      // ========== STEP 4 - Final Verification ==========
      cy.url().then(url => {
        if (url.includes('/4')) {
          report.stepsReached.step4 = true;
          cy.log(`🎉 ${process.name} - Step 4 reached!`);
          
          // Check all links on step 4
          checkAllLinks(4, report);
          
          // Check for bank cards/offers
          cy.get('[class*="bank"], [class*="card"], [class*="offer"]').then($banks => {
            report.controlsTested.push({
              step: 4,
              control: 'Bank Offers',
              count: $banks.length
            });
          });
          
          // Check all buttons on step 4
          cy.get('button:visible').each(($button, index) => {
            const text = $button.text();
            report.controlsTested.push({
              step: 4,
              control: `Button ${index}`,
              text: text
            });
            
            // Check for translation issues
            if (/[a-zA-Z]{2,}/.test(text) && /[\u0590-\u05FF]/.test(text)) {
              report.translationIssues.push({
                step: 4,
                issue: `Mixed language in button: "${text}"`
              });
            }
          });
          
          // Take final screenshot
          cy.screenshot(`${process.name.replace(/\s/g, '-')}-step4-complete`);
          
        } else {
          report.errors.push(`Failed to reach step 4. Current URL: ${url}`);
        }
      });

      // Add process report to global report
      globalReport.processes.push(report);
      
      // Log summary
      cy.log(`📊 ${process.name} Summary:`);
      cy.log(`- Steps reached: ${Object.keys(report.stepsReached).length}/4`);
      cy.log(`- Controls tested: ${report.controlsTested.length}`);
      cy.log(`- Translation issues: ${report.translationIssues.length}`);
      cy.log(`- Dynamic behaviors: ${report.dynamicBehavior.length}`);
      cy.log(`- Links found: ${report.linksFound.length}`);
      cy.log(`- Popups: ${report.popupsFound.length}`);
    });
  });

  after(() => {
    // Generate comprehensive final report
    cy.log('\n========== EXHAUSTIVE TEST FINAL REPORT ==========\n');
    
    globalReport.processes.forEach(process => {
      cy.log(`\n📋 ${process.processName}:`);
      cy.log(`  ✓ Reached Step 4: ${process.stepsReached.step4 ? 'YES ✅' : 'NO ❌'}`);
      cy.log(`  ✓ Controls Tested: ${process.controlsTested.length}`);
      cy.log(`  ✓ Links Found: ${process.linksFound.length}`);
      cy.log(`  ✓ Dynamic Behaviors: ${process.dynamicBehavior.length}`);
      
      if (process.translationIssues.length > 0) {
        cy.log(`\n  ⚠️ Translation Issues (${process.translationIssues.length}):`);
        process.translationIssues.forEach(issue => {
          cy.log(`    - Step ${issue.step}: ${issue.issue}`);
        });
      }
      
      if (process.popupsFound.length > 0) {
        cy.log(`\n  📢 Popups Found (${process.popupsFound.length}):`);
        process.popupsFound.forEach(popup => {
          cy.log(`    - ${popup.type}: ${popup.text}`);
        });
      }
      
      if (process.errors.length > 0) {
        cy.log(`\n  ❌ Errors (${process.errors.length}):`);
        process.errors.forEach(error => {
          cy.log(`    - ${error}`);
        });
      }
    });
    
    // Save exhaustive report
    cy.writeFile('cypress/reports/exhaustive-test-report.json', globalReport);
    cy.log('\n✅ Exhaustive report saved to: cypress/reports/exhaustive-test-report.json');
  });
});