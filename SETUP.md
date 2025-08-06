# 🚀 New Developer Setup Guide

**Quick setup guide for Bankimonline workspace development**

## ⚡ Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone git@github.com:sravnenie-ipotek/bankimonline-workspace.git
cd bankimonline-workspace

# 2. Install all dependencies
npm run install:all

# 3. Setup environment variables
cp packages/server/.env.example packages/server/.env
# Edit packages/server/.env with your database credentials

# 4. Start development environment
npm run dev:all
```

## 🗄️ Database Setup

### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL with Docker
docker run --name bankimonline-db \
  -e POSTGRES_PASSWORD=dev123 \
  -e POSTGRES_DB=bankimonline \
  -p 5432:5432 \
  -d postgres:15

# Update your .env file:
DATABASE_URL=postgresql://postgres:dev123@localhost:5432/bankimonline
CONTENT_DATABASE_URL=postgresql://postgres:dev123@localhost:5432/bankimonline
```

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create databases
createdb bankimonline_main
createdb bankimonline_content

# Update .env with your local credentials
```

### Option 3: Development Database Access

Contact the team lead for development database credentials.

## 🔧 Environment Configuration

### Server Environment (.env)

```bash
# Copy template and edit
cp packages/server/.env.example packages/server/.env

# Required variables:
DATABASE_URL=postgresql://username:password@host:port/database
CONTENT_DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secure-random-string
```

### Generate JWT Secret

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📦 Available Commands

### Root Commands (Workspace Management)

```bash
npm run install:all        # Install all package dependencies
npm run dev:all            # Start both client and server
npm run build:all          # Build all packages
npm run test:all           # Run all tests
npm run clean:all          # Clean all node_modules and builds
```

### Individual Package Commands

```bash
# Client (React app)
npm run client:dev         # Start client development server
npm run client:build       # Build client for production
npm run client:test        # Run client tests

# Server (API)  
npm run server:dev         # Start API server
npm run server:test        # Run API tests

# Shared Package
npm run shared:build       # Build shared package
npm run shared:test        # Run shared package tests
```

### Deployment Commands

```bash
npm run push-client        # Deploy client to bankimonline-web
npm run push-server        # Deploy server to bankimonline-api  
npm run push-shared        # Deploy shared to bankimonline-shared
npm run push-all           # Deploy all packages
```

## 🔍 Verification Steps

### 1. Verify Installation

```bash
# Check all packages installed
npm run install:all

# Should see:
# ✅ Root workspace
# ✅ @bankimonline/client
# ✅ @bankimonline/server  
# ✅ @bankimonline/shared
```

### 2. Verify Database Connection

```bash
# Start server (should connect to databases)
npm run server:dev

# Should see:
# ✅ Main Database connected
# ✅ Content Database connected
```

### 3. Verify Development Environment

```bash
# Start full development
npm run dev:all

# Should see:
# Server: http://localhost:8003
# Client: http://localhost:5173
# ✅ Both running without errors
```

### 4. Verify Build System

```bash
# Test build process
npm run build:all

# Should complete without errors
```

## 🌐 Application Access

- **Client App**: http://localhost:5173
- **API Server**: http://localhost:8003
- **API Health**: http://localhost:8003/api/health

## 🗄️ Database-First Content System

The application uses a sophisticated content management system:

- **Cache**: NodeCache (5-minute TTL)
- **Database**: PostgreSQL content tables
- **Fallback**: File system translations
- **API**: `/api/content/:screen/:language`

### Content API Example

```bash
# Test content API
curl http://localhost:8003/api/content/home_page/en
```

## 🌍 Multi-Language Support

- **Languages**: English (en), Hebrew (he), Russian (ru)
- **RTL Support**: Hebrew with right-to-left layout
- **Translation Files**: `packages/client/public/locales/`

## 🧪 Testing

### E2E Tests (Cypress)

```bash
# Run from client package
cd packages/client
npm run cypress        # Interactive mode
npm run cypress:run    # Headless mode
```

### API Tests (Playwright)

```bash
# Run from root
npm run test          # All Playwright tests
npm run test:headed   # With browser visible
```

## 🐛 Troubleshooting

### Common Issues

#### "Database connection failed"
- Check your .env database URLs
- Ensure PostgreSQL is running
- Verify credentials are correct

#### "npm install fails"
- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules packages/*/node_modules`
- Reinstall: `npm run install:all`

#### "Port already in use"
- Kill existing processes: `lsof -ti:8003 | xargs kill`
- Or change PORT in .env file

#### "Permission denied (publickey)"
- Setup SSH keys for GitHub
- Or use HTTPS: `git clone https://github.com/sravnenie-ipotek/bankimonline-workspace.git`

### Getting Help

1. **Documentation**: Check README files in each package
2. **Issues**: Create issue in workspace repository
3. **Team**: Contact development team lead
4. **Architecture**: See `/server/docs/repositoriesLogic.md`

## 📊 Performance Expectations

- **Installation**: < 5 minutes
- **Database Setup**: < 2 minutes (Docker)
- **Development Start**: < 30 seconds
- **Build Time**: < 2 minutes
- **Test Suite**: < 3 minutes

## 🎯 Success Indicators

✅ All packages install without errors  
✅ Both databases connect successfully  
✅ Development servers start on correct ports  
✅ Client loads at http://localhost:5173  
✅ API responds at http://localhost:8003/api/health  
✅ Build completes without errors  
✅ Tests pass successfully

---

**Next Steps**: Once setup is complete, see individual package README files for detailed development workflows.