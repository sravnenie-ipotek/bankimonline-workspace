# 🚀 Professional CI/CD Pipeline Deployment Guide

**Target Performance: <2 minute deployments with zero-downtime blue-green strategy**

## 📋 Overview

This document describes the optimized Docker-based CI/CD pipeline designed to reduce deployment time from ~15 minutes to under 2 minutes while maintaining enterprise-grade reliability and security.

### Key Improvements
- **90% faster deployments** (15min → <2min)
- **Zero-downtime deployments** with blue-green strategy
- **Automated rollback** on health check failures
- **Container-based architecture** with dependency caching
- **Comprehensive monitoring** and alerting
- **Enterprise-grade security** and validation

## 🏗️ Architecture Components

### 1. Docker Multi-Stage Build (`Dockerfile.optimized`)
- **Stage 1**: Dependencies (cached layer)
- **Stage 2**: Build environment 
- **Stage 3**: Production runtime with PM2

**Key Optimizations:**
- Dependency caching for faster builds
- Multi-stage approach reduces final image size
- Security hardening with non-root user
- Built-in health checks

### 2. GitHub Actions Workflow (`.github/workflows/deploy-optimized.yml`)
- **Build Stage**: Container build and testing
- **Deploy Stage**: Blue-green deployment with health checks
- **Notification Stage**: Status reporting

**Performance Features:**
- Parallel build and test execution
- Container registry caching
- Automated health validation
- Immediate rollback on failure

### 3. PM2 Ecosystem (`ecosystem.production.js`)
- Optimized cluster configuration
- Memory management and restart policies
- Health monitoring integration
- Performance optimization

### 4. Monitoring & Health Checks
- **health-check.sh**: Comprehensive system validation
- **monitor.sh**: Continuous monitoring with alerting
- **rollback.sh**: Emergency rollback procedures

## 🚀 Quick Start

### Prerequisites
1. **Docker** installed on target server (45.83.42.74)
2. **GitHub Secrets** configured:
   - `SSH_PRIVATE_KEY`: SSH key for server access
   - `TEST_SERVER_PASSWORD`: Server password (for rsync fallback)
3. **Server Setup**: Environment files and directories

### Initial Server Setup

```bash
# 1. Create required directories
mkdir -p /app/{logs,uploads}

# 2. Copy environment file
cp .env.production /app/.env.production

# 3. Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Install monitoring scripts
cp scripts/*.sh /app/scripts/
chmod +x /app/scripts/*.sh

# 5. Setup monitoring cron job
echo "*/5 * * * * /app/scripts/monitor.sh --log-file /app/logs/monitor.log --quiet" | crontab -
```

### Environment Configuration

Update `/app/.env.production`:
```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"
CONTENT_DATABASE_URL="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"

# Application Settings
NODE_ENV=production
PORT=8003
JWT_SECRET=84NgAy4hOIa5OWfSO6PI9krbjRac9emKHUUSmBckC6Y=

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://dev2.bankimonline.com,http://45.83.42.74,http://localhost:5173
```

## 🔄 Deployment Process

### Automatic Deployment (Recommended)

**Trigger**: Push to `main` branch
**Duration**: <2 minutes
**Strategy**: Blue-green with automatic rollback

```bash
# Simply push to main branch
git push origin main

# Or trigger manual deployment
gh workflow run "Deploy (Optimized Docker)" --ref main
```

**Deployment Flow:**
1. **Build Stage** (30-60s):
   - Multi-stage Docker build with caching
   - Container health testing
   - Image pushed to GitHub Container Registry

2. **Deploy Stage** (60-90s):
   - Blue-green environment detection
   - New container deployment with health checks
   - Traffic switching with validation
   - Automatic cleanup of old environment

3. **Validation** (10-20s):
   - Comprehensive health checks
   - API endpoint validation
   - Performance metrics verification

### Manual Deployment

```bash
# 1. Build and push image
docker build -f Dockerfile.optimized -t ghcr.io/your-repo/bankimonline:latest .
docker push ghcr.io/your-repo/bankimonline:latest

# 2. SSH to server and deploy
ssh root@45.83.42.74
cd /app

# 3. Run blue-green deployment
./scripts/deploy-blue-green.sh ghcr.io/your-repo/bankimonline:latest
```

## 🩺 Health Checks & Monitoring

### Automated Health Checks

The deployment pipeline includes comprehensive health validation:

```bash
# Run health check manually
./scripts/health-check.sh --verbose

# Check specific environment
./scripts/health-check.sh --port 8004 --environment staging

# JSON output for monitoring
./scripts/health-check.sh --json
```

**Health Check Components:**
- ✅ Port connectivity
- ✅ Health endpoint (`/api/health`)
- ✅ Critical API endpoints
- ✅ Database connectivity
- ✅ Container status
- ✅ Performance metrics

