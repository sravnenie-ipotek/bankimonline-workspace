#!/usr/bin/env node

/**
 * JIRA Integration for QA Automation
 * Creates bug reports automatically from test failures
 */

const fs = require('fs').promises;
const path = require('path');

// JIRA Mock Server Configuration
const JIRA_CONFIG = {
    baseUrl: 'http://localhost:3000',
    project: 'BANK',
    issueType: 'Bug',
    priority: {
        critical: 'Highest',
        major: 'High', 
        minor: 'Medium',
        trivial: 'Low'
    }
};

class JIRAIntegration {
    constructor() {
        this.issues = [];
        this.startTime = new Date();
    }

    async testConnection() {
        try {
            console.log('🔗 Testing JIRA Connection...');
            const response = await fetch(`${JIRA_CONFIG.baseUrl}/api/health`);
            if (response.ok) {
                console.log('✅ JIRA Server Connected');
                return true;
            } else {
                console.log('⚠️ JIRA Server responded with:', response.status);
                return false;
            }
        } catch (error) {
            console.log('❌ JIRA Server Connection Failed:', error.message);
            return false;
        }
    }

    async createBugReport(testFailure) {
        const bug = {
            id: `BANK-${Date.now()}`,
            summary: this.generateSummary(testFailure),
            description: this.generateDescription(testFailure),
            priority: this.determinePriority(testFailure),
            labels: this.generateLabels(testFailure),
            assignee: 'auto-qa-system',
            reporter: 'QA Automation',
            created: new Date().toISOString(),
            screenshot: testFailure.screenshot || null,
            environment: testFailure.environment || 'Production'
        };

        this.issues.push(bug);
        console.log(`🐛 Bug Created: ${bug.id} - ${bug.summary}`);
        return bug;
    }

    generateSummary(failure) {
        const category = failure.category || 'General';
        const page = failure.page || 'Unknown Page';
        const issue = failure.issue || 'Test Failure';
        
        return `[${category}] ${issue} on ${page}`;
    }

    generateDescription(failure) {
        let description = `**Test Failure Report**\n\n`;
        description += `**Category:** ${failure.category}\n`;
        description += `**Page:** ${failure.page}\n`;
        description += `**Issue:** ${failure.issue}\n`;
        description += `**Severity:** ${failure.severity || 'Medium'}\n\n`;
        
        description += `**Details:**\n${failure.details || 'No additional details'}\n\n`;
        
        if (failure.steps) {
            description += `**Steps to Reproduce:**\n`;
            failure.steps.forEach((step, index) => {
                description += `${index + 1}. ${step}\n`;
            });
            description += '\n';
        }
        
        if (failure.expected) {
            description += `**Expected Result:** ${failure.expected}\n`;
        }
        
        if (failure.actual) {
            description += `**Actual Result:** ${failure.actual}\n`;
        }
        
        description += `\n**Browser:** ${failure.browser || 'Chrome'}\n`;
        description += `**Viewport:** ${failure.viewport || 'Desktop'}\n`;
        description += `**Timestamp:** ${new Date().toISOString()}\n\n`;
        
        description += `*🤖 Generated automatically by QA Automation System*`;
        
        return description;
    }

    determinePriority(failure) {
        const severity = failure.severity?.toLowerCase();
        const category = failure.category?.toLowerCase();
        
        if (severity === 'critical' || category === 'javascript errors') {
            return JIRA_CONFIG.priority.critical;
        } else if (severity === 'major' || category === 'accessibility') {
            return JIRA_CONFIG.priority.major;
        } else if (severity === 'minor' || category === 'responsive') {
            return JIRA_CONFIG.priority.minor;
        } else {
            return JIRA_CONFIG.priority.trivial;
        }
    }

    generateLabels(failure) {
        const labels = ['automation', 'qa'];
        
        if (failure.category) {
            labels.push(failure.category.toLowerCase().replace(/\s+/g, '-'));
        }
        
        if (failure.browser) {
            labels.push(failure.browser.toLowerCase());
        }
        
        if (failure.viewport) {
            labels.push(`viewport-${failure.viewport.toLowerCase()}`);
        }
        
        return labels;
    }

