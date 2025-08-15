# Commands Documentation

Complete reference for all development, testing, and deployment commands in the BankimOnline project.

## =� Core Development Commands

./kill-ports.sh
### Server Management
```bash
# Start production API server (port 8003)
npm start
# � node server/server-db.js

# Start development environment (API + file server)
npm run dev
# � node server/start-dev.js
# Starts: server-db.js (port 8003) + serve.js (port 3001)

# Start development with client
npm run dev:client  
# � Starts both backend server and frontend dev server

# Kill stuck processes
npm run kill-ports        # Kill all ports
npm run kill-ports:all     # Kill with force (-n -p flags)
npm run kill-ports:node    # Kill node processes only
npm run kill-ports:process # Kill by process name
```

### Database & Content Management
```bash
# Sync translation files between frontend/backend
npm run sync-translations
npm run translations       # Alias for sync-translations

# Test database connectivity and content availability
npm run verify:database
# � node scripts/verify-database.js
# Checks: CONTENT_DATABASE_URL, table structure, critical content, translation status

# Test critical dropdown API endpoints
npm run test:dropdowns  
# � node scripts/test-dropdowns.js
# Validates: mortgage_step3, credit_step3, refinance_step3 dropdown functionality
```

## >� Testing Commands

### Playwright Testing (Backend/Integration)
```bash
# Run all Playwright tests  
npm test
npm run test
# � playwright test

# Run tests with browser visible
npm run test:headed
# � playwright test --headed

# Interactive test UI
npm run test:ui
# � playwright test --ui

# Debug mode with step-by-step execution
npm run test:debug  
# � playwright test --debug

# Show HTML test report
npm run test:report
# � playwright show-report
```

### Form & Frontend Testing
```bash
# Smoke test critical form functionality
npm run smoke:forms
# � node scripts/smoke-forms.js  
# Tests: mortgage calculator, credit calculator, refinance forms
# Requires: Frontend server running on port 5173

# Frontend-specific tests (from mainapp directory)
cd mainapp
npm run cypress              # Open Cypress test runner
npm run cypress:run          # Run E2E tests headlessly  
npm run test:e2e:headed      # Run E2E with browser visible
npm run cypress:component    # Component tests
npm run test:translations    # Translation coverage tests
```

### Quality Assurance
```bash
# Start QA reports server
npm run qa:server
# � node scripts/serve-qa-reports.js

# Start QA server with auto-reload
npm run qa:server:dev
# � nodemon scripts/serve-qa-reports.js

# Generate specific QA reports
npm run qa:generate-refinance  # Refinance calculator report
npm run qa:generate-credit     # Credit calculator report
```

## <� Build & Deployment Commands

### Multi-Workspace Management
```bash
# Install all dependencies and build shared packages
npm run install:all
# � npm install && npm run shared:build

# Build all packages
npm run build:all
# � npm run shared:build && npm run client:build

# Run all tests across workspaces
npm run test:all  
# � npm run client:test && npm run server:test

# Start all development servers
npm run dev:all
# � concurrently server and client dev servers
```

### Workspace-Specific Commands
```bash
# Client (Frontend) Commands
npm run client:dev      # Start frontend dev server
npm run client:build    # Build frontend for production  
npm run client:test     # Run frontend tests
npm run client:test:run # Run frontend tests in CI mode

# Server (Backend) Commands  
npm run server:dev      # Start backend dev server
npm run server:start    # Start backend production server

# Shared Package Commands
npm run shared:build    # Build shared TypeScript packages
npm run shared:validate # Validate shared package structure
```

## = Git & Repository Management

### Multi-Repository Sync
```bash
# Push to all three synchronized repositories
npm run push:all
# � ./push-to-all-repos.sh
# Pushes to: bankDev2_standalone, bankimonlineapi, bankimonline_shared

# Push to specific repositories
npm run push:workspace  # Main workspace repository
npm run push:web        # Web/frontend repository  
npm run push:api        # API/backend repository
npm run push:shared     # Shared documentation repository

# Smart push with branch detection
npm run push:smart
# � ./smart-push.sh

# Pull from all repositories
npm run pull:all
# � ./pull-from-all-repos.sh
```

### Legacy Push Commands  
```bash
npm run push-client     # Legacy client push
npm run push-server     # Legacy server push
npm run push-shared     # Legacy shared push
npm run push-all        # Legacy all repositories push
npm run validate-packages # Validate package structure
```

## =' Development Utilities

### Communication & Notifications
```bash
# WhatsApp integration setup
npm run setup:whatsapp-hooks
# � bash hooks/setup-whatsapp-hooks.sh

# Test WhatsApp notifications
npm run test:whatsapp-hooks  
# � node hooks/test-whatsapp-notification.js

# Send WhatsApp bug notifications
npm run hooks:whatsapp
# � node hooks/whatsapp-bug-notification.js
```

