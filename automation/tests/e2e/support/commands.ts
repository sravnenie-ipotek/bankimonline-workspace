/// <reference types="cypress" />

// Custom command to login to the banking application
Cypress.Commands.add('login', (phone: string, name: string) => {
  cy.visit('/')
  
  // Click on login button
  cy.get('[data-cy=login-button]').click()
  
  // Fill in phone verification form
  cy.get('input[placeholder*="שם"]').type(name)
  cy.get('.react-phone-input-2 input').clear().type(phone)
  
  // Submit form
  cy.get('button[type="button"]').contains('המשך').click()
  
  // Handle OTP in test environment
  cy.handleOTP(Cypress.env('testUser').otp)
})

// Custom command to select language
Cypress.Commands.add('selectLanguage', (lang: 'en' | 'he' | 'ru') => {
  // Click on language selector
  cy.get('[class*="language-wrapper"]').click()
  
  // Select the desired language
  const languageMap = {
    'en': 'English',
    'he': 'עברית',
    'ru': 'Русский'
  }
  
  cy.get('[class*="language-select__item"]')
    .contains(languageMap[lang])
    .click()
  
  // Verify language changed
  cy.window().its('localStorage.language').should('eq', lang)
})

// Custom command to handle OTP verification
Cypress.Commands.add('handleOTP', (code: string) => {
  // Wait for OTP input to be visible
  cy.get('[class*="otp-input"]', { timeout: 10000 }).should('be.visible')
  
  // Type each digit of the OTP
  code.split('').forEach((digit, index) => {
    cy.get(`input[data-index="${index}"]`).type(digit)
  })
  
  // Submit OTP
  cy.get('button').contains('אמת').click()
})

// Custom command to navigate through banking service flow
Cypress.Commands.add('navigateToService', (service: 'mortgage' | 'credit' | 'refinance') => {
  const serviceMap = {
    'mortgage': 'חישוב משכנתא',
    'credit': 'חישוב הלוואה',
    'refinance': 'מחזור משכנתא'
  }
  
  // Navigate to services page
  cy.visit('/services')
  
  // Click on the specific service
  cy.get('[class*="service-card"]')
    .contains(serviceMap[service])
    .click()
})

// Custom command to fill form fields with Hebrew support
Cypress.Commands.add('fillFormField', (fieldName: string, value: string) => {
  // Find field by name, placeholder, or label
  cy.get(`input[name="${fieldName}"], input[placeholder*="${fieldName}"], label:contains("${fieldName}") + input`)
    .clear()
    .type(value)
    .should('have.value', value)
})

// Custom command to mock API responses
Cypress.Commands.add('mockApiResponse', (endpoint: string, response: any) => {
  cy.intercept('POST', `**/${endpoint}`, {
    statusCode: 200,
    body: response
  }).as(`${endpoint}Request`)
})

// Additional utility commands for banking app

// Command to select from dropdown
Cypress.Commands.add('selectDropdownOption', (dropdownSelector: string, optionText: string) => {
  cy.get(dropdownSelector).click()
  cy.get('[class*="react-dropdown-select-item"]').contains(optionText).click()
})

// Command to handle date picker
Cypress.Commands.add('selectDate', (dateFieldSelector: string, date: Date) => {
  cy.get(dateFieldSelector).click()
  
  // Select year
  cy.get('select[class*="year-select"]').select(date.getFullYear().toString())
  
  // Select month
  cy.get('select[class*="month-select"]').select(date.getMonth().toString())
  
  // Select day
  cy.get(`[class*="react-datepicker__day"]:not([class*="outside-month"])`).contains(date.getDate()).click()
})

// Command to handle file upload
Cypress.Commands.add('uploadDocument', (documentType: string, fileName: string) => {
  cy.fixture(fileName).then(fileContent => {
    cy.get(`[data-cy="${documentType}-upload"]`).attachFile({
      fileContent: fileContent.toString(),
      fileName: fileName,
      mimeType: 'application/pdf'
    })
  })
})

// Command to verify form validation errors
Cypress.Commands.add('verifyValidationError', (fieldName: string, errorMessage: string) => {
  cy.get(`[class*="error"][data-field="${fieldName}"], [class*="error-message"]`)
    .should('be.visible')
    .and('contain', errorMessage)
})

