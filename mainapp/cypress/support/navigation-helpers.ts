/**
 * 🧭 NAVIGATION TESTING HELPER FUNCTIONS
 * 
 * Helper functions for navigating through all processes and pages in the banking application
 */

export interface ProcessNavigationResult {
  processName: string;
  stepsReached: number;
  totalSteps: number;
  completedSuccessfully: boolean;
  errors: string[];
  timeToComplete: number;
}

export interface PageNavigationResult {
  pageName: string;
  url: string;
  loaded: boolean;
  hasDropdowns: boolean;
  dropdownCount: number;
  errors: string[];
}

/**
 * All application routes that should be tested
 */
export const getAllTestableRoutes = () => {
  return {
    processes: [
      { name: 'Calculate Mortgage', baseUrl: '/services/calculate-mortgage', steps: 4 },
      { name: 'Calculate Credit', baseUrl: '/services/calculate-credit', steps: 4 },
      { name: 'Refinance Mortgage', baseUrl: '/services/refinance-mortgage', steps: 4 },
      { name: 'Refinance Credit', baseUrl: '/services/refinance-credit', steps: 4 }
    ],
    navigation: [
      { name: 'Home', url: '/', hasDropdowns: false },
      { name: 'Services Overview', url: '/services', hasDropdowns: false },
      { name: 'About', url: '/about', hasDropdowns: false },
      { name: 'Contacts', url: '/contacts', hasDropdowns: true },
      { name: 'Cooperation', url: '/cooperation', hasDropdowns: true },
      { name: 'Vacancies', url: '/vacancies', hasDropdowns: true },
      { name: 'Tenders for Brokers', url: '/tenders-for-brokers', hasDropdowns: true },
      { name: 'Tenders for Lawyers', url: '/tenders-for-lawyers', hasDropdowns: true },
      { name: 'Lawyers Page', url: '/lawyers', hasDropdowns: true },
      { name: 'Broker Questionnaire', url: '/broker-questionnaire', hasDropdowns: true },
      { name: 'Terms', url: '/terms', hasDropdowns: false },
      { name: 'Privacy Policy', url: '/privacy-policy', hasDropdowns: false },
      { name: 'Cookie Policy', url: '/cookie', hasDropdowns: false },
      { name: 'Refund Policy', url: '/refund', hasDropdowns: false }
    ],
    banks: [
      { name: 'Bank Apoalim', url: '/banks/apoalim', hasDropdowns: false },
      { name: 'Bank Discount', url: '/banks/discount', hasDropdowns: false },
      { name: 'Bank Leumi', url: '/banks/leumi', hasDropdowns: false },
      { name: 'Bank Beinleumi', url: '/banks/beinleumi', hasDropdowns: false },
      { name: 'Bank Mercantile Discount', url: '/banks/mercantile-discount', hasDropdowns: false },
      { name: 'Bank Jerusalem', url: '/banks/jerusalem', hasDropdowns: false }
    ],
    personalCabinet: [
      { name: 'Personal Cabinet', url: '/personal-cabinet', hasDropdowns: true },
      { name: 'Partner Personal Data', url: '/personal-cabinet/partner-personal-data', hasDropdowns: true },
      { name: 'Main Borrower Personal Data', url: '/personal-cabinet/main-borrower-personal-data', hasDropdowns: true },
      { name: 'Co-Borrower Personal Data', url: '/personal-cabinet/co-borrower-personal-data', hasDropdowns: true },
      { name: 'Income Data', url: '/personal-cabinet/income-data', hasDropdowns: true },
      { name: 'Co-Borrower Income Data', url: '/personal-cabinet/co-borrower-income-data', hasDropdowns: true },
      { name: 'Credit History', url: '/personal-cabinet/credit-history', hasDropdowns: true },
      { name: 'Documents', url: '/personal-cabinet/documents', hasDropdowns: true },
      { name: 'Credit History Consent', url: '/personal-cabinet/credit-history-consent', hasDropdowns: true },
      { name: 'Bank Authorization', url: '/personal-cabinet/bank-authorization', hasDropdowns: true }
    ]
  };
};

/**
 * Navigate through a complete process (all 4 steps)
 */
