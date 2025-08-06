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

// Export empty object to make this a module
export {}