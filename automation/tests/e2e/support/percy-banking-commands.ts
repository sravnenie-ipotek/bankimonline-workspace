/**
 * 🎨 PERCY BANKING VISUAL TESTING COMMANDS
 * 
 * Custom Cypress commands for comprehensive visual regression testing
 * of banking applications with Hebrew RTL support, mobile responsiveness,
 * and security-compliant data masking.
 */

/// <reference types="cypress" />
/// <reference types="@percy/cypress" />

interface PercyBankingOptions {
  widths?: number[]
  minHeight?: number
  percyCSS?: string
  enableJavaScript?: boolean
  scope?: string
  language?: 'en' | 'he' | 'ru'
  maskSensitiveData?: boolean
  highlightInteractiveElements?: boolean
  testButtonOverflow?: boolean
  rtlTest?: boolean
}

interface VisualTestContext {
  testName: string
  currentStep?: number
  userFlow?: string
  bankingFeature?: 'mortgage' | 'credit' | 'refinance' | 'general'
  deviceType?: 'desktop' | 'tablet' | 'mobile'
}

declare global {
  namespace Cypress {
    interface Chainable {
      percySnapshotBanking(name: string, options?: PercyBankingOptions): Chainable<Element>
      percySnapshotMultiLang(baseName: string, options?: PercyBankingOptions): Chainable<Element>
      percySnapshotResponsive(baseName: string, options?: PercyBankingOptions): Chainable<Element>
      percySnapshotSecure(name: string, options?: PercyBankingOptions): Chainable<Element>
      percySnapshotMobile(name: string, options?: PercyBankingOptions): Chainable<Element>
      percySnapshotRTL(name: string, options?: PercyBankingOptions): Chainable<Element>
      percyTestButtonOverflow(name: string, options?: PercyBankingOptions): Chainable<Element>
      percyBankingFlow(context: VisualTestContext, options?: PercyBankingOptions): Chainable<Element>
      fillAllFormFields(): Chainable<Element>
      fillFormField(fieldName: string, value: string): Chainable<Element>
      waitForBankingPageLoad(): Chainable<Element>
      setupPercyLanguage(lang: 'en' | 'he' | 'ru'): Chainable<Element>
    }
  }
}

/**
 * Enhanced Percy snapshot with banking-specific optimizations
 */
Cypress.Commands.add('percySnapshotBanking', (name: string, options: PercyBankingOptions = {}) => {
  const defaultOptions = {
    widths: [375, 768, 1280, 1920],
    minHeight: 1000,
    enableJavaScript: true,
    percyCSS: generateBankingPercyCSS(options),
    scope: 'body'
  }

  const mergedOptions = { ...defaultOptions, ...options }

  // Wait for banking-specific elements to stabilize
  cy.waitForBankingPageLoad()

  // Apply data masking if requested
  if (options.maskSensitiveData) {
    cy.maskSensitiveFields()
  }

  // Highlight interactive elements if requested
  if (options.highlightInteractiveElements) {
    cy.highlightBankingElements()
  }

  // Test button overflow on mobile if requested
  if (options.testButtonOverflow && options.widths?.some(w => w <= 428)) {
    cy.checkButtonOverflow(name)
  }

  return cy.percySnapshot(name, mergedOptions)
})

/**
 * Multi-language visual testing
 */
Cypress.Commands.add('percySnapshotMultiLang', (baseName: string, options: PercyBankingOptions = {}) => {
  const languages = ['he', 'en', 'ru'] as const
  
  languages.forEach((lang) => {
    cy.setupPercyLanguage(lang)
    cy.wait(1000) // Allow language switch to complete
    
    const langName = `${baseName} - ${lang.toUpperCase()}`
    
    cy.percySnapshotBanking(langName, {
      ...options,
      language: lang,
      rtlTest: lang === 'he',
      percyCSS: generateLanguageSpecificCSS(lang, options.percyCSS)
    })
  })

  // Reset to Hebrew as default
  cy.setupPercyLanguage('he')
})

/**
 * Responsive breakpoint testing
 */
