/**
 * Comprehensive test scenario for Mortgage Calculator (חישוב משכנתא)
 * Tests ALL possible variations, buttons, dropdowns, and inputs
 * Covers all 4 steps of the mortgage calculation process
 */

describe('Mortgage Calculator - Complete Scenario', () => {
  // Test data
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    // Clear session and visit the mortgage calculator page
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(1000); // Wait for initial load
    
    // Take initial screenshot
    cy.documentStep('Initial Page Load', 'Mortgage calculator step 1 loaded');
  });

  describe('Step 1: Property and Loan Details - All Fields', () => {
    it('should test all property ownership options and their impact on LTV', () => {
      // Test property ownership dropdown - CRITICAL for LTV calculation
      cy.get('[name="propertyOwnership"]').should('be.visible').click();
      cy.documentStep('Property Ownership Dropdown', 'All 3 options visible');
      
      // Test Option 1: No property (75% LTV)
      cy.get('[data-value="option_1"]').click();
      cy.documentStep('No Property Selected', '75% financing should be available');
      
      // Verify initial payment slider max is 25%
      cy.get('[name="initialFee"]').should('exist');
      cy.get('.slider-container input[type="range"]').should('have.attr', 'max', '25');
      
      // Test Option 2: Has property (50% LTV)
      cy.get('[name="propertyOwnership"]').click();
      cy.get('[data-value="option_2"]').click();
      cy.documentStep('Has Property Selected', '50% financing should be available');
      
      // Verify initial payment slider max is 50%
      cy.get('.slider-container input[type="range"]').should('have.attr', 'max', '50');
      
      // Test Option 3: Selling property (70% LTV)
      cy.get('[name="propertyOwnership"]').click();
      cy.get('[data-value="option_3"]').click();
      cy.documentStep('Selling Property Selected', '70% financing should be available');
      
      // Verify initial payment slider max is 30%
      cy.get('.slider-container input[type="range"]').should('have.attr', 'max', '30');
    });

    it('should fill all step 1 fields with all dropdown options', () => {
      // Property Value
      cy.get('[name="priceOfEstate"]').clear().type('2500000');
      cy.get('[name="priceOfEstate"]').should('have.value', '2,500,000');
      cy.documentStep('Property Value Entered', 'Formatted number display');
      
      // City Selection with search
      cy.get('[name="cityWhereYouBuy"]').click();
      cy.get('.dropdown-search input').type('תל אביב');
      cy.wait(500);
      cy.get('.dropdown-item').contains('תל אביב').click();
      cy.documentStep('City Selected', 'Tel Aviv selected from dropdown');
      
      // When Do You Need Money - test all 4 options
      cy.get('[name="whenDoYouNeedMoney"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'תוך חודש');
      cy.get('[data-value="option_2"]').should('contain', '1-3 חודשים');
      cy.get('[data-value="option_3"]').should('contain', '3-6 חודשים');
      cy.get('[data-value="option_4"]').should('contain', '6+ חודשים');
      cy.get('[data-value="option_2"]').click();
      cy.documentStep('Timeline Selected', '1-3 months option selected');
      
      // Property Ownership (critical for LTV)
      cy.get('[name="propertyOwnership"]').click();
      cy.get('[data-value="option_1"]').click(); // No property - 75% LTV
      
      // Initial Payment Slider - test different values
      cy.get('[data-qa="initial-payment-slider"] input[type="range"]')
        .invoke('val', 20)
        .trigger('input')
        .trigger('change');
      cy.documentStep('Down Payment Set', '20% down payment selected');
      
      // Also test typing in the input
      cy.get('[name="initialFee"]').clear().type('500000');
      cy.get('[name="initialFee"]').should('have.value', '500,000');
      
      // Mortgage Type - test all 4 options
      cy.get('[name="typeSelect"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'נכס חדש');
      cy.get('[data-value="option_2"]').should('contain', 'יד שנייה');
      cy.get('[data-value="option_3"]').should('contain', 'בנייה עצמית');
      cy.get('[data-value="option_4"]').should('contain', 'כל מטרה');
      cy.get('[data-value="option_2"]').click();
      cy.documentStep('Property Type Selected', 'Second-hand property selected');
      
      // First Home Purchase - test all 3 options
      cy.get('[name="willBeYourFirst"]').click();
      cy.get('[data-value="option_1"]').should('contain', 'כן');
      cy.get('[data-value="option_2"]').should('contain', 'לא');
      cy.get('[data-value="option_3"]').should('contain', 'לא בטוח');
      cy.get('[data-value="option_1"]').click();
      cy.documentStep('First Home', 'Yes - first home purchase');
      
      // Loan Term Slider - test different values
      cy.get('[data-qa="loan-term-slider"] input[type="range"]')
        .invoke('val', 25)
        .trigger('input')
        .trigger('change');
      cy.documentStep('Loan Term Set', '25 years selected');
      
      // Test edge values
      cy.get('[data-qa="loan-term-slider"] input[type="range"]')
        .invoke('val', 4) // Minimum
        .trigger('input')
        .trigger('change');
      
      cy.get('[data-qa="loan-term-slider"] input[type="range"]')
        .invoke('val', 30) // Maximum
        .trigger('input')
        .trigger('change');
      
      // Monthly Payment Slider
      cy.get('[data-qa="monthly-payment-slider"] input[type="range"]')
        .invoke('val', 8000)
        .trigger('input')
        .trigger('change');
      cy.documentStep('Monthly Payment Set', '8000 NIS monthly payment');
    });

    it('should test navigation and authentication flow', () => {
      // Fill minimum required fields
      cy.get('[name="priceOfEstate"]').type('2000000');
      cy.get('[name="cityWhereYouBuy"]').click();
      cy.get('.dropdown-item').first().click();
      cy.get('[name="whenDoYouNeedMoney"]').click();
      cy.get('[data-value="option_1"]').click();
      cy.get('[name="propertyOwnership"]').click();
      cy.get('[data-value="option_1"]').click();
      cy.get('[name="typeSelect"]').click();
      cy.get('[data-value="option_1"]').click();
      cy.get('[name="willBeYourFirst"]').click();
      cy.get('[data-value="option_1"]').click();
      
      // Click continue button
      cy.get('button').contains('המשך').click();
      
      // Should show phone verification modal
      cy.get('.modal').should('be.visible');
      cy.documentStep('Phone Verification Modal', 'Authentication required');
      
      // Enter phone and OTP
      cy.get('input[name="phone"]').type(testPhone);
      cy.get('button').contains('קבל קוד').click();
      cy.get('input[name="otp"]').type(testOTP);
      cy.get('button').contains('אמת').click();
      
      // Should navigate to step 2
      cy.url().should('include', '/services/calculate-mortgage/2');
    });
  });

  describe('Step 2: Personal Information - All Fields and Conditional Logic', () => {
    beforeEach(() => {
      fillStep1AndProceed();
    });

    it('should test all personal information fields and dropdowns', () => {
      // Name and Surname
      cy.get('[name="nameSurname"]').clear().type('משה ישראלי');
      cy.documentStep('Name Entered', 'Full name filled');
      
      // Birthday - test date picker
      cy.get('[name="birthday"]').click();
      cy.get('.react-datepicker__year-select').select('1985');
      cy.get('.react-datepicker__month-select').select('4'); // May
      cy.get('.react-datepicker__day').contains('15').click();
      cy.documentStep('Birthday Selected', '15/05/1985 selected');
      
      // Education dropdown - test all options
      cy.get('[name="education"]').click();
      cy.get('.dropdown-item').should('have.length.greaterThan', 5);
      cy.get('.dropdown-item').contains('תואר ראשון').click();
      cy.documentStep('Education Selected', 'Bachelor degree selected');
    });

    it('should test all yes/no radio button fields', () => {
      // Additional Citizenships - test both options
      cy.get('input[name="additionalCitizenships"][value="option_1"]').check();
      cy.documentStep('Additional Citizenship Yes', 'Citizenship dropdown should appear');
      
      // Citizenship dropdown should appear
      cy.get('[name="citizenshipsDropdown"]').should('be.visible');
      cy.get('[name="citizenshipsDropdown"]').click();
      cy.get('.dropdown-item').contains('ארצות הברית').click();
      
      // Switch to No
      cy.get('input[name="additionalCitizenships"][value="option_2"]').check();
      cy.get('[name="citizenshipsDropdown"]').should('not.exist');
      cy.documentStep('Additional Citizenship No', 'Citizenship dropdown hidden');
      
      // Pay Taxes in Other Countries - test conditional field
      cy.get('input[name="taxes"][value="option_1"]').check();
      cy.get('[name="countriesPayTaxes"]').should('be.visible');
      cy.get('[name="countriesPayTaxes"]').click();
      cy.get('.dropdown-item').first().click();
      cy.documentStep('Tax Countries Selected', 'Tax country dropdown shown and selected');
      
      // Have Children - test conditional field
      cy.get('input[name="childrens"][value="option_1"]').check();
      cy.get('[name="howMuchChildrens"]').should('be.visible');
      cy.get('[name="howMuchChildrens"]').clear().type('2');
      cy.documentStep('Children Number', '2 children entered');
      
      // Medical Insurance
      cy.get('input[name="medicalInsurance"][value="option_1"]').check();
      
      // Foreign Resident
      cy.get('input[name="isForeigner"][value="option_2"]').check();
      
      // Public Person
      cy.get('input[name="publicPerson"][value="option_2"]').check();
    });

    it('should test family status and partner logic', () => {
      // Number of Borrowers
      cy.get('[name="borrowers"]').click();
      cy.get('.dropdown-item').contains('2').click();
      cy.documentStep('Borrowers Selected', '2 borrowers selected');
      
      // Family Status - test all options
      cy.get('[name="familyStatus"]').click();
      cy.get('.dropdown-item').should('have.length.greaterThan', 4);
      
      // Select Married to trigger partner fields
      cy.get('.dropdown-item').contains('נשוי').click();
      cy.documentStep('Married Selected', 'Partner fields should appear');
      
      // Partner Pays Mortgage should appear
      cy.get('input[name="partnerPayMortgage"]').should('exist');
      cy.get('input[name="partnerPayMortgage"][value="option_1"]').check();
      
      // Add Partner component should appear
      cy.get('.add-partner-section').should('be.visible');
      cy.documentStep('Partner Section', 'Partner information section visible');
      
      // Test other family statuses
      cy.get('[name="familyStatus"]').click();
      cy.get('.dropdown-item').contains('רווק').click();
      cy.get('input[name="partnerPayMortgage"]').should('not.exist');
    });

    it('should test navigation buttons', () => {
      // Fill required fields
      cy.get('[name="nameSurname"]').type('טסט משתמש');
      cy.get('[name="birthday"]').type('1990-01-01');
      cy.get('[name="education"]').click();
      cy.get('.dropdown-item').first().click();
      cy.get('input[name="additionalCitizenships"][value="option_2"]').check();
      cy.get('input[name="taxes"][value="option_2"]').check();
      cy.get('input[name="childrens"][value="option_2"]').check();
      cy.get('input[name="medicalInsurance"][value="option_1"]').check();
      cy.get('input[name="isForeigner"][value="option_2"]').check();
      cy.get('input[name="publicPerson"][value="option_2"]').check();
      cy.get('[name="borrowers"]').click();
      cy.get('.dropdown-item').contains('1').click();
      cy.get('[name="familyStatus"]').click();
      cy.get('.dropdown-item').first().click();
      
      // Test Back button
      cy.get('button').contains('חזור').click();
      cy.url().should('include', '/services/calculate-mortgage/1');
      
      // Go forward again
      cy.get('button').contains('המשך').click();
      cy.url().should('include', '/services/calculate-mortgage/2');
      
      // Continue to step 3
      cy.get('button').contains('המשך').click();
      cy.url().should('include', '/services/calculate-mortgage/3');
    });
  });

  describe('Step 3: Income and Employment - All Fields and Modals', () => {
    beforeEach(() => {
      fillStep1AndProceed();
      fillStep2AndProceed();
    });

    it('should test all main income source options', () => {
      // Main Source of Income dropdown - test all options
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.documentStep('Income Source Dropdown', 'All income types visible');
      
      const incomeTypes = [
        'שכיר',
        'עצמאי',
        'שכיר + עצמאי',
        'פנסיה',
        'קצבה',
        'סטודנט',
        'ללא הכנסה'
      ];
      
      // Verify all options exist
      incomeTypes.forEach(type => {
        cy.get('.dropdown-item').should('contain', type);
      });
      
      // Select employed
      cy.get('.dropdown-item').contains('שכיר').click();
      cy.documentStep('Employed Selected', 'Employee form fields should appear');
      
      // Fill employment details
      cy.get('[name="monthlyIncome"]').type('15000');
      cy.get('[name="monthlyIncome"]').should('have.value', '15,000');
      
      cy.get('[name="startDate"]').click();
      cy.get('.react-datepicker__year-select').select('2020');
      cy.get('.react-datepicker__month-select').select('0'); // January
      cy.get('.react-datepicker__day').contains('1').click();
      
      cy.get('[name="fieldOfActivity"]').click();
      cy.get('.dropdown-item').contains('הייטק').click();
      
      cy.get('[name="profession"]').type('מהנדס תוכנה');
      cy.get('[name="companyName"]').type('חברת טכנולוגיה בע"מ');
      cy.documentStep('Employment Details', 'All employment fields filled');
    });

    it('should test additional income types and modal', () => {
      // Fill basic income first
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.get('.dropdown-item').contains('שכיר').click();
      cy.get('[name="monthlyIncome"]').type('12000');
      
      // Additional Income dropdown
      cy.get('[name="additionalIncome"]').click();
      cy.documentStep('Additional Income Dropdown', 'All additional income types visible');
      
      // Verify all additional income options
      const additionalIncomeTypes = [
        'השכרת נכס',
        'עבודה נוספת',
        'השקעות',
        'אין'
      ];
      
      additionalIncomeTypes.forEach(type => {
        cy.get('.dropdown-item').should('contain', type);
      });
      
      // Select rental income
      cy.get('.dropdown-item').contains('השכרת נכס').click();
      
      // Additional income amount should appear
      cy.get('[name="additionalIncomeAmount"]').should('be.visible');
      cy.get('[name="additionalIncomeAmount"]').type('3500');
      cy.documentStep('Additional Income Amount', 'Rental income amount entered');
      
      // Test "Add Additional Income" button
      cy.get('button').contains('הוסף הכנסה נוספת').click();
      cy.get('.modal').should('be.visible');
      cy.documentStep('Additional Income Modal', 'Modal opened for adding income');
      
      // Fill modal fields
      cy.get('.modal [name="incomeType"]').click();
      cy.get('.modal .dropdown-item').contains('השקעות').click();
      cy.get('.modal [name="amount"]').type('2000');
      cy.get('.modal button').contains('שמור').click();
    });

    it('should test obligations and all bank options', () => {
      // Fill basic income
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.get('.dropdown-item').contains('שכיר').click();
      cy.get('[name="monthlyIncome"]').type('20000');
      
      // Obligations dropdown
      cy.get('[name="obligation"]').click();
      cy.documentStep('Obligations Dropdown', 'All obligation types visible');
      
      // Select loan type
      cy.get('[data-value="option_2"]').click(); // Has obligations
      
      // Bank dropdown should appear
      cy.get('[name="bank"]').should('be.visible').click();
      cy.documentStep('Bank Dropdown', 'All banks visible');
      
      // Test all bank options
      const banks = [
        'הפועלים',
        'לאומי',
        'דיסקונט',
        'מזרחי',
        'הבינלאומי'
      ];
      
      banks.forEach(bank => {
        cy.get('.dropdown-item').should('contain', bank);
      });
      
      cy.get('.dropdown-item').contains('לאומי').click();
      
      // Fill obligation details
      cy.get('[name="monthlyPaymentForAnotherBank"]').type('2500');
      
      cy.get('[name="endDate"]').click();
      cy.get('.react-datepicker__year-select').select('2028');
      cy.get('.react-datepicker__month-select').select('11'); // December
      cy.get('.react-datepicker__day').contains('1').click();
      cy.documentStep('Obligation Details', 'Bank loan details filled');
      
      // Test "Add Obligation" button
      cy.get('button').contains('הוסף התחייבות').click();
      cy.get('.modal').should('be.visible');
      cy.documentStep('Obligation Modal', 'Modal for adding obligations');
      cy.get('.modal button').contains('ביטול').click();
    });

    it('should test income for self-employed and special cases', () => {
      // Test self-employed option
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.get('.dropdown-item').contains('עצמאי').click();
      cy.documentStep('Self Employed Selected', 'Self-employed fields appear');
      
      // Annual income fields should appear
      cy.get('[name="amountIncomeCurrentYear"]').should('be.visible');
      cy.get('[name="amountIncomeCurrentYear"]').type('250000');
      cy.documentStep('Annual Income', 'Annual income for current year');
      
      // Test unemployed option
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.get('.dropdown-item').contains('ללא הכנסה').click();
      cy.documentStep('No Income Selected', 'No income date field appears');
      
      // No income since date should appear
      cy.get('[name="noIncome"]').should('be.visible');
      cy.get('[name="noIncome"]').click();
      cy.get('.react-datepicker__year-select').select('2023');
      cy.get('.react-datepicker__month-select').select('5'); // June
      cy.get('.react-datepicker__day').contains('1').click();
    });

    it('should test adding multiple income sources', () => {
      // Fill first income
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.get('.dropdown-item').contains('שכיר').click();
      cy.get('[name="monthlyIncome"]').type('10000');
      
      // Add more income sources button
      cy.get('button').contains('הוסף מקור הכנסה').click();
      cy.get('.modal').should('be.visible');
      cy.documentStep('Income Source Modal', 'Modal for adding income sources');
      
      // Fill modal
      cy.get('.modal [name="incomeType"]').click();
      cy.get('.modal .dropdown-item').contains('עצמאי').click();
      cy.get('.modal [name="monthlyAmount"]').type('5000');
      cy.get('.modal [name="startDate"]').type('2021-01-01');
      cy.get('.modal [name="companyName"]').type('עסק עצמאי');
      cy.get('.modal button').contains('שמור').click();
      
      // Verify income was added
      cy.get('.income-list-item').should('have.length.greaterThan', 0);
      
      // Navigate to next step
      cy.get('button').contains('המשך').click();
      cy.url().should('include', '/services/calculate-mortgage/4');
    });
  });

  describe('Step 4: Bank Offers - All Interactions', () => {
    beforeEach(() => {
      fillStep1AndProceed();
      fillStep2AndProceed();
      fillStep3AndProceed();
    });

    it('should display user parameters and warning', () => {
      // Check UserParams component
      cy.get('.user-params').should('be.visible');
      cy.get('.user-params').should('contain', 'עלות הנכס');
      cy.get('.user-params').should('contain', 'מקדמה');
      cy.get('.user-params').should('contain', 'תקופת הלוואה');
      cy.documentStep('User Parameters', 'Summary of loan parameters displayed');
      
      // Check warning message
      cy.get('.alert-warning').should('be.visible');
      cy.get('.alert-warning').should('contain', 'שים לב');
      cy.documentStep('Warning Alert', 'Important notice displayed');
    });

    it('should test filter dropdown options', () => {
      // Filter dropdown
      cy.get('.filter-dropdown select').should('be.visible');
      cy.get('.filter-dropdown select').click();
      cy.documentStep('Filter Dropdown', 'All filter options visible');
      
      // Test all filter options
      const filterOptions = [
        'הריבית הטובה ביותר',
        'התשלום החודשי הנמוך ביותר',
        'התקופה הקצרה ביותר',
        'המיטבי ביותר'
      ];
      
      cy.get('.filter-dropdown select option').should('have.length', filterOptions.length + 1); // +1 for default
      
      // Select different filter
      cy.get('.filter-dropdown select').select('התשלום החודשי הנמוך ביותר');
      cy.documentStep('Filter Applied', 'Lowest monthly payment filter selected');
    });

    it('should test bank offers and program cards', () => {
      // Wait for bank offers to load
      cy.get('.bank-card', { timeout: 10000 }).should('be.visible');
      cy.documentStep('Bank Offers Loaded', 'Bank cards displayed');
      
      // Test first bank card
      cy.get('.bank-card').first().within(() => {
        // Check bank details
        cy.get('.bank-name').should('be.visible');
        cy.get('.total-loan').should('contain', '₪');
        cy.get('.monthly-payment').should('contain', '₪');
        cy.get('.total-repayment').should('contain', '₪');
        
        // Click to expand programs
        cy.get('.expand-button').click();
      });
      cy.documentStep('Bank Programs Expanded', 'Mortgage programs visible');
      
      // Test program cards
      cy.get('.program-card').first().within(() => {
        // Check program details
        cy.get('.program-name').should('be.visible');
        cy.get('.interest-rate').should('contain', '%');
        cy.get('.monthly-payment').should('contain', '₪');
        cy.get('.loan-period').should('contain', 'שנים');
        
        // Check program types
        cy.get('.program-type').should('contain.oneOf', [
          'ריבית פריים',
          'קבועה צמודה',
          'משתנה צמודה',
          'קבועה לא צמודה',
          'משתנה לא צמודה'
        ]);
      });
      cy.documentStep('Program Details', 'Mortgage program details displayed');
    });

    it('should test bank selection and registration', () => {
      // Wait for offers
      cy.get('.bank-card').should('be.visible');
      
      // Test multiple banks
      cy.get('.bank-card').each(($bank, index) => {
        if (index < 3) { // Test first 3 banks
          cy.wrap($bank).within(() => {
            // Click bank selection
            cy.get('.select-bank-button').click();
            cy.documentStep(`Bank ${index + 1} Selected`, 'Bank selection registered');
            
            // Check registration link/button
            cy.get('.registration-button, a[href*="register"]').should('be.visible');
          });
        }
      });
    });

    it('should test navigation back through all steps', () => {
      // Test back navigation
      cy.get('button').contains('חזור').click();
      cy.url().should('include', '/services/calculate-mortgage/3');
      cy.documentStep('Back to Step 3', 'Income step');
      
      cy.get('button').contains('חזור').click();
      cy.url().should('include', '/services/calculate-mortgage/2');
      cy.documentStep('Back to Step 2', 'Personal info step');
      
      cy.get('button').contains('חזור').click();
      cy.url().should('include', '/services/calculate-mortgage/1');
      cy.documentStep('Back to Step 1', 'Property details step');
      
      // Navigate forward again
      cy.get('button').contains('המשך').click();
      cy.url().should('include', '/services/calculate-mortgage/2');
    });

    it('should test final submission', () => {
      // Select a bank offer
      cy.get('.bank-card').first().find('.select-bank-button').click();
      cy.documentStep('Bank Selected', 'Ready for final submission');
      
      // Submit application
      cy.get('button').contains('שלח בקשה').click();
      
      // Should either show success or require additional authentication
      cy.get('.success-message, .modal').should('be.visible');
      cy.documentStep('Application Submitted', 'Final submission completed');
    });
  });

  // Helper functions
  function fillStep1AndProceed() {
    cy.visit('/services/calculate-mortgage/1');
    
    // Fill all required fields
    cy.get('[name="priceOfEstate"]').type('2000000');
    cy.get('[name="cityWhereYouBuy"]').click();
    cy.get('.dropdown-item').first().click();
    cy.get('[name="whenDoYouNeedMoney"]').click();
    cy.get('[data-value="option_1"]').click();
    cy.get('[name="propertyOwnership"]').click();
    cy.get('[data-value="option_1"]').click();
    cy.get('[name="typeSelect"]').click();
    cy.get('[data-value="option_1"]').click();
    cy.get('[name="willBeYourFirst"]').click();
    cy.get('[data-value="option_1"]').click();
    
    // Navigate
    cy.get('button').contains('המשך').click();
    
    // Handle auth if needed
    cy.get('body').then($body => {
      if ($body.find('.modal').length > 0) {
        cy.get('input[name="phone"]').type(testPhone);
        cy.get('button').contains('קבל קוד').click();
        cy.get('input[name="otp"]').type(testOTP);
        cy.get('button').contains('אמת').click();
      }
    });
    
    cy.url().should('include', '/services/calculate-mortgage/2');
  }

  function fillStep2AndProceed() {
    // Fill required fields
    cy.get('[name="nameSurname"]').type('טסט משתמש');
    cy.get('[name="birthday"]').type('1990-01-01');
    cy.get('[name="education"]').click();
    cy.get('.dropdown-item').first().click();
    cy.get('input[name="additionalCitizenships"][value="option_2"]').check();
    cy.get('input[name="taxes"][value="option_2"]').check();
    cy.get('input[name="childrens"][value="option_2"]').check();
    cy.get('input[name="medicalInsurance"][value="option_1"]').check();
    cy.get('input[name="isForeigner"][value="option_2"]').check();
    cy.get('input[name="publicPerson"][value="option_2"]').check();
    cy.get('[name="borrowers"]').click();
    cy.get('.dropdown-item').contains('1').click();
    cy.get('[name="familyStatus"]').click();
    cy.get('.dropdown-item').first().click();
    
    cy.get('button').contains('המשך').click();
    cy.url().should('include', '/services/calculate-mortgage/3');
  }

  function fillStep3AndProceed() {
    // Fill income
    cy.get('[name="mainSourceOfIncome"]').click();
    cy.get('.dropdown-item').contains('שכיר').click();
    cy.get('[name="monthlyIncome"]').type('15000');
    cy.get('[name="additionalIncome"]').click();
    cy.get('.dropdown-item').contains('אין').click();
    cy.get('[name="obligation"]').click();
    cy.get('[data-value="option_1"]').click(); // No obligations
    
    cy.get('button').contains('המשך').click();
    cy.url().should('include', '/services/calculate-mortgage/4');
  }
});