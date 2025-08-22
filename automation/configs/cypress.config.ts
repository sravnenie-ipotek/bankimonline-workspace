import { defineConfig } from 'cypress'
import * as fs from 'fs'
import * as path from 'path'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'
import axios from 'axios'
import FormData from 'form-data'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Jira integration functions
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

  async function searchIssueByFingerprint(projectKey: string, fingerprint: string) {
    // JQL: look for open issues in the project with our unique fingerprint label
    const jql = `project = ${projectKey} AND statusCategory != Done AND labels = "${fingerprint}"`;
    const res = await api.get('/rest/api/3/search', {
      params: { jql, maxResults: 1, fields: ['key'] },
    });
    return res.data.issues?.[0]?.key || null;
  }

  async function createIssue({ projectKey, summary, description, issueType, labels }: any) {
    const payload = {
      fields: {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType || 'Баг' },
        labels: labels || [],
      },
    };
    const res = await api.post('/rest/api/3/issue', payload);
    return res.data.key;
  }

  async function addComment(issueKey: string, body: any) {
    await api.post(`/rest/api/3/issue/${issueKey}/comment`, { body });
  }

  async function attachFiles(issueKey: string, files: string[]) {
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
      } catch (e: any) {
        console.warn(`Failed to attach file: ${filePath}`, e.response?.data || e.message);
      }
    }
  }

  return { searchIssueByFingerprint, createIssue, addComment, attachFiles };
}

