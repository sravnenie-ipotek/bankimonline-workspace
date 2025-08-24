# 🛡️ BULLETPROOF DEPLOYMENT SYSTEM

**BankiMonline Banking Application - Comprehensive Deployment Architecture**

> **Status**: ✅ BULLETPROOF - Self-healing, monitored, and failure-resistant  
> **Last Updated**: January 24, 2025  
> **System Health**: All 5-point validation checks passing  

## 🏗️ System Architecture

### Deployment Infrastructure

```
┌─────────────────┐    ┌─────────────────┐
│   TEST SERVER   │    │   PROD SERVER   │
│  45.83.42.74    │    │ 185.253.72.80   │
├─────────────────┤    ├─────────────────┤
│ dev2.bankim...  │    │ bankimonline.com│
│ PM2 + NGINX     │    │ PM2 + Apache    │
│ Blue-Green      │    │ Blue-Green      │
│ Self-Healing    │    │ Self-Healing    │
└─────────────────┘    └─────────────────┘
        │                       │
        └───────┬───────────────┘
                │
        ┌───────▼───────┐
        │ GitHub Actions│
        │   CI/CD       │
        │ Auto Deploy   │
        └───────────────┘
```

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + PostgreSQL (Railway)
- **Process Manager**: PM2 with clustering
- **Web Server**: NGINX (test) / Apache (production)
- **SSL**: Let's Encrypt certificates
- **Deployment**: Blue-Green with automatic rollback
- **Monitoring**: Self-healing every 2 minutes

## 🚀 Deployment Workflow

### Automatic Deployment Triggers
1. **Push to `develop` branch** → Deploys to TEST server (dev2.bankimonline.com)
2. **Push to `main` branch** → Deploys to PRODUCTION server (bankimonline.com)
3. **Manual dispatch** → Choose environment (test/production/both)

### 🏗️ Production-Grade Branching Strategy

**Industry Standard Git Flow**:
- **`main` (PRODUCTION)** 🎯 - Production-ready code only
  - Protected branch with manual approval required
  - Deploys to PROD Server (185.253.72.80)
  - Only hotfixes and approved merges from develop
  
- **`develop` (STAGING/TEST)** 🧪 - Integration branch
  - Auto-deploys to TEST Server (45.83.42.74)
  - Integration branch for all feature development
  - Must pass all CI checks before merge to main
  
- **`feature/*` (DEVELOPMENT)** 💻 - Short-lived branches
  - Feature development and bug fixes
  - Must pass CI before merge to develop
  - Never deploy to any server directly

### Deployment Steps
1. **Build Phase**
   - Install dependencies (backend + frontend)
   - Update version using `simple-version.js`
   - Build React application
   - Create deployment package

2. **Pre-Deployment Validation**
   - Disk space check (fail if >90% usage)
   - NGINX configuration syntax validation
   - Create blue-green deployment structure

3. **Blue-Green Deployment**
   - Deploy to inactive slot (blue/green)
   - Install dependencies on target server
   - Configure NGINX/Apache with proper routing
   - Start PM2 process in new environment

4. **5-Point Health Validation**
   - ✅ PM2 Process Status (online)
   - ✅ API Health Endpoint (HTTP 200)
   - ✅ HTTPS Frontend Access (HTTP 200)
   - ✅ API via HTTPS Proxy (HTTP 200)
   - ✅ HTTP→HTTPS Redirect (HTTP 301)

5. **Traffic Switching**
   - Update NGINX/Apache configuration
   - Switch traffic to new deployment
   - Final health check validation

6. **Monitoring Setup**
   - Install self-healing monitoring script
   - Configure crontab for automatic monitoring
   - Setup alerting and logging

## 🔧 Server Configuration

### Test Server (45.83.42.74)
```bash
# Domain: dev2.bankimonline.com
# Path: /var/www/bankim/
# Process: bankim-api (PM2)
# Web Server: NGINX with HTTPS
# SSL: Let's Encrypt certificates
# Monitoring: Every 2 minutes
```

### Production Server (185.253.72.80)
```bash
# Domain: bankimonline.com
# Path: /var/www/bankim/
# Process: bankim-api (PM2 cluster mode)
# Web Server: Apache with proxy
# SSL: Standard certificates
# Monitoring: Every 5 minutes
```

## 🛡️ Self-Healing Monitoring System

### Monitoring Frequency
- **Test Server**: Every 2 minutes
- **Production Server**: Every 5 minutes

### Health Checks Performed
1. **PM2 Process Health** - Ensures API server is online
2. **API Endpoint Health** - Direct API connectivity test
3. **NGINX/Apache Status** - Web server operational check
4. **HTTPS Frontend** - Public website accessibility
5. **HTTPS API Proxy** - API routing through web server
6. **System Resources** - Disk space, memory usage
7. **Response Time** - API performance monitoring

### Automatic Recovery Actions
- **PM2 Issues** → Restart or recreate PM2 process
- **NGINX Issues** → Reload or restart NGINX service  
- **Full Stack Issues** → Complete service stack recovery
- **Resource Issues** → Cleanup logs, restart services
- **Performance Issues** → Process restart if response >2s

### Recovery Limits
- Maximum 5 recovery attempts per cycle
- Reset counter on successful recovery
- Manual intervention alert if limit exceeded

## 🔍 Health Validation Scripts

