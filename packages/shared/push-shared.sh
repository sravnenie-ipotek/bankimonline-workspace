#!/bin/bash

# Script to push SHARED package to its dedicated repository
# Usage: ./push-shared.sh "Your commit message"

if [ -z "$1" ]; then
    echo "❌ Error: Commit message is required"
    echo "Usage: ./push-shared.sh \"Your commit message\""
    exit 1
fi

COMMIT_MSG="$1"

echo "🚀 Pushing SHARED package to dedicated repository..."
echo "📝 Commit message: $COMMIT_MSG"
echo ""

# Navigate to shared package directory
cd "$(dirname "$0")"

# Add all changes
echo "📁 Adding all changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

if [ $? -ne 0 ]; then
    echo "ℹ️  No changes to commit or commit failed"
fi

echo ""
echo "🔄 Pushing to SHARED repository..."

# Push to shared repository
echo "📤 Pushing to bankimonline_shared repository..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to SHARED repository"
else
    echo "❌ Failed to push to SHARED repository"
    exit 1
fi

echo ""
echo "🎉 SHARED package push completed!"
echo ""
echo "📊 Repository Status:"
echo "📚 SHARED: https://github.com/MichaelMishaev/bankimonline_shared"
echo ""
echo "💡 SHARED package contains:"
echo "   • Translation files (EN/HE/RU)"
echo "   • TypeScript types and interfaces"
echo "   • Banking constants and utilities"
echo "   • Shared calculation functions"