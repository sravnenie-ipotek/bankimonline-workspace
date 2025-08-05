#!/bin/bash

# Push to both GitHub repositories script
# This script ensures changes are pushed to both bankDev2_standalone and bankimonlineapi

echo "🚀 Pushing to both GitHub repositories..."

# Check if we have changes to commit
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Changes detected, committing first..."
    
    # Add all changes
    git add .
    
    # Get commit message from user or use default
    if [ -z "$1" ]; then
        echo "💬 Enter commit message (or press Enter for default):"
        read commit_message
        if [ -z "$commit_message" ]; then
            commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
        fi
    else
        commit_message="$1"
    fi
    
    # Commit changes
    git commit -m "$commit_message"
    echo "✅ Changes committed with message: '$commit_message'"
else
    echo "📋 No changes to commit, proceeding with push..."
fi

# Push to main repository (bankDev2_standalone)
echo "📤 Pushing to origin (bankDev2_standalone)..."
if git push origin main; then
    echo "✅ Successfully pushed to origin"
else
    echo "❌ Failed to push to origin"
    exit 1
fi

# Push to server repository (bankimonlineapi)
echo "📤 Pushing to bankimonlineapi..."
if git push bankimonlineapi main; then
    echo "✅ Successfully pushed to bankimonlineapi"
else
    echo "❌ Failed to push to bankimonlineapi"
    exit 1
fi

echo ""
echo "🎉 Successfully pushed to both repositories!"
echo "📊 Repository status:"
echo "   - bankDev2_standalone: https://github.com/MichaelMishaev/bankDev2_standalone"
echo "   - bankimonlineapi: https://github.com/MichaelMishaev/bankimonlineapi" 