export const navigateCompleteProcess = (
  processName: string,
  baseUrl: string,
  testPhone: string = '972544123456',
  testOTP: string = '123456'
): Cypress.Chainable<ProcessNavigationResult> => {
  const startTime = Date.now();
  const result: ProcessNavigationResult = {
    processName,
    stepsReached: 0,
    totalSteps: 4,
    completedSuccessfully: false,
    errors: [],
    timeToComplete: 0
  };

  return cy.visit(`${baseUrl}/1`).then(() => {
    cy.wait(3000);
    result.stepsReached = 1;
    
    // Fill Step 1
    return fillStep1Form(processName).then(() => {
      // Navigate to Step 2
      return cy.get('button').contains(/הבא|Next/i).click({ force: true }).then(() => {
        cy.wait(3000);
        
        // Handle authentication if needed
        return handleAuthentication(testPhone, testOTP).then(() => {
          return cy.url().then(url => {
            if (url.includes('/2')) {
              result.stepsReached = 2;
              
              // Fill Step 2
              return fillStep2Form(processName).then(() => {
                // Navigate to Step 3
                return cy.get('button').contains(/הבא|Next/i).click({ force: true }).then(() => {
                  cy.wait(3000);
                  
                  return cy.url().then(url => {
                    if (url.includes('/3')) {
                      result.stepsReached = 3;
                      
                      // Fill Step 3
                      return fillStep3Form(processName).then(() => {
                        // Navigate to Step 4
                        return cy.get('button').contains(/הבא|Next/i).click({ force: true }).then(() => {
                          cy.wait(5000);
                          
                          return cy.url().then(url => {
                            if (url.includes('/4')) {
                              result.stepsReached = 4;
                              result.completedSuccessfully = true;
                            }
                            
                            result.timeToComplete = Date.now() - startTime;
                            return cy.wrap(result);
                          });
                        });
                      });
                    } else {
                      result.errors.push('Could not reach Step 3');
                      result.timeToComplete = Date.now() - startTime;
                      return cy.wrap(result);
                    }
                  });
                });
              });
            } else {
              result.errors.push('Could not reach Step 2');
              result.timeToComplete = Date.now() - startTime;
              return cy.wrap(result);
            }
          });
        });
      });
    });
  });
};

/**
 * Handle SMS authentication
 */
export const handleAuthentication = (phone: string, otp: string): Cypress.Chainable<boolean> => {
  return cy.get('body').then($body => {
    if ($body.find('input[type="tel"]').length > 0) {
      cy.log('🔐 Handling SMS authentication');
      cy.get('input[type="tel"]').type(phone);
      cy.get('button').contains(/שלח|Send/i).click();
      cy.wait(2000);
      cy.get('input').last().type(otp);
      cy.get('button').contains(/אמת|Verify/i).click();
      cy.wait(3000);
      return cy.wrap(true);
    }
    return cy.wrap(false);
  });
};

/**
 * Fill Step 1 form based on process type
 */
export const fillStep1Form = (processName: string): Cypress.Chainable<void> => {
  cy.log(`📝 Filling Step 1 form for ${processName}`);
  
  if (processName.toLowerCase().includes('mortgage')) {
    // Property value
    cy.get('input[type="text"]').first().clear().type('2500000');
    
    // Fill dropdowns by clicking and selecting first option
    cy.get('body').then($body => {
      const dropdowns = $body.find('.react-dropdown-select, [class*="dropdown"]:not(input)');
      dropdowns.each((index, dropdown) => {
        cy.wrap(dropdown).click({ force: true });
        cy.wait(300);
        
        cy.get('body').then($optionBody => {
          const optionSelectors = [
            '.react-dropdown-select-item',
            '[class*="option"]',
            '[class*="item"]',
            'li'
          ];
          
          for (const selector of optionSelectors) {
            if ($optionBody.find(selector).length > 0) {
              cy.get(selector).first().click({ force: true });
              break;
            }
          }
        });
        cy.wait(200);
      });
    });
    
  } else if (processName.toLowerCase().includes('credit')) {
    // Loan amount
    cy.get('input[type="text"]').first().clear().type('50000');
    
    // Fill dropdowns
    cy.get('.react-dropdown-select, [class*="dropdown"]:not(input)').each($dropdown => {
      cy.wrap($dropdown).click({ force: true });
      cy.wait(300);
      cy.get('.react-dropdown-select-item, [class*="option"], li').first().click({ force: true });
      cy.wait(200);
    });
  }
  
  return cy.wrap(null);
};

/**
 * Fill Step 2 form (personal information)
 */
export const fillStep2Form = (processName: string): Cypress.Chainable<void> => {
  cy.log(`📝 Filling Step 2 form for ${processName}`);
  
  // Fill basic personal information
  cy.get('input[name="nameSurname"]').type('Test User בדיקה');
  cy.get('input[name="birthday"]').type('15/05/1985');
  
  // Fill dropdowns
  cy.get('.react-dropdown-select, [class*="dropdown"]:not(input)').each(($dropdown, index) => {
    cy.wrap($dropdown).click({ force: true });
    cy.wait(300);
    
    // For Yes/No questions, prefer "No" options
    cy.get('body').then($body => {
      const options = $body.find('.react-dropdown-select-item, [class*="option"], li');
      const noOption = Array.from(options).find(opt => 
        Cypress.$(opt).text().includes('לא') || Cypress.$(opt).text().includes('No')
      );
      
      if (noOption && index > 0) {
        cy.wrap(noOption).click({ force: true });
      } else {
        cy.get('.react-dropdown-select-item, [class*="option"], li').first().click({ force: true });
      }
    });
    cy.wait(200);
  });
  
  // Set number of borrowers
  cy.get('input[name="borrowers"]').clear().type('1');
  
  return cy.wrap(null);
};

/**
 * Fill Step 3 form (income information)
 */
