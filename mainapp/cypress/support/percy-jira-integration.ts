/**
 * 🎨 Percy + Jira Integration for Visual Regression Bug Tracking
 * 
 * Enhanced Jira integration specifically for visual regression issues
 * - Creates detailed visual regression bugs with Percy links
 * - Bilingual support (Hebrew/English/Russian)
 * - Banking-specific visual issue categorization
 * - Automatic screenshot and video attachment
 */

import axios from 'axios'
import * as fs from 'fs'
import * as crypto from 'crypto'

interface VisualRegressionIssue {
  testName: string
  snapshots: string[]
  percyBuildUrl?: string
  percyComparisonUrl?: string
  visualDifferences?: Array<{
    elementName: string
    changeType: 'layout' | 'color' | 'text' | 'missing' | 'added'
    severity: 'low' | 'medium' | 'high' | 'critical'
  }>
  affectedLanguages: string[]
  affectedViewports: number[]
  bankingImpact: 'ui-only' | 'data-display' | 'form-validation' | 'critical-path'
  screenshots: string[]
  specFile: string
  branch: string
  commit: string
}

class PercyJiraIntegration {
  private baseURL: string
  private auth: string
  private projectKey: string

  constructor() {
    this.baseURL = process.env.JIRA_HOST || ''
    this.auth = Buffer.from(
      `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
    ).toString('base64')
    this.projectKey = process.env.JIRA_PROJECT_KEY || 'TVKC'
  }

  /**
   * Create a fingerprint for visual regression issues
   */
  private createVisualFingerprint(issue: VisualRegressionIssue): string {
    const raw = `visual::${this.projectKey}::${issue.testName}::${issue.snapshots.join(',')}`
    return 'vfp_' + crypto.createHash('sha1').update(raw).digest('hex').slice(0, 10)
  }

  /**
   * Search for existing visual regression issue
   */
  private async searchExistingIssue(fingerprint: string): Promise<string | null> {
    try {
      const jql = `project = ${this.projectKey} AND statusCategory != Done AND labels = "${fingerprint}"`
      const response = await axios.get(`${this.baseURL}/rest/api/3/search`, {
        params: { jql, maxResults: 1, fields: ['key'] },
        headers: {
          Authorization: `Basic ${this.auth}`,
          Accept: 'application/json'
        }
      })
      
      return response.data.issues?.[0]?.key || null
    } catch (error) {
      console.error('Error searching for existing visual regression issue:', error)
      return null
    }
  }

  /**
   * Create detailed visual regression bug description
   */
  private createVisualRegressionDescription(issue: VisualRegressionIssue) {
    const timestamp = new Date().toISOString()
    
    return {
      type: "doc",
      version: 1,
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ 
            type: "text", 
            text: "🎨 Visual Regression Detected | זוהתה רגרסיה ויזואלית | Обнаружена визуальная регрессия" 
          }]
        },
        {
          type: "panel",
          attrs: { panelType: "error" },
          content: [
            {
              type: "paragraph",
              content: [
                { 
                  type: "text", 
                  text: "CRITICAL: Visual changes detected in banking application UI that may affect user experience", 
                  marks: [{ type: "strong" }] 
                },
                { type: "hardBreak" },
                { 
                  type: "text", 
                  text: "קריטי: זוהו שינויים ויזואליים באפליקציית הבנק שעלולים להשפיע על חוויית המשתמש", 
                  marks: [{ type: "strong" }] 
                },
                { type: "hardBreak" },
                { 
                  type: "text", 
                  text: "КРИТИЧЕСКИЙ: Обнаружены визуальные изменения в банковском приложении", 
                  marks: [{ type: "strong" }] 
                }
              ]
            }
          ]
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "📊 Visual Regression Details | פרטי רגרסיה ויזואלית" }]
        },
        {
          type: "table",
          attrs: { isNumberColumnEnabled: false, layout: "default" },
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Field | שדה | Поле" }] }]
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Value | ערך | Значение" }] }]
                }
              ]
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Test Name | שם המבחן" }] }]
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: issue.testName, marks: [{ type: "code" }] }] }]
                }
              ]
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Affected Snapshots | צילומי מסך מושפעים" }] }]
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: issue.snapshots.join(', '), marks: [{ type: "code" }] }] }]
                }
              ]
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Languages | שפות" }] }]
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: issue.affectedLanguages.join(', ') }] }]
                }
              ]
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Viewports | תצוגות" }] }]
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: issue.affectedViewports.map(v => `${v}px`).join(', ') }] }]
                }
              ]
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Banking Impact | השפעה בנקאית" }] }]
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: issue.bankingImpact, marks: [{ type: "strong" }] }] }]
                }
              ]
            }
          ]
        }
      ]
    }
  }

  /**
   * Add visual differences section to description
   */
  private addVisualDifferencesSection(description: any, issue: VisualRegressionIssue) {
    if (!issue.visualDifferences || issue.visualDifferences.length === 0) return

    description.content.push(
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "🔍 Visual Differences Detected | הבדלים ויזואליים שזוהו" }]
      },
      {
        type: "bulletList",
        content: issue.visualDifferences.map(diff => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { 
                  type: "text", 
                  text: `${diff.elementName}: `, 
                  marks: [{ type: "strong" }] 
                },
                { 
                  type: "text", 
                  text: `${diff.changeType} (${diff.severity} severity)`,
                  marks: diff.severity === 'critical' ? [{ type: "textColor", attrs: { color: "#DE350B" } }] : []
                }
              ]
            }
          ]
        }))
      }
    )
  }

  /**
   * Add Percy links section
   */
  private addPercyLinksSection(description: any, issue: VisualRegressionIssue) {
    if (!issue.percyBuildUrl && !issue.percyComparisonUrl) return

    description.content.push(
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "🔗 Percy Visual Comparison Links" }]
      },
      {
        type: "bulletList",
        content: [
          ...(issue.percyBuildUrl ? [{
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "Percy Build: " },
                  { 
                    type: "text", 
                    text: issue.percyBuildUrl,
                    marks: [{ type: "link", attrs: { href: issue.percyBuildUrl } }]
                  }
                ]
              }
            ]
          }] : []),
          ...(issue.percyComparisonUrl ? [{
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "Visual Comparison: " },
                  { 
                    type: "text", 
                    text: issue.percyComparisonUrl,
                    marks: [{ type: "link", attrs: { href: issue.percyComparisonUrl } }]
                  }
                ]
              }
            ]
          }] : [])
        ]
      }
    )
  }

  /**
   * Create or update visual regression Jira issue
   */
  async createOrUpdateVisualRegressionIssue(issue: VisualRegressionIssue): Promise<{ issueKey: string, fingerprint: string }> {
    try {
      const fingerprint = this.createVisualFingerprint(issue)
      let issueKey = await this.searchExistingIssue(fingerprint)

      if (!issueKey) {
        // Create new issue
        const description = this.createVisualRegressionDescription(issue)
        this.addVisualDifferencesSection(description, issue)
        this.addPercyLinksSection(description, issue)

        const payload = {
          fields: {
            project: { key: this.projectKey },
            summary: `🎨 Visual Regression: ${issue.testName}`,
            description: description,
            issuetype: { name: 'Bug' },
            priority: { 
              name: issue.bankingImpact === 'critical-path' ? 'Highest' : 
                    issue.bankingImpact === 'form-validation' ? 'High' :
                    issue.bankingImpact === 'data-display' ? 'Medium' : 'Low'
            },
            labels: [
              fingerprint,
              'visual-regression', 
              'percy', 
              'automated',
              `impact-${issue.bankingImpact}`,
              ...issue.affectedLanguages.map(lang => `lang-${lang.toLowerCase()}`),
              'banking-ui'
            ]
          }
        }

        const response = await axios.post(`${this.baseURL}/rest/api/3/issue`, payload, {
          headers: {
            Authorization: `Basic ${this.auth}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        })

