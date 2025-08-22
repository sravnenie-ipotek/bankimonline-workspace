# 🤖 Banking Application Automation Suite

Centralized automation testing suite for the banking application with comprehensive mobile, E2E, integration, and QA testing capabilities.

## 📁 Folder Structure

```
automation/
├── configs/                      # Test configurations
│   ├── cypress.config.ts         # Main Cypress configuration
│   ├── cypress.mobile.config.ts  # Mobile-specific Cypress config
│   ├── playwright.config.ts      # Playwright desktop/integration config
│   └── playwright.mobile.config.ts # Playwright mobile device config
├── tests/                        # All test files
│   ├── e2e/                      # Cypress E2E tests
│   │   ├── mobile/               # Mobile-specific E2E tests
│   │   ├── support/              # Cypress support files
│   │   └── **/*.cy.ts            # Test files
│   ├── mobile/                   # Mobile-specific tests
│   ├── qa/                       # Quality assurance tests
│   └── integration/              # Playwright integration tests
├── scripts/                      # Automation utility scripts
│   ├── runners/                  # Test runner scripts
│   ├── qa/                       # QA-specific scripts
│   ├── verify-mobile-fixes.js    # Mobile bug verification
│   └── comprehensive-qa-validation.js # Full QA suite
├── reports/                      # Generated test reports
├── screenshots/                  # Test screenshots and evidence
│   ├── mobile-verification-screenshots/
│   ├── local-dropdown-screenshots/
│   └── translation-screenshots/
├── run-all-automation.js         # Master automation runner
└── README.md                     # This file
```

## 🚀 Quick Start

### Run All Tests
```bash
node automation/run-all-automation.js
```

### Run Specific Test Suites
```bash
# Mobile tests only
node automation/run-all-automation.js --mobile

# E2E tests only  
node automation/run-all-automation.js --e2e

# Integration tests only
node automation/run-all-automation.js --integration

# QA checks only
node automation/run-all-automation.js --qa

# Verbose output
node automation/run-all-automation.js --verbose

# Stop on first error
node automation/run-all-automation.js --stop-on-error
```

## 📱 Mobile Testing

### Cypress Mobile Testing
- **Viewport**: 375x812 (iPhone X)
- **Configuration**: `configs/cypress.mobile.config.ts`
- **Tests Location**: `tests/e2e/mobile/` and `tests/e2e/**/*mobile*.cy.ts`

```bash
# Run Cypress mobile tests
npx cypress run --config-file automation/configs/cypress.mobile.config.ts
```

### Playwright Mobile Testing
- **16 Device Configurations**: iPhone SE, iPhone 12/13, iPad, Pixel 5/7, Galaxy devices
- **Hebrew Locale Support**: `he-IL` with RTL testing
- **Configuration**: `configs/playwright.mobile.config.ts`

```bash
# Run Playwright mobile tests
npx playwright test --config=automation/configs/playwright.mobile.config.ts
```

### Mobile Test Features
- ✅ Button overflow detection and fixes
- ✅ Dropdown functionality validation
- ✅ iPhone X safe area support
- ✅ Responsive layout verification
- ✅ Hebrew RTL testing
- ✅ Cross-device compatibility

## 🌐 E2E Testing

### Cypress E2E Tests
- **Base URL**: `http://localhost:5173`
- **API URL**: `http://localhost:8003`
- **Browser Support**: Chrome, Firefox, Edge
- **Features**: Screenshots, videos, Jira integration

```bash
# Run Cypress E2E tests
npx cypress run --config-file automation/configs/cypress.config.ts
```

### Key E2E Test Categories
- 🏦 Banking workflows (mortgage, credit calculation)
- 🔐 Authentication flows
- 📊 Multi-step form validation
- 🌍 Multi-language testing (en/he/ru)
- 🔧 Dropdown functionality
- 📈 State management persistence

## ⚡ Integration Testing

### Playwright Integration Tests
- **Cross-Browser**: Chrome, Firefox, Safari
- **Mobile Devices**: iPhone, Android, iPad
- **Server Management**: Auto-starts frontend & backend
- **Parallel Execution**: Optimized performance

```bash
# Run Playwright integration tests
npx playwright test --config=automation/configs/playwright.config.ts
```

## 🔍 QA Testing

### Comprehensive QA Validation
- **Performance Testing**: Load times, Core Web Vitals
- **Security Scanning**: Authentication, input validation
- **Translation Validation**: Multi-language completeness
- **Database Integrity**: Content migration verification
- **API Testing**: Endpoint validation

```bash
# Run comprehensive QA suite
node automation/scripts/comprehensive-qa-validation.js
```

### QA Check Categories
- 📊 Performance metrics
- 🔒 Security validation
- 🌐 Translation coverage
- 🗄️ Database consistency
- 📡 API functionality
- 📱 Mobile responsiveness

## 📊 Reporting

### Automated Reports
- **JSON Reports**: Machine-readable test results
- **HTML Reports**: Visual test reports with screenshots
- **Screenshot Evidence**: Automatic failure documentation
- **Jira Integration**: Automatic bug creation
- **Percy Integration**: Visual regression testing

