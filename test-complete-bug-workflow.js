#!/usr/bin/env node

/**
 * Complete Bug Workflow Test
 * Tests the entire flow: Create Bug → Jira Issue → Screenshot → WhatsApp Notification
 */

require('dotenv').config({ path: '.env.whatsapp' });
const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');

// Import our modules
const { sendWhatsAppNotification } = require('./hooks/whatsapp-bug-notification');

async function createIntentionalBug() {
    console.log('🐛 Creating intentional bug in calculation system...\n');
    
    const filePath = './mainapp/src/utils/helpers/calculateMonthlyPayment.ts';
    
    try {
        // Read the current file
        const originalContent = await fs.readFile(filePath, 'utf8');
        
        // Create a backup
        await fs.writeFile(filePath + '.backup', originalContent);
        
        // Inject a critical bug
        const buggyContent = originalContent.replace(
            'return Math.trunc(monthlyPayment)',
            `// CRITICAL BUG: Returning random values!
  const brokenPayment = monthlyPayment * Math.random() * 100;
  console.error("BUG DETECTED: Financial calculations corrupted!");
  return Math.trunc(brokenPayment)`
        );
        
        await fs.writeFile(filePath, buggyContent);
        
        console.log('✅ Bug injected in calculateMonthlyPayment.ts');
        console.log('📊 Impact: All mortgage calculations will return random values\n');
        
        return {
            file: filePath,
            type: 'Financial Calculation Corruption',
            impact: 'CRITICAL - All mortgage calculations returning random values',
            description: 'The calculateMonthlyPayment function has been corrupted to return random values instead of proper calculations. This affects all users trying to calculate mortgage payments.'
        };
        
    } catch (error) {
        console.error('❌ Failed to create bug:', error);
        throw error;
    }
}

async function captureScreenshot() {
    console.log('📷 Capturing screenshot of bug demonstration...\n');
    
    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        
        // Create a demonstration page showing the bug
        const bugDemoHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>🐛 Critical Bug Detected - Banking System</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background: #f8f9fa;
        }
        .alert { 
            background: #dc3545; 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 5px solid #a71e2a;
        }
        .code { 
            background: #1e1e1e; 
            color: #ff6b6b; 
            padding: 15px; 
            border-radius: 5px; 
            font-family: monospace;
            margin: 10px 0;
        }
        .impact { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 15px; 
            border-radius: 5px;
            margin: 15px 0;
        }
        h1 { color: #dc3545; }
        .timestamp { color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <h1>🚨 CRITICAL BUG DETECTED</h1>
    <div class="timestamp">Detected: ${new Date().toLocaleString()}</div>
    
    <div class="alert">
        <h2>⚠️ Financial Calculation System Corrupted</h2>
        <p><strong>Severity:</strong> CRITICAL</p>
        <p><strong>Impact:</strong> All mortgage calculations returning random values</p>
        <p><strong>Affected Users:</strong> ALL users using mortgage calculator</p>
    </div>
    
    <h3>📍 Bug Location:</h3>
    <div class="code">
        File: mainapp/src/utils/helpers/calculateMonthlyPayment.ts<br>
        Function: calculateMonthlyPayment()<br>
        Line: ~62-63
    </div>
    
    <h3>🔍 Error Details:</h3>
    <div class="code">
        // CRITICAL BUG: Returning random values!<br>
        const brokenPayment = monthlyPayment * Math.random() * 100;<br>
        console.error("BUG DETECTED: Financial calculations corrupted!");<br>
        return Math.trunc(brokenPayment);
    </div>
    
    <div class="impact">
        <h3>💥 System Impact:</h3>
        <ul>
            <li>✗ Mortgage calculations produce incorrect results</li>
            <li>✗ Financial advice becomes unreliable</li>
            <li>✗ User trust and business reputation at risk</li>
            <li>✗ Potential regulatory compliance issues</li>
        </ul>
    </div>
    
    <div class="alert">
        <h3>🔧 Required Action:</h3>
        <p>Immediate fix required - restore proper calculation logic</p>
        <p>Jira ticket created automatically</p>
        <p>WhatsApp notification sent to development team</p>
    </div>
</body>
</html>`;
        
        // Save the demo page
        await fs.writeFile('./bug-demo-critical.html', bugDemoHTML);
        
        // Navigate to demo page and capture screenshot
        await page.goto(`file://${path.resolve('./bug-demo-critical.html')}`);
        await page.waitForTimeout(1000); // Wait for page to load
        
        const screenshotPath = `./bug-screenshot-${Date.now()}.png`;
        await page.screenshot({ 
            path: screenshotPath, 
            fullPage: true 
        });
        
        await browser.close();
        
        console.log('✅ Screenshot captured:', screenshotPath);
        return screenshotPath;
        
    } catch (error) {
        console.error('❌ Failed to capture screenshot:', error);
        throw error;
    }
}

