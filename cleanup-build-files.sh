#!/bin/bash

# Script to remove build files from git tracking
echo "🧹 Cleaning up build files from git..."

# Remove build directories from git tracking (keeps files locally)
git rm -r --cached mainapp/build/ 2>/dev/null || echo "mainapp/build/ not tracked"
git rm -r --cached packages/client/build/ 2>/dev/null || echo "packages/client/build/ not tracked"
git rm -r --cached build/ 2>/dev/null || echo "build/ not tracked"
git rm -r --cached dist/ 2>/dev/null || echo "dist/ not tracked"

# Add build directories to .gitignore
echo "" >> .gitignore
echo "# Build output (should never be committed)" >> .gitignore
echo "/build/" >> .gitignore
echo "/dist/" >> .gitignore
echo "/mainapp/build/" >> .gitignore
echo "/packages/client/build/" >> .gitignore
echo "*.js.map" >> .gitignore

echo "✅ Build files removed from tracking"
echo "📝 Updated .gitignore to exclude build files"
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Commit: git commit -m 'chore: remove build files from version control'"
echo "3. For production: Build during deployment, not in repository"