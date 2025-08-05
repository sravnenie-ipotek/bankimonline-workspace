#!/bin/bash

echo "🚀 Starting Railway build process..."

# Set production environment variables
export NODE_ENV=production
export VITE_NODE_ENV=production

# Install root dependencies
echo "📦 Installing root dependencies..."
npm ci || exit 1

# Navigate to mainapp and install dependencies
echo "📦 Installing React app dependencies..."
cd mainapp || exit 1
npm ci || exit 1

# Clean any existing build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf build
rm -rf node_modules/.vite
rm -rf dist

# Build React app with production settings
echo "🏗️ Building React application with production settings..."
NODE_ENV=production npm run build || exit 1

echo "✅ Build completed successfully!" 