# 🏦 BankimOnline Local Development Guide

**Complete guide for running BankimOnline locally with SSH tunnel database connections**

---

## 🚀 **Prerequisites**

### Required Tools
- **Node.js** (v18+ recommended)
- **SSH client** with access to server (root@185.253.72.80)
- **Git** access to repositories
- **psql** (optional, for database testing)

### Required Access
- **SSH access** to server at 185.253.72.80
- **Environment files** configured correctly

---

## 🔧 **Step 1: SSH Tunnel Setup**

### **Start SSH Database Tunnels**
```bash
# Navigate to your project directory
cd /Users/michaelmishayev/Projects/bankDev2_standalone

# Start SSH tunnels using the provided script
./scripts/start-ssh-tunnels.sh start
```

**✅ This creates secure SSH tunnels to Railway PostgreSQL databases**
- **Content Database tunnel**: localhost:5432 → shortline.proxy.rlwy.net:33452
- **Main Database tunnel**: localhost:5433 → maglev.proxy.rlwy.net:43809
- **Maintains connection**: Tunnels run in background with auto-reconnection
- **Enhanced Security**: SSH + TLS encryption (double layer)

### **Alternative Manual Setup**
If you prefer manual control:
```bash
# Terminal 1: Content Database tunnel
ssh -L 5432:shortline.proxy.rlwy.net:33452 root@185.253.72.80 -N

# Terminal 2: Main Database tunnel  
ssh -L 5433:maglev.proxy.rlwy.net:43809 root@185.253.72.80 -N
```

### **Verify Tunnel Status**
```bash
# Check tunnel status
./scripts/start-ssh-tunnels.sh status

# Should show both tunnels running
```

---

## 🗄️ **Step 2: Environment Configuration**

### **Verify Database Configuration**
Your `.env` files should now be configured with SSH tunnel localhost connections:

```bash
# Check server environment
cat packages/server/.env

# Should show SSH tunnel localhost connections:
# DATABASE_URL=postgresql://postgres:lqqPEzvVbSCviTybKqMbzJkYvOUetJjt@localhost:5433/railway
# CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@localhost:5432/railway
```

### **SSH Tunnel Architecture**
```bash
# Development (SSH tunnel setup)
NODE_ENV=development
PORT=8003

# SSH Tunnel Database Connections
DATABASE_URL=postgresql://postgres:lqqPEzvVbSCviTybKqMbzJkYvOUetJjt@localhost:5433/railway
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@localhost:5432/railway
```

---

## 🖥️ **Step 3: Start Development Servers**

### **Option A: Start Both Servers (Recommended)**
```bash
# Ensure SSH tunnels are running first
./scripts/start-ssh-tunnels.sh status

# From project root
npm run dev

# This starts:
# - Backend API server on port 8003
# - Frontend dev server on port 5173 (auto-detected)
```

### **Option B: Start Servers Individually**

#### **Start Backend Server**
```bash
# Navigate to server directory
cd packages/server
# OR use root-level command
npm run server:dev

# Server starts on: http://localhost:8003
# API endpoints: http://localhost:8003/api/*
```

#### **Start Frontend Development Server**
```bash
# Navigate to frontend directory  
cd mainapp
# OR use root-level command
npm run client:dev

# Frontend starts on: http://localhost:5173 (or next available port)
# Proxies API calls to: http://localhost:8003
```

---

## 🔗 **Step 4: Verify Connections**

### **Test SSH Tunnel Database Connections**
```bash
# Test API health (includes database status)
curl http://localhost:8003/api/health

# Should return:
# {
#   "status": "ok",
#   "database": "connected", 
#   "contentDatabase": "connected",
#   "version": "5.2.0-regex-greedy-fix",
#   "timestamp": "2025-08-06T10:30:00.000Z"
# }
```

### **Test Database Connectivity Directly**
```bash
# Test Content Database (via SSH tunnel)
PGPASSWORD="SuFkUevgonaZFXJiJeczFiXYTlICHVJL" psql -h localhost -p 5432 -U postgres -d railway -c "SELECT NOW();"

# Test Main Database (via SSH tunnel) 
PGPASSWORD="lqqPEzvVbSCviTybKqMbzJkYvOUetJjt" psql -h localhost -p 5433 -U postgres -d railway -c "SELECT NOW();"
```

### **Test Frontend Application**
```bash
# Test frontend
curl http://localhost:5173

# Should return: HTML with React app content
```

### **Verify API Endpoints**
```bash
# Test database queries
curl "http://localhost:8003/api/v1/banks"

# Test content system
curl "http://localhost:8003/api/content/home_page/en"
```

---

## 🌐 **Access URLs**

### **Local Development URLs**
- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8003
- **API Health Check**: http://localhost:8003/api/health
- **Banks API**: http://localhost:8003/api/v1/banks
- **Content API**: http://localhost:8003/api/content/{screen}/{language}

### **API Endpoints Examples**
```bash
# Banking data
GET http://localhost:8003/api/v1/banks
GET http://localhost:8003/api/v1/cities  
GET http://localhost:8003/api/v1/params

# Content management
GET http://localhost:8003/api/content/home_page/en
GET http://localhost:8003/api/content/mortgage_calculator/he
GET http://localhost:8003/api/content/credit_calculator/ru

# Authentication
POST http://localhost:8003/api/sms-login
POST http://localhost:8003/api/sms-code-login
```

