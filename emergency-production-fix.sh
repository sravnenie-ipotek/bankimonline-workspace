#!/bin/bash

# Emergency Production Fix Script
# Run this directly on production server to bypass repository sync issues

echo "🚨 EMERGENCY PRODUCTION CONTENT API FIX"
echo "======================================"

echo "Creating diagnostic script directly on production..."

# Create the diagnostic script in production api directory
cat > /var/www/bankim/online/api/diagnose-production-content-issue.js << 'EOF'
#!/usr/bin/env node

// Production Content API Diagnostic Script
// Run this on production server to identify the root cause

console.log('🔍 PRODUCTION CONTENT API DIAGNOSTIC');
console.log('===================================');

async function diagnoseProduction() {
  console.log('\n1. 🗄️ CHECK DATABASE CONNECTION:');
  console.log('   Environment Variables:');
  console.log(`   CONTENT_DATABASE_URL: ${process.env.CONTENT_DATABASE_URL ? 'SET' : 'NOT SET'}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
  
  console.log('\n2. 🧪 TEST DIRECT API CALLS:');
  console.log('   Run these commands on production:');
  console.log('   curl "http://localhost:8004/api/content/mortgage_step1/en" | jq .content_count');
  console.log('   curl "http://localhost:8004/api/v1/dropdowns?screen=mortgage_step1&language=en" | jq length');
  
  console.log('\n3. 🗂️ CHECK DATABASE DIRECTLY:');
  console.log('   Connect to SHORTLINE database and run:');
  console.log(`   SELECT COUNT(*) FROM content_items WHERE content_key LIKE 'mortgage_step1.field%';`);
  console.log(`   SELECT content_key FROM content_items WHERE content_key LIKE 'mortgage_step1.field%' LIMIT 5;`);
  
  console.log('\n4. 🔄 CLEAR PRODUCTION CACHE:');
  console.log('   Option A - API call:');
  console.log('   curl -X POST "http://localhost:8004/api/admin/clear-content-cache"');
  console.log('   ');
  console.log('   Option B - PM2 restart:');
  console.log('   pm2 restart api');
  console.log('   ');
  console.log('   Option C - Kill node processes:');
  console.log('   pkill -f "node.*server-db.js" && pm2 resurrect');
  
  console.log('\n5. 🎯 MOST LIKELY FIXES (in order):');
  console.log('   ✅ 1. Clear content cache (restart PM2)');
  console.log('   ✅ 2. Verify CONTENT_DATABASE_URL points to SHORTLINE');
  console.log('   ✅ 3. Check server-db.js uses contentPool not pool for content APIs');
  console.log('   ✅ 4. Ensure Railway content migration was deployed');
  
  console.log('\n6. 🚨 EMERGENCY FALLBACK:');
  console.log('   If APIs still fail, frontend will use translation system');
  console.log('   Verify translation.json has calculate_mortgage_* fallback keys');
  
  console.log('\n📊 EXPECTED RESULTS:');
  console.log('   - Content API should return 24+ mortgage_step1.field.* keys');
  console.log('   - Dropdown API should return 10+ dropdown items');
  console.log('   - Frontend should display proper labels, not "undefined"');
}

diagnoseProduction();
EOF

echo "✅ Diagnostic script created at /var/www/bankim/online/api/diagnose-production-content-issue.js"

echo "🎯 IMMEDIATE FIX COMMANDS:"
echo "1. Run diagnostic: cd /var/www/bankim/online/api && node diagnose-production-content-issue.js"
echo "2. Clear cache: pm2 restart api"
echo "3. Test API: curl 'http://localhost:8004/api/content/mortgage_step1/en'"

echo "🚨 ROOT CAUSE: Repository sync broken - api repo missing workspace changes!"