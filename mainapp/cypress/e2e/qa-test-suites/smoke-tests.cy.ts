/**
 * Smoke Tests - Critical Path Verification
 * 
 * Quick verification that core functionality works
 * Run these tests after every deployment
 */

describe('Smoke Tests - Critical Functionality', () => {
  
  describe('Application Health', () => {
    it('should load homepage without errors', () => {
      cy.visit('/');
      cy.get('body').should('be.visible');
      cy.checkPageLoadTime(3000);
      
      // Check for no console errors
      cy.window().then((win) => {
        expect(win.console.error).to.not.have.been.called;
      });
    });

    it('should have working navigation', () => {
      cy.visit('/');
      
      // Check main navigation elements exist
      cy.get('nav').should('exist');
      cy.get('a[href="/"]').should('exist'); // Logo
    });
  });

  describe('API Health', () => {
    it('should load banks from API', () => {
      cy.intercept('GET', '/api/banks/list*').as('getBanks');
      cy.visit('/bank-employee/register');
      cy.wait('@getBanks').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
      });
    });

    it('should load cities from API', () => {
      cy.intercept('GET', '/api/get-cities*').as('getCities');
      cy.visit('/bank-employee/register');
      cy.wait('@getCities').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
      });
    });
  });

  describe('Core User Flows', () => {
    it('should access bank employee registration', () => {
      cy.visit('/bank-employee/register');
      cy.url().should('include', '/bank-employee/register');
      cy.get('h1').should('be.visible');
      cy.get('input[name="fullName"]').should('exist');
    });

    it('should switch languages successfully', () => {
      cy.visit('/');
      
      // Find language selector and switch to Hebrew
      cy.get('button[aria-haspopup="true"]').first().click();
      cy.contains('עברית').click();
      
      // Verify RTL applied
      cy.get('html').should('have.attr', 'dir', 'rtl');
    });
  });

  describe('Performance Baseline', () => {
    it('should meet performance requirements', () => {
      cy.visit('/bank-employee/register');
      cy.checkPageLoadTime(3000);
      
      // Check that images load quickly
      cy.get('img').should('be.visible');
    });
  });
});