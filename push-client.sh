#!/bin/bash
echo "🚀 Pushing to CLIENT repository (bankDev2_standalone)..."

# Switch to client-only branch
git checkout client-only

# Add all changes
git add .

# Commit with message
if [ -z "$1" ]; then
    echo "❌ Error: Commit message required"
    echo "Usage: ./push-client.sh \"Your commit message\""
    exit 1
fi

git commit -m "$1"

# Push to client repository
git push origin client-only

echo "✅ Successfully pushed to CLIENT repository"
echo "🌐 Repository: https://github.com/MichaelMishaev/bankDev2_standalone" 