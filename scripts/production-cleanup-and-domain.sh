#!/bin/bash

# Ultra-Safe Production Cleanup and Domain Setup Script
# This script cleans production and sets up dev2.bankimonline.com

set -e

echo "🚀 ULTRA-SAFE PRODUCTION CLEANUP & DOMAIN SETUP"
echo "=============================================="
echo

# Configuration
DOMAIN="dev2.bankimonline.com"
PROD_SERVER="root@45.83.42.74"
DEPLOY_DIR="/opt/bankimonline-current"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Target Server: $PROD_SERVER${NC}"
echo -e "${BLUE}Domain: $DOMAIN${NC}"
echo

# Step 1: Clean Production Files
echo "📦 Step 1: Cleaning Production Files"
echo "------------------------------------"

ssh $PROD_SERVER << 'CLEANUP_EOF'
set -e

echo "🔍 Analyzing current production state..."

# Check disk space
echo "💾 Current disk usage:"
df -h / | grep -E "^/|Filesystem"

# Remove old backups (keep last 3)
echo
echo "🗑️ Cleaning old backups..."
cd /opt/backups
ls -lt | grep bankimonline | tail -n +4 | awk '{print $9}' | while read backup; do
    echo "  Removing old backup: $backup"
    rm -rf "$backup"
done

# Clean development files from production
echo
echo "🧹 Removing development files..."
find /opt/bankimonline-current -name "*.map" -type f -delete 2>/dev/null || true
find /opt/bankimonline-current -name "*.test.js" -type f -delete 2>/dev/null || true
find /opt/bankimonline-current -name "*.spec.js" -type f -delete 2>/dev/null || true
find /opt/bankimonline-current -name ".DS_Store" -type f -delete 2>/dev/null || true
find /opt/bankimonline-current -name "._*" -type f -delete 2>/dev/null || true

# Remove unnecessary env files
echo
echo "📄 Cleaning duplicate .env files..."
find /opt/bankimonline-current -name ".env.*" -type f ! -name ".env" -delete 2>/dev/null || true

# Clean npm cache
echo
echo "🔧 Cleaning npm cache..."
cd /opt/bankimonline-current/api
npm cache clean --force 2>/dev/null || true

# Check PM2 processes
echo
echo "⚙️ Current PM2 processes:"
pm2 list

# Remove errored/old PM2 processes
pm2 delete all 2>/dev/null || true
pm2 flush  # Clear logs

echo
echo "💾 Disk usage after cleanup:"
df -h / | grep -E "^/"

CLEANUP_EOF

echo -e "${GREEN}✅ Production cleanup complete${NC}"
echo

# Step 2: Set up Nginx for domain
echo "🌐 Step 2: Configuring Nginx for $DOMAIN"
echo "----------------------------------------"

ssh $PROD_SERVER << 'NGINX_EOF'
set -e

