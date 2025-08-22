# 🔐 GitHub Secrets Setup for CI/CD

## Required GitHub Secrets

### 1. TEST_SSH_KEY and PROD_SSH_KEY

Add the following SSH private key to your GitHub repository secrets:

1. Go to: https://github.com/sravnenie-ipotek/bankimonline-workspace/settings/secrets/actions
2. Click "New repository secret"
3. Create two secrets:

#### Secret Name: `TEST_SSH_KEY`
#### Secret Name: `PROD_SSH_KEY`

**Secret Value (use same key for both):**
```
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```

## Deployment Workflow

### Automatic Deployment Triggers

| Action | Result |
|--------|--------|
| **Push to `main` branch** | Deploys to TEST server (dev2.bankimonline.com) |
| **Push to `production` branch** | Deploys to PRODUCTION server (bankimonline.com) |
| **Manual trigger** | Choose TEST, PROD, or BOTH |

### Branch Strategy

```bash
# Normal development flow
git checkout main
git add .
git commit -m "feat: new feature"
git push origin main  # → Deploys to TEST

# Production deployment
git checkout production
git merge main
git push origin production  # → Deploys to PRODUCTION
```

## Server Configuration Summary

### Test Server
- **IP**: 45.83.42.74
- **Domain**: dev2.bankimonline.com
- **Path**: /var/www/bank-dev2
- **Process**: PM2 (bankim-api)

### Production Server
- **IP**: 185.253.72.80
- **Domain**: bankimonline.com
- **Path**: /var/www/bank-prod
- **SSL**: ✅ Let's Encrypt (valid until Nov 2025)
- **Database**: ✅ Railway PostgreSQL connected
- **Process**: Node.js on port 8003

## Verify CI/CD Setup

After adding the secrets:

1. **Test deployment to TEST:**
```bash
git checkout main
echo "# Test deployment" >> README.md
git add . && git commit -m "test: CI/CD deployment"
git push origin main
```

2. **Test deployment to PRODUCTION:**
```bash
git checkout production
git merge main
git push origin production
```

3. **Monitor deployment:**
- Go to: https://github.com/sravnenie-ipotek/bankimonline-workspace/actions
- Watch the workflow execution
- Check deployment logs

## Quick Commands

### Manual Deployment (if CI/CD fails)

**To TEST:**
```bash
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@45.83.42.74:/var/www/bank-dev2/
ssh root@45.83.42.74 "cd /var/www/bank-dev2 && npm install --production && pm2 restart bankim-api"
```

**To PRODUCTION:**
```bash
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@185.253.72.80:/var/www/bank-prod/
ssh root@185.253.72.80 "cd /var/www/bank-prod && npm install --production && node server/server-db.js"
```

## Health Checks

**Test Server:**
```bash
curl https://dev2.bankimonline.com/api/health
```

**Production Server:**
```bash
curl https://bankimonline.com/api/health
```