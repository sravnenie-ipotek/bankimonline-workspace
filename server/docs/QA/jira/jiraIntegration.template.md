Awesome — here's a **ready-to-use Cypress → Jira** setup that:

* **Auto-creates a Jira bug** when a test fails
* **De-duplicates** by fingerprint (won't spam Jira with the same failure)
* **Attaches screenshots** (and the spec video if available)
* Lets you **tune JQL**, labels, and fields

---

# 1) Set required secrets (CI or local)

Set these environment variables (in your CI secrets or local shell):

```bash
# Jira connection settings
export JIRA_HOST="https://bankimonline.atlassian.net"
export JIRA_EMAIL="your-email@bankimonline.com"
export JIRA_API_TOKEN="your_api_token_here"

# Jira project and issue settings
export JIRA_PROJECT_KEY="TVKC"               # Bankimonline project key
export JIRA_ISSUE_TYPE="Баг"                 # Russian "Bug" issue type
export JIRA_LABELS="cypress,auto-filed"      # Optional tracking labels

# Optional: if you want screenshots/videos uploaded
export JIRA_ATTACH_SCREENSHOTS=true
export JIRA_ATTACH_VIDEOS=false
```

> **SECURITY NOTE**: Never commit actual API tokens to Git! Use environment variables or CI secrets.
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
        /**
         * input:
         *  {
         *    spec, testTitle, errorMessage, appUrl, browser, os,
         *    screenshotPaths: [...absolutePaths]
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
            const description =
`h3. Cypress Automated Failure

*Spec:* \`${spec}\`
*Test:* \`${testTitle}\`

*App URL:* ${appUrl || '-'}
*Browser:* ${browser || '-'}
*OS:* ${os || '-'}

*Error:*
{code}
${errorMessage || '(no error message)'}
{code}

*Fingerprint label:* \`${fingerprint}\`
(Used to prevent duplicate bugs for the same failure)`;

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
            await client.addComment(issueKey,
`Reproduced again via Cypress.

*Spec:* \`${spec}\`
*Test:* \`${testTitle}\`
*App URL:* ${appUrl || '-'}
*Browser:* ${browser || '-'}
*OS:* ${os || '-'}`);
          }

          // 3) Attach screenshots + (optional) spec video
          const filesToAttach = [];
          (screenshotPaths || []).forEach(p => { if (p && fs.existsSync(p)) filesToAttach.push(p); });

          // Try to attach video for this spec (if recorded)
          const videoPath = specVideos.get(spec);
          if (videoPath && fs.existsSync(videoPath)) filesToAttach.push(videoPath);

          await client.attachFiles(issueKey, filesToAttach);

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

This hook **calls the task** when a test fails, collects screenshot paths, and passes metadata.

```js
// cypress/support/e2e.js (or cypress/support/e2e.ts)
import 'cypress-real-events/support'; // optional
// Ensure screenshots are captured on fail:
Cypress.Screenshot.defaults({ screenshotOnRunFailure: true });

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

    const browser = `${Cypress.browser.displayName} ${Cypress.browser.version || ''}`.trim();
    const os = `${Cypress.platform} ${Cypress.arch}`;
    const appUrl = Cypress.config('baseUrl') || '-';

    cy.task('createOrUpdateJira', {
      spec,
      testTitle,
      errorMessage: errMsg,
      appUrl,
      browser,
      os,
      screenshotPaths: [screenshotPath],
    }, { log: false });
  }
});
```

> If you save screenshots in a custom way or use multiple per test, push all absolute paths to `screenshotPaths`.

---

# 4) Run it

Local:

```bash
# make sure env vars are set
export JIRA_HOST="https://bankimonline.atlassian.net"
export JIRA_EMAIL="your-email@bankimonline.com"
export JIRA_API_TOKEN="..."
export JIRA_PROJECT_KEY="TVKC"
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
    JIRA_ISSUE_TYPE: Баг
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

## That's it

Drop these files in, set your Jira secrets, run Cypress — **failed tests will file Jira bugs with screenshots/videos**, and **won't duplicate** the same error. If you want, tell me your Jira custom fields (IDs) and I'll extend the `createIssue()` to populate them automatically.

## Security Notes

🔒 **NEVER commit actual credentials to Git!** 
- Use environment variables in production
- Use CI/CD secrets for automated testing
- Keep the actual `jiraIntegration.md` file with real credentials in `.gitignore`
- This template file shows the structure without exposing sensitive data