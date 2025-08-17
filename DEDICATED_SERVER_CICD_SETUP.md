# 🚀 Dedicated Server CI/CD Setup Guide

## 🎯 **How CI/CD Works with Dedicated Server**

### **The Complete Flow: Git Push → Production**

```mermaid
graph TB
    A["👨‍💻 Developer"] --> B["git push origin main"]
    B --> C["🚀 GitHub Actions Triggered"]
    C --> D["🧪 Quality Gates<br/>(tests, lint, coverage)"]
    D --> E["🏗️ Build Artifacts<br/>(frontend build + backend)"]
    E --> F["📦 Package Release<br/>(tar.gz with SHA)"]
    F --> G["🚀 Upload to Server<br/>(SCP via SSH)"]
    G --> H["🔄 Atomic Deployment<br/>(symlink switch)"]
    H --> I["🔃 PM2 Reload<br/>(zero downtime)"]
    I --> J["🏥 Health Check"]
    J --> K["✅ Deployment Complete"]
    
    style A fill:#e3f2fd
    style K fill:#c8e6c9
```

## 🏗️ **Server Directory Structure**

```
/opt/bankimonline/
├── releases/                    # All deployments by commit SHA
│   ├── abc123def/              # Each deployment
│   │   ├── mainapp/build/      # Frontend production build
│   │   └── server/             # Backend application
│   └── def456ghi/              # Previous deployment (for rollback)
├── shared/                      # Persistent data across deployments
│   ├── .env                    # Production environment variables
│   ├── uploads/                # User uploaded files
│   └── logs/                   # Application logs
└── current → releases/abc123def # Symlink to active deployment
```

## ⚙️ **Required GitHub Secrets Configuration**

### **1. Server Access Secrets**

```bash
# In GitHub repository: Settings → Secrets and variables → Actions

PROD_HOST=185.253.72.80           # Your server IP/hostname
PROD_USER=deploy                  # SSH user (not root!)
PROD_SSH_KEY=-----BEGIN OPENSSH   # Private SSH key content
PROD_PORT=22                      # SSH port (optional, defaults to 22)
```

### **2. Generate SSH Deploy Key**

```bash
# On your local machine
ssh-keygen -t ed25519 -f ~/.ssh/bankimonline_deploy -C "bankimonline-deploy"

# Copy public key to server
ssh-copy-id -i ~/.ssh/bankimonline_deploy.pub deploy@185.253.72.80

# Copy private key content to GitHub secret PROD_SSH_KEY
cat ~/.ssh/bankimonline_deploy  # Copy this entire content
```

### **3. Create Deploy User on Server**

```bash
# On server (as root)
sudo useradd -m -s /bin/bash deploy
sudo mkdir -p /opt/bankimonline/{releases,shared/uploads,shared/logs}
sudo chown -R deploy:deploy /opt/bankimonline

# Setup deploy user permissions
sudo usermod -aG www-data deploy  # If using nginx
echo "deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx" | sudo tee /etc/sudoers.d/deploy
```

## 🔄 **Complete Deployment Workflow**

### **Step 1: Developer Push (Manual)**
```bash
# Developer workflow
git add .
git commit -m "feat: new banking feature"
git push origin main  
# ↳ This automatically triggers the entire CI/CD pipeline
```

### **Step 2: GitHub Actions CI (Automated)**
```yaml
# Automatically runs in GitHub's cloud:
1. Quality Gates (2-3 minutes)
   - Run all tests
   - Check code coverage
   - Lint code quality
   
2. Build Artifacts (3-5 minutes)
   - npm run build (frontend)
   - Package release.tgz
   - Upload artifacts
   
3. Deploy to Server (2-3 minutes)
   - SCP upload to server
   - Extract to /opt/bankimonline/releases/SHA/
   - Link shared resources
   - Atomic symlink switch
   - PM2 zero-downtime reload
   - Health check verification
```

