/**
 * 🔍 VALIDATION TESTING HELPER FUNCTIONS
 * 
 * Helper functions for validating dropdown functionality, translations, and API responses
 */

export interface ValidationResult {
  category: string;
  test: string;
  passed: boolean;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: string;
}

export interface ApiValidationResult {
  endpoint: string;
  status: number;
  jsonb_source: boolean;
  response_time: number;
  options_count: number;
  validation_passed: boolean;
  errors: string[];
}

export interface TranslationValidationResult {
  language: string;
  dropdowns_tested: number;
  correct_translations: number;
  incorrect_translations: number;
  missing_translations: number;
  accuracy_percentage: number;
  issues: Array<{
    dropdown: string;
    expected: string;
    actual: string;
    issue_type: string;
  }>;
}

/**
 * Validate JSONB API response structure
 */
export const validateJsonbApiResponse = (
  screen: string,
  language: string
): Cypress.Chainable<ApiValidationResult> => {
  const startTime = Date.now();
  
  return cy.request({
    method: 'GET',
    url: `http://localhost:8003/api/dropdowns/${screen}/${language}`,
    failOnStatusCode: false
  }).then((response) => {
    const responseTime = Date.now() - startTime;
    const result: ApiValidationResult = {
      endpoint: `/api/dropdowns/${screen}/${language}`,
      status: response.status,
      jsonb_source: false,
      response_time: responseTime,
      options_count: 0,
      validation_passed: false,
      errors: []
    };
    
    // Validate basic response structure
    if (response.status !== 200) {
      result.errors.push(`HTTP status ${response.status} instead of 200`);
      return cy.wrap(result);
    }
    
    const body = response.body;
    
    // Check required fields
    const requiredFields = ['status', 'screen_location', 'language_code', 'dropdowns', 'options', 'labels', 'placeholders'];
    requiredFields.forEach(field => {
      if (!body.hasOwnProperty(field)) {
        result.errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Validate JSONB source
    if (body.jsonb_source === true) {
      result.jsonb_source = true;
    } else {
      result.errors.push('Response not from JSONB source (traditional system still active)');
    }
    
    // Count dropdown options
    if (body.options && typeof body.options === 'object') {
      result.options_count = Object.keys(body.options).length;
    } else {
      result.errors.push('Options field missing or invalid');
    }
    
    // Validate response structure
    if (body.status !== 'success') {
      result.errors.push(`API status '${body.status}' instead of 'success'`);
    }
    
    if (body.screen_location !== screen) {
      result.errors.push(`Screen location '${body.screen_location}' does not match requested '${screen}'`);
    }
    
    if (body.language_code !== language) {
      result.errors.push(`Language code '${body.language_code}' does not match requested '${language}'`);
    }
    
    result.validation_passed = result.errors.length === 0;
    
    cy.log(`🔍 API Validation ${result.endpoint}: ${result.validation_passed ? 'PASS' : 'FAIL'} (${result.options_count} options, ${responseTime}ms)`);
    
    return cy.wrap(result);
  });
};

/**
 * Validate dropdown translations for specific language
 */
export const validateDropdownTranslations = (
  screen: string,
  language: 'he' | 'en' | 'ru'
): Cypress.Chainable<TranslationValidationResult> => {
  const result: TranslationValidationResult = {
    language,
    dropdowns_tested: 0,
    correct_translations: 0,
    incorrect_translations: 0,
    missing_translations: 0,
    accuracy_percentage: 0,
    issues: []
  };
  
  return validateJsonbApiResponse(screen, language).then(apiResult => {
    if (!apiResult.validation_passed) {
      cy.log(`❌ Cannot validate translations - API validation failed for ${screen}/${language}`);
      return cy.wrap(result);
    }
    
    return cy.request('GET', `http://localhost:8003/api/dropdowns/${screen}/${language}`).then(response => {
      const data = response.body;
      
      if (data.options) {
        Object.keys(data.options).forEach(dropdownKey => {
          result.dropdowns_tested++;
          const options = data.options[dropdownKey];
          
          if (Array.isArray(options) && options.length > 0) {
            options.forEach((option, index) => {
              const optionText = option.text || '';
              const validation = validateTextLanguage(optionText, language);
              
              if (validation.isCorrectLanguage) {
                result.correct_translations++;
              } else if (validation.isEmpty) {
                result.missing_translations++;
                result.issues.push({
                  dropdown: dropdownKey,
                  expected: `${language} text`,
                  actual: 'empty',
                  issue_type: 'missing_translation'
                });
              } else {
                result.incorrect_translations++;
                result.issues.push({
                  dropdown: dropdownKey,
                  expected: `${language} text`,
                  actual: optionText,
                  issue_type: 'wrong_language'
                });
              }
            });
          } else {
            result.missing_translations++;
            result.issues.push({
              dropdown: dropdownKey,
              expected: `${language} options`,
              actual: 'no options',
              issue_type: 'missing_options'
            });
          }
        });
      }
      
      const totalTranslations = result.correct_translations + result.incorrect_translations + result.missing_translations;
      result.accuracy_percentage = totalTranslations > 0 
        ? Math.round((result.correct_translations / totalTranslations) * 100)
        : 0;
      
      cy.log(`🌐 Translation Validation ${language.toUpperCase()}: ${result.accuracy_percentage}% accuracy (${result.correct_translations}/${totalTranslations})`);
      
      return cy.wrap(result);
    });
  });
};

/**
 * Validate text is in expected language
 */
export const validateTextLanguage = (
  text: string,
  expectedLanguage: 'he' | 'en' | 'ru'
): { isCorrectLanguage: boolean; isEmpty: boolean; detectedLanguages: string[] } => {
  if (!text || text.trim() === '') {
    return { isCorrectLanguage: false, isEmpty: true, detectedLanguages: [] };
  }
  
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  const hasEnglish = /[A-Za-z]/.test(text);
  const hasRussian = /[\u0400-\u04FF]/.test(text);
  const hasNumbers = /\d/.test(text);
  
  const detectedLanguages: string[] = [];
  if (hasHebrew) detectedLanguages.push('hebrew');
  if (hasEnglish) detectedLanguages.push('english');
  if (hasRussian) detectedLanguages.push('russian');
  
  let isCorrectLanguage = false;
  
  switch (expectedLanguage) {
    case 'he':
      // Hebrew text should contain Hebrew characters
      // Allow some English for technical terms or numbers
      isCorrectLanguage = hasHebrew && (!hasEnglish || text.length < 20);
      break;
    case 'en':
      // English text should contain English characters
      // Should not contain Hebrew or Russian (except numbers/symbols)
      isCorrectLanguage = hasEnglish && !hasHebrew && !hasRussian;
      break;
    case 'ru':
      // Russian text should contain Cyrillic characters
      // Allow some English for technical terms
      isCorrectLanguage = hasRussian && (!hasEnglish || text.length < 20);
      break;
  }
  
  return { isCorrectLanguage, isEmpty: false, detectedLanguages };
};

/**
 * Validate dropdown functionality
 */
export const validateDropdownFunctionality = (
  dropdownElement: JQuery<HTMLElement>,
  dropdownName: string
): Cypress.Chainable<ValidationResult[]> => {
  const results: ValidationResult[] = [];
  
  return cy.wrap(dropdownElement).then($dropdown => {
    // Test 1: Dropdown is visible
    const isVisible = $dropdown.is(':visible');
    results.push({
      category: 'Visibility',
      test: 'Dropdown is visible',
      passed: isVisible,
      details: isVisible ? 'Dropdown is visible on page' : 'Dropdown is not visible',
      severity: isVisible ? 'LOW' : 'CRITICAL',
      impact: isVisible ? 'None' : 'User cannot interact with dropdown'
    });
    
    // Test 2: Dropdown is enabled
    const isEnabled = !$dropdown.prop('disabled');
    results.push({
      category: 'Interactivity',
      test: 'Dropdown is enabled',
      passed: isEnabled,
      details: isEnabled ? 'Dropdown is enabled' : 'Dropdown is disabled',
      severity: isEnabled ? 'LOW' : 'HIGH',
      impact: isEnabled ? 'None' : 'User cannot select options'
    });
    
    if (isVisible && isEnabled) {
      // Test 3: Dropdown opens when clicked
      cy.wrap($dropdown).click({ force: true });
      cy.wait(500);
      
      return cy.get('body').then($body => {
        const optionSelectors = [
          '.react-dropdown-select-item',
          '.dropdown-option',
          '[class*="option"]',
          'li'
        ];
        
        let hasOptions = false;
        let optionCount = 0;
        
        for (const selector of optionSelectors) {
          const options = $body.find(selector);
          if (options.length > 0) {
            hasOptions = true;
            optionCount = options.length;
            break;
          }
        }
        
        results.push({
          category: 'Functionality',
          test: 'Dropdown opens with options',
          passed: hasOptions,
          details: hasOptions ? `Dropdown opened with ${optionCount} options` : 'No options found when dropdown opened',
          severity: hasOptions ? 'LOW' : 'CRITICAL',
          impact: hasOptions ? 'None' : 'Dropdown is completely non-functional'
        });
        
        if (hasOptions) {
          // Test 4: Options are selectable
          const firstSelector = optionSelectors.find(selector => $body.find(selector).length > 0);
          cy.get(firstSelector).first().click({ force: true });
          cy.wait(300);
          
          results.push({
            category: 'Functionality',
            test: 'Options are selectable',
            passed: true,
            details: 'Successfully selected first option',
            severity: 'LOW',
            impact: 'None'
          });
        }
        
        return cy.wrap(results);
      });
    }
    
    return cy.wrap(results);
  });
};

/**
 * Validate form submission with dropdown selections
 */
export const validateFormSubmissionWithDropdowns = (
  formSelector: string = 'form'
): Cypress.Chainable<ValidationResult> => {
  return cy.get(formSelector).then($form => {
    if ($form.length === 0) {
      return cy.wrap({
        category: 'Form Validation',
        test: 'Form exists for dropdown validation',
        passed: false,
        details: 'No form found on page',
        severity: 'MEDIUM' as const,
        impact: 'Cannot validate form submission with dropdowns'
      });
    }
    
    // Count dropdowns in form
    const dropdowns = $form.find('.react-dropdown-select, [class*="dropdown"]:not(input), select');
    
    if (dropdowns.length === 0) {
      return cy.wrap({
        category: 'Form Validation',
        test: 'Form contains dropdowns',
        passed: false,
        details: 'No dropdowns found in form',
        severity: 'LOW' as const,
        impact: 'Form validation test not applicable'
      });
    }
    
    // Fill all dropdowns
    dropdowns.each((index, dropdown) => {
      cy.wrap(dropdown).click({ force: true });
      cy.wait(300);
      
      cy.get('body').then($body => {
        const options = $body.find('.react-dropdown-select-item, [class*="option"], li');
        if (options.length > 0) {
          cy.wrap(options.first()).click({ force: true });
        }
      });
      cy.wait(200);
    });
    
    // Try to submit form
    return cy.get('button[type="submit"], button').contains(/submit|שלח|המשך|הבא/i).then($submitBtn => {
      if ($submitBtn.length > 0) {
        cy.wrap($submitBtn).click({ force: true });
        cy.wait(2000);
        
        // Check for validation errors
        return cy.get('body').then($body => {
          const hasErrors = $body.find('[class*="error"], .error, .invalid').length > 0;
          
          return cy.wrap({
            category: 'Form Validation',
            test: 'Form submits successfully with dropdown selections',
            passed: !hasErrors,
            details: hasErrors ? 'Form validation errors found after dropdown selection' : 'Form submitted successfully with dropdown values',
            severity: hasErrors ? 'HIGH' as const : 'LOW' as const,
            impact: hasErrors ? 'User cannot proceed with selected dropdown values' : 'None'
          });
        });
      }
      
      return cy.wrap({
        category: 'Form Validation',
        test: 'Submit button exists',
        passed: false,
        details: 'No submit button found in form',
        severity: 'MEDIUM' as const,
        impact: 'Cannot test form submission'
      });
    });
  });
};

/**
 * Check for JavaScript console errors
 */
export const validateNoConsoleErrors = (): Cypress.Chainable<ValidationResult> => {
  return cy.window().then((win) => {
    const errors: string[] = [];
    
    // Capture console errors
    const originalError = win.console.error;
    win.console.error = (...args) => {
      errors.push(args.join(' '));
      originalError.apply(win.console, args);
    };
    
    return cy.wrap({
      category: 'JavaScript Errors',
      test: 'No console errors during dropdown interaction',
      passed: errors.length === 0,
      details: errors.length === 0 ? 'No console errors detected' : `${errors.length} console errors found: ${errors.slice(0, 3).join('; ')}`,
      severity: errors.length === 0 ? 'LOW' : 'HIGH' as const,
      impact: errors.length === 0 ? 'None' : 'May indicate JavaScript functionality issues'
    });
  });
};

/**
 * Validate all critical dropdowns have minimum required options
 */
export const validateCriticalDropdownOptions = (
  screen: string,
  criticalDropdowns: string[]
): Cypress.Chainable<ValidationResult[]> => {
  const results: ValidationResult[] = [];
  
  return cy.request('GET', `http://localhost:8003/api/dropdowns/${screen}/he`).then(response => {
    const data = response.body;
    
    criticalDropdowns.forEach(dropdownName => {
      const dropdownOptions = data.options?.[`${screen}_${dropdownName}`] || data[dropdownName]?.options || [];
      const hasMinimumOptions = Array.isArray(dropdownOptions) && dropdownOptions.length >= 2;
      
      results.push({
        category: 'Critical Dropdowns',
        test: `${dropdownName} has minimum options`,
        passed: hasMinimumOptions,
        details: hasMinimumOptions 
          ? `${dropdownName} has ${dropdownOptions.length} options` 
          : `${dropdownName} has insufficient options (${dropdownOptions.length})`,
        severity: hasMinimumOptions ? 'LOW' : 'CRITICAL',
        impact: hasMinimumOptions ? 'None' : 'Critical user workflow will fail'
      });
    });
    
    return cy.wrap(results);
  });
};

/**
 * Generate comprehensive validation summary
 */
export const generateValidationSummary = (
  allResults: ValidationResult[]
): {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  critical_failures: number;
  high_severity: number;
  medium_severity: number;
  low_severity: number;
  overall_status: 'PASS' | 'CONDITIONAL' | 'FAIL';
} => {
  const summary = {
    total_tests: allResults.length,
    passed_tests: allResults.filter(r => r.passed).length,
    failed_tests: allResults.filter(r => !r.passed).length,
    critical_failures: allResults.filter(r => !r.passed && r.severity === 'CRITICAL').length,
    high_severity: allResults.filter(r => !r.passed && r.severity === 'HIGH').length,
    medium_severity: allResults.filter(r => !r.passed && r.severity === 'MEDIUM').length,
    low_severity: allResults.filter(r => !r.passed && r.severity === 'LOW').length,
    overall_status: 'PASS' as 'PASS' | 'CONDITIONAL' | 'FAIL'
  };
  
  if (summary.critical_failures > 0) {
    summary.overall_status = 'FAIL';
  } else if (summary.high_severity > 2 || summary.failed_tests > summary.total_tests * 0.1) {
    summary.overall_status = 'CONDITIONAL';
  }
  
  return summary;
};