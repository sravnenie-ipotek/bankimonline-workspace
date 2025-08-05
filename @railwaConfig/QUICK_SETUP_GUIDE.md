# 🚂 RAILWAY QUICK SETUP GUIDE

## FOR AI AGENT - COPY & PASTE INSTRUCTIONS

### 🎯 OBJECTIVE
Set up a complete Railway deployment with PostgreSQL database and Node.js application.

### ⚡ QUICK STEPS

#### 1. Create Railway Project
```bash
# Go to https://railway.app
# Click "New Project" → "Deploy from GitHub repo"
# Connect GitHub and select repository
# Choose main branch for auto-deployment
```

#### 2. Add PostgreSQL Database
```bash
# In Railway dashboard:
# Click "Add Service" → "Database" → "PostgreSQL"
# Railway auto-generates DATABASE_URL
```

#### 3. Set Environment Variables
```bash
# In Railway dashboard → Variables, add:
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
JWT_SECRET=super-secure-random-string-at-least-32-characters-long
CORS_ALLOWED_ORIGINS=*
```

#### 4. Copy Configuration Files
Copy these files to the project root:

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE" },
  "deploy": { "startCommand": "node server.js" }
}
```

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install --no-cache --prefer-offline
WORKDIR /app/frontend
RUN npm install --no-cache --prefer-offline
WORKDIR /app
COPY . .
WORKDIR /app/frontend
RUN npm run build
WORKDIR /app
EXPOSE 8003
CMD ["node", "server.js"]
```

**package.json:**
```json
{
  "name": "railway-app",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "pg": "^8.11.0",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3"
  },
  "engines": { "node": ">=18.0.0" }
}
```

#### 5. Create Server File
Use the `server-template.js` as your `server.js` - it includes:
- ✅ Railway PostgreSQL connection
- ✅ CORS configuration
- ✅ Health check endpoints
- ✅ Frontend serving
- ✅ Error handling

#### 6. Database Setup
Copy the `database-setup.sql` and run it in Railway's PostgreSQL interface.

#### 7. Deploy
```bash
git add .
git commit -m "Add Railway configuration"
git push origin main
```

Railway will automatically build and deploy!

### 🔍 VERIFICATION

After deployment, check:
- ✅ `https://your-app.railway.app/api/health` returns healthy status
- ✅ `https://your-app.railway.app/api/test` works
- ✅ Frontend loads at `https://your-app.railway.app`
- ✅ Database connection successful

### 🆘 TROUBLESHOOTING

If deployment fails:
1. Check Railway dashboard logs
2. Verify all environment variables are set
3. Ensure DATABASE_URL is available
4. Check build logs for errors

### 📋 CHECKLIST

- [ ] Railway project created
- [ ] GitHub repository connected
- [ ] PostgreSQL service added
- [ ] Environment variables configured
- [ ] Configuration files copied
- [ ] Server file created
- [ ] Database setup script run
- [ ] Code pushed to GitHub
- [ ] Deployment successful
- [ ] Health endpoints working

### 🎉 SUCCESS

Your Railway app should be live at: `https://[your-project].railway.app`

All configuration files are provided in this folder - just copy and customize as needed! 