#!/bin/bash
# Emergency Production Rollback Script

echo "🚨 ROLLING BACK PRODUCTION ENVIRONMENT"
echo "======================================"

# This script should be run if the production migration fails
# It will restore the original production setup

echo "⚠️  WARNING: This will restore production to previous state"
echo "Continue? (y/n)"
read confirmation

if [ "$confirmation" != "y" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# SSH to production server and execute rollback
ssh deploy@185.253.72.80 << 'EOF'
echo "🚨 Starting production rollback..."

# Stop new services
sudo systemctl stop bankimonline 2>/dev/null || echo "New service not running"
sudo systemctl disable bankimonline 2>/dev/null || echo "New service not enabled"

# Remove new structure
sudo rm -rf /opt/bankimonline* 2>/dev/null || echo "New structure not found"

# Restore old structure if archived
if [ -d "/var/www/bankim/online.archived"* ]; then
    ARCHIVED_DIR=$(ls -d /var/www/bankim/online.archived* | head -1)
    echo "Restoring from: $ARCHIVED_DIR"
    sudo mv "$ARCHIVED_DIR" /var/www/bankim/online
fi

# Restart old services
sudo systemctl start apache2 2>/dev/null || echo "Apache not configured"
pm2 resurrect 2>/dev/null || echo "PM2 not configured"

# Restore old nginx config if needed
if [ -f "/etc/nginx/sites-available/bankimonline.backup" ]; then
    sudo mv /etc/nginx/sites-available/bankimonline.backup /etc/nginx/sites-available/bankimonline
    sudo systemctl reload nginx
fi

echo "✅ Production rollback completed"
echo "🔍 Verifying services..."

# Check if services are running
sleep 5
curl -s -o /dev/null -w "API Status: %{http_code}\n" http://localhost:8004/api/v1/banks
curl -s -o /dev/null -w "Web Status: %{http_code}\n" http://localhost/

EOF

echo "🎯 PRODUCTION ROLLBACK COMPLETE"
echo "Please verify production is accessible at admin.bankimonline.com"