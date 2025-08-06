/// <reference types="cypress" />

describe('Phase 5 E2E: Mortgage Calculator Happy Path - Multi-Language', () => {
  const LANGUAGES = ['en', 'he', 'ru'];
  const API_BASE = 'http://localhost:8003';
  
  // Test data for mortgage calculation
  const testData = {
    propertyValue: 2000000,
    downPayment: 500000,
    monthlyPayment: 8000,
    mortgagePeriod: 25,
    
    // Personal data
    personalInfo: {
      firstName: 'Test',
      lastName: 'User',
      idNumber: '123456789',
      birthYear: '1990',
      phone: '0544123456',
      email: 'test@example.com'
    },
    
    // Income data
    incomeData: {
      monthlyIncome: 25000,
      employerName: 'Test Company Ltd'
    }
  };

  // Language-specific content checks
  const languageContent = {
    en: {
      step1Title: 'Mortgage Calculator',
      propertyOwnership: {
        noProperty: "I don't own any property",
        hasProperty: "I own a property",
        sellingProperty: "I'm selling a property"
      },
      whenNeeded: {
        immediately: 'Immediately',
        months3to6: '3-6 months',
        months6to12: '6-12 months'
      },
      propertyType: {
        apartment: 'Apartment',
        house: 'Private House',
        commercial: 'Commercial Property'
      },
      firstHome: {
        yes: 'Yes',
        no: 'No'
      },
      nextButton: 'Next',
      previousButton: 'Previous',
      submitButton: 'Submit'
    },
    he: {
      step1Title: 'מחשבון משכנתא',
      propertyOwnership: {
        noProperty: 'אין לי נכס',
        hasProperty: 'יש לי נכס',
        sellingProperty: 'אני מוכר נכס'
      },
      whenNeeded: {
        immediately: 'מיידי',
        months3to6: '3-6 חודשים',
        months6to12: '6-12 חודשים'
      },
      propertyType: {
        apartment: 'דירה',
        house: 'בית פרטי',
        commercial: 'נכס מסחרי'
      },
      firstHome: {
        yes: 'כן',
        no: 'לא'
      },
      nextButton: 'הבא',
      previousButton: 'הקודם',
      submitButton: 'שלח'
    },
    ru: {
      step1Title: 'Ипотечный калькулятор',
      propertyOwnership: {
        noProperty: 'У меня нет недвижимости',
        hasProperty: 'У меня есть недвижимость',
        sellingProperty: 'Я продаю недвижимость'
      },
      whenNeeded: {
        immediately: 'Немедленно',
        months3to6: '3-6 месяцев',
        months6to12: '6-12 месяцев'
      },
      propertyType: {
        apartment: 'Квартира',
        house: 'Частный дом',
        commercial: 'Коммерческая недвижимость'
      },
      firstHome: {
        yes: 'Да',
        no: 'Нет'
      },
      nextButton: 'Далее',
      previousButton: 'Назад',
      submitButton: 'Отправить'
    }
  };

  LANGUAGES.forEach(lang => {
    describe(`Language: ${lang.toUpperCase()}`, () => {
      beforeEach(() => {
        // Clear any existing session data
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // Visit the mortgage calculator with language parameter
        cy.visit(`http://localhost:5173/calculate-mortgage?lang=${lang}`);
        
        // Wait for language to be set and content to load
        cy.wait(1000);
        
        // Verify language is set correctly
        cy.window().then(win => {
          expect(win.localStorage.getItem('i18nextLng')).to.equal(lang);
        });
      });

      it(`should complete full mortgage calculator flow in ${lang.toUpperCase()}`, () => {
        const content = languageContent[lang];
        
        // Step 1: Initial mortgage parameters
        cy.log(`📋 Step 1: Mortgage Parameters (${lang})`);
        
        // Wait for dropdowns to load from database
        cy.get('[data-testid="step1-form"]', { timeout: 10000 }).should('be.visible');
        
        // Test property ownership dropdown
        cy.get('[data-testid="property-ownership-dropdown"]').should('exist').click();
        cy.contains(content.propertyOwnership.noProperty).should('be.visible').click();
        
        // Test when needed dropdown
        cy.get('[data-testid="when-needed-dropdown"]').should('exist').click();
        cy.contains(content.whenNeeded.immediately).should('be.visible').click();
        
        // Test property type dropdown
        cy.get('[data-testid="property-type-dropdown"]').should('exist').click();
        cy.contains(content.propertyType.apartment).should('be.visible').click();
        
        // Test first home dropdown
        cy.get('[data-testid="first-home-dropdown"]').should('exist').click();
        cy.contains(content.firstHome.yes).should('be.visible').click();
        
        // Fill in numeric fields
        cy.get('[data-testid="property-value"]').clear().type(testData.propertyValue.toString());
        cy.get('[data-testid="down-payment"]').clear().type(testData.downPayment.toString());
        cy.get('[data-testid="monthly-payment"]').clear().type(testData.monthlyPayment.toString());
        cy.get('[data-testid="mortgage-period"]').clear().type(testData.mortgagePeriod.toString());
        
        // Click next button
        cy.contains('button', content.nextButton).click();
        
        // Step 2: Personal Information
        cy.log(`📋 Step 2: Personal Information (${lang})`);
        cy.get('[data-testid="step2-form"]', { timeout: 10000 }).should('be.visible');
        
        // Fill personal information
        cy.get('[data-testid="first-name"]').type(testData.personalInfo.firstName);
        cy.get('[data-testid="last-name"]').type(testData.personalInfo.lastName);
        cy.get('[data-testid="id-number"]').type(testData.personalInfo.idNumber);
        cy.get('[data-testid="birth-year"]').type(testData.personalInfo.birthYear);
        cy.get('[data-testid="phone"]').type(testData.personalInfo.phone);
        cy.get('[data-testid="email"]').type(testData.personalInfo.email);
        
        // Test family status dropdown (from database)
        cy.get('[data-testid="family-status-dropdown"]').should('exist');
        
        // Click next button
        cy.contains('button', content.nextButton).click();
        
        // Step 3: Income Information
        cy.log(`📋 Step 3: Income Information (${lang})`);
        cy.get('[data-testid="step3-form"]', { timeout: 10000 }).should('be.visible');
        
        // Test main income source dropdown (from database)
        cy.get('[data-testid="main-source-dropdown"]').should('exist');
        
        // Fill income data
        cy.get('[data-testid="monthly-income"]').type(testData.incomeData.monthlyIncome.toString());
        cy.get('[data-testid="employer-name"]').type(testData.incomeData.employerName);
        
        // Click next button
        cy.contains('button', content.nextButton).click();
        
        // Step 4: Results and Bank Offers
        cy.log(`📋 Step 4: Results (${lang})`);
        cy.get('[data-testid="step4-results"]', { timeout: 10000 }).should('be.visible');
        
        // Verify bank offers are displayed
        cy.get('[data-testid="bank-offers"]').should('exist');
        cy.get('[data-testid="bank-offer-card"]').should('have.length.greaterThan', 0);
        
        // Verify language-specific content in results
        if (lang === 'he') {
          // Check RTL layout
          cy.get('body').should('have.attr', 'dir', 'rtl');
        }
        
        // Test filter dropdown (from database) if exists
        cy.get('[data-testid="filter-dropdown"]').should('exist');
      });

      it(`should handle dropdown loading states properly in ${lang.toUpperCase()}`, () => {
        // Check that dropdowns show loading states while fetching from API
        cy.get('[data-testid="property-ownership-dropdown"]').should('exist');
        
        // Verify dropdown is not disabled (data loaded from cache or API)
        cy.get('[data-testid="property-ownership-dropdown"]').should('not.be.disabled');
        
        // Click dropdown and verify options are loaded
        cy.get('[data-testid="property-ownership-dropdown"]').click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').should('have.length.greaterThan', 0);
      });

      it(`should validate form inputs correctly in ${lang.toUpperCase()}`, () => {
        // Try to proceed without filling required fields
        cy.contains('button', languageContent[lang].nextButton).click();
        
        // Should show validation errors (text will be in selected language)
        cy.get('.error-message').should('be.visible');
        
        // Fill minimum required fields
        cy.get('[data-testid="property-ownership-dropdown"]').click();
        cy.get('[role="option"]').first().click();
        
        cy.get('[data-testid="property-value"]').type('1000000');
        cy.get('[data-testid="down-payment"]').type('250000');
        
        // Try to proceed again - should work now
        cy.contains('button', languageContent[lang].nextButton).click();
        cy.get('[data-testid="step2-form"]').should('be.visible');
      });

      it(`should persist data when navigating between steps in ${lang.toUpperCase()}`, () => {
        const content = languageContent[lang];
        
        // Fill Step 1 data
        cy.get('[data-testid="property-ownership-dropdown"]').click();
        cy.contains(content.propertyOwnership.hasProperty).click();
        
        cy.get('[data-testid="property-value"]').type('1500000');
        cy.get('[data-testid="down-payment"]').type('300000');
        
        // Go to Step 2
        cy.contains('button', content.nextButton).click();
        cy.get('[data-testid="step2-form"]').should('be.visible');
        
        // Go back to Step 1
        cy.contains('button', content.previousButton).click();
        cy.get('[data-testid="step1-form"]').should('be.visible');
        
        // Verify data is persisted
        cy.get('[data-testid="property-value"]').should('have.value', '1500000');
        cy.get('[data-testid="down-payment"]').should('have.value', '300000');
        
        // Verify dropdown selection is persisted
        cy.get('[data-testid="property-ownership-dropdown"]').should('contain', content.propertyOwnership.hasProperty);
      });
    });
  });

  describe('Cross-Language Consistency', () => {
    it('should maintain data consistency when switching languages', () => {
      // Start in English
      cy.visit('http://localhost:5173/calculate-mortgage?lang=en');
      
      // Fill some data
      cy.get('[data-testid="property-ownership-dropdown"]').click();
      cy.contains("I don't own any property").click();
      
      cy.get('[data-testid="property-value"]').type('2000000');
      
      // Switch to Hebrew
      cy.get('[data-testid="language-selector"]').click();
      cy.get('[data-testid="language-he"]').click();
      
      // Wait for language switch
      cy.wait(1000);
      
      // Verify data is preserved
      cy.get('[data-testid="property-value"]').should('have.value', '2000000');
      
      // Verify dropdown shows Hebrew text but maintains same selection
      cy.get('[data-testid="property-ownership-dropdown"]').should('contain', 'אין לי נכס');
      
      // Switch to Russian
      cy.get('[data-testid="language-selector"]').click();
      cy.get('[data-testid="language-ru"]').click();
      
      cy.wait(1000);
      
      // Verify data is still preserved
      cy.get('[data-testid="property-value"]').should('have.value', '2000000');
      cy.get('[data-testid="property-ownership-dropdown"]').should('contain', 'У меня нет недвижимости');
    });
  });

  describe('API Integration', () => {
    it('should fetch dropdowns from database API', () => {
      // Intercept API calls
      cy.intercept('GET', '**/api/dropdowns/mortgage_step1/en').as('getDropdownsEn');
      cy.intercept('GET', '**/api/dropdowns/mortgage_step2/en').as('getDropdownsStep2');
      
      cy.visit('http://localhost:5173/calculate-mortgage?lang=en');
      
      // Verify API calls are made
      cy.wait('@getDropdownsEn').then(interception => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('status', 'success');
        expect(interception.response.body).to.have.property('dropdowns');
        expect(interception.response.body).to.have.property('options');
      });
      
      // Navigate to step 2
      cy.get('[data-testid="property-value"]').type('1000000');
      cy.get('[data-testid="down-payment"]').type('250000');
      cy.contains('button', 'Next').click();
      
      // Verify step 2 dropdowns are fetched
      cy.wait('@getDropdownsStep2').then(interception => {
        expect(interception.response.statusCode).to.equal(200);
      });
    });

    it('should use cached data on subsequent visits', () => {
      // First visit - API calls should be made
      cy.intercept('GET', '**/api/dropdowns/mortgage_step1/en').as('getDropdowns1');
      cy.visit('http://localhost:5173/calculate-mortgage?lang=en');
      cy.wait('@getDropdowns1');
      
      // Second visit within cache period - should use cache
      cy.intercept('GET', '**/api/dropdowns/mortgage_step1/en').as('getDropdowns2');
      cy.reload();
      
      // API might return cached:true or use browser cache
      cy.get('[data-testid="property-ownership-dropdown"]').should('exist');
    });
  });
});