#!/bin/bash

# WhatsApp Bug Notification Hook Setup
# This script configures Claude Code hooks to send WhatsApp messages when bugs are detected

echo "🚀 Setting up WhatsApp Bug Notification Hooks..."

# Create hooks directory if it doesn't exist
mkdir -p hooks

# Make the notification script executable
chmod +x hooks/whatsapp-bug-notification.js

# Create environment template
cat > .env.whatsapp.template << 'EOF'
# WhatsApp Notification Configuration
# Copy this to .env and fill in your credentials

# Option 1: WhatsApp Business API (Recommended for production)
# Get these from: https://developers.facebook.com/docs/whatsapp/business-platform
WHATSAPP_BUSINESS_TOKEN=your_business_api_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here

# Option 2: Twilio WhatsApp API (Easy to set up)
# Get these from: https://console.twilio.com/
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Option 3: WhatsApp Web API (Unofficial, for development)
# Set up a local WhatsApp Web API server
WHATSAPP_WEB_API_URL=http://localhost:3000

# Recipients
WHATSAPP_DEFAULT_RECIPIENT=+972544123456
WHATSAPP_EMERGENCY_CONTACTS=+972544123456,+972501234567

# Environment
NODE_ENV=development
EOF

# Create Claude Code settings for hooks
mkdir -p ~/.claude
cat > ~/.claude/settings.json << 'EOF'
{
  "hooks": {
    "user-prompt-submit": {
      "command": "hooks/whatsapp-bug-notification.js",
      "description": "Send WhatsApp notification for critical bugs",
      "trigger": "on_bug_detection"
    },
    "tool-error": {
      "command": "hooks/whatsapp-bug-notification.js",
      "description": "Notify on tool execution errors",
      "trigger": "on_error"
    }
  },
  "notifications": {
    "whatsapp": {
      "enabled": true,
      "severity_threshold": "HIGH"
    }
  }
}
EOF

# Create integration with Jira bug creation
cat > hooks/jira-whatsapp-integration.js << 'EOF'
#!/usr/bin/env node

/**
 * Jira-WhatsApp Integration Hook
 * Automatically sends WhatsApp when Jira bugs are created
 */

const { sendWhatsAppNotification } = require('./whatsapp-bug-notification');

// Listen for Jira bug creation events
function handleJiraBugCreation(issueData) {
    const bugData = {
        issueKey: issueData.key,
        summary: issueData.fields.summary,
        description: issueData.fields.description,
        priority: issueData.fields.priority?.name || 'Medium',
        assignee: issueData.fields.assignee?.displayName || 'Unassigned',
        reporter: issueData.fields.reporter?.displayName || 'System',
        created: issueData.fields.created,
        labels: issueData.fields.labels || [],
        impact: determineImpact(issueData),
        files: extractFileReferences(issueData.fields.description),
        errors: extractErrors(issueData.fields.description)
    };
    
    return sendWhatsAppNotification(bugData);
}

function determineImpact(issueData) {
    const summary = (issueData.fields.summary || '').toLowerCase();
    const description = (issueData.fields.description || '').toLowerCase();
    const content = summary + ' ' + description;
    
    if (content.includes('critical') || content.includes('production')) {
        return 'Production system affected - immediate attention required';
    } else if (content.includes('high') || content.includes('broken')) {
        return 'Core functionality affected - fix needed soon';
    } else {
        return 'Minor issue - address when convenient';
    }
}

function extractFileReferences(description) {
    if (!description) return [];
    
    const filePattern = /(?:[\w-]+\/)*[\w-]+\.(js|ts|tsx|jsx|py|java|css|scss|html|vue|php)/g;
    const matches = description.match(filePattern) || [];
    return [...new Set(matches)]; // Remove duplicates
}

function extractErrors(description) {
    if (!description) return [];
    
    const errorPatterns = [
        /Error: [^\\n]+/g,
        /TypeError: [^\\n]+/g,
        /ReferenceError: [^\\n]+/g,
        /SyntaxError: [^\\n]+/g
    ];
    
    const errors = [];
    errorPatterns.forEach(pattern => {
        const matches = description.match(pattern) || [];
        errors.push(...matches);
    });
    
    return errors;
}

// Export for use as module
module.exports = { handleJiraBugCreation };

// Command line usage
if (require.main === module) {
    const issueData = JSON.parse(process.argv[2] || '{}');
    handleJiraBugCreation(issueData)
        .then(result => {
            console.log('WhatsApp notification result:', result);
        })
        .catch(error => {
            console.error('WhatsApp notification failed:', error);
            process.exit(1);
        });
}
EOF

chmod +x hooks/jira-whatsapp-integration.js

# Create test script
cat > hooks/test-whatsapp-notification.js << 'EOF'
#!/usr/bin/env node

/**
 * Test WhatsApp notification system
 */

const { sendWhatsAppNotification } = require('./whatsapp-bug-notification');

async function runTests() {
    console.log('🧪 Testing WhatsApp Bug Notification System...\n');
    
    // Test 1: Critical bug
    console.log('📱 Test 1: Critical Bug Notification');
    const criticalBug = {
        issueKey: 'TVKC-TEST-1',
        summary: 'CRITICAL: Financial calculation system corrupted',
        files: ['src/utils/calculatePayment.ts', 'src/services/bankingAPI.ts'],
        errors: ['TypeError: Cannot read property calculatePayment of undefined'],
        impact: 'All mortgage calculations returning incorrect values'
    };
    
    try {
        const result1 = await sendWhatsAppNotification(criticalBug);
        console.log('✅ Critical bug notification:', result1.successCount > 0 ? 'SUCCESS' : 'FAILED');
    } catch (error) {
        console.log('❌ Critical bug notification FAILED:', error.message);
    }
    
    console.log();
    
    // Test 2: Low severity bug (should be skipped)
    console.log('📱 Test 2: Low Severity Bug (should skip)');
    const lowBug = {
        summary: 'Minor UI alignment issue in footer',
        impact: 'Cosmetic issue only'
    };
    
    try {
        const result2 = await sendWhatsAppNotification(lowBug);
        console.log('✅ Low severity notification:', result2.skipped ? 'CORRECTLY SKIPPED' : 'SENT');
    } catch (error) {
        console.log('❌ Low severity test FAILED:', error.message);
    }
    
    console.log('\n🎉 WhatsApp notification tests completed!');
}

runTests().catch(console.error);
EOF

chmod +x hooks/test-whatsapp-notification.js

echo "✅ WhatsApp Bug Notification Hooks setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.whatsapp.template to .env and configure your WhatsApp API credentials"
echo "2. Choose your WhatsApp API provider:"
echo "   - WhatsApp Business API (recommended for production)"
echo "   - Twilio WhatsApp API (easiest to set up)"
echo "   - WhatsApp Web API (for development/testing)"
echo "3. Test the setup: npm run test:whatsapp-hooks"
echo "4. Configure Claude Code hooks in ~/.claude/settings.json"
echo ""
echo "🔗 API Setup Guides:"
echo "- WhatsApp Business: https://developers.facebook.com/docs/whatsapp/business-platform"
echo "- Twilio WhatsApp: https://console.twilio.com/"
echo "- WhatsApp Web API: https://github.com/pedroslopez/whatsapp-web.js"