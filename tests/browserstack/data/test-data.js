/**
 * Test Data for BrowserStack Mortgage Calculator Tests
 * Comprehensive test data sets for different testing scenarios
 */

const testData = {
  // Mortgage calculation test scenarios
  mortgageScenarios: {
    standard: {
      name: 'Standard Mortgage Application',
      step1: {
        propertyPrice: 2000000,
        city: 'תל אביב',
        whenNeeded: 'בעוד 3 חודשים',
        propertyType: 'דירה',
        firstHome: 'כן',
        propertyOwnership: 'אין לי נכס',
        initialPayment: 500000
      },
      step2: {
        firstName: 'יונתן',
        lastName: 'כהן',
        phone: '0544123456',
        email: 'yonatan.cohen@test.com',
        birthDate: '1990-01-15',
        citizenship: 'ישראלי',
        maritalStatus: 'רווק'
      },
      step3: {
        monthlyIncome: 25000,
        employmentType: 'עובד משכורת',
        additionalIncome: 0,
        workExperience: '5 שנים'
      }
    },
    
    highValue: {
      name: 'High Value Property',
      step1: {
        propertyPrice: 5000000,
        city: 'ירושלים',
        whenNeeded: 'בעוד 6 חודשים',
        propertyType: 'בית פרטי',
        firstHome: 'לא',
        propertyOwnership: 'יש לי נכס',
        initialPayment: 2500000
      },
      step2: {
        firstName: 'שרה',
        lastName: 'אברהם',
        phone: '0544987654',
        email: 'sarah.abraham@test.com',
        birthDate: '1985-05-20',
        citizenship: 'ישראלי',
        maritalStatus: 'נשוי'
      },
      step3: {
        monthlyIncome: 50000,
        employmentType: 'עצמאי',
        additionalIncome: 10000,
        workExperience: '10 שנים'
      }
    },
    
    firstTimeBuyer: {
      name: 'First Time Home Buyer',
      step1: {
        propertyPrice: 1500000,
        city: 'חיפה',
        whenNeeded: 'מיד',
        propertyType: 'דירה',
        firstHome: 'כן',
        propertyOwnership: 'אין לי נכס',
        initialPayment: 375000
      },
      step2: {
        firstName: 'דוד',
        lastName: 'מיכאל',
        phone: '0545678901',
        email: 'david.michael@test.com',
        birthDate: '1995-03-10',
        citizenship: 'ישראלי',
        maritalStatus: 'רווק'
      },
      step3: {
        monthlyIncome: 18000,
        employmentType: 'עובד משכורת',
        additionalIncome: 2000,
        workExperience: '3 שנים'
      }
    },
    
    propertyUpgrade: {
      name: 'Property Upgrade (Selling Current)',
      step1: {
        propertyPrice: 3500000,
        city: 'באר שבע',
        whenNeeded: 'בעוד שנה',
        propertyType: 'דירה',
        firstHome: 'לא',
        propertyOwnership: 'אני מוכר נכס',
        initialPayment: 1050000
      },
      step2: {
        firstName: 'רחל',
        lastName: 'שמעון',
        phone: '0546789012',
        email: 'rachel.shimon@test.com',
        birthDate: '1982-08-25',
        citizenship: 'ישראלי',
        maritalStatus: 'נשוי'
      },
      step3: {
        monthlyIncome: 35000,
        employmentType: 'עובד משכורת',
        additionalIncome: 5000,
        workExperience: '15 שנים'
      }
    }
  },
  
  // Dropdown testing data
  dropdownData: {
    cities: [
      'תל אביב',
      'ירושלים',
      'חיפה',
      'באר שבע',
      'נתניה',
      'פתח תקווה',
      'אשדוד',
      'אשקלון',
      'הרצליה',
      'רחובות'
    ],
    
    whenNeeded: [
      'מיד',
      'בעוד חודש',
      'בעוד 3 חודשים',
      'בעוד 6 חודשים',
      'בעוד שנה',
      'יותר משנה'
    ],
    
    propertyTypes: [
      'דירה',
      'בית פרטי',
      'דירת גן',
      'פנטהאוס',
      'סטודיו',
      'לופט'
    ],
    
    firstHomeOptions: [
      'כן',
      'לא'
    ],
    
    propertyOwnership: [
      'אין לי נכס',
      'יש לי נכס',
      'אני מוכר נכס'
    ],
    
    citizenship: [
      'ישראלי',
      'תושב חוזר',
      'עולה חדש',
      'תושב קבע'
    ],
    
    maritalStatus: [
      'רווק',
      'נשוי',
      'גרוש',
      'אלמן',
      'פרוד'
    ],
    
    employmentTypes: [
      'עובד משכורת',
      'עצמאי',
      'פנסיונר',
      'סטודנט',
      'חופש לידה',
      'מובטל'
    ]
  },
  
  // Invalid/edge case data for negative testing
  edgeCases: {
    invalidPropertyPrices: [
      0,
      -100000,
      999999999999, // Too high
      'abc', // Non-numeric
      null,
      undefined
    ],
    
    invalidInitialPayments: [
      -50000, // Negative
      0, // Zero
      'invalid', // Non-numeric
      null
    ],
    
    invalidPersonalInfo: {
      invalidEmails: [
        'invalid-email',
        '@test.com',
        'user@',
        'user space@test.com',
        ''
      ],
      
      invalidPhones: [
        '123', // Too short
        'abcd1234567890', // Contains letters
        '+972-abc-def-ghi', // Invalid format
        ''
      ],
      
      invalidNames: [
        '', // Empty
        '   ', // Whitespace only
        'A', // Too short
        'A'.repeat(100) // Too long
      ]
    }
  },
  
  // Performance testing data
  performanceData: {
    loadTestScenarios: [
      {
        name: 'Quick Entry',
        propertyPrice: 2000000,
        interactions: ['price', 'city', 'continue']
      },
      {
        name: 'All Fields',
        propertyPrice: 3000000,
        interactions: ['price', 'city', 'when', 'type', 'first', 'ownership', 'initial', 'continue']
      },
      {
        name: 'Multiple Dropdowns',
        propertyPrice: 2500000,
        interactions: ['city', 'city', 'when', 'when', 'type', 'type'] // Multiple interactions
      }
    ]
  },
  
  // Multi-language data
  languageData: {
    hebrew: {
      currency: '₪',
      numberFormat: '1,000,000',
      dateFormat: 'DD/MM/YYYY',
      direction: 'rtl',
      testStrings: {
        propertyValue: 'ערך הנכס',
        initialPayment: 'תשלום ראשוני',
        monthlyPayment: 'תשלום חודשי',
        continue: 'המשך'
      }
    },
    
    english: {
      currency: '₪',
      numberFormat: '1,000,000',
      dateFormat: 'MM/DD/YYYY',
      direction: 'ltr',
      testStrings: {
        propertyValue: 'Property Value',
        initialPayment: 'Initial Payment',
        monthlyPayment: 'Monthly Payment',
        continue: 'Continue'
      }
    },
    
    russian: {
      currency: '₪',
      numberFormat: '1 000 000',
      dateFormat: 'DD.MM.YYYY',
      direction: 'ltr',
      testStrings: {
        propertyValue: 'Стоимость недвижимости',
        initialPayment: 'Первоначальный взнос',
        monthlyPayment: 'Ежемесячный платеж',
        continue: 'Продолжить'
      }
    }
  },
  
  // Browser-specific data
  browserSpecificData: {
    chrome: {
      expectedBehaviors: ['fast-input', 'smooth-scrolling'],
      knownIssues: []
    },
    
    firefox: {
      expectedBehaviors: ['standard-input', 'standard-scrolling'],
      knownIssues: ['potential-dropdown-delay']
    },
    
    safari: {
      expectedBehaviors: ['safari-input-behavior'],
      knownIssues: ['date-picker-differences']
    },
    
    edge: {
      expectedBehaviors: ['standard-input'],
      knownIssues: []
    }
  },
  
  // Expected calculation results (for validation)
  expectedResults: {
    scenario1: {
      propertyPrice: 2000000,
      initialPayment: 500000,
      loanAmount: 1500000,
      expectedMonthlyRange: [8000, 12000], // Approximate range
      ltvRatio: 0.75
    },
    
    scenario2: {
      propertyPrice: 3000000,
      initialPayment: 1500000,
      loanAmount: 1500000,
      expectedMonthlyRange: [8000, 12000],
      ltvRatio: 0.50
    }
  }
};

