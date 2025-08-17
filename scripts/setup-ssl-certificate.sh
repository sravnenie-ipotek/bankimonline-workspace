#!/bin/bash

# Ultra-Safe SSL Certificate Setup Script
# This script installs Let's Encrypt SSL for dev2.bankimonline.com

set -e

echo "🔐 ULTRA-SAFE SSL CERTIFICATE SETUP"
echo "===================================="
echo

# Configuration
DOMAIN="dev2.bankimonline.com"
PROD_SERVER="root@45.83.42.74"
EMAIL="admin@bankimonline.com"  # Change this to your email

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Domain: $DOMAIN${NC}"
echo -e "${BLUE}Server: $PROD_SERVER${NC}"
echo

# Step 1: Check DNS propagation
echo "🔍 Step 1: Checking DNS Propagation"
echo "-----------------------------------"

echo "Checking DNS records..."
DNS_IP=$(dig +short $DOMAIN)

if [ -z "$DNS_IP" ]; then
    echo -e "${RED}❌ DNS not propagated yet!${NC}"
    echo "Please ensure you've added the A record for $DOMAIN pointing to 45.83.42.74"
    echo "DNS propagation can take 5-30 minutes."
    exit 1
fi

if [ "$DNS_IP" != "45.83.42.74" ]; then
    echo -e "${RED}❌ DNS points to wrong IP: $DNS_IP${NC}"
    echo "Expected: 45.83.42.74"
    exit 1
fi

echo -e "${GREEN}✅ DNS propagated correctly: $DOMAIN → $DNS_IP${NC}"
echo

# Step 2: Install SSL certificate
echo "🔒 Step 2: Installing SSL Certificate"
echo "-------------------------------------"

ssh $PROD_SERVER << SSLEOF
set -e

# Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Stop Nginx temporarily for certificate generation
echo "Obtaining SSL certificate..."

# Get certificate using webroot method (Nginx stays running)
certbot certonly \
    --webroot \
    --webroot-path=/opt/bankimonline-current/web \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d $DOMAIN \
    -d www.$DOMAIN

# Update Nginx configuration for SSL
echo "Updating Nginx configuration for SSL..."

cat > /etc/nginx/sites-available/bankimonline << 'NGINX_SSL'
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name dev2.bankimonline.com www.dev2.bankimonline.com;
    
    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /opt/bankimonline-current/web;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server - Main application
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dev2.bankimonline.com www.dev2.bankimonline.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/dev2.bankimonline.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev2.bankimonline.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/bankimonline_ssl_access.log;
    error_log /var/log/nginx/bankimonline_ssl_error.log;

    # Root directory
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # React app routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Admin panel (future)
server {
    listen 80;
    listen [::]:80;
    server_name admin.dev2.bankimonline.com;
    
    location /.well-known/acme-challenge/ {
        root /opt/bankimonline-admin/web;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# Redirect from IP to domain
server {
    listen 80;
    listen [::]:80;
    server_name 45.83.42.74;
    return 301 https://dev2.bankimonline.com\$request_uri;
}
NGINX_SSL

# Test and reload Nginx
nginx -t
systemctl reload nginx

# Set up auto-renewal
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

echo "✅ SSL certificate installed and configured!"

SSLEOF

echo -e "${GREEN}✅ SSL setup complete${NC}"
echo

# Step 3: Test HTTPS
echo "🧪 Step 3: Testing HTTPS Configuration"
echo "--------------------------------------"

echo "Testing HTTP to HTTPS redirect..."
curl -I -s http://$DOMAIN | head -n 1

echo
echo "Testing HTTPS connection..."
curl -I -s https://$DOMAIN | head -n 1

echo
echo "Testing SSL certificate..."
echo | openssl s_client -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates

echo
echo "📊 SSL SETUP SUMMARY"
echo "==================="
echo -e "${GREEN}✅ SSL certificate obtained${NC}"
echo -e "${GREEN}✅ HTTPS configured${NC}"
echo -e "${GREEN}✅ Auto-renewal enabled${NC}"
echo -e "${GREEN}✅ Security headers configured${NC}"
echo
echo "🎉 Your site is now available at:"
echo -e "${BLUE}https://dev2.bankimonline.com${NC}"
echo
echo "🔒 SSL Grade Test:"
echo "Test your SSL configuration at:"
echo "https://www.ssllabs.com/ssltest/analyze.html?d=dev2.bankimonline.com"