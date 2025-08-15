# 📸 Screenshot Configuration Guide for QA Reports

**CRITICAL ISSUE RESOLUTION**: This guide addresses the "Screenshot not accessible" problem in HTML QA reports and provides comprehensive solutions for proper screenshot display.

## 🚨 Problem Analysis

The screenshot display issue occurs due to:
1. **Relative Path Problems**: HTML reports use relative paths that break when opened in browsers
2. **File Access Restrictions**: Browsers block file:// access to local images for security
3. **Dynamic Screenshot Paths**: Test runs generate timestamped directories that scripts can't predict
4. **Missing Screenshot Discovery**: Scripts use hardcoded paths instead of dynamic discovery

## ✅ Enhanced Screenshot Configuration

### 1. Update HTML Report Generation Scripts

#### Enhanced Screenshot Discovery Function
```javascript
// Enhanced screenshot discovery with absolute paths
function findTestScreenshots(testType, basePath) {
  const screenshotBasePath = path.join(__dirname, basePath);
  let screenshots = [];
  
  function recursiveSearch(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        recursiveSearch(fullPath);
      } else if (item.endsWith('.png') && 
                (fullPath.includes(testType) || 
                 fullPath.includes('undefined'))) {
        
        // Create absolute file:// URL for local access
        const absolutePath = `file://${fullPath}`;
        const relativePath = path.relative(reportDir, fullPath);
        
        screenshots.push({
          path: absolutePath,
          relativePath: relativePath,
          name: item,
          description: generateDescription(item, testType),
          timestamp: extractTimestamp(item),
          absoluteFilePath: fullPath
        });
      }
    });
  }
  
  recursiveSearch(screenshotBasePath);
  return screenshots;
}
```

#### Enhanced HTML Image Element with Fallbacks
```javascript
// HTML template with multiple fallback strategies
const imageHtml = `
<div class="screenshot">
    <img src="${screenshot.path}" 
         alt="${screenshot.description}" 
         loading="lazy" 
         onerror="this.src='${screenshot.relativePath}'; 
                  this.onerror=function(){
                    this.style.display='none'; 
                    this.nextElementSibling.innerHTML='Screenshot not accessible: ${screenshot.name}<br>Expected at: ${screenshot.absoluteFilePath}';
                  };">
    <div class="screenshot-caption">
        <strong>${screenshot.description}</strong><br>
        <small>File: ${screenshot.name}</small><br>
        <small>Timestamp: ${screenshot.timestamp}</small><br>
        <small style="color: #666;">Path: ${screenshot.absoluteFilePath}</small>
    </div>
</div>`;
```

### 2. Update Test Files for Better Screenshot Management

#### Enhanced Cypress Screenshot Configuration
```typescript
// cypress.config.ts - Enhanced screenshot configuration
export default defineConfig({
  e2e: {
    screenshotsFolder: 'cypress/screenshots',
    screenshotOnRunFailure: true,
    video: true,
    videoUploadOnPasses: false,
    setupNodeEvents(on, config) {
      // Enhanced screenshot naming
      on('after:screenshot', (details) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const newPath = details.path.replace('.png', `_${timestamp}.png`);
        
        console.log(`📸 Screenshot: ${details.name}`);
        console.log(`🔗 Path: ${newPath}`);
        console.log(`📊 Dimensions: ${details.width}x${details.height}`);
        
        return { path: newPath };
      });
    }
  }
});
```

#### Enhanced Playwright Screenshot Configuration
```typescript
// playwright.config.ts - Enhanced screenshot settings
export default definePlaywrightConfig({
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enhanced screenshot configuration
        launchOptions: {
          args: ['--disable-web-security', '--allow-file-access-from-files']
        }
      },
    }
  ],
  // Enhanced reporting
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ]
});
```

### 3. Enhanced Test File Screenshot Practices

#### Cypress Enhanced Screenshot Commands
```typescript
// Enhanced Cypress screenshot commands
Cypress.Commands.add('enhancedScreenshot', (name: string, options = {}) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const enhancedName = `${name}_${timestamp}`;
  
  cy.screenshot(enhancedName, {
    capture: 'fullPage',
    overwrite: true,
    ...options
  }).then(() => {
    cy.log(`📸 Screenshot captured: ${enhancedName}`);
    
    // Log screenshot metadata for report generation
    cy.task('logScreenshot', {
      name: enhancedName,
      timestamp,
      testSuite: Cypress.spec.name,
      url: window.location.href
    });
  });
});