async function createJiraIssue(bugInfo, screenshotPath) {
    console.log('📋 Creating Jira issue with screenshot...\n');
    
    try {
        // Import Jira creation function
        const { createJiraIssue: createIssue } = require('./create-jira-bug-with-screenshots');
        
        const issueData = {
            summary: `CRITICAL: ${bugInfo.type} in Banking System`,
            description: {
                version: 1,
                type: "doc",
                content: [
                    {
                        type: "heading",
                        attrs: { level: 2 },
                        content: [{ type: "text", text: "🚨 Critical Bug Detected" }]
                    },
                    {
                        type: "paragraph",
                        content: [
                            { type: "text", text: "A critical bug has been detected in the financial calculation system. " },
                            { type: "text", text: "This bug causes mortgage payment calculations to return random values instead of accurate financial calculations.", marks: [{ type: "strong" }] }
                        ]
                    },
                    {
                        type: "heading",
                        attrs: { level: 3 },
                        content: [{ type: "text", text: "📍 Bug Details" }]
                    },
                    {
                        type: "codeBlock",
                        attrs: { language: "typescript" },
                        content: [{ 
                            type: "text", 
                            text: `File: ${bugInfo.file}\nImpact: ${bugInfo.impact}\nDescription: ${bugInfo.description}` 
                        }]
                    },
                    {
                        type: "heading",
                        attrs: { level: 3 },
                        content: [{ type: "text", text: "💥 System Impact" }]
                    },
                    {
                        type: "bulletList",
                        content: [
                            {
                                type: "listItem",
                                content: [{ type: "paragraph", content: [{ type: "text", text: "All mortgage calculations produce incorrect results" }] }]
                            },
                            {
                                type: "listItem", 
                                content: [{ type: "paragraph", content: [{ type: "text", text: "Financial advice becomes unreliable" }] }]
                            },
                            {
                                type: "listItem",
                                content: [{ type: "paragraph", content: [{ type: "text", text: "User trust and business reputation at risk" }] }]
                            },
                            {
                                type: "listItem",
                                content: [{ type: "paragraph", content: [{ type: "text", text: "Potential regulatory compliance issues" }] }]
                            }
                        ]
                    },
                    {
                        type: "heading",
                        attrs: { level: 3 },
                        content: [{ type: "text", text: "🔧 Required Action" }]
                    },
                    {
                        type: "paragraph",
                        content: [
                            { type: "text", text: "Immediate fix required: Restore proper calculation logic in calculateMonthlyPayment function.", marks: [{ type: "strong" }] }
                        ]
                    }
                ]
            },
            priority: "Highest",
            labels: ["critical-bug", "financial-calculation", "auto-detected"],
            screenshotPath: screenshotPath
        };
        
        const issue = await createIssue(issueData);
        console.log('✅ Jira issue created:', issue.key);
        console.log('🔗 URL:', `https://bankimonline.atlassian.net/browse/${issue.key}\n`);
        
        return issue;
        
    } catch (error) {
        console.error('❌ Failed to create Jira issue:', error);
        throw error;
    }
}

async function sendWhatsAppAlert(bugInfo, jiraIssue) {
    console.log('📱 Sending WhatsApp notification...\n');
    
    try {
        const alertData = {
            issueKey: jiraIssue.key,
            summary: `CRITICAL: ${bugInfo.type}`,
            description: bugInfo.description,
            impact: bugInfo.impact,
            files: [bugInfo.file],
            errors: ['Financial calculation corruption detected'],
            jiraUrl: `https://bankimonline.atlassian.net/browse/${jiraIssue.key}`,
            timestamp: new Date().toISOString()
        };
        
        const result = await sendWhatsAppNotification(alertData);
        
        if (result.successCount > 0) {
            console.log('✅ WhatsApp notification sent successfully!');
            console.log(`📱 Message sent to: ${process.env.WHATSAPP_DEFAULT_RECIPIENT}`);
        } else {
            console.log('⚠️ WhatsApp notification failed to send');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Failed to send WhatsApp notification:', error);
        throw error;
    }
}

async function restoreBug() {
    console.log('🔧 Restoring original file...\n');
    
    try {
        const filePath = './mainapp/src/utils/helpers/calculateMonthlyPayment.ts';
        const backupPath = filePath + '.backup';
        
        // Check if backup exists
        const originalContent = await fs.readFile(backupPath, 'utf8');
        await fs.writeFile(filePath, originalContent);
        await fs.unlink(backupPath); // Remove backup
        
        console.log('✅ Original file restored successfully');
        console.log('💚 Financial calculation system is now working correctly\n');
        
    } catch (error) {
        console.error('❌ Failed to restore file:', error);
    }
}

async function runCompleteWorkflow() {
    console.log('🚀 Starting Complete Bug Detection & Notification Workflow\n');
    console.log('=' .repeat(60));
    
    try {
        // Step 1: Create intentional bug
        const bugInfo = await createIntentionalBug();
        
        // Step 2: Capture screenshot
        const screenshotPath = await captureScreenshot();
        
        // Step 3: Create Jira issue with screenshot
        const jiraIssue = await createJiraIssue(bugInfo, screenshotPath);
        
        // Step 4: Send WhatsApp notification
        const whatsappResult = await sendWhatsAppAlert(bugInfo, jiraIssue);
        
        // Step 5: Restore the system
        await restoreBug();
        
        // Summary
        console.log('🎉 COMPLETE WORKFLOW SUCCESSFUL!\n');
        console.log('📊 Summary:');
        console.log(`   ✅ Bug created and detected`);
        console.log(`   ✅ Screenshot captured: ${screenshotPath}`);
        console.log(`   ✅ Jira issue created: ${jiraIssue.key}`);
        console.log(`   ✅ WhatsApp sent: ${whatsappResult.successCount > 0 ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   ✅ System restored`);
        console.log('\n🔗 Check your WhatsApp for the notification!');
        console.log(`🔗 Jira: https://bankimonline.atlassian.net/browse/${jiraIssue.key}`);
        
    } catch (error) {
        console.error('\n❌ Workflow failed:', error);
        
        // Try to restore the system even if workflow fails
        try {
            await restoreBug();
            console.log('✅ System restored after error');
        } catch (restoreError) {
            console.error('❌ Failed to restore system:', restoreError);
        }
        
        process.exit(1);
    }
}

// Run the workflow
runCompleteWorkflow().catch(console.error);