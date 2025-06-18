#!/bin/bash

echo "🚀 Starting Railway build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm ci || exit 1

# Navigate to mainapp and install dependencies
echo "📦 Installing React app dependencies..."
cd mainapp || exit 1
npm ci || exit 1

# Build React app
echo "🏗️ Building React application..."
npm run build || exit 1

echo "✅ Build completed successfully!" 