# Figma + Cypress Visual Testing Integration Guide

## 🎨 Overview

This guide shows how to connect Cypress with Figma for automated design comparison and visual regression testing.

## 🚀 Quick Start

### 1. Run Visual Comparison Tests
```bash
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp

# Start the app
npm run dev

# Run visual tests
npm run cypress:run -- --spec "cypress/e2e/visual-testing/figma-comparison.cy.ts"

# Or run interactively
npm run cypress
```

### 2. View Screenshots
After running tests, check generated screenshots in:
- `/cypress/screenshots/figma-comparison.cy.ts/`

## 🔧 Integration Methods

### Method 1: Screenshot Comparison (Current Implementation)
✅ **Ready to use** - Takes screenshots for manual/automated comparison

```typescript
// Take component screenshots
cy.get('.mortgage-form').screenshot('mortgage-form-component');

// Compare across breakpoints
cy.viewport('ipad-2');
cy.screenshot('tablet-view');
```

### Method 2: Figma API Integration
```bash
# Set up environment variables
export FIGMA_TOKEN="your-figma-personal-access-token"
export FIGMA_FILE_ID="your-figma-file-id"
```

```typescript
// Get designs from Figma API
cy.request({
  method: 'GET',
  url: `https://api.figma.com/v1/images/${figmaFileId}`,
  headers: { 'X-Figma-Token': Cypress.env('FIGMA_TOKEN') }
}).then((response) => {
  // Compare with current implementation
});
```

### Method 3: Percy.io (Professional)
```bash
npm install --save-dev @percy/cypress

# Add to cypress/support/commands.ts
import '@percy/cypress';
```

```typescript
// In tests
cy.percySnapshot('Homepage');
cy.percySnapshot('Mortgage Calculator');
```

### Method 4: Applitools Eyes (AI-powered)
```bash
npm install --save-dev @applitools/eyes-cypress
```

## 📊 Current Visual Test Coverage

### ✅ Implemented Tests:

1. **Homepage Visual Comparison**
   - Full page screenshots
   - Header component
   - Services section
   - Individual service cards

2. **Mortgage Calculator Design**
   - Complete form layout
   - Input field styling
   - Responsive breakpoints (desktop/tablet/mobile)

3. **Component-Level Testing**
   - Logo design
   - Navigation elements
   - Language selector
   - Service cards

4. **State-Based Testing**
   - Empty form state
   - Filled form state  
   - Error state
   - Hover effects
   - Focus states

5. **Cross-Browser Testing**
   - Chrome, Firefox, Edge comparison
   - Browser-specific rendering differences

## 🎯 Figma Design Workflow

### Step 1: Export Figma Designs
1. Open your Figma file
2. Select frames/components to test
3. Export as PNG (2x for high DPI)
4. Save to `/cypress/fixtures/figma-designs/`

### Step 2: Create Baseline Screenshots
```bash
# Run tests to generate initial screenshots
npm run cypress:run -- --spec "cypress/e2e/visual-testing/figma-comparison.cy.ts"
```

### Step 3: Compare and Validate
1. Compare generated screenshots with Figma exports
2. Identify design discrepancies
3. Update implementation or accept changes
4. Re-run tests for validation

## 🔍 Advanced Comparison Techniques

### Pixel-Perfect Comparison
```typescript
// Custom command for exact pixel matching
cy.compareWithFigma('.mortgage-form', 'figma-designs/mortgage-form.png');
```

### Tolerance-Based Comparison
```typescript
// Allow small differences (useful for fonts, anti-aliasing)
cy.compareImages({
  current: 'current-screenshot.png',
  baseline: 'figma-export.png',
  threshold: 0.05 // 5% tolerance
});
```

### Component-Specific Testing
```typescript
describe('Design System Components', () => {
  it('should match button designs', () => {
    cy.get('button').each(($btn, index) => {
      cy.wrap($btn).screenshot(`button-${index}`, { overwrite: true });
    });
  });
  
  it('should match form input designs', () => {
    cy.get('input').each(($input, index) => {
      cy.wrap($input).screenshot(`input-${index}`, { overwrite: true });
    });
  });
});
```

## 🛠️ Setup for Production Use

### 1. Install Visual Testing Tools
```bash
# Choose one based on your needs:

# Free option - Manual comparison
npm install --save-dev cypress-image-snapshot

# Professional options
npm install --save-dev @percy/cypress
npm install --save-dev @applitools/eyes-cypress
```

### 2. Configure Environment Variables
```bash
# .env file
FIGMA_TOKEN=your_figma_personal_access_token
FIGMA_FILE_ID=your_figma_file_id
PERCY_TOKEN=your_percy_token (if using Percy)
APPLITOOLS_API_KEY=your_applitools_key (if using Applitools)
```

### 3. Add to CI/CD Pipeline
```yaml
# GitHub Actions example
- name: Run Visual Tests
  run: |
    npm run dev &
    sleep 10
    npm run cypress:run -- --spec "cypress/e2e/visual-testing/**"
    
- name: Upload Screenshots
  uses: actions/upload-artifact@v2
  with:
    name: cypress-screenshots
    path: cypress/screenshots
```

## 📋 Best Practices

### Design Testing Strategy
1. **Start with key pages** - Homepage, main user flows
2. **Test critical components** - Forms, navigation, buttons
3. **Cover different states** - Empty, filled, error, hover
4. **Include responsive breakpoints** - Mobile, tablet, desktop
5. **Test across browsers** - Chrome, Firefox, Safari, Edge

### Maintenance
1. **Update baselines** when designs change
2. **Review differences** before accepting changes
3. **Keep Figma exports** updated with latest designs
4. **Document visual requirements** and acceptance criteria

### Performance
1. **Limit screenshot size** - Focus on relevant areas
2. **Use appropriate resolution** - 1x for speed, 2x for accuracy
3. **Batch similar tests** - Group by page or component
4. **Optimize CI runtime** - Run visual tests in parallel

## 🔗 Integration with MCP Figma Tool

You can also use the existing MCP Figma integration:

```typescript
// Using MCP Figma tool in tests
cy.task('getFigmaDesign', {
  nodeId: '1504:999641',
  clientFrameworks: 'react',
  clientLanguages: 'typescript'
}).then((figmaCode) => {
  // Compare generated code with current implementation
});
```

## 📞 Support and Resources

### Documentation
- [Cypress Visual Testing](https://docs.cypress.io/guides/tooling/visual-testing)
- [Figma API](https://www.figma.com/developers/api)
- [Percy.io Docs](https://docs.percy.io/docs/cypress)
- [Applitools Docs](https://applitools.com/docs/api/eyes-sdk/eyes-cypress)

### Generated Assets
- **Screenshots**: `/cypress/screenshots/`
- **Videos**: `/cypress/videos/`
- **Test Results**: Console output and CI reports

Start with the current implementation to see how visual testing works, then choose a professional tool (Percy/Applitools) for production use!