/**
 * 🎯 FOCUSED TEST: Calculate Mortgage Step 2 - Empty Dropdown Detection
 * 
 * This test specifically targets the bug discovered on Calculate Mortgage Step 2
 * where the השכלה (Education) dropdown has no options.
 * 
 * CRITICAL: Test must properly FAIL when dropdowns are empty or test crashes
 */

describe('🔍 Focused Test: Calculate Mortgage Step 2 - Empty Dropdown Bug Detection', () => {
  const testPhone = '972544123456';
  const testOTP = '123456';
  
  // Initialize with FAIL status - only mark PASS after successful validation
  let testReport = {
    test_name: 'Calculate Mortgage Step 2 - Empty Dropdown Detection',
    status: 'FAIL', // DEFAULT TO FAIL - CRITICAL CHANGE
    timestamp: new Date().toISOString(),
    url_tested: 'http://localhost:5173/services/calculate-mortgage/2',
    dropdowns_found: 0,
    empty_dropdowns: [],
    working_dropdowns: [],
    critical_issues: [],
    test_completed: false,
    crash_detected: false,
    error_message: null,
    validation_results: {
      education_dropdown: {
        found: false,
        has_options: false,
        option_count: 0,
        actual_options: []
      }
    }
  };

  // Wrap entire test in try-catch to detect crashes
  it('Should detect empty dropdown bug in השכלה field on Step 2', () => {
    cy.log('🚀 Starting focused test for Calculate Mortgage Step 2');
    
    // Set up error detection
    cy.on('fail', (err) => {
      testReport.crash_detected = true;
      testReport.error_message = err.message;
      testReport.status = 'FAIL';
      testReport.critical_issues.push({
        severity: 'CRITICAL',
        issue: 'Test crashed with error',
        message: err.message
      });
      
      // Save report even on crash
      cy.writeFile('cypress/reports/mortgage-step2-focused-report.json', testReport);
      
      // Re-throw to fail the test
      throw err;
    });
    
    // Navigate directly to Step 2
    cy.visit('/services/calculate-mortgage/2', {
      failOnStatusCode: false,
      timeout: 30000
    });
    
    cy.wait(5000); // Give page time to load
    
    // Take screenshot of initial state
    cy.screenshot('mortgage-step2-initial-state');
    
    // Count all dropdowns on the page
    cy.get('body').then($body => {
      const dropdownSelectors = [
        '.react-dropdown-select',
        '[class*="dropdown"]:not(input)',
        'select',
        '[data-testid*="dropdown"]',
        '[role="combobox"]',
        '[role="listbox"]'
      ];
      
      let totalDropdowns = 0;
      let dropdownElements = [];
      
      dropdownSelectors.forEach(selector => {
        const elements = $body.find(selector);
        if (elements.length > 0) {
          totalDropdowns += elements.length;
          elements.each((index, el) => {
            dropdownElements.push({
              selector: selector,
              element: el,
              index: index
            });
          });
        }
      });
      
      testReport.dropdowns_found = totalDropdowns;
      cy.log(`📊 Found ${totalDropdowns} dropdown elements on page`);
      
      if (totalDropdowns === 0) {
        testReport.status = 'FAIL';
        testReport.critical_issues.push({
          severity: 'CRITICAL',
          issue: 'No dropdowns found on Step 2',
          message: 'Page may not have loaded correctly or dropdowns are not rendered'
        });
      }
      
      // Test each dropdown
      let testedCount = 0;
      
      dropdownElements.forEach((dropdownInfo) => {
        cy.wrap(dropdownInfo.element).then($dropdown => {
          const dropdownId = $dropdown.attr('id') || $dropdown.attr('name') || `dropdown-${dropdownInfo.index}`;
          
          cy.log(`🔍 Testing dropdown: ${dropdownId}`);
          
          // Check if this is the education dropdown (השכלה)
          const isEducationDropdown = 
            dropdownId.includes('education') || 
            dropdownId.includes('השכלה') ||
            $dropdown.parent().text().includes('השכלה') ||
            $dropdown.closest('.field-container').text().includes('השכלה');
          
          if (isEducationDropdown) {
            cy.log('🎯 Found Education dropdown - testing for empty options bug');
            testReport.validation_results.education_dropdown.found = true;
          }
          
          // Try to open dropdown
          cy.wrap($dropdown).click({ force: true });
          cy.wait(1000);
          
          // Check for options
          cy.get('body').then($optionsBody => {
            const optionSelectors = [
              '.react-dropdown-select-item',
              '.dropdown-option',
              '[class*="option"]',
              '[role="option"]',
              'li[class*="option"]',
              '.select-option'
            ];
            
            let optionsFound = false;
            let optionCount = 0;
            let optionTexts = [];
            
            for (const optionSelector of optionSelectors) {
              const options = $optionsBody.find(optionSelector);
              if (options.length > 0) {
                optionsFound = true;
                optionCount = options.length;
                
                options.each((idx, opt) => {
                  const text = Cypress.$(opt).text().trim();
                  if (text) {
                    optionTexts.push(text);
                  }
                });
                
                break;
              }
            }
            
            // Record results
            if (optionsFound && optionCount > 0) {
              testReport.working_dropdowns.push({
                id: dropdownId,
                option_count: optionCount,
                sample_options: optionTexts.slice(0, 3)
              });
              
              cy.log(`✅ Dropdown ${dropdownId} has ${optionCount} options`);
            } else {
              testReport.empty_dropdowns.push({
                id: dropdownId,
                is_education: isEducationDropdown,
                error: 'No options found'
              });
              
              testReport.critical_issues.push({
                severity: isEducationDropdown ? 'CRITICAL' : 'HIGH',
                issue: `Empty dropdown detected: ${dropdownId}`,
                message: `Dropdown has no selectable options${isEducationDropdown ? ' - THIS IS THE REPORTED BUG!' : ''}`
              });
              
              cy.log(`❌ EMPTY DROPDOWN DETECTED: ${dropdownId}`);
              cy.screenshot(`empty-dropdown-${dropdownId}`);
            }
            
            // Update education dropdown specific results
            if (isEducationDropdown) {
              testReport.validation_results.education_dropdown.has_options = optionsFound;
              testReport.validation_results.education_dropdown.option_count = optionCount;
              testReport.validation_results.education_dropdown.actual_options = optionTexts;
            }
            
            testedCount++;
            
            // After testing all dropdowns, determine final status
            if (testedCount === dropdownElements.length) {
              // Only mark as PASS if:
              // 1. Test completed without crashing
              // 2. All dropdowns have options
              // 3. No critical issues found
              if (testReport.empty_dropdowns.length === 0 && 
                  testReport.critical_issues.length === 0 &&
                  !testReport.crash_detected) {
                testReport.status = 'PASS';
                cy.log('✅ All dropdowns have options - Test PASSED');
              } else {
                testReport.status = 'FAIL';
                cy.log(`❌ Test FAILED: ${testReport.empty_dropdowns.length} empty dropdowns, ${testReport.critical_issues.length} critical issues`);
              }
              
              testReport.test_completed = true;
            }
          });
          
          // Close dropdown
          cy.get('body').click(0, 0);
          cy.wait(500);
        });
      });
    });
    
    // Also test via API to confirm JSONB issue
    cy.request({
      method: 'GET',
      url: 'http://localhost:8003/api/dropdowns/mortgage_step2/he',
      failOnStatusCode: false
    }).then(response => {
      cy.log('📡 API Response Status:', response.status);
      
      if (response.status === 200) {
        const data = response.body;
        
        // Check if education dropdown exists in API response
        const educationOptions = data.options?.education || 
                               data.options?.mortgage_step2_education ||
                               data.education?.options ||
                               {};
        
        if (Object.keys(educationOptions).length === 0) {
          testReport.critical_issues.push({
            severity: 'CRITICAL',
            issue: 'API returns empty education dropdown data',
            message: 'JSONB API confirms the dropdown has no options'
          });
          testReport.status = 'FAIL';
          cy.log('❌ API confirms: Education dropdown has no options in JSONB data');
        }
        
        // Log full API response for debugging
        cy.log('API Response:', JSON.stringify(data, null, 2));
      }
    });
    
    // Final report generation
    cy.then(() => {
      // Generate summary
      const summary = {
        test_result: testReport.status,
        bug_detected: testReport.empty_dropdowns.length > 0,
        education_dropdown_bug_confirmed: !testReport.validation_results.education_dropdown.has_options && 
                                        testReport.validation_results.education_dropdown.found,
        total_dropdowns: testReport.dropdowns_found,
        empty_dropdowns_count: testReport.empty_dropdowns.length,
        working_dropdowns_count: testReport.working_dropdowns.length,
        critical_issues_count: testReport.critical_issues.length
      };
      
      testReport.summary = summary;
      
      // Save detailed report
      cy.writeFile('cypress/reports/mortgage-step2-focused-report.json', testReport);
      
      // Display results
      cy.log('========== FOCUSED TEST REPORT ==========');
      cy.log(`📊 Test Status: ${testReport.status}`);
      cy.log(`🐛 Bug Detected: ${summary.bug_detected ? 'YES' : 'NO'}`);
      cy.log(`🎯 Education Dropdown Bug: ${summary.education_dropdown_bug_confirmed ? 'CONFIRMED' : 'NOT FOUND'}`);
      cy.log(`📋 Total Dropdowns: ${summary.total_dropdowns}`);
      cy.log(`❌ Empty Dropdowns: ${summary.empty_dropdowns_count}`);
      cy.log(`✅ Working Dropdowns: ${summary.working_dropdowns_count}`);
      cy.log(`🚨 Critical Issues: ${summary.critical_issues_count}`);
      cy.log('=========================================');
      
      if (testReport.empty_dropdowns.length > 0) {
        cy.log('❌ EMPTY DROPDOWNS FOUND:');
        testReport.empty_dropdowns.forEach(dropdown => {
          cy.log(`  - ${dropdown.id}${dropdown.is_education ? ' (EDUCATION - REPORTED BUG)' : ''}`);
        });
      }
      
      if (testReport.critical_issues.length > 0) {
        cy.log('🚨 CRITICAL ISSUES:');
        testReport.critical_issues.forEach(issue => {
          cy.log(`  - [${issue.severity}] ${issue.issue}`);
        });
      }
      
      // Assert to fail test if status is FAIL
      if (testReport.status === 'FAIL') {
        expect(testReport.status).to.equal('PASS', 
          `Test FAILED: ${testReport.empty_dropdowns.length} empty dropdowns found, ${testReport.critical_issues.length} critical issues detected`);
      }
    });
  });
  
  after(() => {
    // Ensure report is saved even if test fails
    cy.writeFile('cypress/reports/mortgage-step2-focused-final.json', testReport);
  });
});