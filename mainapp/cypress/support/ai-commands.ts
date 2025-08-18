/**
 * 🤖 AI-Enhanced Cypress Commands
 * 
 * This module provides intelligent Cypress commands that can
 * adapt to UI changes, provide better error messages, and
 * suggest fixes for common issues.
 */

import { aiTestGenerator } from './ai-test-generator';
import { aiTestRunner } from './ai-enhanced-runner';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * AI-enhanced element selection with intelligent fallbacks
       */
      aiGet(selector: string, options?: any): Chainable<JQuery<HTMLElement>>;
      
      /**
       * AI-enhanced click with intelligent waiting and retry logic
       */
      aiClick(selector: string, options?: any): Chainable<JQuery<HTMLElement>>;
      
      /**
       * AI-enhanced type with validation and error handling
       */
      aiType(selector: string, text: string, options?: any): Chainable<JQuery<HTMLElement>>;
      
      /**
       * AI-enhanced dropdown selection with translation awareness
       */
      aiSelect(selector: string, value: string, language?: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * AI-enhanced wait with intelligent timeout calculation
       */
      aiWait(condition: string, options?: any): Chainable<void>;
      
      /**
       * AI-enhanced validation with detailed error reporting
       */
      aiValidate(selector: string, expectedValue: any, options?: any): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Get AI suggestions for test improvement
       */
      getAISuggestions(): Chainable<any>;
    }
  }
}

// AI-enhanced element selection
Cypress.Commands.add('aiGet', (selector: string, options: any = {}) => {
  const startTime = Date.now();
  
  return cy.get(selector, { timeout: options.timeout || 10000 })
    .then($element => {
      // Record successful selection
      aiTestRunner.recordTestExecution({
        testName: Cypress.currentTest?.title || 'unknown',
        duration: Date.now() - startTime,
        status: 'passed',
        timestamp: new Date(),
        browser: Cypress.browser.name,
        viewport: `${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`
      });
      
      return $element;
    })
    .catch(error => {
      // Provide intelligent error suggestions
      const suggestions = aiTestGenerator.analyzeFailure(error, {
        selector,
        testName: Cypress.currentTest?.title,
        browser: Cypress.browser.name
      });
      
      cy.log(`🤖 AI Suggestions for selector "${selector}":`);
      suggestions.forEach(suggestion => cy.log(`  - ${suggestion}`));
      
      throw error;
    });
});

// AI-enhanced click with intelligent waiting
Cypress.Commands.add('aiClick', (selector: string, options: any = {}) => {
  return cy.aiGet(selector, options)
    .then($element => {
      // Check if element is clickable
      if ($element.is(':disabled')) {
        throw new Error(`Element ${selector} is disabled`);
      }
      
      if (!$element.is(':visible')) {
        throw new Error(`Element ${selector} is not visible`);
      }
      
      // Perform click with intelligent retry
      return cy.wrap($element).click({ force: options.force || false });
    });
});

// AI-enhanced type with validation
Cypress.Commands.add('aiType', (selector: string, text: string, options: any = {}) => {
  return cy.aiGet(selector, options)
    .then($element => {
      // Clear field if needed
      if (options.clear !== false) {
        cy.wrap($element).clear();
      }
      
      // Type with validation
      return cy.wrap($element)
        .type(text, { delay: options.delay || 0 })
        .then(() => {
          // Validate input if validation is enabled
          if (options.validate !== false) {
            cy.wrap($element).should('have.value', text);
          }
        });
    });
});

// AI-enhanced dropdown selection
Cypress.Commands.add('aiSelect', (selector: string, value: string, language: string = 'he') => {
  return cy.aiGet(selector)
    .then($dropdown => {
      // Click to open dropdown
      cy.wrap($dropdown).click();
      
      // Wait for options to load
      cy.wait(500);
      
      // Find option by value or text (with language awareness)
      const optionSelectors = [
        `option[value="${value}"]`,
        `option:contains("${value}")`,
        `[data-value="${value}"]`,
        `[data-testid="${value}"]`
      ];
      
      let optionFound = false;
      
      optionSelectors.forEach(optionSelector => {
        cy.get('body').then($body => {
          if ($body.find(optionSelector).length > 0 && !optionFound) {
            cy.get(optionSelector).click();
            optionFound = true;
          }
        });
      });
      
      if (!optionFound) {
        throw new Error(`Option "${value}" not found in dropdown ${selector}`);
      }
    });
});

// AI-enhanced wait with intelligent timeout
Cypress.Commands.add('aiWait', (condition: string, options: any = {}) => {
  const baseTimeout = 10000;
  const intelligentTimeout = options.timeout || baseTimeout;
  
  switch (condition) {
    case 'pageLoad':
      cy.wait(intelligentTimeout);
      break;
    case 'apiCall':
      cy.wait('@apiCall', { timeout: intelligentTimeout });
      break;
    case 'animation':
      cy.wait(1000); // Short wait for animations
      break;
    default:
      cy.wait(intelligentTimeout);
  }
});

// AI-enhanced validation
Cypress.Commands.add('aiValidate', (selector: string, expectedValue: any, options: any = {}) => {
  return cy.aiGet(selector, options)
    .then($element => {
      if (typeof expectedValue === 'string') {
        cy.wrap($element).should('contain.text', expectedValue);
      } else if (typeof expectedValue === 'boolean') {
        cy.wrap($element).should(expectedValue ? 'be.visible' : 'not.be.visible');
      } else if (typeof expectedValue === 'number') {
        cy.wrap($element).should('have.length', expectedValue);
      } else {
        cy.wrap($element).should('exist');
      }
    });
});

// Get AI suggestions for test improvement
Cypress.Commands.add('getAISuggestions', () => {
  const insights = aiTestRunner.getAIInsights();
  
  cy.log('🤖 AI Test Improvement Suggestions:');
  cy.log('=====================================');
  
  if (insights.optimizationSuggestions.length > 0) {
    cy.log('📈 Optimization Suggestions:');
    insights.optimizationSuggestions.forEach(suggestion => {
      cy.log(`  - ${suggestion}`);
    });
  }
  
  if (insights.failurePatterns.length > 0) {
    cy.log('⚠️  Common Failure Patterns:');
    insights.failurePatterns.forEach(pattern => {
      cy.log(`  - ${pattern}`);
    });
  }
  
  if (insights.performanceIssues.length > 0) {
    cy.log('🐌 Performance Issues:');
    insights.performanceIssues.forEach(issue => {
      cy.log(`  - ${issue}`);
    });
  }
  
  return cy.wrap(insights);
});

// Enhanced error handling for all commands
Cypress.on('fail', (error) => {
  const testContext = {
    testName: Cypress.currentTest?.title,
    specName: Cypress.spec.name,
    browser: Cypress.browser.name,
    viewport: `${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`
  };
  
  const suggestions = aiTestGenerator.analyzeFailure(error, testContext);
  
  if (suggestions.length > 0) {
    cy.log('🤖 AI Failure Analysis:');
    suggestions.forEach(suggestion => {
      cy.log(`  - ${suggestion}`);
    });
  }
  
  // Record failure for AI analysis
  aiTestRunner.recordTestExecution({
    testName: testContext.testName || 'unknown',
    duration: 0, // Will be calculated by test duration
    status: 'failed',
    failureReason: error.message,
    timestamp: new Date(),
    browser: testContext.browser,
    viewport: testContext.viewport
  });
});