### Development Scripts
```bash
# Serve static files (development only)
node server/serve.js     # File server on port 3001

# Database utilities
node test-railway-simple.js      # Test Railway database connection
node check-db-structure.js       # Validate database schema
node test-login-flow.js          # Test authentication flow

# Content migration utilities  
node mainapp/migrations/migrate_sidebar_menu_content.js
node mainapp/analyze-content-migration.js
node mainapp/create_content_items_schema.js
```

## = Debugging & Troubleshooting Commands

### Server Diagnostics
```bash
# Check running processes
ps aux | grep "server-db.js"
ps aux | grep "serve.js"

# Check port usage
lsof -i :8003  # API server port
lsof -i :5173  # Frontend dev port  
lsof -i :3001  # File server port

# Test API endpoints manually
curl http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage
curl http://localhost:8003/api/dropdowns/mortgage_step3/he

# Clear server cache
curl -X POST http://localhost:8003/api/cache/clear
```

### Frontend Diagnostics
```bash
cd mainapp

# Clear build caches
rm -rf .vite dist build node_modules/.cache
npm run build

# Test with different ports (if conflicts)
npm run dev -- --port 5174
npm run preview -- --port 4173
```

### Database Troubleshooting
```bash
# Test different database connections
CONTENT_DATABASE_URL=<url1> npm run verify:database
DATABASE_URL=<url2> npm start

# Content migration check
node mainapp/analyze-mortgage-content.js
node mainapp/test-content-tables.js
node mainapp/test-all-dropdown-apis.js
```

## =� Emergency Recovery Commands

### Server Recovery
```bash
# Full server restart with correct database
pkill -f "server-db.js"
pkill -f "serve.js"  
CONTENT_DATABASE_URL='<correct-url>' npm start

# Reset development environment
npm run kill-ports:all
npm run dev
```

### Cache & State Reset
```bash
# Clear all caches
curl -X POST http://localhost:8003/api/cache/clear
rm -rf mainapp/.vite mainapp/dist mainapp/build
rm -rf node_modules/.cache

# Reset frontend state
cd mainapp
rm -rf node_modules/.cache
npm run build
npm run dev
```

### Database Recovery
```bash
# Verify database connectivity
npm run verify:database

# Test critical endpoints
npm run test:dropdowns

# Manual database testing
node -e "
  const { Pool } = require('pg');
  const pool = new Pool({ 
    connectionString: 'CONTENT_DATABASE_URL'
  });
  pool.query('SELECT COUNT(*) FROM content_items')
    .then(r => console.log('Items:', r.rows[0].count))
    .finally(() => pool.end());
"
```

## =� Pre-Deployment Validation Checklist

Run these commands before deploying:

```bash
# 1. Validate database connectivity and content
npm run verify:database

# 2. Test critical dropdown functionality  
npm run test:dropdowns

# 3. Run comprehensive backend tests
npm run test

# 4. Test frontend functionality
npm run smoke:forms

# 5. Build and validate all packages
npm run build:all

# 6. Sync translations
npm run sync-translations

# 7. Run workspace tests
npm run test:all
```

## =
 Monitoring & Health Checks

### API Health Checks
```bash
# Check API server status
curl http://localhost:8003/health

# Monitor API performance  
curl -s http://localhost:8003/api/dropdowns/mortgage_step3/he | jq '.performance'

# Check cache status
curl -s http://localhost:8003/api/cache/stats
```

### Application Health
```bash
# Frontend availability
curl -I http://localhost:5173

# Database connectivity
npm run verify:database

# Critical functionality
npm run test:dropdowns && npm run smoke:forms
```

## =� Development Workflow Commands

### Daily Development
```bash
# 1. Start development environment  
npm run dev

# 2. Test changes
npm run test:dropdowns

# 3. Commit and sync
git add . && git commit -m "..."
npm run push:all
```

### Feature Development  
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Develop with live reload
npm run dev:client

# 3. Test thoroughly
npm run test && npm run smoke:forms

# 4. Build and validate
npm run build:all

# 5. Sync to all repositories
npm run push:all
```

### Bug Investigation
```bash
# 1. Verify environment
npm run verify:database

# 2. Test specific functionality  
npm run test:dropdowns

# 3. Check server logs
grep "ERROR" server.log

# 4. Test with fresh cache
curl -X POST http://localhost:8003/api/cache/clear
npm run test:dropdowns
```

---

## =� Pro Tips

**Performance Optimization:**
- Use `npm run dev` instead of starting servers individually
- Clear caches regularly with cache clear endpoint
- Monitor API response times with `.performance` metrics

**Debugging Efficiency:**  
- Always run `npm run verify:database` first for dropdown issues
- Use `npm run test:dropdowns` to quickly validate API endpoints
- Check server logs for database connection strings during startup

**Deployment Safety:**
- Run full validation checklist before deploying
- Test in incognito browser to avoid cache issues  
- Verify environment variables are set correctly

**Multi-Repository Management:**
- Use `npm run push:all` to sync all repositories
- Keep commit messages consistent across repos
- Pull regularly with `npm run pull:all`