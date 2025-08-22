/// <reference types="cypress" />

describe('Phase 5 E2E: Refinance Calculator Happy Path - Multi-Language', () => {
  const LANGUAGES = ['en', 'he', 'ru'];
  
  // Test data for refinance calculation
  const testData = {
    currentLoanBalance: 800000,
    monthlyPayment: 4500,
    remainingYears: 20,
    currentInterestRate: 3.5,
    propertyValue: 2500000,
    
    // Personal data
    personalInfo: {
      firstName: 'Test',
      lastName: 'Refinancer',
      idNumber: '987654321',
      birthYear: '1985',
      phone: '0544987654',
      email: 'refinance@example.com'
    },
    
    // Bank info
    bankInfo: {
      accountNumber: '123456',
      branchNumber: '789'
    }
  };

  // Language-specific content
  const languageContent = {
    en: {
      pageTitle: 'Refinance Calculator',
      refinanceType: {
        lowerPayment: 'Lower Monthly Payment',
        shorterPeriod: 'Shorter Loan Period',
        cashOut: 'Cash Out Refinance',
        betterRate: 'Better Interest Rate'
      },
      currentBank: {
        hapoalim: 'Bank Hapoalim',
        leumi: 'Bank Leumi',
        discount: 'Discount Bank',
        mizrahi: 'Mizrahi Bank'
      },
      nextButton: 'Next',
      previousButton: 'Previous',
      calculateButton: 'Calculate Savings'
    },
    he: {
      pageTitle: 'מחשבון מחזור משכנתא',
      refinanceType: {
        lowerPayment: 'הורדת תשלום חודשי',
        shorterPeriod: 'קיצור תקופת הלוואה',
        cashOut: 'מחזור עם משיכת כסף',
        betterRate: 'ריבית טובה יותר'
      },
      currentBank: {
        hapoalim: 'בנק הפועלים',
        leumi: 'בנק לאומי',
        discount: 'בנק דיסקונט',
        mizrahi: 'בנק מזרחי'
      },
      nextButton: 'הבא',
      previousButton: 'הקודם',
      calculateButton: 'חשב חיסכון'
    },
    ru: {
      pageTitle: 'Калькулятор рефинансирования',
      refinanceType: {
        lowerPayment: 'Снижение ежемесячного платежа',
        shorterPeriod: 'Сокращение срока кредита',
        cashOut: 'Рефинансирование с выводом средств',
        betterRate: 'Лучшая процентная ставка'
      },
      currentBank: {
        hapoalim: 'Банк Апоалим',
        leumi: 'Банк Леуми',
        discount: 'Дисконт Банк',
        mizrahi: 'Банк Мизрахи'
      },
      nextButton: 'Далее',
      previousButton: 'Назад',
      calculateButton: 'Рассчитать экономию'
    }
  };

  LANGUAGES.forEach(lang => {
    describe(`Language: ${lang.toUpperCase()}`, () => {
      beforeEach(() => {
        // Clear session data
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // Visit refinance calculator
        cy.visit(`http://localhost:5173/refinance-mortgage?lang=${lang}`);
        
        // Wait for language setup
        cy.wait(1000);
        
        // Verify language
        cy.window().then(win => {
          expect(win.localStorage.getItem('i18nextLng')).to.equal(lang);
        });
      });

      it(`should complete refinance calculator flow in ${lang.toUpperCase()}`, () => {
        const content = languageContent[lang];
        
        // Step 1: Current Mortgage Details
        cy.log(`📋 Step 1: Current Mortgage Details (${lang})`);
        
        // Wait for form to load
        cy.get('[data-testid="refinance-step1-form"]', { timeout: 10000 }).should('be.visible');
        
        // Test refinance type dropdown (database-driven)
        cy.get('[data-testid="refinance-type-dropdown"]').should('exist').click();
        cy.contains(content.refinanceType.lowerPayment).should('be.visible').click();
        
        // Test current bank dropdown (database-driven)
        cy.get('[data-testid="current-bank-dropdown"]').should('exist').click();
        cy.contains(content.currentBank.hapoalim).should('be.visible').click();
        
        // Fill current mortgage details
        cy.get('[data-testid="current-balance"]').clear().type(testData.currentLoanBalance.toString());
        cy.get('[data-testid="current-payment"]').clear().type(testData.monthlyPayment.toString());
        cy.get('[data-testid="remaining-years"]').clear().type(testData.remainingYears.toString());
        cy.get('[data-testid="current-rate"]').clear().type(testData.currentInterestRate.toString());
        cy.get('[data-testid="property-value"]').clear().type(testData.propertyValue.toString());
        
        // Click next
        cy.contains('button', content.nextButton).click();
        
        // Step 2: Personal Information
        cy.log(`📋 Step 2: Personal Information (${lang})`);
        cy.get('[data-testid="refinance-step2-form"]', { timeout: 10000 }).should('be.visible');
        
        // Fill personal info
        cy.get('[data-testid="first-name"]').type(testData.personalInfo.firstName);
        cy.get('[data-testid="last-name"]').type(testData.personalInfo.lastName);
        cy.get('[data-testid="id-number"]').type(testData.personalInfo.idNumber);
        cy.get('[data-testid="birth-year"]').type(testData.personalInfo.birthYear);
        cy.get('[data-testid="phone"]').type(testData.personalInfo.phone);
        cy.get('[data-testid="email"]').type(testData.personalInfo.email);
        
        // Click next
        cy.contains('button', content.nextButton).click();
        
        // Step 3: Bank Information
        cy.log(`📋 Step 3: Bank Information (${lang})`);
        cy.get('[data-testid="refinance-step3-form"]', { timeout: 10000 }).should('be.visible');
        
        // Fill bank info
        cy.get('[data-testid="account-number"]').type(testData.bankInfo.accountNumber);
        cy.get('[data-testid="branch-number"]').type(testData.bankInfo.branchNumber);
        
        // Click calculate
        cy.contains('button', content.calculateButton).click();
        
        // Step 4: Refinance Results
        cy.log(`📋 Step 4: Refinance Results (${lang})`);
        cy.get('[data-testid="refinance-results"]', { timeout: 10000 }).should('be.visible');
        
        // Verify savings calculation is displayed
        cy.get('[data-testid="monthly-savings"]').should('exist');
        cy.get('[data-testid="total-savings"]').should('exist');
        
        // Verify refinance offers
        cy.get('[data-testid="refinance-offers"]').should('exist');
        cy.get('[data-testid="refinance-offer-card"]').should('have.length.greaterThan', 0);
        
        // Check RTL for Hebrew
        if (lang === 'he') {
          cy.get('body').should('have.attr', 'dir', 'rtl');
        }
      });

      it(`should show different refinance options based on type in ${lang.toUpperCase()}`, () => {
        const content = languageContent[lang];
        
        // Test Cash Out refinance type
        cy.get('[data-testid="refinance-type-dropdown"]').click();
        cy.contains(content.refinanceType.cashOut).click();
        
        // Should show cash out amount field
        cy.get('[data-testid="cash-out-amount"]').should('be.visible');
        
        // Test Shorter Period type
        cy.get('[data-testid="refinance-type-dropdown"]').click();
        cy.contains(content.refinanceType.shorterPeriod).click();
        
        // Should show target period field
        cy.get('[data-testid="target-period"]').should('be.visible');
      });

      it(`should calculate LTV and show warnings in ${lang.toUpperCase()}`, () => {
        // Fill high loan amount relative to property value
        cy.get('[data-testid="current-balance"]').type('2000000');
        cy.get('[data-testid="property-value"]').type('2500000');
        
        // Should show high LTV warning (80% LTV)
        cy.get('[data-testid="ltv-warning"]').should('be.visible');
        
        // Adjust to lower LTV
        cy.get('[data-testid="current-balance"]').clear().type('1000000');
        
        // Warning should disappear (40% LTV)
        cy.get('[data-testid="ltv-warning"]').should('not.exist');
      });
    });
  });

  describe('Cross-Service Navigation', () => {
    it('should allow switching between calculator types', () => {
      // Start with refinance calculator
      cy.visit('http://localhost:5173/refinance-mortgage?lang=en');
      cy.get('[data-testid="refinance-step1-form"]').should('be.visible');
      
      // Navigate to regular mortgage calculator
      cy.get('[data-testid="nav-mortgage-calculator"]').click();
      cy.url().should('include', '/calculate-mortgage');
      cy.get('[data-testid="step1-form"]').should('be.visible');
      
      // Navigate to credit calculator
      cy.get('[data-testid="nav-credit-calculator"]').click();
      cy.url().should('include', '/calculate-credit');
      cy.get('[data-testid="credit-step1-form"]').should('be.visible');
      
      // Return to refinance
      cy.get('[data-testid="nav-refinance-calculator"]').click();
      cy.url().should('include', '/refinance-mortgage');
      cy.get('[data-testid="refinance-step1-form"]').should('be.visible');
    });
  });

  describe('Dropdown Caching and Performance', () => {
    it('should demonstrate 5-minute cache effectiveness', () => {
      // First visit - measure load time
      const startTime = Date.now();
      
      cy.visit('http://localhost:5173/refinance-mortgage?lang=en');
      cy.get('[data-testid="refinance-type-dropdown"]').should('exist');
      
      const firstLoadTime = Date.now() - startTime;
      cy.log(`First load time: ${firstLoadTime}ms`);
      
      // Second visit (immediate) - should use cache
      const cacheStartTime = Date.now();
      
      cy.reload();
      cy.get('[data-testid="refinance-type-dropdown"]').should('exist');
      
      const cacheLoadTime = Date.now() - cacheStartTime;
      cy.log(`Cache load time: ${cacheLoadTime}ms`);
      
      // Cache should be significantly faster
      expect(cacheLoadTime).to.be.lessThan(firstLoadTime);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Intercept and simulate network error
      cy.intercept('GET', '**/api/dropdowns/**', { forceNetworkError: true }).as('networkError');
      
      cy.visit('http://localhost:5173/refinance-mortgage?lang=en');
      
      // Form should still be usable with fallback behavior
      cy.get('[data-testid="refinance-step1-form"]').should('be.visible');
      
      // Basic fields should work
      cy.get('[data-testid="current-balance"]').should('exist').type('500000');
    });

    it('should handle empty dropdown responses', () => {
      // Intercept and return empty dropdown data
      cy.intercept('GET', '**/api/dropdowns/**', {
        status: 'success',
        dropdowns: [],
        options: {},
        placeholders: {},
        labels: {}
      }).as('emptyDropdowns');
      
      cy.visit('http://localhost:5173/refinance-mortgage?lang=en');
      
      // Form should still render
      cy.get('[data-testid="refinance-step1-form"]').should('be.visible');
      
      // Dropdowns might show empty or fallback state
      cy.get('[data-testid="refinance-type-dropdown"]').should('exist');
    });
  });
});