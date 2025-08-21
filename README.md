# 🏦 Bankimonline - Standalone Banking Application

**Modern Israeli Banking Services Platform**

A comprehensive full-stack banking application providing mortgage calculations, credit assessments, refinancing services, and customer management for Israeli financial institutions.

## 🏗️ Architecture

This is a **standalone application** with a unified repository containing both frontend and backend components:

```
├── mainapp/          # React frontend application
├── server/           # Node.js backend API
├── locales/          # Multi-language support (Hebrew/English/Russian)
├── migrations/       # Database schema migrations
└── uploads/          # File upload storage
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL database
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YourOrg/bankDev2_standalone.git
cd bankDev2_standalone

# Install dependencies
npm install

# Frontend dependencies
cd mainapp && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### Development Setup

```bash
# Start both API server (port 8003) and file server (port 3001)
npm run dev

# Frontend development server (port 5173)
cd mainapp && npm run dev
```

### Production Deployment

```bash
# Build frontend for production
cd mainapp && npm run build

# Start production server
npm start
```

## 🌐 Application URLs

- **Frontend Development**: http://localhost:5173
- **API Server**: http://localhost:8003
- **File Server**: http://localhost:3001 (development only)

## 📦 Core Features

### 🏠 Financial Services
- **Mortgage Calculator** - Multi-step mortgage calculation with bank comparison
- **Credit Calculator** - Personal and business credit assessment
- **Refinancing Services** - Mortgage and credit refinancing options
- **Bank Comparison** - Real-time comparison of Israeli bank offers

### 👥 User Management
- **SMS Authentication** - Israeli phone number verification
- **Customer Portal** - Personal financial dashboard
- **Document Upload** - Secure document management
- **Multi-Language Support** - Hebrew (RTL), English, Russian

### 🏢 Admin Features
- **Bank Worker Management** - Staff registration and management
- **Content Management** - Dynamic content and translations
- **Analytics Dashboard** - User engagement and conversion metrics

## 🛠️ Technology Stack

### Frontend (mainapp/)
- **React 18** - Modern React with Hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast development and build tool
- **Redux Toolkit** - State management with persistence
- **Material-UI** - React component library
- **Tailwind CSS** - Utility-first CSS framework
- **i18next** - Internationalization with RTL support
- **Formik + Yup** - Form handling and validation

### Backend (server/)
- **Node.js + Express** - RESTful API server
- **PostgreSQL** - Primary database
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **Morgan** - Request logging
- **CORS** - Cross-origin resource sharing

### Database
- **PostgreSQL** - Hosted on Railway
- **Migration System** - Numbered SQL migration files
- **Content Management** - Database-first translation system

## 📝 Development Commands

### Root Level Commands
```bash
# Development servers
npm run dev                    # Start both API and file servers
npm start                      # Production server

# Database
npm run sync-translations      # Sync translation files
npm run verify:database        # Test database connection

# Testing
npm test                       # Playwright backend tests
npm run test:headed           # Playwright with browser visible
npm run test:integration      # Integration test suite
```

### Frontend Commands (mainapp/)
```bash
# Development
npm run dev                    # Vite dev server (port 5173)
npm run build                  # Production build
npm run preview               # Preview production build

# Testing
npm run cypress               # Cypress E2E tests (interactive)
npx cypress run               # Cypress E2E tests (headless)
npm run test:translations     # Translation validation tests

# Code Quality
npm run lint                  # ESLint code analysis
npm run format               # Prettier code formatting
```

## 🌍 Multi-Language Support

The application supports three languages with complete localization:

- **Hebrew (he)** - Primary language with RTL support
- **English (en)** - International language
- **Russian (ru)** - Russian-speaking community

### Translation Management
- Translation files in `/locales/{language}/translation.json`
- Database-backed content system for dynamic content
- Automated translation sync between frontend and backend
- RTL layout support for Hebrew interface

## 📊 Testing Strategy

### End-to-End Testing (Cypress)
```bash
# Run comprehensive test suite
npx cypress run --spec "cypress/e2e/**/*.cy.ts"

