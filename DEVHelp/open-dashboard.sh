#!/bin/bash

echo "🎯 YouTrack Reports Dashboard Launcher"
echo "======================================"

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "🐍 Starting dashboard server..."
    cd "$(dirname "$0")"
    python3 run-dashboard.py
else
    echo "⚠️  Python3 not found. Opening dashboard directly..."
    open youtrack-reports-dashboard.html
fi