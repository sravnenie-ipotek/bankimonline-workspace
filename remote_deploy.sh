#!/bin/bash
set -e

echo "🚀 Starting JSONB deployment on $(hostname)"
cd /var/www/bankimonline

# Backup current files
echo "📦 Creating backups..."
cp server/server-db.js server/server-db.js.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp server/config/database-core.js server/config/database-core.js.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Pull latest code
echo "🔄 Fetching feature branch..."
git fetch origin
git checkout feature/jsonb-dropdowns
git pull origin feature/jsonb-dropdowns

# Add Neon URL to .env
echo "🔧 Configuring environment..."
if ! grep -q "NEON_CONTENT_URL" .env 2>/dev/null; then
    echo "" >> .env
    echo "# JSONB Content Database (Neon)" >> .env
    echo "NEON_CONTENT_URL=postgresql://neondb_owner:npg_jbzp4wqldAu7@ep-wild-feather-ad1lx42k.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" >> .env
fi

# Build frontend
echo "🏗️ Building frontend..."
cd mainapp
npm run build
cd ..

# Restart services
echo "🔄 Restarting services..."
pkill -f "node.*server-db.js" || true
sleep 2
nohup node server/server-db.js > server.log 2>&1 &
echo "✅ Server restarted"

# Wait and test
sleep 5
echo "🧪 Testing JSONB API..."
curl -s "http://localhost:8003/api/dropdowns/mortgage_step1/en" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('Status:', data.get('status'))
print('JSONB:', data.get('jsonb_source'))
print('Dropdowns:', len(data.get('dropdowns', [])))
"

echo "✅ Deployment complete!"
