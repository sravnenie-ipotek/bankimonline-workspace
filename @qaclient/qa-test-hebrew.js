const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const report = [];
const screenshotDir = '@qaclient/screenshots';

async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

async function addReportEntry(entry) {
  const timestamp = new Date().toISOString();
  report.push({ ...entry, timestamp });
}

async function testResponsive(page, testName) {
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 1366, height: 768, name: 'laptop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile-iphone' },
    { width: 360, height: 640, name: 'mobile-android' }
  ];
  
  const issues = [];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    
    // Check for overflow issues
    const overflowElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const overflowing = [];
      
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.width > window.innerWidth || rect.right > window.innerWidth) {
          overflowing.push({
            tag: el.tagName,
            class: el.className,
            text: el.textContent?.substring(0, 50)
          });
        }
      }
      
      return overflowing;
    });
    
    if (overflowElements.length > 0) {
      issues.push({
        viewport: viewport.name,
        issue: 'Horizontal overflow detected',
        elements: overflowElements
      });
    }
    
    // Check for text truncation
    const truncatedText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const truncated = [];
      
      for (const el of elements) {
        if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
          if (el.textContent && el.textContent.trim().length > 0) {
            truncated.push({
              tag: el.tagName,
              class: el.className,
              text: el.textContent?.substring(0, 50)
            });
          }
        }
      }
      
      return truncated;
    });
    
    if (truncatedText.length > 0) {
      issues.push({
        viewport: viewport.name,
        issue: 'Text truncation detected',
        elements: truncatedText
      });
    }
  }
  
  return issues;
}

async function checkUntranslatedStrings(page) {
  const untranslated = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const issues = [];
    
    const englishPattern = /^[A-Za-z\s\d\.\,\!\?\-\(\)]+$/;
    const translationKeyPattern = /^[a-z]+(\.[a-z]+)*$/;
    
    for (const el of elements) {
      const text = el.textContent?.trim();
      if (text && text.length > 2 && el.children.length === 0) {
        // Check for English text (excluding numbers and common punctuation)
        if (englishPattern.test(text) && !/^\d+$/.test(text)) {
          issues.push({
            element: el.tagName + (el.className ? '.' + el.className : ''),
            text: text,
            type: 'english-text'
          });
        }
        
        // Check for translation keys
        if (translationKeyPattern.test(text)) {
          issues.push({
            element: el.tagName + (el.className ? '.' + el.className : ''),
            text: text,
            type: 'translation-key'
          });
        }
      }
    }
    
    return issues;
  });
  
  return untranslated;
}

