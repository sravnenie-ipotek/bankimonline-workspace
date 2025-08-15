#!/usr/bin/env node

/**
 * WhatsApp Bug Notification Hook
 * 
 * Automatically sends WhatsApp messages when critical bugs are detected.
 * Integrates with Claude Code hooks system to trigger on:
 * - Test failures
 * - Jira bug creation
 * - System errors
 * - Critical application failures
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// WhatsApp Business API Configuration
const WHATSAPP_CONFIG = {
    // Option 1: WhatsApp Business API (Official)
    BUSINESS_API_TOKEN: process.env.WHATSAPP_BUSINESS_TOKEN || '',
    PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    
    // Option 2: Twilio WhatsApp API (Popular alternative)
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
    TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
    
    // Option 3: WhatsApp Web API (Unofficial but simpler)
    WHATSAPP_WEB_API_URL: process.env.WHATSAPP_WEB_API_URL || 'http://localhost:3000',
    
    // Recipients
    EMERGENCY_CONTACTS: (process.env.WHATSAPP_EMERGENCY_CONTACTS || '').split(',').filter(Boolean),
    DEFAULT_RECIPIENT: process.env.WHATSAPP_DEFAULT_RECIPIENT || '+972544123456' // Your number
};

// Bug severity levels
const SEVERITY_LEVELS = {
    CRITICAL: {
        emoji: '🚨',
        priority: 1,
        shouldNotify: true,
        contacts: 'all'
    },
    HIGH: {
        emoji: '⚠️',
        priority: 2,
        shouldNotify: true,
        contacts: 'primary'
    },
    MEDIUM: {
        emoji: '🔧',
        priority: 3,
        shouldNotify: false,
        contacts: 'primary'
    },
    LOW: {
        emoji: 'ℹ️',
        priority: 4,
        shouldNotify: false,
        contacts: 'none'
    }
};

/**
 * Determine bug severity based on content
 */
function analyzeBugSeverity(bugData) {
    const content = JSON.stringify(bugData).toLowerCase();
    
    // Critical indicators
    if (content.includes('critical') || 
        content.includes('production down') ||
        content.includes('financial calculation') ||
        content.includes('database connection failed') ||
        content.includes('security') ||
        content.includes('payment')) {
        return 'CRITICAL';
    }
    
    // High severity indicators
    if (content.includes('error') ||
        content.includes('failed') ||
        content.includes('broken') ||
        content.includes('crash')) {
        return 'HIGH';
    }
    
    // Medium severity
    if (content.includes('warning') ||
        content.includes('deprecated') ||
        content.includes('performance')) {
        return 'MEDIUM';
    }
    
    return 'LOW';
}

/**
 * Format WhatsApp message for bug notification
 */
function formatBugMessage(bugData, severity) {
    const severityInfo = SEVERITY_LEVELS[severity];
    const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Jerusalem',
        dateStyle: 'short',
        timeStyle: 'short'
    });
    
    let message = `${severityInfo.emoji} *BUG ALERT - ${severity}*\n\n`;
    
    if (bugData.issueKey) {
        message += `🎯 *Jira Ticket:* ${bugData.issueKey}\n`;
        message += `🔗 *Link:* https://bankimonline.atlassian.net/browse/${bugData.issueKey}\n\n`;
    }
    
    if (bugData.summary) {
        message += `📝 *Summary:*\n${bugData.summary}\n\n`;
    }
    
    if (bugData.files && bugData.files.length > 0) {
        message += `📂 *Affected Files:*\n`;
        bugData.files.slice(0, 3).forEach(file => {
            message += `• ${file}\n`;
        });
        if (bugData.files.length > 3) {
            message += `• ... and ${bugData.files.length - 3} more files\n`;
        }
        message += '\n';
    }
    
    if (bugData.errors && bugData.errors.length > 0) {
        message += `❌ *Key Errors:*\n`;
        bugData.errors.slice(0, 2).forEach(error => {
            message += `• ${error.substring(0, 80)}...\n`;
        });
        message += '\n';
    }
    
    if (bugData.impact) {
        message += `💥 *Impact:* ${bugData.impact}\n\n`;
    }
    
    message += `⏰ *Detected:* ${timestamp}\n`;
    message += `🏠 *Environment:* ${process.env.NODE_ENV || 'development'}\n`;
    
    if (severity === 'CRITICAL') {
        message += `\n🚨 *IMMEDIATE ACTION REQUIRED* 🚨`;
    }
    
    return message;
}

/**
 * Send WhatsApp message using Business API
 */