Cypress.Commands.add('percySnapshotResponsive', (baseName: string, options: PercyBankingOptions = {}) => {
  const breakpoints = [
    { width: 375, name: 'Mobile' },
    { width: 768, name: 'Tablet' },
    { width: 1280, name: 'Desktop' },
    { width: 1920, name: 'Large Desktop' }
  ]

  breakpoints.forEach(({ width, name }) => {
    const responsiveName = `${baseName} - ${name} (${width}px)`
    
    cy.percySnapshotBanking(responsiveName, {
      ...options,
      widths: [width],
      deviceType: width <= 428 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop',
      testButtonOverflow: width <= 428
    })
  })
})

/**
 * Security-compliant visual testing with data masking
 */
Cypress.Commands.add('percySnapshotSecure', (name: string, options: PercyBankingOptions = {}) => {
  const secureOptions = {
    ...options,
    maskSensitiveData: true,
    percyCSS: generateSecurityPercyCSS(options.percyCSS)
  }

  return cy.percySnapshotBanking(`${name} - Secure`, secureOptions)
})

/**
 * Mobile-specific visual testing with button overflow detection
 */
Cypress.Commands.add('percySnapshotMobile', (name: string, options: PercyBankingOptions = {}) => {
  const mobileOptions = {
    ...options,
    widths: [375, 414],
    testButtonOverflow: true,
    deviceType: 'mobile' as const,
    percyCSS: generateMobilePercyCSS(options.percyCSS)
  }

  return cy.percySnapshotBanking(`${name} - Mobile`, mobileOptions)
})

/**
 * RTL (Hebrew) specific visual testing
 */
Cypress.Commands.add('percySnapshotRTL', (name: string, options: PercyBankingOptions = {}) => {
  cy.setupPercyLanguage('he')
  cy.wait(1000)

  const rtlOptions = {
    ...options,
    rtlTest: true,
    percyCSS: generateRTLPercyCSS(options.percyCSS)
  }

  return cy.percySnapshotBanking(`${name} - Hebrew RTL`, rtlOptions)
})

/**
 * Button overflow testing for mobile viewports
 */
Cypress.Commands.add('percyTestButtonOverflow', (name: string, options: PercyBankingOptions = {}) => {
  cy.get('button').then($buttons => {
    let overflowDetected = false
    
    $buttons.each((index, button) => {
      const rect = button.getBoundingClientRect()
      const viewportHeight = Cypress.config('viewportHeight')
      
      if (rect.bottom > viewportHeight) {
        overflowDetected = true
        cy.log(`⚠️ Button overflow detected: "${button.innerText}" at ${rect.bottom}px`)
        
        // Add visual indicator for overflow
        cy.wrap(button).invoke('addClass', 'button-overflow-indicator')
      }
    })

    if (overflowDetected) {
      cy.percySnapshotBanking(`${name} - Button Overflow Detected`, {
        ...options,
        percyCSS: (options.percyCSS || '') + ' .button-overflow-indicator { border: 3px solid #ff0000 !important; box-shadow: 0 0 10px #ff0000 !important; }'
      })
    }
  })
})

/**
 * Banking flow context-aware visual testing
 */
Cypress.Commands.add('percyBankingFlow', (context: VisualTestContext, options: PercyBankingOptions = {}) => {
  const flowName = `${context.bankingFeature?.toUpperCase()} - ${context.testName}`
  
  if (context.currentStep) {
    const stepName = `${flowName} - Step ${context.currentStep}`
    cy.percySnapshotBanking(stepName, {
      ...options,
      scope: `[data-step="${context.currentStep}"], .step-${context.currentStep}, .form-step`
    })
  } else {
    cy.percySnapshotBanking(flowName, options)
  }

  // Log visual test context for Jira integration
  cy.task('log', `Visual test context: ${JSON.stringify(context)}`)
})

/**
 * Banking-specific form field filling
 */
Cypress.Commands.add('fillFormField', (fieldName: string, value: string) => {
  const selectors = [
    `[name="${fieldName}"]`,
    `[data-testid="${fieldName}"]`,
    `[id="${fieldName}"]`,
    `input[placeholder*="${fieldName}"]`,
    `input[aria-label*="${fieldName}"]`
  ]

  let filled = false
  
  selectors.forEach(selector => {
    if (!filled) {
      cy.get('body').then($body => {
        const element = $body.find(selector)
        if (element.length > 0) {
          cy.get(selector).first().clear().type(value)
          filled = true
        }
      })
    }
  })

  if (!filled) {
    cy.log(`⚠️ Field not found: ${fieldName}`)
  }
})

/**
 * Quick fill for all common banking form fields
 */
