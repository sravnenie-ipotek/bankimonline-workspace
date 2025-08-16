# Environment Configuration Guide

## ⚠️ CRITICAL: Single .env File Policy

This project uses a **SINGLE .env file** located at the project root.

### File Structure:
```
bankDev2_standalone/
├── .env                 # ← THE ONLY .env FILE
├── .env.example         # ← Template (committed to git)
├── server/
│   └── .env -> ../.env  # ← Symlink to root (DO NOT CREATE SEPARATE)
└── mainapp/
    └── (uses root .env via Vite)
```

### Required Environment Variables:
```bash
# Database
DATABASE_URL=postgresql://...
CONTENT_DATABASE_URL=postgresql://...

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=8003
NODE_ENV=development
```

### How Each Component Reads .env:

#### Backend (server/):
- Automatically reads from root when started from root: `node server/server-db.js`
- Uses symlink when started from server dir: `cd server && npm run dev`

#### Frontend (mainapp/):
- Vite automatically loads .env from its directory and parent
- Variables must be prefixed with `VITE_` to be exposed to client

### Common Issues & Solutions:

| Issue | Cause | Solution |
|-------|-------|----------|
| "JWT_SECRET not found" | Missing .env in server/ | Ensure symlink exists: `ln -s ../.env server/.env` |
| "0 env variables loaded" | Wrong .env location | Check dotenv is reading from root |
| Port already in use | Multiple server instances | Kill all: `pkill -f server-db.js` |

### DO NOT:
- ❌ Create separate .env files in subdirectories
- ❌ Copy .env files (use symlinks if needed)
- ❌ Commit .env to git (only .env.example)
- ❌ Mix monorepo and standalone configs

### Startup Commands:
```bash
# CORRECT - From root:
npm run dev              # Starts both servers

# CORRECT - Manual:
node server/server-db.js # Backend
cd mainapp && npm run dev # Frontend

# WRONG:
cd packages/server && npm run dev  # Old monorepo structure
```

Last Updated: August 16, 2025