async function sendViaBusinessAPI(message, phoneNumber) {
    if (!WHATSAPP_CONFIG.BUSINESS_API_TOKEN || !WHATSAPP_CONFIG.PHONE_NUMBER_ID) {
        throw new Error('WhatsApp Business API credentials not configured');
    }
    
    const response = await axios.post(
        `https://graph.facebook.com/v18.0/${WHATSAPP_CONFIG.PHONE_NUMBER_ID}/messages`,
        {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: { body: message }
        },
        {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_CONFIG.BUSINESS_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    return response.data;
}

/**
 * Send WhatsApp message using Twilio
 */
async function sendViaTwilio(message, phoneNumber) {
    if (!WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID || !WHATSAPP_CONFIG.TWILIO_AUTH_TOKEN) {
        throw new Error('Twilio credentials not configured');
    }
    
    const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID}/Messages.json`,
        new URLSearchParams({
            From: WHATSAPP_CONFIG.TWILIO_WHATSAPP_FROM,
            To: `whatsapp:${phoneNumber}`,
            Body: message
        }),
        {
            auth: {
                username: WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID,
                password: WHATSAPP_CONFIG.TWILIO_AUTH_TOKEN
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    
    return response.data;
}

/**
 * Send WhatsApp message using Web API (unofficial)
 */
async function sendViaWebAPI(message, phoneNumber) {
    if (!WHATSAPP_CONFIG.WHATSAPP_WEB_API_URL) {
        throw new Error('WhatsApp Web API URL not configured');
    }
    
    const response = await axios.post(
        `${WHATSAPP_CONFIG.WHATSAPP_WEB_API_URL}/send-message`,
        {
            phone: phoneNumber,
            message: message
        }
    );
    
    return response.data;
}

/**
 * Main function to send WhatsApp notification
 */
async function sendWhatsAppNotification(bugData) {
    try {
        const severity = analyzeBugSeverity(bugData);
        const severityConfig = SEVERITY_LEVELS[severity];
        
        // Check if we should notify for this severity
        if (!severityConfig.shouldNotify) {
            console.log(`📱 Skipping WhatsApp notification for ${severity} severity bug`);
            return { skipped: true, reason: 'Low severity' };
        }
        
        const message = formatBugMessage(bugData, severity);
        
        // Determine recipients
        let recipients = [];
        if (severityConfig.contacts === 'all' && WHATSAPP_CONFIG.EMERGENCY_CONTACTS.length > 0) {
            recipients = WHATSAPP_CONFIG.EMERGENCY_CONTACTS;
        } else if (WHATSAPP_CONFIG.DEFAULT_RECIPIENT) {
            recipients = [WHATSAPP_CONFIG.DEFAULT_RECIPIENT];
        } else {
            throw new Error('No WhatsApp recipients configured');
        }
        
        console.log(`📱 Sending ${severity} bug notification to ${recipients.length} recipient(s)...`);
        
        const results = [];
        
        for (const phoneNumber of recipients) {
            try {
                let result;
                
                // Try different APIs in order of preference
                if (WHATSAPP_CONFIG.BUSINESS_API_TOKEN) {
                    result = await sendViaBusinessAPI(message, phoneNumber);
                    console.log(`✅ Sent via Business API to ${phoneNumber}`);
                } else if (WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID) {
                    result = await sendViaTwilio(message, phoneNumber);
                    console.log(`✅ Sent via Twilio to ${phoneNumber}`);
                } else if (WHATSAPP_CONFIG.WHATSAPP_WEB_API_URL) {
                    result = await sendViaWebAPI(message, phoneNumber);
                    console.log(`✅ Sent via Web API to ${phoneNumber}`);
                } else {
                    throw new Error('No WhatsApp API configured');
                }
                
                results.push({ phoneNumber, success: true, result });
                
            } catch (error) {
                console.error(`❌ Failed to send to ${phoneNumber}:`, error.message);
                results.push({ phoneNumber, success: false, error: error.message });
            }
        }
        
        // Log notification
        const logEntry = {
            timestamp: new Date().toISOString(),
            severity,
            bugData: bugData,
            recipients: recipients.length,
            success: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        };
        
        fs.appendFileSync(
            path.join(__dirname, 'whatsapp-notifications.log'),
            JSON.stringify(logEntry) + '\n'
        );
        
        return {
            severity,
            message,
            results,
            successCount: results.filter(r => r.success).length,
            totalRecipients: recipients.length
        };
        
    } catch (error) {
        console.error('❌ WhatsApp notification failed:', error.message);
        return { error: error.message };
    }
}

/**
 * Parse command line arguments or stdin for bug data
 */
function parseBugData() {
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Bug data passed as command line argument
        try {
            return JSON.parse(args[0]);
        } catch (e) {
            // Treat as simple message
            return { summary: args.join(' ') };
        }
    }
    
    // Try to read from stdin
    if (process.stdin.isTTY) {
        console.error('❌ No bug data provided. Usage:');
        console.error('  node whatsapp-bug-notification.js \'{"summary": "Bug description"}\'');
        console.error('  echo \'{"issueKey": "TVKC-44"}\' | node whatsapp-bug-notification.js');
        process.exit(1);
    }
    
    // Read from stdin
    return new Promise((resolve) => {
        let data = '';
        process.stdin.on('data', chunk => data += chunk);
        process.stdin.on('end', () => {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                resolve({ summary: data.trim() });
            }
        });
    });
}

// Main execution
if (require.main === module) {
    (async () => {
        try {
            const bugData = await parseBugData();
            const result = await sendWhatsAppNotification(bugData);
            
            if (result.error) {
                console.error('❌ Notification failed:', result.error);
                process.exit(1);
            } else if (result.skipped) {
                console.log('📱 Notification skipped:', result.reason);
            } else {
                console.log(`📱 WhatsApp notification sent successfully!`);
                console.log(`   Severity: ${result.severity}`);
                console.log(`   Recipients: ${result.successCount}/${result.totalRecipients}`);
            }
            
        } catch (error) {
            console.error('❌ Hook execution failed:', error.message);
            process.exit(1);
        }
    })();
}

module.exports = { sendWhatsAppNotification, analyzeBugSeverity, formatBugMessage };