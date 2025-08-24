# 🎯 BULLETPROOF GIT FLOW - Developer Guide

**BankiMonline Banking Application - Complete Development Workflow**

> **Status**: ✅ BULLETPROOF - Industry standard Git flow with automated deployments  
> **Last Updated**: 24.08.2005
> **System**: Bulletproof self-healing deployment system with 5-point validation  

## 📋 COMPLETE DEVELOPMENT WORKFLOW

### **Step 1: Feature Development**
```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create feature branch for your work
git checkout -b feature/your-feature-name

# Do your development work
# ... make changes, commit as needed ...
git add .
git commit -m "feat: implement your feature"
```

### **Step 2: Merge to Develop (Deploy to TEST)**
```bash
# When feature is ready, merge to develop
git checkout develop
git pull origin develop  # Get latest changes
git merge feature/your-feature-name

# Push to develop = AUTOMATIC TEST DEPLOYMENT
git push origin develop
```

**🧪 THIS TRIGGERS**: Automatic deployment to **TEST server** (45.83.42.74 - dev2.bankimonline.com)

### **Step 3: Test on TEST Environment**
- Visit: https://dev2.bankimonline.com
- Test your changes thoroughly
- Verify all banking features work
- Check version chip updated

### **Step 4: Deploy to Production**
```bash
# When testing is complete, merge develop to main
git checkout main
git pull origin main  # Get latest
git merge develop

# Push to main = AUTOMATIC PRODUCTION DEPLOYMENT  
git push origin main
```

**🚀 THIS TRIGGERS**: Automatic deployment to **PRODUCTION server** (185.253.72.80 - bankimonline.com)

## 🛡️ BULLETPROOF SYSTEM AUTOMATED ACTIONS

### **On `develop` push** (TEST deployment):
1. ✅ Build frontend and backend
2. ✅ Run 5-point health validation
3. ✅ Deploy to TEST server with blue-green
4. ✅ Activate self-healing monitoring
5. ✅ Update version chip
6. ✅ Send deployment report

### **On `main` push** (PROD deployment):  
1. ✅ Build production-optimized code
2. ✅ Deploy to PRODUCTION server with blue-green
3. ✅ Run comprehensive banking validation
4. ✅ Activate enhanced self-healing monitoring
5. ✅ Verify all banking features operational
6. ✅ Generate production deployment report

## 🚨 BRANCH RULES & FLOW

### **✅ CORRECT Industry Standard Flow:**
```
feature/my-feature → develop → main
       ↓              ↓        ↓
    (local)        (TEST)   (PROD)
```

**Branch Mapping:**
- **`develop` branch** → TEST server (45.83.42.74 - dev2.bankimonline.com)
- **`main` branch** → PRODUCTION server (185.253.72.80 - bankimonline.com)
- **`feature/*` branches** → Local development only

### **❌ NEVER Do This:**
- Don't push directly to `main` without testing on `develop` first
- Don't use the old `production` branch (it's deprecated)
- Don't deploy feature branches directly
- Don't skip the TEST environment

## 🔄 TYPICAL DAILY WORKFLOW

### **Morning: Start New Feature**
```bash
# Start from latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/mortgage-calculator-fix
```

### **Development: Work on Feature**
```bash
# Make your changes
# ... code, test, commit ...
git add .
git commit -m "feat: improve mortgage calculator validation"

# Continue development as needed
git add .
git commit -m "fix: handle edge case for property ownership"
```

### **Ready for Testing: Deploy to TEST**
```bash
# Merge to develop for testing
git checkout develop
git pull origin develop  # Always get latest
git merge feature/mortgage-calculator-fix

# Deploy to TEST environment
git push origin develop  # 🧪 AUTO-DEPLOYS TO TEST
```

**🧪 Monitor deployment**: https://github.com/sravnenie-ipotek/bankimonline-workspace/actions
**🧪 Test your changes**: https://dev2.bankimonline.com

### **Testing Phase**
1. **Functional Testing**: Test all banking features affected by your changes
2. **Mortgage Calculator**: Verify calculations work correctly
3. **Multi-language**: Test EN/HE/RU language switching
4. **SMS Authentication**: Verify login process
5. **Version Check**: Confirm version chip updated
6. **Performance**: Check page load times and API responses

### **Ready for Production: Deploy to PROD**
```bash
# After successful testing, deploy to production
git checkout main
git pull origin main
git merge develop

# Deploy to PRODUCTION
git push origin main  # 🚀 AUTO-DEPLOYS TO PRODUCTION
```

**🚀 Monitor deployment**: https://github.com/sravnenie-ipotek/bankimonline-workspace/actions
**🚀 Verify production**: https://bankimonline.com

### **Cleanup: Delete Feature Branch**
```bash
# Clean up feature branch after successful deployment
git branch -d feature/mortgage-calculator-fix
git push origin --delete feature/mortgage-calculator-fix
```

## 📊 DEPLOYMENT MONITORING

### **GitHub Actions Dashboard**
- **CI/CD Pipeline**: https://github.com/sravnenie-ipotek/bankimonline-workspace/actions
- **Real-time Status**: Monitor deployments in progress
- **Build Logs**: View detailed deployment information
- **Failure Alerts**: Automatic notifications on issues

