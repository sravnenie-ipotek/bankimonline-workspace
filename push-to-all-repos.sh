#!/bin/bash

# Enhanced script to push to all three repositories
# Usage: ./push-to-all-repos.sh "Your commit message"

if [ -z "$1" ]; then
    echo "❌ Error: Commit message is required"
    echo "Usage: ./push-to-all-repos.sh \"Your commit message\""
    exit 1
fi

COMMIT_MSG="$1"

echo "🚀 Pushing to all BankIM repositories..."
echo "📝 Commit message: $COMMIT_MSG"
echo ""

# Add all changes
echo "📁 Adding all changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo "❌ Commit failed. Please check for errors."
    exit 1
fi

echo ""
echo "🔄 Pushing to repositories..."

# Push to main repository (origin)
echo "📤 Pushing to main repository (bankDev2_standalone)..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to main repository"
else
    echo "❌ Failed to push to main repository"
fi

# Push to API repository (bankimonlineapi)
echo "📤 Pushing to API repository (bankimonlineapi)..."
git push bankimonlineapi main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to API repository"
else
    echo "❌ Failed to push to API repository"
fi

# Push to shared documents repository
echo "📤 Pushing to shared documents repository (bankimonline_shared)..."
git push shared main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to shared documents repository"
else
    echo "❌ Failed to push to shared documents repository"
fi

echo ""
echo "🎉 Push operation completed!"
echo ""
echo "📊 Repository Status:"
echo "🏠 Main: https://github.com/MichaelMishaev/bankDev2_standalone"
echo "🔧 API: https://github.com/MichaelMishaev/bankimonlineapi"
echo "📚 Shared: https://github.com/MichaelMishaev/bankimonline_shared"
echo ""
echo "💡 To check status: git remote -v"