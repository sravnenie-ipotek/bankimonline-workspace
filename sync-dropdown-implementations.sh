#!/bin/bash
# 🔧 CRITICAL: Dropdown Implementation Synchronization Script
# Automatically synchronizes dropdown implementations between legacy and packages servers
# MANDATORY: Run after ANY changes to dropdown API endpoints

set -e  # Exit on any error

echo "🔧 CRITICAL: Synchronizing dropdown implementations between servers"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with colors
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check prerequisites
echo "🔍 Step 1: Checking prerequisites..."

if [ ! -f "server/server-db.js" ]; then
    log_error "Legacy server file (server/server-db.js) not found"
    exit 1
fi

if [ ! -f "server/server-packages.js" ]; then
    log_warning "Packages server file (server/server-packages.js) not found"
    log_info "Creating packages server template..."
    
    cat > server/server-packages.js << 'EOF'
import express from 'express';
import NodeCache from 'node-cache';
import { contentPool } from '../config/database.js';

const app = express();
const PORT = process.env.PACKAGES_PORT || 8004;

// Cache configuration for dropdown performance
const contentCache = new NodeCache({ 
  stdTTL: 300,        // 5 minutes cache
  checkperiod: 60,    // Check expired keys every 60 seconds
  useClones: false,   // Better performance for dropdown data
  deleteOnExpire: true
});

// 🚨 CRITICAL: Dropdown API implementation will be synchronized here

// Server startup
app.listen(PORT, () => {
  console.log(`📦 Packages server running on port ${PORT}`);
});

export default app;
EOF
    log_success "Created packages server template"
fi

# Extract dropdown implementation from legacy server
echo "🔧 Step 2: Extracting dropdown implementation from legacy server..."

# Check if legacy server has dropdown endpoint
if ! grep -q "app.get('/api/dropdowns/:screen/:language'" server/server-db.js; then
    log_error "Legacy server does not contain dropdown API implementation"
    echo "Please implement dropdown API in server/server-db.js first"
    exit 1
fi

# Extract the complete dropdown implementation
echo "📄 Extracting dropdown implementation..."
temp_impl_file="temp_dropdown_implementation.js"

# Extract from the dropdown endpoint to the end of its handler
sed -n '/^app\.get.*\/api\/dropdowns\/:screen\/:language/,/^});$/p' server/server-db.js > "$temp_impl_file"

# Also extract cache management endpoints
echo "" >> "$temp_impl_file"
sed -n '/^app\.get.*\/api\/dropdowns\/cache\/stats/,/^});$/p' server/server-db.js >> "$temp_impl_file"
echo "" >> "$temp_impl_file"
sed -n '/^app\.delete.*\/api\/dropdowns\/cache\/clear/,/^});$/p' server/server-db.js >> "$temp_impl_file"

if [ ! -s "$temp_impl_file" ]; then
    log_error "Failed to extract dropdown implementation from legacy server"
    rm -f "$temp_impl_file"
    exit 1
fi

log_success "Extracted dropdown implementation from legacy server"

# Backup existing packages server
echo "💾 Step 3: Creating backup of packages server..."
cp server/server-packages.js server/server-packages.js.backup.$(date +%Y%m%d_%H%M%S)
log_success "Backup created"

# Remove existing dropdown implementation from packages server
echo "🧹 Step 4: Removing old dropdown implementation from packages server..."
# Remove lines from first dropdown endpoint to export statement
sed -i.tmp '/^app\.get.*\/api\/dropdowns/,/^export default app;$/d' server/server-packages.js

# Insert new dropdown implementation before export
echo "🔄 Step 5: Inserting synchronized dropdown implementation..."

# Prepare the implementation with packages server specific modifications
cat "$temp_impl_file" >> server/server-packages.js
echo "" >> server/server-packages.js
echo "export default app;" >> server/server-packages.js

# Clean up temporary files
rm -f "$temp_impl_file" server/server-packages.js.tmp

log_success "Dropdown implementation synchronized to packages server"

# Validate synchronization
echo "🔍 Step 6: Validating synchronization..."

# Check both servers have dropdown endpoints
if ! grep -q "app.get('/api/dropdowns/:screen/:language'" server/server-packages.js; then
    log_error "Synchronization failed - packages server missing dropdown endpoint"
    echo "Restoring backup..."
    latest_backup=$(ls -t server/server-packages.js.backup.* 2>/dev/null | head -n1)
    if [ -n "$latest_backup" ]; then
        cp "$latest_backup" server/server-packages.js
        log_info "Backup restored"
    fi
    exit 1
fi

# Count implementation differences
legacy_lines=$(grep -c "app.get.*dropdowns\|contentCache\|contentPool" server/server-db.js || true)
packages_lines=$(grep -c "app.get.*dropdowns\|contentCache\|contentPool" server/server-packages.js || true)

if [ "$legacy_lines" -eq 0 ] || [ "$packages_lines" -eq 0 ]; then
    log_warning "Unable to count implementation lines for comparison"
else
    log_info "Legacy server dropdown lines: $legacy_lines"
    log_info "Packages server dropdown lines: $packages_lines"
fi

echo ""
log_success "SYNCHRONIZATION COMPLETE"
echo "========================"
echo ""
echo "Next steps:"
echo "1. Review the synchronized implementation in server/server-packages.js"  
echo "2. Test both servers: node server/server-db.js & node server/server-packages.js"
echo "3. Run validation: ./validate-dual-server-sync.sh"
echo "4. Only deploy if validation passes"
echo ""
echo "💡 Backups available: server/server-packages.js.backup.*"