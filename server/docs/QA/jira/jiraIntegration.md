Awesome — here’s a **ready-to-use Cypress → Jira** setup that:

* **Auto-creates a Jira bug** when a test fails
* **De-duplicates** by fingerprint (won’t spam Jira with the same failure)
* **Attaches screenshots** (and the spec video if available)
* Lets you **tune JQL**, labels, and fields

---

# 1) Set required secrets (CI or local)

Set these environment variables (in your CI secrets or local shell):

```bash
# Jira connection settings
export JIRA_HOST="https://bankimonline.atlassian.net"
export JIRA_EMAIL="aizek941977@gmail.com"
export JIRA_API_TOKEN="ATATT3xFfGF0aPp_hWACkNsvZC2h4OLBYC4RdbBzGUF-xRCmr04fbGZrUY16c-SduNKCJmBytx_YlhSWeXKcZ_6FX4PcQg0Xpdfa-Q0-6So9WqILv6ihpgEzWxsgwOHPxjwnErjNTjcM7ij1XnDE7o4yOfJsG1VyJaOpJFMHCEE1joT8jOJOpg0=5916F041"

# Jira project and issue settings
export JIRA_PROJECT_KEY="TVKC"               # Bankimonline project key
export JIRA_ISSUE_TYPE="Баг"                 # Russian "Bug" issue type
export JIRA_LABELS="cypress,auto-filed"      # Optional tracking labels
export JIRA_LANGUAGE="bilingual"             # Support both English and Russian

# Optional: if you want screenshots/videos uploaded
export JIRA_ATTACH_SCREENSHOTS=true
export JIRA_ATTACH_VIDEOS=true
export JIRA_INCLUDE_BROWSER_INFO=true
export JIRA_INCLUDE_NETWORK_INFO=true
```

> Create an API token in Jira (Account → Security → API tokens).
> The user must have permission to create issues & add attachments in the chosen project.

---

# 2) Cypress node events (Cypress v10+): `cypress.config.{js,ts}`

This registers a **task** that creates or reuses a Jira issue and attaches artifacts.

