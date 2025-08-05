/**
 * Comprehensive test scenario for Refinance Credit Calculator
 * Tests ALL possible variations, buttons, dropdowns, and inputs
 * Covers all 4 steps of the refinance credit process
 */

describe('Refinance Credit Calculator - Complete Scenario', () => {
  // Test data
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    // Clear session and visit the refinance credit page
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.visit('/services/refinance-credit/1');
    cy.wait(1000); // Wait for initial load
    
    // Take initial screenshot
    cy.documentStep('Initial Page Load', 'Refinance credit calculator step 1 loaded');
  });

  describe('Step 1: Refinance Credit Parameters - All Variations', () => {
    it('should test all refinancing goal options and their conditional fields', () => {
      // Test Option 1: Improve interest rate
      cy.get('[name="refinancingCredit"]').should('be.visible').click();
      cy.get('[data-value="option_1"]').click();
      cy.documentStep('Selected Option 1', 'Refinancing goal: Improve interest rate');
      
      // Fill credit data
      fillCreditEntry(0, {
        bank: 'hapoalim',
        amount: '500000',
        monthlyPayment: '3500',
        startDate: '2020-01-01',
        endDate: '2040-01-01'
      });
      cy.documentStep('Filled Credit Entry', 'First credit entry completed with all fields');

      // Test Option 2: Reduce credit amount (shows early repayment field)
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_2"]').click();
      
      // Early repayment field should appear
      cy.get('[name="creditData[0].earlyRepayment"]').should('be.visible')
        .type('50000')
        .should('have.value', '50,000');

      // Test Option 3: Increase term to reduce payment (shows desired payment field)
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_3"]').click();
      
      // Desired monthly payment field should appear
      cy.get('[name="desiredMonthlyPayment"]').should('be.visible')
        .type('2500')
        .should('have.value', '2,500');

      // Test Option 4: Increase payment to reduce term (shows desired term slider)
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_4"]').click();
      
      // Desired term slider should appear
      cy.get('[data-qa="desired-term-slider"]').should('be.visible');
      cy.get('input[type="range"][name="desiredTerm"]')
        .invoke('val', 15)
        .trigger('input')
        .trigger('change');
    });

    it('should test adding multiple credit entries', () => {
      // Select refinancing goal
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_1"]').click();

      // Fill first credit entry
      fillCreditEntry(0, {
        bank: 'hapoalim',
        amount: '300000',
        monthlyPayment: '2500',
        startDate: '2019-06-01',
        endDate: '2039-06-01'
      });

      // Add second credit entry
      cy.get('button').contains('הוסף אשראי').click();
      
      // Fill second credit entry with different bank
      fillCreditEntry(1, {
        bank: 'leumi',
        amount: '200000',
        monthlyPayment: '1800',
        startDate: '2021-01-01',
        endDate: '2036-01-01'
      });

      // Add third credit entry
      cy.get('button').contains('הוסף אשראי').click();
      
      // Fill third credit entry
      fillCreditEntry(2, {
        bank: 'discount',
        amount: '150000',
        monthlyPayment: '1200',
        startDate: '2022-03-01',
        endDate: '2037-03-01'
      });

      // Test all bank options
      const banks = ['hapoalim', 'leumi', 'discount', 'massad', 'israel'];
      
      // Add more entries to test all banks
      banks.slice(3).forEach((bank, index) => {
        cy.get('button').contains('הוסף אשראי').click();
        fillCreditEntry(3 + index, {
          bank: bank,
          amount: `${100000 * (index + 1)}`,
          monthlyPayment: `${1000 * (index + 1)}`,
          startDate: `202${index}-01-01`,
          endDate: `204${index}-01-01`
        });
      });
    });

    it('should test credit entry deletion with modal confirmation', () => {
      // Add multiple credits first
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_1"]').click();

      // Fill first credit
      fillCreditEntry(0, {
        bank: 'hapoalim',
        amount: '500000',
        monthlyPayment: '4000',
        startDate: '2020-01-01',
        endDate: '2040-01-01'
      });

      // Add second credit
      cy.get('button').contains('הוסף אשראי').click();
      fillCreditEntry(1, {
        bank: 'leumi',
        amount: '300000',
        monthlyPayment: '2500',
        startDate: '2021-01-01',
        endDate: '2041-01-01'
      });

      // Try to delete second credit - should show confirmation modal
      cy.get('[data-testid="delete-credit-1"]').click();
      
      // Confirm deletion in modal
      cy.get('.modal').should('be.visible');
      cy.get('.modal button').contains('אישור').click();
      
      // Verify credit was deleted
      cy.get('[name="creditData[1].bank"]').should('not.exist');
    });

    it('should test date validations', () => {
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_1"]').click();

      // Test invalid date range (end before start)
      cy.get('[name="creditData[0].bank"]').click();
      cy.get('[data-value="hapoalim"]').click();
      cy.get('[name="creditData[0].amount"]').type('500000');
      cy.get('[name="creditData[0].monthlyPayment"]').type('4000');
      
      // Set end date before start date
      cy.get('[name="creditData[0].endDate"]').type('2019-01-01');
      cy.get('[name="creditData[0].startDate"]').type('2020-01-01');
      
      // Try to continue - should show validation error
      cy.get('button[type="submit"]').contains('המשך').click();
      cy.get('.error-message').should('be.visible');
    });

    it('should handle authentication flow when continuing', () => {
      // Fill form without being logged in
      cy.get('[name="refinancingCredit"]').click();
      cy.get('[data-value="option_1"]').click();
      
      fillCreditEntry(0, {
        bank: 'hapoalim',
        amount: '500000',
        monthlyPayment: '4000',
        startDate: '2020-01-01',
        endDate: '2040-01-01'
      });

      // Click continue - should show auth modal
      cy.get('button[type="submit"]').contains('המשך').click();
      
      // Phone verification modal should appear
      cy.get('.modal').should('be.visible');
      cy.get('input[name="phone"]').type(testPhone);
      cy.get('button').contains('קבל קוד').click();
      
      // Enter OTP
      cy.get('input[name="otp"]').type(testOTP);
      cy.get('button').contains('אמת').click();
      
      // Should proceed to step 2
      cy.url().should('include', '/services/refinance-credit/2');
    });
  });

  describe('Step 2: Personal Information - All Fields', () => {
    beforeEach(() => {
      // Navigate to step 2 with pre-filled step 1
      fillStep1AndProceed();
    });

    it('should fill all personal information fields', () => {
      // Basic Information
      cy.get('[name="firstName"]').type('ישראל');
      cy.get('[name="lastName"]').type('ישראלי');
      cy.get('[name="idNumber"]').type('123456789');
      cy.get('[name="birthday"]').type('1985-05-15');

      // Education dropdown - test all options
      cy.get('[name="education"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'בית ספר יסודי');
      cy.get('[data-value="option_2"]').should('contain', 'תיכון');
      cy.get('[data-value="option_3"]').should('contain', 'תעודה מקצועית');
      cy.get('[data-value="option_4"]').should('contain', 'תואר ראשון');
      cy.get('[data-value="option_5"]').should('contain', 'תואר שני');
      cy.get('[data-value="option_6"]').should('contain', 'דוקטורט');
      cy.get('[data-value="option_7"]').should('contain', 'אחר');
      cy.get('[data-value="option_4"]').click(); // Select Bachelor's degree

      // Citizenship dropdown - test all options
      cy.get('[name="citizenship"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'אזרח ישראלי');
      cy.get('[data-value="option_2"]').should('contain', 'עולה חדש');
      cy.get('[data-value="option_3"]').should('contain', 'תושב זר');
      cy.get('[data-value="option_1"]').click();

      // Family Status dropdown - test all options
      cy.get('[name="familyStatus"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'רווק');
      cy.get('[data-value="option_2"]').should('contain', 'נשוי');
      cy.get('[data-value="option_3"]').should('contain', 'גרוש');
      cy.get('[data-value="option_4"]').should('contain', 'אלמן');
      cy.get('[data-value="option_5"]').should('contain', 'זוגיות ללא נישואין');
      cy.get('[data-value="option_6"]').should('contain', 'אחר');
      cy.get('[data-value="option_2"]').click(); // Select Married

      // Medical Insurance - test both options
      cy.get('[name="medicalInsurance"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'כן');
      cy.get('[data-value="option_2"]').should('contain', 'לא');
      cy.get('[data-value="option_1"]').click();

      // Children number input
      cy.get('[name="children"]').type('2');

      // US Tax Reporting - test both options
      cy.get('[name="usTaxReporting"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'כן');
      cy.get('[data-value="option_2"]').should('contain', 'לא');
      cy.get('[data-value="option_2"]').click();

      // Public Person - test both options
      cy.get('[name="publicPerson"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'כן');
      cy.get('[data-value="option_2"]').should('contain', 'לא');
      cy.get('[data-value="option_2"]').click();

      // Foreigner - test both options
      cy.get('[name="foreigner"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'כן');
      cy.get('[data-value="option_2"]').should('contain', 'לא');
      cy.get('[data-value="option_2"]').click();

      // City selection
      cy.get('[name="city"]').type('תל אביב');
      cy.get('.autocomplete-dropdown').should('be.visible');
      cy.get('.autocomplete-dropdown li').first().click();

      // Street input
      cy.get('[name="street"]').type('רוטשילד 1');

      // Partner information (since married was selected)
      cy.get('[name="partnerFirstName"]').should('be.visible').type('שרה');
      cy.get('[name="partnerLastName"]').type('ישראלי');
      cy.get('[name="partnerIdNumber"]').type('987654321');
      cy.get('[name="partnerBirthday"]').type('1987-08-20');

      // Navigate to next step
      cy.get('button[type="submit"]').contains('המשך').click();
      cy.url().should('include', '/services/refinance-credit/3');
    });
  });

  describe('Step 3: Income & Obligations - All Modals and Fields', () => {
    beforeEach(() => {
      // Navigate to step 3
      fillStep1AndProceed();
      fillStep2AndProceed();
    });

    it('should test all income source options and modal interactions', () => {
      // Click Add Income Source button
      cy.get('button').contains('הוסף מקור הכנסה').click();
      
      // Modal should open
      cy.get('.modal').should('be.visible');
      
      // Test all income type options
      cy.get('[name="incomeType"]').click();
      cy.get('[data-value="salary"]').should('contain', 'משכורת');
      cy.get('[data-value="selfEmployed"]').should('contain', 'עצמאי');
      cy.get('[data-value="pension"]').should('contain', 'פנסיה');
      cy.get('[data-value="unemploymentBenefits"]').should('contain', 'דמי אבטלה');
      cy.get('[data-value="investmentIncome"]').should('contain', 'הכנסה מהשקעות');
      cy.get('[data-value="studentAllowance"]').should('contain', 'מלגת סטודנט');
      cy.get('[data-value="other"]').should('contain', 'אחר');
      cy.get('[data-value="salary"]').click();

      // Fill income details
      cy.get('[name="amount"]').type('15000');
      cy.get('[name="startDate"]').type('2018-01-01');
      cy.get('[name="companyName"]').type('חברת הייטק בע"מ');
      cy.get('[name="jobTitle"]').type('מהנדס תוכנה');
      
      // Save income
      cy.get('.modal button').contains('שמור').click();
      
      // Verify income was added
      cy.get('.income-list-item').should('have.length', 1);
    });

    it('should test additional income options', () => {
      // Click Add Additional Income button
      cy.get('button').contains('הוסף הכנסה נוספת').click();
      
      // Modal should open
      cy.get('.modal').should('be.visible');
      
      // Test all additional income options
      cy.get('[name="additionalIncomeType"]').click();
      cy.get('[data-value="partTime"]').should('contain', 'עבודה במשרה חלקית');
      cy.get('[data-value="freelance"]').should('contain', 'עבודה עצמאית');
      cy.get('[data-value="rental"]').should('contain', 'הכנסה מהשכרת נכס');
      cy.get('[data-value="investment"]').should('contain', 'תשואות השקעות');
      cy.get('[data-value="business"]').should('contain', 'הכנסה מעסק');
      cy.get('[data-value="government"]').should('contain', 'הטבות ממשלתיות');
      cy.get('[data-value="none"]').should('contain', 'אין');
      cy.get('[data-value="rental"]').click();

      // Fill additional income details
      cy.get('[name="additionalAmount"]').type('3500');
      
      // Save additional income
      cy.get('.modal button').contains('שמור').click();
    });

    it('should test all obligation types', () => {
      // Click Add Obligation button
      cy.get('button').contains('הוסף התחייבות').click();
      
      // Modal should open
      cy.get('.modal').should('be.visible');
      
      // Test all obligation type options
      cy.get('[name="obligationType"]').click();
      cy.get('[data-value="mortgage"]').should('contain', 'משכנתא');
      cy.get('[data-value="personalLoan"]').should('contain', 'הלוואה אישית');
      cy.get('[data-value="creditCard"]').should('contain', 'חוב כרטיס אשראי');
      cy.get('[data-value="carLoan"]').should('contain', 'הלוואת רכב');
      cy.get('[data-value="none"]').should('contain', 'אין התחייבויות');
      cy.get('[data-value="carLoan"]').click();

      // Test bank dropdown in obligations
      cy.get('[name="obligationBank"]').click();
      cy.get('[data-value="hapoalim"]').should('exist');
      cy.get('[data-value="leumi"]').should('exist');
      cy.get('[data-value="discount"]').should('exist');
      cy.get('[data-value="massad"]').should('exist');
      cy.get('[data-value="israel"]').should('exist');
      cy.get('[data-value="discount"]').click();

      // Fill obligation details
      cy.get('[name="monthlyPayment"]').type('2500');
      cy.get('[name="endDate"]').type('2028-12-01');
      
      // Save obligation
      cy.get('.modal button').contains('שמור').click();
    });

    it('should test editing and deleting items', () => {
      // Add an income first
      cy.get('button').contains('הוסף מקור הכנסה').click();
      cy.get('[name="incomeType"]').click();
      cy.get('[data-value="salary"]').click();
      cy.get('[name="amount"]').type('12000');
      cy.get('.modal button').contains('שמור').click();

      // Edit the income
      cy.get('.income-list-item button[aria-label="edit"]').click();
      cy.get('[name="amount"]').clear().type('13000');
      cy.get('.modal button').contains('שמור').click();

      // Delete the income
      cy.get('.income-list-item button[aria-label="delete"]').click();
      // Confirm deletion in modal
      cy.get('.modal button').contains('אישור').click();

      // Navigate to next step
      cy.get('button[type="submit"]').contains('המשך').click();
      cy.url().should('include', '/services/refinance-credit/4');
    });
  });

  describe('Step 4: Bank Offers - Results and Interactions', () => {
    beforeEach(() => {
      // Navigate to step 4
      fillStep1AndProceed();
      fillStep2AndProceed();
      fillStep3AndProceed();
    });

    it('should display and interact with bank offers', () => {
      // Verify warning alert is displayed
      cy.get('.alert-warning').should('be.visible')
        .and('contain', 'שים לב');

      // Test filter options
      cy.get('.filter-component').should('be.visible');
      
      // Test bank filters
      cy.get('.bank-filter-checkbox[data-bank="hapoalim"]').click();
      cy.get('.bank-filter-checkbox[data-bank="leumi"]').click();
      cy.get('.bank-filter-checkbox[data-bank="discount"]').click();

      // Test sorting dropdown
      cy.get('[name="sortBy"]').click();
      cy.get('[data-value="interestRate"]').click();

      // Interact with bank offers
      cy.get('.bank-offer-card').first().click();
      cy.get('.bank-offer-details').should('be.visible');

      // Test back button
      cy.get('button').contains('חזרה').click();
      cy.url().should('include', '/services/refinance-credit/3');
      
      // Go forward again
      cy.get('button[type="submit"]').contains('המשך').click();

      // Test submit button (triggers auth if not authenticated)
      cy.get('button').contains('שלח').click();
      
      // Should either submit or show auth modal
      cy.get('.modal, .success-message').should('be.visible');
    });
  });

  // Helper functions
  function fillCreditEntry(index: number, data: {
    bank: string;
    amount: string;
    monthlyPayment: string;
    startDate: string;
    endDate: string;
  }) {
    cy.get(`[name="creditData[${index}].bank"]`).click();
    cy.get(`[data-value="${data.bank}"]`).click();
    
    cy.get(`[name="creditData[${index}].amount"]`)
      .type(data.amount)
      .should('have.value', formatNumber(data.amount));
    
    cy.get(`[name="creditData[${index}].monthlyPayment"]`)
      .type(data.monthlyPayment)
      .should('have.value', formatNumber(data.monthlyPayment));
    
    cy.get(`[name="creditData[${index}].startDate"]`).type(data.startDate);
    cy.get(`[name="creditData[${index}].endDate"]`).type(data.endDate);
  }

  function formatNumber(value: string): string {
    return parseInt(value).toLocaleString('en-US');
  }

  function fillStep1AndProceed() {
    cy.visit('/services/refinance-credit/1');
    cy.get('[name="refinancingCredit"]').click();
    cy.get('[data-value="option_1"]').click();
    
    fillCreditEntry(0, {
      bank: 'hapoalim',
      amount: '500000',
      monthlyPayment: '4000',
      startDate: '2020-01-01',
      endDate: '2040-01-01'
    });

    // Handle authentication if needed
    cy.get('button[type="submit"]').contains('המשך').click();
    
    // If auth modal appears, handle it
    cy.get('body').then($body => {
      if ($body.find('.modal').length > 0) {
        cy.get('input[name="phone"]').type(testPhone);
        cy.get('button').contains('קבל קוד').click();
        cy.get('input[name="otp"]').type(testOTP);
        cy.get('button').contains('אמת').click();
      }
    });
    
    cy.url().should('include', '/services/refinance-credit/2');
  }

  function fillStep2AndProceed() {
    // Fill minimal required fields for step 2
    cy.get('[name="firstName"]').type('ישראל');
    cy.get('[name="lastName"]').type('ישראלי');
    cy.get('[name="idNumber"]').type('123456789');
    cy.get('[name="birthday"]').type('1985-05-15');
    cy.get('[name="education"]').click();
    cy.get('[data-value="option_4"]').click();
    cy.get('[name="citizenship"]').click();
    cy.get('[data-value="option_1"]').click();
    cy.get('[name="familyStatus"]').click();
    cy.get('[data-value="option_2"]').click();
    cy.get('[name="medicalInsurance"]').click();
    cy.get('[data-value="option_1"]').click();
    cy.get('[name="children"]').type('2');
    cy.get('[name="city"]').type('תל אביב');
    cy.wait(500);
    cy.get('.autocomplete-dropdown li').first().click();
    cy.get('[name="street"]').type('רוטשילד 1');
    
    cy.get('button[type="submit"]').contains('המשך').click();
    cy.url().should('include', '/services/refinance-credit/3');
  }

  function fillStep3AndProceed() {
    // Add minimal income
    cy.get('button').contains('הוסף מקור הכנסה').click();
    cy.get('[name="incomeType"]').click();
    cy.get('[data-value="salary"]').click();
    cy.get('[name="amount"]').type('15000');
    cy.get('.modal button').contains('שמור').click();
    
    cy.get('button[type="submit"]').contains('המשך').click();
    cy.url().should('include', '/services/refinance-credit/4');
  }
});