# Test specific functionality
npx cypress run --spec "cypress/e2e/mortgage-simple-test.cy.ts"
npx cypress run --spec "cypress/e2e/test-server-connection.cy.ts"
```

### Backend Testing (Playwright)
```bash
# Full test suite
npm run test

# Specific test categories
npm run test:integration      # API integration tests
npm run test:dropdowns       # Dropdown functionality tests
```

## 🗂️ Database Schema

### Core Tables
- `users` - Admin/staff accounts (email authentication)
- `clients` - Customer accounts (SMS authentication) 
- `banks` - Israeli banking institution data
- `locales` - Multi-language content storage
- `content_items` - Content management system
- `params` - Application configuration

### Migration System
- Sequential numbered migrations in `migrations/`
- Database-first approach for production safety
- Rollback support for critical changes

## 🔒 Security Features

### Authentication
- **SMS Verification** - Israeli phone number authentication
- **JWT Tokens** - Secure API authentication
- **Role-Based Access** - Customer vs. Admin permissions

### Data Protection
- **Input Sanitization** - XSS and injection prevention
- **CORS Configuration** - Controlled cross-origin access
- **File Upload Security** - Type and size validation
- **Environment Variables** - Secure configuration management

## 🚀 Deployment

### Environment Configuration
```bash
# Required environment variables
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-jwt-secret
NODE_ENV=production
PORT=8003

# Optional
CORS_ALLOWED_ORIGINS=https://yourdomain.com
VITE_API_TARGET=https://api.yourdomain.com
```

### Production Deployment
1. **Database Setup** - Create PostgreSQL database and run migrations
2. **Environment Variables** - Configure production environment
3. **Build Frontend** - `cd mainapp && npm run build`
4. **Start Services** - `npm start` or use PM2 for process management
5. **SSL Certificate** - Configure HTTPS for production security

## 📈 Performance Features

### Frontend Optimization
- **Code Splitting** - Lazy-loaded routes and components
- **Bundle Optimization** - Manual chunks for optimal loading
- **Cache Strategy** - Redux persistence for user data
- **Asset Optimization** - Compressed images and fonts

### Backend Optimization  
- **Database Connection Pooling** - Efficient PostgreSQL connections
- **Response Caching** - API response caching with TTL
- **File Serving** - Optimized static file delivery
- **Request Logging** - Morgan for performance monitoring

## 🛠️ Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development integration
- `feature/*` - Feature development branches

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Husky** - Git hooks for quality enforcement

### Commit Guidelines
- Follow conventional commit format
- Include tests for new features
- Update documentation for API changes
- Verify all tests pass before merging

## 🔍 Debugging

### Common Issues
```bash
# Port conflicts
npm run kill-ports:all        # Kill all development ports

# Database connectivity
node test-railway-simple.js   # Test database connection

# Translation sync
npm run sync-translations     # Sync translation files

# Cache clearing
# Frontend: Delete mainapp/node_modules/.cache
# Browser: Hard refresh (Ctrl/Cmd + Shift + R)
```

### Development Tools
- **Database Admin** - Use PostgreSQL admin tools for database inspection
- **API Testing** - Test API endpoints at http://localhost:8003/api/v1/
- **Log Analysis** - Check server logs for debugging information

## 📞 Support & Documentation

### Getting Help
- **Issues** - Create GitHub issues for bugs and feature requests
- **Documentation** - Check `/docs` directory for detailed guides
- **Code Comments** - Inline documentation in critical functions

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request with description
5. Ensure all checks pass

---

## 📋 Architecture Decision Records

### Why Standalone Architecture?
- **Simplified Deployment** - Single repository for both frontend and backend
- **Unified Development** - Consistent tooling and dependency management  
- **Reduced Complexity** - No monorepo configuration or workspace management
- **Developer Experience** - Easier onboarding and development workflow

### Technology Choices
- **React + TypeScript** - Type safety and modern React patterns
- **Node.js + Express** - JavaScript ecosystem consistency
- **PostgreSQL** - Robust relational database for financial data
- **Vite** - Fast development experience over Webpack

---

**Version**: 5.0.0 (Standalone Architecture)  
**Last Updated**: August 2025  
**License**: Private - Banking Application