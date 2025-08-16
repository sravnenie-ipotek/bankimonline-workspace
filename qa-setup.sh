#!/bin/bash

echo "🚀 Setting up Zero-Delay QA System"
echo "================================="

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Install required dependencies
echo "📦 Installing required packages..."
npm install --save-dev chokidar husky

# Initialize husky
echo "🔧 Setting up git hooks..."
npx husky install

# Make files executable
echo "🔐 Setting permissions..."
chmod +x .husky/pre-commit
chmod +x qa-watcher.js
chmod +x qa-dashboard-server.js
chmod +x qa-stats-generator.js

# Create initial stats file
echo "📊 Creating initial stats file..."
echo '{
  "passed": 0,
  "failed": 0,
  "filesChanged": 0,
  "lastRun": "Never",
  "recentLogs": []
}' > .qa-stats.json

# Create log file
echo "📝 Creating log file..."
touch .qa-results.log

# Add to .gitignore if not already there
echo "📋 Updating .gitignore..."
if ! grep -q ".qa-stats.json" .gitignore 2>/dev/null; then
    echo ".qa-stats.json" >> .gitignore
fi
if ! grep -q ".qa-results.log" .gitignore 2>/dev/null; then
    echo ".qa-results.log" >> .gitignore
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 How to use:"
echo "  1. Start test watcher:  npm run qa:watch"
echo "  2. Open dashboard:      npm run qa:dashboard"
echo "  3. Make code changes and watch tests run automatically!"
echo ""
echo "🎯 Features:"
echo "  • Zero delay - tests run in background"
echo "  • Smart test selection - only runs relevant tests"
echo "  • Low CPU priority - won't slow down development"
echo "  • Real-time dashboard - see results instantly"
echo ""
echo "💡 Tips:"
echo "  • Check .qa-results.log for detailed test failures"
echo "  • Dashboard runs at http://localhost:3456"
echo "  • All processes are cancellable with Ctrl+C"