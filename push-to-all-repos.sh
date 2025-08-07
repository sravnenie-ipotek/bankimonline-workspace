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

# Push to workspace repository (origin)
echo "📤 Pushing to workspace repository (bankimonline-workspace)..."
git push workspace main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to workspace repository"
else
    echo "❌ Failed to push to workspace repository"
fi

# Push to web repository 
echo "📤 Pushing to web repository (bankimonline-web)..."
git push web main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to web repository"
else
    echo "❌ Failed to push to web repository"
fi

# Push to API repository
echo "📤 Pushing to API repository (bankimonline-api)..."
git push api main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to API repository"
else
    echo "❌ Failed to push to API repository"
fi

# Push to shared documents repository
echo "📤 Pushing to shared documents repository (bankimonline-shared)..."
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
echo "🏠 Workspace: https://github.com/sravnenie-ipotek/bankimonline-workspace"
echo "🌐 Web: https://github.com/sravnenie-ipotek/bankimonline-web"
echo "🔧 API: https://github.com/sravnenie-ipotek/bankimonline-api"
echo "📚 Shared: https://github.com/sravnenie-ipotek/bankimonline-shared"
echo ""
echo "💡 To check status: git remote -v"