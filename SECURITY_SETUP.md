# 🔒 SECURITY SETUP - Environment Variables Protection

## ✅ **Security Measures Implemented**

### **1. Environment Variables Protection**
- ✅ Added `.env*` files to `.gitignore`
- ✅ Created `.env.example` template with placeholder values
- ✅ Moved sensitive data to local `.env` file (not tracked by git)
- ✅ Removed connection strings from shell configuration

### **2. Files Protected from Git**
```bash
# Environment files
.env
.env.local
.env.development
.env.production
.env.staging
.env.test
*.env
mainapp/.env
mainapp/.env.local

# Security sensitive files
.railway-token
*.pem
*.key
*.crt
secrets/
.secrets/
```

---

## 🛠️ **How to Set Up Environment Variables**

### **For Development:**
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values in `.env`:
   ```bash
   CONTENT_DATABASE_URL=your_actual_connection_string
   DATABASE_URL=your_main_db_connection_string
   ```

### **For Production/Deployment:**
- **Railway**: Set environment variables in Railway dashboard
- **Heroku**: Use `heroku config:set VARIABLE_NAME=value`
- **Docker**: Use `-e` flags or docker-compose environment sections
- **Railway**: Set in Railway dashboard environment variables

---

## ⚠️ **SECURITY RULES**

### **❌ NEVER DO:**
- Commit `.env` files to git
- Put passwords in code files
- Share connection strings in chat/email
- Store secrets in public repositories
- Put credentials in shell configuration files

### **✅ ALWAYS DO:**
- Use environment variables for sensitive data
- Keep `.env` files in `.gitignore`
- Use different credentials for different environments
- Rotate passwords regularly
- Use `.env.example` for sharing configuration templates

---

## 🔍 **Current Environment Variables**

### **Required Variables:**
- `CONTENT_DATABASE_URL` - Connection to content database
- `DATABASE_URL` - Main database connection (optional)
- `PORT` - Server port (default: 8003)
- `NODE_ENV` - Environment mode (development/production)

### **Optional Variables:**
- `RAILWAY_PRIVATE_DOMAIN` - Railway internal domain
- `DATABASE_PUBLIC_URL` - Public database URL

---

## 🚨 **Emergency: If Credentials Were Exposed**

If connection strings were accidentally committed to git:

1. **Immediately change passwords** in your database provider
2. **Rewrite git history** to remove sensitive data:
   ```bash
   # Remove file from all git history
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   
   # Force push (WARNING: destructive)
   git push origin --force --all
   ```
3. **Notify team members** to re-clone the repository
4. **Update all environment variables** with new credentials

---

## ✅ **Verification**

To verify security setup:
```bash
# Check .env is ignored
git status
# Should not show .env file

# Check .env.example exists
ls -la .env.example

# Check environment variables load
echo $CONTENT_DATABASE_URL
# Should show the connection string only in your terminal
``` 