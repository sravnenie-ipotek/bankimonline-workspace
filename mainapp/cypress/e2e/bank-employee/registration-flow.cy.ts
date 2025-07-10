/**
 * Bank Employee Registration Flow - E2E Test Suite
 * 
 * Test Coverage:
 * - Page accessibility and load performance
 * - Form validation (positive and negative scenarios)
 * - Language switching functionality
 * - Navigation and user journey
 * - Error handling
 * - API interactions
 */

describe('Bank Employee Registration - Complete QA Test Suite', () => {
  // Test data
  const testData = {
    valid: {
      fullName: 'John Doe',
      position: 'Senior Manager',
      email: 'john.doe@bank.com',
      bankNumber: '12345',
      bankId: 1,
      branchId: 1,
      cityId: 1
    },
    invalid: {
      shortName: 'J',
      invalidEmail: 'notanemail',
      shortBankNumber: '12'
    }
  };

  // Reusable selectors
  const selectors = {
    fullNameInput: 'input[name="fullName"]',
    positionInput: 'input[name="position"]',
    emailInput: 'input[name="email"]',
    bankNumberInput: 'input[name="bankNumber"]',
    bankDropdown: '[data-testid="bank-dropdown"]',
    branchDropdown: '[data-testid="branch-dropdown"]',
    cityDropdown: '[data-testid="city-dropdown"]',
    termsCheckbox: 'input[name="acceptTerms"]',
    submitButton: 'button[type="submit"]',
    errorMessage: '.errorMessage',
    languageSelector: 'button[aria-haspopup="true"]'
  };

  beforeEach(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Set viewport to desktop
    cy.viewport(1280, 720);
    
    // Visit registration page
    cy.visit('/bank-employee/register');
    
    // Wait for page to fully load
    cy.get(selectors.fullNameInput).should('be.visible');
  });

  describe('Page Load and Initial State', () => {
    it('should load the registration page successfully', () => {
      // Check URL
      cy.url().should('include', '/bank-employee/register');
      
      // Check page title
      cy.title().should('exist');
      
      // Check main heading
      cy.get('h1').should('be.visible');
      
      // Verify all form fields are present
      cy.get(selectors.fullNameInput).should('exist');
      cy.get(selectors.positionInput).should('exist');
      cy.get(selectors.emailInput).should('exist');
      cy.get(selectors.bankNumberInput).should('exist');
      cy.get(selectors.termsCheckbox).should('exist');
      cy.get(selectors.submitButton).should('exist');
    });

    it('should have correct initial field states', () => {
      // All fields should be empty
      cy.get(selectors.fullNameInput).should('have.value', '');
      cy.get(selectors.positionInput).should('have.value', '');
      cy.get(selectors.emailInput).should('have.value', '');
      cy.get(selectors.bankNumberInput).should('have.value', '');
      
      // Terms checkbox should be unchecked
      cy.get(selectors.termsCheckbox).should('not.be.checked');
      
      // Submit button should exist
      cy.get(selectors.submitButton).should('be.visible');
    });

    it('should measure page load performance', () => {
      cy.window().then((win) => {
        const performance = win.performance;
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        // Page should load in under 3 seconds
        expect(navigationTiming.loadEventEnd - navigationTiming.fetchStart).to.be.lessThan(3000);
      });
    });
  });

  describe('Form Validation - Negative Tests', () => {
    it('should show validation errors for empty form submission', () => {
      // Try to submit empty form
      cy.get(selectors.submitButton).click();
      
      // Check for validation errors
      cy.get(selectors.errorMessage).should('have.length.greaterThan', 0);
      cy.contains('required').should('be.visible');
    });

    it('should validate minimum length for full name', () => {
      cy.get(selectors.fullNameInput).type(testData.invalid.shortName);
      cy.get(selectors.fullNameInput).blur();
      
      // Check for error message
      cy.get(selectors.fullNameInput).parent().parent().find(selectors.errorMessage)
        .should('contain', 'min');
    });

    it('should validate email format', () => {
      cy.get(selectors.emailInput).type(testData.invalid.invalidEmail);
      cy.get(selectors.emailInput).blur();
      
      // Check for email validation error
      cy.get(selectors.emailInput).parent().parent().find(selectors.errorMessage)
        .should('contain', 'invalid');
    });

    it('should validate bank number minimum length', () => {
      cy.get(selectors.bankNumberInput).type(testData.invalid.shortBankNumber);
      cy.get(selectors.bankNumberInput).blur();
      
      // Check for error
      cy.get(selectors.bankNumberInput).parent().parent().find(selectors.errorMessage)
        .should('contain', 'min');
    });

    it('should require terms acceptance', () => {
      // Fill all fields except terms
      cy.get(selectors.fullNameInput).type(testData.valid.fullName);
      cy.get(selectors.positionInput).type(testData.valid.position);
      cy.get(selectors.emailInput).type(testData.valid.email);
      cy.get(selectors.bankNumberInput).type(testData.valid.bankNumber);
      
      // Try to submit
      cy.get(selectors.submitButton).click();
      
      // Should show terms error
      cy.get(selectors.termsCheckbox).parent().parent().find(selectors.errorMessage)
        .should('be.visible');
    });
  });

  describe('Form Validation - Positive Tests', () => {
    it('should accept valid input in all fields', () => {
      // Fill form with valid data
      cy.get(selectors.fullNameInput).type(testData.valid.fullName);
      cy.get(selectors.fullNameInput).should('have.value', testData.valid.fullName);
      
      cy.get(selectors.positionInput).type(testData.valid.position);
      cy.get(selectors.positionInput).should('have.value', testData.valid.position);
      
      cy.get(selectors.emailInput).type(testData.valid.email);
      cy.get(selectors.emailInput).should('have.value', testData.valid.email);
      
      cy.get(selectors.bankNumberInput).type(testData.valid.bankNumber);
      cy.get(selectors.bankNumberInput).should('have.value', testData.valid.bankNumber);
    });

    it('should clear validation errors when correcting input', () => {
      // Type invalid data first
      cy.get(selectors.fullNameInput).type('A');
      cy.get(selectors.fullNameInput).blur();
      
      // Verify error appears
      cy.get(selectors.fullNameInput).parent().parent().find(selectors.errorMessage)
        .should('be.visible');
      
      // Clear and type valid data
      cy.get(selectors.fullNameInput).clear().type(testData.valid.fullName);
      cy.get(selectors.fullNameInput).blur();
      
      // Error should disappear
      cy.get(selectors.fullNameInput).parent().parent().find(selectors.errorMessage)
        .should('not.contain', 'min');
    });
  });

  describe('Dropdown Functionality', () => {
    it('should load and display banks dropdown', () => {
      // Click on bank dropdown
      cy.contains('bank_worker_select_bank').click();
      
      // Verify dropdown opens
      cy.get('.dropdownMenu').should('be.visible');
      
      // Verify search input exists
      cy.get('.searchInputText').should('exist');
    });

    it('should filter banks by search', () => {
      // Open bank dropdown
      cy.contains('bank_worker_select_bank').click();
      
      // Type in search
      cy.get('.searchInputText').type('Bank');
      
      // Verify filtered results
      cy.get('.navLink').should('have.length.greaterThan', 0);
    });

    it('should select a bank and update field', () => {
      // Open dropdown
      cy.contains('bank_worker_select_bank').click();
      
      // Select first bank
      cy.get('.navLink').first().click();
      
      // Verify selection
      cy.get('.selectedText').should('not.contain', 'bank_worker_select_bank');
    });
  });

  describe('Language Switching', () => {
    it('should switch to Hebrew and apply RTL', () => {
      // Click language selector
      cy.get(selectors.languageSelector).first().click();
      
      // Select Hebrew
      cy.contains('עברית').click();
      
      // Verify RTL is applied
      cy.get('html').should('have.attr', 'dir', 'rtl');
      
      // Verify language persists in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('language')).to.equal('he');
      });
    });

    it('should switch to Russian', () => {
      // Click language selector
      cy.get(selectors.languageSelector).first().click();
      
      // Select Russian
      cy.contains('Русский').click();
      
      // Verify text changes
      cy.get('h1').should('contain', 'Регистрация');
    });

    it('should maintain form data when switching languages', () => {
      // Fill some data
      cy.get(selectors.fullNameInput).type(testData.valid.fullName);
      
      // Switch language
      cy.get(selectors.languageSelector).first().click();
      cy.contains('Русский').click();
      
      // Verify data persists
      cy.get(selectors.fullNameInput).should('have.value', testData.valid.fullName);
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      // Set mobile viewport
      cy.viewport('iphone-x');
      
      // Verify elements are still accessible
      cy.get(selectors.fullNameInput).should('be.visible');
      cy.get(selectors.submitButton).should('be.visible');
    });

    it('should work on tablet viewport', () => {
      // Set tablet viewport
      cy.viewport('ipad-2');
      
      // Verify layout adjusts properly
      cy.get('.signUpForm').should('be.visible');
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels', () => {
      // Check language selector
      cy.get(selectors.languageSelector).should('have.attr', 'aria-haspopup', 'true');
      
      // Check form inputs have labels
      cy.get('label').should('have.length.greaterThan', 0);
    });

    it('should be keyboard navigable', () => {
      // Tab through form fields
      cy.get('body').tab();
      cy.focused().should('exist');
      
      // Continue tabbing
      cy.focused().tab();
      cy.focused().should('exist');
    });
  });

  describe('API Integration Tests', () => {
    it('should load banks from API', () => {
      // Intercept API call
      cy.intercept('GET', '/api/banks/list*').as('getBanks');
      
      // Reload page
      cy.reload();
      
      // Wait for API call
      cy.wait('@getBanks').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('data');
      });
    });

    it('should load cities from API', () => {
      // Intercept API call
      cy.intercept('GET', '/api/get-cities*').as('getCities');
      
      // Reload page
      cy.reload();
      
      // Wait for API call
      cy.wait('@getCities').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('data');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/banks/list*', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getBanksError');
      
      // Reload page
      cy.reload();
      
      // Page should still be functional
      cy.get(selectors.fullNameInput).should('be.visible');
    });
  });

  describe('Complete User Journey', () => {
    it('should complete full registration flow', () => {
      // Step 1: Fill personal information
      cy.get(selectors.fullNameInput).type(testData.valid.fullName);
      cy.get(selectors.positionInput).type(testData.valid.position);
      cy.get(selectors.emailInput).type(testData.valid.email);
      
      // Step 2: Select bank
      cy.contains('bank_worker_select_bank').click();
      cy.get('.navLink').first().click();
      
      // Step 3: Select city
      cy.contains('bank_worker_select_city').click();
      cy.get('.navLink').first().click();
      
      // Step 4: Enter bank number
      cy.get(selectors.bankNumberInput).type(testData.valid.bankNumber);
      
      // Step 5: Accept terms
      cy.get(selectors.termsCheckbox).check();
      
      // Step 6: Submit form
      cy.get(selectors.submitButton).click();
      
      // Verify success (in demo mode, should show alert)
      cy.on('window:alert', (text) => {
        expect(text).to.contain('Demo');
      });
    });
  });
});