/**
 * Get test data for specific scenario
 * @param {string} scenarioName - Name of the scenario
 * @returns {Object} Test scenario data
 */
function getScenario(scenarioName) {
  const scenario = testData.mortgageScenarios[scenarioName];
  if (!scenario) {
    throw new Error(`Test scenario '${scenarioName}' not found. Available: ${Object.keys(testData.mortgageScenarios).join(', ')}`);
  }
  return { ...scenario };
}

/**
 * Get random test data for a specific field type
 * @param {string} fieldType - Type of field data needed
 * @returns {any} Random test data
 */
function getRandomData(fieldType) {
  const fieldData = {
    city: () => testData.dropdownData.cities[Math.floor(Math.random() * testData.dropdownData.cities.length)],
    propertyPrice: () => Math.floor(Math.random() * 3000000) + 1000000,
    initialPayment: () => Math.floor(Math.random() * 1000000) + 200000,
    firstName: () => ['יונתן', 'שרה', 'דוד', 'רחל', 'מיכאל'][Math.floor(Math.random() * 5)],
    lastName: () => ['כהן', 'לוי', 'אברהם', 'מיכאל', 'שמעון'][Math.floor(Math.random() * 5)],
    income: () => Math.floor(Math.random() * 30000) + 15000
  };
  
  if (!fieldData[fieldType]) {
    throw new Error(`Random data generator for '${fieldType}' not found`);
  }
  
  return fieldData[fieldType]();
}

