/// <reference types="cypress" />

describe('Phase 5 E2E: Credit Calculator Happy Path - Multi-Language', () => {
  const LANGUAGES = ['en', 'he', 'ru'];
  
  // Test data for credit calculation
  const testData = {
    loanAmount: 100000,
    monthlyPayment: 3000,
    loanPeriod: 36,
    
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
      monthlyIncome: 15000,
      employerName: 'Test Company Ltd'
    }
  };

  // Language-specific content
  const languageContent = {
    en: {
      pageTitle: 'Credit Calculator',
      loanPurpose: {
        personal: 'Personal Loan',
        business: 'Business Loan',
        vehicle: 'Vehicle Purchase',
        renovation: 'Home Renovation'
      },
      creditType: {
        regular: 'Regular Credit',
        balloon: 'Balloon Payment',
        revolving: 'Revolving Credit'
      },
      nextButton: 'Next',
      previousButton: 'Previous',
      calculateButton: 'Calculate'
    },
    he: {
      pageTitle: 'מחשבון אשראי',
      loanPurpose: {
        personal: 'הלוואה אישית',
        business: 'הלוואה עסקית',
        vehicle: 'רכישת רכב',
        renovation: 'שיפוץ דירה'
      },
      creditType: {
        regular: 'אשראי רגיל',
        balloon: 'תשלום בלון',
        revolving: 'אשראי מתחדש'
      },
      nextButton: 'הבא',
      previousButton: 'הקודם',
      calculateButton: 'חשב'
    },
    ru: {
      pageTitle: 'Кредитный калькулятор',
      loanPurpose: {
        personal: 'Личный кредит',
        business: 'Бизнес кредит',
        vehicle: 'Покупка автомобиля',
        renovation: 'Ремонт квартиры'
      },
      creditType: {
        regular: 'Обычный кредит',
        balloon: 'Баллонный платеж',
        revolving: 'Возобновляемый кредит'
      },
      nextButton: 'Далее',
      previousButton: 'Назад',
      calculateButton: 'Рассчитать'
    }
  };

  LANGUAGES.forEach(lang => {
    describe(`Language: ${lang.toUpperCase()}`, () => {
      beforeEach(() => {
        // Clear session data
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // Visit credit calculator
        cy.visit(`http://localhost:5173/calculate-credit?lang=${lang}`);
        
        // Wait for language setup
        cy.wait(1000);
        
        // Verify language
        cy.window().then(win => {
          expect(win.localStorage.getItem('i18nextLng')).to.equal(lang);
        });
      });

      it(`should complete credit calculator flow in ${lang.toUpperCase()}`, () => {
        const content = languageContent[lang];
        
        // Step 1: Credit Parameters
        cy.log(`📋 Step 1: Credit Parameters (${lang})`);
        
        // Wait for form to load
        cy.get('[data-testid="credit-step1-form"]', { timeout: 10000 }).should('be.visible');
        
        // Test loan purpose dropdown (if exists)
        cy.get('body').then($body => {
          if ($body.find('[data-testid="loan-purpose-dropdown"]').length) {
            cy.get('[data-testid="loan-purpose-dropdown"]').click();
            cy.contains(content.loanPurpose.personal).click();
          }
        });
        
        // Test credit type dropdown (if exists)
        cy.get('body').then($body => {
          if ($body.find('[data-testid="credit-type-dropdown"]').length) {
            cy.get('[data-testid="credit-type-dropdown"]').click();
            cy.contains(content.creditType.regular).click();
          }
        });
        
        // Fill numeric fields
        cy.get('[data-testid="loan-amount"]').clear().type(testData.loanAmount.toString());
        cy.get('[data-testid="monthly-payment"]').clear().type(testData.monthlyPayment.toString());
        cy.get('[data-testid="loan-period"]').clear().type(testData.loanPeriod.toString());
        
        // Click next
        cy.contains('button', content.nextButton).click();
        
        // Step 2: Personal Information
        cy.log(`📋 Step 2: Personal Information (${lang})`);
        cy.get('[data-testid="credit-step2-form"]', { timeout: 10000 }).should('be.visible');
        
        // Fill personal info
        cy.get('[data-testid="first-name"]').type(testData.personalInfo.firstName);
        cy.get('[data-testid="last-name"]').type(testData.personalInfo.lastName);
        cy.get('[data-testid="id-number"]').type(testData.personalInfo.idNumber);
        cy.get('[data-testid="phone"]').type(testData.personalInfo.phone);
        cy.get('[data-testid="email"]').type(testData.personalInfo.email);
        
        // Click next
        cy.contains('button', content.nextButton).click();
        
        // Step 3: Income Information
        cy.log(`📋 Step 3: Income Information (${lang})`);
        cy.get('[data-testid="credit-step3-form"]', { timeout: 10000 }).should('be.visible');
        
        // Fill income data
        cy.get('[data-testid="monthly-income"]').type(testData.incomeData.monthlyIncome.toString());
        cy.get('[data-testid="employer-name"]').type(testData.incomeData.employerName);
        
        // Click calculate
        cy.contains('button', content.calculateButton).click();
        
        // Step 4: Results
        cy.log(`📋 Step 4: Results (${lang})`);
        cy.get('[data-testid="credit-results"]', { timeout: 10000 }).should('be.visible');
        
        // Verify results are displayed
        cy.get('[data-testid="credit-offers"]').should('exist');
        cy.get('[data-testid="offer-card"]').should('have.length.greaterThan', 0);
        
        // Check RTL for Hebrew
        if (lang === 'he') {
          cy.get('body').should('have.attr', 'dir', 'rtl');
        }
      });

      it(`should validate required fields in ${lang.toUpperCase()}`, () => {
        // Try to proceed without filling fields
        cy.contains('button', languageContent[lang].nextButton).click();
        
        // Should show validation errors
        cy.get('.error-message').should('be.visible');
        
        // Fill required fields
        cy.get('[data-testid="loan-amount"]').type('50000');
        cy.get('[data-testid="monthly-payment"]').type('2000');
        cy.get('[data-testid="loan-period"]').type('24');
        
        // Should proceed now
        cy.contains('button', languageContent[lang].nextButton).click();
        cy.get('[data-testid="credit-step2-form"]').should('be.visible');
      });
    });
  });

  describe('API Integration', () => {
    it('should handle API errors gracefully', () => {
      // Intercept and force an error
      cy.intercept('GET', '**/api/dropdowns/**', { statusCode: 500 }).as('dropdownError');
      
      cy.visit('http://localhost:5173/calculate-credit?lang=en');
      
      // Should still render the form with fallback values
      cy.get('[data-testid="credit-step1-form"]').should('be.visible');
      
      // Basic fields should still work
      cy.get('[data-testid="loan-amount"]').should('exist');
    });
  });
});