#!/bin/bash

# 🔵🟢 Blue-Green Setup Script
# Run this ONCE on your server to set up blue-green infrastructure

TEST_SERVER="45.83.42.74"
TEST_USER="root"
TEST_PASSWORD="3GM8jHZuTWzDXe"

echo "🔵🟢 Setting up Blue-Green infrastructure on server..."

sshpass -p "$TEST_PASSWORD" ssh -o StrictHostKeyChecking=no ${TEST_USER}@${TEST_SERVER} << 'EOF'
    # Create directories
    mkdir -p /app/blue
    mkdir -p /app/green  
    mkdir -p /app/logs
    
    # Install nginx if not present
    if ! command -v nginx &> /dev/null; then
        echo "📦 Installing nginx..."
        apt update
        apt install -y nginx
    fi
    
    # Create nginx config for blue-green switching
    cat > /etc/nginx/sites-available/bankimonline << 'NGINX'
server {
    listen 80;
    server_name _;
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Main application proxy
    location / {
        proxy_pass http://localhost:8003;  # Initially points to blue (8003)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
NGINX
    
    # Enable site
    ln -sf /etc/nginx/sites-available/bankimonline /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart nginx
    nginx -t
    systemctl enable nginx
    systemctl restart nginx
    
    echo "✅ Blue-Green infrastructure setup completed!"
    echo "🔵 Blue environment: http://localhost:8003"
    echo "🟢 Green environment: http://localhost:8004"  
    echo "🌐 Public access: http://$(curl -s ifconfig.me)"
    
    # Install PM2 globally if not present
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        pm2 startup
    fi
    
EOF

echo "🎉 Blue-Green setup completed on $TEST_SERVER"
echo "📝 Next steps:"
echo "  1. Run: ./blue-green-deploy.sh"
echo "  2. Access: http://$TEST_SERVER"