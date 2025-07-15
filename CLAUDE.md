# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a banking/financial services web application with a React frontend and Node.js backend, designed for mortgage and credit calculations. The application features multi-language support (English, Hebrew, Russian), complex multi-step forms, and integration with a PostgreSQL database hosted on Railway.

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
├── migrations/          # Database migration files
├── locales/            # Translation files (en/he/ru)
└── uploads/            # File upload directory
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

### Development Debugging

#### Server Startup Issues
If APIs fail with connection refused:
```bash
# Check if backend server is running
ps aux | grep "node.*server-db.js"

# Start backend server in background
nohup node server-db.js > server.log 2>&1 &

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