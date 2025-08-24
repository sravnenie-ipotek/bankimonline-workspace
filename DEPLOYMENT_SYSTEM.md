# Bulletproof Deployment System - BankimOnline

**Status: ✅ OPERATIONAL & BULLETPROOF**

This document describes the comprehensive, self-healing deployment system implemented for the BankimOnline banking application.

## 🏗️ System Architecture

### Infrastructure Overview
- **Test Server**: 45.83.42.74 (dev2.bankimonline.com)
- **Production Server**: 185.253.72.80 (bankimonline.com)
- **Deployment Pattern**: Blue-Green with automatic rollback
- **Web Server**: NGINX with HTTPS/SSL termination
- **Application Server**: Node.js + PM2 process manager
- **Database**: PostgreSQL on Railway (external)
- **CI/CD**: GitHub Actions with comprehensive validation

### Server Directory Structure
```
/var/www/bankim/
├── current -> green/          # Symlink to active deployment
├── blue/                      # Deployment slot A
├── green/                     # Deployment slot B  
├── monitor.sh                 # Self-healing monitoring
├── deployment-health-check.sh # Comprehensive health validation
├── validate-deployment.sh     # Pre/post deployment validation
├── status.sh                  # System status dashboard
├── monitor.log               # Monitoring activity log
└── deployment.log            # Deployment activity log
```

## 🚀 Deployment Process

### 1. Automated Triggers
- **Test Deployment**: Push to `main` branch
- **Production Deployment**: Push to `production` branch
- **Manual Deployment**: GitHub Actions workflow dispatch

### 2. Blue-Green Deployment Flow
```
1. Determine current slot (blue/green)
2. Deploy to inactive slot
3. Run comprehensive validation
4. Switch traffic to new slot
5. Keep old slot as rollback target
```

### 3. Validation Pipeline
```
Pre-deployment:
├── Disk space check (>90% fails)
├── NGINX config syntax validation
├── PM2 process verification
└── Rollback target availability

Post-deployment:
├── PM2 process online check
├── API health endpoint (HTTP 200)
├── HTTPS frontend accessibility (HTTP 200)
├── API via HTTPS proxy (HTTP 200)
├── HTTP to HTTPS redirect (HTTP 301)
└── Service stability (10-second wait)
```

## 🔍 Monitoring & Self-Healing

### Continuous Monitoring
- **Test Server**: Every 2 minutes
- **Production Server**: Every 5 minutes
- **Automatic Recovery**: PM2 restart, NGINX reload
- **Logging**: All activities logged with timestamps

### Health Check Endpoints
- **Frontend**: https://dev2.bankimonline.com/
- **API Health**: https://dev2.bankimonline.com/api/health
- **Direct API**: http://45.83.42.74:8003/api/health

### Self-Healing Capabilities
```bash
# Automatic recovery actions:
1. PM2 process down → restart bankim-api
2. API health fail → restart application
3. NGINX issues → reload configuration
4. Multiple failures → log critical alert
```

## 🛡️ NGINX Configuration

### Test Server (HTTPS with SSL)
```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name dev2.bankimonline.com 45.83.42.74;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name dev2.bankimonline.com 45.83.42.74;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/dev2.bankimonline.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev2.bankimonline.com/privkey.pem;
    
    # React app
    root /var/www/bankim/current/build;
    
    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:8003;
        # Headers and timeouts configured
    }
    
    # Security headers included
}
```

### Key Features
- ✅ HTTPS enforced with automatic HTTP redirect
- ✅ SSL certificates managed by Let's Encrypt
- ✅ React SPA routing support
- ✅ API proxy with proper headers
- ✅ Static asset caching optimization
- ✅ Security headers included

## 🔄 Rollback System

### Automatic Rollback Triggers
- Health check failures during deployment
- Service unavailability after deployment
- Critical errors in application logs

### Rollback Process
```bash
1. Detect deployment failure
2. Switch symlink to previous slot
3. Restart PM2 processes
4. Reload NGINX configuration
5. Validate rollback success
6. Log rollback completion
```

### Manual Rollback
```bash
# Emergency manual rollback
cd /var/www/bankim
CURRENT_SLOT=$(readlink current | xargs basename)
ROLLBACK_SLOT=$([ "$CURRENT_SLOT" = "blue" ] && echo "green" || echo "blue")
ln -sfn $ROLLBACK_SLOT current
pm2 restart bankim-api
systemctl reload nginx
```

## 📊 Monitoring Scripts

### 1. Deployment Health Check (`deployment-health-check.sh`)
- Comprehensive 5-point validation
- Used by CI/CD pipeline
- Exit codes: 0 (success), 1 (failure)

### 2. Continuous Monitor (`monitor.sh`)
- Runs every 2-5 minutes via cron
- Auto-restart failed services
- Logs all activities

