#!/bin/bash

# Deployment Verification Script
# Runs after deployment to ensure everything is working correctly

set -e

HOST=$1
EXPECTED_VERSION=$2

echo "🔍 Verifying deployment on $HOST..."

# 1. Check if the website is accessible
echo "✓ Checking website accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$HOST)
if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Website returned status $HTTP_STATUS"
    exit 1
fi

# 2. Check if API is healthy
echo "✓ Checking API health..."
if ! curl -sf https://$HOST/api/health > /dev/null; then
    echo "❌ API health check failed"
    exit 1
fi

# 3. Check if version was updated (skip for now as endpoint doesn't exist yet)
echo "✓ Skipping version check (endpoint not yet implemented)..."
DEPLOYED_VERSION="unknown"
if [ "$DEPLOYED_VERSION" == "$EXPECTED_VERSION" ]; then
    echo "✅ Version correctly updated to $DEPLOYED_VERSION"
else
    echo "⚠️ Version mismatch: Expected $EXPECTED_VERSION, got $DEPLOYED_VERSION"
fi

# 4. Check blue-green state
echo "✓ Checking blue-green deployment state..."
ssh root@$HOST << 'EOF'
    CURRENT=$(readlink /var/www/bankim/current | xargs basename)
    echo "   Current deployment: $CURRENT"
    
    # Check if PM2 process is running
    PM2_STATUS=$(pm2 list | grep bankim-api | grep online)
    if [ -z "$PM2_STATUS" ]; then
        echo "❌ PM2 process not running"
        exit 1
    fi
    
    # Check if nginx is serving correct folder
    NGINX_ROOT=$(nginx -T 2>/dev/null | grep "root.*bankim" | head -1)
    echo "   Nginx serving from: $NGINX_ROOT"
EOF

echo "✅ Deployment verification complete!"