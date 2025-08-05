# Advanced Cypress QA Testing Guide

## 🎯 Professional QA Test Automation

This guide covers comprehensive QA practices using Cypress for the BankIM application.

## 📋 Test Categories

### 1. Functional Testing
- **Form Validation**: Positive and negative test cases
- **User Workflows**: Complete end-to-end user journeys
- **API Integration**: Backend service verification
- **Navigation**: Page routing and state management

### 2. Non-Functional Testing
- **Performance**: Page load times, API response times
- **Accessibility**: WCAG compliance, keyboard navigation
- **Responsive Design**: Cross-device compatibility
- **Cross-Browser**: Chrome, Firefox, Safari, Edge

### 3. Security Testing
- **Input Validation**: XSS prevention, SQL injection
- **Authentication**: Session management, token handling
- **Data Privacy**: PII protection, secure transmission

## 🚀 Running QA Test Suites

### Complete Test Suite
```bash
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp

# Run all tests
npm run cypress:run

# Run specific test suite
npm run cypress:run -- --spec "cypress/e2e/bank-employee/**/*.cy.ts"

# Run with specific browser
npm run cypress:run -- --browser chrome

# Run in headed mode to see execution
npm run test:e2e:headed
```

### Interactive Testing (Recommended for Development)
```bash
# Open Cypress Test Runner
npm run cypress

# Select test file: bank-employee/registration-flow.cy.ts
# Watch tests execute in real browser
# Debug failures step by step
```

## 📊 Test Coverage Areas

### Bank Employee Registration Tests
✅ **Page Load & Performance**
- Page loads under 3 seconds
- All elements render correctly
- No console errors

✅ **Form Validation**
- Required field validation
- Format validation (email, phone)
- Length validation (min/max characters)
- Error message display
- Error clearing on correction

✅ **Dropdown Functionality**
- Banks dropdown loads from API
- Search/filter functionality
- Selection updates form state
- Branch loading based on bank selection

✅ **Language Switching**
- UI text changes correctly
- RTL/LTR direction switching
- Form data preservation
- Language persistence in localStorage

✅ **Responsive Design**
- Desktop (1280x720)
- Tablet (768x1024)
- Mobile (375x667)
- Element visibility and accessibility

✅ **API Integration**
- Banks API loading
- Cities API loading
- Error handling for failed requests
- Network request validation

✅ **Accessibility**
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader compatibility

## 🧪 Test Data Management

### Using Test Fixtures
```typescript
// Load test data
cy.fixture('testData').then((data) => {
  cy.fillBankEmployeeForm(data.bankEmployee.valid);
});
```

### API Mocking
```typescript
// Mock API responses
cy.intercept('GET', '/api/banks/list*', {
  fixture: 'testData.json'
}).as('getBanks');
```

## 🔍 Custom Commands for QA

### Form Testing
```typescript
// Fill registration form
cy.fillBankEmployeeForm({
  fullName: 'John Doe',
  position: 'Manager',
  email: 'john@bank.com',
  bankNumber: '12345'
});

// Check validation
cy.checkFormValidation('fullName', 'required');
```

### Performance Testing
```typescript
// Check page load time
cy.checkPageLoadTime(3000); // max 3 seconds

// Wait for API with validation
cy.waitForApiResponse('@getBanks');
```

### Responsive Testing
```typescript
// Test element across viewports
cy.testResponsive('input[name="fullName"]');
```

## 📈 Test Reporting

### Generate Test Reports
```bash
# Run tests with reporting
npm run cypress:run -- --reporter mochawesome

# Generate HTML report
npm run cypress:run -- --reporter junit --reporter-options mochaFile=results/test-results.xml
```

### Screenshots and Videos
- Automatic screenshots on failures
- Video recording of test execution
- Stored in `/cypress/screenshots/` and `/cypress/videos/`

## 🐛 Debugging Test Failures

### Interactive Debugging
1. Run test in interactive mode
2. Use `cy.pause()` to stop execution
3. Inspect DOM and application state
4. Step through commands manually

### Common Issues and Solutions

**Element not found**
```typescript
// Wait for element to appear
cy.get('selector', { timeout: 10000 }).should('be.visible');

// Use more specific selectors
cy.get('[data-cy="submit-button"]').click();
```

**API timing issues**
```typescript
// Properly wait for API calls
cy.intercept('GET', '/api/endpoint').as('apiCall');
cy.wait('@apiCall');
```

**Flaky tests**
```typescript
// Add proper waits
cy.get('element').should('be.visible').click();

// Retry on failure
Cypress.config('retries', { runMode: 2, openMode: 1 });
```

## 📋 QA Checklist

### Before Running Tests
- [ ] Application is running locally
- [ ] Test data is prepared
- [ ] API endpoints are accessible
- [ ] Environment variables are set

### Test Execution
- [ ] All test suites pass
- [ ] No console errors during execution
- [ ] Screenshots/videos captured for failures
- [ ] Performance metrics within acceptable range

### After Testing
- [ ] Test results documented
- [ ] Failures investigated and reported
- [ ] Test data cleaned up
- [ ] Reports generated and shared

## 🔧 Advanced Configuration

### Cypress Configuration (cypress.config.ts)
```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 1
    }
  }
});
```

### Environment Variables
```bash
# .env file
CYPRESS_API_URL=http://localhost:8003
CYPRESS_TEST_USER_PHONE=0501234567
CYPRESS_TEST_USER_OTP=123456
```

## 🚨 Test Maintenance

### Regular Tasks
1. **Update test data** when business rules change
2. **Review selectors** for stability
3. **Update API mocks** when endpoints change
4. **Monitor test execution time** and optimize slow tests
5. **Clean up obsolete tests** when features are removed

### Best Practices
- Use data attributes for stable selectors
- Keep tests independent and atomic
- Use descriptive test names
- Group related tests in describe blocks
- Mock external dependencies
- Maintain test data separately

## 📞 Support and Resources

### Documentation
- [Cypress Official Docs](https://docs.cypress.io)
- [Testing Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Testing Guide](https://docs.cypress.io/guides/guides/network-requests)

### Team Resources
- Test results: `/cypress/reports/`
- Screenshots: `/cypress/screenshots/`
- Videos: `/cypress/videos/`
- Test data: `/cypress/fixtures/`