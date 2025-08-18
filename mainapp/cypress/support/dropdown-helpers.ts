/**
 * 🔧 DROPDOWN TESTING HELPER FUNCTIONS
 * 
 * Utility functions for comprehensive dropdown testing across the banking application
 */

export interface DropdownTestResult {
  name: string;
  step: number;
  process: string;
  language: string;
  optionsCount: number;
  validTranslations: number;
  hasErrors: boolean;
  errorMessages: string[];
  apiResponse?: any;
}

export interface LanguageValidation {
  isValidHebrew: boolean;
  isValidEnglish: boolean;
  isValidRussian: boolean;
  mixedLanguageIssues: string[];
}

/**
 * Test an individual dropdown component
 */
export const testDropdownComponent = (
  dropdownElement: JQuery<HTMLElement>,
  dropdownName: string,
  expectedLanguage: 'he' | 'en' | 'ru' = 'he'
): Cypress.Chainable<DropdownTestResult> => {
  return cy.wrap(dropdownElement).then($dropdown => {
    const result: DropdownTestResult = {
      name: dropdownName,
      step: 0,
      process: '',
      language: expectedLanguage,
      optionsCount: 0,
      validTranslations: 0,
      hasErrors: false,
      errorMessages: []
    };

    // Verify dropdown is visible and interactable
    cy.wrap($dropdown).should('be.visible').and('not.be.disabled');
    
    // Click to open dropdown
    cy.wrap($dropdown).click({ force: true });
    cy.wait(500);
    
    // Get all dropdown options
    return cy.get('body').then($body => {
      const optionSelectors = [
        '.react-dropdown-select-item',
        '[data-testid="dropdown-option"]',
        '.dropdown-option',
        '[class*="option"]',
        '[class*="item"]',
        'li'
      ];
      
      let optionsFound = false;
      
      for (const selector of optionSelectors) {
        const options = $body.find(selector);
        if (options.length > 0) {
          result.optionsCount = options.length;
          optionsFound = true;
          
          // Validate each option's language
          options.each((index, option) => {
            const optionText = Cypress.$(option).text();
            const validation = validateOptionLanguage(optionText, expectedLanguage);
            
            if (validation.isValid) {
              result.validTranslations++;
            } else {
              result.hasErrors = true;
              result.errorMessages.push(`Option "${optionText}" has language issues: ${validation.issues.join(', ')}`);
            }
          });
          
          // Test selecting first option
          cy.get(selector).first().click({ force: true });
          cy.wait(300);
          break;
        }
      }
      
      if (!optionsFound) {
        result.hasErrors = true;
        result.errorMessages.push('No dropdown options found');
      }
      
      return cy.wrap(result);
    });
  });
};

/**
 * Validate text for specific language
 */
export const validateOptionLanguage = (
  text: string,
  expectedLanguage: 'he' | 'en' | 'ru'
): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  let isValid = true;
  
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  const hasEnglish = /[A-Za-z]/.test(text);
  const hasRussian = /[\u0400-\u04FF]/.test(text);
  
  switch (expectedLanguage) {
    case 'he':
      if (!hasHebrew && hasEnglish) {
        issues.push('Expected Hebrew but found English text');
        isValid = false;
      }
      if (hasHebrew && hasEnglish && text.length > 10) {
        issues.push('Mixed Hebrew and English in same text');
        isValid = false;
      }
      break;
      
    case 'en':
      if (!hasEnglish) {
        issues.push('Expected English but found non-English text');
        isValid = false;
      }
      if (hasEnglish && (hasHebrew || hasRussian)) {
        issues.push('Mixed languages in English text');
        isValid = false;
      }
      break;
      
    case 'ru':
      if (!hasRussian && hasEnglish) {
        issues.push('Expected Russian but found English text');
        isValid = false;
      }
      if (hasRussian && hasEnglish && text.length > 10) {
        issues.push('Mixed Russian and English in same text');
        isValid = false;
      }
      break;
  }
  
  return { isValid, issues };
};

/**
 * Test all dropdowns on current page
 */
