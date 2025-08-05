# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a banking/financial services web application with a React frontend and Node.js backend, designed for mortgage and credit calculations. The application features multi-language support (English, Hebrew, Russian), complex multi-step forms, and integration with a PostgreSQL database hosted on Railway.

### Dual Repository Architecture
This project maintains two synchronized GitHub repositories:
- **Main Repository**: https://github.com/MichaelMishaev/bankDev2_standalone (complete application)
- **Server Repository**: https://github.com/MichaelMishaev/bankimonlineapi (backend focus)

Use the provided script for synchronized commits:
```bash
# Automated push to both repositories
./push-to-both-repos.sh "Your commit message"

# Manual push to both
git add . && git commit -m "Update" && git push origin main && git push bankimonlineapi main
```

## Quick Start

### Start Development Environment
```bash
# Start both API server (port 8003) and file server (port 3001)
npm run dev

# Alternative: start servers individually
node server-db.js  # API server only
node serve.js      # Static file server only
```

### Frontend Development
```bash
cd mainapp
npm run dev  # Starts on port 5173 with API proxy to 8003
```

## Development Commands

### Backend (Node.js API Server)
```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Sync translations between frontend and backend
npm run sync-translations
```

### Frontend (React Application)
```bash
# Navigate to frontend directory
cd mainapp

# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Sync translations
npm run sync-translations
```

### Testing

#### Frontend Testing (Cypress)
```bash
cd mainapp

# Open Cypress test runner
npm run cypress

# Run all E2E tests headlessly
npm run cypress:run

# Run E2E tests with browser visible
npm run test:e2e:headed

# Run component tests
npm run cypress:component

# Test translation coverage
npm run test:translations
npm run test:translations:full
npm run test:translations:screenshots
```

#### Backend Testing (Playwright)
```bash
# Root directory Playwright tests
npm run test              # Run all Playwright tests
npm run test:headed       # Run with browser visible
npm run test:ui           # Interactive UI mode
npm run test:debug        # Debug mode
npm run test:report       # Show test report

# Individual test files
npx playwright test tests/mortgage-calculator-flow.spec.ts
npx playwright test tests/banking-app.spec.ts
```

### Database
```bash
# Test database connection
node test-railway-simple.js

# Check database structure
node check-db-structure.js

# Test login flow
node test-login-flow.js
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t bankdev .
docker run -p 8003:8003 bankdev
```

