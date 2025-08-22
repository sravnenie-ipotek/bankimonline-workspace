# 🎨 Percy Visual Regression Testing Guide

Comprehensive visual regression testing setup for the banking application with Hebrew RTL support, mobile responsiveness, and banking compliance.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup & Installation](#setup--installation)  
- [Test Suites](#test-suites)
- [Running Tests](#running-tests)
- [Mobile Button Overflow Testing](#mobile-button-overflow-testing)
- [Hebrew RTL Testing](#hebrew-rtl-testing)
- [CI/CD Integration](#cicd-integration)
- [Jira Integration](#jira-integration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Percy visual regression testing implementation for:
- **Banking Workflows**: Mortgage calculator, credit applications, refinancing
- **Multi-language Support**: Hebrew RTL, English, Russian
- **Mobile Responsiveness**: Button overflow fixes, touch targets, viewport testing
- **Security Compliance**: Sensitive data masking, banking regulations
- **Cross-browser Testing**: Chrome, Firefox, Edge compatibility

### Key Features

✅ **Comprehensive Coverage**
- Mortgage calculation workflow (4 steps)
- Credit application process (4 steps) 
- Mobile button overflow validation
- Hebrew RTL layout testing

✅ **Banking Compliance**
- Sensitive data masking (ID numbers, financial data)
- Hebrew banking terminology validation
- Israeli currency formatting (ILS/Shekel)
- Multi-language form validation

✅ **Mobile-First Testing**
- Button overflow detection and fixes
- Touch target size validation (44px minimum)
- Hebrew mobile RTL layouts
- Cross-device compatibility (iPhone SE to iPhone 12 Pro Max)

✅ **CI/CD Integration**
- GitHub Actions workflow
- Parallel test execution
- Jira issue creation for visual regressions
- Performance impact assessment

## 🛠️ Setup & Installation

### Prerequisites

1. **Percy Account**: Sign up at [percy.io](https://percy.io)
2. **Percy Token**: Get your project token from Percy dashboard
3. **Dependencies**: Percy packages already installed in mainapp/package.json

### Environment Variables

Create `.env` file in project root:

```bash
# Percy Configuration
PERCY_TOKEN=your_percy_token_here
PERCY_BRANCH=your_branch_name

# Application URLs
CYPRESS_BASE_URL=http://localhost:5173
CYPRESS_API_URL=http://localhost:8003

# Jira Integration (optional)
JIRA_HOST=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your_jira_api_token
JIRA_PROJECT_KEY=TVKC
```

### Local Setup

```bash
# 1. Install dependencies
cd mainapp && npm install

# 2. Start backend server
node server/server-db.js

# 3. Start frontend (in separate terminal)
cd mainapp && npm run dev

# 4. Verify Percy installation
npx percy --version

# 5. Run Percy tests
node automation/run-percy-tests.js quick
```

## 📊 Test Suites

### 1. Mortgage Calculator Visual Tests
**File**: `automation/tests/e2e/visual-regression/mortgage-calculator-percy.cy.ts`
- **Coverage**: 4-step mortgage calculation flow
- **Languages**: Hebrew, English, Russian
- **Viewports**: Desktop (1920px) to Mobile (320px)
- **Features**: Property ownership logic, LTV calculations, bank offers

```typescript
// Example test structure
describe('🏦 Mortgage Calculator - Percy Visual Regression', () => {
  context('📍 Step 1: Calculation Parameters', () => {
    it('🎯 Initial State - Clean Form Layout')
    it('🌐 Multi-language UI Comparison')
    it('📝 Form Filled State with Validation')
    it('💰 Property Ownership Business Logic Visual Test')
  })
  // ... additional contexts for Steps 2-4
})
```

### 2. Credit Calculator Visual Tests  
**File**: `automation/tests/e2e/visual-regression/credit-calculator-percy.cy.ts`
- **Coverage**: Personal and business credit applications
- **Features**: Credit scoring, income validation, approval flows
- **Security**: Financial data masking, ID protection

### 3. Mobile Button Overflow Tests
**File**: `automation/tests/e2e/visual-regression/mobile-button-overflow-percy.cy.ts`
- **Coverage**: Mobile button positioning and overflow detection
- **Devices**: iPhone SE (320px) to iPhone 12 Pro Max (428px)
- **Features**: Sticky button positioning, tap target validation

### 4. Hebrew RTL Visual Tests
**File**: `automation/tests/e2e/visual-regression/hebrew-rtl-percy.cy.ts`  
- **Coverage**: Hebrew font loading, RTL layouts, banking terminology
- **Features**: Text alignment, form direction, currency formatting
- **Compliance**: Hebrew banking term accuracy

## 🚀 Running Tests

### Command Line Options

```bash
# Run all Percy visual tests
node automation/run-percy-tests.js all

# Quick test (mobile overflow only)
node automation/run-percy-tests.js quick

# Mobile-focused tests
node automation/run-percy-tests.js mobile

# Desktop tests only
node automation/run-percy-tests.js desktop

# Specific test suite
node automation/run-percy-tests.js suite mortgage-visual
node automation/run-percy-tests.js suite hebrew-rtl
```

### NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "percy": "node automation/run-percy-tests.js",
    "percy:quick": "node automation/run-percy-tests.js quick",
    "percy:mobile": "node automation/run-percy-tests.js mobile",
    "percy:desktop": "node automation/run-percy-tests.js desktop",
    "percy:ci": "node automation/run-percy-tests.js all --ci"
  }
}
```

### Cypress Integration

```bash
# Run with Cypress UI (for development)
npx percy exec --config automation/configs/percy.config.json -- npx cypress open --config-file automation/configs/cypress.config.ts

# Run specific test file
npx percy exec --config automation/configs/percy.config.json -- npx cypress run --config-file automation/configs/cypress.config.ts --spec "automation/tests/e2e/visual-regression/mortgage-calculator-percy.cy.ts"
```

## 📱 Mobile Button Overflow Testing

### Problem Statement
Mobile banking users experienced button overflow issues where critical action buttons (Continue, Submit) were positioned outside the viewport, especially on smaller screens.

### Solution Implemented
- **Sticky Positioning**: Buttons remain visible during scrolling
- **Viewport Detection**: Automatic detection of buttons outside viewport
- **Visual Indicators**: Percy highlights overflow issues with red borders
- **Cross-device Testing**: Validation across iPhone SE to iPhone 12 Pro Max

### Test Coverage

```typescript
// Button overflow detection
cy.percyTestButtonOverflow('Refinance Mortgage Mobile')

// Sticky positioning validation  
cy.percySnapshotMobile('Mobile Button Fix Validation', {
  testButtonOverflow: true,
  percyCSS: `
    .mobile-button-fix {
      position: sticky !important;
      bottom: 20px !important;
      z-index: 1000 !important;
    }
  `
})
```

### Visual Validation
- ✅ Buttons within viewport boundaries
- ✅ Sticky positioning during scroll
- ✅ Touch target size ≥44px (iOS guidelines)
- ✅ Hebrew RTL button layout

## 🇮🇱 Hebrew RTL Testing

### Hebrew Banking Terminology
Key Hebrew terms validated in visual tests:

| English | Hebrew | Usage |
|---------|---------|-------|
| Mortgage | משכנתא | Main product category |
| Interest Rate | ריבית | Financial calculations |
| Down Payment | מקדמה | Initial payment |
| Property | נכס | Asset classification |
| Loan | הלוואה | Credit products |
| Credit | אשראי | Credit applications |

### RTL Layout Validation

```typescript
// Hebrew RTL visual testing
cy.percySnapshotRTL('Hebrew Mortgage Form', {
  rtlTest: true,
  percyCSS: `
    /* RTL form styling */
    body {
      direction: rtl !important;
      font-family: 'Heebo', Arial, sans-serif !important;
    }
    
    input, textarea, select {
      text-align: right !important;
      direction: rtl !important;
    }
  `
})
```

### Hebrew Font Loading
- **Font**: Heebo (Google Fonts)
- **Loading**: Verified in Percy CSS configuration
- **Fallback**: Arial for compatibility
- **Performance**: Font loading impact measured

### Currency Formatting
- **Symbol**: ₪ (Israeli Shekel)
- **Format**: 1,500,000 ₪ (2.5 מיליון שקלים)
- **Direction**: Numbers remain LTR, labels RTL

## ⚙️ CI/CD Integration

### GitHub Actions Workflow
**File**: `.github/workflows/percy-visual-regression.yml`

```yaml
name: 🎨 Percy Visual Regression Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  percy-desktop:
    strategy:
      matrix:
        suite: [
          'mortgage-calculator',
          'credit-calculator',
          'hebrew-rtl',
          'comprehensive-flows'
        ]
    
  percy-mobile:
    strategy:
      matrix:
        device: [
          'iPhone-SE',
          'iPhone-12',
          'Samsung-Galaxy'
        ]
```

### Parallel Execution
- **Desktop Testing**: 4 parallel jobs
- **Mobile Testing**: 3 parallel jobs  
- **Cross-browser**: Chrome, Firefox, Edge
- **Duration**: ~15 minutes total

### PR Integration
Percy automatically comments on pull requests with:
- Visual difference summary
- Links to Percy build and comparison
- Test coverage report
- Mobile and Hebrew RTL validation status

## 🎯 Jira Integration

### Automatic Issue Creation
Visual regression failures automatically create Jira issues with:

```javascript
// Visual regression Jira issue data
{
  testName: "Mortgage Calculator Visual Regression",
  snapshots: ["Step 1 - Layout Difference"],
  percyBuildUrl: "https://percy.io/banking-app/builds/123456",
  visualDifferences: [{
    elementName: "Submit Button",
    changeType: "layout",
    severity: "high"
  }],
  affectedLanguages: ["he", "en"],
  affectedViewports: [375, 768, 1280],
  bankingImpact: "critical-path"
}
```

### Issue Classification
- **Banking Impact**: `ui-only`, `data-display`, `form-validation`, `critical-path`
- **Severity**: `low`, `medium`, `high`, `critical`
- **Language Impact**: Specific language(s) affected
- **Viewport Impact**: Screen sizes affected

### Jira Issue Content
Issues include:
- Bilingual descriptions (Hebrew/English)
- Percy build and comparison links  
- Affected languages and viewports
- Banking impact assessment
- Screenshot attachments
- Step-by-step reproduction

## 🔧 Custom Commands

### Banking-Specific Commands

```typescript
// Multi-language testing
cy.percySnapshotMultiLang('Mortgage Step 1')

// Secure data masking
cy.percySnapshotSecure('Credit Application', {
  maskSensitiveData: true
})

// Mobile responsive testing
cy.percySnapshotResponsive('Banking Form')

// Hebrew RTL testing
cy.percySnapshotRTL('Hebrew Banking Form')

// Button overflow testing
cy.percyTestButtonOverflow('Mobile Banking Page')
```

### Form Utilities

```typescript
// Fill banking form fields
cy.fillFormField('property_value', '1500000')
cy.fillFormField('monthly_income', '18000')

// Complete form quickly
cy.fillAllFormFields()

// Banking page load
cy.waitForBankingPageLoad()
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Percy Token Issues
```bash
# Error: Percy token not found
export PERCY_TOKEN=your_token_here
# or add to .env file
```

#### 2. Server Connectivity
```bash
# Check if servers are running
curl http://localhost:5173  # Frontend
curl http://localhost:8003  # Backend API

# Start servers if needed
node server/server-db.js &
cd mainapp && npm run dev
```

#### 3. Hebrew Font Loading
```bash
# Font loading issues
# Check network requests for Heebo font
# Ensure Google Fonts accessibility
# Verify CSS font-family declarations
```

#### 4. Mobile Button Overflow
```bash
# Debug button positions
cy.get('button').then($buttons => {
  $buttons.each((index, button) => {
    const rect = button.getBoundingClientRect()
    console.log(`Button ${index}: bottom=${rect.bottom}px`)
  })
})
```

#### 5. Percy Build Failures
```bash
# Check Percy dashboard for:
# - Build status and errors
# - Visual differences requiring approval
# - Baseline image issues
# - Configuration problems
```

### Debug Mode

```bash
# Run Percy tests with debug output
DEBUG=percy* node automation/run-percy-tests.js quick

# Cypress debug mode
npx cypress run --config-file automation/configs/cypress.config.ts --spec "automation/tests/e2e/visual-regression/mortgage-calculator-percy.cy.ts" --browser chrome --headed
```

### Performance Optimization

```bash
# Reduce Percy test duration
# - Use targeted selectors (scope parameter)
# - Limit viewport testing to essential breakpoints
# - Parallelize test execution
# - Cache node_modules in CI/CD

# Example: Scoped testing
cy.percySnapshot('Form Section', {
  scope: '.mortgage-form'  # Only capture form area
})
```

## 📈 Best Practices

### 1. Test Organization
- Group related tests in contexts
- Use descriptive test names
- Include banking feature in test names
- Separate mobile and desktop tests

### 2. Visual Validation
- Test critical user paths first
- Include error states and validation
- Validate multi-language consistency
- Test responsive breakpoints

### 3. Data Management  
- Use realistic banking data (Israeli amounts)
- Mask sensitive information consistently
- Test with Hebrew names and addresses
- Include edge cases (large amounts, long text)

### 4. Performance
- Use Percy CSS to reduce visual noise
- Scope snapshots to relevant sections
- Minimize animation and transitions
- Batch related test scenarios

### 5. Maintenance
- Review Percy baselines regularly
- Update visual tests with UI changes
- Monitor Percy dashboard for trends
- Keep Hebrew translations current

## 📚 Resources

- [Percy Documentation](https://docs.percy.io/)
- [Cypress Percy Plugin](https://docs.percy.io/docs/cypress)
- [Hebrew Web Typography Guide](https://hebrew-typography.com/)
- [iOS Touch Target Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [Banking UI Accessibility Standards](https://www.w3.org/WAI/WCAG21/Understanding/)

---

**Maintained by**: Banking Application QA Team  
**Last Updated**: January 2025  
**Version**: 1.0.0