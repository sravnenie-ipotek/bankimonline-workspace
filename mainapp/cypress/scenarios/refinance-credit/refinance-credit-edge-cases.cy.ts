/**
 * Edge cases and comprehensive variations for Refinance Credit Calculator
 * Tests ALL possible button clicks, modal interactions, and field combinations
 */

describe('Refinance Credit - Edge Cases & All Variations', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';

  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  describe('Step 1: All Button Interactions & Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/services/refinance-credit/1');
    });

    it('should test all refinancing goal variations with multiple credits', () => {
      // Test each refinancing goal with different credit configurations
      const refinancingGoals = [
        { value: 'option_1', hasEarlyRepayment: false, hasDesiredPayment: false, hasDesiredTerm: false },
        { value: 'option_2', hasEarlyRepayment: true, hasDesiredPayment: false, hasDesiredTerm: false },
        { value: 'option_3', hasEarlyRepayment: false, hasDesiredPayment: true, hasDesiredTerm: false },
        { value: 'option_4', hasEarlyRepayment: false, hasDesiredPayment: false, hasDesiredTerm: true }
      ];

      refinancingGoals.forEach((goal, index) => {
        // Reset form
        cy.reload();
        
        // Select refinancing goal
        cy.get('[name="refinancingCredit"]').click();
        cy.get(`[data-value="${goal.value}"]`).click();

        // Add credits equal to goal index + 1
        for (let i = 0; i <= index; i++) {
          if (i > 0) {
            cy.get('button').contains('הוסף אשראי').click();
          }

          // Fill credit with all fields
          cy.get(`[name="creditData[${i}].bank"]`).click();
          cy.get(`[data-value="${['hapoalim', 'leumi', 'discount', 'massad', 'israel'][i] || 'hapoalim'}"]`).click();
          
          cy.get(`[name="creditData[${i}].amount"]`).type(`${(i + 1) * 100000}`);
          cy.get(`[name="creditData[${i}].monthlyPayment"]`).type(`${(i + 1) * 1000}`);
          cy.get(`[name="creditData[${i}].startDate"]`).type(`201${8 + i}-01-01`);
          cy.get(`[name="creditData[${i}].endDate"]`).type(`204${0 + i}-01-01`);

          // If option 2, fill early repayment
          if (goal.hasEarlyRepayment) {
            cy.get(`[name="creditData[${i}].earlyRepayment"]`)
              .should('be.visible')
              .type(`${(i + 1) * 10000}`);
          }
        }

        // Test conditional fields
        if (goal.hasDesiredPayment) {
          cy.get('[name="desiredMonthlyPayment"]')
            .should('be.visible')
            .type('3000');
        }

        if (goal.hasDesiredTerm) {
          // Test slider interactions
          cy.get('[data-qa="desired-term-slider"]').should('be.visible');
          
          // Test different slider values
          [4, 10, 20, 30].forEach(value => {
            cy.get('input[type="range"][name="desiredTerm"]')
              .invoke('val', value)
              .trigger('input')
              .trigger('change');
            
            // Verify value is displayed
            cy.get('.slider-value').should('contain', value);
          });
        }
      });
    });

    it('should test maximum credit entries and deletion scenarios', () => {
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_2"]').click(); // Select option with early repayment

      // Add maximum reasonable number of credits (10)
      for (let i = 0; i < 10; i++) {
        if (i > 0) {
          cy.get('button').contains('הוסף אשראי').click();
        }

        // Quick fill for testing
        cy.get(`[name="creditData[${i}].bank"]`).click();
        cy.get('[data-value="hapoalim"]').click();
        cy.get(`[name="creditData[${i}].amount"]`).type('100000');
        cy.get(`[name="creditData[${i}].monthlyPayment"]`).type('1000');
        cy.get(`[name="creditData[${i}].startDate"]`).type('2020-01-01');
        cy.get(`[name="creditData[${i}].endDate"]`).type('2040-01-01');
        cy.get(`[name="creditData[${i}].earlyRepayment"]`).type('5000');
      }

      // Test deleting credits in different orders
      // Delete from middle
      cy.get('[data-testid="delete-credit-5"]').click();
      cy.get('.modal button').contains('אישור').click();

      // Delete from end
      cy.get('[data-testid="delete-credit-8"]').click();
      cy.get('.modal button').contains('אישור').click();

      // Delete from beginning (second item, as first can't be deleted)
      cy.get('[data-testid="delete-credit-1"]').click();
      cy.get('.modal button').contains('אישור').click();

      // Test cancel deletion
      cy.get('[data-testid="delete-credit-2"]').click();
      cy.get('.modal button').contains('ביטול').click();
      
      // Verify credit wasn't deleted
      cy.get('[name="creditData[2].bank"]').should('exist');
    });

    it('should test all date picker interactions', () => {
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_1"]').click();

      // Test calendar navigation
      cy.get('[name="creditData[0].startDate"]').click();
      
      // Navigate to previous year
      cy.get('.calendar-prev-year').click();
      cy.get('.calendar-month').contains('ינואר').click();
      cy.get('.calendar-day').contains('15').click();

      // Test end date calendar
      cy.get('[name="creditData[0].endDate"]').click();
      
      // Navigate to future year
      cy.get('.calendar-next-year').click();
      cy.get('.calendar-next-year').click();
      cy.get('.calendar-month').contains('דצמבר').click();
      cy.get('.calendar-day').contains('31').click();

      // Test typing dates directly
      cy.get('[name="creditData[0].startDate"]').clear().type('2015-06-15');
      cy.get('[name="creditData[0].endDate"]').clear().type('2045-06-15');
    });

    it('should test all validation scenarios', () => {
      // Test empty form submission
      cy.get('button[type="submit"]').contains('המשך').click();
      cy.get('.error-message').should('contain', 'יש לבחור מטרת מיחזור');

      // Select goal but leave credits empty
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_1"]').click();
      cy.get('button[type="submit"]').contains('המשך').click();
      cy.get('.error-message').should('be.visible');

      // Fill partial credit data
      cy.get('[name="creditData[0].bank"]').click();
      cy.get('[data-value="hapoalim"]').click();
      cy.get('button[type="submit"]').contains('המשך').click();
      cy.get('.error-message').should('contain', 'סכום');

      // Test negative values
      cy.get('[name="creditData[0].amount"]').type('-100000');
      cy.get('[name="creditData[0].monthlyPayment"]').type('-1000');
      cy.get('button[type="submit"]').contains('המשך').click();
      cy.get('.error-message').should('be.visible');

      // Test zero values
      cy.get('[name="creditData[0].amount"]').clear().type('0');
      cy.get('[name="creditData[0].monthlyPayment"]').clear().type('0');
      cy.get('button[type="submit"]').contains('המשך').click();
      cy.get('.error-message').should('be.visible');

      // Test extremely large values
      cy.get('[name="creditData[0].amount"]').clear().type('999999999999');
      cy.get('[name="creditData[0].monthlyPayment"]').clear().type('999999999');
      cy.get('button[type="submit"]').contains('המשך').click();
    });
  });

  describe('Step 2: All Dropdown Combinations & Partner Logic', () => {
    beforeEach(() => {
      // Quick navigation to step 2
      cy.visit('/services/refinance-credit/1');
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_1"]').click();
      fillMinimalCreditAndProceed();
    });

    it('should test all education and citizenship combinations', () => {
      // Test each education level
      const educationLevels = ['option_1', 'option_2', 'option_3', 'option_4', 'option_5', 'option_6', 'option_7'];
      
      educationLevels.forEach((level, index) => {
        cy.get('[name="education"]').click();
        cy.get(`[data-value="${level}"]`).click();
        
        // For each education, test different citizenship
        const citizenships = ['option_1', 'option_2', 'option_3'];
        cy.get('[name="citizenship"]').click();
        cy.get(`[data-value="${citizenships[index % 3]}"]`).click();
      });
    });

    it('should test all family status variations and partner fields', () => {
      // Fill basic info first
      cy.get('[name="firstName"]').type('משה');
      cy.get('[name="lastName"]').type('כהן');
      cy.get('[name="idNumber"]').type('123456789');
      cy.get('[name="birthday"]').type('1980-01-01');

      // Test each family status
      const familyStatuses = [
        { value: 'option_1', showPartner: false }, // Single
        { value: 'option_2', showPartner: true },  // Married
        { value: 'option_3', showPartner: false }, // Divorced
        { value: 'option_4', showPartner: false }, // Widowed
        { value: 'option_5', showPartner: true },  // Common law
        { value: 'option_6', showPartner: false }  // Other
      ];

      familyStatuses.forEach(status => {
        cy.get('[name="familyStatus"]').click();
        cy.get(`[data-value="${status.value}"]`).click();

        if (status.showPartner) {
          // Partner fields should be visible
          cy.get('[name="partnerFirstName"]').should('be.visible').clear().type('רחל');
          cy.get('[name="partnerLastName"]').clear().type('כהן');
          cy.get('[name="partnerIdNumber"]').clear().type('987654321');
          cy.get('[name="partnerBirthday"]').clear().type('1982-05-15');
        } else {
          // Partner fields should not be visible
          cy.get('[name="partnerFirstName"]').should('not.exist');
        }
      });
    });

    it('should test all yes/no fields combinations', () => {
      // Test all combinations of yes/no fields
      const yesNoFields = [
        'medicalInsurance',
        'usTaxReporting',
        'publicPerson',
        'foreigner'
      ];

      // Test all 16 combinations (2^4)
      for (let i = 0; i < 16; i++) {
        yesNoFields.forEach((field, index) => {
          cy.get(`[name="${field}"]`).click();
          const option = (i & (1 << index)) ? 'option_1' : 'option_2';
          cy.get(`[data-value="${option}"]`).click();
        });
      }
    });

    it('should test city autocomplete with various inputs', () => {
      // Test typing and selecting
      cy.get('[name="city"]').type('תל');
      cy.get('.autocomplete-dropdown').should('be.visible');
      cy.get('.autocomplete-dropdown li').should('have.length.greaterThan', 0);
      cy.get('.autocomplete-dropdown li').contains('תל אביב').click();

      // Clear and test another city
      cy.get('[name="city"]').clear().type('ירו');
      cy.get('.autocomplete-dropdown li').contains('ירושלים').click();

      // Test with English
      cy.get('[name="city"]').clear().type('Haifa');
      cy.get('.autocomplete-dropdown li').first().click();

      // Test no results
      cy.get('[name="city"]').clear().type('עיר שלא קיימת');
      cy.get('.autocomplete-dropdown').should('not.exist');
    });
  });

  describe('Step 3: All Modal Interactions & Complex Scenarios', () => {
    beforeEach(() => {
      navigateToStep3();
    });

    it('should test adding maximum income sources of each type', () => {
      const incomeTypes = [
        'salary', 'selfEmployed', 'pension', 'unemploymentBenefits',
        'investmentIncome', 'studentAllowance', 'other'
      ];

      incomeTypes.forEach((type, index) => {
        cy.get('button').contains('הוסף מקור הכנסה').click();
        cy.get('[name="incomeType"]').click();
        cy.get(`[data-value="${type}"]`).click();
        cy.get('[name="amount"]').type(`${(index + 1) * 5000}`);
        
        if (type === 'salary' || type === 'selfEmployed') {
          cy.get('[name="startDate"]').type(`201${5 + index}-01-01`);
          cy.get('[name="companyName"]').type(`חברה ${index + 1}`);
          cy.get('[name="jobTitle"]').type(`תפקיד ${index + 1}`);
        }
        
        cy.get('.modal button').contains('שמור').click();
        cy.wait(500);
      });

      // Verify all income sources were added
      cy.get('.income-list-item').should('have.length', incomeTypes.length);
    });

    it('should test editing income with all field changes', () => {
      // Add income first
      cy.get('button').contains('הוסף מקור הכנסה').click();
      cy.get('[name="incomeType"]').click();
      cy.get('[data-value="salary"]').click();
      cy.get('[name="amount"]').type('10000');
      cy.get('[name="startDate"]').type('2020-01-01');
      cy.get('[name="companyName"]').type('חברה ישנה');
      cy.get('[name="jobTitle"]').type('מנהל');
      cy.get('.modal button').contains('שמור').click();

      // Edit all fields
      cy.get('.income-list-item button[aria-label="edit"]').click();
      cy.get('[name="incomeType"]').click();
      cy.get('[data-value="selfEmployed"]').click();
      cy.get('[name="amount"]').clear().type('15000');
      cy.get('[name="startDate"]').clear().type('2021-06-15');
      cy.get('[name="companyName"]').clear().type('חברה חדשה');
      cy.get('[name="jobTitle"]').clear().type('יועץ');
      cy.get('.modal button').contains('שמור').click();
    });

    it('should test all additional income combinations', () => {
      const additionalTypes = [
        'partTime', 'freelance', 'rental', 'investment',
        'business', 'government', 'none'
      ];

      // Add multiple additional incomes
      additionalTypes.slice(0, -1).forEach((type, index) => {
        cy.get('button').contains('הוסף הכנסה נוספת').click();
        cy.get('[name="additionalIncomeType"]').click();
        cy.get(`[data-value="${type}"]`).click();
        cy.get('[name="additionalAmount"]').type(`${(index + 1) * 1000}`);
        cy.get('.modal button').contains('שמור').click();
        cy.wait(500);
      });
    });

    it('should test all obligation types with all banks', () => {
      const obligationTypes = ['mortgage', 'personalLoan', 'creditCard', 'carLoan'];
      const banks = ['hapoalim', 'leumi', 'discount', 'massad', 'israel'];

      obligationTypes.forEach((type, typeIndex) => {
        banks.forEach((bank, bankIndex) => {
          if (typeIndex * banks.length + bankIndex < 10) { // Limit to reasonable number
            cy.get('button').contains('הוסף התחייבות').click();
            cy.get('[name="obligationType"]').click();
            cy.get(`[data-value="${type}"]`).click();
            cy.get('[name="obligationBank"]').click();
            cy.get(`[data-value="${bank}"]`).click();
            cy.get('[name="monthlyPayment"]').type(`${(bankIndex + 1) * 500}`);
            cy.get('[name="endDate"]').type(`202${5 + bankIndex}-01-01`);
            cy.get('.modal button').contains('שמור').click();
            cy.wait(500);
          }
        });
      });
    });

    it('should test modal cancel buttons and escape key', () => {
      // Test cancel button
      cy.get('button').contains('הוסף מקור הכנסה').click();
      cy.get('.modal').should('be.visible');
      cy.get('.modal button').contains('ביטול').click();
      cy.get('.modal').should('not.exist');

      // Test escape key
      cy.get('button').contains('הוסף מקור הכנסה').click();
      cy.get('.modal').should('be.visible');
      cy.get('body').type('{esc}');
      cy.get('.modal').should('not.exist');

      // Test clicking outside modal
      cy.get('button').contains('הוסף מקור הכנסה').click();
      cy.get('.modal-backdrop').click({ force: true });
      cy.get('.modal').should('not.exist');
    });
  });

  describe('Step 4: Bank Offers Complete Interactions', () => {
    beforeEach(() => {
      navigateToStep4();
    });

    it('should test all filter combinations', () => {
      // Test selecting all banks
      const banks = ['hapoalim', 'leumi', 'discount', 'massad', 'israel'];
      banks.forEach(bank => {
        cy.get(`.bank-filter-checkbox[data-bank="${bank}"]`).click();
      });

      // Test deselecting all banks
      banks.forEach(bank => {
        cy.get(`.bank-filter-checkbox[data-bank="${bank}"]`).click();
      });

      // Test sorting options
      const sortOptions = ['interestRate', 'monthlyPayment', 'totalCost', 'loanTerm'];
      sortOptions.forEach(option => {
        cy.get('[name="sortBy"]').click();
        cy.get(`[data-value="${option}"]`).click();
        cy.wait(500);
      });
    });

    it('should test all bank offer interactions', () => {
      // Click on each visible bank offer
      cy.get('.bank-offer-card').each(($card, index) => {
        if (index < 5) { // Limit to first 5
          cy.wrap($card).click();
          
          // Check if details expanded
          cy.wrap($card).find('.bank-offer-details').should('be.visible');
          
          // Look for action buttons within the offer
          cy.wrap($card).find('button').each($button => {
            const buttonText = $button.text();
            if (buttonText.includes('פרטים') || buttonText.includes('בחר')) {
              cy.wrap($button).click();
            }
          });
          
          // Click card again to collapse
          cy.wrap($card).click();
        }
      });
    });

    it('should test navigation back through all steps', () => {
      // Go back to step 3
      cy.get('button').contains('חזרה').click();
      cy.url().should('include', '/services/refinance-credit/3');

      // Go back to step 2
      cy.get('button').contains('חזרה').click();
      cy.url().should('include', '/services/refinance-credit/2');

      // Go back to step 1
      cy.get('button').contains('חזרה').click();
      cy.url().should('include', '/services/refinance-credit/1');

      // Navigate forward again
      cy.get('button[type="submit"]').contains('המשך').click();
      cy.url().should('include', '/services/refinance-credit/2');
    });

    it('should test final submission flow', () => {
      // Select a bank offer
      cy.get('.bank-offer-card').first().click();
      cy.get('.bank-offer-card').first().find('button').contains('בחר').click();

      // Click submit
      cy.get('button').contains('שלח').click();

      // Handle auth modal or success
      cy.get('body').then($body => {
        if ($body.find('.modal').length > 0) {
          // Auth flow
          cy.get('input[name="phone"]').type(testPhone);
          cy.get('button').contains('קבל קוד').click();
          cy.get('input[name="otp"]').type(testOTP);
          cy.get('button').contains('אמת').click();
        } else {
          // Success message
          cy.get('.success-message').should('be.visible');
        }
      });
    });
  });

  // Helper functions
  function fillMinimalCreditAndProceed() {
    cy.get('[name="creditData[0].bank"]').click();
    cy.get('[data-value="hapoalim"]').click();
    cy.get('[name="creditData[0].amount"]').type('500000');
    cy.get('[name="creditData[0].monthlyPayment"]').type('4000');
    cy.get('[name="creditData[0].startDate"]').type('2020-01-01');
    cy.get('[name="creditData[0].endDate"]').type('2040-01-01');
    cy.get('button[type="submit"]').contains('המשך').click();
    
    // Handle auth if needed
    handleAuthIfNeeded();
  }

  function handleAuthIfNeeded() {
    cy.get('body').then($body => {
      if ($body.find('.modal').length > 0) {
        cy.get('input[name="phone"]').type(testPhone);
        cy.get('button').contains('קבל קוד').click();
        cy.get('input[name="otp"]').type(testOTP);
        cy.get('button').contains('אמת').click();
      }
    });
  }

  function navigateToStep3() {
    cy.visit('/services/refinance-credit/1');
    cy.get('[name="refinancingCredit"]').click();
    cy.get('[data-value="option_1"]').click();
    fillMinimalCreditAndProceed();
    
    // Fill minimal step 2
    cy.get('[name="firstName"]').type('טסט');
    cy.get('[name="lastName"]').type('משתמש');
    cy.get('[name="idNumber"]').type('123456789');
    cy.get('[name="birthday"]').type('1990-01-01');
    cy.get('[name="education"]').click();
    cy.get('[data-value="option_4"]').click();
    cy.get('[name="citizenship"]').click();
    cy.get('[data-value="option_1"]').click();
    cy.get('[name="familyStatus"]').click();
    cy.get('[data-value="option_1"]').click();
    cy.get('[name="medicalInsurance"]').click();
    cy.get('[data-value="option_1"]').click();
    cy.get('[name="city"]').type('תל אביב');
    cy.wait(500);
    cy.get('.autocomplete-dropdown li').first().click();
    cy.get('[name="street"]').type('הרצל 1');
    cy.get('button[type="submit"]').contains('המשך').click();
  }

  function navigateToStep4() {
    navigateToStep3();
    
    // Add minimal income
    cy.get('button').contains('הוסף מקור הכנסה').click();
    cy.get('[name="incomeType"]').click();
    cy.get('[data-value="salary"]').click();
    cy.get('[name="amount"]').type('15000');
    cy.get('.modal button').contains('שמור').click();
    cy.get('button[type="submit"]').contains('המשך').click();
  }
});