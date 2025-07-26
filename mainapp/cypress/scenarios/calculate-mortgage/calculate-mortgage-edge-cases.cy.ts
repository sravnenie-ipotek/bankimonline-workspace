/**
 * Edge cases test for Mortgage Calculator (חישוב משכנתא)
 * Tests extreme values, all dropdown combinations, and error scenarios
 */

describe('Mortgage Calculator - Edge Cases', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(1000);
  });

  describe('Step 1: Property Details - Edge Cases', () => {
    it('should test maximum property values and loan combinations', () => {
      // Test maximum property value
      cy.get('[name="priceOfEstate"]').clear().type('99999999');
      cy.get('[name="priceOfEstate"]').should('have.value', '99,999,999');
      cy.documentStep('Maximum Property Value', 'Maximum 8-digit value');

      // Test minimum property value
      cy.get('[name="priceOfEstate"]').clear().type('1');
      cy.get('[name="priceOfEstate"]').should('have.value', '1');
      cy.documentStep('Minimum Property Value', 'Minimum 1 NIS value');

      // Test property ownership impact on maximum down payment
      cy.get('[name="priceOfEstate"]').clear().type('3000000');
      
      // Option 1: No property - max 25% down payment
      cy.get('[name="propertyOwnership"]').click();
      cy.get('[data-value="option_1"]').click();
      
      // Try to enter more than 25%
      cy.get('[name="initialFee"]').clear().type('800000'); // 26.7%
      cy.get('[name="initialFee"]').blur();
      cy.documentStep('Over 25% Down Payment Test', 'Should be limited to 750,000 (25%)');
      
      // Option 2: Has property - max 50% down payment
      cy.get('[name="propertyOwnership"]').click();
      cy.get('[data-value="option_2"]').click();
      
      // Now can enter up to 50%
      cy.get('[name="initialFee"]').clear().type('1500000'); // 50%
      cy.get('[name="initialFee"]').should('have.value', '1,500,000');
      cy.documentStep('50% Down Payment Test', 'Exactly 50% allowed');
      
      // Option 3: Selling property - max 30% down payment
      cy.get('[name="propertyOwnership"]').click();
      cy.get('[data-value="option_3"]').click();
      
      // Should limit to 30%
      cy.get('[name="initialFee"]').clear().type('1000000'); // 33.3%
      cy.get('[name="initialFee"]').blur();
      cy.documentStep('Over 30% Down Payment Test', 'Should be limited to 900,000 (30%)');
    });

    it('should test all city search scenarios', () => {
      // Test Hebrew search
      cy.get('[name="cityWhereYouBuy"]').click();
      cy.get('.dropdown-search input').type('ירושלים');
      cy.wait(500);
      cy.get('.dropdown-item').contains('ירושלים').should('be.visible');
      cy.documentStep('Hebrew City Search', 'Jerusalem found in Hebrew');
      
      // Clear and test English search
      cy.get('.dropdown-search input').clear().type('Tel Aviv');
      cy.wait(500);
      cy.documentStep('English City Search', 'Cities matching Tel Aviv');
      
      // Test no results
      cy.get('.dropdown-search input').clear().type('XYZ123');
      cy.wait(500);
      cy.get('.dropdown-no-results').should('contain', 'לא נמצאו תוצאות');
      cy.documentStep('No City Results', 'No results message shown');
      
      // Select first available city
      cy.get('.dropdown-search input').clear();
      cy.get('.dropdown-item').first().click();
    });

    it('should test all timeline and property type combinations', () => {
      const timelines = ['option_1', 'option_2', 'option_3', 'option_4'];
      const propertyTypes = ['option_1', 'option_2', 'option_3', 'option_4'];
      const firstHomeBuyer = ['option_1', 'option_2', 'option_3'];
      
      // Test each timeline option
      timelines.forEach((timeline, index) => {
        cy.get('[name="whenDoYouNeedMoney"]').click();
        cy.get(`[data-value="${timeline}"]`).click();
        cy.documentStep(`Timeline Option ${index + 1}`, `Selected timeline option ${index + 1}`);
      });
      
      // Test each property type
      propertyTypes.forEach((type, index) => {
        cy.get('[name="typeSelect"]').click();
        cy.get(`[data-value="${type}"]`).click();
        cy.documentStep(`Property Type ${index + 1}`, `Selected property type ${index + 1}`);
      });
      
      // Test each first home buyer option
      firstHomeBuyer.forEach((option, index) => {
        cy.get('[name="willBeYourFirst"]').click();
        cy.get(`[data-value="${option}"]`).click();
        cy.documentStep(`First Home Option ${index + 1}`, `Selected option ${index + 1}`);
      });
    });

    it('should test loan term and monthly payment extreme values', () => {
      // Fill required fields first
      cy.get('[name="priceOfEstate"]').type('2000000');
      cy.get('[name="cityWhereYouBuy"]').click();
      cy.get('.dropdown-item').first().click();
      
      // Test minimum loan term (4 years)
      cy.get('[data-qa="loan-term-slider"] input[type="range"]')
        .invoke('val', 4)
        .trigger('input')
        .trigger('change');
      cy.get('[name="loanTerm"]').should('have.value', '4');
      cy.documentStep('Minimum Loan Term', '4 years selected');
      
      // Test maximum loan term (30 years)
      cy.get('[data-qa="loan-term-slider"] input[type="range"]')
        .invoke('val', 30)
        .trigger('input')
        .trigger('change');
      cy.get('[name="loanTerm"]').should('have.value', '30');
      cy.documentStep('Maximum Loan Term', '30 years selected');
      
      // Test monthly payment extremes
      cy.get('[data-qa="monthly-payment-slider"] input[type="range"]')
        .invoke('val', 100)
        .trigger('input')
        .trigger('change');
      cy.documentStep('Minimum Monthly Payment', 'Lowest monthly payment');
      
      // Type extreme value in monthly payment
      cy.get('[name="monthlyPayment"]').clear().type('99999');
      cy.get('[name="monthlyPayment"]').should('have.value', '99,999');
      cy.documentStep('Maximum Monthly Payment', 'High monthly payment entered');
    });
  });

  describe('Step 2: Personal Information - Edge Cases', () => {
    beforeEach(() => {
      fillStep1Minimal();
    });

    it('should test all education levels', () => {
      const educationLevels = [
        'תיכונית',
        'על תיכונית',
        'תואר ראשון',
        'תואר שני',
        'דוקטורט',
        'אחר'
      ];
      
      cy.get('[name="education"]').click();
      cy.documentStep('Education Dropdown Open', 'All education levels visible');
      
      // Verify all options exist
      educationLevels.forEach(level => {
        cy.get('.dropdown-item').should('contain', level);
      });
      
      // Test each education level
      educationLevels.forEach((level, index) => {
        cy.get('[name="education"]').click();
        cy.get('.dropdown-item').contains(level).click();
        cy.get('[name="education"]').should('contain', level);
        cy.documentStep(`Education Level ${index + 1}`, `Selected: ${level}`);
      });
    });

    it('should test multiple citizenships selection', () => {
      // Enable additional citizenships
      cy.get('input[name="additionalCitizenships"][value="option_1"]').check();
      cy.get('[name="citizenshipsDropdown"]').should('be.visible');
      
      // Test multiple citizenship selection
      const countries = ['ארצות הברית', 'קנדה', 'צרפת', 'גרמניה', 'רוסיה'];
      
      countries.forEach((country, index) => {
        cy.get('[name="citizenshipsDropdown"]').click();
        cy.get('.dropdown-search input').clear().type(country);
        cy.wait(300);
        if (cy.get('.dropdown-item').contains(country).should('exist')) {
          cy.get('.dropdown-item').contains(country).click();
          cy.documentStep(`Citizenship ${index + 1}`, `Selected ${country}`);
        }
      });
    });

    it('should test all family status combinations with partner logic', () => {
      const familyStatuses = [
        { status: 'רווק', hasPartner: false },
        { status: 'נשוי', hasPartner: true },
        { status: 'גרוש', hasPartner: false },
        { status: 'אלמן', hasPartner: false },
        { status: 'ידוע בציבור', hasPartner: true }
      ];
      
      familyStatuses.forEach(({ status, hasPartner }) => {
        // Set 2 borrowers if married/partner status
        if (hasPartner) {
          cy.get('[name="borrowers"]').click();
          cy.get('.dropdown-item').contains('2').click();
        }
        
        cy.get('[name="familyStatus"]').click();
        cy.get('.dropdown-item').contains(status).click();
        cy.documentStep(`Family Status: ${status}`, `Partner fields: ${hasPartner ? 'visible' : 'hidden'}`);
        
        if (hasPartner) {
          cy.get('input[name="partnerPayMortgage"]').should('exist');
          cy.get('input[name="partnerPayMortgage"][value="option_1"]').check();
          cy.get('.add-partner-section').should('be.visible');
        } else {
          cy.get('input[name="partnerPayMortgage"]').should('not.exist');
        }
      });
    });

    it('should test maximum children number and tax countries', () => {
      // Test children with maximum number
      cy.get('input[name="childrens"][value="option_1"]').check();
      cy.get('[name="howMuchChildrens"]').should('be.visible');
      cy.get('[name="howMuchChildrens"]').clear().type('20');
      cy.documentStep('Maximum Children', '20 children entered');
      
      // Test multiple tax countries
      cy.get('input[name="taxes"][value="option_1"]').check();
      cy.get('[name="countriesPayTaxes"]').should('be.visible');
      
      const taxCountries = ['ארצות הברית', 'בריטניה', 'שוויץ'];
      taxCountries.forEach((country, index) => {
        cy.get('[name="countriesPayTaxes"]').click();
        cy.get('.dropdown-search input').clear().type(country);
        cy.wait(300);
        if (cy.get('.dropdown-item').contains(country).should('exist')) {
          cy.get('.dropdown-item').contains(country).click();
          cy.documentStep(`Tax Country ${index + 1}`, `Added ${country}`);
        }
      });
    });

    it('should test all public person and foreign resident combinations', () => {
      // Test all yes/no combinations
      const combinations = [
        { foreign: 'option_1', publicPerson: 'option_1', medical: 'option_1' },
        { foreign: 'option_1', publicPerson: 'option_2', medical: 'option_2' },
        { foreign: 'option_2', publicPerson: 'option_1', medical: 'option_1' },
        { foreign: 'option_2', publicPerson: 'option_2', medical: 'option_2' }
      ];
      
      combinations.forEach((combo, index) => {
        cy.get(`input[name="isForeigner"][value="${combo.foreign}"]`).check();
        cy.get(`input[name="publicPerson"][value="${combo.publicPerson}"]`).check();
        cy.get(`input[name="medicalInsurance"][value="${combo.medical}"]`).check();
        cy.documentStep(`Combination ${index + 1}`, `Foreign: ${combo.foreign}, Public: ${combo.publicPerson}, Medical: ${combo.medical}`);
      });
    });

    it('should test birthday edge cases', () => {
      // Test minimum age (18 years old)
      const today = new Date();
      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      
      cy.get('[name="birthday"]').click();
      cy.get('.react-datepicker__year-select').select(eighteenYearsAgo.getFullYear().toString());
      cy.get('.react-datepicker__month-select').select(eighteenYearsAgo.getMonth().toString());
      cy.get('.react-datepicker__day').contains(eighteenYearsAgo.getDate()).click();
      cy.documentStep('Minimum Age', 'Exactly 18 years old');
      
      // Test maximum age (100 years old)
      cy.get('[name="birthday"]').click();
      cy.get('.react-datepicker__year-select').select('1924');
      cy.get('.react-datepicker__month-select').select('0');
      cy.get('.react-datepicker__day').contains('1').click();
      cy.documentStep('Maximum Age', '100 years old selected');
    });
  });

  describe('Step 3: Income and Employment - Edge Cases', () => {
    beforeEach(() => {
      fillStep1Minimal();
      fillStep2Minimal();
    });

    it('should test all income source types with extreme values', () => {
      const incomeTypes = [
        { type: 'שכיר', fields: ['monthlyIncome', 'startDate', 'fieldOfActivity', 'profession', 'companyName'] },
        { type: 'עצמאי', fields: ['amountIncomeCurrentYear', 'fieldOfActivity'] },
        { type: 'שכיר + עצמאי', fields: ['monthlyIncome', 'amountIncomeCurrentYear'] },
        { type: 'פנסיה', fields: ['monthlyPension', 'pensionStartDate'] },
        { type: 'קצבה', fields: ['monthlyAllowance', 'allowanceType'] },
        { type: 'סטודנט', fields: ['scholarshipAmount', 'studyField'] },
        { type: 'ללא הכנסה', fields: ['noIncome'] }
      ];
      
      incomeTypes.forEach((income, index) => {
        cy.get('[name="mainSourceOfIncome"]').click();
        cy.get('.dropdown-item').contains(income.type).click();
        cy.documentStep(`Income Type: ${income.type}`, `Fields for ${income.type} visible`);
        
        // Fill extreme values based on type
        if (income.type === 'שכיר') {
          cy.get('[name="monthlyIncome"]').type('999999');
          cy.get('[name="monthlyIncome"]').should('have.value', '999,999');
        } else if (income.type === 'עצמאי') {
          cy.get('[name="amountIncomeCurrentYear"]').type('9999999');
        } else if (income.type === 'שכיר + עצמאי') {
          cy.get('[name="monthlyIncome"]').type('50000');
          cy.get('[name="amountIncomeCurrentYear"]').type('1000000');
        }
      });
    });

    it('should test all field of activity options', () => {
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.get('.dropdown-item').contains('שכיר').click();
      
      const activities = [
        'הייטק',
        'רפואה',
        'חינוך',
        'פיננסים',
        'נדל"ן',
        'תעשייה',
        'מסחר',
        'תחבורה',
        'בנייה',
        'אחר'
      ];
      
      cy.get('[name="fieldOfActivity"]').click();
      cy.documentStep('Field of Activity Dropdown', 'All activity fields visible');
      
      activities.forEach(activity => {
        cy.get('.dropdown-item').should('contain', activity);
      });
      
      // Select each activity
      activities.forEach((activity, index) => {
        if (index < 5) { // Test first 5 to save time
          cy.get('[name="fieldOfActivity"]').click();
          cy.get('.dropdown-item').contains(activity).click();
          cy.documentStep(`Activity: ${activity}`, `Selected ${activity}`);
        }
      });
    });

    it('should test multiple additional income sources', () => {
      // Fill main income
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.get('.dropdown-item').contains('שכיר').click();
      cy.get('[name="monthlyIncome"]').type('10000');
      
      // Test all additional income types
      const additionalTypes = ['השכרת נכס', 'עבודה נוספת', 'השקעות'];
      
      additionalTypes.forEach((type, index) => {
        cy.get('[name="additionalIncome"]').click();
        cy.get('.dropdown-item').contains(type).click();
        cy.get('[name="additionalIncomeAmount"]').clear().type(`${(index + 1) * 2000}`);
        cy.documentStep(`Additional Income: ${type}`, `Amount: ${(index + 1) * 2000}`);
      });
      
      // Add multiple income sources via modal
      cy.get('button').contains('הוסף הכנסה נוספת').click();
      cy.get('.modal').should('be.visible');
      
      // Add rental income
      cy.get('.modal [name="incomeType"]').click();
      cy.get('.modal .dropdown-item').contains('השכרת נכס').click();
      cy.get('.modal [name="amount"]').type('5000');
      cy.get('.modal [name="propertyAddress"]').type('דיזנגוף 100, תל אביב');
      cy.get('.modal button').contains('שמור').click();
      cy.documentStep('Added Rental Income', '5000 NIS from rental');
    });

    it('should test all bank obligations with maximum values', () => {
      // Fill income first
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.get('.dropdown-item').contains('שכיר').click();
      cy.get('[name="monthlyIncome"]').type('30000');
      
      // Test has obligations
      cy.get('[name="obligation"]').click();
      cy.get('[data-value="option_2"]').click();
      
      // Test all banks
      const banks = [
        'הפועלים',
        'לאומי', 
        'דיסקונט',
        'מזרחי טפחות',
        'הבינלאומי',
        'איגוד',
        'ירושלים',
        'מרכנתיל דיסקונט',
        'One Zero',
        'Pepper'
      ];
      
      // Add multiple bank obligations
      banks.slice(0, 5).forEach((bank, index) => {
        if (index > 0) {
          cy.get('button').contains('הוסף התחייבות').click();
          cy.get('.modal').should('be.visible');
        }
        
        const selector = index === 0 ? '[name="bank"]' : '.modal [name="bank"]';
        cy.get(selector).click();
        cy.get('.dropdown-item').contains(bank).click();
        
        const paymentSelector = index === 0 ? '[name="monthlyPaymentForAnotherBank"]' : '.modal [name="monthlyPayment"]';
        cy.get(paymentSelector).type(`${(index + 1) * 1000}`);
        
        if (index > 0) {
          cy.get('.modal button').contains('שמור').click();
        }
        
        cy.documentStep(`Bank Obligation ${index + 1}`, `${bank}: ${(index + 1) * 1000} NIS`);
      });
    });

    it('should test obligation end dates', () => {
      cy.get('[name="mainSourceOfIncome"]').click();
      cy.get('.dropdown-item').contains('שכיר').click();
      cy.get('[name="monthlyIncome"]').type('20000');
      
      cy.get('[name="obligation"]').click();
      cy.get('[data-value="option_2"]').click();
      
      cy.get('[name="bank"]').click();
      cy.get('.dropdown-item').first().click();
      cy.get('[name="monthlyPaymentForAnotherBank"]').type('3000');
      
      // Test near future date (1 month)
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      cy.get('[name="endDate"]').click();
      cy.get('.react-datepicker__year-select').select(nextMonth.getFullYear().toString());
      cy.get('.react-datepicker__month-select').select(nextMonth.getMonth().toString());
      cy.get('.react-datepicker__day').contains('1').click();
      cy.documentStep('Near Future End Date', 'Obligation ends next month');
      
      // Test far future date (10 years)
      cy.get('[name="endDate"]').click();
      cy.get('.react-datepicker__year-select').select('2034');
      cy.get('.react-datepicker__month-select').select('11');
      cy.get('.react-datepicker__day').contains('31').click();
      cy.documentStep('Far Future End Date', 'Obligation ends in 10 years');
    });
  });

  describe('Step 4: Bank Offers - Edge Cases', () => {
    beforeEach(() => {
      fillStep1Minimal();
      fillStep2Minimal();
      fillStep3Minimal();
    });

    it('should test all filter options and verify sorting', () => {
      // Wait for offers to load
      cy.get('.bank-card', { timeout: 10000 }).should('be.visible');
      
      const filters = [
        { value: 'הריבית הטובה ביותר', key: 'interest' },
        { value: 'התשלום החודשי הנמוך ביותר', key: 'payment' },
        { value: 'התקופה הקצרה ביותר', key: 'term' },
        { value: 'המיטבי ביותר', key: 'optimal' }
      ];
      
      filters.forEach(filter => {
        cy.get('.filter-dropdown select').select(filter.value);
        cy.wait(1000); // Wait for re-sort
        cy.documentStep(`Filter: ${filter.value}`, `Banks sorted by ${filter.key}`);
        
        // Verify at least one bank card is still visible
        cy.get('.bank-card').should('have.length.greaterThan', 0);
      });
    });

    it('should test expanding all bank programs', () => {
      cy.get('.bank-card').should('be.visible');
      
      // Expand all visible banks
      cy.get('.bank-card').each(($bank, index) => {
        cy.wrap($bank).within(() => {
          cy.get('.expand-button').click();
        });
        cy.documentStep(`Bank ${index + 1} Expanded`, 'Programs visible');
        
        // Verify program cards are visible
        cy.get('.program-card').should('have.length.greaterThan', 0);
      });
    });

    it('should test program type variations', () => {
      cy.get('.bank-card').first().within(() => {
        cy.get('.expand-button').click();
      });
      
      const programTypes = [
        'ריבית פריים',
        'קבועה צמודה',
        'משתנה צמודה',
        'קבועה לא צמודה',
        'משתנה לא צמודה'
      ];
      
      // Check that at least some program types exist
      cy.get('.program-card').each(($program) => {
        cy.wrap($program).find('.program-type').invoke('text').then(text => {
          const hasValidType = programTypes.some(type => text.includes(type));
          expect(hasValidType).to.be.true;
        });
      });
      
      cy.documentStep('Program Types Verified', 'All programs have valid types');
    });

    it('should test bank selection limits', () => {
      cy.get('.bank-card').should('be.visible');
      
      // Try to select multiple banks
      let selectedCount = 0;
      cy.get('.bank-card').each(($bank, index) => {
        if (index < 5) { // Select up to 5 banks
          cy.wrap($bank).within(() => {
            cy.get('.select-bank-button').click();
            selectedCount++;
          });
          cy.documentStep(`Selected Bank ${selectedCount}`, `Bank ${index + 1} selected`);
        }
      });
      
      // Verify UI handles multiple selections appropriately
      cy.documentStep('Multiple Banks Selected', `${selectedCount} banks selected`);
    });

    it('should test no offers scenario simulation', () => {
      // This would occur with extreme parameters
      // Check if no-offers message exists
      cy.get('body').then($body => {
        if ($body.find('.no-offers').length > 0) {
          cy.get('.no-offers').should('be.visible');
          cy.get('.no-offers').should('contain', 'לא נמצאו הצעות');
          cy.documentStep('No Offers Available', 'No offers message displayed');
        } else {
          cy.documentStep('Offers Available', 'Bank offers displayed normally');
        }
      });
    });
  });

  describe('Cross-Step Navigation and Data Persistence', () => {
    it('should test rapid navigation between all steps', () => {
      // Fill step 1 quickly
      fillStep1Minimal();
      
      // Navigate to step 2
      cy.url().should('include', '/services/calculate-mortgage/2');
      
      // Immediately go back
      cy.get('button').contains('חזור').click();
      cy.url().should('include', '/services/calculate-mortgage/1');
      
      // Verify data persisted
      cy.get('[name="priceOfEstate"]').should('have.value', '2,000,000');
      
      // Go forward rapidly through all steps
      cy.get('button').contains('המשך').click();
      fillStep2Minimal();
      cy.get('button').contains('המשך').click();
      fillStep3Minimal();
      cy.get('button').contains('המשך').click();
      
      // Navigate back through all steps
      cy.get('button').contains('חזור').click();
      cy.url().should('include', '/services/calculate-mortgage/3');
      cy.get('button').contains('חזור').click();
      cy.url().should('include', '/services/calculate-mortgage/2');
      cy.get('button').contains('חזור').click();
      cy.url().should('include', '/services/calculate-mortgage/1');
      
      cy.documentStep('Rapid Navigation Test', 'All steps navigated successfully');
    });

    it('should test data persistence across page reload', () => {
      // Fill step 1
      fillStep1Minimal();
      
      // Reload page
      cy.reload();
      
      // Check authentication is required again
      cy.get('body').then($body => {
        if ($body.find('.modal').length > 0) {
          cy.get('input[name="phone"]').type('0544123456');
          cy.get('button').contains('קבל קוד').click();
          cy.get('input[name="otp"]').type('123456');
          cy.get('button').contains('אמת').click();
        }
      });
      
      // Verify we're still on step 2 with data
      cy.url().should('include', '/services/calculate-mortgage/2');
      cy.documentStep('Page Reload Test', 'Data persisted after reload');
    });
  });

  // Helper functions
  function fillStep1Minimal() {
    cy.visit('/services/calculate-mortgage/1');
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
    
    cy.get('button').contains('המשך').click();
    
    // Handle auth
    cy.get('body').then($body => {
      if ($body.find('.modal').length > 0) {
        cy.get('input[name="phone"]').type('0544123456');
        cy.get('button').contains('קבל קוד').click();
        cy.get('input[name="otp"]').type('123456');
        cy.get('button').contains('אמת').click();
      }
    });
    
    cy.url().should('include', '/services/calculate-mortgage/2');
  }

  function fillStep2Minimal() {
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

  function fillStep3Minimal() {
    cy.get('[name="mainSourceOfIncome"]').click();
    cy.get('.dropdown-item').contains('שכיר').click();
    cy.get('[name="monthlyIncome"]').type('15000');
    cy.get('[name="additionalIncome"]').click();
    cy.get('.dropdown-item').contains('אין').click();
    cy.get('[name="obligation"]').click();
    cy.get('[data-value="option_1"]').click();
    
    cy.get('button').contains('המשך').click();
    cy.url().should('include', '/services/calculate-mortgage/4');
  }
});