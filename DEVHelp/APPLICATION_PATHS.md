# BankimOnline Application Paths Documentation

## 🏗️ Application Architecture Overview

This project contains multiple independent applications that run on different ports and serve different purposes.

## 📂 Application Directories & Paths

### 1. Main Banking Application (Production)
- **Path**: `/mainapp/`
- **Technology**: React 18 + TypeScript + Vite
- **Development URL**: `http://localhost:5173`
- **Production URL**: `http://localhost:3001` (served by backend)
- **Purpose**: Main customer-facing banking application with mortgage/credit calculators
- **Entry Point**: `mainapp/src/App.tsx`
- **Status**: ✅ **PRODUCTION - DO NOT MODIFY**

### 2. BankIM Management Portal (Standalone)
- **Path**: `/Users/michaelmishayev/Projects/bankIM_management_portal/`
- **Technology**: React 18 + TypeScript + Vite
- **Development URL**: `http://localhost:3002`
- **Purpose**: Role-based management system (8.1 Компоненты)
- **Roles**: Bank Employee, Sales Manager, Administration, Brokers, Content Manager, Director
- **Entry Point**: `src/App.tsx`
- **Status**: ✅ **COMPLETELY SEPARATED** from main app

### 3. Backend API Server
- **Path**: `/server-db.js`
- **Technology**: Node.js + Express + PostgreSQL
- **Development URL**: `http://localhost:8003`
- **Purpose**: Main API server, database connections, authentication
- **Database**: Railway PostgreSQL

### 4. Customer Approval Interface
- **Path**: `/customer-approval-check.html`
- **URL**: `http://localhost:8003/customer-approval-check.html`
- **Purpose**: Customer approval interface

## 🚪 Port Configuration

| Application | Port | Purpose | Status |
|-------------|------|---------|--------|
| Main Banking App | 5173 | Production consumer app | 🔒 **PROTECTED** |
| Management Portal | 3002 | Admin/role management | ✅ **SEPARATED** |
| Backend API | 8003 | API endpoints & static serving | ✅ **ACTIVE** |

## 🔄 Application Separation

### Main App (localhost:5173)
- **Consumer-facing banking application**
- **MUST remain completely untouched**
- **All production features and services**

### Management Portal (localhost:3002) 
- **Completely independent React application**
- **Zero shared code with main app**
- **Role-based management system**
- **Can be developed/deployed independently**

### Backend (localhost:8003)
- **Serves both applications via API**
- **Handles database connections**
- **Authentication and authorization**

## 🔧 Development Commands

```bash
# Main Production App (DO NOT MODIFY)
cd mainapp && npm run dev  # http://localhost:5173

# Management Portal (Independent Development)
cd /Users/michaelmishayev/Projects/bankIM_management_portal
npm run dev  # http://localhost:3002

# Backend API Server
node server-db.js  # http://localhost:8003
```

## ⚠️ Important Rules

1. **Main app (localhost:5173) is PRODUCTION - DO NOT MODIFY**
2. **Management portal (localhost:3002) is completely independent** 
3. **No cross-application dependencies**
4. **API communication only through backend server**
5. **Each app can be deployed independently** 