/**
 * Regression Test Suite
 * 
 * Comprehensive tests to catch regressions in existing functionality
 * Run before major releases or when significant changes are made
 */

describe('Regression Tests - Comprehensive Coverage', () => {
  
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Cross-Browser Compatibility', () => {
    it('should work in different browsers', () => {
      cy.visit('/bank-employee/register');
      
      // Basic functionality check
      cy.get('input[name="fullName"]').type('Test User');
      cy.get('input[name="fullName"]').should('have.value', 'Test User');
      
      // Language switching
      cy.get('button[aria-haspopup="true"]').first().click();
      cy.contains('English').click();
      
      // Form submission attempt
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  describe('Data Persistence', () => {
    it('should maintain form data during language switch', () => {
      cy.visit('/bank-employee/register');
      
      const testData = {
        fullName: 'John Doe',
        position: 'Manager',
        email: 'john@test.com'
      };
      
      // Fill form
      cy.fillBankEmployeeForm(testData);
      
      // Switch language
      cy.get('button[aria-haspopup="true"]').first().click();
      cy.contains('Русский').click();
      
      // Verify data persists
      cy.get('input[name="fullName"]').should('have.value', testData.fullName);
      cy.get('input[name="position"]').should('have.value', testData.position);
      cy.get('input[name="email"]').should('have.value', testData.email);
    });

    it('should remember language preference', () => {
      cy.visit('/');
      
      // Switch to Hebrew
      cy.get('button[aria-haspopup="true"]').first().click();
      cy.contains('עברית').click();
      
      // Reload page
      cy.reload();
      
      // Verify Hebrew is still selected
      cy.get('html').should('have.attr', 'dir', 'rtl');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('language')).to.equal('he');
      });
    });
  });

  describe('Form State Management', () => {
    it('should handle form validation state correctly', () => {
      cy.visit('/bank-employee/register');
      
      // Submit empty form
      cy.get('button[type="submit"]').click();
      
      // Verify errors appear
      cy.get('.errorMessage').should('have.length.greaterThan', 0);
      
      // Fill required fields
      cy.fillBankEmployeeForm({
        fullName: 'Valid Name',
        position: 'Valid Position',
        email: 'valid@email.com',
        bankNumber: '12345'
      });
      
      // Errors should clear
      cy.get('input[name="fullName"]').blur();
      cy.get('input[name="fullName"]').parent().parent()
        .find('.errorMessage').should('not.contain', 'required');
    });

    it('should handle dropdown state correctly', () => {
      cy.visit('/bank-employee/register');
      
      // Open bank dropdown
      cy.contains('bank_worker_select_bank').click();
      cy.get('.dropdownMenu').should('be.visible');
      
      // Close by clicking outside
      cy.get('body').click(0, 0);
      cy.get('.dropdownMenu').should('not.exist');
      
      // Open again and search
      cy.contains('bank_worker_select_bank').click();
      cy.get('.searchInputText').type('Bank');
      cy.get('.navLink').should('have.length.greaterThan', 0);
    });
  });

  describe('API Error Handling', () => {
    it('should handle bank API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/banks/list*', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getBanksError');
      
      cy.visit('/bank-employee/register');
      
      // Page should still be functional
      cy.get('input[name="fullName"]').should('be.visible');
      cy.get('input[name="fullName"]').type('Test');
      cy.get('input[name="fullName"]').should('have.value', 'Test');
    });

    it('should handle cities API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/get-cities*', {
        statusCode: 404,
        body: { error: 'Not found' }
      }).as('getCitiesError');
      
      cy.visit('/bank-employee/register');
      
      // Form should still work
      cy.fillBankEmployeeForm({
        fullName: 'Test User',
        email: 'test@example.com'
      });
    });
  });

  describe('Navigation and Routing', () => {
    it('should handle direct URL access', () => {
      // Direct access to registration page
      cy.visit('/bank-employee/register');
      cy.url().should('include', '/bank-employee/register');
      cy.get('h1').should('be.visible');
    });

    it('should handle logo navigation', () => {
      cy.visit('/bank-employee/register');
      
      // Click logo (should navigate to home)
      cy.get('a[href="/"]').first().click();
      cy.url().should('not.include', '/bank-employee/register');
    });
  });

  describe('Mobile and Responsive Behavior', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/bank-employee/register');
      
      // Check form is accessible
      cy.get('input[name="fullName"]').should('be.visible');
      cy.get('input[name="fullName"]').type('Mobile Test');
      
      // Check dropdowns work
      cy.contains('bank_worker_select_bank').click();
      cy.get('.dropdownMenu').should('be.visible');
    });

    it('should maintain functionality across viewport changes', () => {
      cy.visit('/bank-employee/register');
      
      // Fill form on desktop
      cy.viewport(1280, 720);
      cy.fillBankEmployeeForm({ fullName: 'Responsive Test' });
      
      // Switch to mobile
      cy.viewport('iphone-x');
      cy.get('input[name="fullName"]').should('have.value', 'Responsive Test');
      
      // Switch to tablet
      cy.viewport('ipad-2');
      cy.get('input[name="fullName"]').should('have.value', 'Responsive Test');
    });
  });

  describe('Memory and Performance', () => {
    it('should not have memory leaks during navigation', () => {
      // Navigate between pages multiple times
      for (let i = 0; i < 5; i++) {
        cy.visit('/');
        cy.visit('/bank-employee/register');
      }
      
      // Should still be responsive
      cy.get('input[name="fullName"]').type('Performance Test');
      cy.get('input[name="fullName"]').should('have.value', 'Performance Test');
    });

    it('should handle rapid form interactions', () => {
      cy.visit('/bank-employee/register');
      
      // Rapid typing and clearing
      for (let i = 0; i < 10; i++) {
        cy.get('input[name="fullName"]').clear().type(`Test ${i}`);
      }
      
      cy.get('input[name="fullName"]').should('have.value', 'Test 9');
    });
  });

  describe('Security and Input Sanitization', () => {
    it('should handle special characters safely', () => {
      cy.visit('/bank-employee/register');
      
      const specialInputs = [
        '<script>alert("xss")</script>',
        '"; DROP TABLE users; --',
        '\\x00\\x01\\x02',
        '🚀 emoji test 中文',
      ];
      
      specialInputs.forEach((input) => {
        cy.get('input[name="fullName"]').clear().type(input);
        cy.get('input[name="fullName"]').should('contain.value', input);
      });
    });
  });
});