async function runTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    locale: 'he-IL',
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Test Homepage
    console.log('Testing Homepage...');
    
    // Check for untranslated strings
    const untranslatedHome = await checkUntranslatedStrings(page);
    if (untranslatedHome.length > 0) {
      const snapshot = await takeScreenshot(page, 'homepage-untranslated');
      await addReportEntry({
        page: '/',
        element: 'Full page scan',
        action: 'i18n-check',
        result: 'untranslated-found',
        untranslated: untranslatedHome,
        snapshot
      });
    }
    
    // Test responsive design
    const responsiveIssuesHome = await testResponsive(page, 'homepage');
    if (responsiveIssuesHome.length > 0) {
      const snapshot = await takeScreenshot(page, 'homepage-responsive');
      await addReportEntry({
        page: '/',
        element: 'Full page',
        action: 'responsive-check',
        result: 'issues-found',
        responsiveIssue: responsiveIssuesHome,
        snapshot
      });
    }
    
    // Click on all visible buttons and links
    const buttons = await page.$$('button:visible, a:visible');
    for (let i = 0; i < buttons.length; i++) {
      const buttonText = await buttons[i].textContent();
      const buttonClass = await buttons[i].getAttribute('class');
      
      try {
        await buttons[i].click({ timeout: 5000 });
        await page.waitForTimeout(1000);
        
        // Check for errors
        const errors = await page.$$('.error, .alert-danger, [role="alert"]');
        if (errors.length > 0) {
          const snapshot = await takeScreenshot(page, `button-error-${i}`);
          await addReportEntry({
            page: page.url(),
            element: `Button: ${buttonText || buttonClass}`,
            action: 'click',
            result: 'error',
            errorDetails: 'Error message appeared after click',
            snapshot
          });
        }
        
        // Go back if navigated away
        if (page.url() !== 'http://localhost:5173/') {
          await page.goBack({ waitUntil: 'networkidle' });
        }
      } catch (error) {
        console.log(`Error clicking button ${i}: ${error.message}`);
      }
      
      // Re-get buttons array as DOM may have changed
      buttons = await page.$$('button:visible, a:visible');
    }
    
    // Test all form inputs
    const inputs = await page.$$('input:visible, textarea:visible, select:visible');
    for (let i = 0; i < inputs.length; i++) {
      const inputType = await inputs[i].getAttribute('type');
      const inputName = await inputs[i].getAttribute('name');
      const inputPlaceholder = await inputs[i].getAttribute('placeholder');
      
      try {
        if (inputType === 'text' || inputType === 'email' || inputType === 'tel') {
          await inputs[i].fill('בדיקה טסט');
          await addReportEntry({
            page: page.url(),
            element: `Input: ${inputName || inputPlaceholder}`,
            action: 'type',
            value: 'בדיקה טסט',
            result: 'success'
          });
        }
        
        if (inputType === 'number') {
          await inputs[i].fill('12345');
          await addReportEntry({
            page: page.url(),
            element: `Input: ${inputName || inputPlaceholder}`,
            action: 'type',
            value: '12345',
            result: 'success'
          });
        }
      } catch (error) {
        const snapshot = await takeScreenshot(page, `input-error-${i}`);
        await addReportEntry({
          page: page.url(),
          element: `Input: ${inputName || inputPlaceholder}`,
          action: 'type',
          result: 'error',
          errorDetails: error.message,
          snapshot
        });
      }
    }
    
    // Navigate to different pages
    const routes = ['/mortgage', '/credit', '/about', '/contact'];
    for (const route of routes) {
      try {
        await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' });
        console.log(`Testing ${route}...`);
        
        // Check untranslated strings
        const untranslated = await checkUntranslatedStrings(page);
        if (untranslated.length > 0) {
          const snapshot = await takeScreenshot(page, `${route.slice(1)}-untranslated`);
          await addReportEntry({
            page: route,
            element: 'Full page scan',
            action: 'i18n-check',
            result: 'untranslated-found',
            untranslated,
            snapshot
          });
        }
        
        // Test responsive
        const responsiveIssues = await testResponsive(page, route);
        if (responsiveIssues.length > 0) {
          const snapshot = await takeScreenshot(page, `${route.slice(1)}-responsive`);
          await addReportEntry({
            page: route,
            element: 'Full page',
            action: 'responsive-check',
            result: 'issues-found',
            responsiveIssue: responsiveIssues,
            snapshot
          });
        }
      } catch (error) {
        console.log(`Error navigating to ${route}: ${error.message}`);
      }
    }
    
    // Generate summary
    const summary = {
      totalErrors: report.filter(r => r.result === 'error').length,
      responsiveIssues: report.filter(r => r.responsiveIssue).length,
      untranslatedValues: report.filter(r => r.untranslated).length,
      criticalBugs: report.filter(r => r.errorDetails).length,
      recommendations: [
        'Fix all untranslated strings to Hebrew',
        'Address responsive design issues on mobile devices',
        'Review and fix form validation errors',
        'Ensure all interactive elements are accessible'
      ]
    };
    
    // Save report
    const fullReport = {
      testDate: new Date().toISOString(),
      summary,
      details: report
    };
    
    await fs.writeFile(
      '@qaclient/ui-qa-report.json',
      JSON.stringify(fullReport, null, 2)
    );
    
    console.log('QA Test completed. Report saved to @qaclient/ui-qa-report.json');
    console.log(`Total issues found: ${summary.totalErrors + summary.responsiveIssues + summary.untranslatedValues}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);