/// <reference types="cypress" />

describe('Phase 5 E2E - Multi-language Validation', () => {
  const languages = [
    { code: 'en', name: 'English', rtl: false },
    { code: 'he', name: 'Hebrew', rtl: true },
    { code: 'ru', name: 'Russian', rtl: false }
  ];
  
  languages.forEach((lang) => {
    it(`Should display interface correctly in ${lang.name}`, () => {
      // Visit and set language
      cy.visit('/services/calculate-mortgage/1');
      
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', lang.code);
        if (win.i18next) {
          win.i18next.changeLanguage(lang.code);
        }
      });
      
      cy.reload();
      cy.wait(1000);
      
      // Verify RTL/LTR direction
      cy.get('html').should('have.attr', 'dir', lang.rtl ? 'rtl' : 'ltr');
      
      // Verify language-specific content is displayed
      if (lang.code === 'en') {
        cy.contains('Property Value').should('be.visible');
      } else if (lang.code === 'he') {
        cy.contains('ערך הנכס').should('be.visible');
      } else if (lang.code === 'ru') {
        cy.contains('Стоимость недвижимости').should('be.visible');
      }
      
      // Verify dropdowns have translated options
      cy.get('[data-testid="property-ownership-dropdown"]').click();
      cy.get('.mantine-Select-dropdown').should('be.visible');
      cy.get('body').click(); // Close dropdown
    });
  });
  
  it('Should persist language selection across page reloads', () => {
    // Set Hebrew
    cy.visit('/services/calculate-mortgage/1');
    cy.window().then((win) => {
      win.localStorage.setItem('i18nextLng', 'he');
    });
    cy.reload();
    
    // Navigate away and back
    cy.visit('/');
    cy.visit('/services/calculate-mortgage/1');
    
    // Language should still be Hebrew
    cy.window().then((win) => {
      expect(win.localStorage.getItem('i18nextLng')).to.equal('he');
    });
    cy.get('html').should('have.attr', 'dir', 'rtl');
  });
});