/**
 * Generate a complete random test scenario
 * @returns {Object} Complete random scenario
 */
function generateRandomScenario() {
  return {
    name: 'Random Generated Scenario',
    step1: {
      propertyPrice: getRandomData('propertyPrice'),
      city: getRandomData('city'),
      whenNeeded: testData.dropdownData.whenNeeded[Math.floor(Math.random() * testData.dropdownData.whenNeeded.length)],
      propertyType: testData.dropdownData.propertyTypes[Math.floor(Math.random() * testData.dropdownData.propertyTypes.length)],
      firstHome: testData.dropdownData.firstHomeOptions[Math.floor(Math.random() * testData.dropdownData.firstHomeOptions.length)],
      propertyOwnership: testData.dropdownData.propertyOwnership[Math.floor(Math.random() * testData.dropdownData.propertyOwnership.length)],
      initialPayment: getRandomData('initialPayment')
    },
    step2: {
      firstName: getRandomData('firstName'),
      lastName: getRandomData('lastName'),
      phone: '054' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0'),
      email: `test${Math.floor(Math.random() * 10000)}@example.com`,
      citizenship: testData.dropdownData.citizenship[Math.floor(Math.random() * testData.dropdownData.citizenship.length)],
      maritalStatus: testData.dropdownData.maritalStatus[Math.floor(Math.random() * testData.dropdownData.maritalStatus.length)]
    },
    step3: {
      monthlyIncome: getRandomData('income'),
      employmentType: testData.dropdownData.employmentTypes[Math.floor(Math.random() * testData.dropdownData.employmentTypes.length)],
      additionalIncome: Math.floor(Math.random() * 5000)
    }
  };
}

/**
 * Validate test data completeness
 * @param {Object} scenario - Test scenario to validate
 * @returns {Object} Validation results
 */
function validateScenario(scenario) {
  const validation = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  // Check required fields
  const requiredFields = {
    step1: ['propertyPrice', 'city'],
    step2: ['firstName', 'lastName', 'phone'],
    step3: ['monthlyIncome']
  };
  
  Object.entries(requiredFields).forEach(([step, fields]) => {
    if (scenario[step]) {
      fields.forEach(field => {
        if (!scenario[step][field]) {
          validation.valid = false;
          validation.errors.push(`Missing required field: ${step}.${field}`);
        }
      });
    } else {
      validation.valid = false;
      validation.errors.push(`Missing step: ${step}`);
    }
  });
  
  // Validate data ranges
  if (scenario.step1?.propertyPrice) {
    if (scenario.step1.propertyPrice < 100000 || scenario.step1.propertyPrice > 10000000) {
      validation.warnings.push('Property price outside typical range (100K - 10M)');
    }
  }
  
  return validation;
}

module.exports = {
  testData,
  getScenario,
  getRandomData,
  generateRandomScenario,
  validateScenario
};