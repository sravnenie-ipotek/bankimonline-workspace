# Cypress Testing Guide

This directory contains automated tests for the BankDev application, including E2E tests and translation coverage tests.

## Prerequisites

1. **Backend server must be running** on port 8003:
   ```bash
   # From project root
   node server-db.js
   ```

2. **Frontend application must be running** on port 5173:
   ```bash
   # From mainapp directory
   npm run dev
   ```

## Test Types

### 1. Translation Coverage Tests

Tests that scan the entire application for untranslated text in Hebrew and Russian.

#### Quick Translation Check
Scans main pages and visually highlights untranslated elements:
```bash
# Run in headless mode
npm run test:translations

# Run with visual UI (recommended for debugging)
npm run test:translations:visual
```

#### Full Translation Scan
Comprehensive scan of ALL pages with detailed reporting:
```bash
npm run test:translations:full
```

**Reports generated:**
- `cypress/reports/translation-scan-report.md` - Human-readable report
- `cypress/reports/translation-scan-data.json` - Machine-readable data
- `cypress/screenshots/` - Screenshots of pages with issues

### 2. E2E Tests

#### Run all E2E tests:
```bash
npm run test:e2e
```

#### Run E2E tests with browser visible:
```bash
npm run test:e2e:headed
```

#### Open Cypress Test Runner:
```bash
npm run cypress
```

## What Translation Tests Check For

1. **Translation Keys** - Untranslated keys like `calculate_mortgage_option_1`
2. **Development Text** - `undefined`, `null`, `TODO`, `DEBUG`, etc.
3. **Language Mismatches** - English text when viewing Hebrew/Russian pages
4. **Missing Content** - Placeholder text like `...` or `---`
5. **Common UI Terms** - Untranslated Submit, Cancel, Next, etc.

## Translation Test Workflow

1. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd /path/to/bankDev2_standalone
   node server-db.js
   
   # Terminal 2 - Frontend
   cd /path/to/bankDev2_standalone/mainapp
   npm run dev
   ```

2. **Run translation tests:**
   ```bash
   # For quick visual inspection
   npm run test:translations:visual
   
   # For full automated scan
   npm run test:translations:full
   ```

3. **Review results:**
   - Check console output for summary
   - Open `cypress/reports/translation-scan-report.md` for detailed findings
   - Review screenshots in `cypress/screenshots/` for visual evidence

## Pages Tested

The translation tests cover:
- Home page (`/`)
- About, Contacts, Services pages
- All mortgage calculation steps (1-4)
- All refinance mortgage steps (1-3)
- All credit calculation steps (1-3)
- All refinance credit steps (1-3)
- Other borrowers pages
- Business pages (cooperation, brokers, lawyers)
- Authentication pages (login, registration)

## Troubleshooting

### Tests fail to start
- Ensure both backend (port 8003) and frontend (port 5173) are running
- Check `cypress.config.ts` for correct `baseUrl`

### Translation tests find too many false positives
- Edit `UNTRANSLATED_PATTERNS` in test files to adjust detection patterns
- Add exceptions to `allowedEnglish` arrays for terms that should remain in English

### Screenshots not being saved
- Check that `cypress/screenshots/` directory exists
- Ensure sufficient disk space

### Timeout errors
- Increase `defaultCommandTimeout` in `cypress.config.ts`
- Add explicit waits after page navigation if content loads slowly

## Custom Test Development

To add new translation checks:

1. Edit `cypress/e2e/translation-checker.cy.ts` or `full-translation-scan.cy.ts`
2. Add new routes to `ROUTES` or `ALL_ROUTES` array
3. Add new patterns to `UNTRANSLATED_PATTERNS`
4. Run tests to verify changes

## CI/CD Integration

To run in CI environment:
```bash
# Install dependencies
npm ci

# Run tests in headless mode
npm run test:translations:full

# Check exit code and reports
if [ -f cypress/reports/translation-scan-data.json ]; then
  # Parse JSON and fail build if issues > threshold
  node check-translation-threshold.js
fi
```

## Additional Commands

```bash
# Open Cypress Test Runner for all tests
npm run cypress

# Run only component tests
npm run cypress:component

# Run specific test file
npx cypress run --spec "cypress/e2e/translation-checker.cy.ts"
```

## Report Examples

### Translation Scan Report Sample:
```
# TRANSLATION SCAN REPORT

Generated: 2024-01-24T10:30:00.000Z

## HE Language

Total issues: 47

### Issues by Page:
- Mortgage Step 2: 12 issues
- Refinance Mortgage 1: 8 issues
- Credit Step 1: 6 issues
...

### Most Common Issues:
- Translation key: 23 occurrences
- English in Hebrew: 15 occurrences
- Placeholder: 9 occurrences
...
```

### Visual Test Output:
- Highlighted elements with colored borders
- Red border: Translation keys
- Orange border: Language mismatches
- Purple border: Placeholder issues

## Best Practices

1. Run visual tests during development to catch issues early
2. Run full scan before releases to ensure complete coverage
3. Keep translation files synchronized using `npm run sync-translations`
4. Review and fix issues by priority (customer-facing text first)
5. Add new pages to test coverage as they're developed

## Support

For issues or questions:
- Check test output and logs in `cypress/videos/` and `cypress/screenshots/`
- Review `cypress.config.ts` for configuration options
- Ensure all services are running before testing