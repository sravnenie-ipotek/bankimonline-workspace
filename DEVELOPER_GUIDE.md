# 👨‍💻 Developer Guide - Git Workflow

## 🚀 **Quick Start**

### **For Frontend Developers:**
```bash
# 1. Switch to client branch
git checkout client-only

# 2. Make your changes
# ... edit mainapp/, public/, css/, etc. ...

# 3. Push to client repository
./push-client.sh "Your commit message"
```

### **For Backend Developers:**
```bash
# 1. Switch to server branch
git checkout server-only

# 2. Make your changes
# ... edit server/, migrations/, etc. ...

# 3. Push to server repository
./push-server.sh "Your commit message"
```

### **For Shared Code Changes:**
```bash
# 1. Navigate to shared directory
cd packages/shared

# 2. Make your changes
# ... edit types, translations, etc. ...

# 3. Push to shared repository
./push-shared.sh "Your commit message"
```

## 🧠 **Smart Push (Recommended)**

For automatic detection and pushing:

```bash
# Make any changes (client, server, or shared)
# ... edit files ...

# Smart push automatically detects and pushes to correct repositories
./smart-push.sh "Your commit message"
```

## 📋 **Available Commands**

| Command | Purpose | Repository |
|---------|---------|------------|
| `./push-client.sh` | Push frontend changes | bankDev2_standalone |
| `./push-server.sh` | Push backend changes | bankimonlineapi |
| `./push-shared.sh` | Push shared changes | bankimonline_shared |
| `./smart-push.sh` | Auto-detect and push | All relevant repos |
| `./push-to-all-repos.sh` | Push everything | All 3 repos |

## 🎯 **Branch Strategy**

| Branch | Purpose | Contains |
|--------|---------|----------|
| `main` | Reference only | Mixed code (don't work here) |
| `client-only` | Frontend development | React app, static files |
| `server-only` | Backend development | Express server, migrations |
| `shared` | Shared code | Types, translations, utilities |

## ⚠️ **Important Rules**

1. **Never work on `main` branch** - it's just for reference
2. **Always use specific branches** for development
3. **Use smart-push.sh** for automatic detection
4. **Test changes** before pushing to production
5. **Write clear commit messages**

## 🔧 **Troubleshooting**

### **If push fails:**
```bash
# Check current branch
git branch

# Check remotes
git remote -v

# Pull latest changes
git pull origin client-only  # for frontend
git pull bankimonlineapi server-only  # for backend
```

### **If you're on wrong branch:**
```bash
# Switch to correct branch
git checkout client-only  # for frontend work
git checkout server-only  # for backend work
```

## 📊 **Repository URLs**

- **Client**: https://github.com/MichaelMishaev/bankDev2_standalone
- **Server**: https://github.com/MichaelMishaev/bankimonlineapi  
- **Shared**: https://github.com/MichaelMishaev/bankimonline_shared

---

**🎉 Happy coding! Use `./smart-push.sh` for the easiest workflow.** 