    async generateBugReport() {
        const report = {
            summary: {
                totalIssues: this.issues.length,
                criticalIssues: this.issues.filter(i => i.priority === JIRA_CONFIG.priority.critical).length,
                majorIssues: this.issues.filter(i => i.priority === JIRA_CONFIG.priority.major).length,
                minorIssues: this.issues.filter(i => i.priority === JIRA_CONFIG.priority.minor).length,
                executionTime: new Date() - this.startTime,
                timestamp: new Date().toISOString()
            },
            issues: this.issues,
            metadata: {
                generatedBy: 'QA Automation System v2.0',
                jiraConfig: JIRA_CONFIG,
                environment: 'Production'
            }
        };

        const reportPath = path.join(__dirname, 'jira-bug-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`\n📊 JIRA Bug Report Generated:`);
        console.log(`   Total Issues: ${report.summary.totalIssues}`);
        console.log(`   Critical: ${report.summary.criticalIssues}`);
        console.log(`   Major: ${report.summary.majorIssues}`);
        console.log(`   Minor: ${report.summary.minorIssues}`);
        console.log(`   Report saved to: ${reportPath}`);
        
        return report;
    }

    async generateHTMLReport() {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Automation - JIRA Bug Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2196F3, #21CBF3); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2.5em; font-weight: bold; margin-bottom: 5px; }
        .critical { color: #f44336; }
        .major { color: #ff9800; }
        .minor { color: #2196f3; }
        .total { color: #4caf50; }
        .issues-grid { display: grid; gap: 20px; }
        .issue-card { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .issue-header { padding: 20px; border-left: 5px solid; }
        .issue-header.critical { border-left-color: #f44336; background: #ffebee; }
        .issue-header.major { border-left-color: #ff9800; background: #fff3e0; }
        .issue-header.minor { border-left-color: #2196f3; background: #e3f2fd; }
        .issue-title { font-size: 1.3em; font-weight: bold; margin-bottom: 10px; }
        .issue-meta { display: flex; gap: 15px; font-size: 0.9em; color: #666; }
        .issue-body { padding: 20px; }
        .issue-description { line-height: 1.6; margin-bottom: 15px; }
        .labels { display: flex; gap: 5px; flex-wrap: wrap; }
        .label { background: #e0e0e0; padding: 4px 8px; border-radius: 15px; font-size: 0.8em; }
        .jira-btn { background: #0052cc; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 15px; }
        .jira-btn:hover { background: #0041a8; }
        .footer { text-align: center; margin-top: 40px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐛 QA Automation - JIRA Bug Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number total">${this.issues.length}</div>
                <div>Total Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-number critical">${this.issues.filter(i => i.priority === JIRA_CONFIG.priority.critical).length}</div>
                <div>Critical</div>
            </div>
            <div class="stat-card">
                <div class="stat-number major">${this.issues.filter(i => i.priority === JIRA_CONFIG.priority.major).length}</div>
                <div>Major</div>
            </div>
            <div class="stat-card">
                <div class="stat-number minor">${this.issues.filter(i => i.priority === JIRA_CONFIG.priority.minor).length}</div>
                <div>Minor</div>
            </div>
        </div>

        <div class="issues-grid">
            ${this.issues.map(issue => `
                <div class="issue-card">
                    <div class="issue-header ${issue.priority.toLowerCase()}">
                        <div class="issue-title">${issue.summary}</div>
                        <div class="issue-meta">
                            <span>🆔 ${issue.id}</span>
                            <span>⚡ ${issue.priority}</span>
                            <span>📅 ${new Date(issue.created).toLocaleDateString()}</span>
                            <span>🌍 ${issue.environment}</span>
                        </div>
                    </div>
                    <div class="issue-body">
                        <div class="issue-description">${issue.description.replace(/\n/g, '<br>')}</div>
                        <div class="labels">
                            ${issue.labels.map(label => `<span class="label">${label}</span>`).join('')}
                        </div>
                        <button class="jira-btn" onclick="openInJIRA('${issue.id}')">
                            📝 Create in JIRA
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="footer">
            <p>🤖 Generated by QA Automation System v2.0 | JIRA Integration Active</p>
        </div>
    </div>

    <script>
        function openInJIRA(issueId) {
            // In a real implementation, this would make an API call to create the JIRA issue
            alert('Creating JIRA issue: ' + issueId + '\\n\\nThis would integrate with your actual JIRA instance.');
            
            // Mock JIRA creation
            fetch('/api/jira/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ issueId: issueId })
            }).then(response => {
                if (response.ok) {
                    alert('✅ Issue created in JIRA successfully!');
                } else {
                    alert('❌ Failed to create issue in JIRA');
                }
            }).catch(error => {
                console.log('JIRA integration demo - issue would be created:', issueId);
            });
        }
    </script>
</body>
</html>`;
        
        const htmlPath = path.join(__dirname, 'jira-bug-report.html');
        await fs.writeFile(htmlPath, html);
        console.log(`📄 HTML Report saved to: ${htmlPath}`);
        
        return htmlPath;
    }
}

// Example usage for testing
async function testJIRAIntegration() {
    const jira = new JIRAIntegration();
    
    // Test connection
    await jira.testConnection();
    
    // Create sample bug reports
    const sampleFailures = [
        {
            category: 'JavaScript Errors',
            page: 'Homepage',
            issue: '3 console errors detected',
            severity: 'critical',
            details: 'Multiple JavaScript errors found on homepage affecting functionality',
            steps: [
                'Navigate to homepage',
                'Open browser console',
                'Observe error messages'
            ],
            expected: 'No JavaScript errors',
            actual: '3 errors in console',
            browser: 'Chrome',
            viewport: 'Desktop'
        },
        {
            category: 'Accessibility',
            page: 'Mortgage Calculator',
            issue: '16/24 images missing alt text',
            severity: 'major',
            details: 'Images lack proper alt text attributes for screen readers',
            browser: 'Firefox',
            viewport: 'Mobile'
        },
        {
            category: 'Responsive Design',
            page: 'Credit Calculator',
            issue: 'Horizontal scroll on mobile',
            severity: 'minor',
            details: 'Page overflows horizontally on 320px viewport',
            browser: 'Safari',
            viewport: 'Mobile_XSmall'
        }
    ];
    
    for (const failure of sampleFailures) {
        await jira.createBugReport(failure);
    }
    
    // Generate reports
    await jira.generateBugReport();
    await jira.generateHTMLReport();
    
    return jira;
}

// Run test if executed directly
if (require.main === module) {
    testJIRAIntegration()
        .then(() => console.log('\n✅ JIRA Integration Test Complete!'))
        .catch(error => console.error('\n❌ JIRA Integration Error:', error));
}

module.exports = { JIRAIntegration, testJIRAIntegration };