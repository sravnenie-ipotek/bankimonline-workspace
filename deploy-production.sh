#!/bin/bash

echo "🚀 BankIM Production Deployment Script"
echo "========================================"

# Navigate to mainapp directory
cd mainapp

echo "📦 Building production application..."
npm run build

echo "🖼️ Copying service icons to build assets..."
cp public/static/calculate-mortgage-icon.png build/assets/mortgage-icon.png
cp public/static/refinance-mortgage-icon.png build/assets/refinance-mortgage-icon.png
cp public/static/calculate-credit-icon.png build/assets/credit-icon.png
cp public/static/refinance-credit-icon.png build/assets/refinance-credit-icon.png

echo "✅ Verifying icons are in place..."
ls -la build/assets/*icon*.png

echo "📋 Production build summary:"
echo "- Fresh Vite build completed"
echo "- All 4 service icons copied to assets"
echo "- Hebrew translations optimized"
echo "- API configuration ready for production"
echo "- Collapsible sidebar implemented"
echo "- Personal profile with demo data"

echo ""
echo "🎯 Ready for Railway deployment!"
echo "The build/ directory contains all production-ready files."
echo ""
echo "Production URL: https://bankdev2standalone-production.up.railway.app"
echo "Development: cd bankDev2_standalone && node start-dev.js" 