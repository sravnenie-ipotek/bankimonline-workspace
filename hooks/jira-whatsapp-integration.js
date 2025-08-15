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
