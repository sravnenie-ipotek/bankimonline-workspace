# <æ BankimOnline Local Development Guide

**Complete guide for running BankimOnline locally with Railway tunnel database connections**

---

## =€ **Prerequisites**

### Required Tools
- **Node.js** (v18+ recommended)
- **Railway CLI** - `npm install -g @railway/cli`
- **Git** access to repositories

### Required Access
- **Railway project access** for database connections
- **Environment files** configured correctly

---

## =' **Step 1: Railway Tunnel Setup**

### **Login to Railway**
```bash
# Login to Railway (opens browser)
railway login

# Verify login
railway whoami
```

### **Connect to Railway Database**
```bash
# Navigate to your project directory
cd /Users/michaelmishayev/Projects/bankDev2_standalone

# Connect to Railway project (if not already linked)
railway link

# Start Railway tunnel (CRITICAL FOR DATABASE ACCESS)
railway connect --service postgres
```

** This creates secure tunnel to Railway PostgreSQL database**
- **Creates local tunnel**: Railway DB ’ localhost:5432
- **Maintains connection**: Keep this terminal open during development
- **Automatic reconnection**: Railway CLI handles disconnections

---

## =Ä **Step 2: Environment Configuration**

### **Verify Database Configuration**
Your `.env` files should already be configured with Railway tunnel endpoints:

```bash
# Check server environment
cat packages/server/.env

# Should show Railway tunnel connections:
# DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
# CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
```

### **Development vs Production Environment**
```bash
# Development (current setup)
NODE_ENV=development
PORT=8004

# Railway Database Tunnels (already configured)
DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
```

---

## =¥ **Step 3: Start Development Servers**

### **Option A: Start Both Servers (Recommended)**
```bash
# From project root
npm run dev

# This starts:
# - Backend API server on port 8004
# - Frontend dev server on port 5173 (auto-detected)
```

### **Option B: Start Servers Individually**

#### **Start Backend Server**
```bash
# Navigate to server directory
cd packages/server
# OR use root-level command
npm run server:dev

# Server starts on: http://localhost:8004
# API endpoints: http://localhost:8004/api/*
```

#### **Start Frontend Development Server**
```bash
# Navigate to frontend directory  
cd mainapp
# OR use root-level command
npm run client:dev

# Frontend starts on: http://localhost:5173 (or next available port)
# Proxies API calls to: http://localhost:8004
```

---

## = **Step 4: Verify Connections**

### **Test Railway Database Connection**
```bash
# Test API health (includes database status)
curl http://localhost:8004/api/health

# Should return:
# {
#   "status": "ok",
#   "database": "connected", 
#   "contentDatabase": "connected",
#   "version": "5.2.0-regex-greedy-fix",
#   "timestamp": "2025-08-06T10:30:00.000Z"
# }
```

### **Test Frontend Application**
```bash
# Test frontend
curl http://localhost:5173

# Should return: HTML with React app content
```

### **Verify Database Tables**
```bash
# Test database queries
curl "http://localhost:8004/api/v1/banks"

# Test content system
curl "http://localhost:8004/api/content/home_page/en"
```

---

## < **Access URLs**

### **Local Development URLs**
- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8004
- **API Health Check**: http://localhost:8004/api/health
- **Banks API**: http://localhost:8004/api/v1/banks
- **Content API**: http://localhost:8004/api/content/{screen}/{language}

### **API Endpoints Examples**
```bash
# Banking data
GET http://localhost:8004/api/v1/banks
GET http://localhost:8004/api/v1/cities  
GET http://localhost:8004/api/v1/params

# Content management
GET http://localhost:8004/api/content/home_page/en
GET http://localhost:8004/api/content/mortgage_calculator/he
GET http://localhost:8004/api/content/credit_calculator/ru

# Authentication
POST http://localhost:8004/api/sms-login
POST http://localhost:8004/api/sms-code-login
```

---

## =à **Development Workflow**

### **Daily Development Routine**
```bash
# 1. Start Railway tunnel (in separate terminal)
railway connect --service postgres

# 2. Start development servers
npm run dev

# 3. Open browser
# Frontend: http://localhost:5173
# API: http://localhost:8004/api/health
```

### **Working with Database Changes**
```bash
# Run database migrations (if any)
cd packages/server
npm run migrate

# Or check migration status
npm run migrate:status
```