/** Create a short, stable fingerprint for the failure */
function buildFingerprint({ projectKey, spec, testTitle, errorMessage }: any) {
  const raw = `${projectKey}::${spec}::${testTitle}::${(errorMessage || '').slice(0,400)}`;
  return 'cfp_' + crypto.createHash('sha1').update(raw).digest('hex').slice(0, 10);
}

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: '../screenshots',
    trashAssetsBeforeRuns: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Setup for banking application specific needs
    env: {
      apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:8003',
      testUser: {
        phone: '972544123456',
        name: 'Test User',
        otp: '123456' // For test environment only
      },
      bankingDefaults: {
        currency: 'ILS',
        language: 'he'
      }
    },
    
    setupNodeEvents(on, config) {
      // Create timestamped folder for screenshots
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
      const runFolder = `run-${timestamp}`
      const screenshotsPath = path.join(config.screenshotsFolder, runFolder)
      
      // Update config with new screenshots folder
      config.screenshotsFolder = screenshotsPath
      
      // Ensure the directory exists
      if (!fs.existsSync(screenshotsPath)) {
        fs.mkdirSync(screenshotsPath, { recursive: true })
      }

      // Collect per-spec video path (after run) to attach later
      const specVideos = new Map()
      on('after:spec', (spec: any, results: any) => {
        if (results && results.video) {
          specVideos.set(spec.relative, results.video)
        }
      })
      
      // Database connection pools
      const mainDbPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway') ? {
          rejectUnauthorized: false
        } : false
      })
      
      const contentDbPool = new Pool({
        connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
        ssl: (process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || '').includes('railway') ? {
          rejectUnauthorized: false
        } : false
      })
      
      // Add custom tasks here
      on('task', {
        log(message) {
          return null
        },
        table(message) {
          console.table(message)
          return null
        },
        getScreenshotFolder() {
          return screenshotsPath
        },
        
        // Database query tasks
        async queryDb(query: string) {
          try {
            const result = await mainDbPool.query(query)
            return result.rows
          } catch (error: any) {
            console.error('Main DB query error:', error.message)
            throw error
          }
        },
        
        async queryContentDb(query: string) {
          try {
            const result = await contentDbPool.query(query)
            return result.rows
          } catch (error: any) {
            console.error('Content DB query error:', error.message)
            throw error
          }
        },
        
        async checkFileExists(filePath: string) {
          const fullPath = path.resolve(__dirname, '..', filePath)
          return fs.existsSync(fullPath)
        },

        // Enhanced Visual regression Jira integration
        async createVisualRegressionJira(issue: any) {
          const { PercyJiraIntegration } = require('../tests/e2e/support/percy-jira-integration')
          
          try {
            const jiraIntegration = new PercyJiraIntegration()
            const result = await jiraIntegration.createOrUpdateVisualRegressionIssue(issue)
            console.log(`🎨 Visual regression Jira issue: ${result.issueKey}`)
            
            // Also create standard test failure issue if this was a test failure
            if (issue.testFailure) {
              const standardIssue = await this.createOrUpdateJira({
                spec: issue.specFile,
                testTitle: `Visual Regression: ${issue.testName}`,
                errorMessage: `Percy visual differences detected: ${issue.visualDifferences?.map(d => d.elementName).join(', ')}`,
                appUrl: issue.percyBuildUrl,
                browser: 'Multiple',
                os: 'CI/CD',
                screenshotPaths: issue.screenshots,
                actionLog: [
                  `Percy build: ${issue.percyBuildUrl}`,
                  `Visual differences: ${issue.visualDifferences?.length || 0}`,
                  `Affected languages: ${issue.affectedLanguages?.join(', ')}`,
                  `Affected viewports: ${issue.affectedViewports?.join(', ')}`
                ],
                currentUrl: issue.percyComparisonUrl,
                testSteps: [{
                  action: 'Percy visual regression test',
                  success: false,
                  error: 'Visual differences detected'
                }],
                filePath: issue.specFile
              })
              
              result.standardIssueKey = standardIssue.issueKey
            }
            
            return result
          } catch (error: any) {
            console.error('❌ Visual regression Jira integration failed:', error.message)
            return { error: error.message }
          }
        },

        // Enhanced Jira integration task with bilingual support and detailed tracking
        async createOrUpdateJira(input: any) {
          const {
            spec, testTitle, errorMessage, appUrl, browser, os,
            screenshotPaths, actionLog, currentUrl, testSteps, filePath
          } = input;

          const projectKey   = process.env.JIRA_PROJECT_KEY || 'TVKC';
          const issueType    = process.env.JIRA_ISSUE_TYPE || 'Баг';
          const extraLabels  = (process.env.JIRA_LABELS || '')
                                  .split(',')
                                  .map((s: string) => s.trim())
                                  .filter(Boolean);

          try {
            const client = jiraClient();
            const fingerprint = buildFingerprint({ projectKey, spec, testTitle, errorMessage });
            const timestamp = new Date().toISOString();

            // 1) Reuse an existing open issue if present
            let issueKey = await client.searchIssueByFingerprint(projectKey, fingerprint);

            // 2) If not found, create new bilingual bug
            if (!issueKey) {
              const summary = `[Cypress] ${testTitle}`;
              
              // Create bilingual ADF description with enhanced details
              const description = {
                "type": "doc",
                "version": 1,
                "content": [
                  {
                    "type": "heading",
                    "attrs": { "level": 2 },
                    "content": [{ "type": "text", "text": "🔥 Cypress Automated Test Failure | Автоматизированный сбой теста Cypress" }]
                  },
                  {
                    "type": "panel",
                    "attrs": { "panelType": "error" },
                    "content": [
                      {
                        "type": "paragraph",
                        "content": [
                          { "type": "text", "text": "CRITICAL: Test failure detected during automated QA execution", "marks": [{ "type": "strong" }] },
                          { "type": "hardBreak" },
                          { "type": "text", "text": "КРИТИЧЕСКИЙ: Обнаружен сбой теста во время автоматизированного выполнения QA", "marks": [{ "type": "strong" }] }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "heading",
                    "attrs": { "level": 3 },
                    "content": [{ "type": "text", "text": "📍 Test Location | Местоположение теста" }]
                  },
                  {
                    "type": "table",
                    "attrs": {
                      "isNumberColumnEnabled": false,
                      "layout": "default"
                    },
                    "content": [
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableHeader",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Field | Поле" }] }]
                          },
                          {
                            "type": "tableHeader", 
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Value | Значение" }] }]
                          }
                        ]
                      },
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Spec File | Файл спецификации" }] }]
                          },
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": spec, "marks": [{ "type": "code" }] }] }]
                          }
                        ]
                      },
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Test Title | Название теста" }] }]
                          },
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": testTitle, "marks": [{ "type": "code" }] }] }]
                          }
                        ]
                      },
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "File Path | Путь к файлу" }] }]
                          },
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": filePath || spec, "marks": [{ "type": "code" }] }] }]
                          }
                        ]
                      },
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Current URL | Текущий URL" }] }]
                          },
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": currentUrl || appUrl || '-', "marks": [{ "type": "code" }] }] }]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "heading",
                    "attrs": { "level": 3 },
                    "content": [{ "type": "text", "text": "🖥️ Environment | Окружение" }]
                  },
                  {
                    "type": "bulletList",
                    "content": [
                      {
                        "type": "listItem",
                        "content": [
                          {
                            "type": "paragraph",
                            "content": [
                              { "type": "text", "text": "Browser | Браузер: " + (browser || '-') }
                            ]
                          }
                        ]
                      },
                      {
                        "type": "listItem",
                        "content": [
                          {
                            "type": "paragraph",
                            "content": [
                              { "type": "text", "text": "Operating System | Операционная система: " + (os || '-') }
                            ]
                          }
                        ]
                      },
                      {
                        "type": "listItem",
                        "content": [
                          {
                            "type": "paragraph",
                            "content": [
                              { "type": "text", "text": "Timestamp | Время: " + timestamp }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "heading",
                    "attrs": { "level": 3 },
                    "content": [{ "type": "text", "text": "❌ Error Details | Детали ошибки" }]
                  },
                  {
                    "type": "codeBlock",
                    "attrs": { "language": "javascript" },
                    "content": [{ "type": "text", "text": errorMessage || '(no error message | нет сообщения об ошибке)' }]
                  }
                ]
              };

              // Add test steps if provided
              if (testSteps && testSteps.length > 0) {
                description.content.push(
                  {
                    "type": "heading",
                    "attrs": { "level": 3 },
                    "content": [{ "type": "text", "text": "📋 Test Steps | Шаги теста" }]
                  },
                  {
                    "type": "orderedList",
                    "content": testSteps.map((step: any, index: number) => ({
                      "type": "listItem",
                      "content": [
                        {
                          "type": "paragraph",
                          "content": [
                            { "type": "text", "text": `${step.action || step}`, "marks": step.success === false ? [{ "type": "strong" }, { "type": "textColor", "attrs": { "color": "#DE350B" } }] : [] },
                            step.selector ? { "type": "text", "text": ` (${step.selector})`, "marks": [{ "type": "code" }] } : null
                          ].filter(Boolean)
                        }
                      ]
                    }))
                  }
                );
              }

              // Add action log if provided  
              if (actionLog && actionLog.length > 0) {
                description.content.push(
                  {
                    "type": "heading",
                    "attrs": { "level": 3 },
                    "content": [{ "type": "text", "text": "🔍 Action Log | Журнал действий" }]
                  },
                  {
                    "type": "codeBlock",
                    "attrs": { "language": "text" },
                    "content": [{ "type": "text", "text": Array.isArray(actionLog) ? actionLog.join('\n') : actionLog }]
                  }
                );
              }

              // Add debugging information
              description.content.push(
                {
                  "type": "heading",
                  "attrs": { "level": 3 },
                  "content": [{ "type": "text", "text": "🔧 Debug Information | Отладочная информация" }]
                },
                {
                  "type": "bulletList",
                  "content": [
                    {
                      "type": "listItem",
                      "content": [
                        {
                          "type": "paragraph",
                          "content": [
                            { "type": "text", "text": "Fingerprint | Отпечаток: " },
                            { "type": "text", "text": fingerprint, "marks": [{ "type": "code" }] }
                          ]
                        }
                      ]
                    },
                    {
                      "type": "listItem",
                      "content": [
                        {
                          "type": "paragraph",
                          "content": [
                            { "type": "text", "text": "Screenshots attached | Прикреплены скриншоты: " + (screenshotPaths && screenshotPaths.length > 0 ? 'Yes | Да' : 'No | Нет') }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "panel",
                  "attrs": { "panelType": "info" },
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        { "type": "text", "text": "Note: This bug was automatically created by Cypress test automation. The fingerprint prevents duplicate bug creation for the same issue.", "marks": [{ "type": "em" }] },
                        { "type": "hardBreak" },
                        { "type": "text", "text": "Примечание: Этот баг был автоматически создан автоматизацией тестов Cypress. Отпечаток предотвращает создание дублирующих багов для одной и той же проблемы.", "marks": [{ "type": "em" }] }
                      ]
                    }
                  ]
                }
              );

              const labels = [fingerprint, ...extraLabels, 'automated-qa', 'bilingual'];
              issueKey = await client.createIssue({
                projectKey,
                summary,
                description,
                issueType,
                labels,
              });
            } else {
              // Add bilingual comment with enhanced occurrence context  
              const commentBody = {
                "type": "doc",
                "version": 1,
                "content": [
                  {
                    "type": "panel",
                    "attrs": { "panelType": "warning" },
                    "content": [
                      {
                        "type": "paragraph",
                        "content": [
                          { "type": "text", "text": "🔄 Bug reproduced again via Cypress automation | Баг воспроизведен снова через автоматизацию Cypress", "marks": [{ "type": "strong" }] },
                          { "type": "hardBreak" },
                          { "type": "text", "text": "Timestamp | Время: " + timestamp }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "heading",
                    "attrs": { "level": 4 },
                    "content": [{ "type": "text", "text": "📍 Reproduction Details | Детали воспроизведения" }]
                  },
                  {
                    "type": "table",
                    "attrs": {
                      "isNumberColumnEnabled": false,
                      "layout": "default"
                    },
                    "content": [
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Spec | Спецификация" }] }]
                          },
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": spec, "marks": [{ "type": "code" }] }] }]
                          }
                        ]
                      },
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Test | Тест" }] }]
                          },
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": testTitle, "marks": [{ "type": "code" }] }] }]
                          }
                        ]
                      },
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Current URL | Текущий URL" }] }]
                          },
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": currentUrl || appUrl || '-', "marks": [{ "type": "code" }] }] }]
                          }
                        ]
                      },
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Browser | Браузер" }] }]
                          },
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": browser || '-' }] }]
                          }
                        ]
                      },
                      {
                        "type": "tableRow",
                        "content": [
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "OS | ОС" }] }]
                          },
                          {
                            "type": "tableCell",
                            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": os || '-' }] }]
                          }
                        ]
                      }
                    ]
                  }
                ]
              };

              // Add action log to comment if provided
              if (actionLog && actionLog.length > 0) {
                commentBody.content.push(
                  {
                    "type": "heading",
                    "attrs": { "level": 4 },
                    "content": [{ "type": "text", "text": "🔍 Action Log | Журнал действий" }]
                  },
                  {
                    "type": "codeBlock",
                    "attrs": { "language": "text" },
                    "content": [{ "type": "text", "text": Array.isArray(actionLog) ? actionLog.join('\n') : actionLog }]
                  }
                );
              }

              await client.addComment(issueKey, commentBody);
            }

            // 3) Attach screenshots + (optional) spec video
            const filesToAttach: string[] = [];
            (screenshotPaths || []).forEach((p: string) => { 
              if (p && fs.existsSync(p)) filesToAttach.push(p); 
            });

            // Try to attach video for this spec (if recorded)
            const videoPath = specVideos.get(spec);
            if (videoPath && fs.existsSync(videoPath) && process.env.JIRA_ATTACH_VIDEOS !== 'false') {
              filesToAttach.push(videoPath);
            }

            if (process.env.JIRA_ATTACH_SCREENSHOTS !== 'false') {
              await client.attachFiles(issueKey, filesToAttach);
            }

            console.log(`🎯 Jira bug created/updated: https://bankimonline.atlassian.net/browse/${issueKey}`);
            return { issueKey, fingerprint };
          } catch (error: any) {
            console.error('❌ Jira integration error:', error.message);
            return { error: error.message };
          }
        }
      })
      
      // Custom screenshot naming
      on('after:screenshot', (details) => {
        // Create a more descriptive filename
        const testName = details.specName.replace(/\.cy\.(ts|js)$/, '')
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
        const newFileName = `${testName}_${details.name}_${timestamp}.png`
        const newPath = path.join(path.dirname(details.path), newFileName)
        
        // Rename the screenshot
        fs.renameSync(details.path, newPath)
        
        // Update the details object
        details.path = newPath
        details.name = newFileName
        
        return details
      })
      
      // Log the screenshot folder at the start of the run
      on('before:run', () => {
        })
      
      // Configure code coverage if needed
      // require('@cypress/code-coverage/task')(on, config)
      
      return config
    },
    
    // Exclude test files from being served
    excludeSpecPattern: [
      '**/*.hot-update.js',
      '**/__snapshots__/*',
      '**/__image_snapshots__/*'
    ],
    
    // Test file patterns
    specPattern: '../tests/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
    
    // Support file
    supportFile: '../tests/e2e/support/e2e.ts',
    
    // Retry configuration for flaky tests
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: '../tests/e2e/support/component.ts',
  },
})