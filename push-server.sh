#!/bin/bash
echo "🚀 Pushing to SERVER repository (bankimonlineapi)..."

# Switch to server-only branch
git checkout server-only

# Add all changes
git add .

# Commit with message
if [ -z "$1" ]; then
    echo "❌ Error: Commit message required"
    echo "Usage: ./push-server.sh \"Your commit message\""
    exit 1
fi

git commit -m "$1"

# Push to server repository
git push bankimonlineapi server-only

echo "✅ Successfully pushed to SERVER repository"
echo "🔧 Repository: https://github.com/MichaelMishaev/bankimonlineapi" 