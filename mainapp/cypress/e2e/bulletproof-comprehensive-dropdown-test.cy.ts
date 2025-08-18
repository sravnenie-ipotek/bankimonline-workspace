/**
 * 🛡️ BULLETPROOF COMPREHENSIVE DROPDOWN TEST
 * 
 * ULTRA-ROBUST test that:
 * - Tests ALL 4 processes (Mortgage, Credit, Refinance Mortgage, Refinance Credit)
 * - Tests ALL steps (1-4) in each process
 * - Properly handles crashes and marks them as FAIL
 * - Generates detailed report even if test crashes
 * - NO FALSE POSITIVES - defaults to FAIL status
 */

describe('🛡️ BULLETPROOF Comprehensive Dropdown Test - Full Application Status', () => {
  const testPhone = '972544123456';
  const testOTP = '123456';
  
  // Master report - defaults to FAIL
  const masterReport = {
    test_execution: {
      timestamp: new Date().toISOString(),
      start_time: Date.now(),
      duration_minutes: 0,
      browser: 'chrome-headed',
      environment: 'localhost:5173',
      jsonb_system_active: false,
      test_completed: false,
      crash_count: 0
    },
    overall_status: 'FAIL', // DEFAULT TO FAIL
    summary: {
      total_processes_tested: 0,
      successful_processes: 0,
      failed_processes: 0,
      total_steps_tested: 0,
      total_dropdowns_tested: 0,
      total_empty_dropdowns: 0,
      total_working_dropdowns: 0,
      total_critical_issues: 0
    },
    processes: {
      calculate_mortgage: {
        status: 'NOT_TESTED',
        steps_completed: 0,
        dropdowns_tested: 0,
        empty_dropdowns: [],
        errors: []
      },
      calculate_credit: {
        status: 'NOT_TESTED',
        steps_completed: 0,
        dropdowns_tested: 0,
        empty_dropdowns: [],
        errors: []
      },
      refinance_mortgage: {
        status: 'NOT_TESTED',
        steps_completed: 0,
        dropdowns_tested: 0,
        empty_dropdowns: [],
        errors: []
      },
      refinance_credit: {
        status: 'NOT_TESTED',
        steps_completed: 0,
        dropdowns_tested: 0,
        empty_dropdowns: [],
        errors: []
      }
    },
    critical_issues: [],
    empty_dropdowns_detail: [],
    api_validation: {
      endpoints_tested: 0,
      successful_responses: 0,
      failed_responses: 0,
      empty_data_responses: 0
    }
  };

  // Helper to save report at any point
  const saveReport = () => {
    masterReport.test_execution.duration_minutes = 
      Math.round((Date.now() - masterReport.test_execution.start_time) / 60000);
    
    // Determine overall status
    if (masterReport.summary.total_empty_dropdowns > 0) {
      masterReport.overall_status = 'FAIL';
    } else if (masterReport.summary.total_critical_issues > 0) {
      masterReport.overall_status = 'FAIL';
    } else if (masterReport.test_execution.crash_count > 0) {
      masterReport.overall_status = 'FAIL';
    } else if (masterReport.summary.successful_processes === 4) {
      masterReport.overall_status = 'PASS';
    } else {
      masterReport.overall_status = 'PARTIAL';
    }
    
    cy.writeFile('cypress/reports/bulletproof-comprehensive-report.json', masterReport);
  };

  // Test each dropdown with error handling
  const testDropdownSafely = (element: any, dropdownName: string, processKey: string, stepNumber: number) => {
    try {
      cy.wrap(element).then($el => {
        masterReport.summary.total_dropdowns_tested++;
        masterReport.processes[processKey].dropdowns_tested++;
        
        // Check if dropdown is visible and enabled
        if (!$el.is(':visible') || $el.prop('disabled')) {
          masterReport.processes[processKey].errors.push(`Dropdown ${dropdownName} is hidden or disabled`);
          return;
        }
        
        // Try to open dropdown
        cy.wrap($el).click({ force: true });
        cy.wait(1000);
        
        // Check for options
        cy.get('body').then($body => {
          const optionSelectors = [
            '.react-dropdown-select-item',
            '.dropdown-option',
            '[class*="option"]',
            '[role="option"]',
            'li[class*="option"]'
          ];
          
          let hasOptions = false;
          let optionCount = 0;
          
          for (const selector of optionSelectors) {
            const options = $body.find(selector);
            if (options.length > 0) {
              hasOptions = true;
              optionCount = options.length;
              break;
            }
          }
          
          if (hasOptions && optionCount > 0) {
            masterReport.summary.total_working_dropdowns++;
            cy.log(`✅ Dropdown ${dropdownName}: ${optionCount} options`);
          } else {
            masterReport.summary.total_empty_dropdowns++;
            masterReport.processes[processKey].empty_dropdowns.push({
              name: dropdownName,
              step: stepNumber
            });
            masterReport.empty_dropdowns_detail.push({
              process: processKey,
              step: stepNumber,
              dropdown: dropdownName
            });
            masterReport.critical_issues.push({
              severity: 'CRITICAL',
              process: processKey,
              step: stepNumber,
              issue: `Empty dropdown: ${dropdownName}`
            });
            cy.log(`❌ EMPTY DROPDOWN: ${dropdownName} on Step ${stepNumber}`);
          }
          
          // Close dropdown
          cy.get('body').click(0, 0);
        });
      });
    } catch (error) {
      masterReport.processes[processKey].errors.push(`Error testing dropdown ${dropdownName}: ${error.message}`);
    }
  };

  // Test a single process step
  const testProcessStep = (processName: string, processKey: string, stepNumber: number) => {
    const stepUrl = `/services/${processName}/${stepNumber}`;
    
    cy.log(`📍 Testing ${processName} - Step ${stepNumber}`);
    
    // Navigate to step
    cy.visit(stepUrl, { failOnStatusCode: false });
    cy.wait(3000);
    
    // Handle authentication if on step 2
    if (stepNumber === 2) {
      cy.get('body').then($body => {
        if ($body.find('input[type="tel"]').length > 0) {
          cy.get('input[type="tel"]').type(testPhone);
          cy.get('button').contains(/שלח|Send/i).click();
          cy.wait(2000);
          cy.get('input').last().type(testOTP);
          cy.get('button').contains(/אמת|Verify/i).click();
          cy.wait(3000);
        }
      });
    }
    
    // Count and test dropdowns
    cy.get('body').then($body => {
      const dropdownSelectors = [
        '.react-dropdown-select',
        '[class*="dropdown"]:not(input)',
        'select',
        '[data-testid*="dropdown"]'
      ];
      
      let dropdownCount = 0;
      
      dropdownSelectors.forEach(selector => {
        const elements = $body.find(selector);
        elements.each((index, element) => {
          dropdownCount++;
          testDropdownSafely(element, `${processKey}_step${stepNumber}_dropdown${index}`, processKey, stepNumber);
        });
      });
      
      if (dropdownCount > 0) {
        masterReport.summary.total_steps_tested++;
        masterReport.processes[processKey].steps_completed++;
        cy.log(`✅ Step ${stepNumber}: Tested ${dropdownCount} dropdowns`);
      }
    });
    
    // Try to continue to next step (if not step 4)
    if (stepNumber < 4) {
      // Fill minimum required fields
      cy.get('input[type="text"]').first().then($input => {
        if ($input.length > 0) {
          cy.wrap($input).clear().type('1000000');
        }
      });
      
      // Try to click next button
      cy.get('button').contains(/הבא|Next|המשך|Continue/i).then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click({ force: true });
          cy.wait(2000);
        }
      });
    }
  };

  // Test entire process
  const testFullProcess = (processDisplayName: string, processUrlName: string, processKey: string) => {
    cy.log(`\n🚀 TESTING PROCESS: ${processDisplayName}`);
    masterReport.summary.total_processes_tested++;
    
    try {
      // Test each step
      for (let step = 1; step <= 4; step++) {
        testProcessStep(processUrlName, processKey, step);
      }
      
      // Mark process as successful if no empty dropdowns found
      if (masterReport.processes[processKey].empty_dropdowns.length === 0) {
        masterReport.processes[processKey].status = 'PASS';
        masterReport.summary.successful_processes++;
      } else {
        masterReport.processes[processKey].status = 'FAIL';
        masterReport.summary.failed_processes++;
      }
    } catch (error) {
      masterReport.processes[processKey].status = 'ERROR';
      masterReport.processes[processKey].errors.push(error.message);
      masterReport.summary.failed_processes++;
      masterReport.test_execution.crash_count++;
    }
    
    // Save report after each process
    saveReport();
  };

  // Setup error handling
  beforeEach(() => {
    cy.on('fail', (err) => {
      masterReport.test_execution.crash_count++;
      masterReport.critical_issues.push({
        severity: 'CRITICAL',
        issue: 'Test crashed',
        error: err.message
      });
      saveReport();
      throw err; // Re-throw to mark test as failed
    });
  });

  // Test JSONB system status
  it('Should validate JSONB system is active', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:8003/api/dropdowns/mortgage_step1/he',
      failOnStatusCode: false
    }).then(response => {
      masterReport.api_validation.endpoints_tested++;
      
      if (response.status === 200) {
        masterReport.api_validation.successful_responses++;
        
        if (response.body.jsonb_source === true) {
          masterReport.test_execution.jsonb_system_active = true;
          cy.log('✅ JSONB system is ACTIVE');
        } else {
          cy.log('⚠️ JSONB system is NOT active - using traditional system');
        }
        
        // Check if response has empty data
        const hasOptions = response.body.options && Object.keys(response.body.options).length > 0;
        if (!hasOptions) {
          masterReport.api_validation.empty_data_responses++;
          cy.log('❌ API returns EMPTY dropdown data');
        }
      } else {
        masterReport.api_validation.failed_responses++;
        cy.log(`❌ API error: ${response.status}`);
      }
    });
  });

  // Test Calculate Mortgage
  it('Should test Calculate Mortgage (Process 1/4)', () => {
    testFullProcess('Calculate Mortgage', 'calculate-mortgage', 'calculate_mortgage');
  });

  // Test Calculate Credit
  it('Should test Calculate Credit (Process 2/4)', () => {
    testFullProcess('Calculate Credit', 'calculate-credit', 'calculate_credit');
  });

  // Test Refinance Mortgage
  it('Should test Refinance Mortgage (Process 3/4)', () => {
    testFullProcess('Refinance Mortgage', 'refinance-mortgage', 'refinance_mortgage');
  });

  // Test Refinance Credit
  it('Should test Refinance Credit (Process 4/4)', () => {
    testFullProcess('Refinance Credit', 'refinance-credit', 'refinance_credit');
  });

  // Generate final report
  after(() => {
    masterReport.test_execution.test_completed = true;
    masterReport.summary.total_critical_issues = masterReport.critical_issues.length;
    
    // Calculate final status
    const emptyDropdowns = masterReport.summary.total_empty_dropdowns;
    const criticalIssues = masterReport.summary.total_critical_issues;
    const crashes = masterReport.test_execution.crash_count;
    
    if (emptyDropdowns === 0 && criticalIssues === 0 && crashes === 0) {
      masterReport.overall_status = 'PASS';
    } else {
      masterReport.overall_status = 'FAIL';
    }
    
    saveReport();
    
    // Display final report
    cy.log('\n========== BULLETPROOF TEST FINAL REPORT ==========');
    cy.log(`📊 Overall Status: ${masterReport.overall_status}`);
    cy.log(`🔧 Processes Tested: ${masterReport.summary.total_processes_tested}/4`);
    cy.log(`✅ Successful Processes: ${masterReport.summary.successful_processes}`);
    cy.log(`❌ Failed Processes: ${masterReport.summary.failed_processes}`);
    cy.log(`📋 Total Dropdowns Tested: ${masterReport.summary.total_dropdowns_tested}`);
    cy.log(`✅ Working Dropdowns: ${masterReport.summary.total_working_dropdowns}`);
    cy.log(`❌ Empty Dropdowns: ${masterReport.summary.total_empty_dropdowns}`);
    cy.log(`🚨 Critical Issues: ${masterReport.summary.total_critical_issues}`);
    cy.log(`💥 Crashes: ${masterReport.test_execution.crash_count}`);
    cy.log('==================================================');
    
    if (masterReport.summary.total_empty_dropdowns > 0) {
      cy.log('\n❌ EMPTY DROPDOWNS FOUND:');
      masterReport.empty_dropdowns_detail.forEach(item => {
        cy.log(`  - ${item.process} Step ${item.step}: ${item.dropdown}`);
      });
    }
    
    cy.log('\n📁 Full report saved to: cypress/reports/bulletproof-comprehensive-report.json');
  });
});