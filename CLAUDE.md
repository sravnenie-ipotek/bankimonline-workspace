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

### Environment Variables

Key environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT token signing secret
- `PORT` - Server port (default: 8003)
- `CORS_ALLOWED_ORIGINS` - Allowed CORS origins
- `NODE_ENV` - Environment (development/production)