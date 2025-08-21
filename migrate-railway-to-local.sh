#!/bin/bash

echo "🚀 Railway to Local Database Migration Script"
echo "============================================="
echo ""

# Railway database URLs
RAILWAY_MAIN="postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"
RAILWAY_CONTENT="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"

# Test connection with timeout
echo "Testing Railway database connections..."
timeout 5 psql "$RAILWAY_MAIN" -c "SELECT 1;" > /dev/null 2>&1
MAIN_STATUS=$?

timeout 5 psql "$RAILWAY_CONTENT" -c "SELECT 1;" > /dev/null 2>&1
CONTENT_STATUS=$?

if [ $MAIN_STATUS -eq 0 ]; then
    echo "✅ Railway Main DB is accessible"
else
    echo "❌ Railway Main DB is NOT accessible"
fi

if [ $CONTENT_STATUS -eq 0 ]; then
    echo "✅ Railway Content DB is accessible"
else
    echo "❌ Railway Content DB is NOT accessible"
fi

echo ""
echo "Alternative migration methods:"
echo "1. Use Railway CLI: railway connect postgres"
echo "2. Download backup from Railway dashboard"
echo "3. Use Railway's database backup feature"
