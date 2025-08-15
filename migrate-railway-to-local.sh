#!/bin/bash

# Railway to Local PostgreSQL Migration Script
# Based on actual Railway URLs from the codebase

echo "🚀 Starting Railway to Local PostgreSQL Migration..."

# Set Railway URLs (from your codebase)
export PGSSLMODE=require
export DATABASE_URL="postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"
export CONTENT_DATABASE_URL="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"
export MANAGEMENT_DATABASE_URL="postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway"

# Local database URLs
LOCAL_CORE="postgresql://michaelmishayev@localhost:5432/bankim_core"
LOCAL_CONTENT="postgresql://michaelmishayev@localhost:5432/bankim_content"
LOCAL_MANAGEMENT="postgresql://michaelmishayev@localhost:5432/bankim_management"

echo "📊 Migrating 3 databases from Railway to Local..."

# 1. Dump from Railway
echo "📤 Dumping from Railway..."
pg_dump -Fc --no-owner --no-privileges "$DATABASE_URL" -f ~/maglev.dump
pg_dump -Fc --no-owner --no-privileges "$CONTENT_DATABASE_URL" -f ~/shortline.dump
pg_dump -Fc --no-owner --no-privileges "$MANAGEMENT_DATABASE_URL" -f ~/yamanote.dump

# 2. Restore to Local
echo "📥 Restoring to Local..."
pg_restore --clean --if-exists --no-owner --no-privileges -d "$LOCAL_CORE" ~/maglev.dump
pg_restore --clean --if-exists --no-owner --no-privileges -d "$LOCAL_CONTENT" ~/shortline.dump
pg_restore --clean --if-exists --no-owner --no-privileges -d "$LOCAL_MANAGEMENT" ~/yamanote.dump

# 3. Verify
echo "✅ Verifying migration..."
echo "Core DB tables:"
psql "$LOCAL_CORE" -c "\dt" | head -20

echo "Content DB tables:"
psql "$LOCAL_CONTENT" -c "\dt" | head -20

echo "Management DB tables:"
psql "$LOCAL_MANAGEMENT" -c "\dt" | head -20

# 4. Create .env for local development
echo "🔧 Creating local .env file..."
cat > .env.local << EOF
# Local Database Configuration
DATABASE_URL=$LOCAL_CORE
CONTENT_DATABASE_URL=$LOCAL_CONTENT
MANAGEMENT_DATABASE_URL=$LOCAL_MANAGEMENT
NODE_ENV=development
EOF

echo "🎉 Migration complete! Use .env.local for local development."
echo "📁 Dump files saved: ~/maglev.dump, ~/shortline.dump, ~/yamanote.dump"



