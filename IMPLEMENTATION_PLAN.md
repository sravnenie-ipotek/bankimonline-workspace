# 🚀 Implementation Plan: Workspace → Production Migration

## 📋 **Phase 1: Immediate Fix (1 Day)**

### **🔧 Development Environment Changes**

#### **1. Update CI/CD to Deploy from Workspace**
```yaml
# File: .github/workflows/deploy-production.yml
name: Deploy from Workspace to Production
on:
  push:
    branches: [main]
    paths:
      - 'mainapp/**'
      - 'server/**'
      - 'package.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 🏗️ Build Frontend
        working-directory: mainapp
        run: |
          npm ci
          npm run build
          
      - name: 📦 Package Release
        run: |
          # Create deployment package
          mkdir -p release/
          cp -r server/ release/api/
          cp -r mainapp/build/ release/web/
          cp -r docs/ release/docs/
          cp package*.json release/
          tar -czf release.tar.gz release/
          
      - name: 🚀 Deploy to Production
        uses: appleboy/scp-action@v0.1.4
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          source: "release.tar.gz"
          target: "/tmp/"
          
      - name: 🔄 Switch Production Version
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            # Extract release
            cd /tmp
            tar -xzf release.tar.gz
            
            # Create timestamped deployment
            TIMESTAMP=$(date +%Y%m%d-%H%M%S)
            sudo mkdir -p /opt/bankimonline/releases/$TIMESTAMP
            sudo cp -r release/* /opt/bankimonline/releases/$TIMESTAMP/
            
            # Atomic switch
            sudo ln -sfn /opt/bankimonline/releases/$TIMESTAMP /opt/bankimonline/current
            
            # Restart services
            sudo systemctl restart bankimonline
            
            # Cleanup old releases (keep last 5)
            cd /opt/bankimonline/releases
            sudo ls -t | tail -n +6 | sudo xargs rm -rf
```

#### **2. Archive Separate Repositories**
```bash
# Add deprecation notices to separate repos
# File: README.md for bankimonline-api, bankimonline-web, bankimonline-shared

🚨 **REPOSITORY DEPRECATED**

This repository has been consolidated into the main workspace:
👉 **New Location**: [bankimonline-workspace](https://github.com/sravnenie-ipotek/bankimonline-workspace)

**What this means:**
- ❌ No more updates to this repository
- ❌ Do not deploy from this repository  
- ✅ All development happens in workspace
- ✅ All deployments come from workspace

**For developers:**
```bash
git clone https://github.com/sravnenie-ipotek/bankimonline-workspace.git
cd bankimonline-workspace
npm run dev
```

**Migration completed**: August 2025
```

### **🏭 Production Environment Changes**

#### **1. Create New Deployment Structure**
```bash
# SSH to production server
ssh deploy@185.253.72.80

# Create new deployment directory structure
sudo mkdir -p /opt/bankimonline/{releases,shared/{logs,uploads,env}}

# Copy current environment files
sudo cp /var/www/bankim/online/api/.env /opt/bankimonline/shared/env/
sudo cp -r /var/www/bankim/online/uploads/ /opt/bankimonline/shared/

# Set permissions
sudo chown -R deploy:deploy /opt/bankimonline/
```

#### **2. Update SystemD Service**
```bash
# File: /etc/systemd/system/bankimonline.service
[Unit]
Description=BankiMonline Banking Platform
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/opt/bankimonline/current/api
ExecStart=/usr/bin/node server-db.js
EnvironmentFile=/opt/bankimonline/shared/env/.env
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable new service
sudo systemctl daemon-reload
sudo systemctl enable bankimonline
sudo systemctl start bankimonline
```

#### **3. Update Nginx Configuration**
```nginx
# File: /etc/nginx/sites-available/bankimonline
server {
    listen 80;
    server_name admin.bankimonline.com;
    
    # Frontend (built React app)
    location / {
        root /opt/bankimonline/current/web;
        try_files $uri $uri/ /index.html;
    }
    
    # API endpoints
    location /api {
        proxy_pass http://localhost:8004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Static uploads
    location /uploads {
        root /opt/bankimonline/shared;
    }
}
```

#### **4. Backup and Remove Old Structure**
```bash
# Backup current setup
sudo tar -czf /backup/old-bankimonline-$(date +%Y%m%d).tar.gz /var/www/bankim/online/

# Stop old services
sudo systemctl stop apache2  # or whatever runs the old setup
sudo pm2 stop all

# Archive old directory (don't delete immediately)
sudo mv /var/www/bankim/online /var/www/bankim/online.archived.$(date +%Y%m%d)
```

---

## 📋 **Phase 2: Clean Architecture (1 Week)**

### **🔧 Development Environment Changes**

#### **1. Restructure Directories**
```bash
# In your local development workspace
cd ~/Projects/bankDev2_standalone

# Create new structure
mkdir -p apps/web apps/api tools/build tools/deploy

# Move existing directories
mv mainapp/* apps/web/
mv server/* apps/api/
rmdir mainapp server

# Update package.json for workspaces
```

