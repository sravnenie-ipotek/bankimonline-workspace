# =€ Push and Pull Logic Guide for Developers

This guide explains how to push code changes and pull updates using the Bankimonline hybrid 4-repository architecture.

---

## =Ë **OVERVIEW**

**Architecture**: Hybrid Development Monorepo + Deployment Multi-repos
- **Development**: All work happens in `bankimonline-workspace`
- **Deployment**: Code is automatically synced to specialized repositories
- **Workflow**: Dual-push commands handle both workspace and deployment repositories

---

## = **PUSHING CODE CHANGES**

### **Quick Reference - Push Commands**

```bash
# Push specific package changes
npm run push-client     # Push client changes to workspace + web repos
npm run push-server     # Push server changes to workspace + api repos  
npm run push-shared     # Push shared changes to workspace + shared repos

# Push all changes at once
npm run push-all        # Push all changes to workspace + all deployment repos

# Traditional workspace-only push
git push origin main    # Push only to workspace (use for work-in-progress)
```

### **Step-by-Step Push Workflow**

#### **1. Complete Your Development Work**
```bash
# Make sure you're in the workspace root
cd bankimonline-workspace/

# Run tests to verify your changes
npm run test:all

# Build all packages to verify they compile
npm run build:all
```

#### **2. Stage and Commit Your Changes**
```bash
# Check what files have changed
git status

# Add files to staging
git add .

# Or add specific files
git add packages/client/src/components/NewComponent.tsx
git add packages/server/src/routes/newEndpoint.js

# Commit with clear message following conventional commits
git commit -m "feat: add new mortgage calculator feature"
git commit -m "fix: resolve authentication issue in login flow"
git commit -m "docs: update API documentation for content system"
```

#### **3. Choose Your Push Strategy**

**Option A: Push Specific Package (Recommended)**
```bash
# If you only changed client code
npm run push-client

# If you only changed server code  
npm run push-server

# If you only changed shared types/utilities
npm run push-shared
```

**Option B: Push All Changes**
```bash
# If you changed multiple packages
npm run push-all
```

**Option C: Workspace-Only Push (Work in Progress)**
```bash
# For work-in-progress or collaboration
git push origin main
```

#### **4. Verify Push Success**

The dual-push script will show you the results:
```bash
 Pushed to workspace: bankimonline-workspace
 Pushed to deployment: bankimonline-web  
=€ Deployment pipeline triggered automatically
```

---

## =å **PULLING CODE CHANGES**

### **Quick Reference - Pull Commands**

```bash
# Pull latest changes from workspace
git pull origin main

# Pull and update all package dependencies
npm run update:all

# Fresh start (after major changes by other developers)
npm run clean && npm install && npm run build:all
```

### **Step-by-Step Pull Workflow**

#### **1. Pull Latest Changes**
```bash
# Navigate to workspace root
cd bankimonline-workspace/

# Pull latest changes from the development repository
git pull origin main

# Alternative: if you have local changes, use rebase
git pull --rebase origin main
```

#### **2. Update Dependencies** 
```bash
# Install any new dependencies that were added
npm install

# Build shared package if it was updated
npm run shared:build

# Verify everything works
npm run dev:all
```

#### **3. Handle Merge Conflicts** (if any)
```bash
# If there are merge conflicts, resolve them
git status                    # See conflicted files
# Edit files to resolve conflicts
git add .                     # Stage resolved files
git commit                    # Complete the merge

# Test after resolving conflicts
npm run test:all
```

---

## =' **ADVANCED WORKFLOWS**

### **Working with Branches**

#### **Creating a Feature Branch**
```bash
# Create and switch to a new branch
git checkout -b feature/new-mortgage-calculator

# Work on your feature
# ... make changes ...

# Push feature branch to workspace
git push origin feature/new-mortgage-calculator

# Push feature to deployment repos (only when ready)
npm run push-all
```

#### **Merging Feature Branch**
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature branch
git merge feature/new-mortgage-calculator

# Push merged changes
npm run push-all

# Clean up feature branch
git branch -d feature/new-mortgage-calculator
git push origin --delete feature/new-mortgage-calculator
```

### **Emergency Rollback**

#### **Rollback Workspace Only**
```bash
# Find the last good commit
git log --oneline -10

# Revert to previous commit
git revert HEAD
git push origin main
```

#### **Rollback All Repositories**
```bash
# Revert the problematic commit
git revert HEAD

# Push revert to all repositories
npm run push-all
```

### **Working with Large Changes**

#### **Making Changes Across Multiple Packages**
```bash
# Example: Adding a new API endpoint with frontend integration

# 1. Update shared types first
vim packages/shared/src/types/api.ts
npm run shared:build

# 2. Implement server endpoint
vim packages/server/src/routes/mortgage.js
npm run server:test

# 3. Update client to use new endpoint
vim packages/client/src/services/mortgageApi.ts
npm run client:test

# 4. Test full integration
npm run test:all

# 5. Commit and push all changes together
git add .
git commit -m "feat: add advanced mortgage calculator with new API endpoint"
npm run push-all
```

---

## = **COLLABORATION PATTERNS**

### **Daily Development Workflow**

#### **Start of Day**
```bash
# Pull latest changes
git pull origin main

# Update dependencies and build
npm install
npm run build:all

# Start development environment
npm run dev:all
```

#### **During Development**
```bash
# Frequently check for updates from team
git pull origin main

