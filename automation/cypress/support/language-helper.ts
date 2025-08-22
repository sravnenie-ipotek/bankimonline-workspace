/**
 * Language-agnostic test helpers
 * Automatically detects language and provides appropriate selectors
 */

export class LanguageHelper {
  /**
   * Detect current language from the page
   */
  static detectLanguage(): Cypress.Chainable<'en' | 'he' | 'ru'> {
    return cy.get('html').then($html => {
      const dir = $html.attr('dir');
      const lang = $html.attr('lang');
      
      if (dir === 'rtl' || lang === 'he') return 'he';
      if (lang === 'ru') return 'ru';
      return 'en';
    });
  }

  /**
   * Switch to English if not already
   */
  static ensureEnglish() {
    cy.get('body').then($body => {
      // Look for language switcher
      const langButtons = $body.find('button').filter((i, el) => {
        const text = el.textContent || '';
        return text.includes('EN') || text.includes('English');
      });
      
      if (langButtons.length > 0) {
        cy.wrap(langButtons.first()).click();
        cy.wait(1000);
      }
    });
  }

  /**
   * Get text in multiple languages
   */
  static getMultilingualText(en: string, he: string, ru?: string) {
    return {
      en,
      he,
      ru: ru || en
    };
  }

  /**
   * Find button by multilingual text
   */
  static findButton(texts: { en: string, he: string, ru?: string }): Cypress.Chainable {
    return cy.get('button').filter((index, element) => {
      const text = element.textContent || '';
      return text.includes(texts.en) || 
             text.includes(texts.he) || 
             (texts.ru && text.includes(texts.ru));
    });
  }

  /**
   * Find input by various attributes
   */
  static findInput(options: {
    testId?: string;
    placeholder?: { en: string, he: string };
    name?: string;
    type?: string;
  }): Cypress.Chainable {
    if (options.testId) {
      return cy.get(`[data-testid="${options.testId}"]`);
    }
    
    if (options.placeholder) {
      return cy.get('input').filter((index, element) => {
        const placeholder = element.getAttribute('placeholder') || '';
        return placeholder.includes(options.placeholder.en) || 
               placeholder.includes(options.placeholder.he);
      });
    }
    
    if (options.name) {
      return cy.get(`input[name="${options.name}"]`);
    }
    
    if (options.type) {
      return cy.get(`input[type="${options.type}"]`);
    }
    
    return cy.get('input').first();
  }

  /**
   * Navigate to service agnostic of language
   */
  static navigateToService(serviceType: 'mortgage' | 'credit' | 'refinance-mortgage' | 'refinance-credit') {
    const serviceUrls = {
      'mortgage': '/services/calculate-mortgage/1',
      'credit': '/services/calculate-credit/1',
      'refinance-mortgage': '/services/refinance-mortgage/1',
      'refinance-credit': '/services/refinance-credit/1'
    };
    
    cy.visit(serviceUrls[serviceType]);
    cy.wait(2000);
  }

  /**
   * Click next button in any language
   */
  static clickNext() {
    const nextTexts = {
      en: 'Next',
      he: 'הבא',
      ru: 'Далее'
    };
    
    cy.get('button').filter((index, element) => {
      const text = element.textContent || '';
      return text.includes(nextTexts.en) || 
             text.includes(nextTexts.he) || 
             text.includes(nextTexts.ru) ||
             text.includes('Continue') ||
             text.includes('המשך');
    }).first().click({ force: true });
  }

  /**
   * Fill property/loan value
   */
  static fillPropertyValue(value: string) {
    // Try data-testid first, then fall back to first numeric input
    cy.get('[data-testid="property-value"], [data-testid="loan-amount"], input[type="text"], input[type="number"]')
      .first()
      .clear()
      .type(value);
  }

  /**
   * Select dropdown option by index
   */
  static selectDropdownOption(dropdownSelector: string, optionIndex: number = 0) {
    cy.get(dropdownSelector).then($el => {
      if ($el.is('select')) {
        // Native select
        cy.wrap($el).select(optionIndex);
      } else {
        // Custom dropdown
        cy.wrap($el).click({ force: true });
        cy.wait(500);
        cy.get('li, [role="option"], .dropdown-option').eq(optionIndex).click({ force: true });
      }
    });
  }
}

export default LanguageHelper;