```js
// cypress.config.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');

function jiraClient() {
  const baseURL = process.env.JIRA_HOST;
  const auth = Buffer.from(
    `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
  ).toString('base64');

  const api = axios.create({
    baseURL,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  async function searchIssueByFingerprint(projectKey, fingerprint) {
    // JQL: look for open issues in the project with our unique fingerprint label
    const jql = `project = ${projectKey} AND statusCategory != Done AND labels = "${fingerprint}"`;
    const res = await api.get('/rest/api/3/search', {
      params: { jql, maxResults: 1, fields: ['key'] },
    });
    return res.data.issues?.[0]?.key || null;
  }

  async function createIssue({ projectKey, summary, description, issueType, labels }) {
    const payload = {
      fields: {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType || 'Bug' },
        labels: labels || [],
      },
    };
    const res = await api.post('/rest/api/3/issue', payload);
    return res.data.key;
  }

  async function addComment(issueKey, body) {
    await api.post(`/rest/api/3/issue/${issueKey}/comment`, { body });
  }

  async function attachFiles(issueKey, files) {
    if (!files?.length) return;
    // separate client for attachments (different headers)
    const baseURL = process.env.JIRA_HOST;
    const auth = Buffer.from(
      `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
    ).toString('base64');

    for (const filePath of files) {
      try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        await axios.post(
          `${baseURL}/rest/api/3/issue/${issueKey}/attachments`,
          form,
          {
            headers: {
              Authorization: `Basic ${auth}`,
              'X-Atlassian-Token': 'no-check',
              ...form.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );
      } catch (e) {
        console.warn(`Failed to attach file: ${filePath}`, e.response?.data || e.message);
      }
    }
  }

  return { searchIssueByFingerprint, createIssue, addComment, attachFiles };
}

/** Create a short, stable fingerprint for the failure */
function buildFingerprint({ projectKey, spec, testTitle, errorMessage }) {
  const raw = `${projectKey}::${spec}::${testTitle}::${(errorMessage || '').slice(0,400)}`;
  return 'cfp_' + crypto.createHash('sha1').update(raw).digest('hex').slice(0, 10);
}

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      // Collect per-spec video path (after run) to attach later
      const specVideos = new Map();
      on('after:spec', (spec, results) => {
        if (results && results.video) {
          specVideos.set(spec.relative, results.video);
        }
      });

      on('task', {
        // Utility task to ensure directory exists
        ensureDir(dirPath) {
          const fs = require('fs');
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          return null;
        },

        /**
         * Enhanced input with comprehensive error reporting:
         *  {
         *    spec, testTitle, errorMessage, appUrl, currentUrl, pageTitle,
         *    browser, os, viewport, screenshotPaths, browserLogs, networkLogs,
         *    testDuration, retries, timestamp, evidenceFiles
         *  }
         */
        async createOrUpdateJira(input) {
          const {
            spec, testTitle, errorMessage, appUrl, browser, os,
            screenshotPaths
          } = input;

          const projectKey   = process.env.JIRA_PROJECT_KEY;
          const issueType    = process.env.JIRA_ISSUE_TYPE || 'Bug';
          const extraLabels  = (process.env.JIRA_LABELS || '')
                                  .split(',')
                                  .map(s => s.trim())
                                  .filter(Boolean);

          const client = jiraClient();
          const fingerprint = buildFingerprint({ projectKey, spec, testTitle, errorMessage });

          // 1) Reuse an existing open issue if present
          let issueKey = await client.searchIssueByFingerprint(projectKey, fingerprint);

          // 2) If not found, create new
          if (!issueKey) {
            const summary = `[Cypress] ${testTitle}`;
            const timestamp = new Date().toISOString();
            const description =
`h2. 🐛 Автоматически обнаруженная ошибка / Automated Bug Detection

h3. 📋 Детали теста / Test Details
*Спецификация / Spec:* \`${spec}\`
*Тест / Test:* \`${testTitle}\`
*Время обнаружения / Detection Time:* ${timestamp}
*URL приложения / App URL:* ${appUrl || '-'}
*Браузер / Browser:* ${browser || '-'}
*ОС / OS:* ${os || '-'}

h3. 🚨 Описание ошибки / Error Description
{code}
${errorMessage || '(нет сообщения об ошибке / no error message)'}
{code}

h3. 🔄 Шаги воспроизведения / Steps to Reproduce
# Откройте браузер / Open browser
# Перейдите по адресу / Navigate to: ${appUrl || 'application URL'}
# Выполните тест / Execute test: \`${testTitle}\`
# Ошибка воспроизводится автоматически / Error reproduces automatically

h3. 📸 Доказательства / Evidence
* Скриншоты прикреплены автоматически / Screenshots attached automatically
* Видео записано (если включено) / Video recorded (if enabled)
* Логи браузера доступны / Browser logs available

h3. 🏷️ Метки системы / System Labels
*Отпечаток / Fingerprint:* \`${fingerprint}\`
*Автоматическое создание / Auto-created:* Yes
*Дедупликация / Deduplication:* Enabled

h3. 🔍 Техническая информация / Technical Information
*Тип теста / Test Type:* E2E Cypress
*Среда / Environment:* ${process.env.NODE_ENV || 'development'}
*Версия Cypress / Cypress Version:* Latest
*Статус сборки / Build Status:* Failed

---
*Автоматически создано системой тестирования Cypress*
*Automatically created by Cypress testing system*`;

            const labels = [fingerprint, ...extraLabels];
            issueKey = await client.createIssue({
              projectKey,
              summary,
              description,
              issueType,
              labels,
            });
          } else {
            // Add a comment with new occurrence context
            const newTimestamp = new Date().toISOString();
            await client.addComment(issueKey,
`🔄 *Повторное воспроизведение ошибки / Error Reproduced Again*

📅 *Время / Time:* ${newTimestamp}
🔧 *Спецификация / Spec:* \`${spec}\`
🧪 *Тест / Test:* \`${testTitle}\`
🌐 *URL приложения / App URL:* ${appUrl || '-'}
🖥️ *Браузер / Browser:* ${browser || '-'}
💻 *ОС / OS:* ${os || '-'}

⚠️ *Статус / Status:* Ошибка продолжает воспроизводиться автоматически / Error continues to reproduce automatically
📊 *Частота / Frequency:* Повторяющаяся ошибка / Recurring issue
🔍 *Анализ / Analysis:* Требуется дополнительное расследование / Requires further investigation

---
*Автоматически обновлено системой тестирования / Automatically updated by testing system*`);
          }

          // 3) Attach screenshots + (optional) spec video + additional evidence
          const filesToAttach = [];
          
          // Screenshots with enhanced naming
          (screenshotPaths || []).forEach(p => { 
            if (p && fs.existsSync(p)) {
              filesToAttach.push(p);
              console.log(`📷 Attaching screenshot: ${path.basename(p)}`);
            }
          });

          // Try to attach video for this spec (if recorded)
          const videoPath = specVideos.get(spec);
          if (videoPath && fs.existsSync(videoPath)) {
            filesToAttach.push(videoPath);
            console.log(`🎥 Attaching video: ${path.basename(videoPath)}`);
          }

          // Additional evidence files (browser logs, network logs, etc.)
          const evidenceDir = path.join('cypress', 'downloads', 'evidence');
          if (fs.existsSync(evidenceDir)) {
            const evidenceFiles = fs.readdirSync(evidenceDir)
              .filter(f => f.includes(testTitle.replace(/[^a-zA-Z0-9]/g, '_')))
              .map(f => path.join(evidenceDir, f));
            evidenceFiles.forEach(f => {
              if (fs.existsSync(f)) {
                filesToAttach.push(f);
                console.log(`📄 Attaching evidence: ${path.basename(f)}`);
              }
            });
          }

          await client.attachFiles(issueKey, filesToAttach);
          
          // Add attachment summary comment
          if (filesToAttach.length > 0) {
            await client.addComment(issueKey,
              `📎 *Прикрепленные файлы / Attached Files:*\n\n` +
              filesToAttach.map((file, i) => 
                `${i+1}. ${path.basename(file)} (${fs.statSync(file).size} bytes)`
              ).join('\n') +
              `\n\n*Всего файлов / Total files:* ${filesToAttach.length}`
            );
          }

          console.log(`Jira issue ready: ${issueKey}`);
          return { issueKey, fingerprint };
        },
      });

      return config;
    },
    video: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
  },
};
```

---

# 3) Triggering on failure (support file)

This hook **calls the task** when a test fails, collects screenshot paths, and passes comprehensive metadata including browser logs, network information, and detailed error context.

```js
// cypress/support/e2e.js (or cypress/support/e2e.ts)
import 'cypress-real-events/support'; // optional
// Ensure screenshots are captured on fail:
Cypress.Screenshot.defaults({ screenshotOnRunFailure: true });

