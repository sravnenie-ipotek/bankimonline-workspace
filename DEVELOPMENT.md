# Development Guide - Modern Architecture

## 🚀 Quick Start - CORRECT Way to Launch

### ✅ Modern Standard Launch Method

**Always use this two-terminal approach:**

```bash
# Terminal 1: Backend servers (API + File server)
npm run dev

# Terminal 2: Frontend development server
cd mainapp
npm run dev
```

### ✅ Alternative: PM2 Process Management

```bash
# Start both servers with PM2
npm run pm2:dev

# Check status
npm run pm2:status

# View logs
npm run pm2:logs
```

## ❌ NEVER Use These Legacy Methods

### DO NOT USE:
1. **`npm run dev:all`** - Old monorepo command (deprecated)
2. **Direct node commands** - Missing environment setup
3. **Package workspace commands** - From old monorepo structure
4. **Single terminal for both** - Causes port conflicts

## 🛡️ Safeguards Against Legacy Launch

### 1. Package.json Script Guards

The following deprecated scripts now show warnings:
- `dev:all` → Shows legacy warning
- `start:legacy` → Shows legacy warning
- Any direct workspace commands → Redirects to correct method

### 2. Pre-launch Checklist

Before starting development, verify:
```bash
# Check no processes on critical ports
lsof -i :8003  # Should be empty
lsof -i :5173  # Should be empty
lsof -i :3001  # Should be empty

# Kill any stray processes
npm run kill-ports:all
```

### 3. Environment Validation

The modern setup requires:
- **Port 8003**: API server (server-db.js)
- **Port 3001**: File server (serve.js)
- **Port 5173**: Vite dev server

## 📋 Launch Verification Checklist

After launching, verify everything is running correctly:

### Backend Verification (Terminal 1)
```bash
# Should see both servers starting:
✓ API Server running on port 8003
✓ File Server running on port 3001
```

### Frontend Verification (Terminal 2)
```bash
# Should see Vite starting:
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### API Health Check
```bash
# Test API is responding
curl http://localhost:8003/api/v1/health

# Test file server
curl http://localhost:3001/
```

## 🏗️ Architecture Overview

### Current Standard Architecture (2024)
```
bankDev2_standalone/
├── mainapp/          # React frontend (separate build)
├── server/           # Node.js backend
│   ├── server-db.js  # API server (port 8003)
│   └── serve.js      # File server (port 3001)
├── ecosystem.config.js # PM2 configuration
└── package.json      # Root package (NOT monorepo)
```

### Why This Architecture?

1. **Separation of Concerns**: Frontend and backend are clearly separated
2. **Independent Scaling**: Each part can be scaled independently  
3. **Clear Port Management**: No port conflicts or confusion
4. **Modern Tooling**: Vite for frontend, PM2 for process management
5. **Production Ready**: Matches production deployment structure

## 🚫 Legacy Architecture (DO NOT USE)

### Old Monorepo Structure (Deprecated)
```
# OLD STRUCTURE - DO NOT USE
packages/
├── client/    # Old frontend location
├── server/    # Old backend location
└── shared/    # Old shared code
```

### Problems with Legacy Approach:
- Complex workspace management
- Port conflicts
- Build complications
- Deployment issues
- Unclear separation of concerns

## 🔧 Troubleshooting

### If You Accidentally Used Legacy Method

1. **Stop everything**:
```bash
# Kill all Node processes
npm run kill-ports:all
```

2. **Clear any bad state**:
```bash
# Clear Vite cache
cd mainapp
rm -rf node_modules/.vite
```

3. **Start fresh with correct method**:
```bash
# Terminal 1
npm run dev

# Terminal 2
cd mainapp
npm run dev
```

### Common Issues and Fixes

#### Port Already in Use
```bash
# Find and kill process on port
lsof -i :8003 | grep LISTEN
kill -9 [PID]
```

#### API Connection Refused
- Check Terminal 1 - both servers should be running
- Verify port 8003 is accessible
- Check no firewall blocking

#### Frontend Not Loading
- Check Terminal 2 - Vite should be running
- Verify port 5173 is accessible
- Clear browser cache

## 📚 Additional Resources

- **README.md**: Project overview and setup
- **CLAUDE.md**: AI assistant documentation
- **ecosystem.config.js**: PM2 configuration details

## ✨ Best Practices

1. **Always use two terminals** for development
2. **Check ports before starting** to avoid conflicts
3. **Use PM2 for long-running sessions** to manage processes
4. **Keep terminals visible** to monitor logs
5. **Test API endpoints** after starting to verify

## 🎯 Quick Commands Reference

```bash
# Start development (correct way)
npm run dev                  # Terminal 1: Backend
cd mainapp && npm run dev    # Terminal 2: Frontend

# Process management
npm run pm2:dev              # Start with PM2
npm run pm2:status           # Check status
npm run pm2:logs             # View logs
npm run pm2:restart          # Restart services

# Cleanup
npm run kill-ports:all       # Kill all dev processes
```

---

**Remember**: The modern approach uses separate processes for backend and frontend. This provides better isolation, clearer logs, and matches production architecture.