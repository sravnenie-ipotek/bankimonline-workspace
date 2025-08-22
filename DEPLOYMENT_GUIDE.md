# 🚀 Deployment Guide - BankimOnline

## Server Infrastructure

| Environment | IP Address | Domain | SSH Access |
|------------|------------|--------|------------|
| **TEST** | 45.83.42.74 | dev2.bankimonline.com | `ssh root@45.83.42.74` |
| **PRODUCTION** | 185.253.72.80 | bankimonline.com | `ssh root@185.253.72.80` |

## Deployment Methods

### 1️⃣ Quick Manual Deployment (1-2 minutes)

#### Deploy to TEST
```bash
# Single file change
rsync -avz [changed-file] root@45.83.42.74:/var/www/bank-dev2/[path]
ssh root@45.83.42.74 "pm2 restart bankim-api"

# Full deployment
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@45.83.42.74:/var/www/bank-dev2/
ssh root@45.83.42.74 "cd /var/www/bank-dev2 && npm install --production && pm2 restart bankim-api"
```

#### Deploy to PRODUCTION
```bash
# Single file change
rsync -avz [changed-file] root@185.253.72.80:/var/www/bank-prod/[path]
ssh root@185.253.72.80 "pm2 restart bankim-api"

# Full deployment
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@185.253.72.80:/var/www/bank-prod/
ssh root@185.253.72.80 "cd /var/www/bank-prod && npm install --production && pm2 restart bankim-api"
```

### 2️⃣ GitHub Actions CI/CD (Automatic)

#### Setup Required Secrets
In GitHub repository settings → Secrets → Actions:

1. **TEST_SSH_KEY**: Private SSH key for test server
2. **PROD_SSH_KEY**: Private SSH key for production server

#### Generate SSH Keys
```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f deploy_key -N ""

# Add public key to server
ssh-copy-id -i deploy_key.pub root@45.83.42.74  # Test
ssh-copy-id -i deploy_key.pub root@185.253.72.80  # Production

# Copy private key content for GitHub secret
cat deploy_key
```

#### Deployment Triggers

| Action | Result |
|--------|--------|
| Push to `main` branch | Auto-deploy to TEST |
| Push to `production` branch | Auto-deploy to PRODUCTION |
| Manual workflow dispatch | Choose TEST, PROD, or BOTH |

### 3️⃣ Emergency Rollback

#### Test Server
```bash
ssh root@45.83.42.74
cd /var/www/bank-dev2
git log --oneline -5
git checkout HEAD~1 -- .
pm2 restart bankim-api
```

#### Production Server
```bash
ssh root@185.253.72.80
cd /var/www/bank-prod
# Restore from backup
tar -xzf /tmp/backup-[timestamp].tar.gz
pm2 restart bankim-api
```

## Deployment Checklist

### Pre-Deployment
- [ ] Code tested locally
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Database migrations reviewed
- [ ] Environment variables verified

### During Deployment
- [ ] Health check passes (`/api/health`)
- [ ] Database connectivity confirmed
- [ ] Critical endpoints tested
- [ ] No console errors

### Post-Deployment
- [ ] User flows tested
- [ ] Performance metrics normal
- [ ] Error logs monitored
- [ ] Rollback plan ready

## Key Files & Configurations

### Critical Configuration Files
- `server/config/database-core.js` - Database connections (Railway PostgreSQL)
- `server/server-db.js` - Main API server
- `ecosystem.config.js` - PM2 configuration
- `.env.production` - Production environment variables

### Database Configuration
Both TEST and PRODUCTION use Railway PostgreSQL:
- **Main DB**: `postgresql://...@maglev.proxy.rlwy.net:43809/railway`
- **Content DB**: `postgresql://...@shortline.proxy.rlwy.net:33452/railway`

## Monitoring & Health Checks

### Quick Health Check
```bash
# Test environment
curl https://dev2.bankimonline.com/api/health

# Production environment
curl https://bankimonline.com/api/health
```

### PM2 Monitoring
```bash
# View process status
pm2 status

# View logs
pm2 logs bankim-api --lines 100

# Monitor resources
pm2 monit
```

### Database Validation
```bash
curl "https://[domain]/api/v1/calculation-parameters?business_path=mortgage"
```

## Deployment Best Practices

1. **Always deploy to TEST first** - Validate changes before production
2. **Use feature branches** - Merge to main for test, production branch for prod
3. **Monitor after deployment** - Watch logs for 5-10 minutes
4. **Keep backups** - Automated backups before each production deployment
5. **Document changes** - Update CHANGELOG.md with deployment notes

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| PM2 not found | `npm install -g pm2` |
| Port 8003 in use | `lsof -i :8003` then `kill -9 [PID]` |
| Database connection failed | Check Railway status and credentials |
| Build fails | Clear cache: `rm -rf node_modules mainapp/node_modules` |

## Contact & Support

- **Test Server**: dev2.bankimonline.com (45.83.42.74)
- **Production Server**: bankimonline.com (185.253.72.80)
- **Database**: Railway PostgreSQL (managed service)
- **Process Manager**: PM2 with ecosystem.config.js