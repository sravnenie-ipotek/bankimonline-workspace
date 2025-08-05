# 🚀 Push Instructions for Separated Repositories

## 📊 Repository Overview

You have **2 GitHub repositories**:

| Repository | Purpose | Remote Name | URL |
|------------|---------|-------------|-----|
| `bankDev2_standalone` | **Client Only** (React Frontend) | `origin` | https://github.com/MichaelMishaev/bankDev2_standalone |
| `bankimonlineapi` | **Server Only** (Express Backend) | `bankimonlineapi` | https://github.com/MichaelMishaev/bankimonlineapi |

## 🎯 Current Status

- **Main branch**: Contains both client + server (mixed)
- **Client-only branch**: Contains only React frontend ✅ Ready
- **Server-only branch**: Needs to be created

## 📋 Step-by-Step Push Instructions

### Step 1: Push Client-Only to bankDev2_standalone

```bash
# Switch to client-only branch
git checkout client-only

# Push to bankDev2_standalone repository
git push origin client-only

# Verify push was successful
git remote -v
# Should show: origin -> bankDev2_standalone
```

### Step 2: Create Server-Only Branch

```bash
# Switch back to main branch
git checkout main

# Create server-only branch
git checkout -b server-only

# Remove all client files (keep only server)
rm -rf mainapp/ public/ css/ locales/ translations/ translations-to-translate/ js/ types/
rm -f .env* .eslintrc.cjs .prettierrc .csscomb.json .mcp.json

# Commit server-only state
git add .
git commit -m "Server-only: Remove all client files, keep only Express backend"
```

### Step 3: Push Server-Only to bankimonlineapi

```bash
# Push to bankimonlineapi repository
git push bankimonlineapi server-only

# Verify push was successful
git remote -v
# Should show: bankimonlineapi -> bankimonlineapi
```

## 🔄 Daily Workflow (After Separation)

### For Client Changes (Frontend)
```bash
# Make changes to React app
git checkout client-only
# ... make your changes ...
git add .
git commit -m "Update: Frontend changes"
git push origin client-only
```

### For Server Changes (Backend)
```bash
# Make changes to Express server
git checkout server-only
# ... make your changes ...
git add .
git commit -m "Update: Backend changes"
git push bankimonlineapi server-only
```

## 🚨 Important Notes

1. **Never push to main branch** - it's now just for reference
2. **Client changes** → Push to `origin` (bankDev2_standalone)
3. **Server changes** → Push to `bankimonlineapi`
4. **Each repository deploys to different Railway service**

## 🔧 Quick Commands

```bash
# Check current branch
git branch

# Check remotes
git remote -v

# Switch between branches
git checkout client-only    # For frontend work
git checkout server-only    # For backend work

# Push commands
git push origin client-only        # Frontend → bankDev2_standalone
git push bankimonlineapi server-only  # Backend → bankimonlineapi
```

## 📱 Railway Deployment

- **bankDev2_standalone** → Deploys to Railway frontend service
- **bankimonlineapi** → Deploys to Railway backend service

## ✅ Verification

After separation, each repository should contain:

**bankDev2_standalone (Client Only):**
- `mainapp/` (React app)
- `public/` (static assets)
- `css/`, `locales/`, `translations/`
- `js/`, `types/`
- No server files

**bankimonlineapi (Server Only):**
- `server-db.js` (Express server)
- `migrations/` (database migrations)
- `scripts/` (server scripts)
- No client files

## 🆘 Troubleshooting

### If push fails:
```bash
# Check if remote exists
git remote -v

# Re-add remote if needed
git remote add bankimonlineapi https://github.com/MichaelMishaev/bankimonlineapi.git
```

### If branches are out of sync:
```bash
# Pull latest changes
git pull origin client-only
git pull bankimonlineapi server-only
```

---

**🎉 You're now ready to work with separated client and server repositories!** 