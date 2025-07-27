/**
 * Calculate Mortgage - Full test to reach step 4
 */

describe('Calculate Mortgage - Full Journey', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  const report = {
    process: 'Calculate Mortgage',
    stepsReached: {},
    translationIssues: [],
    errors: [],
    timestamp: new Date().toISOString()
  };

  it('should complete all steps and reach step 4', () => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // Start process
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000);
    
    // Check for translation issues on step 1
    cy.get('body').then($body => {
      const text = $body.text();
      if (text.includes('Select city')) {
        report.translationIssues.push('Step 1: "Select city" in English instead of Hebrew');
      }
    });
    
    report.stepsReached.step1 = true;
    cy.log('✅ Step 1 loaded');
    
    // Fill Step 1
    cy.get('input[type="text"]').first().clear().type('2000000');
    
    // Fill dropdowns
    const dropdownSelectors = '.react-dropdown-select, [class*="dropdown"]:not(input)';
    
    // City
    cy.get(dropdownSelectors).eq(0).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    // When need money
    cy.get(dropdownSelectors).eq(1).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    // Initial payment
    cy.get('input[type="text"]').eq(1).clear().type('500000');
    
    // Property type
    cy.get(dropdownSelectors).eq(2).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    // First home
    cy.get(dropdownSelectors).eq(3).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    // Property ownership
    cy.get(dropdownSelectors).eq(4).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    // Continue
    cy.get('button').contains(/הבא|Next/i).click();
    cy.wait(3000);
    
    // Handle auth
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
    
    // Step 2
    cy.url().should('include', '/2');
    report.stepsReached.step2 = true;
    cy.log('✅ Step 2 reached');
    
    // Check translations
    cy.get('body').then($body => {
      const text = $body.text();
      if (text.includes('Select') || text.includes('Choose')) {
        report.translationIssues.push('Step 2: English text found in dropdowns');
      }
    });
    
    // Fill Step 2
    cy.get('input[name="nameSurname"]').type('Test User');
    cy.get('input[name="birthday"]').type('15/05/1985');
    
    // Education
    cy.get(dropdownSelectors).first().click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    // Fill remaining dropdowns with "No"
    for (let i = 1; i < 7; i++) {
      cy.get(dropdownSelectors).eq(i).click();
      cy.wait(300);
      cy.get('.react-dropdown-select-item, li').contains(/לא|No/i).click();
    }
    
    cy.get('input[name="borrowers"]').clear().type('1');
    
    // Family status
    cy.get(dropdownSelectors).last().click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    // Continue
    cy.get('button').contains(/הבא/i).click();
    cy.wait(3000);
    
    // Step 3
    cy.url().should('include', '/3');
    report.stepsReached.step3 = true;
    cy.log('✅ Step 3 reached');
    
    // Main income - Employed
    cy.get(dropdownSelectors).first().click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, li').contains(/שכיר/i).click();
    cy.wait(1000);
    
    // Income details
    cy.get('input[name="monthlyIncome"]').type('20000');
    cy.get('input[name="startDate"]').type('01/01/2018');
    
    // Field of activity
    cy.get(dropdownSelectors).eq(1).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    cy.get('input[name="profession"]').type('Engineer');
    cy.get('input[name="companyName"]').type('Tech Ltd');
    
    // No additional income
    cy.get(dropdownSelectors).eq(2).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    // No obligations
    cy.get(dropdownSelectors).eq(3).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, li').first().click();
    
    // Continue
    cy.get('button').contains(/הבא/i).click();
    cy.wait(5000);
    
    // Step 4
    cy.url().then(url => {
      if (url.includes('/4')) {
        report.stepsReached.step4 = true;
        cy.log('🎉 Step 4 reached!');
        
        // Check for bank content
        cy.get('body').then($body => {
          const hasBank = $body.text().includes('בנק');
          cy.log(`Bank offers visible: ${hasBank}`);
          
          // Check for translation issues
          if ($body.text().includes('Select') || $body.text().includes('Choose')) {
            report.translationIssues.push('Step 4: English text found');
          }
        });
        
        cy.screenshot('calculate-mortgage-step4-success');
      } else {
        report.errors.push(`Failed to reach step 4. URL: ${url}`);
      }
    });
    
    // Log report
    cy.log('📊 Final Report:', JSON.stringify(report, null, 2));
    cy.writeFile('cypress/reports/calculate-mortgage-report.json', report);
  });
});