### **Environment URLs**
- **Test Environment**: https://dev2.bankimonline.com
- **Production Environment**: https://bankimonline.com
- **API Health Check**: https://bankimonline.com/api/health

### **Deployment Health Validation**
The bulletproof system automatically validates:
1. **PM2 Process Status**: API server running correctly
2. **API Health Endpoint**: Backend responding (HTTP 200)
3. **HTTPS Frontend Access**: Website accessible (HTTP 200)
4. **API via HTTPS Proxy**: API routing through web server (HTTP 200)
5. **HTTP→HTTPS Redirect**: Security redirect working (HTTP 301)

## 🛡️ BULLETPROOF SYSTEM FEATURES

### **Self-Healing Monitoring**
- **Frequency**: Every 2 minutes automatic health checks
- **Auto-Recovery**: Automatically restarts failed services
- **Failure Detection**: Proactive issue identification
- **Resource Monitoring**: CPU, memory, disk space tracking

### **Blue-Green Deployment**
- **Zero Downtime**: Seamless deployments without service interruption
- **Automatic Rollback**: Instant rollback on deployment failure
- **Version Switching**: Safe A/B deployment slots (blue/green)
- **Health Validation**: Comprehensive testing before traffic switching

### **Banking-Specific Validation**
- **Critical APIs**: All banking endpoints tested automatically
- **Database Connection**: Railway PostgreSQL connectivity verified
- **Security Checks**: SSL certificates and HTTPS enforcement
- **Feature Testing**: Mortgage calculations, SMS auth, multi-language

## 🚨 EMERGENCY PROCEDURES

### **If Deployment Fails**
The bulletproof system automatically:
1. **Immediate Rollback**: Switch to previous working version
2. **Service Recovery**: Restart failed services automatically  
3. **Alert Generation**: Notify team of issues
4. **Incident Report**: Generate detailed failure analysis

### **Manual Intervention Commands**
```bash
# Check deployment status
git status
git branch --show-current

# View recent deployments
git log --oneline -10

# Emergency rollback (if automatic fails)
# Contact DevOps team - system has automatic rollback
```

### **Health Check Commands**
```bash
# Test local development
npm run dev

# Check API server
curl https://dev2.bankimonline.com/api/health
curl https://bankimonline.com/api/health

# Test database connection
node server/test-railway-simple.js
```

## 🏦 BANKING APPLICATION SPECIFIC GUIDELINES

### **Critical Features to Test**
1. **Mortgage Calculator**: All calculation steps and validations
2. **Credit Applications**: Multi-step form functionality
3. **SMS Authentication**: Phone number verification system
4. **Multi-Language Support**: English, Hebrew, Russian switching
5. **Document Upload**: File upload and processing
6. **Bank Integrations**: API connections to banking systems

### **Version Management**
- **Version Updates**: Automatic version increment on each deployment
- **Version Chip**: Visible version number in UI footer
- **Build Information**: Timestamp and commit hash tracking
- **Release Notes**: Document major changes in commit messages

### **Security Considerations**
- **SSL Certificates**: HTTPS enforced on all environments
- **API Security**: Authentication and authorization validated
- **Data Protection**: Sensitive information handling verified
- **Railway Database**: Secure PostgreSQL connection maintained

## 🔄 CONTINUOUS IMPROVEMENT

### **Performance Monitoring**
- **API Response Times**: < 2 seconds target
- **Page Load Speed**: < 3 seconds on 3G networks
- **Database Performance**: Query optimization tracking
- **Resource Usage**: Server resource monitoring

### **Quality Assurance**
- **Automated Testing**: CI/CD pipeline includes test execution
- **Code Quality**: ESLint and TypeScript validation
- **Security Scanning**: Automated vulnerability detection
- **Dependency Updates**: Regular security patch management

## 📋 QUICK REFERENCE

### **Daily Commands**
```bash
# Start new feature
git checkout develop && git pull origin develop
git checkout -b feature/your-feature-name

# Deploy to test  
git checkout develop && git merge feature/your-feature-name
git push origin develop

# Deploy to production
git checkout main && git merge develop  
git push origin main

# Cleanup
git branch -d feature/your-feature-name
```

### **Key URLs**
- **CI/CD**: https://github.com/sravnenie-ipotek/bankimonline-workspace/actions
- **TEST**: https://dev2.bankimonline.com
- **PROD**: https://bankimonline.com
- **API Health**: /api/health endpoint on both environments

### **Emergency Contacts**
- **DevOps Issues**: Check bulletproof system logs and automatic recovery
- **Banking Features**: Test all critical user flows after deployment
- **Database Issues**: Verify Railway PostgreSQL connectivity

---

## 🎉 SUCCESS CRITERIA

**Deployment is successful when:**
- ✅ All 5-point health validation checks pass
- ✅ Version chip displays new build number
- ✅ All banking features are operational
- ✅ API response times are within targets
- ✅ Self-healing monitoring is active
- ✅ No errors in application logs

**Remember**: The bulletproof deployment system automatically handles failures, monitoring, and recovery. Focus on developing great features - the infrastructure will keep your deployments safe and reliable! 🚀

---

**The BankiMonline bulletproof deployment system ensures zero-downtime deployments with automatic failure recovery. Develop with confidence!** 🛡️