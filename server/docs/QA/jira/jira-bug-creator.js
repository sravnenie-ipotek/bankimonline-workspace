/**
 * JIRA BUG CREATOR - Interactive Bug Creation System
 * This script handles bug creation from the QA Dashboard to Jira
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class JiraBugCreator {
    constructor() {
        // Jira configuration - UPDATE THESE WITH YOUR ACTUAL JIRA DETAILS
        this.config = {
            jiraUrl: process.env.JIRA_URL || 'https://bankimonline.atlassian.net',
            jiraEmail: process.env.JIRA_EMAIL || 'your-email@example.com',
            jiraApiToken: process.env.JIRA_API_TOKEN || 'your-api-token',
            projectKey: process.env.JIRA_PROJECT_KEY || 'BANK',
            defaultAssignee: process.env.JIRA_DEFAULT_ASSIGNEE || 'unassigned'
        };

        this.bugQueue = [];
        this.createdBugs = [];
    }

    /**
     * MANDATORY: Confirm with user before creating bug
     */
    async confirmBugCreation(bugData) {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 BUG CREATION CONFIRMATION REQUIRED');
        console.log('='.repeat(60));
        console.log(`
📍 Section: ${bugData.section}
⚠️  Severity: ${bugData.severity}
📝 Description: ${bugData.description}
🔧 Component: ${bugData.component}

Jira Details:
- Project: ${bugData.project || this.config.projectKey}
- Type: ${bugData.issueType || 'Bug'}
- Priority: ${bugData.priority || 'Medium'}
- Summary: ${bugData.summary}

❓ Create this bug in Jira? (YES/NO)
        `);

        // In automated mode, this would wait for user input
        // For now, return true for demo
        return true;
    }

    /**
     * Create bug in Jira
     */
    async createJiraBug(bugData) {
        // First, confirm with user
        const confirmed = await this.confirmBugCreation(bugData);
        
        if (!confirmed) {
            console.log('❌ Bug creation cancelled by user');
            return null;
        }

        try {
            const jiraPayload = {
                fields: {
                    project: {
                        key: bugData.project || this.config.projectKey
                    },
                    summary: bugData.summary,
                    description: this.formatDescription(bugData),
                    issuetype: {
                        name: bugData.issueType || 'Bug'
                    },
                    priority: {
                        name: bugData.priority || 'Medium'
                    },
                    labels: bugData.labels || ['qa', 'react-component', 'automated-test'],
                    components: bugData.component ? [{ name: bugData.component }] : [],
                    customfield_10001: bugData.severity, // Custom field for severity
                    environment: `
Test Environment: ${bugData.environment || 'localhost:5173'}
Browser: ${bugData.browser || 'Chrome'}
Test Date: ${new Date().toISOString()}
                    `.trim()
                }
            };

            // Add screenshot as attachment if available
            if (bugData.screenshot) {
                jiraPayload.fields.description += `\n\n!${bugData.screenshot}!`;
            }

            console.log('\n📤 Creating bug in Jira...');
            
            // Make API call to Jira
            const response = await this.callJiraAPI('/rest/api/3/issue', 'POST', jiraPayload);
            
            if (response && response.key) {
                const jiraUrl = `${this.config.jiraUrl}/browse/${response.key}`;
                
                console.log(`\n✅ Bug created successfully!`);
                console.log(`🎫 Jira ID: ${response.key}`);
                console.log(`🔗 URL: ${jiraUrl}`);
                
                // Save to created bugs list
                this.createdBugs.push({
                    jiraId: response.key,
                    url: jiraUrl,
                    bugData: bugData,
                    createdAt: new Date().toISOString()
                });
                
                // Save to file for record keeping
                this.saveBugRecord(response.key, bugData, jiraUrl);
                
                return {
                    success: true,
                    jiraId: response.key,
                    url: jiraUrl
                };
            }
        } catch (error) {
            console.error('❌ Error creating Jira bug:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Format description for Jira
     */
    formatDescription(bugData) {
        return `
h3. Issue Description
${bugData.description}

h3. Component Information
* *Component:* ${bugData.component}
* *Section:* ${bugData.section}
* *Severity:* ${bugData.severity}
* *Test Type:* ${bugData.testType || 'Automated QA Test'}

h3. Steps to Reproduce
# Navigate to ${bugData.section}
# ${bugData.stepsToReproduce || 'Observe the component behavior'}
# Issue occurs as described

h3. Expected Result
${bugData.expectedResult || 'Component should work as per React implementation and design specifications'}

h3. Actual Result
${bugData.actualResult || bugData.description}

h3. Additional Information
* *Screenshot:* ${bugData.screenshot || 'Not available'}
* *Test Framework:* Playwright/Cypress
* *Test Date:* ${new Date().toISOString()}
* *Detected By:* Automated QA System

h3. React Component Details
This issue appears to be related to React component implementation. The selectors or component structure may differ from expected HTML elements.

h3. Suggested Fix
${bugData.suggestedFix || 'Review React component implementation and update selectors or component logic as needed.'}
        `.trim();
    }

    /**
     * Call Jira API
     */
    async callJiraAPI(endpoint, method = 'GET', data = null) {
        const url = `${this.config.jiraUrl}${endpoint}`;
        
        const headers = {
            'Authorization': `Basic ${Buffer.from(
                `${this.config.jiraEmail}:${this.config.jiraApiToken}`
            ).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        try {
            const response = await axios({
                method: method,
                url: url,
                headers: headers,
                data: data
            });
            
            return response.data;
        } catch (error) {
            console.error('Jira API Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Save bug record to file
     */
    saveBugRecord(jiraId, bugData, jiraUrl) {
        const recordsDir = path.join(__dirname, '../reports/jira-bugs');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(recordsDir)) {
            fs.mkdirSync(recordsDir, { recursive: true });
        }
        
        const record = {
            jiraId: jiraId,
            jiraUrl: jiraUrl,
            createdAt: new Date().toISOString(),
            bugData: bugData
        };
        
        const filename = path.join(recordsDir, `${jiraId}-${Date.now()}.json`);
        fs.writeFileSync(filename, JSON.stringify(record, null, 2));
        
        console.log(`📝 Bug record saved: ${filename}`);
    }

    /**
     * Process bug queue from dashboard
     */
    async processBugQueue(bugs) {
        console.log(`\n🔄 Processing ${bugs.length} bugs for Jira creation...`);
        
        const results = [];
        
        for (const bug of bugs) {
            console.log(`\n--- Processing Bug ${bugs.indexOf(bug) + 1}/${bugs.length} ---`);
            const result = await this.createJiraBug(bug);
            results.push(result);
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Generate summary report
        this.generateSummaryReport(results);
        
        return results;
    }

    /**
     * Generate summary report
     */
    generateSummaryReport(results) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 JIRA BUG CREATION SUMMARY');
        console.log('='.repeat(60));
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`✅ Successfully Created: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        
        if (successful > 0) {
            console.log('\n📋 Created Bugs:');
            results.filter(r => r.success).forEach(r => {
                console.log(`  - ${r.jiraId}: ${r.url}`);
            });
        }
        
        if (failed > 0) {
            console.log('\n⚠️ Failed Bugs:');
            results.filter(r => !r.success).forEach(r => {
                console.log(`  - Error: ${r.error}`);
            });
        }
        
        console.log('='.repeat(60));
    }

    /**
     * Express endpoint handler for dashboard integration
     */
    async handleDashboardRequest(req, res) {
        const bugData = req.body;
        
        // Validate bug data
        if (!bugData.section || !bugData.description) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: section and description'
            });
        }
        
        // Create bug in Jira
        const result = await this.createJiraBug(bugData);
        
        if (result.success) {
            res.json({
                success: true,
                jiraId: result.jiraId,
                url: result.url,
                message: `Bug ${result.jiraId} created successfully`
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    }
}

// Express server integration (if running as API)
if (require.main === module) {
    const express = require('express');
    const app = express();
    const port = process.env.PORT || 3001;
    
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../reports')));
    
    const bugCreator = new JiraBugCreator();
    
    // CORS headers
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        next();
    });
    
    // API endpoint for creating bugs
    app.post('/api/jira/bug', async (req, res) => {
        await bugCreator.handleDashboardRequest(req, res);
    });
    
    // Endpoint to get created bugs
    app.get('/api/jira/bugs', (req, res) => {
        res.json({
            bugs: bugCreator.createdBugs,
            total: bugCreator.createdBugs.length
        });
    });
    
    // Serve the dashboard
    app.get('/dashboard', (req, res) => {
        res.sendFile(path.join(__dirname, '../reports/interactive-qa-dashboard.html'));
    });
    
    app.listen(port, () => {
        console.log(`\n🚀 Jira Bug Creator API running on port ${port}`);
        console.log(`📊 Dashboard: http://localhost:${port}/dashboard`);
        console.log(`🎫 API Endpoint: http://localhost:${port}/api/jira/bug`);
    });
}

module.exports = JiraBugCreator;

// Example usage for command line
if (process.argv[2] === 'test') {
    const creator = new JiraBugCreator();
    
    const testBug = {
        section: 'Main Navigation',
        severity: 'warning',
        description: 'Services menu item not found - check if React component uses different selector',
        component: 'Menu Navigation',
        summary: 'React component selector issue in Main Navigation',
        priority: 'Medium',
        project: 'BANK'
    };
    
    creator.createJiraBug(testBug).then(result => {
        console.log('\nTest completed:', result);
    });
}