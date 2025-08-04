#!/bin/bash

echo "🚀 Starting Railway build process..."

# Set production environment variables
export NODE_ENV=production
export VITE_NODE_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf node_modules/.cache
rm -rf mainapp/node_modules/.cache
rm -rf mainapp/build
rm -rf mainapp/dist

# Install root dependencies (server)
echo "📦 Installing server dependencies..."
npm ci --prefer-offline --no-audit || exit 1

# Check if mainapp directory exists
if [ -d "mainapp" ]; then
    # Navigate to mainapp and install dependencies
    echo "📦 Installing frontend dependencies..."
    cd mainapp || exit 1
    npm ci --prefer-offline --no-audit || exit 1

    # Clean any existing build artifacts
    echo "🧹 Cleaning frontend build artifacts..."
    rm -rf build dist node_modules/.vite

    # Build frontend app with production settings
    echo "🏗️ Building frontend application..."
    NODE_ENV=production npm run build || exit 1

    cd ..
    echo "✅ Frontend build completed!"
else
    echo "⚠️ No mainapp directory found, skipping frontend build"
fi

# Verify build artifacts
if [ -d "mainapp/build" ] || [ -d "mainapp/dist" ]; then
    echo "✅ Build artifacts verified!"
else
    echo "⚠️ No build artifacts found - frontend may not have been built"
fi

echo "✅ Railway build process completed successfully!" 