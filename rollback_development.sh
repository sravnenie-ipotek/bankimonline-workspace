#!/bin/bash
# Emergency Development Rollback Script

echo "🚨 ROLLING BACK DEVELOPMENT ENVIRONMENT"
echo "======================================="

# Kill current development processes
echo "Stopping current development servers..."
pkill -f "npm run dev" 2>/dev/null || echo "No dev processes found"
pkill -f "node.*server-db.js" 2>/dev/null || echo "No API server found"
pkill -f "node.*serve.js" 2>/dev/null || echo "No file server found"

# Navigate to Projects directory
cd ~/Projects/

# Backup current state (if it exists)
if [ -d "bankDev2_standalone" ]; then
    echo "Backing up current state..."
    mv bankDev2_standalone bankDev2_FAILED_$(date +%Y%m%d_%H%M%S)
fi

# Restore from backup
echo "Restoring from backup..."
BACKUP_FILE=$(ls -t bankDev2_backup_*.tar.gz 2>/dev/null | head -1)

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ ERROR: No backup file found!"
    echo "Please manually restore from external backup"
    exit 1
fi

echo "Extracting backup: $BACKUP_FILE"
tar -xzf "$BACKUP_FILE"

# Verify restoration
if [ -d "bankDev2_standalone" ]; then
    echo "✅ Development environment restored successfully"
    echo "📋 Next steps:"
    echo "1. cd ~/Projects/bankDev2_standalone"
    echo "2. npm install"
    echo "3. npm run dev"
else
    echo "❌ ERROR: Restoration failed"
    exit 1
fi

echo "🎯 DEVELOPMENT ROLLBACK COMPLETE"