// Custom command to fill all form fields automatically
Cypress.Commands.add('fillAllFormFields', () => {
  // Fill text inputs
  cy.get('input[type="text"]:visible').each(($input) => {
    const inputName = $input.attr('name') || $input.attr('placeholder') || '';
    
    if (inputName.toLowerCase().includes('price') || inputName.toLowerCase().includes('amount')) {
      cy.wrap($input).clear().type('500000');
    } else if (inputName.toLowerCase().includes('income')) {
      cy.wrap($input).clear().type('15000');
    } else if (inputName.toLowerCase().includes('name')) {
      cy.wrap($input).clear().type('John Doe');
    } else if (inputName.toLowerCase().includes('phone')) {
      cy.wrap($input).clear().type('0501234567');
    } else if (inputName.toLowerCase().includes('email')) {
      cy.wrap($input).clear().type('test@example.com');
    } else {
      cy.wrap($input).clear().type('Test Value');
    }
  });
  
  // Fill number inputs
  cy.get('input[type="number"]:visible').each(($input) => {
    const inputName = $input.attr('name') || $input.attr('placeholder') || '';
    
    if (inputName.toLowerCase().includes('price') || inputName.toLowerCase().includes('amount')) {
      cy.wrap($input).clear().type('500000');
    } else if (inputName.toLowerCase().includes('income')) {
      cy.wrap($input).clear().type('15000');
    } else if (inputName.toLowerCase().includes('percent') || inputName.toLowerCase().includes('rate')) {
      cy.wrap($input).clear().type('3.5');
    } else if (inputName.toLowerCase().includes('year')) {
      cy.wrap($input).clear().type('25');
    } else {
      cy.wrap($input).clear().type('100');
    }
  });
  
  // Handle select dropdowns
  cy.get('select:visible').each(($select) => {
    cy.wrap($select).find('option').then($options => {
      if ($options.length > 1) {
        cy.wrap($select).select($options.eq(1).val());
      }
    });
  });
});

// Command to click continue/next button
Cypress.Commands.add('clickContinueButton', () => {
  const continueButtons = [
    'button:contains("המשך")',
    'button:contains("Continue")',
    'button:contains("Next")',
    'button:contains("Submit")',
    'button:contains("Calculate")',
    'button:contains("חשב")',
    'button[type="submit"]'
  ];
  
  continueButtons.forEach(selector => {
    cy.get('body').then($body => {
      const button = $body.find(selector);
      if (button.length > 0 && button.is(':visible') && !button.is(':disabled')) {
        cy.get(selector).first().click();
        return false; // Exit loop
      }
    });
  });
});

// Custom command to take organized screenshots
Cypress.Commands.add('takeScreenshot', (name: string, options?: { capture?: 'viewport' | 'fullPage' | 'runner', clip?: any }) => {
  // Get current test info
  const testTitle = Cypress.currentTest.title;
  const specName = Cypress.spec.name.replace(/\.cy\.(ts|js)$/, '');
  
  // Create descriptive filename
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const screenshotName = `${specName}_${testTitle.replace(/\s+/g, '_')}_${name}_${timestamp}`;
  
  // Take screenshot with custom name
  cy.screenshot(screenshotName, options || { capture: 'viewport' });
});

// Command to take screenshot of specific element
Cypress.Commands.add('screenshotElement', (selector: string, name: string) => {
  cy.get(selector).screenshot(name, {
    overwrite: true,
    capture: 'viewport'
  });
});

// Command to document test step with screenshot
Cypress.Commands.add('documentStep', (stepName: string, description?: string) => {
  // Log the step
  cy.log(`📸 **${stepName}**`, description || '');
  
  // Take screenshot
  cy.takeScreenshot(stepName.replace(/\s+/g, '_'));
  
  // Optional: Add task to write to a log file
  cy.task('log', `Step: ${stepName} - ${description || 'No description'}`);
});

// 🎨 PERCY VISUAL REGRESSION COMMANDS

// Banking-specific Percy snapshot with security and localization
Cypress.Commands.add('percySnapshot', (name: string, options = {}) => {
  const defaultOptions = {
    widths: [375, 768, 1280, 1920],
    minHeight: 1000,
    percyCSS: `
      /* Hide sensitive banking data */
      [class*="account-number"], 
      [class*="credit-score"], 
      [data-test*="sensitive"],
      .sensitive-data {
        background: #f0f0f0 !important;
        color: transparent !important;
      }
      
      /* Ensure Hebrew fonts load properly */
      @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700&display=swap');
      * {
        font-family: 'Heebo', 'Segoe UI', Arial, sans-serif !important;
      }
      
      /* Stabilize animations */
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      
      /* Hide loading skeletons for consistent snapshots */
      [class*="skeleton"], [class*="shimmer"], [class*="loading"] {
        display: none !important;
      }
    `,
    enableJavaScript: true,
    waitForTimeout: 2000,
    ...options
  };

  // Wait for page to be fully loaded
  if (options.waitForSelector) {
    cy.get(options.waitForSelector, { timeout: 10000 }).should('be.visible');
  }
  
  // Wait for fonts to load
  cy.document().should('have.property', 'readyState', 'complete');
  cy.wait(1000); // Additional wait for font rendering
  
  // Take Percy snapshot
  cy.get('body').then(() => {
    // @ts-ignore - Percy types may not be fully available
    cy.percySnapshot(name, defaultOptions);
  });
});

