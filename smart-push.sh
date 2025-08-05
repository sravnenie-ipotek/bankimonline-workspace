#!/bin/bash
echo "🧠 Smart Push - Detecting changes and pushing to correct repositories..."
echo ""

# Check what files have changed
CHANGED_FILES=$(git diff --name-only HEAD~1 2>/dev/null || git diff --name-only)

if [ -z "$CHANGED_FILES" ]; then
    echo "❌ No changes detected"
    exit 1
fi

echo "📁 Changed files:"
echo "$CHANGED_FILES"
echo ""

# Detect client changes
CLIENT_CHANGES=$(echo "$CHANGED_FILES" | grep -E "(mainapp/|public/|css/|locales/|translations/|js/|types/)" || true)

# Detect server changes  
SERVER_CHANGES=$(echo "$CHANGED_FILES" | grep -E "(server/|server-db\.js|migrations/|\.env)" || true)

# Detect shared changes
SHARED_CHANGES=$(echo "$CHANGED_FILES" | grep -E "packages/shared/" || true)

echo "🔍 Analysis:"
if [ ! -z "$CLIENT_CHANGES" ]; then
    echo "✅ Client changes detected"
fi
if [ ! -z "$SERVER_CHANGES" ]; then
    echo "✅ Server changes detected"
fi  
if [ ! -z "$SHARED_CHANGES" ]; then
    echo "✅ Shared changes detected"
fi

# Push to appropriate repositories
if [ ! -z "$CLIENT_CHANGES" ]; then
    echo ""
    echo "🚀 Pushing CLIENT changes..."
    ./push-client.sh "$1"
fi

if [ ! -z "$SERVER_CHANGES" ]; then
    echo ""
    echo "🚀 Pushing SERVER changes..."
    ./push-server.sh "$1"
fi

if [ ! -z "$SHARED_CHANGES" ]; then
    echo ""
    echo "🚀 Pushing SHARED changes..."
    ./push-shared.sh "$1"
fi

echo ""
echo "🎉 Smart push completed!" 