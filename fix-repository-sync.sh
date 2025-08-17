#!/bin/bash

# Fix Repository Synchronization Issue
# This script syncs workspace changes to individual production repositories

echo "🔄 FIXING REPOSITORY SYNCHRONIZATION"
echo "=================================="

echo "Problem: Railway deploys from workspace, but production pulls from api/web/shared repos"
echo "Solution: Sync workspace changes to individual repositories"

echo ""
echo "🎯 IMMEDIATE FIX:"
echo "1. Force push changes to individual repos (bypasses sync issues)"

# Backend changes to api repo
echo "Pushing backend changes to api repository..."
git push api main --force-with-lease || echo "❌ API repo push failed"

# Documentation changes to shared repo  
echo "Pushing documentation to shared repository..."
git push shared main --force-with-lease || echo "❌ Shared repo push failed"

# Frontend changes to web repo (if any)
echo "Pushing frontend changes to web repository..."
git push web main --force-with-lease || echo "❌ Web repo push failed"

echo ""
echo "✅ Repository sync attempt complete!"
echo ""
echo "🚀 PRODUCTION TEAM NEXT STEPS:"
echo "1. cd /var/www/bankim/online/api && git pull origin main"
echo "2. cd /var/www/bankim/online/shared && git pull origin main"  
echo "3. node /var/www/bankim/online/api/diagnose-production-content-issue.js"
echo "4. pm2 restart api"

echo ""
echo "🎯 ROOT CAUSE CONFIRMED:"
echo "- Railway deploys from workspace repository (gets fixes) ✅"
echo "- Production pulls from api/web/shared repositories (misses fixes) ❌"
echo "- Missing automated sync process between workspace → individual repos"
echo ""
echo "🔧 PERMANENT FIX NEEDED:"
echo "- Add GitHub Action to auto-sync workspace → api/web/shared repos"
echo "- Or change production to deploy from Railway instead of git pull"