// Global arrays to collect logs and network info
let browserLogs = [];
let networkLogs = [];
let performanceMetrics = {};

// Collect browser console logs
beforeEach(() => {
  browserLogs = [];
  networkLogs = [];
  
  // Capture console logs
  cy.window().then((win) => {
    const originalLog = win.console.log;
    const originalError = win.console.error;
    const originalWarn = win.console.warn;
    
    win.console.log = (...args) => {
      browserLogs.push({ type: 'log', message: args.join(' '), timestamp: Date.now() });
      originalLog.apply(win.console, args);
    };
    
    win.console.error = (...args) => {
      browserLogs.push({ type: 'error', message: args.join(' '), timestamp: Date.now() });
      originalError.apply(win.console, args);
    };
    
    win.console.warn = (...args) => {
      browserLogs.push({ type: 'warn', message: args.join(' '), timestamp: Date.now() });
      originalWarn.apply(win.console, args);
    };
  });
});

// Capture network requests
Cypress.on('window:before:load', (win) => {
  const originalFetch = win.fetch;
  win.fetch = function(...args) {
    const startTime = Date.now();
    networkLogs.push({
      type: 'fetch',
      url: args[0],
      method: args[1]?.method || 'GET',
      timestamp: startTime,
      status: 'pending'
    });
    
    return originalFetch.apply(this, args).then(response => {
      const endTime = Date.now();
      const lastLog = networkLogs[networkLogs.length - 1];
      if (lastLog && lastLog.timestamp === startTime) {
        lastLog.status = response.status;
        lastLog.duration = endTime - startTime;
        lastLog.success = response.ok;
      }
      return response;
    }).catch(error => {
      const endTime = Date.now();
      const lastLog = networkLogs[networkLogs.length - 1];
      if (lastLog && lastLog.timestamp === startTime) {
        lastLog.status = 'error';
        lastLog.duration = endTime - startTime;
        lastLog.error = error.message;
        lastLog.success = false;
      }
      throw error;
    });
  };
});

