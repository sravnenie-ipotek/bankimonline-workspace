# BankIM Application - SSH Launch & Connection Guide

## 🚀 How to Launch the Application on SSH Server

### Prerequisites
- SSH access to the server (IP: 185.253.72.80)
- Both server and client repositories are deployed on the server

### Step 1: SSH into the Server
```bash
ssh root@185.253.72.80
```

### Step 2: Check Current Status
```bash
# Check if processes are already running
pm2 status

# Check if ports are listening
ss -tulpn | grep -E '8003|5173'
```

### Step 3: Start the Server (if not running)
```bash
# Navigate to server directory
cd /var/www/bankim/bankimonlineapi

# Start the server
pm2 start server-db.js --name bankim-server -- --host 0.0.0.0

# Check server status
pm2 status
```

### Step 4: Start the Client (if not running)
```bash
# Navigate to client directory
cd /var/www/bankim/client/mainapp

# Start the client
pm2 start npm --name bankim-client -- run dev -- --host 0.0.0.0

# Check client status
pm2 status
```

### Step 5: Verify Everything is Running
```bash
# Check both processes
pm2 status

# Should show:
# │ 0  │ bankim-server      │ fork     │ 0    │ online    │ 0%       │ ~64mb   │
# │ 3  │ bankim-client      │ fork     │ 0    │ online    │ 0%       │ ~60mb   │

# Check ports are listening
ss -tulpn | grep -E '8003|5173'

# Should show:
# tcp   LISTEN 0      511                            0.0.0.0:5173      0.0.0.0:*
# tcp   LISTEN 0      511                                  *:8003            *:*
```

### Step 6: Test the Applications
```bash
# Test server API
curl http://localhost:8003/api/health
# Should return: {"status":"ok","database":"connected",...}

# Test client
curl http://localhost:5173
# Should return HTML with React app
```

---

## 🌐 How to Connect from Your Local Machine

### Step 1: Create SSH Tunnel
Open a **new terminal** on your local machine and run:
```bash
ssh -L 8003:localhost:8003 -L 5173:localhost:5173 root@185.253.72.80
```

This creates a tunnel that forwards:
- Local port 8003 → Server port 8003 (API)
- Local port 5173 → Server port 5173 (Client)

### Step 2: Access the Applications

#### **Option A: Open in Browser**
- **Server API:** http://localhost:8003
- **Client Application:** http://localhost:5173

#### **Option B: Test with curl**
```bash
# Test server API
curl http://localhost:8003/api/health

# Test client
curl http://localhost:5173
```

---

## 🔧 Troubleshooting

### If Server Won't Start
```bash
# Check if file exists
ls -la /var/www/bankim/bankimonlineapi/server-db.js

# Check logs
pm2 logs bankim-server

# Restart server
pm2 restart bankim-server
```

### If Client Won't Start
```bash
# Check if in correct directory
pwd
# Should be: /var/www/bankim/client/mainapp

# Check if package.json exists
ls -la package.json

# Check logs
pm2 logs bankim-client

# Restart client
pm2 restart bankim-client
```

### If Ports Are Already in Use
```bash
# Kill duplicate processes
pm2 delete bankim-client
pm2 delete bankim-server

# Start fresh
pm2 start server-db.js --name bankim-server -- --host 0.0.0.0
cd /var/www/bankim/client/mainapp
pm2 start npm --name bankim-client -- run dev -- --host 0.0.0.0
```

### If SSH Tunnel Fails
```bash
# Check if tunnel is working
netstat -an | grep 8003
netstat -an | grep 5173

# Try reconnecting
ssh -L 8003:localhost:8003 -L 5173:localhost:5173 root@185.253.72.80
```

---

## 📊 Monitoring

### Check Application Status
```bash
# On SSH server
pm2 status
pm2 logs
pm2 monit
```

### Check Database Connection
```bash
# Test database
curl http://localhost:8003/api/health
# Should show: "database":"connected"
```

---

## 🛑 Stopping Applications

### Stop Both Applications
```bash
# Stop all PM2 processes
pm2 stop all

# Or stop individually
pm2 stop bankim-server
pm2 stop bankim-client
```

### Kill SSH Tunnel
```bash
# In the terminal with SSH tunnel
# Press Ctrl+C to disconnect
```

---

## 📝 Quick Reference

### Server Location
- **Directory:** `/var/www/bankim/bankimonlineapi`
- **File:** `server-db.js`
- **Port:** 8003
- **PM2 Name:** `bankim-server`

### Client Location
- **Directory:** `/var/www/bankim/client/mainapp`
- **Port:** 5173
- **PM2 Name:** `bankim-client`

### URLs (after SSH tunnel)
- **API:** http://localhost:8003
- **App:** http://localhost:5173

### SSH Server Details
- **IP:** 185.253.72.80
- **User:** root
- **SSH Command:** `ssh -L 8003:localhost:8003 -L 5173:localhost:5173 root@185.253.72.80`

---

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **PM2 Status:**
   ```
   │ 0  │ bankim-server      │ fork     │ 0    │ online    │ 0%       │ ~64mb   │
   │ 3  │ bankim-client      │ fork     │ 0    │ online    │ 0%       │ ~60mb   │
   ```

2. **Ports Listening:**
   ```
   tcp   LISTEN 0      511                            0.0.0.0:5173      0.0.0.0:*
   tcp   LISTEN 0      511                                  *:8003            *:*
   ```

3. **API Response:**
   ```json
   {"status":"ok","database":"connected","version":"5.2.0-regex-greedy-fix","timestamp":"2025-08-05T05:51:26.202Z","environment":"development","corsEnabled":true}
   ```

4. **Client Response:** HTML with React app content

5. **Browser Access:** Both URLs work in your browser after SSH tunnel

---

**🎉 You're all set! The BankIM application is now running and accessible from your local machine!**
