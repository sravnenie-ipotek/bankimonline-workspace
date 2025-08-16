## Bulletproof HTML QA Report Generation Instructions

### **AUTOMATED QA REPORT WITH BUG TRACKING INTEGRATION & PRODUCTION SAFETY**

---

## **🚨 PRODUCTION TESTING SAFETY PROTOCOL**

### **Environment Variables Configuration**
```javascript
// Environment detection and configuration
const QA_CONFIG = {
  // Environment Detection
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
  environment: process.env.TEST_ENVIRONMENT || 'development',
  
  // Production Safety Flags
  createRealBugs: process.env.CREATE_REAL_BUGS === 'true',
  isProduction: function() {
    return this.baseUrl.includes('bankimonline.com') || 
           this.baseUrl.includes('dev2.bankimonline.com') ||
           this.environment === 'production';
  },
  
  // Safety Configuration
  safetyMode: {
    enabled: true,
    preventBugCreation: true,     // Disable for prod
    showWarnings: true,           // Bold PROD warnings
    mockJiraResponses: true       // Simulate bug creation
  }
};

// Environment Detection Function
function detectEnvironment(url) {
  if (url.includes('bankimonline.com') || url.includes('dev2.bankimonline.com')) {
    return {
      name: 'PRODUCTION',
      isProd: true,
      warningLevel: 'CRITICAL',
      bgColor: '#dc2626',
      textColor: 'white',
      allowBugCreation: false
    };
  }
  
  return {
    name: 'DEVELOPMENT',
    isProd: false,
    warningLevel: 'SAFE',
    bgColor: '#10b981',
    textColor: 'white',
    allowBugCreation: true
  };
}
```

### **Production Safety Implementation**
```bash
# Environment Variables Setup
export PLAYWRIGHT_BASE_URL="https://dev2.bankimonline.com"
export TEST_ENVIRONMENT="production"
export CREATE_REAL_BUGS="false"
export SAFETY_MODE="enabled"

# Run production tests safely
npm run test:prod-safe
```

---

## **1. HTML REPORT STRUCTURE & REQUIREMENTS**