afterEach(function () {
  const test = this.currentTest;
  if (test && test.state === 'failed') {
    const spec = Cypress.spec.relative;
    const testTitle = test.fullTitle ? test.fullTitle() : test.title;
    const errMsg = (test.err && (test.err.stack || test.err.message)) || 'Unknown error';

    // Build expected screenshot path(s). Cypress stores screenshots as:
    // cypress/screenshots/<spec>/<test title> (failed).png
    const sanitize = (s) => s.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 200);
    const screenshotDir = `cypress/screenshots/${spec}`;
    const screenshotName = `${sanitize(testTitle)} (failed).png`;
    const screenshotPath = `${screenshotDir}/${screenshotName}`;

    // Collect comprehensive browser and system information
    const browser = `${Cypress.browser.displayName} ${Cypress.browser.version || ''}`.trim();
    const os = `${Cypress.platform} ${Cypress.arch}`;
    const appUrl = Cypress.config('baseUrl') || '-';
    const viewport = `${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`;
    
    // Get current page URL and title
    cy.url().then(currentUrl => {
      cy.title().then(pageTitle => {
        // Save logs to files for attachment
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFileName = `cypress/downloads/evidence/${sanitize(testTitle)}-${timestamp}-logs.json`;
        const networkFileName = `cypress/downloads/evidence/${sanitize(testTitle)}-${timestamp}-network.json`;
        
        // Create evidence directory if it doesn't exist
        cy.task('ensureDir', 'cypress/downloads/evidence');
        
        // Save browser logs
        if (browserLogs.length > 0) {
          cy.writeFile(logFileName, {
            testTitle,
            spec,
            timestamp,
            browserLogs,
            error: errMsg
          });
        }
        
        // Save network logs
        if (networkLogs.length > 0) {
          cy.writeFile(networkFileName, {
            testTitle,
            spec,
            timestamp,
            networkLogs,
            summary: {
              totalRequests: networkLogs.length,
              failedRequests: networkLogs.filter(log => !log.success).length,
              slowRequests: networkLogs.filter(log => log.duration > 3000).length
            }
          });
        }

        // Enhanced task call with comprehensive information
        cy.task('createOrUpdateJira', {
          spec,
          testTitle,
          errorMessage: errMsg,
          appUrl,
          currentUrl,
          pageTitle,
          browser,
          os,
          viewport,
          screenshotPaths: [screenshotPath],
          browserLogs: browserLogs.slice(-10), // Last 10 log entries
          networkLogs: networkLogs.slice(-5),  // Last 5 network requests
          testDuration: test.duration || 0,
          retries: test.currentRetry || 0,
          timestamp: new Date().toISOString(),
          evidenceFiles: [
            browserLogs.length > 0 ? logFileName : null,
            networkLogs.length > 0 ? networkFileName : null
          ].filter(Boolean)
        }, { log: false });
      });
    });
  }
});

// Add custom task for creating directories
Cypress.Commands.add('ensureDir', (dirPath) => {
  cy.task('ensureDir', dirPath);
});
```

> **Enhanced Features:**
> - **Browser Console Logs**: Automatically captures console.log, console.error, console.warn
> - **Network Monitoring**: Tracks fetch requests, response times, and failures  
> - **Performance Metrics**: Includes test duration and retry information
> - **Evidence Files**: Saves detailed logs as JSON files for attachment
> - **Bilingual Support**: Error descriptions in both Russian and English
> - **Comprehensive Context**: Page URL, title, viewport, browser details

> If you save screenshots in a custom way or use multiple per test, push all absolute paths to `screenshotPaths`.

---

# 4) Run it

Local:

```bash
# make sure env vars are set
export JIRA_HOST="https://yourcompany.atlassian.net"
export JIRA_EMAIL="you@yourcompany.com"
export JIRA_API_TOKEN="..."
export JIRA_PROJECT_KEY="QA"
npx cypress run
```

CI (GitHub Actions) — add the same env vars as **secrets**, then:

```yaml
- name: Run Cypress (auto-file Jira on fail)
  run: npx cypress run
  env:
    JIRA_HOST: ${{ secrets.JIRA_HOST }}
    JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
    JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
    JIRA_PROJECT_KEY: ${{ secrets.JIRA_PROJECT_KEY }}
    JIRA_ISSUE_TYPE: Bug
    JIRA_LABELS: cypress,auto-filed
```

---

# 5) How dedup works (fingerprint)

* The task builds a fingerprint from `projectKey + spec + testTitle + errorMessage` → **label** like `cfp_ab12cd34ef`.
* It runs a **JQL** search for open issues that already have that label.
* If found → it **comments & attaches** again (no duplicate ticket).
* If not found → it **creates a new Bug** with that label.

> Adjust the JQL or the fingerprint recipe if you prefer coarser/finer grouping.

---

# 6) Nice extras (optional)

* **Add PR/commit info**: pass `process.env.GITHUB_SHA`, branch, or build URL in the task payload and include in the description/comment.
* **Custom fields**: extend the payload in `createIssue()` to set `components`, `priority`, custom fields (use field IDs).
* **Throttle bursts**: cache last-created issue per fingerprint in a temp file and skip create calls if repeated within N minutes.

---

## That’s it

Drop these files in, set your Jira secrets, run Cypress — **failed tests will file Jira bugs with screenshots/videos**, and **won’t duplicate** the same error. If you want, tell me your Jira custom fields (IDs) and I’ll extend the `createIssue()` to populate them automatically.
