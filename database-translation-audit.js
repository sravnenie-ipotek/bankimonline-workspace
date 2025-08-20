/**
 * 🎯 DATABASE TRANSLATION AUDIT SUITE
 * 
 * Comprehensive testing to identify missing database translations and raw values:
 * ✅ Tests all pages with PM2 server running (translation.json disabled)
 * ✅ Navigates through complete workflows (steps 1-4)  
 * ✅ Identifies raw untranslated values not coming from database
 * ✅ Checks content_items and content_translations tables
 * ✅ Maps missing values to specific pages and locations
 * ✅ Generates detailed report of database-first concept gaps
 * 
 * Focus: Database-first translation system validation
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

class DatabaseTranslationAudit {
  constructor() {
    this.baseUrl = 'http://localhost:5173';
    this.apiBaseUrl = 'http://localhost:8003/api';
    this.startTime = Date.now();
    this.results = {
      pages: [],
      workflows: [],
      rawValues: [],
      missingTranslations: [],
      databaseContent: {
        contentItems: [],
        contentTranslations: [],
        missingKeys: []
      },
      screenshots: [],
      summary: {
        totalPagesChecked: 0,
        pagesWithRawValues: 0,
        totalRawValues: 0,
        missingDatabaseEntries: 0,
        workflowsCompleted: 0
      }
    };
    this.reportDir = `database-audit-reports/${new Date().toISOString().replace(/[:.]/g, '-')}`;
    
    // Database connection - Use Railway database
    this.dbPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
      ssl: { rejectUnauthorized: false }
    });

    // Define all pages to audit
    this.pagesToAudit = [
      { path: '/', name: 'Home Page', hasForm: false },
      { path: '/services', name: 'Services Overview', hasForm: false },
      { path: '/services/calculate-mortgage/1', name: 'Mortgage Step 1', hasForm: true, step: 1 },
      { path: '/services/calculate-mortgage/2', name: 'Mortgage Step 2', hasForm: true, step: 2 },
      { path: '/services/calculate-mortgage/3', name: 'Mortgage Step 3', hasForm: true, step: 3 },
      { path: '/services/calculate-mortgage/4', name: 'Mortgage Step 4', hasForm: true, step: 4 },
      { path: '/services/calculate-credit/1', name: 'Credit Step 1', hasForm: true, step: 1 },
      { path: '/services/calculate-credit/2', name: 'Credit Step 2', hasForm: true, step: 2 },
      { path: '/services/calculate-credit/3', name: 'Credit Step 3', hasForm: true, step: 3 },
      { path: '/services/calculate-credit/4', name: 'Credit Step 4', hasForm: true, step: 4 },
      { path: '/personal-cabinet', name: 'Personal Cabinet', hasForm: false },
      { path: '/contacts', name: 'Contact Us', hasForm: false },
      { path: '/about', name: 'About Us', hasForm: false },
      { path: '/terms', name: 'Terms of Service', hasForm: false },
      { path: '/privacy', name: 'Privacy Policy', hasForm: false }
    ];

    // Complete workflows to test
    this.workflows = [
      {
        name: 'Mortgage Application Workflow',
        steps: [
          { path: '/services/calculate-mortgage/1', name: 'Step 1 - Property Details' },
          { path: '/services/calculate-mortgage/2', name: 'Step 2 - Personal Info' },
          { path: '/services/calculate-mortgage/3', name: 'Step 3 - Income Data' },
          { path: '/services/calculate-mortgage/4', name: 'Step 4 - Bank Offers' }
        ]
      },
      {
        name: 'Credit Application Workflow',
        steps: [
          { path: '/services/calculate-credit/1', name: 'Step 1 - Loan Details' },
          { path: '/services/calculate-credit/2', name: 'Step 2 - Personal Info' },
          { path: '/services/calculate-credit/3', name: 'Step 3 - Income Data' },
          { path: '/services/calculate-credit/4', name: 'Step 4 - Credit Offers' }
        ]
      }
    ];

    // Patterns to identify raw/untranslated values
    this.rawValuePatterns = [
      /\{\{[^}]+\}\}/g,                    // Translation keys like {{key}}
      /[a-z_]+\.[a-z_]+/g,                // Dot notation keys
      /t\('[^']+'\)/g,                    // i18next t() calls
      /\[object Object\]/g,               // Object serialization issues
      /undefined/g,                       // Undefined values
      /null/g,                           // Null values
      /\bkey\b/gi,                       // Literal "key" text
      /missing.*translation/gi,           // Missing translation messages
      /no.*translation/gi,                // No translation messages
      /untranslated/gi                    // Untranslated indicators
    ];

    // Expected database content keys
    this.expectedContentKeys = [
      'app.mortgage.step1.property_ownership',
      'app.mortgage.step1.city',
      'app.mortgage.step1.when_needed',
      'app.mortgage.step1.property_type',
      'app.mortgage.step2.education',
      'app.mortgage.step2.citizenship',
      'app.mortgage.step2.family_status',
      'app.mortgage.step3.income_source',
      'app.mortgage.step3.field_of_activity',
      'app.mortgage.step3.profession',
      'app.credit.step1.purpose_of_loan',
      'app.credit.step1.when_needed',
      'app.credit.step2.education',
      'app.credit.step2.citizenship',
      'app.credit.step2.family_status',
      'app.credit.step3.income_source',
      'app.credit.step3.field_of_activity',
      'app.credit.step3.profession',
      'validation.required_field',
      'validation.invalid_format',
      'common.buttons.continue',
      'common.buttons.back',
      'common.buttons.submit'
    ];
  }

  async initialize() {
    console.log('🎯 DATABASE TRANSLATION AUDIT STARTING...');
    console.log(`📍 Target URL: ${this.baseUrl} (PM2 Server)`);
    console.log(`🗄️ Database: Content-first translation validation`);
    console.log(`📊 Auditing ${this.pagesToAudit.length} pages + ${this.workflows.length} complete workflows`);
    console.log('='.repeat(80));
    
    // Create report directory
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
      fs.mkdirSync(`${this.reportDir}/screenshots`, { recursive: true });
    }

    // Test database connection
    try {
      await this.dbPool.query('SELECT 1');
      console.log('✅ Database connection established');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      throw error;
    }

    // Launch browser
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 200
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'he-IL'
    });

    this.page = await this.context.newPage();

    // Monitor console for translation issues
    this.page.on('console', msg => {
      const text = msg.text();
      if (text.includes('translation') || text.includes('i18n') || text.includes('missing')) {
        console.log(`🔍 Translation Console: ${text}`);
        this.results.rawValues.push({
          type: 'console',
          value: text,
          page: this.page.url(),
          timestamp: Date.now()
        });
      }
    });

    console.log('✅ Browser initialized for database audit\n');
  }

  async takeScreenshot(name, metadata = {}) {
    const timestamp = Date.now();
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(this.reportDir, 'screenshots', filename);
    
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });

    this.results.screenshots.push({
      name,
      filename,
      filepath,
      timestamp,
      metadata,
      url: this.page.url()
    });

    return filepath;
  }

  /**
   * Check database content tables
   */
  async checkDatabaseContent() {
    console.log('\n🗄️ CHECKING DATABASE CONTENT TABLES');
    console.log('='.repeat(50));
    
    try {
      // Check content_items table
      const itemsResult = await this.dbPool.query(`
        SELECT content_key, category, screen_location, is_active 
        FROM content_items 
        ORDER BY content_key
      `);
      
      this.results.databaseContent.contentItems = itemsResult.rows;
      console.log(`📋 Found ${itemsResult.rows.length} content items in database`);

      // Check content_translations table
      const translationsResult = await this.dbPool.query(`
        SELECT ci.content_key, ct.language_code, ct.translated_text
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        ORDER BY ci.content_key, ct.language_code
      `);
      
      this.results.databaseContent.contentTranslations = translationsResult.rows;
      console.log(`🌐 Found ${translationsResult.rows.length} content translations in database`);

      // Check for missing expected keys
      const existingKeys = new Set(itemsResult.rows.map(row => row.content_key));
      const missingKeys = this.expectedContentKeys.filter(key => !existingKeys.has(key));
      
      this.results.databaseContent.missingKeys = missingKeys;
      console.log(`⚠️ Missing ${missingKeys.length} expected content keys:`);
      missingKeys.forEach(key => console.log(`   - ${key}`));

      // Check for missing translations per language
      const languages = ['en', 'he', 'ru'];
      for (const lang of languages) {
        const langTranslations = translationsResult.rows.filter(row => row.language_code === lang);
        console.log(`   📝 ${lang.toUpperCase()}: ${langTranslations.length} translations`);
        
        const missingTranslationsForLang = itemsResult.rows.filter(item => 
          !langTranslations.some(trans => trans.content_key === item.content_key)
        );
        
        if (missingTranslationsForLang.length > 0) {
          console.log(`   ⚠️ Missing ${missingTranslationsForLang.length} translations for ${lang}`);
        }
      }

    } catch (error) {
      console.log(`❌ Database content check failed: ${error.message}`);
      this.results.databaseContent.error = error.message;
    }
  }

  /**
   * Scan page for raw values and missing translations
   */
  async scanPageForRawValues(pageInfo) {
    console.log(`🔍 Scanning: ${pageInfo.name} for raw values`);
    
    const pageResult = {
      page: pageInfo.name,
      path: pageInfo.path,
      rawValues: [],
      suspiciousElements: [],
      formElements: [],
      apiCalls: []
    };

    try {
      await this.page.goto(`${this.baseUrl}${pageInfo.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      await this.page.waitForTimeout(3000); // Let content load

      // Get all visible text content
      const textContent = await this.page.evaluate(() => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
          const text = node.textContent.trim();
          if (text && text.length > 0) {
            const element = node.parentElement;
            textNodes.push({
              text: text,
              tagName: element?.tagName || 'unknown',
              className: element?.className || '',
              id: element?.id || ''
            });
          }
        }
        
        return textNodes;
      });

      // Check each text node against raw value patterns
      textContent.forEach(node => {
        this.rawValuePatterns.forEach(pattern => {
          const matches = node.text.match(pattern);
          if (matches) {
            matches.forEach(match => {
              pageResult.rawValues.push({
                value: match,
                context: node.text,
                element: `<${node.tagName} class="${node.className}" id="${node.id}">`,
                pattern: pattern.toString()
              });
            });
          }
        });

        // Check for suspicious untranslated content
        if (node.text.includes('.') && /^[a-z_]+\.[a-z_]+/.test(node.text)) {
          pageResult.suspiciousElements.push({
            text: node.text,
            element: `<${node.tagName}>`
          });
        }
      });

      // Check form elements specifically
      if (pageInfo.hasForm) {
        const formElements = await this.page.evaluate(() => {
          const elements = [];
          
          // Labels
          document.querySelectorAll('label').forEach(label => {
            elements.push({
              type: 'label',
              text: label.textContent.trim(),
              for: label.getAttribute('for') || 'unknown'
            });
          });
          
          // Placeholders
          document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
            elements.push({
              type: 'placeholder',
              text: input.placeholder,
              name: input.name || 'unknown'
            });
          });
          
          // Button text
          document.querySelectorAll('button').forEach(button => {
            elements.push({
              type: 'button',
              text: button.textContent.trim(),
              id: button.id || 'unknown'
            });
          });
          
          // Select options
          document.querySelectorAll('option').forEach(option => {
            if (option.textContent.trim()) {
              elements.push({
                type: 'option',
                text: option.textContent.trim(),
                value: option.value
              });
            }
          });
          
          return elements;
        });
        
        pageResult.formElements = formElements;
        
        // Check form elements for raw values
        formElements.forEach(element => {
          this.rawValuePatterns.forEach(pattern => {
            const matches = element.text.match(pattern);
            if (matches) {
              matches.forEach(match => {
                pageResult.rawValues.push({
                  value: match,
                  context: element.text,
                  element: `${element.type}`,
                  pattern: pattern.toString()
                });
              });
            }
          });
        });
      }

      // Take screenshot
      await this.takeScreenshot(`page-scan-${pageInfo.path.replace(/\//g, '-')}`, {
        test: 'raw_value_scan',
        page: pageInfo.name,
        rawValuesFound: pageResult.rawValues.length
      });

      console.log(`  📊 Found ${pageResult.rawValues.length} raw values, ${pageResult.suspiciousElements.length} suspicious elements`);
      
      if (pageResult.rawValues.length > 0) {
        this.results.summary.pagesWithRawValues++;
        this.results.summary.totalRawValues += pageResult.rawValues.length;
        console.log(`  ⚠️ Raw values detected:`);
        pageResult.rawValues.slice(0, 3).forEach(rv => {
          console.log(`     - "${rv.value}" in ${rv.element}`);
        });
      }

    } catch (error) {
      console.log(`  ❌ Scan failed: ${error.message}`);
      pageResult.error = error.message;
    }
    
    this.results.pages.push(pageResult);
    this.results.summary.totalPagesChecked++;
    return pageResult;
  }

  /**
   * Test complete workflows step by step
   */
  async testCompleteWorkflows() {
    console.log('\n🔄 TESTING COMPLETE WORKFLOWS');
    console.log('='.repeat(50));
    
    for (const workflow of this.workflows) {
      console.log(`\n🚀 Testing: ${workflow.name}`);
      
      const workflowResult = {
        name: workflow.name,
        steps: [],
        totalRawValues: 0,
        completedSteps: 0,
        errors: []
      };
      
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        console.log(`  📍 ${step.name} (${step.path})`);
        
        const stepResult = {
          stepNumber: i + 1,
          stepName: step.name,
          path: step.path,
          rawValues: [],
          formData: {},
          errors: []
        };
        
        try {
          await this.page.goto(`${this.baseUrl}${step.path}`, { 
            waitUntil: 'networkidle',
            timeout: 30000 
          });
          
          await this.page.waitForTimeout(2000);
          
          // Scan this step for raw values
          const stepPageInfo = { name: step.name, path: step.path, hasForm: true };
          const scanResult = await this.scanPageForRawValues(stepPageInfo);
          stepResult.rawValues = scanResult.rawValues;
          stepResult.formData = scanResult.formElements;
          
          workflowResult.totalRawValues += scanResult.rawValues.length;
          
          // Try to fill basic form data if it's not step 4
          if (i < 3) {
            await this.fillBasicFormData(i + 1, workflow.name.includes('Mortgage'));
          }
          
          workflowResult.completedSteps++;
          console.log(`    ✅ Step ${i + 1} completed - ${scanResult.rawValues.length} raw values found`);
          
        } catch (error) {
          stepResult.errors.push(error.message);
          workflowResult.errors.push(`Step ${i + 1}: ${error.message}`);
          console.log(`    ❌ Step ${i + 1} failed: ${error.message}`);
        }
        
        workflowResult.steps.push(stepResult);
      }
      
      this.results.workflows.push(workflowResult);
      this.results.summary.workflowsCompleted++;
      
      console.log(`  📊 Workflow Summary: ${workflowResult.completedSteps}/${workflow.steps.length} steps, ${workflowResult.totalRawValues} total raw values`);
    }
  }

  /**
   * Fill basic form data for workflow progression
   */
  async fillBasicFormData(step, isMortgage) {
    try {
      switch (step) {
        case 1:
          // Property price or loan amount
          const amountInput = await this.page.$('input[name="PriceOfEstate"], input[name="LoanAmount"]');
          if (amountInput) {
            await amountInput.fill(isMortgage ? '1500000' : '200000');
          }
          break;
          
        case 2:
          // Personal info - try to fill name
          const nameInput = await this.page.$('input[name="nameSurname"], input[name="fullName"]');
          if (nameInput) {
            await nameInput.fill('יוסי כהן');
          }
          break;
          
        case 3:
          // Income - try to fill monthly income
          const incomeInput = await this.page.$('input[name="monthlyIncome"], input[name="income"]');
          if (incomeInput) {
            await incomeInput.fill('18000');
          }
          break;
      }
      
      await this.page.waitForTimeout(1000);
    } catch (error) {
      // Ignore form filling errors - focus is on scanning
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport() {
    console.log('\n📊 GENERATING DATABASE TRANSLATION AUDIT REPORT');
    console.log('='.repeat(60));
    
    const reportPath = path.join(this.reportDir, 'database-translation-audit-report.html');
    
    // Analyze results
    const totalRawValues = this.results.pages.reduce((sum, page) => sum + page.rawValues.length, 0);
    const pagesWithIssues = this.results.pages.filter(page => page.rawValues.length > 0);
    const workflowIssues = this.results.workflows.reduce((sum, wf) => sum + wf.totalRawValues, 0);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Translation Audit Report - ${new Date().toLocaleString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            font-size: 14px;
        }
        .container {
            max-width: 1600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.2em; margin-bottom: 10px; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            padding: 25px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card .number {
            font-size: 1.8em;
            font-weight: bold;
            color: #667eea;
        }
        .critical { color: #f44336 !important; }
        .warning { color: #ff9800 !important; }
        .success { color: #4caf50 !important; }
        
        .section {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        .section h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.4em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .issue-grid {
            display: grid;
            gap: 10px;
            margin-top: 15px;
        }
        .issue-item {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 12px;
            border-radius: 8px;
            font-size: 0.9em;
        }
        .issue-item.critical {
            background: #fef1f0;
            border-left-color: #f44336;
        }
        .issue-item.success {
            background: #f1f8f4;
            border-left-color: #4caf50;
        }
        
        .raw-value {
            font-family: 'Courier New', monospace;
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.85em;
            margin: 2px 0;
            display: inline-block;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 0.85em;
        }
        th, td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        
        .expand-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8em;
            margin-bottom: 10px;
        }
        .collapsible { display: none; }
        .collapsible.show { display: block; }
        
        .recommendation {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .recommendation h4 {
            color: #1976d2;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Database Translation Audit Report</h1>
            <div class="subtitle">PM2 Server Environment - Database-First Translation Validation</div>
            <div class="subtitle">${new Date().toLocaleString()}</div>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <div class="number">${this.results.summary.totalPagesChecked}</div>
                <div class="label">Pages Audited</div>
            </div>
            <div class="summary-card">
                <div class="number ${pagesWithIssues.length > 0 ? 'critical' : 'success'}">${pagesWithIssues.length}</div>
                <div class="label">Pages with Issues</div>
            </div>
            <div class="summary-card">
                <div class="number ${totalRawValues > 0 ? 'critical' : 'success'}">${totalRawValues}</div>
                <div class="label">Raw Values Found</div>
            </div>
            <div class="summary-card">
                <div class="number ${this.results.databaseContent.missingKeys.length > 0 ? 'warning' : 'success'}">${this.results.databaseContent.missingKeys.length}</div>
                <div class="label">Missing DB Keys</div>
            </div>
            <div class="summary-card">
                <div class="number">${this.results.summary.workflowsCompleted}</div>
                <div class="label">Workflows Tested</div>
            </div>
            <div class="summary-card">
                <div class="number">${this.results.databaseContent.contentItems.length}</div>
                <div class="label">DB Content Items</div>
            </div>
        </div>
        
        <div class="section">
            <h2>🚨 Critical Issues Found</h2>
            ${pagesWithIssues.length === 0 ? 
              '<div class="issue-item success">✅ No critical issues found! All pages appear to be using database translations properly.</div>' :
              `<div class="issue-grid">
                ${pagesWithIssues.map(page => `
                  <div class="issue-item critical">
                    <strong>📄 ${page.page}</strong> (${page.path})
                    <br>🔍 ${page.rawValues.length} raw values detected:
                    <div style="margin-top: 8px;">
                      ${page.rawValues.slice(0, 3).map(rv => `<div class="raw-value">"${rv.value}" in ${rv.element}</div>`).join('')}
                      ${page.rawValues.length > 3 ? `<div style="color: #666; font-size: 0.8em; margin-top: 4px;">...and ${page.rawValues.length - 3} more</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>`
            }
        </div>
        
        <div class="section">
            <h2>🗄️ Database Content Analysis</h2>
            <div class="issue-grid">
                <div class="issue-item ${this.results.databaseContent.contentItems.length > 0 ? 'success' : 'critical'}">
                    <strong>📋 Content Items in Database</strong>
                    <br>${this.results.databaseContent.contentItems.length} items found
                    ${this.results.databaseContent.contentItems.length === 0 ? '<br>⚠️ No content items found in database!' : ''}
                </div>
                <div class="issue-item ${this.results.databaseContent.contentTranslations.length > 0 ? 'success' : 'critical'}">
                    <strong>🌐 Content Translations</strong>
                    <br>${this.results.databaseContent.contentTranslations.length} translations found
                </div>
                <div class="issue-item ${this.results.databaseContent.missingKeys.length === 0 ? 'success' : 'warning'}">
                    <strong>⚠️ Missing Expected Keys</strong>
                    <br>${this.results.databaseContent.missingKeys.length} keys missing from database
                    ${this.results.databaseContent.missingKeys.length > 0 ? 
                      `<div style="margin-top: 8px; font-size: 0.85em;">
                        ${this.results.databaseContent.missingKeys.slice(0, 5).map(key => `<div class="raw-value">${key}</div>`).join('')}
                        ${this.results.databaseContent.missingKeys.length > 5 ? `<div style="color: #666;">...and ${this.results.databaseContent.missingKeys.length - 5} more</div>` : ''}
                      </div>` : ''
                    }
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🔄 Workflow Analysis</h2>
            <button class="expand-btn" onclick="toggleSection('workflows')">Show/Hide Details</button>
            <div id="workflows" class="collapsible">
                ${this.results.workflows.map(workflow => `
                    <div class="issue-item ${workflow.totalRawValues === 0 ? 'success' : 'warning'}">
                        <strong>🚀 ${workflow.name}</strong>
                        <br>📊 Steps completed: ${workflow.completedSteps}/${workflow.steps.length}
                        <br>🔍 Total raw values: ${workflow.totalRawValues}
                        <div style="margin-top: 8px;">
                            ${workflow.steps.map((step, idx) => `
                                <div style="margin: 4px 0; font-size: 0.85em;">
                                    ${step.errors.length === 0 ? '✅' : '❌'} Step ${step.stepNumber}: ${step.stepName} 
                                    ${step.rawValues.length > 0 ? `(${step.rawValues.length} raw values)` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ${workflow.errors.length > 0 ? 
                          `<div style="color: red; margin-top: 8px; font-size: 0.85em;">
                            Errors: ${workflow.errors.join(', ')}
                          </div>` : ''
                        }
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>📋 Detailed Page Analysis</h2>
            <button class="expand-btn" onclick="toggleSection('pages')">Show/Hide Details</button>
            <div id="pages" class="collapsible">
                <table>
                    <thead>
                        <tr>
                            <th>Page</th>
                            <th>Path</th>
                            <th>Raw Values</th>
                            <th>Suspicious Elements</th>
                            <th>Form Elements</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.results.pages.map(page => `
                            <tr>
                                <td><strong>${page.page}</strong></td>
                                <td><code>${page.path}</code></td>
                                <td>${page.rawValues.length}</td>
                                <td>${page.suspiciousElements.length}</td>
                                <td>${page.formElements.length}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="section">
            <h2>💡 Recommendations</h2>
            <div class="recommendation">
                <h4>Immediate Actions Required:</h4>
                <ul>
                    ${pagesWithIssues.length > 0 ? '<li>🔴 <strong>Fix raw values:</strong> Replace untranslated strings with database content keys</li>' : ''}
                    ${this.results.databaseContent.missingKeys.length > 0 ? '<li>🟠 <strong>Add missing database keys:</strong> Populate content_items and content_translations tables</li>' : ''}
                    ${this.results.databaseContent.contentItems.length === 0 ? '<li>🔴 <strong>Database setup:</strong> Initialize content management system</li>' : ''}
                </ul>
            </div>
            
            <div class="recommendation">
                <h4>Database-First Migration Status:</h4>
                <ul>
                    <li>✅ <strong>Database Schema:</strong> ${this.results.databaseContent.contentItems.length > 0 ? 'Active' : 'Needs Setup'}</li>
                    <li>${this.results.databaseContent.contentTranslations.length > 50 ? '✅' : '🟠'} <strong>Translation Coverage:</strong> ${this.results.databaseContent.contentTranslations.length} translations</li>
                    <li>${totalRawValues === 0 ? '✅' : '❌'} <strong>Frontend Integration:</strong> ${totalRawValues === 0 ? 'Complete' : `${totalRawValues} issues remaining`}</li>
                </ul>
            </div>
            
            <div class="recommendation">
                <h4>Next Steps for Database-First Implementation:</h4>
                <ol>
                    <li>Populate missing content keys in database</li>
                    <li>Update React components to use database API instead of translation.json</li>
                    <li>Implement content management API endpoints</li>
                    <li>Add fallback mechanisms for missing translations</li>
                    <li>Test with PM2 environment to ensure JSON independence</li>
                </ol>
            </div>
        </div>
        
        <div class="section">
            <h2>📸 Screenshots Evidence</h2>
            <p>Total screenshots captured: ${this.results.screenshots.length}</p>
            <p>All visual evidence available in: <code>${this.reportDir}/screenshots/</code></p>
        </div>
    </div>
    
    <script>
        function toggleSection(sectionId) {
            const section = document.getElementById(sectionId);
            section.classList.toggle('show');
        }
        
        // Auto-expand sections with issues
        document.addEventListener('DOMContentLoaded', function() {
            if (${pagesWithIssues.length} > 0 || ${this.results.databaseContent.missingKeys.length} > 0) {
                // Auto expand if there are critical issues
            }
        });
    </script>
</body>
</html>
    `;
    
    fs.writeFileSync(reportPath, html);
    console.log(`\n✅ Comprehensive report generated: ${reportPath}`);
    return reportPath;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    if (this.page) await this.page.close();
    if (this.context) await this.context.close(); 
    if (this.browser) await this.browser.close();
    if (this.dbPool) await this.dbPool.end();
  }

  /**
   * Main execution
   */
  async runDatabaseTranslationAudit() {
    try {
      await this.initialize();
      
      // Check database content first
      await this.checkDatabaseContent();
      
      // Scan all pages for raw values
      console.log('\n🔍 SCANNING ALL PAGES FOR RAW VALUES');
      console.log('='.repeat(50));
      for (const pageInfo of this.pagesToAudit) {
        await this.scanPageForRawValues(pageInfo);
      }
      
      // Test complete workflows
      await this.testCompleteWorkflows();
      
      // Generate comprehensive report
      const reportPath = await this.generateComprehensiveReport();
      
      // Print final summary
      console.log('\n' + '='.repeat(80));
      console.log('🎯 DATABASE TRANSLATION AUDIT COMPLETE');
      console.log('='.repeat(80));
      console.log(`\n📊 FINAL RESULTS:`);
      console.log(`   Pages Audited: ${this.results.summary.totalPagesChecked}`);
      console.log(`   Pages with Raw Values: ${this.results.summary.pagesWithRawValues}`);
      console.log(`   Total Raw Values Found: ${this.results.summary.totalRawValues}`);
      console.log(`   Workflows Completed: ${this.results.summary.workflowsCompleted}`);
      console.log(`   Database Content Items: ${this.results.databaseContent.contentItems.length}`);
      console.log(`   Missing Database Keys: ${this.results.databaseContent.missingKeys.length}`);
      console.log(`   Screenshots Captured: ${this.results.screenshots.length}`);
      console.log(`\n📄 Full report: ${reportPath}`);
      
      if (this.results.summary.totalRawValues > 0) {
        console.log(`\n🚨 CRITICAL: ${this.results.summary.totalRawValues} raw values detected!`);
        console.log('   These indicate incomplete database-first migration.');
        console.log('   Review the detailed report for specific locations and fixes.');
      } else {
        console.log(`\n✅ SUCCESS: No raw values detected!`);
        console.log('   Database-first translation system appears to be working properly.');
      }
      
      console.log('\n' + '='.repeat(80));
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Database translation audit failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Export for use
module.exports = DatabaseTranslationAudit;

// Run if called directly
if (require.main === module) {
  console.log('Starting Database Translation Audit...\n');
  const auditor = new DatabaseTranslationAudit();
  auditor.runDatabaseTranslationAudit()
    .then(results => {
      console.log('\n✅ Database translation audit completed!');
      process.exit(results.summary.totalRawValues > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('\n❌ Audit failed:', error);
      process.exit(1);
    });
}