export const testAllDropdownsOnPage = (
  pageName: string,
  expectedLanguage: 'he' | 'en' | 'ru' = 'he'
): Cypress.Chainable<DropdownTestResult[]> => {
  return cy.get('body').then($body => {
    const dropdownSelectors = [
      '.react-dropdown-select',
      '[data-testid*="dropdown"]',
      '[class*="dropdown"]:not(input)',
      'select'
    ];
    
    const results: DropdownTestResult[] = [];
    let dropdownIndex = 0;
    
    dropdownSelectors.forEach(selector => {
      const dropdowns = $body.find(selector);
      dropdowns.each((index, dropdown) => {
        cy.wrap(dropdown).then($dropdown => {
          return testDropdownComponent($dropdown, `${pageName}-dropdown-${dropdownIndex++}`, expectedLanguage)
            .then(result => {
              results.push(result);
            });
        });
      });
    });
    
    return cy.wrap(results);
  });
};

/**
 * Validate JSONB API response for dropdowns
 */
export const validateJsonbApiResponse = (
  screen: string,
  language: string
): Cypress.Chainable<any> => {
  return cy.request('GET', `http://localhost:8003/api/dropdowns/${screen}/${language}`)
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'success');
      expect(response.body).to.have.property('jsonb_source', true);
      
      const apiResult = {
        endpoint: `/api/dropdowns/${screen}/${language}`,
        status: response.status,
        jsonb_source: response.body.jsonb_source,
        options_count: Object.keys(response.body.options || {}).length,
        labels_count: Object.keys(response.body.labels || {}).length,
        placeholders_count: Object.keys(response.body.placeholders || {}).length,
        response_time: response.duration,
        hotfix_active: response.body.performance?.source === 'neon_jsonb'
      };
      
      cy.log(`✅ API Validation: ${screen}/${language} - ${apiResult.options_count} dropdown fields`);
      return cy.wrap(apiResult);
    });
};

/**
 * Get dropdown selectors for different component types
 */
export const getDropdownSelectors = () => {
  return {
    reactDropdownSelect: '.react-dropdown-select',
    customDropdown: '[class*="dropdown"]:not(input)',
    nativeSelect: 'select',
    testIdDropdown: '[data-testid*="dropdown"]',
    materialUISelect: '.MuiSelect-root',
    antdSelect: '.ant-select'
  };
};

/**
 * Get option selectors for different dropdown types
 */
export const getOptionSelectors = () => {
  return {
    reactDropdownSelectItem: '.react-dropdown-select-item',
    dropdownOption: '.dropdown-option',
    testIdOption: '[data-testid*="option"]',
    genericOption: '[class*="option"]',
    genericItem: '[class*="item"]',
    listItem: 'li',
    materialUIOption: '.MuiMenuItem-root',
    antdOption: '.ant-select-item'
  };
};

/**
 * Wait for dropdown options to load
 */
export const waitForDropdownOptions = (timeout: number = 5000) => {
  const selectors = Object.values(getOptionSelectors());
  
  return cy.get('body', { timeout }).then($body => {
    let optionsFound = false;
    
    for (const selector of selectors) {
      if ($body.find(selector).length > 0) {
        optionsFound = true;
        break;
      }
    }
    
    if (!optionsFound) {
      cy.wait(1000); // Additional wait if no options found immediately
    }
    
    return cy.wrap(optionsFound);
  });
};

/**
 * Check for JavaScript console errors related to dropdowns
 */
export const checkForDropdownErrors = (): Cypress.Chainable<string[]> => {
  return cy.window().then((win) => {
    const errors: string[] = [];
    
    // Check for common dropdown-related errors in console
    const originalError = win.console.error;
    const originalWarn = win.console.warn;
    
    win.console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('dropdown') || message.includes('select') || message.includes('option')) {
        errors.push(`ERROR: ${message}`);
      }
      originalError.apply(win.console, args);
    };
    
    win.console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('dropdown') || message.includes('select') || message.includes('option')) {
        errors.push(`WARNING: ${message}`);
      }
      originalWarn.apply(win.console, args);
    };
    
    return cy.wrap(errors);
  });
};

/**
 * Generate dropdown test summary
 */
export const generateDropdownTestSummary = (results: DropdownTestResult[]) => {
  const summary = {
    total_dropdowns: results.length,
    successful_dropdowns: results.filter(r => !r.hasErrors).length,
    total_options: results.reduce((sum, r) => sum + r.optionsCount, 0),
    translation_accuracy: 0,
    critical_issues: results.filter(r => r.hasErrors && r.optionsCount === 0).length,
    language_issues: results.filter(r => r.hasErrors && r.optionsCount > 0).length
  };
  
  summary.translation_accuracy = summary.total_dropdowns > 0
    ? Math.round((summary.successful_dropdowns / summary.total_dropdowns) * 100)
    : 0;
  
  return summary;
};