### **1.1 Core Report Architecture**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Automation Report - [Date] - [Test Suite Name]</title>
    
    <!-- Report must be self-contained with embedded styles -->
    <style>
        /* Modern, professional UI/UX design */
        :root {
            --primary: #2563eb;
            --danger: #dc2626;
            --warning: #f59e0b;
            --success: #10b981;
            --dark: #1f2937;
            --light: #f9fafb;
            --shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <!-- Report structure defined below -->
</body>
</html>
```

### **1.2 Report Generation Requirements**

```javascript
const reportGenerator = {
  // MANDATORY FEATURES
  features: {
    selfContained: true,              // Single HTML file with everything embedded
    responsive: true,                 // Works on all devices
    interactive: true,                // Clickable elements, filters, sorting
    bilingual: true,                  // English + Russian
    exportable: true,                 // Can save as PDF/Print
    realTime: true,                   // Updates during test execution
    searchable: true,                 // Search bugs, filter by priority
    analytics: true                   // Charts and statistics
  },
  
  // DATA TO CAPTURE
  dataRequirements: {
    testExecutionData: {
      timestamp: 'ISO 8601 format',
      duration: 'milliseconds',
      environment: 'dev/staging/prod',
      browser: 'name + version',
      viewport: 'dimensions',
      testRunner: 'cypress/playwright/etc'
    },
    
    bugData: {
      id: 'unique identifier',
      title: 'descriptive title',
      severity: 'CRITICAL/HIGH/MEDIUM/LOW',
      priority: 'P0/P1/P2/P3',
      blocking: 'boolean',
      component: 'affected component',
      stepsToReproduce: 'array of steps',
      actualResult: 'what happened',
      expectedResult: 'what should happen',
      screenshots: 'array of base64 images',
      video: 'optional recording',
      stackTrace: 'if applicable',
      affectedEndpoints: 'array of URLs',
      browserConsole: 'errors/warnings',
      networkLogs: 'failed requests'
    }
  }
};
```

---

## **2. UI/UX DESIGN SPECIFICATIONS**

### **2.1 Visual Design Requirements**

```css
/* Professional Enterprise-Level Design System */
.report-container {
    /* Clean, modern design */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem;
}

.report-header {
    /* Glassmorphism effect */
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.bug-card {
    /* Modern card design */
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    transition: all 0.3s ease;
    border-left: 4px solid var(--danger);
}

.bug-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.create-bug-button {
    /* Prominent CTA button */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.create-bug-button:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

/* Production Bug Button Warning */
.create-bug-button.prod-warning {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
    animation: pulse-warning 2s infinite;
}

.create-bug-button.prod-warning:hover {
    box-shadow: 0 10px 20px rgba(220, 38, 38, 0.6);
}

.create-bug-button.prod-warning::before {
    content: "⚠️ PROD BUG";
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: #dc2626;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
    animation: blink 1s infinite;
}

@keyframes pulse-warning {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

/* Environment Banner Styles */
.environment-banner {
    padding: 12px 20px;
    margin: 15px 0;
    border-radius: 8px;
    font-weight: bold;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.environment-banner.production {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
    border: 2px solid #991b1b;
    animation: production-warning 2s infinite;
}

.environment-banner.production::before {
    content: "🚨 PRODUCTION ENVIRONMENT 🚨";
    display: block;
    font-size: 18px;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.environment-banner.development {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: 2px solid #047857;
}

.environment-banner.development::before {
    content: "🛠️ DEVELOPMENT ENVIRONMENT";
    display: block;
    font-size: 16px;
    margin-bottom: 5px;
}

@keyframes production-warning {
    0%, 100% { 
        box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
        transform: scale(1);
    }
    50% { 
        box-shadow: 0 0 30px rgba(220, 38, 38, 0.8);
        transform: scale(1.02);
    }
}
```

### **2.2 Report Layout Structure**

```html
<!-- Executive Summary Dashboard -->
<section class="executive-summary">
    <div class="metrics-grid">
        <div class="metric-card">
            <h3>Total Tests</h3>
            <div class="metric-value">247</div>
            <div class="metric-change">+12% vs last run</div>
        </div>
        <div class="metric-card danger">
            <h3>Failed Tests</h3>
            <div class="metric-value">8</div>
            <div class="metric-badge">3 CRITICAL</div>
        </div>
        <div class="metric-card success">
            <h3>Pass Rate</h3>
            <div class="metric-value">96.8%</div>
            <div class="metric-chart"><!-- Mini sparkline --></div>
        </div>
        <div class="metric-card warning">
            <h3>Blocked Processes</h3>
            <div class="metric-value">2</div>
            <div class="metric-list">Registration, Payment</div>
        </div>
    </div>
</section>

<!-- Interactive Bug List -->
<section class="bug-list">
    <div class="filters-toolbar">
        <input type="search" placeholder="Search bugs..." />
        <select class="filter-priority">
            <option>All Priorities</option>
            <option>P0 - Critical</option>
            <option>P1 - High</option>
            <option>P2 - Medium</option>
            <option>P3 - Low</option>
        </select>
        <button class="filter-blocking">Show Blocking Only</button>
        <button class="export-bugs">Export to JIRA</button>
    </div>
    
    <!-- Bug cards render here -->
</section>
```

---

## **3. BUG CARD TEMPLATE WITH ONE-CLICK CREATION**

### **3.1 Complete Bug Card Structure**

```html
<div class="bug-card" data-bug-id="BUG-001" data-severity="CRITICAL" data-blocking="true">
    <!-- Bug Header -->
    <div class="bug-header">
        <div class="bug-title-section">
            <span class="bug-id">#BUG-001</span>
            <h3 class="bug-title">
                <span class="en">Payment form submission fails on Step 4</span>
                <span class="ru">Форма оплаты не отправляется на шаге 4</span>
            </h3>
        </div>
        <div class="bug-badges">
            <span class="badge severity-critical">CRITICAL</span>
            <span class="badge priority-p0">P0</span>
            <span class="badge blocking">BLOCKS PROCESS</span>
        </div>
    </div>
    
    <!-- Bug Location & Environment -->
    <div class="bug-meta">
        <div class="meta-item">
            <strong>Location:</strong> 
            <a href="http://localhost:5173/services/calculate-mortgage/4" target="_blank">
                /services/calculate-mortgage/4
            </a>
        </div>
        <div class="meta-item">
            <strong>Component:</strong> PaymentForm.jsx
        </div>
        <div class="meta-item">
            <strong>Browser:</strong> Chrome 120.0.6099.129
        </div>
        <div class="meta-item">
            <strong>Timestamp:</strong> 2024-01-15 14:32:45
        </div>
    </div>
    
    <!-- Steps to Reproduce -->
    <div class="bug-reproduction">
        <h4>
            <span class="en">Steps to Reproduce:</span>
            <span class="ru">Шаги для воспроизведения:</span>
        </h4>
        <ol class="steps-list">
            <li>
                <span class="en">Navigate to mortgage calculator</span>
                <span class="ru">Перейти к ипотечному калькулятору</span>
            </li>
            <li>
                <span class="en">Fill in loan amount: $250,000</span>
                <span class="ru">Ввести сумму кредита: $250,000</span>
            </li>
            <li>
                <span class="en">Complete personal information form</span>
                <span class="ru">Заполнить форму личных данных</span>
            </li>
            <li>
                <span class="en">Click "Submit Payment" button</span>
                <span class="ru">Нажать кнопку "Отправить платеж"</span>
            </li>
        </ol>
    </div>
    
    <!-- Expected vs Actual -->
    <div class="bug-comparison">
        <div class="comparison-column">
            <h4 class="expected">
                <span class="en">Expected Result:</span>
                <span class="ru">Ожидаемый результат:</span>
            </h4>
            <p>Payment processes successfully, user sees confirmation</p>
        </div>
        <div class="comparison-column">
            <h4 class="actual">
                <span class="en">Actual Result:</span>
                <span class="ru">Фактический результат:</span>
            </h4>
            <p>Form freezes, console shows: "TypeError: Cannot read property 'submit' of null"</p>
        </div>
    </div>
    
    <!-- Screenshots Gallery -->
    <div class="bug-screenshots">
        <h4>
            <span class="en">Screenshots:</span>
            <span class="ru">Скриншоты:</span>
        </h4>
        <div class="screenshot-gallery">
            <img src="data:image/png;base64,..." class="screenshot-thumb" onclick="enlargeImage(this)" />
            <img src="data:image/png;base64,..." class="screenshot-thumb" onclick="enlargeImage(this)" />
            <img src="data:image/png;base64,..." class="screenshot-thumb" onclick="enlargeImage(this)" />
        </div>
    </div>
    
    <!-- Technical Details for Architects -->
    <div class="architect-section">
        <h4>
            <span class="en">Architecture Impact Analysis:</span>
            <span class="ru">Анализ влияния на архитектуру:</span>
        </h4>
        <div class="architect-details">
            <div class="detail-item">
                <strong>Affected Services:</strong>
                <code>PaymentService, ValidationService, UserDataService</code>
            </div>
            <div class="detail-item">
                <strong>API Endpoints:</strong>
                <code>POST /api/payment/submit, GET /api/user/validate</code>
            </div>
            <div class="detail-item">
                <strong>Database Impact:</strong>
                <span class="impact-high">Transaction rollback required</span>
            </div>
            <div class="detail-item">
                <strong>Performance Impact:</strong>
                <span>Memory leak detected: +15MB per submission attempt</span>
            </div>
            <div class="detail-item">
                <strong>Security Implications:</strong>
                <span class="security-warning">PCI compliance affected</span>
            </div>
            <div class="detail-item">
                <strong>Stack Trace:</strong>
                <pre class="stack-trace">
TypeError: Cannot read property 'submit' of null
    at PaymentForm.handleSubmit (PaymentForm.jsx:145:12)
    at HTMLFormElement.onSubmit (PaymentForm.jsx:42:8)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:3994:16)
                </pre>
            </div>
            <div class="detail-item">
                <strong>Recommended Fix:</strong>
                <code>Add null check before form.submit() call in PaymentForm.jsx line 145</code>
            </div>
        </div>
    </div>
    
    <!-- Console & Network Logs -->
    <details class="technical-logs">
        <summary>Console Errors (3)</summary>
        <pre class="console-log">
[ERROR] TypeError: Cannot read property 'submit' of null
[ERROR] Failed to load resource: 404 /api/payment/validate
[WARNING] Form validation failed: missing required fields
        </pre>
    </details>
    
    <details class="network-logs">
        <summary>Failed Network Requests (2)</summary>
        <pre class="network-log">
POST /api/payment/submit - 500 Internal Server Error
GET /api/user/session - 401 Unauthorized
        </pre>
    </details>
    
    <!-- Action Buttons with Production Safety -->
    <div class="bug-actions">
        <button class="create-bug-button" id="create-bug-BUG-001" onclick="createBugTicket('BUG-001')">
            <svg class="icon"><!-- JIRA icon --></svg>
            <span class="en">Create JIRA Ticket</span>
            <span class="ru">Создать задачу в JIRA</span>
        </button>
        <button class="copy-button" onclick="copyBugDetails('BUG-001')">
            <span class="en">Copy Details</span>
            <span class="ru">Копировать детали</span>
        </button>
        <button class="share-button" onclick="shareBug('BUG-001')">
            <span class="en">Share</span>
            <span class="ru">Поделиться</span>
        </button>
    </div>
    
    <!-- Production Warning Modal Template -->
    <div id="prod-warning-modal" class="modal prod-warning-modal" style="display: none;">
        <div class="modal-content prod-warning-content">
            <div class="prod-warning-header">
                <h2>🚨 PRODUCTION ENVIRONMENT WARNING 🚨</h2>
            </div>
            <div class="prod-warning-body">
                <p class="warning-text">
                    <strong>⚠️ YOU ARE TESTING ON PRODUCTION ENVIRONMENT!</strong>
                </p>
                <p class="warning-details">
                    This bug was detected on <strong>LIVE PRODUCTION</strong> environment:<br>
                    <code>https://dev2.bankimonline.com</code>
                </p>
                <p class="safety-notice">
                    <strong>🛡️ SAFETY MODE ENABLED:</strong><br>
                    • No real JIRA ticket will be created<br>
                    • Bug details will be saved locally only<br>
                    • Production environment will not be affected
                </p>
                <div class="modal-actions">
                    <button class="btn-danger" onclick="confirmProdBugReport()">
                        <strong>UNDERSTAND - LOG PROD BUG</strong>
                    </button>
                    <button class="btn-secondary" onclick="closeProdWarning()">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## **4. JAVASCRIPT FUNCTIONALITY**

### **4.1 Bug Creation Function**

```javascript
// Production-safe bug creation with environment detection
async function createBugTicket(bugId) {
    const bugData = collectBugData(bugId);
    const environment = detectEnvironment(window.location.href);
    
    // Store current bug for modal actions
    window.currentBugId = bugId;
    
    // Check if this is production environment
    if (environment.isProd) {
        showProductionWarning(bugData, environment);
        return;
    }
    
    // Safe to create real JIRA ticket in development
    await createRealJiraTicket(bugData, bugId);
}

// Show production warning modal
function showProductionWarning(bugData, environment) {
    const modal = document.getElementById('prod-warning-modal');
    const button = document.getElementById(`create-bug-${window.currentBugId}`);
    
    // Add production warning class to button
    button.classList.add('prod-warning');
    
    // Update modal content with bug-specific details
    const warningDetails = modal.querySelector('.warning-details');
    warningDetails.innerHTML = `
        This bug was detected on <strong>LIVE PRODUCTION</strong> environment:<br>
        <code>${environment.name}: ${bugData.url}</code><br>
        <strong>Bug:</strong> ${bugData.title}
    `;
    
    modal.style.display = 'flex';
}

// Confirm production bug report (safe mode)
function confirmProdBugReport() {
    const bugId = window.currentBugId;
    const bugData = collectBugData(bugId);
    
    // Save to local storage instead of creating real ticket
    saveProdBugLocally(bugData, bugId);
    
    // Show success message
    showSuccessModal(
        'Production Bug Logged Safely', 
        `Bug ${bugId} saved locally. No real JIRA ticket created for production safety.`,
        'production-safe'
    );
    
    // Mark as reported in UI
    markBugAsReported(bugId, `PROD-${Date.now()}`);
    
    closeProdWarning();
}

// Close production warning modal
function closeProdWarning() {
    document.getElementById('prod-warning-modal').style.display = 'none';
    
    // Remove warning class from button
    if (window.currentBugId) {
        const button = document.getElementById(`create-bug-${window.currentBugId}`);
        button.classList.remove('prod-warning');
    }
}

// Save production bug locally (safe mode)
function saveProdBugLocally(bugData, bugId) {
    const prodBugs = JSON.parse(localStorage.getItem('productionBugs') || '[]');
    
    const prodBug = {
        ...bugData,
        id: bugId,
        environment: 'PRODUCTION',
        savedAt: new Date().toISOString(),
        isProdBug: true,
        safetyMode: true
    };
    
    prodBugs.push(prodBug);
    localStorage.setItem('productionBugs', JSON.stringify(prodBugs));
    
    console.log('🛡️ PRODUCTION BUG SAVED SAFELY:', prodBug);
}

// Create real JIRA ticket (development only)
async function createRealJiraTicket(bugData, bugId) {
    const jiraPayload = {
        fields: {
            project: { key: 'MBTS' },
            summary: `[DEV] ${bugData.title}`,
            description: formatDescription(bugData),
            issuetype: { name: 'Bug' },
            priority: { name: bugData.priority },
            labels: ['automation', 'qa', 'development', bugData.component],
            customfield_10001: bugData.stepsToReproduce, // Steps to reproduce
            customfield_10002: bugData.actualResult,      // Actual result
            customfield_10003: bugData.expectedResult,    // Expected result
            customfield_10004: bugData.blocking,          // Blocks process
            components: [{ name: bugData.component }],
            attachment: bugData.screenshots               // Screenshots
        }
    };
    
    // Show loading state
    showLoadingModal('Creating JIRA ticket...');
    
    try {
        const response = await fetch('/api/jira/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jiraPayload)
        });
        
        const result = await response.json();
        showSuccessModal(`Development Ticket Created: ${result.key}`, result.url);
        
        // Update UI to show ticket was created
        markBugAsReported(bugId, result.key);
        
    } catch (error) {
        showErrorModal('Failed to create ticket', error.message);
    }
}

// Collect all bug data from the HTML
function collectBugData(bugId) {
    const bugCard = document.querySelector(`[data-bug-id="${bugId}"]`);
    
    return {
        id: bugId,
        title: bugCard.querySelector('.bug-title').textContent,
        severity: bugCard.dataset.severity,
        priority: determinePriority(bugCard.dataset.severity),
        blocking: bugCard.dataset.blocking === 'true',
        component: bugCard.querySelector('.meta-item:nth-child(2)').textContent,
        url: bugCard.querySelector('.meta-item a').href,
        browser: bugCard.querySelector('.meta-item:nth-child(3)').textContent,
        timestamp: bugCard.querySelector('.meta-item:nth-child(4)').textContent,
        stepsToReproduce: Array.from(bugCard.querySelectorAll('.steps-list li'))
            .map(li => li.textContent),
        expectedResult: bugCard.querySelector('.expected + p').textContent,
        actualResult: bugCard.querySelector('.actual + p').textContent,
        screenshots: Array.from(bugCard.querySelectorAll('.screenshot-thumb'))
            .map(img => img.src),
        stackTrace: bugCard.querySelector('.stack-trace')?.textContent,
        consoleErrors: bugCard.querySelector('.console-log')?.textContent,
        networkErrors: bugCard.querySelector('.network-log')?.textContent,
        architectureImpact: collectArchitectureData(bugCard)
    };
}

// Format description for JIRA with production safety
function formatDescription(bugData) {
    const environment = detectEnvironment(bugData.url || window.location.href);
    const prodWarning = environment.isProd ? `
h1. 🚨 PRODUCTION ENVIRONMENT BUG 🚨
*THIS BUG WAS DETECTED ON LIVE PRODUCTION ENVIRONMENT*
*URL: ${bugData.url}*
*IMMEDIATE ATTENTION REQUIRED*

` : '';

    return `${prodWarning}
h3. Description
${environment.isProd ? '🚨 [PROD BUG] ' : '[DEV] '}${bugData.title}

h3. Environment Details
* Environment: *${environment.name}*
* URL: ${bugData.url}
* Browser: ${bugData.browser}
* Timestamp: ${bugData.timestamp}
* Component: ${bugData.component}
* Production Impact: ${environment.isProd ? 'HIGH - AFFECTS LIVE USERS' : 'LOW - Development Only'}

h3. Steps to Reproduce
${bugData.stepsToReproduce.map((step, i) => `${i + 1}. ${step}`).join('\n')}

h3. Expected Result
${bugData.expectedResult}

h3. Actual Result  
${bugData.actualResult}

h3. Technical Details
{code}
${bugData.stackTrace || 'No stack trace available'}
{code}

h3. Console Errors
{code}
${bugData.consoleErrors || 'No console errors'}
{code}

h3. Architecture Impact
${bugData.architectureImpact}

h3. Priority Justification
${environment.isProd ? '🚨 CRITICAL PRODUCTION BUG - IMMEDIATE FIX REQUIRED' : ''}
${bugData.blocking ? '⚠️ BLOCKING: This bug prevents users from completing the process' : 'Non-blocking issue'}

h3. Safety Information
${environment.isProd ? 
  '⚠️ This bug was detected during production testing. Real user impact possible.' : 
  '✅ This bug was detected during development testing. No user impact.'}
    `;
}
```

---

## **5. REPORT GENERATION TEMPLATE**

### **5.1 Complete HTML Report Generator**

```javascript
class QAReportGenerator {
    constructor(testResults) {
        this.results = testResults;
        this.bugs = this.extractBugs();
        this.metrics = this.calculateMetrics();
    }
    
    generateHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Report - ${new Date().toISOString()}</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header with Production Warning -->
        <header class="report-header">
            <div class="header-content">
                <h1>QA Automation Report</h1>
                
                <!-- Production Environment Warning -->
                <div class="environment-banner" id="environment-banner">
                    <!-- Dynamically populated based on environment -->
                </div>
                
                <div class="header-meta">
                    <span>Generated: ${new Date().toLocaleString()}</span>
                    <span>Duration: ${this.metrics.duration}ms</span>
                    <span>Environment: ${this.results.environment}</span>
                    <span>Base URL: ${this.results.baseUrl}</span>
                </div>
            </div>
            <div class="language-toggle">
                <button onclick="setLanguage('en')" class="active">EN</button>
                <button onclick="setLanguage('ru')">RU</button>
            </div>
        </header>
        
        <!-- Executive Summary -->
        ${this.generateExecutiveSummary()}
        
        <!-- Filters -->
        ${this.generateFilters()}
        
        <!-- Bug List -->
        <section class="bugs-section">
            <h2>
                <span class="en">Detected Issues</span>
                <span class="ru">Обнаруженные проблемы</span>
            </h2>
            <div class="bugs-container">
                ${this.bugs.map(bug => this.generateBugCard(bug)).join('')}
            </div>
        </section>
        
        <!-- Charts -->
        ${this.generateCharts()}
        
        <!-- Footer -->
        <footer class="report-footer">
            <button onclick="window.print()" class="print-button">Print Report</button>
            <button onclick="exportPDF()" class="export-button">Export PDF</button>
            <button onclick="sendEmail()" class="email-button">Email Report</button>
        </footer>
    </div>
    
    <!-- Lightbox for screenshots -->
    <div id="lightbox" class="lightbox" onclick="closeLightbox()">
        <img id="lightbox-img" src="" />
    </div>
    
    <!-- Success/Error Modals -->
    <div id="modal" class="modal"></div>
    
    <script>
        ${this.getScripts()}
    </script>
</body>
</html>
        `;
    }
    
    getStyles() {
        return `
            /* Complete CSS styling here */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            
            .report-container {
                max-width: 1400px;
                margin: 0 auto;
            }
            
            /* ... (all other styles from above) ... */
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .metrics-grid { grid-template-columns: 1fr; }
                .bug-card { padding: 1rem; }
            }
            
            /* Production Warning Modal Styles */
            .prod-warning-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            
            .prod-warning-content {
                background: white;
                border-radius: 12px;
                padding: 0;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(220, 38, 38, 0.3);
                border: 3px solid #dc2626;
                animation: shake 0.5s ease-in-out;
            }
            
            .prod-warning-header {
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 9px 9px 0 0;
            }
            
            .prod-warning-header h2 {
                margin: 0;
                font-size: 24px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .prod-warning-body {
                padding: 30px;
            }
            
            .warning-text {
                font-size: 18px;
                color: #dc2626;
                text-align: center;
                margin-bottom: 20px;
                padding: 15px;
                background: #fef2f2;
                border: 2px solid #fecaca;
                border-radius: 8px;
            }
            
            .warning-details {
                margin-bottom: 20px;
                padding: 15px;
                background: #fffbeb;
                border: 1px solid #fed7aa;
                border-radius: 6px;
            }
            
            .warning-details code {
                background: #dc2626;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: bold;
            }
            
            .safety-notice {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 25px;
            }
            
            .modal-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .btn-danger {
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
            }
            
            .btn-danger:hover {
                transform: scale(1.05);
                box-shadow: 0 10px 20px rgba(220, 38, 38, 0.4);
            }
            
            .btn-secondary {
                background: #6b7280;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-secondary:hover {
                background: #4b5563;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            /* Print Styles */
            @media print {
                body { background: white; }
                .no-print { display: none; }
                .prod-warning-modal { display: none !important; }
            }
        `;
    }
    
    getScripts() {
        return `
            // Language toggle
            function setLanguage(lang) {
                document.body.className = lang;
                localStorage.setItem('report-language', lang);
            }
            
            // Image lightbox
            function enlargeImage(img) {
                document.getElementById('lightbox-img').src = img.src;
                document.getElementById('lightbox').style.display = 'flex';
            }
            
            function closeLightbox() {
                document.getElementById('lightbox').style.display = 'none';
            }
            
            // Bug creation
            ${createBugTicket.toString()}
            ${collectBugData.toString()}
            ${formatDescription.toString()}
            
            // Filtering
            function filterBugs(criteria) {
                const bugs = document.querySelectorAll('.bug-card');
                bugs.forEach(bug => {
                    const show = evaluateCriteria(bug, criteria);
                    bug.style.display = show ? 'block' : 'none';
                });
            }
            
            // Export functions
            function exportPDF() {
                window.print();
            }
            
            // Initialize with environment detection
            document.addEventListener('DOMContentLoaded', () => {
                const savedLang = localStorage.getItem('report-language') || 'en';
                setLanguage(savedLang);
                
                // Setup environment banner
                setupEnvironmentBanner();
                
                // Setup production warning styles for bug buttons
                setupProductionButtonStyles();
            });
            
            // Setup environment banner
            function setupEnvironmentBanner() {
                const banner = document.getElementById('environment-banner');
                const environment = detectEnvironment(window.location.href);
                
                banner.className = \`environment-banner \${environment.isProd ? 'production' : 'development'}\`;
                
                if (environment.isProd) {
                    banner.innerHTML = \`
                        <div class="env-text">
                            <span class="en">TESTING ON LIVE PRODUCTION ENVIRONMENT</span>
                            <span class="ru">ТЕСТИРОВАНИЕ В РАБОЧЕЙ СРЕДЕ</span>
                        </div>
                        <div class="env-warning">
                            <span class="en">🛡️ Safety Mode: No real bugs will be created in JIRA</span>
                            <span class="ru">🛡️ Безопасный режим: Реальные баги не будут созданы в JIRA</span>
                        </div>
                    \`;
                } else {
                    banner.innerHTML = \`
                        <div class="env-text">
                            <span class="en">Development Environment - Safe for Testing</span>
                            <span class="ru">Среда разработки - Безопасно для тестирования</span>
                        </div>
                    \`;
                }
            }
            
            // Setup production warning styles for all bug buttons
            function setupProductionButtonStyles() {
                const environment = detectEnvironment(window.location.href);
                
                if (environment.isProd) {
                    // Add production warning class to all bug creation buttons
                    const bugButtons = document.querySelectorAll('.create-bug-button');
                    bugButtons.forEach(button => {
                        button.classList.add('prod-warning');
                        
                        // Update button text to show it's production
                        const enText = button.querySelector('.en');
                        const ruText = button.querySelector('.ru');
                        
                        if (enText) {
                            enText.innerHTML = '<strong>⚠️ LOG PROD BUG</strong>';
                        }
                        if (ruText) {
                            ruText.innerHTML = '<strong>⚠️ ЗАПИСАТЬ ПРОД БАГ</strong>';
                        }
                    });
                }
            }
        `;
    }
}
```

---

## **6. AUTOMATION TOOL INTEGRATION**

### **6.1 Report Generation Command**

```javascript
// In your automation tool (Cypress/Playwright/etc)
const generateReport = async (testResults) => {
    const generator = new QAReportGenerator(testResults);
    const htmlContent = generator.generateHTML();
    
    // Save report
    const fileName = `qa-report-${Date.now()}.html`;
    fs.writeFileSync(`./reports/${fileName}`, htmlContent);
    
    // Open in browser
    if (process.env.OPEN_REPORT === 'true') {
        open(`./reports/${fileName}`);
    }
    
    // Send notifications if critical bugs
    if (generator.hasCriticalBugs()) {
        await notifyTeam(generator.metrics);
    }
    
    return fileName;
};
```

### **6.2 Integration with Test Runners**

```javascript
// Cypress Integration
afterEach(function() {
    if (this.currentTest.state === 'failed') {
        const bug = {
            title: this.currentTest.title,
            error: this.currentTest.err.message,
            screenshot: cy.screenshot(),
            component: this.currentTest.parent.title,
            timestamp: new Date().toISOString()
        };
        
        reportGenerator.addBug(bug);
    }
});

after(() => {
    reportGenerator.generateHTML();
});
```

---

## **7. PRIORITY & BLOCKING LOGIC**

### **7.1 Automatic Priority Assignment**

```javascript
function determinePriority(bug) {
    // P0 - Critical blocking issues
    if (bug.blocking && bug.severity === 'CRITICAL') {
        return {
            level: 'P0',
            color: '#dc2626',
            action: 'IMMEDIATE_FIX_REQUIRED',
            escalation: 'CTO/VP_ENGINEERING'
        };
    }
    
    // P1 - High priority
    if (bug.blocking || bug.severity === 'HIGH') {
        return {
            level: 'P1',
            color: '#f59e0b',
            action: 'FIX_BEFORE_RELEASE',
            escalation: 'TEAM_LEAD'
        };
    }
    
    // P2 - Medium priority
    if (bug.severity === 'MEDIUM') {
        return {
            level: 'P2',
            color: '#3b82f6',
            action: 'FIX_IN_NEXT_SPRINT',
            escalation: 'DEVELOPER'
        };
    }
    
    // P3 - Low priority
    return {
        level: 'P3',
        color: '#10b981',
        action: 'BACKLOG',
        escalation: 'NONE'
    };
}
```

---

## **8. FINAL EXECUTION COMMAND**

```bash
# Run tests and generate report
npm run test:e2e -- \
  --reporter=qa-html-reporter \
  --reporter-options \
    generateReport=true \
    includeScreenshots=true \
    includeLogs=true \
    createBugButtons=true \
    bilingual=true \
    architectureDetails=true \
    openAfterGeneration=true \
    outputPath=./reports/qa-report.html
```

---

## **CRITICAL REQUIREMENTS CHECKLIST:**

- ✅ Self-contained HTML file with embedded everything
- ✅ One-click bug creation with ALL details
- ✅ Screenshots embedded as base64
- ✅ Russian + English translations
- ✅ Priority based on blocking status
- ✅ Architecture impact details for architects
- ✅ Beautiful UI/UX with modern design
- ✅ Steps to reproduce clearly listed
- ✅ Console and network logs included
- ✅ Responsive and printable
- ✅ Search and filter functionality
- ✅ JIRA integration ready
- ✅ Automatic priority assignment
- ✅ Complete technical details

**This report gives QA, developers, and architects everything they need to understand and fix bugs instantly!**

---

## **🚨 PRODUCTION TESTING IMPLEMENTATION GUIDE**

### **Environment Setup for Production Testing**

#### **1. Environment Variables Configuration**
```bash
# Create .env file for production testing
cat > .env << EOF
# Production Testing Configuration
PLAYWRIGHT_BASE_URL=https://dev2.bankimonline.com
TEST_ENVIRONMENT=production
CREATE_REAL_BUGS=false
SAFETY_MODE=enabled

# Jira Configuration (Safe Mode)
JIRA_CREATE_REAL_ISSUES=false
JIRA_MOCK_RESPONSES=true
EOF
```

#### **2. Package.json Scripts Update**
```json
{
  "scripts": {
    "test:prod-safe": "cross-env PLAYWRIGHT_BASE_URL=https://dev2.bankimonline.com TEST_ENVIRONMENT=production CREATE_REAL_BUGS=false playwright test",
    "test:dev": "cross-env PLAYWRIGHT_BASE_URL=http://localhost:5173 TEST_ENVIRONMENT=development CREATE_REAL_BUGS=true playwright test",
    "test:generate-report": "npm run test:prod-safe && npm run report:generate"
  }
}
```

#### **3. Playwright Config Update**
```javascript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Environment-based configuration
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    // Production safety timeouts
    actionTimeout: process.env.TEST_ENVIRONMENT === 'production' ? 5000 : 30000,
    navigationTimeout: process.env.TEST_ENVIRONMENT === 'production' ? 10000 : 60000,
    
    // Screenshots for production bugs
    screenshot: process.env.TEST_ENVIRONMENT === 'production' ? 'only-on-failure' : 'off',
    video: process.env.TEST_ENVIRONMENT === 'production' ? 'retain-on-failure' : 'off',
  },
  
  // Test configuration based on environment
  projects: [
    {
      name: 'production-safe',
      use: {
        ...devices['Desktop Chrome'],
        // Production-specific settings
        extraHTTPHeaders: {
          'X-Test-Environment': 'production-safe'
        }
      },
      testMatch: /.*\.(spec|test)\.ts/,
    }
  ]
});
```

### **Production Safety Features**

#### **Visual Indicators**
- 🚨 **Header Banner**: Red animated banner showing "PRODUCTION ENVIRONMENT"
- ⚠️ **Bug Buttons**: Red pulsing buttons with "LOG PROD BUG" text
- 🛡️ **Safety Notice**: Clear indication that no real bugs will be created

#### **Safety Mechanisms**
- **Automatic Detection**: URL-based environment detection
- **Disabled Bug Creation**: No real JIRA tickets created for production
- **Local Storage**: Production bugs saved locally for review
- **Mock Responses**: Simulated JIRA responses for testing

#### **Production Bug Flow**
1. **Bug Detected** → Red warning button appears
2. **Click Button** → Production warning modal opens
3. **Confirm Action** → Bug saved locally (not in JIRA)
4. **Success Message** → Confirmation of safe logging

### **Usage Commands**

#### **Run Production Tests Safely**
```bash
# Set environment and run tests
export PLAYWRIGHT_BASE_URL="https://dev2.bankimonline.com"
export TEST_ENVIRONMENT="production"
export CREATE_REAL_BUGS="false"