### 3. Status Dashboard (`status.sh`)
- Real-time system status
- Resource utilization
- Recent activity summary

### 4. Deployment Validator (`validate-deployment.sh`)
- Pre-deployment checks
- Post-deployment validation
- Automatic rollback on failure

## 🚨 Emergency Procedures

### Critical Failure Response
```bash
# 1. Check system status
ssh root@45.83.42.74 '/var/www/bankim/status.sh'

# 2. Run comprehensive validation
ssh root@45.83.42.74 '/var/www/bankim/deployment-health-check.sh'

# 3. Manual service restart
ssh root@45.83.42.74 'pm2 restart bankim-api && systemctl reload nginx'

# 4. Check monitoring logs
ssh root@45.83.42.74 'tail -20 /var/www/bankim/monitor.log'
```

### Database Issues
- Database connectivity monitored continuously
- Failed connections logged with timestamps
- Railway database credentials secured in PM2 environment

## 📋 CI/CD Pipeline Features

### Enhanced GitHub Actions Workflow
- **Pre-deployment validation** with disk space and config checks
- **Comprehensive health checks** replacing basic curl tests
- **Automatic rollback** on validation failures
- **Monitoring setup** as part of deployment
- **Detailed logging** and error reporting
- **Security-hardened** NGINX configurations embedded

### Key Improvements Over Previous System
1. **HTTPS First**: All configurations prioritize HTTPS
2. **Conflict Resolution**: Automatic removal of conflicting configs
3. **Comprehensive Testing**: 5-point validation vs basic checks
4. **Self-Healing**: Automatic service recovery
5. **Bulletproof Rollback**: Blue-green with validation
6. **Real-time Monitoring**: Continuous health monitoring
7. **Security Hardened**: Security headers and SSL enforcement

## 🔧 Maintenance Commands

### Daily Operations
```bash
# Check deployment status
/var/www/bankim/status.sh

# View monitoring logs
tail -f /var/www/bankim/monitor.log

# Manual health check
/var/www/bankim/deployment-health-check.sh

# PM2 status
pm2 status
pm2 logs bankim-api --lines 20
```

### Troubleshooting
```bash
# NGINX issues
nginx -t                    # Test config
systemctl status nginx      # Check service
systemctl reload nginx      # Reload config

# PM2 issues
pm2 restart bankim-api     # Restart app
pm2 show bankim-api        # Process details
pm2 logs bankim-api        # View logs

# Deployment issues
ls -la /var/www/bankim/     # Check structure
/var/www/bankim/validate-deployment.sh  # Run validation
```

## 📈 Performance Metrics

### Current System Performance
- **Deployment Time**: ~3-5 minutes (with validation)
- **Health Check Time**: <10 seconds
- **Rollback Time**: <30 seconds
- **Recovery Time**: <2 minutes (automatic)
- **Uptime Target**: >99.9% (monitored continuously)

### Monitoring Intervals
- **Health Checks**: Every 2 minutes (test), 5 minutes (prod)
- **Service Restart**: Automatic on failure detection
- **Log Rotation**: Automatic with timestamps
- **Resource Monitoring**: Disk, memory, load average

## 🎯 Success Criteria

### Deployment Success Requirements
- ✅ PM2 process online
- ✅ API health endpoint responding (HTTP 200)
- ✅ HTTPS frontend accessible (HTTP 200)
- ✅ API accessible via HTTPS proxy (HTTP 200)
- ✅ HTTP correctly redirects to HTTPS (HTTP 301)
- ✅ Services stable for 10+ seconds

### System Health Indicators
- All health checks passing
- No errors in application logs
- PM2 processes running with <80% CPU
- Disk usage <90%
- Response times <3 seconds

## 🔐 Security Features

### HTTPS Implementation
- Let's Encrypt SSL certificates
- Automatic HTTP to HTTPS redirect
- Security headers (XSS, CSRF, Content-Type)
- SSL best practices configuration

### Access Control
- SSH key-based authentication in CI/CD
- No sensitive data in repository
- Environment variables for credentials
- Restricted file permissions on server

## 📞 Support Information

### Server Access
- **Test Server**: root@45.83.42.74
- **Access Method**: SSH keys (CI/CD) or password (emergency)
- **Monitoring**: Automated with manual override capability
- **Logs Location**: `/var/www/bankim/*.log`

### Escalation Path
1. **Automatic Recovery**: Self-healing systems attempt fix
2. **Alert Generation**: Critical issues logged with timestamps
3. **Manual Intervention**: SSH access for troubleshooting
4. **Rollback Activation**: Blue-green rollback if needed
5. **Emergency Contact**: Server credentials available for emergency access

---

**Last Updated**: August 24, 2025
**System Status**: ✅ OPERATIONAL & BULLETPROOF
**Next Review**: Monthly system health assessment