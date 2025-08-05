# GitHub Push Instructions

## 🎯 Overview
This project maintains two GitHub repositories that need to be kept in sync:
- **bankDev2_standalone** (main repo): https://github.com/MichaelMishaev/bankDev2_standalone
- **bankimonlineapi** (server repo): https://github.com/MichaelMishaev/bankimonlineapi

## 🚀 Quick Push Methods

### Method 1: Automated Script (Recommended)
```bash
# Push with custom commit message
./push-to-both-repos.sh "Your commit message here"

# Push with interactive commit message
./push-to-both-repos.sh

# Push with default timestamp message
./push-to-both-repos.sh
```

### Method 2: Manual Push
```bash
# 1. Stage and commit changes
git add .
git commit -m "Your commit message"

# 2. Push to both repositories
git push origin main
git push bankimonlineapi main
```

### Method 3: One-liner
```bash
git add . && git commit -m "Update" && git push origin main && git push bankimonlineapi main
```

## 📋 Repository Configuration

### Current Remotes
```bash
# Check configured remotes
git remote -v

# Expected output:
# origin    git@github.com:MichaelMishaev/bankDev2_standalone.git (fetch)
# origin    git@github.com:MichaelMishaev/bankDev2_standalone.git (push)
# bankimonlineapi    https://github.com/MichaelMishaev/bankimonlineapi.git (fetch)
# bankimonlineapi    https://github.com/MichaelMishaev/bankimonlineapi.git (push)
```

### Adding Remotes (if needed)
```bash
# Add bankimonlineapi remote
git remote add bankimonlineapi https://github.com/MichaelMishaev/bankimonlineapi.git

# Verify remotes
git remote -v
```

## 🔄 Workflow Best Practices

### Before Pushing
1. **Check status**: `git status`
2. **Review changes**: `git diff --staged`
3. **Test locally**: Ensure changes work as expected

### Commit Messages
Use descriptive commit messages:
```bash
# Good examples:
git commit -m "Fix: Update Railway config for translation loading"
git commit -m "Feature: Add new mortgage calculation endpoint"
git commit -m "Update: Improve error handling in validation"

# Avoid:
git commit -m "fix"
git commit -m "update"
```

### After Pushing
1. **Verify deployment**: Check Railway dashboard
2. **Test production**: Visit production URL
3. **Monitor logs**: Check for any deployment issues

## 🚨 Troubleshooting

### Push Fails to bankimonlineapi
```bash
# Check if remote exists
git remote -v

# Re-add remote if missing
git remote add bankimonlineapi https://github.com/MichaelMishaev/bankimonlineapi.git

# Try push again
git push bankimonlineapi main
```

### Authentication Issues
```bash
# For HTTPS (bankimonlineapi)
git config --global credential.helper store

# For SSH (origin)
# Ensure SSH key is added to GitHub account
ssh -T git@github.com
```

### Sync Issues
```bash
# Pull latest from both repos
git pull origin main
git pull bankimonlineapi main

# Resolve conflicts if any
git status
```

## 📊 Repository Purposes

### bankDev2_standalone (origin)
- **Purpose**: Main application repository
- **Contains**: Frontend React app, translations, build configs
- **Deployment**: Railway frontend service
- **URL**: https://github.com/MichaelMishaev/bankDev2_standalone

### bankimonlineapi (server)
- **Purpose**: Server/API repository  
- **Contains**: Backend API, database migrations, server configs
- **Deployment**: Railway backend service
- **URL**: https://github.com/MichaelMishaev/bankimonlineapi

## 🔧 Script Usage Examples

```bash
# Quick update with timestamp
./push-to-both-repos.sh

# Feature update
./push-to-both-repos.sh "Feature: Add mortgage calculator improvements"

# Bug fix
./push-to-both-repos.sh "Fix: Resolve translation loading in production"

# Translation update
./push-to-both-repos.sh "Update: Add missing Hebrew translations"
```

## ⚡ Pro Tips

1. **Always use the script**: `./push-to-both-repos.sh` ensures both repos stay in sync
2. **Check before pushing**: `git status` to see what's being committed
3. **Use descriptive messages**: Makes it easier to track changes across both repos
4. **Monitor deployments**: Check Railway dashboard after pushing
5. **Test production**: Always verify changes work in production environment

## 🆘 Emergency Procedures

### If one repo gets out of sync
```bash
# Force sync from main repo
git push bankimonlineapi main --force

# Or reset bankimonlineapi to match origin
git push bankimonlineapi main --force-with-lease
```

### If script fails
```bash
# Manual push sequence
git add .
git commit -m "Emergency fix"
git push origin main
git push bankimonlineapi main
``` 