// Multi-language Percy snapshots
Cypress.Commands.add('percySnapshotMultiLang', (baseName: string, options = {}) => {
  const languages = ['he', 'en', 'ru'];
  const languageNames = {
    'he': 'Hebrew',
    'en': 'English', 
    'ru': 'Russian'
  };

  languages.forEach(lang => {
    // Switch language
    cy.selectLanguage(lang as 'he' | 'en' | 'ru');
    
    // Wait for translation to load
    cy.wait(2000);
    
    // Take snapshot with language identifier
    const snapshotName = `${baseName} - ${languageNames[lang]}`;
    cy.percySnapshot(snapshotName, {
      ...options,
      percyCSS: (options.percyCSS || '') + `
        /* Language-specific styling */
        html[dir="rtl"] {
          direction: rtl !important;
        }
        html[dir="ltr"] {
          direction: ltr !important;
        }
      `
    });
  });
  
  // Reset to Hebrew (default)
  cy.selectLanguage('he');
});

// Secure banking Percy snapshot with enhanced data masking
Cypress.Commands.add('percySnapshotSecure', (name: string, options = {}) => {
  // Enhanced security CSS for banking data
  const securityCSS = `
    /* Mask all potential PII and financial data */
    [class*="account"], [class*="balance"], [class*="amount"],
    [class*="loan"], [class*="credit"], [class*="income"],
    [class*="salary"], [class*="payment"], [class*="rate"],
    [data-test*="financial"], [data-test*="personal"],
    input[type="number"], input[name*="amount"], 
    input[name*="income"], input[name*="salary"] {
      background: linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
                  linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
                  linear-gradient(-45deg, transparent 75%, #e0e0e0 75%) !important;
      background-size: 10px 10px !important;
      background-position: 0 0, 0 5px, 5px -5px, -5px 0px !important;
      color: transparent !important;
    }
    
    /* Mask phone numbers and IDs */
    [class*="phone"], [class*="id-number"], 
    [name*="phone"], [name*="id"] {
      background: #f5f5f5 !important;
      color: transparent !important;
    }
    
    /* Hide tooltips and overlays that might contain sensitive info */
    .tooltip, [class*="tooltip"], [class*="overlay"],
    [class*="modal"] {
      display: none !important;
    }
  `;

  cy.percySnapshot(name, {
    ...options,
    percyCSS: securityCSS + (options.percyCSS || '')
  });
});

// Banking form state snapshot (useful for step-by-step flows)
Cypress.Commands.add('percySnapshotFormState', (stepName: string, formData: any = {}) => {
  // Fill form with provided data
  Object.keys(formData).forEach(field => {
    cy.get(`[name="${field}"]`).clear().type(formData[field]);
  });
  
  // Wait for form validation
  cy.wait(1000);
  
  // Take snapshot
  cy.percySnapshot(`Form State - ${stepName}`, {
    percyCSS: `
      /* Highlight form fields */
      input:focus, select:focus, textarea:focus {
        outline: 2px solid #0066cc !important;
        outline-offset: 2px !important;
      }
      
      /* Highlight validation errors */
      .error, [class*="error"], [class*="invalid"] {
        border: 2px solid #ff4444 !important;
        background-color: #fff5f5 !important;
      }
      
      /* Highlight successful validation */
      .valid, [class*="valid"], [class*="success"] {
        border: 2px solid #44ff44 !important;
        background-color: #f5fff5 !important;
      }
    `
  });
});

// Percy snapshot with mobile-first responsive testing
Cypress.Commands.add('percySnapshotResponsive', (name: string, options = {}) => {
  const responsiveOptions = {
    ...options,
    widths: [375, 768, 1024, 1280, 1920],
    percyCSS: (options.percyCSS || '') + `
      /* Mobile-first optimizations */
      @media (max-width: 768px) {
        .desktop-only { display: none !important; }
        .mobile-optimized { display: block !important; }
      }
      
      /* Tablet optimizations */
      @media (min-width: 769px) and (max-width: 1024px) {
        .mobile-only { display: none !important; }
        .tablet-optimized { display: block !important; }
      }
      
      /* Desktop optimizations */
      @media (min-width: 1025px) {
        .mobile-only, .tablet-only { display: none !important; }
        .desktop-optimized { display: block !important; }
      }
    `
  };
  
  cy.percySnapshot(name, responsiveOptions);
});

// Export empty object to make this a module
export {}