---

## 🛠️ **Development Workflow**

### **Daily Development Routine**
```bash
# 1. Start SSH tunnels
./scripts/start-ssh-tunnels.sh start

# 2. Start development servers
npm run dev

# 3. Open browser
# Frontend: http://localhost:5173
# API: http://localhost:8003/api/health
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
- **Database**: SSH tunnels maintain persistent connection

---

## 🚨 **Troubleshooting**

### **SSH Tunnel Issues**
```bash
# Problem: Database connection failed
# Solution 1: Restart SSH tunnels
./scripts/start-ssh-tunnels.sh restart

# Solution 2: Check tunnel status
./scripts/start-ssh-tunnels.sh status

# Solution 3: Stop and start manually
./scripts/start-ssh-tunnels.sh stop
./scripts/start-ssh-tunnels.sh start

# Solution 4: Check SSH connectivity
ssh root@185.253.72.80 "echo 'SSH connection working'"
```

### **Port Conflicts**
```bash
# Problem: Port already in use
# Check what's using ports
lsof -ti:8003  # Backend port
lsof -ti:5173  # Frontend port
lsof -ti:5432  # Content DB tunnel
lsof -ti:5433  # Main DB tunnel

# Kill processes if needed
kill $(lsof -ti:8003)
kill $(lsof -ti:5173)

# Restart tunnels and development
./scripts/start-ssh-tunnels.sh restart
npm run dev
```

### **Database Connection Errors**
```bash
# Check SSH tunnel status
./scripts/start-ssh-tunnels.sh status

# Test database connectivity
curl http://localhost:8003/api/health

# Test direct database connection
PGPASSWORD="SuFkUevgonaZFXJiJeczFiXYTlICHVJL" psql -h localhost -p 5432 -U postgres -d railway -c "SELECT NOW();"

# Check server logs
cd packages/server
npm run dev
# Look for: "✅ Main Database connected" and "✅ Content Database connected"
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

## 🔒 **SSH Tunnel Security Benefits**

### **Enhanced Security Architecture**
- **Double Encryption**: SSH tunnel + TLS database connections
- **Access Control**: Requires SSH key authentication
- **Network Isolation**: Databases not directly exposed to internet
- **Audit Trail**: SSH connection logging and monitoring
- **Banking-Grade Security**: Meets enterprise security requirements

### **Connection Architecture**
```
Local App → SSH Tunnel → Railway Proxy → PostgreSQL Database
     ↓           ↓             ↓              ↓
localhost:8003  SSH Server  *.proxy.rlwy.net  Railway DB
```

---

## 🧪 **Testing Setup**

### **Running Tests**
```bash
# Ensure SSH tunnels are running
./scripts/start-ssh-tunnels.sh status

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
curl http://localhost:8003/api/health
```

---

## 📊 **Development Monitoring**

### **Watch for Success Indicators**

**1. SSH Tunnel Connection:**
```bash
./scripts/start-ssh-tunnels.sh status
# Should show: "✅ All SSH tunnels established successfully!"
```

**2. Server Startup:**
```bash
npm run server:dev
# Should show: 
# ✅ Main Database connected: [timestamp]
# ✅ Content Database connected: [timestamp]  
# 🚀 Server running on port 8003
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
  "port": 8003
}
```

---

## ⚡ **Performance Tips**

### **Optimize Development Experience**
- **Keep SSH tunnels running** in background (managed by script)
- **Use browser dev tools** for frontend debugging
- **Monitor server logs** for backend issues
- **Use PM2** for production-like local testing (optional)

### **Database Performance**
- **NodeCache enabled** for content endpoints (5-minute TTL)
- **Connection pooling** handles multiple requests
- **SSH tunnel compression** enabled for better performance

---

## 🎯 **Quick Commands Reference**

```bash
# SSH Tunnel Management
./scripts/start-ssh-tunnels.sh start    # Start tunnels
./scripts/start-ssh-tunnels.sh stop     # Stop tunnels
./scripts/start-ssh-tunnels.sh status   # Check status
./scripts/start-ssh-tunnels.sh restart  # Restart tunnels

# Development
npm run dev                             # Start both servers
npm run server:dev                      # Backend only  
npm run client:dev                      # Frontend only

# Testing
npm run test:all                        # All tests
curl http://localhost:8003/api/health   # Health check
curl http://localhost:5173              # Frontend check

# Troubleshooting  
lsof -ti:8003                          # Check port usage
ps aux | grep "ssh -L"                 # Check SSH tunnels
```

---

## 🎉 **Success Checklist**

When everything is working correctly:

- ✅ **SSH tunnels established** (both content and main database)
- ✅ **Backend server running** on port 8003
- ✅ **Frontend dev server running** on port 5173
- ✅ **Database connections active** (main + content via SSH tunnels)
- ✅ **API endpoints responding** with proper data
- ✅ **Frontend loading** with hot reloading enabled
- ✅ **Cross-origin requests working** between frontend and backend
- ✅ **Enhanced security** with SSH + TLS encryption

**🚀 You're ready for secure BankimOnline development with SSH tunnel database connectivity!**