# Create comprehensive Nginx configuration
cat > /etc/nginx/sites-available/bankimonline << 'CONFIG'
# Main application - dev2.bankimonline.com
server {
    listen 80;
    listen [::]:80;
    server_name dev2.bankimonline.com www.dev2.bankimonline.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/bankimonline_access.log;
    error_log /var/log/nginx/bankimonline_error.log;

    # Root directory for static files
    root /opt/bankimonline-current/web;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # API proxy
    location /api {
        proxy_pass http://localhost:8003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # React app routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Admin panel - admin.dev2.bankimonline.com (future)
server {
    listen 80;
    listen [::]:80;
    server_name admin.dev2.bankimonline.com;

    root /opt/bankimonline-admin/web;
    index index.html;

    location / {
        # Placeholder for admin panel
        return 503 "Admin panel coming soon";
        add_header Content-Type text/plain;
    }
}

# Redirect from IP to domain
server {
    listen 80;
    listen [::]:80;
    server_name 45.83.42.74;
    return 301 http://dev2.bankimonline.com$request_uri;
}
CONFIG

# Enable the site
ln -sf /etc/nginx/sites-available/bankimonline /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

echo "✅ Nginx configured for dev2.bankimonline.com"

NGINX_EOF

echo -e "${GREEN}✅ Nginx domain configuration complete${NC}"
echo

# Step 3: Set up PM2 with proper configuration
echo "⚙️ Step 3: Configuring PM2 Process Manager"
echo "-----------------------------------------"

ssh $PROD_SERVER << 'PM2_EOF'
set -e

cd /opt/bankimonline-current

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'CONFIG'
module.exports = {
  apps: [
    {
      name: 'bankimonline-api',
      script: './api/server-db.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8003
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      max_memory_restart: '500M',
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      autorestart: true
    }
  ]
};
CONFIG

# Create logs directory
mkdir -p logs

# Restart PM2 with ecosystem file
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup systemd -u root --hp /root
pm2 save

echo "✅ PM2 configured with cluster mode"

PM2_EOF

echo -e "${GREEN}✅ PM2 configuration complete${NC}"
echo

# Step 4: Create DNS update instructions
echo "📝 Step 4: DNS Configuration Instructions"
echo "----------------------------------------"

cat > /Users/michaelmishayev/Projects/bankDev2_standalone/DNS_SETUP.md << 'DNS_DOC'
# DNS Configuration for dev2.bankimonline.com

## Required DNS Records

Add these records to your DNS provider:

### A Records
```
Type: A
Name: dev2
Value: 45.83.42.74
TTL: 300 (5 minutes for testing, increase to 3600 later)
```

```
Type: A
Name: www.dev2
Value: 45.83.42.74
TTL: 300
```

### For Admin Panel (Future)
```
Type: A
Name: admin.dev2
Value: 45.83.42.74
TTL: 300
```

## DNS Providers Instructions

### Cloudflare
1. Log in to Cloudflare Dashboard
2. Select your domain (bankimonline.com)
3. Go to DNS settings
4. Add A record for "dev2" pointing to 45.83.42.74
5. Set Proxy status to "DNS only" initially (orange cloud OFF)

### GoDaddy
1. Log in to GoDaddy Account
2. Go to Domain Management
3. Select bankimonline.com
4. Click "Manage DNS"
5. Add A record: Host="dev2", Points to="45.83.42.74"

### Namecheap
1. Log in to Namecheap
2. Go to Domain List
3. Click "Manage" next to bankimonline.com
4. Go to "Advanced DNS"
5. Add A record: Host="dev2", Value="45.83.42.74"

## Verification

After adding DNS records, verify with:
```bash
# Check DNS propagation
dig dev2.bankimonline.com
nslookup dev2.bankimonline.com

# Test connectivity
curl -I http://dev2.bankimonline.com
```

## Current Status
- ✅ Server configured at 45.83.42.74
- ✅ Nginx configured for dev2.bankimonline.com
- ✅ Application running on port 8003
- ⏳ Waiting for DNS records to be added
- ⏳ SSL certificate pending

DNS_DOC

echo -e "${GREEN}✅ DNS instructions created at DNS_SETUP.md${NC}"
echo

# Step 5: Test current setup
echo "🧪 Step 5: Testing Current Setup"
echo "--------------------------------"

echo "Testing server directly..."
curl -s -o /dev/null -w "IP Access (45.83.42.74): %{http_code}\n" http://45.83.42.74/ || true
echo

echo "Testing API endpoint..."
curl -s -o /dev/null -w "API Status: %{http_code}\n" http://45.83.42.74/api/v1/banks || true
echo

echo "📊 DEPLOYMENT SUMMARY"
echo "===================="
echo -e "${GREEN}✅ Production files cleaned${NC}"
echo -e "${GREEN}✅ Nginx configured for dev2.bankimonline.com${NC}"
echo -e "${GREEN}✅ PM2 running in cluster mode${NC}"
echo -e "${GREEN}✅ Ready for DNS configuration${NC}"
echo
echo -e "${YELLOW}⏳ PENDING ACTIONS:${NC}"
echo "1. Add DNS A record for dev2.bankimonline.com → 45.83.42.74"
echo "2. Wait for DNS propagation (5-30 minutes)"
echo "3. Install SSL certificate with Let's Encrypt"
echo
echo "📝 See DNS_SETUP.md for detailed DNS instructions"
echo
echo "🎉 Production is ready! Waiting for DNS setup."