// Usage in tests:
it('should capture mortgage step 1', () => {
  cy.visit('/services/calculate-mortgage/1');
  cy.enhancedScreenshot('mortgage-step1-loaded');
  
  // Fill form
  cy.get('[data-testid="property-value"]').type('1000000');
  cy.enhancedScreenshot('mortgage-step1-property-value-entered');
  
  // Continue to next step
  cy.get('[data-testid="continue-button"]').click();
  cy.enhancedScreenshot('mortgage-step1-completed');
});
```

#### Playwright Enhanced Screenshot Commands
```typescript
// Enhanced Playwright screenshot utilities
export class ScreenshotManager {
  constructor(private page: Page, private testName: string) {}
  
  async capture(name: string, options: ScreenshotOptions = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const enhancedName = `${this.testName}_${name}_${timestamp}`;
    const screenshotPath = `screenshots/${enhancedName}.png`;
    
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: true,
      ...options
    });
    
    // Log screenshot metadata
    console.log(`📸 Screenshot: ${enhancedName}`);
    console.log(`🔗 Path: ${path.resolve(screenshotPath)}`);
    console.log(`📊 URL: ${this.page.url()}`);
    
    return { path: screenshotPath, name: enhancedName, timestamp };
  }
}

// Usage in tests:
test('mortgage calculator flow', async ({ page }) => {
  const screenshots = new ScreenshotManager(page, 'mortgage-calculator');
  
  await page.goto('http://localhost:5173/services/calculate-mortgage/1');
  await screenshots.capture('step1-loaded');
  
  await page.fill('[data-testid="property-value"]', '1000000');
  await screenshots.capture('step1-property-value');
  
  await page.click('[data-testid="continue-button"]');
  await screenshots.capture('step1-completed');
});
```

### 4. Report Generation Script Template

#### Complete Enhanced Report Generator
```javascript
const fs = require('fs');
const path = require('path');

class EnhancedReportGenerator {
  constructor(testType, outputDir) {
    this.testType = testType;
    this.outputDir = outputDir;
    this.screenshotBasePath = path.join(__dirname, '../mainapp/cypress/screenshots');
  }
  