        issueKey = response.data.key
      } else {
        // Add comment to existing issue
        const commentBody = {
          type: "doc",
          version: 1,
          content: [
            {
              type: "panel",
              attrs: { panelType: "warning" },
              content: [
                {
                  type: "paragraph",
                  content: [
                    { 
                      type: "text", 
                      text: "🔄 Visual regression reproduced again", 
                      marks: [{ type: "strong" }] 
                    },
                    { type: "hardBreak" },
                    { type: "text", text: `Branch: ${issue.branch}` },
                    { type: "hardBreak" },
                    { type: "text", text: `Commit: ${issue.commit}` },
                    { type: "hardBreak" },
                    { type: "text", text: `Percy Build: ${issue.percyBuildUrl || 'N/A'}` }
                  ]
                }
              ]
            }
          ]
        }

        await axios.post(`${this.baseURL}/rest/api/3/issue/${issueKey}/comment`, 
          { body: commentBody },
          {
            headers: {
              Authorization: `Basic ${this.auth}`,
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )
      }

      // Attach screenshots if available
      if (issue.screenshots && issue.screenshots.length > 0) {
        await this.attachScreenshots(issueKey, issue.screenshots)
      }

      return { issueKey, fingerprint }
    } catch (error) {
      console.error('Error creating/updating visual regression issue:', error)
      throw error
    }
  }

  /**
   * Attach screenshots to Jira issue
   */
  private async attachScreenshots(issueKey: string, screenshots: string[]): Promise<void> {
    for (const screenshotPath of screenshots) {
      try {
        if (fs.existsSync(screenshotPath)) {
          const FormData = require('form-data')
          const form = new FormData()
          form.append('file', fs.createReadStream(screenshotPath))

          await axios.post(
            `${this.baseURL}/rest/api/3/issue/${issueKey}/attachments`,
            form,
            {
              headers: {
                Authorization: `Basic ${this.auth}`,
                'X-Atlassian-Token': 'no-check',
                ...form.getHeaders()
              },
              maxContentLength: Infinity,
              maxBodyLength: Infinity
            }
          )
        }
      } catch (error) {
        console.warn(`Failed to attach screenshot: ${screenshotPath}`, error)
      }
    }
  }
}

// Export the integration class
export { PercyJiraIntegration, VisualRegressionIssue }

// Add Cypress task for visual regression Jira integration
if (typeof Cypress !== 'undefined') {
  Cypress.Commands.add('reportVisualRegression', (issue: VisualRegressionIssue) => {
    return cy.task('createVisualRegressionJira', issue, { log: false })
  })
}

// Extend Cypress types
declare global {
  namespace Cypress {
    interface Chainable {
      reportVisualRegression(issue: VisualRegressionIssue): Chainable<{ issueKey: string, fingerprint: string }>
    }
  }
}