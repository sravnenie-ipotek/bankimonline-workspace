# Cypress E2E Testing Guide

## Overview
This guide explains how to run end-to-end tests using Cypress in the BankIM project.

## Prerequisites
1. Node.js installed (v16 or higher)
2. Project dependencies installed (`npm install` in the mainapp directory)
3. Development server running or production build available

## Running Cypress Tests

### 1. Start the Application
First, ensure the application is running:
```bash
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp
npm run dev
```
The app should be available at http://localhost:5173 (or 5174 if 5173 is in use)

### 2. Open Cypress Test Runner (Interactive Mode)
In a new terminal:
```bash
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp
npm run cypress
```
This opens the Cypress Test Runner where you can:
- See all available tests
- Click on any test to run it
- Watch the test execute in a real browser
- Debug failures step by step

### 3. Run Tests in Headless Mode
For CI/CD or quick testing:
```bash
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp
npm run cypress:run
```

### 4. Run Tests with Visible Browser (No UI)
```bash
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp
npm run test:e2e:headed
```

## Available Test Scripts
- `npm run cypress` - Opens Cypress UI
- `npm run cypress:run` - Runs all tests headlessly
- `npm run test:e2e` - Runs E2E tests
- `npm run test:e2e:headed` - Runs E2E tests with visible browser

## Test Locations
All E2E tests are located in: `/mainapp/cypress/e2e/`

### Current Test Structure:
- `basic/app-launch.cy.ts` - Basic app loading and navigation
- `auth/login.cy.ts` - Authentication tests
- `language/language-switching.cy.ts` - Language switching tests
- `services/mortgage-calculator.cy.ts` - Service-specific tests

## Writing New Tests
1. Create a new file in `/cypress/e2e/` with `.cy.ts` extension
2. Follow the pattern:
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/page-url')
  })
  
  it('should do something', () => {
    // Test steps
  })
})
```

## Common Cypress Commands
- `cy.visit('/url')` - Navigate to a page
- `cy.get('selector')` - Find element
- `cy.contains('text')` - Find by text
- `cy.click()` - Click element
- `cy.type('text')` - Type text
- `cy.should('be.visible')` - Assert visibility

## Debugging Failed Tests
1. Run in interactive mode to see what happened
2. Check screenshots in `/cypress/screenshots/`
3. Review console errors in the Cypress UI
4. Use `cy.pause()` to stop execution at any point

## Best Practices
1. Use data-cy attributes for stable selectors
2. Keep tests independent - each test should run on its own
3. Use proper waits instead of hard-coded delays
4. Test user flows, not implementation details

## Troubleshooting
- **Port conflicts**: If localhost:5173 is busy, check which port Vite is using
- **Timeouts**: Increase timeout in cypress.config.ts if needed
- **Network issues**: Check if APIs are accessible from Cypress

## Running Specific Tests
To run only specific tests:
```bash
npm run cypress:run -- --spec "cypress/e2e/basic/app-launch.cy.ts"
```

## Environment Variables
Cypress uses the same environment as your app. Ensure `.env` files are properly configured.

## CI/CD Integration
For CI/CD pipelines, use:
```bash
npm run cypress:run --reporter junit --reporter-options mochaFile=results/cypress-results.xml
```

## Support
For issues or questions:
1. Check Cypress docs: https://docs.cypress.io
2. Review existing tests for examples
3. Check console for error messages