  findAllScreenshots() {
    const screenshots = [];
    
    const recursiveSearch = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      fs.readdirSync(dir).forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          recursiveSearch(fullPath);
        } else if (item.endsWith('.png')) {
          const absolutePath = `file://${fullPath}`;
          const relativePath = path.relative(this.outputDir, fullPath);
          
          screenshots.push({
            path: absolutePath,
            relativePath,
            name: item,
            description: this.generateDescription(item),
            timestamp: this.extractTimestamp(item),
            absoluteFilePath: fullPath,
            fileSize: stat.size,
            lastModified: stat.mtime
          });
        }
      });
    };
    
    recursiveSearch(this.screenshotBasePath);
    
    // Sort by timestamp (newest first)
    return screenshots.sort((a, b) => 
      new Date(b.lastModified) - new Date(a.lastModified)
    );
  }
  
  generateDescription(filename) {
    return filename
      .replace(/[-_]/g, ' ')
      .replace('.png', '')
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/g, '')
      .replace('undefined', 'Navigation Flow')
      .replace(this.testType, '')
      .trim();
  }
  
  extractTimestamp(filename) {
    const match = filename.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
    return match ? match[1] : 'unknown';
  }
  
  generateHTML(screenshots) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>QA Report - ${this.testType}</title>
        <style>
            .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; }
            .screenshot { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
            .screenshot img { width: 100%; height: auto; display: block; }
            .screenshot-caption { padding: 1rem; background: #f8f9fa; }
            .error-message { color: #dc3545; font-style: italic; }
        </style>
    </head>
    <body>
        <h1>QA Test Report: ${this.testType}</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Screenshots Found:</strong> ${screenshots.length}</p>
        
        <div class="screenshots">
            ${screenshots.map(screenshot => `
                <div class="screenshot">
                    <img src="${screenshot.path}" 
                         alt="${screenshot.description}"
                         onerror="this.src='${screenshot.relativePath}'; 
                                  this.onerror=function(){
                                    this.style.display='none'; 
                                    this.nextElementSibling.innerHTML='<div class=\\"error-message\\">Screenshot not accessible: ${screenshot.name}<br>Expected at: ${screenshot.absoluteFilePath}</div>';
                                  };">
                    <div class="screenshot-caption">
                        <strong>${screenshot.description}</strong><br>
                        <small>File: ${screenshot.name}</small><br>
                        <small>Size: ${(screenshot.fileSize / 1024).toFixed(1)} KB</small><br>
                        <small>Modified: ${screenshot.lastModified.toLocaleString()}</small><br>
                        <small style="color: #666; word-break: break-all;">Path: ${screenshot.absoluteFilePath}</small>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${screenshots.length === 0 ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 2rem; border-radius: 8px; margin: 2rem 0;">
                <h3>⚠️ No Screenshots Found</h3>
                <p>Expected location: <code>${this.screenshotBasePath}</code></p>
                <p>Run your Cypress or Playwright tests first to generate screenshots.</p>
            </div>
        ` : ''}
    </body>
    </html>`;
  }
  
  generate() {
    const screenshots = this.findAllScreenshots();
    const html = this.generateHTML(screenshots);
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportPath = path.join(this.outputDir, `${this.testType}_report_${timestamp}.html`);
    
    fs.writeFileSync(reportPath, html);
    
    console.log(`\n📊 QA Report Generated:`);
    console.log(`📂 Location: ${reportPath}`);
    console.log(`🌐 Open in browser: file://${reportPath}`);
    console.log(`📸 Screenshots: ${screenshots.length} found`);
    console.log(`🔗 Base path: ${this.screenshotBasePath}`);
    
    return reportPath;
  }
}

// Usage:
const generator = new EnhancedReportGenerator('refinance-mortgage', './reports');
generator.generate();
```

### 5. Browser Security Configuration

#### Chrome Flags for Local File Access
```bash
# Launch Chrome with flags to allow local file access
google-chrome \
  --disable-web-security \
  --allow-file-access-from-files \
  --user-data-dir=/tmp/chrome-dev \
  file:///path/to/your/report.html
```

#### Alternative: Serve Reports via HTTP Server
```javascript
// Simple HTTP server for serving reports
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// Serve static files (screenshots and reports)
app.use('/screenshots', express.static(path.join(__dirname, '../mainapp/cypress/screenshots')));
app.use('/reports', express.static(path.join(__dirname, '../server/docs/QA')));

app.listen(PORT, () => {
  console.log(`🌐 QA Report Server running at http://localhost:${PORT}`);
  console.log(`📸 Screenshots: http://localhost:${PORT}/screenshots`);
  console.log(`📊 Reports: http://localhost:${PORT}/reports`);
});
```

## 🚀 Implementation Checklist

### ✅ For Existing Projects:
1. **Update screenshot discovery scripts** to use dynamic search instead of hardcoded paths
2. **Implement absolute file:// URLs** with relative path fallbacks
3. **Add enhanced screenshot metadata** (timestamps, descriptions, file sizes)
4. **Configure browser security settings** or implement HTTP server for local serving
5. **Update test files** to use enhanced screenshot commands
6. **Test report generation** with actual screenshots from test runs

### ✅ For New Projects:
1. **Implement enhanced screenshot management** from the beginning
2. **Configure Cypress/Playwright** with proper screenshot settings
3. **Set up HTTP server** for serving reports and screenshots
4. **Create screenshot utilities** for consistent naming and metadata
5. **Document screenshot workflow** for team members

## 📋 Troubleshooting Guide

### Issue: "Screenshot not accessible"
**Solution**: Check file paths, implement fallback mechanisms, use HTTP server

### Issue: Screenshots not found by script
**Solution**: Implement dynamic discovery, check screenshot folder structure

### Issue: Browser blocks local file access
**Solution**: Use Chrome flags or implement HTTP server for local serving

### Issue: Relative paths broken in reports
**Solution**: Use absolute file:// URLs with relative fallbacks

## 🎯 Best Practices

1. **Always use absolute paths** in HTML reports
2. **Implement fallback mechanisms** for screenshot loading
3. **Include metadata** (timestamps, file sizes, descriptions) in captions
4. **Use dynamic discovery** instead of hardcoded paths
5. **Test report generation** after every test run
6. **Document screenshot conventions** for team consistency
7. **Implement HTTP server** for local development and review