### Report Locations
```
automation/reports/
├── automation-report-{timestamp}.json
├── cypress-report.html
├── playwright-report/
└── qa-validation-report.html
```

## 🔧 Configuration

### Environment Variables
```bash
# Required for testing
CYPRESS_BASE_URL=http://localhost:5173
CYPRESS_API_URL=http://localhost:8003
DATABASE_URL=your_database_url

# Optional - Jira integration
JIRA_HOST=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your_api_token
JIRA_PROJECT_KEY=PROJ

# Optional - Percy visual testing
PERCY_TOKEN=your_percy_token
```

### Server Requirements
- **Frontend Server**: Port 5173 (Vite dev server)
- **Backend API**: Port 8003 (Node.js server)
- **Database**: PostgreSQL (Railway or local)

## 🐛 Bug Detection & Fixes

### Recently Fixed Issues
- ✅ **Mobile Button Overflow**: Fixed CSS positioning from `sticky` to `fixed`
- ✅ **Dropdown Duplicates**: Implemented deduplication logic
- ✅ **iPhone X Safe Areas**: Added `env(safe-area-inset-bottom)` support
- ✅ **Layout Issues**: Fixed container padding for small screens

### Bug Verification
```bash
# Verify mobile fixes
node automation/scripts/verify-mobile-fixes.js

# Visual evidence available in:
automation/screenshots/mobile-verification-screenshots/
```

## 🎯 Test Categories

### Critical Path Testing
- User registration and authentication
- Mortgage calculation workflows
- Credit application processes
- Bank offers and comparisons
- Multi-language functionality

### Regression Testing
- UI component functionality
- Form validation logic
- State management persistence
- API endpoint responses
- Database content integrity

### Performance Testing
- Page load times (<3 seconds)
- Mobile responsiveness
- API response times (<200ms)
- Resource optimization
- Core Web Vitals

## 📈 Performance Metrics

### Target Performance Standards
- **Desktop Load Time**: <1 second
- **Mobile Load Time**: <3 seconds
- **API Response**: <200ms
- **Test Execution**: <5 minutes (full suite)
- **Coverage**: >90% critical path coverage

## 🚦 CI/CD Integration

### GitHub Actions Integration
```yaml
- name: Run Automation Suite
  run: |
    cd automation
    node run-all-automation.js --verbose
```

### Pre-deployment Checklist
1. ✅ All mobile tests pass
2. ✅ E2E workflows complete successfully
3. ✅ QA validation passes
4. ✅ No critical security issues
5. ✅ Performance metrics within bounds

## 🛡️ Security Testing

### Security Validation
- Authentication bypass attempts
- Input sanitization testing
- SQL injection prevention
- XSS vulnerability scanning
- CSRF token validation

## 🌍 Multi-Language Testing

### Language Support
- **English**: Primary language, full coverage
- **Hebrew**: RTL support, banking terminology
- **Russian**: Secondary language, UI translations

### Translation Testing
```bash
# Verify all translations exist
npx cypress run --spec "tests/e2e/translation-*.cy.ts"

# Check Hebrew RTL rendering
npx cypress run --spec "tests/e2e/hebrew-rtl.cy.ts"
```

## 📞 Support & Troubleshooting

### Common Issues

**Port Conflicts**
```bash
# Kill existing processes
./kill-ports.sh
lsof -ti:5173,8003 | xargs kill -9
```

**Configuration Issues**
```bash
# Verify config paths
node -e "console.log(require('./configs/cypress.config.ts'))"
```

**Database Connection**
```bash
# Test database connectivity
node ../test-railway-simple.js
```

### Getting Help
- Check existing test reports in `automation/reports/`
- Review screenshots in `automation/screenshots/`
- Examine configuration files in `automation/configs/`
- Run individual test suites for debugging

## 📋 Test Development

### Adding New Tests

**Cypress E2E Test**
```typescript
// tests/e2e/new-feature.cy.ts
describe('New Feature', () => {
  it('should work correctly', () => {
    cy.visit('/new-feature')
    cy.get('[data-testid="feature-button"]').click()
    cy.contains('Expected Result').should('be.visible')
  })
})
```

**Playwright Mobile Test**
```typescript
// tests/mobile/new-mobile-test.spec.ts
import { test, expect } from '@playwright/test'

test('mobile feature works', async ({ page }) => {
  await page.goto('/feature')
  await page.click('[data-testid="mobile-button"]')
  await expect(page.locator('.result')).toBeVisible()
})
```

### Best Practices
- Use data-testid attributes for element selection
- Include screenshot capture for failures
- Write descriptive test names and descriptions
- Test both happy path and error scenarios
- Validate multi-language support

## 🏁 Conclusion

This automation suite provides comprehensive testing coverage for the banking application with focus on:
- **Mobile-first approach** with extensive device testing
- **Multi-language support** for Hebrew RTL and Russian
- **Performance validation** with defined metrics
- **Automated reporting** and bug detection
- **CI/CD integration** for deployment confidence

For questions or issues, check the troubleshooting section or create a GitHub issue with automation logs and screenshots.