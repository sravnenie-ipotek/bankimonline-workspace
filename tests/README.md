# Playwright Tests for Banking Application

This directory contains Playwright tests that are accessible via the MCP (Model Context Protocol) server.

## MCP Server Configuration

The Playwright MCP server is already configured in the `.mcp.json` file:

```json
"playwright": {
  "type": "stdio",
  "command": "npx",
  "args": ["@playwright/mcp@latest"],
  "env": {}
}
```

## Available Test Suites

### 1. Banking Application Tests (`banking-app.spec.ts`)
- Homepage loading
- Calculator accessibility
- Navigation menu functionality
- Language switching
- Admin panel access

### 2. Mortgage Calculator Flow (`mortgage-calculator-flow.spec.ts`)
- Complete 4-step mortgage calculation process
- Form validation testing
- Interest type selection
- Navigation (back/forward) testing

## Running Tests

### Via npm scripts:
```bash
# Run all tests
npm test

# Run tests with browser visible
npm run test:headed

# Open Playwright UI for interactive testing
npm run test:ui

# Debug tests step by step
npm run test:debug

# Show test report
npm run test:report
```

### Via npx:
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/banking-app.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Run tests with UI
npx playwright test --ui
```

## MCP Server Integration

The MCP server provides the following capabilities:

1. **Test Execution**: Run Playwright tests programmatically
2. **Browser Automation**: Control browsers via the MCP interface
3. **Page Interactions**: Fill forms, click elements, navigate pages
4. **Assertions**: Verify page content and functionality
5. **Screenshots**: Capture visual evidence of test results

## Application URLs

The tests are configured to work with these local servers:

- **Frontend (React)**: `http://localhost:5173`
- **Backend API**: `http://localhost:8003`
- **Admin Panel**: `http://localhost:8003/admin`

## Test Data Attributes

The tests use `data-testid` attributes for reliable element selection:

- `[data-testid="mortgage-calculator"]`
- `[data-testid="credit-calculator"]`
- `[data-testid="sidebar-menu"]`
- `[data-testid="language-switcher"]`
- `[data-testid="next-step"]`
- `[data-testid="prev-step"]`

## Browser Support

Tests run on:
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Continuous Integration

The configuration includes CI-specific settings:
- Retry failed tests 2 times on CI
- Run tests sequentially on CI
- Disable parallel execution on CI

## Adding New Tests

1. Create new `.spec.ts` files in the `tests/` directory
2. Import `test` and `expect` from `@playwright/test`
3. Use descriptive test names and organize with `test.describe()`
4. Follow the existing patterns for page navigation and assertions

## MCP Server Commands

When using the MCP server, you can:

1. Execute tests programmatically
2. Generate new test cases
3. Debug failing tests
4. Create visual regression tests
5. Automate browser interactions

The MCP server makes these tests available to AI assistants and other tools for automated testing and quality assurance. 