### **Step 3: Server Deployment (Automated)**
```bash
# All happens automatically on server:
1. Extract release package to releases/SHA/
2. Link shared resources (.env, uploads, logs)
3. Run database migrations (if any)
4. Atomic symlink switch: current → releases/SHA/
5. PM2 reload with zero downtime
6. Health check verification
7. Cleanup old releases (keep last 5)
```

## 🎛️ **Production Environment Setup**

### **1. Server Environment File**
```bash
# /opt/bankimonline/shared/.env
NODE_ENV=production
PORT=8004

# Database (Railway)
DATABASE_URL=postgresql://postgres:pass@host:port/railway
CONTENT_DATABASE_URL=postgresql://postgres:pass@host:port/railway

# Security
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

# CORS for production domain
CORS_ALLOWED_ORIGINS=https://bankimonline.com,https://www.bankimonline.com

# File uploads
UPLOAD_PATH=/opt/bankimonline/shared/uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE=/opt/bankimonline/shared/logs/server.log
```

### **2. PM2 Production Configuration**
```bash
# /opt/bankimonline/shared/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'bankim-api',
    script: '/opt/bankimonline/current/server/server-db.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 8004
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_file: '/opt/bankimonline/shared/logs/pm2.log',
    time: true
  }]
}
```

## 🚀 **Deployment Commands**

### **Automatic Deployment (Recommended)**
```bash
# Just push to main branch - everything else is automatic!
git push origin main
```

### **Manual Deployment (Emergency)**
```bash
# If you need to deploy manually:
gh workflow run deploy-production.yml

# Or with specific environment:
gh workflow run deploy-production.yml -f environment=staging
```

### **Rollback to Previous Version**
```bash
# On server (emergency rollback)
ssh deploy@185.253.72.80
cd /opt/bankimonline/releases
ls -t  # See available releases
sudo ln -sfn /opt/bankimonline/releases/PREVIOUS_SHA /opt/bankimonline/current
pm2 reload bankim-api
```

## 🏥 **Monitoring & Health Checks**

### **Automated Health Checks**
```bash
# Built into deployment pipeline:
1. Application startup verification
2. HTTP endpoint health check
3. PM2 process status
4. Database connectivity
5. Recent error log review
```

### **Manual Health Verification**
```bash
# Check deployment status
curl -f https://bankimonline.com/api/health
pm2 status bankim-api
pm2 logs bankim-api --lines 20

# Check server resources
df -h /opt/bankimonline
free -h
```

## 🔧 **Benefits of This CI/CD Approach**

### **✅ Advantages**
- **Zero Downtime**: Atomic symlink switch with PM2 reload
- **Automatic Rollback**: Keep last 5 releases for easy rollback
- **Quality Gates**: No broken code reaches production
- **Build Once, Deploy Anywhere**: Artifacts built in CI
- **Security**: No git/npm on production server
- **Scalability**: Easy to extend to multiple servers
- **Audit Trail**: Full deployment history in GitHub

### **🚫 Eliminates Problems**
- No more "works on my machine" issues
- No building on production server (security risk)
- No manual deployment steps (human error)
- No server downtime during deployments
- No environment drift between dev/prod

## 🚨 **Emergency Procedures**

### **If Deployment Fails**
```bash
# Automatic rollback (built into pipeline)
# Or manual rollback:
ssh deploy@185.253.72.80
ln -sfn /opt/bankimonline/releases/LAST_GOOD_SHA /opt/bankimonline/current
pm2 reload bankim-api
```

### **If Application Won't Start**
```bash
# Check logs
pm2 logs bankim-api --lines 50
# Check environment
cat /opt/bankimonline/shared/.env
# Restart with fresh config
pm2 delete bankim-api
pm2 start /opt/bankimonline/shared/ecosystem.config.js --env production
```

---

## 🎉 **Result: Professional CI/CD Pipeline**

**Before**: `git push` → wait → manual server login → manual build → manual restart → hope it works

**After**: `git push` → ☕ coffee → ✅ production deployed automatically with zero downtime

**Total Time**: ~8-10 minutes from push to live production (fully automated)

This is production-grade CI/CD suitable for banking applications with proper quality gates, security, and reliability.

