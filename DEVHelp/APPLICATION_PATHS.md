# BankimOnline Application Paths Documentation

## 🏗️ Application Architecture Overview

This project contains multiple independent applications that run on different ports and serve different purposes.

## 📂 Application Directories & Paths

### 1. Main Banking Application (Primary)
- **Path**: `/mainapp/`
- **Technology**: React 18 + TypeScript + Vite
- **Development URL**: `http://localhost:5173` (Vite dev server)
- **Production URL**: `http://localhost:3001` (served by backend)
- **Purpose**: Main customer-facing banking application with mortgage/credit calculators
- **Entry Point**: `mainapp/src/App.tsx`
- **Build Output**: `mainapp/dist/`

### 2. Account Dashboard Application
- **Path**: `/account/`
- **Technology**: React 18 + TypeScript + Vite
- **Development URL**: `http://localhost:5174` (typically next available port)
- **Production URL**: Deployed separately on Vercel
- **Purpose**: Personal account dashboard for logged-in users
- **Entry Point**: `account/src/App.tsx`
- **Build Output**: `account/dist/`

### 3. Backend API Server (Node.js)
- **Path**: Root directory (`/server-db.js`)
- **Technology**: Node.js + Express + PostgreSQL
- **Development URL**: `http://localhost:8003`
- **Production URL**: Railway deployment
- **Purpose**: Main API server, database connections, authentication
- **Database**: Railway PostgreSQL
- **Static Serving**: Also serves built React apps

### 4. Legacy HTML Applications
- **Path**: Root directory and `/public/`
- **Files**:
  - `admin.html` - Legacy admin panel
  - `customer-approval-check.html` - Customer approval interface
- **Served by**: Backend server on port 8003
- **URLs**: 
  - `http://localhost:8003/admin.html`
  - `http://localhost:8003/customer-approval-check.html`

## 🌐 Production Deployment Paths

### Vercel Deployments
- **Main App**: `bankimstandaloneprod.vercel.app`
- **Account App**: `bank-dev2-standalone-txwi.vercel.app`

### Railway Deployments
- **Laravel API**: `bankimonlineapi-production.up.railway.app/api/v1`
- **Node.js API**: `bankim-nodejs-api-production.up.railway.app/api`
- **Main Service**: `bankim-standalone-production.up.railway.app`

## 🚪 Port Configuration

| Application | Development Port | Production Port | Purpose |
|-------------|------------------|-----------------|---------|
| Main React App (Vite) | 5173 | - | React development server |
| Account React App (Vite) | 5174 | - | Account development server |
| Backend API Server | 8003 | Railway Auto | API endpoints & static serving |
| File Server (alternative) | 3001 | - | Alternative static file server |

## 🔄 Development vs Production Separation

### Development Environment
- **Frontend Apps**: Run independently on Vite dev servers (5173, 5174)
- **Backend**: Runs on port 8003 with hot reload
- **API Calls**: Proxied from frontend to backend via Vite proxy configuration

### Production Environment
- **Frontend Apps**: Built and deployed separately to Vercel
- **Backend**: Deployed to Railway with static file serving capability
- **API Calls**: Direct HTTPS calls to production API endpoints

## 📁 Key Configuration Files

### Main App (`/mainapp/`)
- `vite.config.ts` - Vite configuration with proxy setup
- `package.json` - Dependencies and scripts
- `.env.development` - Development environment variables
- `.env.production` - Production environment variables

### Account App (`/account/`)
- `vite.config.ts` - Vite configuration
- `package.json` - Dependencies and scripts
- `vercel.json` - Vercel deployment configuration

### Backend
- `server-db.js` - Main server file
- `package.json` - Server dependencies
- `railway.json` - Railway deployment configuration
- `nixpacks.toml` - Build configuration for Railway

## ⚠️ Important Separation Rules

1. **No Cross-Application Dependencies**: Each app should be deployable independently
2. **No localhost:5173 in Production Code**: Only use environment variables for API endpoints
3. **Proper Environment Variables**: Use VITE_* prefixed variables for frontend
4. **API Endpoint Configuration**: Always use configurable base URLs, never hardcoded

## 🔧 Development Commands

### Start All Applications
```bash
# Terminal 1: Backend API
node server-db.js

# Terminal 2: Main App
cd mainapp && npm run dev

# Terminal 3: Account App (if needed)
cd account && npm run dev
```

### Production Build
```bash
# Build main app
cd mainapp && npm run build

# Build account app  
cd account && npm run build

# Start production server
node server-db.js
```

## 📝 Notes
- Each application maintains its own dependencies and configuration
- Cross-application communication happens via API calls only
- Static assets are served independently per application
- Database access is centralized through the backend API server 