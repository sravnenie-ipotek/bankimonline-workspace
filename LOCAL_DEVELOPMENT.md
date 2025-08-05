# 🚀 Local Development Setup

This guide shows how to run the BankIM application locally without interfering with your production SSH tunnel.

## 🎯 Quick Start

### Option 1: One-Command Setup (Recommended)
```bash
./start-local-dev.sh
```

This starts both backend and frontend servers automatically.

### Option 2: Manual Setup
```bash
# Terminal 1: Start backend on port 8004
./start-local-backend.sh

# Terminal 2: Start frontend (will proxy to 8004)
cd mainapp && ./start-local-dev.sh
```

## 📡 Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| **Local Backend** | 8004 | Your local development API |
| **Local Frontend** | 8004 | Proxies API calls to local backend |
| **Production SSH Tunnel** | 8003 | Your production server (unchanged) |

## 🔧 How It Works

### Environment Variables
- `PORT=8004` - Backend runs on port 8004
- `VITE_API_TARGET=http://localhost:8004` - Frontend proxies to port 8004

### Vite Proxy Configuration
The frontend automatically proxies `/api/*` requests to your local backend:
```typescript
// mainapp/vite.config.ts
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_TARGET || 'http://localhost:8003',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## 🌐 Access URLs

### Local Development
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8004
- **API Health Check**: http://localhost:8004/api/health

### Production (SSH Tunnel)
- **Production API**: http://localhost:8003 (via SSH tunnel)

## 🔄 Switching Between Local and Production

### For Local Development
```bash
./start-local-dev.sh
```

### For Production Testing
```bash
# Use your existing SSH tunnel
# Frontend will automatically proxy to production (8003)
cd mainapp && npm run dev
```

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Check what's using port 8004
lsof -i :8004

# Kill the process if needed
kill -9 <PID>
```

### Frontend Not Connecting to Backend
```bash
# Check if backend is running
curl http://localhost:8004/api/health

# Check environment variable
echo $VITE_API_TARGET
```

### Production SSH Tunnel Issues
```bash
# Check SSH tunnel
ssh -L 8003:localhost:8003 root@your-server-ip

# Test production API
curl http://localhost:8003/api/health
```

## 📝 Scripts Overview

| Script | Purpose | Port |
|--------|---------|------|
| `start-local-dev.sh` | Start both servers | 8004 + 5173 |
| `start-local-backend.sh` | Backend only | 8004 |
| `mainapp/start-local-dev.sh` | Frontend only | 5173 |

## ✅ Benefits

- ✅ **No conflicts** with production SSH tunnel
- ✅ **Easy switching** between local and production
- ✅ **Environment isolation** - local dev doesn't affect production
- ✅ **One-command setup** for full local development
- ✅ **Automatic cleanup** when stopping servers

## 🎉 Ready to Develop!

Your local development environment is now completely separate from production. You can:

1. **Develop locally** on port 8004 without affecting production
2. **Test production** via SSH tunnel on port 8003
3. **Switch easily** between local and production environments
4. **Run both simultaneously** without conflicts 