# Push work-in-progress to workspace (without deployment)
git add . && git commit -m "wip: working on feature X"
git push origin main
```

#### **End of Day/Feature Complete**
```bash
# Final testing
npm run test:all
npm run build:all

# Clean commit and push to all repositories
git add .
git commit -m "feat: complete feature X implementation"
npm run push-all
```

### **Team Coordination**

#### **Before Major Changes**
```bash
# Announce to team before making breaking changes
# Pull latest changes to avoid conflicts
git pull origin main

# Create feature branch for major changes
git checkout -b feature/major-refactor
```

#### **After Team Member Pushes Major Changes**
```bash
# Pull their changes
git pull origin main

# Rebuild everything to ensure compatibility
npm run clean
npm install
npm run build:all

# Test your code still works
npm run test:all
```

---

## =¨ **TROUBLESHOOTING**

### **Common Push Issues**

#### **Push Rejected (out of sync)**
```bash
# Error: Updates were rejected because the remote contains work...

# Solution: Pull first, then push
git pull origin main
npm run push-all
```

#### **Dual-Push Script Fails**
```bash
# Error: Failed to push to deployment repository

# Check if the dual-push script is available
ls tools/dual-push.js

# Run manually if script is missing
git subtree push --prefix=packages/client git@github.com:sravnenie-ipotek/bankimonline-web.git main
```

#### **Merge Conflicts During Pull**
```bash
# Error: Automatic merge failed; fix conflicts and then commit the result

# 1. See which files have conflicts
git status

# 2. Open conflicted files and resolve
# Look for <<<<<<< and >>>>>>> markers

# 3. Stage resolved files
git add resolved-file.ts

# 4. Complete merge
git commit
```

### **Common Development Issues**

#### **Dependencies Out of Sync**
```bash
# Problem: "Module not found" errors after pulling

# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run shared:build
```

#### **Build Failures After Pull**
```bash
# Problem: Build errors after pulling changes

# Solution: Clean rebuild
npm run clean
npm install
npm run build:all
```

#### **Database Migration Issues**
```bash
# Problem: Server fails to start after pulling database changes

# Solution: Run migrations
cd packages/server
npm run migrate

# Or check migration status
npm run migrate:status
```

---

## =Ê **MONITORING YOUR PUSHES**

### **Deployment Status**

After pushing with `npm run push-*` commands, monitor deployments:

#### **Client Deployment (Vercel)**
```bash
# Check deployment status
# Visit: https://vercel.com/sravnenie-ipotek/bankimonline-web

# Or check via CLI (if Vercel CLI installed)
vercel ls
```

#### **Server Deployment (Railway)**
```bash
# Check deployment status
# Visit: https://railway.app/project/your-project-id

# Or check logs
railway logs
```

#### **Shared Package (GitHub Packages)**
```bash
# Check package versions
npm view @sravnenie-ipotek/bankimonline-shared versions --registry=https://npm.pkg.github.com
```

### **CI/CD Pipeline Status**

Monitor GitHub Actions in each deployment repository:
- **Web**: https://github.com/sravnenie-ipotek/bankimonline-web/actions
- **API**: https://github.com/sravnenie-ipotek/bankimonline-api/actions  
- **Shared**: https://github.com/sravnenie-ipotek/bankimonline-shared/actions

---

## =Ë **CHECKLISTS**

### **Before Pushing Checklist**

- [ ] All tests pass: `npm run test:all`
- [ ] All packages build: `npm run build:all`
- [ ] Code follows project conventions
- [ ] Commit message follows conventional commits format
- [ ] No sensitive data (API keys, passwords) in code
- [ ] Updated documentation if needed

### **After Pushing Checklist**

- [ ] Verify push success messages
- [ ] Check deployment pipeline status
- [ ] Test deployed application if critical changes
- [ ] Notify team if breaking changes
- [ ] Update project management tools (Jira, etc.)

### **Weekly Maintenance Checklist**

- [ ] Pull latest changes: `git pull origin main`
- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Clean build artifacts: `npm run clean`
- [ ] Verify all tests still pass: `npm run test:all`

---

## <˜ **EMERGENCY PROCEDURES**

### **Immediate Rollback (Production Issue)**

```bash
# 1. Identify the problematic commit
git log --oneline -10

# 2. Revert the commit (replace abc123 with actual commit hash)
git revert abc123

# 3. Push revert to all repositories immediately
npm run push-all

# 4. Verify production is restored
# Check deployment status in Vercel/Railway
```

### **Recovery from Corrupted Repository**

```bash
# 1. Backup your current work
cp -r bankimonline-workspace bankimonline-workspace-backup

# 2. Clone fresh copy
git clone git@github.com:sravnenie-ipotek/bankimonline-workspace.git bankimonline-workspace-fresh

# 3. Copy your changes to fresh copy
# Manually copy files from backup

# 4. Setup development environment
cd bankimonline-workspace-fresh
npm install
npm run build:all
```

---

## =Þ **GETTING HELP**

### **Quick Help Commands**

```bash
# Show available npm scripts
npm run

# Show git status with helpful info
git status

# Show recent commits
git log --oneline -10

# Show repository remotes
git remote -v
```

### **Team Communication**

- **Slack Channel**: #bankimonline-dev
- **Documentation**: Check `/server/docs/` folder
- **Issues**: Create GitHub issue in workspace repository
- **Code Review**: Use pull requests for major changes

---

**Last Updated**: 2025-08-06  
**Architecture Version**: 1.0  
**Target Team**: 10 developers  
**Status**: Production Ready