# Cypress Testing for BankIM Application

This document describes how to use Cypress for end-to-end testing of the BankIM application.

## Installation

Cypress should already be configured. To ensure it's installed:

```bash
npm install --save-dev cypress
```

## Running Tests

### Interactive Mode (Recommended for Development)

```bash
npm run cypress
```

This opens the Cypress Test Runner where you can:
- See all test files
- Run tests individually
- Watch tests execute in real-time
- Debug failing tests

### Headless Mode (For CI/CD)

```bash
npm run cypress:run
# or
npm run cypress:headless
```

### Run Specific Test Suite

```bash
# Run only authentication tests
npx cypress run --spec "cypress/e2e/auth/**/*.cy.ts"

# Run only mortgage calculator tests
npx cypress run --spec "cypress/e2e/services/mortgage-calculator.cy.ts"
```

## Test Structure

```
cypress/
├── e2e/                    # End-to-end test specs
│   ├── auth/              # Authentication tests
│   │   └── login.cy.ts
│   ├── services/          # Service flow tests
│   │   └── mortgage-calculator.cy.ts
│   └── language/          # Language switching tests
│       └── language-switching.cy.ts
├── fixtures/              # Test data
│   └── testUser.json
├── support/               # Support files and custom commands
│   ├── commands.ts        # Custom Cypress commands
│   ├── component.ts       # Component testing setup
│   └── e2e.ts            # E2E testing setup
└── tsconfig.json         # TypeScript configuration
```

## Custom Commands

### Authentication

```javascript
// Login with phone number
cy.login('972544123456', 'Test User')

// Handle OTP verification
cy.handleOTP('123456')
```

### Language

```javascript
// Switch language
cy.selectLanguage('he') // Hebrew
cy.selectLanguage('en') // English
cy.selectLanguage('ru') // Russian
```

### Form Helpers

```javascript
// Fill form field with Hebrew support
cy.fillFormField('propertyValue', '2000000')

// Select from dropdown
cy.selectDropdownOption('[name="purpose"]', 'דירה ראשונה')

// Select date
cy.selectDate('[name="birthDate"]', new Date('1990-01-01'))
```

### API Mocking

```javascript
// Mock API responses
cy.mockApiResponse('login', { success: true, token: 'test-token' })
```

## Writing New Tests

### Basic Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    cy.visit('/')
  })

  it('should do something', () => {
    // Test steps
    cy.get('[data-cy=element]').click()
    cy.contains('Expected Text').should('be.visible')
  })
})
```

### Best Practices

1. **Use data-cy attributes** for element selection:
   ```html
   <button data-cy="submit-button">Submit</button>
   ```

2. **Mock external APIs** to ensure consistent test results:
   ```javascript
   cy.intercept('POST', '/api/login', { fixture: 'loginSuccess.json' })
   ```

3. **Test both happy paths and error cases**

4. **Use fixtures** for test data:
   ```javascript
   cy.fixture('testUser.json').then((userData) => {
     cy.fillFormField('name', userData.validUser.name)
   })
   ```

5. **Handle async operations** properly:
   ```javascript
   cy.wait('@apiRequest')
   cy.get('[data-cy=result]', { timeout: 10000 }).should('be.visible')
   ```

## Environment Variables

Create `cypress.env.json` for environment-specific variables:

```json
{
  "apiUrl": "http://localhost:8003",
  "testUser": {
    "phone": "972544123456",
    "otp": "123456"
  }
}
```

**Note:** This file is gitignored. Never commit real credentials.

## Debugging Failed Tests

1. **Screenshots**: Automatically captured on failure in `cypress/screenshots/`
2. **Videos**: Recorded for all test runs in `cypress/videos/`
3. **Console Logs**: Visible in the Cypress Test Runner
4. **Time Travel**: Hover over commands in the Test Runner to see the app state

## CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run Cypress tests
  run: |
    npm run dev &
    npx wait-on http://localhost:3001
    npm run cypress:headless
```

## Common Issues

### Port Already in Use
Make sure the dev server is running on the expected port (3001).

### Tests Timing Out
- Increase timeout: `cy.get('element', { timeout: 10000 })`
- Check if the dev server is running
- Verify API mocks are set up correctly

### Hebrew Text Issues
- Ensure proper RTL support in tests
- Use Unicode strings for Hebrew text in assertions

## Tips

1. **Run tests in headed mode** during development for easier debugging
2. **Use .only** to run a single test: `it.only('test name', () => {})`
3. **Use .skip** to temporarily disable tests: `it.skip('test name', () => {})`
4. **Keep tests independent** - each test should be able to run on its own
5. **Clean up after tests** - reset application state as needed

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Writing Your First Test](https://docs.cypress.io/guides/getting-started/writing-your-first-test)