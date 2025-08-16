#!/bin/bash

echo "🔧 JIRA INTEGRATION SETUP"
echo "========================"
echo ""

# Check if axios is installed
if ! npm list axios &>/dev/null; then
    echo "📦 Installing required packages..."
    npm install axios form-data
fi

# Check for existing credentials
if [ -z "$JIRA_EMAIL" ] || [ -z "$JIRA_API_TOKEN" ]; then
    echo "⚠️  JIRA credentials not found in environment"
    echo ""
    echo "📋 SETUP INSTRUCTIONS:"
    echo ""
    echo "1️⃣  Get your Jira API token:"
    echo "    Open: https://id.atlassian.com/manage-profile/security/api-tokens"
    echo "    Click 'Create API token'"
    echo "    Give it a name like 'QA Automation'"
    echo "    Copy the token"
    echo ""
    echo "2️⃣  Set your credentials (add to ~/.bashrc or ~/.zshrc):"
    echo ""
    echo "    export JIRA_EMAIL='your-email@company.com'"
    echo "    export JIRA_API_TOKEN='your-api-token-here'"
    echo ""
    echo "3️⃣  Or set them temporarily for this session:"
    read -p "    Enter your Jira email: " email
    read -s -p "    Enter your API token: " token
    echo ""
    
    export JIRA_EMAIL="$email"
    export JIRA_API_TOKEN="$token"
    
    echo ""
    echo "✅ Credentials set for this session"
fi

# Check project key
echo ""
echo "📌 Current configuration:"
echo "   Email: $JIRA_EMAIL"
echo "   Token: ${JIRA_API_TOKEN:0:10}..."
echo "   Project: BANKIM (update in create-jira-bug.js if different)"
echo ""

# Ask if user wants to create the bug now
read -p "🐛 Do you want to create the navigation bug in Jira now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating bug in Jira..."
    node create-jira-bug.js
else
    echo "You can create the bug later by running:"
    echo "  node create-jira-bug.js"
fi

echo ""
echo "✅ Setup complete!"