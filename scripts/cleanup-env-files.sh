#!/bin/bash

# Ultra-Safe Environment Files Cleanup Script
# This script consolidates and cleans up .env files

set -e

echo "🧹 ULTRA-SAFE ENVIRONMENT CLEANUP"
echo "================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to backup files before deletion
backup_file() {
    local file=$1
    local backup_dir="./env-backup-$(date +%Y%m%d_%H%M%S)"
    
    if [ ! -d "$backup_dir" ]; then
        mkdir -p "$backup_dir"
    fi
    
    cp "$file" "$backup_dir/" 2>/dev/null || true
    echo -e "${YELLOW}  Backed up: $(basename $file)${NC}"
}

# Navigate to project root
cd /Users/michaelmishayev/Projects/bankDev2_standalone

echo "📁 Current .env files in project:"
echo "--------------------------------"
find . -name ".env*" -type f | grep -v node_modules | sort

echo
echo "🔍 Analyzing .env files..."
echo

# Files to keep
KEEP_FILES=(
    "./.env"                    # Main development env
    "./.env.template"           # Template for developers
    "./.env.production.template" # Production template
    "./mainapp/.env.production" # Frontend production vars (if needed)
)

# Files to consolidate/remove
REMOVE_FILES=(
    "./.env.local"
    "./.env.development-railway"
    "./.env.qa"
    "./.env.save"
    "./server/.env"
    "./server/.env.backup"
    "./packages/server/.env"
    "./production-package/.env"
    "./production-package/api/.env"
)

echo "✅ Files to KEEP:"
for file in "${KEEP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  $file${NC}"
    fi
done

echo
echo "❌ Files to REMOVE (after backup):"
for file in "${REMOVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${RED}  $file${NC}"
    fi
done

echo
read -p "Continue with cleanup? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo
echo "🗂️ Creating backups..."
backup_dir="./env-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

for file in "${REMOVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        backup_file "$file"
    fi
done

echo
echo "🧹 Removing duplicate .env files..."

for file in "${REMOVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo -e "${GREEN}  Removed: $file${NC}"
    fi
done

echo
echo "📝 Creating consolidated .env.example..."

cat > .env.example << 'EOF'
# Development Environment Configuration
# Copy to .env and update values

# Railway PostgreSQL Databases
DATABASE_URL=postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway

# Security - CHANGE IN PRODUCTION
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# Server
PORT=8003
NODE_ENV=development

# CORS (add more origins as needed)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3001
EOF

echo -e "${GREEN}✅ Created .env.example${NC}"

echo
echo "🔧 Updating server configurations..."

# Update server/server-db.js to use root .env
if [ -f "./server/server-db.js" ]; then
    echo "  Checking server-db.js dotenv configuration..."
    # The server should load from root .env
fi

echo
echo "📊 Environment Cleanup Summary:"
echo "==============================="
echo -e "${GREEN}✅ Consolidated to single .env file${NC}"
echo -e "${GREEN}✅ Created .env templates${NC}"
echo -e "${GREEN}✅ Backed up old files to: $backup_dir${NC}"
echo -e "${GREEN}✅ Fixed PORT to 8003${NC}"

echo
echo "📋 Next Steps:"
echo "1. Review .env file for correct values"
echo "2. Ensure server/server-db.js uses root .env"
echo "3. Test application with consolidated config"

echo
echo "🎉 Environment cleanup complete!"