### **Hot Reloading**
- **Frontend**: Vite provides instant hot reloading
- **Backend**: Nodemon restarts server on file changes
- **Database**: Railway tunnel maintains persistent connection

---

## =¨ **Troubleshooting**

### **Railway Tunnel Issues**
```bash
# Problem: Database connection failed
# Solution 1: Restart Railway tunnel
railway connect --service postgres

# Solution 2: Re-login to Railway
railway logout
railway login
railway connect --service postgres

# Solution 3: Check Railway project connection
railway status
```

### **Port Conflicts**
```bash
# Problem: Port already in use
# Check what's using ports
lsof -ti:8004  # Backend port
lsof -ti:5173  # Frontend port

# Kill processes if needed
kill $(lsof -ti:8004)
kill $(lsof -ti:5173)

# Restart development
npm run dev
```

### **Database Connection Errors**
```bash
# Check Railway connection status
railway status

# Test database connectivity
curl http://localhost:8004/api/health

# Check server logs
cd packages/server
npm run dev
# Look for: " Main Database connected" and " Content Database connected"
```

### **Frontend Build Issues**
```bash
# Clear frontend cache and rebuild
cd mainapp
rm -rf node_modules
npm install
npm run dev

# Or use the root command
npm run client:clean
npm run client:dev
```

---

## = **Railway Database Security**

### **Railway Tunnel Benefits**
- **Encrypted Connection**: Railway tunnel uses SSL/TLS
- **Access Control**: Requires Railway authentication
- **Network Isolation**: Database not directly exposed
- **Automatic Reconnection**: Railway CLI handles connection drops

### **Connection Architecture**
```
Local App ’ Railway CLI Tunnel ’ Railway Proxy ’ PostgreSQL Database
     “              “                    “              “
localhost:8004  railway connect   *.proxy.rlwy.net  Railway DB
```

---

## >ê **Testing Setup**

### **Running Tests**
```bash
# Run all tests
npm run test:all

# Frontend E2E tests
cd mainapp
npm run cypress

# Backend API tests  
cd packages/server
npm run test
```

### **Test Database Connection**
```bash
# Test with different environments
NODE_ENV=test npm run server:dev

# Verify test database (if configured)
curl http://localhost:8004/api/health
```

---

## =Ê **Development Monitoring**

### **Watch for Success Indicators**

**1. Railway Tunnel Connection:**
```bash
railway connect --service postgres
# Should show: "Connected to postgres service"
```

**2. Server Startup:**
```bash
npm run server:dev
# Should show: 
#  Main Database connected: [timestamp]
#  Content Database connected: [timestamp]  
# =€ Server running on port 8004
```

**3. Frontend Startup:**
```bash
npm run client:dev
# Should show:
# Local:   http://localhost:5173/
# Network: use --host to expose
# ready in XXXms
```

**4. API Health Check:**
```json
{
  "status": "ok",
  "database": "connected",
  "contentDatabase": "connected", 
  "environment": "development",
  "corsEnabled": true,
  "port": 8004
}
```

---

## ¡ **Performance Tips**

### **Optimize Development Experience**
- **Keep Railway tunnel open** in dedicated terminal
- **Use browser dev tools** for frontend debugging
- **Monitor server logs** for backend issues
- **Use PM2** for production-like local testing (optional)

### **Database Performance**
- **NodeCache enabled** for content endpoints (5-minute TTL)
- **Connection pooling** handles multiple requests
- **Railway proxy** provides automatic load balancing

---

## <¯ **Quick Commands Reference**

```bash
# Start everything
railway connect --service postgres &  # Keep tunnel open
npm run dev                           # Start both servers

# Individual components
npm run server:dev                    # Backend only  
npm run client:dev                    # Frontend only

# Testing
npm run test:all                      # All tests
curl http://localhost:8004/api/health # Health check
curl http://localhost:5173            # Frontend check

# Troubleshooting  
railway status                        # Railway connection
lsof -ti:8004                        # Check port usage
pm2 status                           # PM2 processes (if used)
```

---

## <‰ **Success Checklist**

When everything is working correctly:

-  **Railway tunnel connected** and authenticated
-  **Backend server running** on port 8004
-  **Frontend dev server running** on port 5173
-  **Database connections active** (main + content)
-  **API endpoints responding** with proper data
-  **Frontend loading** with hot reloading enabled
-  **Cross-origin requests working** between frontend and backend

**=€ You're ready for BankimOnline development with Railway database connectivity!**