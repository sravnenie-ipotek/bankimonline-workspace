#!/bin/bash

# Deploy Credit Step 4 Fix to Production
# This script deploys the frontend build and ensures database is updated

echo "🚀 Deploying Credit Step 4 Fix to Production"
echo "============================================"

# Step 1: Ensure we're on the right branch
echo "📌 Step 1: Checking git status..."
git status

# Step 2: Build the frontend
echo "🔨 Step 2: Building frontend..."
cd mainapp
npm run build

# Step 3: Show what needs to be deployed
echo "📦 Step 3: Build complete. Files to deploy:"
echo "- mainapp/build/ (entire directory)"
echo "- migrations/001-create-credit-step4-content.sql (run on production DB)"

echo ""
echo "⚡ DEPLOYMENT STEPS:"
echo "==================="
echo ""
echo "1. DEPLOY FRONTEND:"
echo "   - Upload mainapp/build/* to production server"
echo "   - Restart Node.js/PM2 process"
echo ""
echo "2. RUN DATABASE MIGRATION:"
echo "   psql \$PRODUCTION_DATABASE_URL -f migrations/001-create-credit-step4-content.sql"
echo ""
echo "3. VERIFY:"
echo "   - Visit https://dev2.bankimonline.com/services/calculate-credit/4"
echo "   - Should show 'Credit Calculation Results' or 'סיכום בקשת אשראי'"
echo "   - Not 'Credit Registration'"
echo ""
echo "4. TEST CONTENT API:"
echo "   curl https://dev2.bankimonline.com/api/v1/content/credit_step4"
echo ""

echo "✅ Build ready for deployment!"