#### **2. Create Root Package.json**
```json
{
  "name": "bankimonline-platform",
  "version": "1.0.0",
  "workspaces": [
    "apps/*",
    "tools/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "npm run dev --workspace=apps/api",
    "dev:web": "npm run dev --workspace=apps/web",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "deploy:staging": "npm run build && node tools/deploy/staging.js",
    "deploy:production": "npm run build && node tools/deploy/production.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "lerna": "^7.1.0"
  }
}
```

#### **3. Update Apps Package.json**
```json
// apps/web/package.json
{
  "name": "@bankimonline/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

// apps/api/package.json  
{
  "name": "@bankimonline/api",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon server-db.js",
    "start": "node server-db.js"
  }
}
```

#### **4. Update Import Paths**
```javascript
// Update Vite config in apps/web/vite.config.ts
export default defineConfig({
  // ... existing config
  server: {
    proxy: {
      '/api': 'http://localhost:8003'  // Still points to API
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../..', 'packages/shared')
    }
  }
})
```

#### **5. Create Deployment Tools**
```javascript
// tools/deploy/production.js
const { execSync } = require('child_process');
const fs = require('fs');

async function deployProduction() {
  console.log('🚀 Deploying to production...');
  
  // Build all workspaces
  execSync('npm run build --workspaces', { stdio: 'inherit' });
  
  // Create release package
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const releaseDir = `release-${timestamp}`;
  
  fs.mkdirSync(releaseDir);
  execSync(`cp -r apps/api/* ${releaseDir}/api/`);
  execSync(`cp -r apps/web/build/* ${releaseDir}/web/`);
  execSync(`tar -czf ${releaseDir}.tar.gz ${releaseDir}`);
  
  // Deploy via SCP
  execSync(`scp ${releaseDir}.tar.gz deploy@185.253.72.80:/tmp/`);
  
  // Remote deployment script
  execSync(`ssh deploy@185.253.72.80 'cd /tmp && tar -xzf ${releaseDir}.tar.gz && sudo cp -r ${releaseDir}/* /opt/bankimonline/releases/${timestamp}/ && sudo ln -sfn /opt/bankimonline/releases/${timestamp} /opt/bankimonline/current && sudo systemctl restart bankimonline'`);
  
  console.log('✅ Production deployment complete!');
}

deployProduction().catch(console.error);
```

### **🏭 Production Environment Changes**

#### **1. Update Service Configuration**
```bash
# Update systemd service for new structure
sudo systemctl edit bankimonline
```

```ini
[Service]
WorkingDirectory=/opt/bankimonline/current/api
EnvironmentFile=/opt/bankimonline/shared/env/.env
```

#### **2. Update Nginx for New Structure**
```nginx
# Update /etc/nginx/sites-available/bankimonline
server {
    listen 80;
    server_name admin.bankimonline.com;
    
    # Frontend (new location)
    location / {
        root /opt/bankimonline/current/web;
        try_files $uri $uri/ /index.html;
    }
    
    # API (new location)
    location /api {
        proxy_pass http://localhost:8004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### **3. Test New Deployment**
```bash
# Test deployment process
curl http://admin.bankimonline.com/api/health
curl http://admin.bankimonline.com/

# Check logs
sudo journalctl -u bankimonline -f
```

---

## 🎯 **Summary of Changes**

### **Development Workflow Changes:**
```bash
# BEFORE (complex)
cd ~/Projects/bankDev2_standalone
npm run dev  # Start both servers
# Deploy: Manual SSH, git pull from 3 repos, build, restart

# AFTER Phase 1 (simplified)  
cd ~/Projects/bankDev2_standalone
npm run dev  # Same development experience
git push origin main  # Triggers automatic deployment

# AFTER Phase 2 (professional)
cd ~/Projects/bankimonline-platform
npm run dev  # Starts all workspaces
npm run deploy:production  # Professional deployment
```

### **Production Changes:**
```bash
# BEFORE
/var/www/bankim/online/
├── api/    # Manual git pull
├── web/    # Manual git pull  
└── shared/ # Manual git pull

# AFTER
/opt/bankimonline/
├── current → releases/20250817-143022/  # Atomic deployments
├── releases/
│   ├── 20250817-143022/  # Current
│   └── 20250817-142551/  # Previous (rollback ready)
└── shared/
    ├── env/     # Environment variables
    ├── uploads/ # User uploads
    └── logs/    # Application logs
```

### **Key Benefits:**
- ✅ **Zero downtime deployments** (atomic symlink switch)
- ✅ **Automatic rollback** capability (keep last 5 releases)
- ✅ **Single source of truth** (workspace repository)
- ✅ **Professional deployment** (CI/CD pipeline)
- ✅ **Easier development** (monorepo benefits)

### **Migration Timeline:**
- **Day 1**: Phase 1 implementation
- **Day 2-3**: Testing and validation
- **Week 2**: Phase 2 restructuring
- **Week 3**: Team training and documentation
- **Week 4**: Remove old archived directories