export const fillStep3Form = (processName: string): Cypress.Chainable<void> => {
  cy.log(`📝 Filling Step 3 form for ${processName}`);
  
  // Fill income information
  cy.get('input[name="monthlyIncome"]').type('25000');
  cy.get('input[name="startDate"]').type('01/01/2020');
  cy.get('input[name="profession"]').type('Engineer מהנדס');
  cy.get('input[name="companyName"]').type('Tech Company Ltd');
  
  // Fill employment-related dropdowns
  cy.get('.react-dropdown-select, [class*="dropdown"]:not(input)').each($dropdown => {
    cy.wrap($dropdown).click({ force: true });
    cy.wait(300);
    
    // Select first available option
    cy.get('.react-dropdown-select-item, [class*="option"], li').first().click({ force: true });
    cy.wait(200);
  });
  
  return cy.wrap(null);
};

/**
 * Test navigation to a specific page
 */
export const testPageNavigation = (
  pageName: string,
  url: string,
  expectedDropdowns: boolean = false
): Cypress.Chainable<PageNavigationResult> => {
  const result: PageNavigationResult = {
    pageName,
    url,
    loaded: false,
    hasDropdowns: false,
    dropdownCount: 0,
    errors: []
  };
  
  return cy.visit(url).then(() => {
    cy.wait(2000);
    result.loaded = true;
    
    // Check for dropdowns on the page
    return cy.get('body').then($body => {
      const dropdowns = $body.find('.react-dropdown-select, [class*="dropdown"]:not(input), select');
      result.dropdownCount = dropdowns.length;
      result.hasDropdowns = dropdowns.length > 0;
      
      if (expectedDropdowns && !result.hasDropdowns) {
        result.errors.push('Expected dropdowns but none found');
      }
      
      cy.log(`📄 ${pageName}: ${result.loaded ? 'Loaded' : 'Failed'}, ${result.dropdownCount} dropdowns`);
      return cy.wrap(result);
    });
  }).catch(error => {
    result.errors.push(`Failed to load page: ${error.message}`);
    return cy.wrap(result);
  });
};

/**
 * Get all navigation pages that should be tested
 */
export const getAllNavigationPages = () => {
  const routes = getAllTestableRoutes();
  return [
    ...routes.navigation,
    ...routes.banks,
    ...routes.personalCabinet
  ];
};

/**
 * Navigate through all menu items and test dropdowns
 */
export const testAllNavigationPages = (): Cypress.Chainable<PageNavigationResult[]> => {
  const allPages = getAllNavigationPages();
  const results: PageNavigationResult[] = [];
  
  allPages.forEach(page => {
    cy.then(() => {
      return testPageNavigation(page.name, page.url, page.hasDropdowns).then(result => {
        results.push(result);
      });
    });
  });
  
  return cy.wrap(results);
};

/**
 * Change language and test if dropdowns adapt correctly
 */
export const testLanguageSwitch = (
  targetLanguage: 'he' | 'en' | 'ru',
  testUrl: string = '/services/calculate-mortgage/1'
): Cypress.Chainable<boolean> => {
  return cy.visit(`${testUrl}?lang=${targetLanguage}`).then(() => {
    cy.wait(3000);
    
    // Check if language switched by looking at page content
    return cy.get('body').then($body => {
      const pageText = $body.text();
      
      let languageDetected = false;
      switch (targetLanguage) {
        case 'he':
          languageDetected = /[\u0590-\u05FF]/.test(pageText);
          break;
        case 'en':
          languageDetected = /[A-Za-z]{10,}/.test(pageText) && !/[\u0590-\u05FF]/.test(pageText);
          break;
        case 'ru':
          languageDetected = /[\u0400-\u04FF]/.test(pageText);
          break;
      }
      
      cy.log(`🌐 Language switch to ${targetLanguage}: ${languageDetected ? 'Success' : 'Failed'}`);
      return cy.wrap(languageDetected);
    });
  });
};

/**
 * Test direct navigation to step 4 of each process
 */
export const testDirectNavigationToStep4 = (): Cypress.Chainable<ProcessNavigationResult[]> => {
  const processes = getAllTestableRoutes().processes;
  const results: ProcessNavigationResult[] = [];
  
  processes.forEach(process => {
    cy.then(() => {
      const startTime = Date.now();
      return cy.visit(`${process.baseUrl}/4`).then(() => {
        cy.wait(3000);
        
        return cy.url().then(url => {
          const result: ProcessNavigationResult = {
            processName: process.name,
            stepsReached: url.includes('/4') ? 4 : 0,
            totalSteps: 4,
            completedSuccessfully: url.includes('/4'),
            errors: url.includes('/4') ? [] : ['Could not reach Step 4 directly'],
            timeToComplete: Date.now() - startTime
          };
          
          results.push(result);
          cy.log(`🎯 Direct navigation to ${process.name} Step 4: ${result.completedSuccessfully ? 'Success' : 'Failed'}`);
        });
      });
    });
  });
  
  return cy.wrap(results);
};