Cypress.Commands.add('fillAllFormFields', () => {
  const commonFields = {
    property_value: '1200000',
    down_payment: '240000',
    loan_period: '25',
    first_name: 'יוסי',
    last_name: 'כהן',
    email: 'test@example.com',
    phone: '0501234567',
    monthly_income: '18000',
    years_employed: '5'
  }

  Object.entries(commonFields).forEach(([field, value]) => {
    cy.fillFormField(field, value)
    cy.wait(200)
  })
})

/**
 * Wait for banking page elements to stabilize
 */
Cypress.Commands.add('waitForBankingPageLoad', () => {
  // Wait for common banking elements
  cy.get('body', { timeout: 10000 }).should('be.visible')
  
  // Wait for forms or main content
  cy.get('form, [class*="form"], [class*="content"], main', { timeout: 8000 })
    .should('be.visible')
  
  // Wait for dropdowns to load
  cy.wait(1000)
  
  // Wait for any loading spinners to disappear (optional)
  cy.get('body').then(($body) => {
    if ($body.find('[class*="loading"], [class*="spinner"]').length > 0) {
      cy.get('[class*="loading"], [class*="spinner"]', { timeout: 5000 })
        .should('not.exist')
    }
    // Additional wait for any dynamic content
    cy.wait(500)
  })
})

/**
 * Setup language for visual testing
 */
Cypress.Commands.add('setupPercyLanguage', (lang: 'en' | 'he' | 'ru') => {
  cy.window().then((win) => {
    win.localStorage.setItem('language', lang)
  })
  
  // Reload to apply language changes
  cy.reload()
  cy.waitForBankingPageLoad()
})

/**
 * Mask sensitive fields for security compliance
 */
Cypress.Commands.add('maskSensitiveFields', () => {
  const sensitiveSelectors = [
    'input[type="password"]',
    'input[name*="id"]',
    'input[name*="ssn"]',
    'input[name*="card"]',
    'input[name*="account"]',
    'input[placeholder*="זהות"]',
    'input[placeholder*="ת.ז"]',
    '[data-sensitive]'
  ]

  sensitiveSelectors.forEach(selector => {
    cy.get('body').then($body => {
      if ($body.find(selector).length > 0) {
        cy.get(selector).invoke('attr', 'data-percy-sensitive', 'true')
      }
    })
  })
})

/**
 * Highlight interactive banking elements
 */
Cypress.Commands.add('highlightBankingElements', () => {
  const interactiveSelectors = [
    'button',
    'input',
    'select',
    '[role="button"]',
    '[class*="dropdown"]',
    '[class*="clickable"]'
  ]

  interactiveSelectors.forEach(selector => {
    cy.get('body').then($body => {
      if ($body.find(selector).length > 0) {
        cy.get(selector).invoke('addClass', 'percy-highlight-interactive')
      }
    })
  })
})

/**
 * Check for button overflow issues
 */
Cypress.Commands.add('checkButtonOverflow', (testName: string) => {
  cy.get('button').then($buttons => {
    const viewportHeight = Cypress.config('viewportHeight')
    let overflowCount = 0
    
    $buttons.each((index, button) => {
      const rect = button.getBoundingClientRect()
      
      if (rect.bottom > viewportHeight) {
        overflowCount++
        const text = button.innerText || button.textContent || 'Unknown'
        cy.log(`🚨 BUTTON OVERFLOW: "${text}" - Bottom: ${rect.bottom}px, Viewport: ${viewportHeight}px`)
        
        // Report to Jira if enabled
        cy.task('createOrUpdateJira', {
          testTitle: `Mobile Button Overflow - ${testName}`,
          errorMessage: `Button "${text}" overflows mobile viewport. Bottom position: ${rect.bottom}px exceeds viewport height: ${viewportHeight}px`,
          actionLog: [`Button overflow detected in ${testName}`, `Button text: "${text}"`, `Position: ${rect.bottom}px`],
          spec: Cypress.spec.relative,
          currentUrl: cy.url(),
          browser: Cypress.browser.name,
          os: Cypress.platform
        }, { log: false })
      }
    })

    if (overflowCount > 0) {
      cy.log(`⚠️ Total button overflow issues found: ${overflowCount}`)
    }
  })
})

// CSS Generation Utilities