### Database Migrations
```bash
# Run migrations (check migrations/ directory for SQL files)
# Files are numbered sequentially (001-xxx.sql)
# Recent migrations include content management system setup
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Railway hosted)
- **State Management**: Redux Toolkit + RTK Query
- **UI Libraries**: Material-UI, Tailwind CSS, SCSS Modules
- **Forms**: Formik + Yup validation
- **i18n**: i18next with RTL support for Hebrew
- **Testing**: Cypress for E2E and component tests
- **Deployment**: Railway with Docker

### Directory Structure
```
/
├── mainapp/              # React frontend application
│   ├── src/
│   │   ├── app/         # Core app setup and routing
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-based page components
│   │   ├── services/    # API layer (RTK Query)
│   │   ├── store/       # Redux store and slices
│   │   ├── hooks/       # Custom React hooks
│   │   ├── utils/       # Utility functions
│   │   └── types/       # TypeScript definitions
│   ├── public/          # Static assets
│   └── cypress/         # E2E and component tests
├── server-db.js         # Main API server with PostgreSQL
├── serve.js             # Static file server (port 3001)
├── start-dev.js         # Development launcher script
├── migrations/          # Database migration files (numbered SQL)
├── locales/            # Translation files (en/he/ru)
├── uploads/            # File upload directory
├── scripts/            # Utility scripts (sync-translations.js)
└── DEVHelp/           # Development documentation
```

### Key Application Features

1. **Multi-Step Service Forms**
   - Mortgage calculation (10+ steps)
   - Credit calculation
   - Refinancing options
   - Complex validation with Yup schemas

2. **Authentication System**
   - Phone-based SMS authentication for customers (clients table)
   - Email-based authentication for staff (users table)
   - JWT token management
   - Protected routes

3. **Personal Cabinet**
   - User profile management
   - Income data tracking
   - Credit history
   - Document uploads
   - Bank authorizations

4. **Multi-Language Support**
   - English, Hebrew, Russian
   - RTL support for Hebrew
   - Dynamic font loading
   - Persisted language preference

### API Patterns

The backend uses Express with PostgreSQL and provides:
- RESTful endpoints under `/api/v1/`
- JWT authentication
- File upload handling with Multer
- CORS configuration for multiple origins

Key endpoints:
- Authentication: `/api/sms-login`, `/api/sms-code-login`
- Banks: `/api/v1/banks`
- Cities: `/api/v1/cities`
- Locales: `/api/v1/locales`
- Parameters: `/api/v1/params`

### State Management

Redux Toolkit with feature-based slices:
- `authSlice` - Authentication state
- `calculateMortgageSlice` - Mortgage calculation data
- `borrowersSlice` - Borrower information
- `languageSlice` - Language preferences
- Multiple service-specific slices

### Database Schema

PostgreSQL database with key tables:
- `users` - Admin/staff accounts (email auth)
- `clients` - Customer accounts (phone auth)
- `banks` - Israeli bank information
- `locales` - Translation content
- `params` - System configuration
- `cities` - Location data
- Financial tables for credits, programs, rates

### Development Workflow

1. **Frontend Development**
   - Vite dev server proxies API calls to port 8003
   - Hot module replacement enabled
   - Path aliases configured (@src, @components, etc.)

2. **Backend Development**
   - Uses nodemon for auto-reload in dev mode
   - Morgan for request logging
   - Environment variables via dotenv

3. **Testing Strategy**
   - Cypress for E2E testing of critical user flows
   - Component testing setup available
   - Test data configured in cypress.config.ts

4. **Code Quality**
   - ESLint with TypeScript support
   - Prettier for formatting
   - Configured for React best practices

### Deployment

The application is deployed on Railway using Docker:
- Dockerfile builds both frontend and backend
- Frontend is built and served statically
- Backend runs on port 8003
- PostgreSQL database on Railway infrastructure
- Static files served via serve.js on port 3001 (development only)

### Build Configuration

#### Vite Configuration
- Path aliases configured: @src, @components, @pages, @assets, @lib, @shared, @context, @hooks, @types
- Manual chunks for optimal code splitting (react, ui, state, forms, utils, i18n vendors)
- Build output directory: mainapp/build
- Dev server proxy: /api → localhost:8003

#### TypeScript Configuration
- Strict mode enabled
- Path aliases matching Vite config
- ES2022 target for modern features

### Important Patterns

1. **Form Handling**: Multi-step forms use Formik with step-specific validation schemas
2. **API Integration**: RTK Query for data fetching with caching
3. **Routing**: Lazy-loaded routes with code splitting
4. **i18n**: Translation keys organized by feature/page
5. **Component Structure**: Feature-based organization with shared UI components
6. **Error Handling**: Error boundaries and toast notifications

### Critical Backend Architecture

#### Server Structure
- **Main Server**: `server-db.js` - Unified Express server handling all API endpoints
- **Database**: Direct PostgreSQL integration using `pg` library (no ORM)
- **Port Configuration**: Default 8003, configurable via PORT env var
- **Authentication**: Dual-mode (SMS for customers, email for staff)

#### Key API Endpoints
- **Customer APIs**: `/api/customer/compare-banks`, `/api/customer/mortgage-programs`
- **Authentication**: `/api/sms-login`, `/api/sms-code-login`, `/api/login`
- **Admin**: `/api/admin/*` - Full admin panel functionality
- **Bank Worker**: `/api/bank-worker/*` - Registration and management system

#### Database Schema Patterns
- **Users vs Clients**: Separate tables for staff (`users`) vs customers (`clients`)
- **Banking Standards**: Dynamic bank configuration in `banking_standards` table
- **Calculation Tables**: `loan_calculations`, `client_credit_history`, `client_debts`
- **Localization**: `locales` table for multi-language content

### Frontend Architecture Deep Dive

#### State Management Structure
Redux Toolkit with extensive persistence using redux-persist:
- **Service-Specific Slices**: `calculateMortgageSlice`, `calculateCreditSlice`, `refinanceMortgageSlice`
- **User Data Slices**: `borrowersSlice`, `borrowersPersonalDataSlice`, `otherBorrowersSlice`
- **UI State**: `modalSlice`, `activeField`, `languageSlice`
- **Authentication**: Separate `authSlice` and `loginSlice` for different auth flows

#### Multi-Step Form Architecture
Complex step-based forms with inter-dependent data flow:
1. **Step 1**: Calculation parameters (property value, loan details)
2. **Step 2**: Personal information (name, birthday, citizenship)
3. **Step 3**: Income and employment data
4. **Step 4**: Bank offers and program selection

Each step persists data to Redux and validates before progression.

#### Critical Data Flow Issues
The mortgage calculator has a complex data transformation in `bankOffersApi.ts`:
- `transformUserDataToRequest()` function maps Redux state to API format
- Potential data loss between steps due to state structure mismatches
- Bank offers API requires specific field mapping for property ownership logic

#### Form Validation Patterns
- **Formik + Yup**: All multi-step forms use Formik with step-specific Yup schemas
- **Dynamic Validation**: Property ownership affects down payment validation rules
- **Cross-Field Dependencies**: Initial payment validation depends on property ownership selection

### Special Implementation Notes

#### Property Ownership Logic (Confluence Specification)
Critical business rule implementation:
- "No property": 75% financing (25% min down payment)
- "Has property": 50% financing (50% min down payment)  
- "Selling property": 70% financing (30% min down payment)

This logic affects slider ranges, validation rules, and API calculations.

#### Calculation Engine
- **Frontend**: JavaScript calculation functions in `utils/helpers/`
- **Backend**: PostgreSQL stored functions for bank-specific calculations
- **Synchronization**: Both systems must use identical 5% default interest rate

#### Language & RTL Support
- **i18next Integration**: Dynamic language switching with persistence
- **RTL Support**: Hebrew language with right-to-left layout handling
- **Font Loading**: Dynamic Hebrew font loading for proper RTL display

### Dual-Server Architecture (Development)

The development environment uses TWO servers:
1. **API Server** (server-db.js) - Port 8003 - Handles API requests and database operations
2. **File Server** (serve.js) - Port 3001 - Serves static files from uploads directory

This setup is managed by start-dev.js which launches both servers with proper logging.

### Development Debugging

#### Server Startup Issues
If APIs fail with connection refused:
```bash
# Use the development launcher (starts both servers)
npm run dev

# Or check if servers are running individually
ps aux | grep "node.*server-db.js"
ps aux | grep "node.*serve.js"

# Start servers individually if needed
node server-db.js  # API server
node serve.js      # File server

# Check server logs
tail -f server.log
```

#### Common Data Flow Issues
- **Redux State**: Check browser dev tools Redux DevTools for state structure
- **API Payload**: Console logs show request/response in `bankOffersApi.ts`
- **Missing Data**: Look for `undefined` values in server logs at `[COMPARE-BANKS] Request received`

#### Translation Synchronization
```bash
# Sync translation files between frontend and backend
npm run sync-translations
# OR from frontend directory
cd mainapp && npm run sync-translations
```

### Environment Variables

Backend environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT token signing secret
- `PORT` - Server port (default: 8003)
- `CORS_ALLOWED_ORIGINS` - Allowed CORS origins
- `NODE_ENV` - Environment (development/production)

Frontend environment variables:
- `VITE_NODE_API_BASE_URL` - API base URL override
- `VITE_APP_NAME` - Application name
- `VITE_APP_ENV` - Environment designation

### Testing Configuration

#### Cypress Setup (Frontend Testing)
- Base URL: http://localhost:5173
- API URL: http://localhost:8003
- Default viewport: 1920x1080
- Test data configured in cypress.config.ts
- Test user phone: 972544123456 (mock OTP: 123456)
- Support for E2E and component testing
- Translation testing with screenshot capabilities
- Retry configuration: 2 retries in run mode

#### Playwright Setup (Backend/Integration Testing)
- Base URL: http://localhost:5173 (configured in playwright.config.ts)
- Automated server startup: Both frontend (port 5173) and backend (port 8003)
- Cross-browser testing: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- Test directory: `./tests/`
- Test files: mortgage-calculator-flow.spec.ts, banking-app.spec.ts
- Parallel execution enabled
- Screenshot/video capture on failures
- HTML reporting with trace collection

## Translation Management

### Translation Preservation Guidelines

**⚠️ CRITICAL: NEVER DELETE TRANSLATIONS**

Translation files are mission-critical for the multi-language application. Follow these strict guidelines:

#### Translation File Structure
- **English**: `/public/locales/en/translation.json` (primary language)
- **Hebrew**: `/public/locales/he/translation.json` (RTL support)
- **Russian**: `/public/locales/ru/translation.json` (secondary language)

#### Translation Modification Rules
1. **NEVER DELETE** any translation keys unless explicitly instructed
2. **ALWAYS ADD** new translation keys to ALL three language files simultaneously
3. **ALWAYS VERIFY** that component translation keys exist before using them
4. **ALWAYS SYNC** translations between frontend and backend using `npm run sync-translations`

#### Key Translation Patterns
- Form fields: `[feature]_[field]_[type]` (e.g., `calculate_mortgage_property_ownership`)
- Form options: `[feature]_[field]_option_[number]` (e.g., `calculate_mortgage_property_ownership_option_1`)
- Form placeholders: `[feature]_[field]_ph` (e.g., `calculate_mortgage_property_ownership_ph`)
- Validation errors: `error_[field]_[rule]` (e.g., `error_amount_required`)

#### Missing Translation Recovery
If translations are accidentally deleted, they can be restored from:
1. Git history: `git show HEAD~5 -- public/locales/en/translation.json`
2. Component usage: Search for `t('missing_key')` in codebase
3. Database backup: Check `locales` table for fallback values

#### Critical Translation Keys
The following translation keys are essential for core functionality:
- `calculate_mortgage_property_ownership` - Property ownership dropdown title
- `calculate_mortgage_property_ownership_ph` - Property ownership placeholder
- `calculate_mortgage_property_ownership_option_1` - "I don't own any property" (75% LTV)
- `calculate_mortgage_property_ownership_option_2` - "I own a property" (50% LTV)
- `calculate_mortgage_property_ownership_option_3` - "I'm selling a property" (70% LTV)

#### Translation Validation
Before any deployment, verify translations exist:
```bash
# Check for missing keys in components
grep -r "t('.*')" mainapp/src/ | grep -v node_modules

# Validate JSON structure
node -e "JSON.parse(require('fs').readFileSync('public/locales/en/translation.json', 'utf8'))"
```

#### Translation Synchronization
Always sync translations between frontend and backend:
```bash
# From project root
npm run sync-translations

# From frontend directory
cd mainapp && npm run sync-translations
```

## Migration Strategy

### Database Content Migration
The project is transitioning from JSON-based translations to database-backed content management:
- Migration files in `migrations/` directory handle the transition
- Content management tables: `content_pages`, `content_items`, `content_sections`
- Use numbered migration files (e.g., 001-xxx.sql) for sequential execution
- Recent migrations focus on moving UI text from translation.json to database

### Key Migration Scripts
- `migrate-mortgage-calculator-to-db.js` - Migrates calculator content
- `comment-out-migrated-keys.js` - Comments migrated keys in JSON files
- Check `migrations/MIGRATION_STATUS.md` for current migration progress

## MCP Integration

This project includes MCP (Model Context Protocol) server configuration for enhanced AI tooling:

### Available MCP Servers
- **@playwright/mcp** - Playwright testing automation server
- **YouTrack** - Issue tracking and project management
- **Atlassian** - Confluence documentation access
- **Figma** - Design system integration

### MCP Configuration
The `.mcp.json` file contains server configurations for development workflow automation.

## Development Workflow Best Practices

### Git Workflow
- Always commit to both repositories using the provided script
- Use descriptive commit messages following conventional commit format
- Test both frontend and backend before committing

### Code Quality Standards
- Frontend: ESLint + Prettier configuration enforced
- TypeScript strict mode enabled
- All components should follow established patterns
- Translation keys must exist in all three languages before use

### Performance Considerations
- Vite build optimization with manual chunks configured
- Redux state persistence for user experience
- API response caching implemented via RTK Query
- Lazy loading for route-based code splitting