### Continuous Monitoring

```bash
# Start monitoring daemon
./scripts/monitor.sh --interval 300 --log-file /app/logs/monitor.log

# One-time check (for cron)
./scripts/monitor.sh --interval 0 --quiet
```

**Monitoring Features:**
- Health check validation
- Resource usage monitoring
- Container status tracking
- SSL certificate expiry alerts
- Webhook notifications

## 🔄 Rollback Procedures

### Automatic Rollback
Deployments automatically rollback if:
- Health checks fail after 15 attempts
- API endpoints return errors
- Container startup fails

### Manual Emergency Rollback

```bash
# Emergency rollback to last known good state
./scripts/rollback.sh "Production issue detected"

# Check rollback status
./scripts/health-check.sh --verbose
```

**Rollback Process:**
1. Stops problematic environment
2. Starts last known good environment
3. Updates traffic routing
4. Validates system health
5. Cleans up failed deployment

## 🛠️ Troubleshooting

### Common Issues

#### 1. Deployment Stuck or Slow
```bash
# Check container status
docker ps -a | grep bankimonline

# Check logs
docker logs bankimonline-blue
docker logs bankimonline-green

# Check system resources
df -h /
free -h
```

#### 2. Health Checks Failing
```bash
# Detailed health check
./scripts/health-check.sh --verbose --timeout 60

# Check API endpoints manually
curl -v http://localhost:8003/api/health
curl -v http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage
```

#### 3. Database Connection Issues
```bash
# Test database connectivity
docker exec bankimonline-blue node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(r => console.log('DB OK:', r.rows[0])).catch(console.error);
"
```

#### 4. Port Conflicts
```bash
# Check what's using ports
lsof -i :8003
lsof -i :8004

# Kill conflicting processes
pkill -f "node.*server-db.js"
docker stop $(docker ps -q)
```

### Emergency Procedures

#### Complete System Recovery
```bash
# 1. Stop all containers
docker stop $(docker ps -q)
docker rm $(docker ps -aq)

# 2. Pull latest known good image
docker pull ghcr.io/your-repo/bankimonline:latest

# 3. Start fresh environment
docker run -d \
  --name bankimonline-blue \
  --restart unless-stopped \
  -p 8003:8003 \
  --env-file /app/.env.production \
  -v /app/uploads:/app/uploads \
  -v /app/logs:/app/logs \
  ghcr.io/your-repo/bankimonline:latest

# 4. Validate health
./scripts/health-check.sh --verbose
```

#### Database Emergency Recovery
```bash
# Connect to Railway backup
# Check server/docs/PRODUCTION_SAFEGUARDS.md for database recovery procedures
```

## 📊 Performance Metrics

### Target Metrics
- **Deployment Time**: <2 minutes
- **Health Check Response**: <2 seconds
- **Zero Downtime**: 100% uptime during deployments
- **Success Rate**: >99% successful deployments

### Monitoring Dashboard
```bash
# Real-time monitoring
watch -n 5 './scripts/health-check.sh --json | jq ".overall_status"'

# Log analysis
tail -f /app/logs/monitor.log

# Performance tracking
docker stats bankimonline-blue bankimonline-green
```

## 🔐 Security Considerations

### Container Security
- Non-root user execution
- Memory and CPU limits
- Read-only filesystem where possible
- Security scanning in CI/CD

### Network Security
- CORS configuration
- Environment variable protection
- SSL/TLS encryption
- Database connection security

### Access Control
- SSH key-based authentication
- GitHub Container Registry access
- Environment-based secrets management

## 📋 Maintenance

### Regular Tasks

#### Weekly
```bash
# Update base images
docker pull node:20-alpine

# Clean up old images
docker system prune -f

# Review monitoring logs
grep -E "(ERROR|ALERT)" /app/logs/monitor.log
```

#### Monthly
```bash
# Security updates
apt update && apt upgrade -y

# SSL certificate check
./scripts/health-check.sh --verbose | grep certificate

# Performance review
docker stats --no-stream
```

### Backup Procedures
```bash
# Database backup (automated via Railway)
# Application logs backup
tar -czf backup-$(date +%Y%m%d).tar.gz /app/logs

# Configuration backup
cp /app/.env.production /backup/env-$(date +%Y%m%d).backup
```

## 🆘 Support & Escalation

### Emergency Contacts
- **Primary**: Development Team
- **Secondary**: Infrastructure Team
- **Database**: Railway Support

### Escalation Procedures
1. **Level 1**: Automated rollback (health check failure)
2. **Level 2**: Manual intervention required
3. **Level 3**: Database or infrastructure issues

### Documentation Updates
Keep this document updated with:
- New deployment procedures
- Lessons learned from incidents
- Performance optimizations
- Security enhancements

---

**🎉 Deployment pipeline optimized for <2 minute deployments with enterprise-grade reliability!**