function generateBankingPercyCSS(options: PercyBankingOptions = {}): string {
  let css = `
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700&display=swap');
    
    /* Banking UI Stabilization */
    * { 
      animation-duration: 0s !important;
      transition-duration: 0s !important;
      animation-play-state: paused !important;
    }
    
    /* Hebrew RTL Support */
    body[dir='rtl'], [dir='rtl'] {
      font-family: 'Heebo', Arial, sans-serif;
      direction: rtl;
    }
    
    /* Banking Security Classes */
    .percy-hide { visibility: hidden !important; }
    .percy-mask { filter: blur(8px) !important; color: transparent !important; background: #cccccc !important; }
    [data-percy-sensitive] { filter: blur(10px) !important; background: #f0f0f0 !important; color: transparent !important; }
    
    /* Interactive Element Highlighting */
    .percy-highlight-interactive {
      outline: 2px dashed #007acc !important;
      outline-offset: 2px !important;
    }
    
    /* Mobile Button Fixes */
    .mobile-button-fix {
      position: sticky !important;
      bottom: 20px !important;
      z-index: 1000 !important;
      margin: 10px auto !important;
    }
  `

  return css + (options.percyCSS || '')
}

function generateLanguageSpecificCSS(lang: 'en' | 'he' | 'ru', additionalCSS?: string): string {
  let langCSS = ''
  
  if (lang === 'he') {
    langCSS = `
      body { 
        direction: rtl !important; 
        font-family: 'Heebo', Arial, sans-serif !important;
      }
      input, textarea, select { 
        text-align: right !important; 
        direction: rtl !important;
      }
    `
  } else {
    langCSS = `
      body { 
        direction: ltr !important; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      input, textarea, select { 
        text-align: left !important; 
        direction: ltr !important;
      }
    `
  }

  return langCSS + (additionalCSS || '')
}

function generateSecurityPercyCSS(additionalCSS?: string): string {
  const securityCSS = `
    /* Enhanced Security Masking */
    input[type="password"],
    input[name*="password"],
    input[name*="id"],
    input[name*="ssn"],
    input[placeholder*="זהות"],
    input[placeholder*="ת.ז"],
    [data-sensitive] {
      filter: blur(10px) !important;
      background: #f0f0f0 !important;
      color: transparent !important;
      -webkit-text-security: disc !important;
    }
    
    /* Banking Compliance Indicators */
    .security-compliant::after {
      content: "🔒 SECURE";
      position: absolute;
      top: -20px;
      right: 0;
      font-size: 10px;
      background: green;
      color: white;
      padding: 2px 4px;
    }
  `

  return securityCSS + (additionalCSS || '')
}

function generateMobilePercyCSS(additionalCSS?: string): string {
  const mobileCSS = `
    /* Mobile-specific styles */
    .button-overflow-indicator {
      border: 3px solid #ff0000 !important;
      box-shadow: 0 0 10px #ff0000 !important;
      position: relative !important;
    }
    
    .button-overflow-indicator::after {
      content: "OVERFLOW DETECTED";
      position: absolute;
      top: -25px;
      left: 0;
      background: red;
      color: white;
      padding: 2px 4px;
      font-size: 10px;
      font-weight: bold;
      z-index: 9999;
    }
    
    /* Mobile viewport indicators */
    @media (max-width: 428px) {
      body::before {
        content: "MOBILE VIEWPORT";
        position: fixed;
        top: 0;
        left: 0;
        background: rgba(0, 123, 255, 0.8);
        color: white;
        padding: 4px 8px;
        font-size: 12px;
        z-index: 10000;
      }
    }
  `

  return mobileCSS + (additionalCSS || '')
}

function generateRTLPercyCSS(additionalCSS?: string): string {
  const rtlCSS = `
    /* RTL-specific enhancements */
    body {
      direction: rtl !important;
      font-family: 'Heebo', Arial, sans-serif !important;
    }
    
    .rtl-indicator::before {
      content: "RTL MODE - עברית";
      position: fixed;
      top: 0;
      right: 0;
      background: rgba(255, 165, 0, 0.9);
      color: black;
      padding: 4px 8px;
      font-size: 12px;
      z-index: 10000;
    }
    
    /* RTL form alignment */
    input, textarea, select {
      text-align: right !important;
      direction: rtl !important;
    }
    
    /* RTL button alignment */
    button {
      text-align: center !important;
    }
  `

  return rtlCSS + (additionalCSS || '')
}