# Run all QA tests on production
npm run test:prod-safe

# Generate production-safe report
npm run test:generate-report
```

#### **Compare Environments**
```bash
# Test on development
npm run test:dev

# Test on production (safe mode)
npm run test:prod-safe

# Compare results
diff reports/dev-report.html reports/prod-report.html
```

### **Production Testing Checklist**

#### **Before Running Production Tests**
- ✅ Verify PLAYWRIGHT_BASE_URL points to production
- ✅ Confirm CREATE_REAL_BUGS=false
- ✅ Check SAFETY_MODE=enabled
- ✅ Ensure no destructive tests are included
- ✅ Backup any critical data if needed

#### **During Production Testing**
- ✅ Monitor for real user impact
- ✅ Keep tests read-only when possible
- ✅ Document any production-specific behaviors
- ✅ Save screenshots of production bugs
- ✅ Note performance differences vs development

#### **After Production Testing**
- ✅ Review locally saved production bugs
- ✅ Create real JIRA tickets manually if needed
- ✅ Share production report with team
- ✅ Update test suite based on production findings
- ✅ Document production-specific test adjustments

### **Emergency Procedures**

#### **If Production Impact Detected**
```bash
# Immediately stop all tests
pkill -f playwright
pkill -f node

# Check for any running automation
ps aux | grep -E "(playwright|cypress|selenium)"

# Document the impact
echo "Production impact detected at $(date)" >> production-incident.log
```

#### **Recovery Steps**
1. **Stop All Testing** - Kill all automation processes
2. **Assess Damage** - Check what data/state was modified
3. **Notify Team** - Alert relevant stakeholders immediately
4. **Document Issue** - Create incident report
5. **Fix Problems** - Rollback or fix any issues caused
6. **Update Safety** - Enhance safety mechanisms

### **Best Practices for Production Testing**

#### **DO's**
- ✅ Always use environment variables for configuration
- ✅ Start with read-only tests only
- ✅ Test during low-traffic periods
- ✅ Have rollback plans ready
- ✅ Monitor real user metrics during testing
- ✅ Use production-like test data

#### **DON'Ts**
- ❌ Never create real bugs without approval
- ❌ Don't modify production data
- ❌ Avoid testing payment/financial flows
- ❌ Don't run tests during peak hours
- ❌ Never bypass safety mechanisms
- ❌ Don't test destructive operations

**🛡️ REMEMBER: Production testing requires extreme caution. When in doubt, test on staging first!**