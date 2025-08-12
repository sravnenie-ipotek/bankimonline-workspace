#!/bin/bash

# Railway to Local PostgreSQL Migration Script (Final)
# Fixed SSL issues for local connections

echo "🚀 Starting Railway to Local PostgreSQL Migration (Final)..."

# Set Railway URLs (from your codebase)
export PGSSLMODE=require
export DATABASE_URL="postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"
export CONTENT_DATABASE_URL="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"
export MANAGEMENT_DATABASE_URL="postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway"

# Local database URLs (no SSL for local)
LOCAL_CORE="postgresql://michaelmishayev@localhost:5432/bankim_core?sslmode=disable"
LOCAL_CONTENT="postgresql://michaelmishayev@localhost:5432/bankim_content?sslmode=disable"
LOCAL_MANAGEMENT="postgresql://michaelmishayev@localhost:5432/bankim_management?sslmode=disable"

echo "📊 Migrating 3 databases from Railway to Local..."

# 1. Dump from Railway (with version compatibility)
echo "📤 Dumping from Railway..."
PGSSLMODE=require pg_dump --no-owner --no-privileges --no-comments --no-security-labels "$DATABASE_URL" > ~/maglev.sql
PGSSLMODE=require pg_dump --no-owner --no-privileges --no-comments --no-security-labels "$CONTENT_DATABASE_URL" > ~/shortline.sql
PGSSLMODE=require pg_dump --no-owner --no-privileges --no-comments --no-security-labels "$MANAGEMENT_DATABASE_URL" > ~/yamanote.sql

# 2. Restore to Local (plain SQL, no SSL)
echo "📥 Restoring to Local..."
psql "postgresql://michaelmishayev@localhost:5432/bankim_core" < ~/maglev.sql
psql "postgresql://michaelmishayev@localhost:5432/bankim_content" < ~/shortline.sql
psql "postgresql://michaelmishayev@localhost:5432/bankim_management" < ~/yamanote.sql

# 3. Verify (no SSL for local)
echo "✅ Verifying migration..."
echo "Core DB tables:"
psql "postgresql://michaelmishayev@localhost:5432/bankim_core" -c "\dt" | head -20

echo "Content DB tables:"
psql "postgresql://michaelmishayev@localhost:5432/bankim_content" -c "\dt" | head -20

echo "Management DB tables:"
psql "postgresql://michaelmishayev@localhost:5432/bankim_management" -c "\dt" | head -20

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
echo "📁 SQL files saved: ~/maglev.sql, ~/shortline.sql, ~/yamanote.sql"

