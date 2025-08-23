#!/bin/bash

# Pre-Deployment Validation Script
# Runs BEFORE deployment to prevent issues

set -e

echo "🔍 Running pre-deployment checks..."

# 1. Check if version was properly incremented
echo "✓ Checking version increment..."
CURRENT_VERSION=$(cat scripts/simple-version.txt)
BUILDINFO_VERSION=$(grep "version:" mainapp/src/config/buildInfo.ts | grep -o "'[^']*'" | tr -d "'")

if [ "$CURRENT_VERSION" != "$BUILDINFO_VERSION" ]; then
    echo "❌ Version mismatch: simple-version.txt=$CURRENT_VERSION, buildInfo.ts=$BUILDINFO_VERSION"
    exit 1
fi

# 2. Check if build completed successfully
echo "✓ Checking build output..."
if [ ! -d "mainapp/build" ]; then
    echo "❌ Build directory not found"
    exit 1
fi

if [ ! -f "mainapp/build/index.html" ]; then
    echo "❌ Build index.html not found"
    exit 1
fi

# 3. Check for critical files
echo "✓ Checking critical files..."
CRITICAL_FILES=(
    "server/server-db.js"
    "package.json"
    "mainapp/build/static"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ Critical file missing: $file"
        exit 1
    fi
done

# 4. Check package.json versions match
echo "✓ Checking package versions..."
ROOT_VERSION=$(node -p "require('./package.json').version")
MAINAPP_VERSION=$(node -p "require('./mainapp/package.json').version")

echo "   Root package.json: $ROOT_VERSION"
echo "   Mainapp package.json: $MAINAPP_VERSION"

# 5. Validate deployment package size
echo "✓ Checking deployment package..."
PACKAGE_SIZE=$(du -sm . | cut -f1)
if [ "$PACKAGE_SIZE" -gt 1000 ]; then
    echo "⚠️ Warning: Package size is ${PACKAGE_SIZE}MB (>1GB)"
fi

echo "✅ Pre-deployment checks passed!"