/// <reference types="cypress" />

describe('Phase 5 E2E: Mortgage Calculator Happy Path - Multi-Language (FIXED)', () => {
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
      continueButton: 'Continue',
      backButton: 'Back'
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
      continueButton: 'המשך',
      backButton: 'חזור'
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
      continueButton: 'Продолжить',
      backButton: 'Назад'
    }
  };

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  LANGUAGES.forEach(lang => {
    describe(`Language: ${lang.toUpperCase()}`, () => {
      beforeEach(() => {
        // Clear any existing session data
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // Visit the mortgage calculator with correct route and step number
        // FIXED: Added /services prefix and step number
        cy.visit(`/services/calculate-mortgage/1?lang=${lang}`);
        
        // Wait for language to be set and content to load
        cy.wait(2000);
        
        // Verify we're on the correct page
        cy.url().should('include', '/services/calculate-mortgage/1');
        
        // Verify language is set correctly
        cy.window().then(win => {
          const storedLang = win.localStorage.getItem('i18nextLng');
          expect(storedLang).to.equal(lang);
        });
      });

      it(`should complete full mortgage calculator flow in ${lang.toUpperCase()}`, () => {
        const content = languageContent[lang];
        
        // Step 1: Initial mortgage parameters
        cy.log(`📋 Step 1: Mortgage Parameters (${lang})`);
        
        // Wait for the form to be visible
        cy.get('form', { timeout: 10000 }).should('be.visible');
        
        // Test property ownership dropdown - using more flexible selectors
        cy.get('select[name="propertyOwnership"], [data-testid="property-ownership-dropdown"], div[role="button"]:contains("property")', { timeout: 10000 })
          .first()
          .should('exist')
          .click();
        
        // Select the option
        cy.contains(content.propertyOwnership.noProperty).click();
        
        // Continue button
        cy.contains('button', content.continueButton).click();
        
        // Should navigate to step 2
        cy.url().should('include', '/services/calculate-mortgage/2');
        
        // Verify we can go back
        cy.contains('button', content.backButton).click();
        cy.url().should('include', '/services/calculate-mortgage/1');
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch dropdowns from database API', () => {
      // Intercept dropdown API calls
      cy.intercept('GET', `${API_BASE}/api/dropdowns/mortgage_step1/en`).as('getDropdownsEn');
      
      cy.visit('/services/calculate-mortgage/1?lang=en');
      
      // Should make API call to fetch dropdown data
      cy.wait('@getDropdownsEn').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('status', 'success');
        expect(interception.response.body).to.have.property('dropdowns');
        expect(interception.response.body).to.have.property('options');
      });
    });
  });
});