### Comprehensive Health Check
```bash
# Run 5-point validation
./scripts/comprehensive-health-check.sh [test|production] [domain]

# Examples:
./scripts/comprehensive-health-check.sh test
./scripts/comprehensive-health-check.sh production
```

### Self-Healing Monitor
```bash
# Manual execution
./scripts/self-healing-monitor.sh

# Automatic execution (crontab)
*/2 * * * * /var/www/bankim/scripts/self-healing-monitor.sh
```

### Database Health Check
```bash
# Verify database connectivity
node server/health-check.js
```

## 📊 Version Management

### Version System
- **Simple Version**: `0.x` format (auto-incremented)
- **Package Version**: `5.x` format (semantic versioning)
- **Build Info**: Generated in `mainapp/src/config/buildInfo.ts`

### Version Display
```javascript
export const BUILD_INFO = {
  version: '0.20',
  buildTime: '08:29 24.08.2025',
  environment: 'production',
  buildNumber: '624',
  commit: '84ad5932'
};
```

### Version Update Process
1. `simple-version.js` increments version on each build
2. Updates `scripts/simple-version.txt`
3. Generates `buildInfo.ts` with metadata
4. Version chip in UI updates automatically

## 🚨 Emergency Procedures

### Deployment Failure Recovery
1. **Automatic Rollback** - Blue-green deployment switches back
2. **Manual Rollback** - SSH to server and switch slots
3. **Emergency Fix** - Direct server intervention

### Manual Rollback Commands
```bash
# Test server
ssh root@45.83.42.74
cd /var/www/bankim
CURRENT=$(readlink current | xargs basename)
ROLLBACK=$([ "$CURRENT" = "blue" ] && echo "green" || echo "blue")
ln -sfn /var/www/bankim/$ROLLBACK /var/www/bankim/current
pm2 restart bankim-api
systemctl reload nginx
```

### Health Check Failure Response
1. **Single Failure** - Target service restart
2. **Multiple Failures** - Full stack recovery
3. **Critical Failures** - Alert and manual intervention
4. **Resource Issues** - Cleanup and service restart

## 🔐 Security Configuration

### SSL/HTTPS Setup
- **Test Server**: Let's Encrypt certificates (auto-renewal)
- **Production Server**: Standard SSL certificates
- **HTTPS Redirect**: All HTTP traffic redirected to HTTPS
- **Security Headers**: X-Frame-Options, X-XSS-Protection, etc.

### Access Control
- **SSH Access**: Key-based authentication
- **Server Access**: Root access with secure passwords
- **API Security**: CORS configuration for multiple origins
- **Database**: Railway hosted with secure connection strings

## 📈 Performance Optimization

### Caching Strategy
- **Static Assets**: 1-year cache expiration
- **API Responses**: No-cache for dynamic content
- **NGINX/Apache**: Proper cache headers configured

### Resource Management
- **PM2 Clustering**: Production uses all available cores
- **Memory Monitoring**: Automatic restart if >90% usage
- **Disk Cleanup**: Automatic log rotation and cleanup
- **Connection Pooling**: Database connection optimization

## 🔍 Monitoring and Alerting

### Log Files
- **Self-Healing**: `/var/www/bankim/self-healing.log`
- **Alerts**: `/var/www/bankim/alerts.log`
- **Health Check**: `/var/www/bankim/health-check.log`
- **NGINX**: `/var/log/nginx/error.log`
- **PM2**: `~/.pm2/logs/`

### Alert Triggers
- Deployment health check failures
- Resource usage above thresholds
- API response time degradation
- Service restart events
- Recovery attempt limits reached

## 🛠️ Maintenance Commands

### Daily Maintenance
```bash
# Check system health
./scripts/comprehensive-health-check.sh

# View monitoring logs
tail -f /var/www/bankim/self-healing.log

# Check PM2 status
pm2 status
pm2 monit

# Check NGINX status
systemctl status nginx
nginx -t
```

### Weekly Maintenance
```bash
# Log cleanup
find /var/www/bankim -name "*.log" -mtime +7 -delete

# Check SSL certificates
certbot certificates

# Review alert logs
cat /var/www/bankim/alerts.log | grep "$(date -d '7 days ago' '+%Y-%m-%d')"
```

### Monthly Maintenance
```bash
# System updates
apt update && apt upgrade

# PM2 update
npm update -g pm2
pm2 update

# Certificate renewal
certbot renew --dry-run
```

## 🚀 Deployment Best Practices

### Pre-Deployment Checklist
- [ ] All tests pass locally
- [ ] Version number updated
- [ ] Database migrations tested
- [ ] Translation files synchronized
- [ ] No sensitive data in commits

### Post-Deployment Checklist
- [ ] 5-point health validation passes
- [ ] Version chip displays correctly
- [ ] All banking features functional
- [ ] API endpoints responding
- [ ] SSL certificates valid
- [ ] Monitoring active

### Emergency Contacts
- **DevOps Team**: Immediate deployment issues
- **Development Team**: Application functionality issues  
- **Infrastructure Team**: Server and network issues

---

## 🎉 SUCCESS METRICS

**Current System Status**: ✅ BULLETPROOF

- ✅ Zero-downtime deployments
- ✅ Automatic failure recovery
- ✅ Comprehensive health monitoring
- ✅ Blue-green deployment strategy
- ✅ SSL/HTTPS security enforced
- ✅ Performance optimization active
- ✅ Resource monitoring enabled
- ✅ Automatic rollback capability

**The BankiMonline deployment system is now bulletproof and self-healing!** 🛡️