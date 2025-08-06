# 🏢 Bankimonline Workspace

**Development Monorepo for Bankimonline Application**

This is the **single development environment** where all teams collaborate on the Bankimonline banking platform. All development happens here, with automated deployment to specialized repositories.

## ⚠️ **IMPORTANT: Always Use Push/Pull Guide**

**Before making any pushes, ALWAYS consult the comprehensive developer guide:**
- 📖 **[Push and Pull Logic Guide](server/docs/pushAndPullLogic.md)** - Complete workflow instructions
- 🔄 **Dual-push commands** handle both workspace and deployment repositories
- 🛡️ **Security-first approach** with proper JWT handling
- 🧪 **Testing requirements** before deployment
- 🚨 **Emergency procedures** for rollbacks and troubleshooting

**Quick Reference:**
```bash
npm run push-client     # Push client changes
npm run push-server     # Push server changes  
npm run push-shared     # Push shared changes
npm run push-all        # Push all changes
```

## 📦 Repository Architecture

**Hybrid 4-Repository System**:
- 📍 **bankimonline-workspace** (this repo) - Development hub
- 🌐 **bankimonline-web** - Client deployment (React frontend)
- 🔧 **bankimonline-api** - Server deployment (Node.js backend)  
- 📦 **bankimonline-shared** - Shared package (types, utilities)

## 🚀 Quick Start

### Development Setup

```bash
# Clone the workspace
git clone git@github.com:sravnenie-ipotek/bankimonline-workspace.git
cd bankimonline-workspace

# Install all dependencies
npm run install:all

# Start development environment
npm run dev:all
# Server: http://localhost:8003
# Client: http://localhost:5175 (or next available port)
```

### Available Commands

```bash
# Development
npm run dev:all              # Start both client and server
npm run client:dev           # Start client only
npm run server:dev           # Start server only

# Building
npm run build:all            # Build all packages
npm run client:build         # Build client package
npm run shared:build         # Build shared package

# Testing
npm run test:all             # Run all tests
npm run client:test          # Run client tests
npm run server:test          # Run server tests

# Dual-Push Deployment
npm run push-client          # Deploy client to bankimonline-web
npm run push-server          # Deploy server to bankimonline-api
npm run push-shared          # Deploy shared to bankimonline-shared  
npm run push-all             # Deploy to all repositories
```

## 📁 Project Structure

```
bankimonline-workspace/
├── packages/
│   ├── client/              # React frontend package
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── pages/       # Route components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   │   └── useContentApi.ts  # Database-first content system
│   │   │   ├── services/    # API client layer
│   │   │   └── store/       # Redux state management
│   │   ├── cypress/         # E2E tests
│   │   └── public/          # Static assets
│   │
│   ├── server/              # Node.js backend package
│   │   ├── src/
│   │   │   ├── routes/      # Express routes
│   │   │   ├── controllers/ # Business logic
│   │   │   ├── services/    # Business services
│   │   │   └── middleware/  # Express middleware
│   │   ├── migrations/      # Database migrations
│   │   └── docs/            # API documentation
│   │
│   ├── shared/              # Shared code package
│   │   ├── src/
│   │   │   ├── types/       # TypeScript interfaces
│   │   │   ├── schemas/     # Validation schemas
│   │   │   ├── constants/   # Shared constants
│   │   │   └── utils/       # Cross-platform utilities
│   │   └── dist/            # Built artifacts
│   │
│   └── e2e/                 # Integration tests
│       ├── tests/           # End-to-end test suites
│       └── playwright.config.ts
│
├── tools/                   # Build and deployment tools
│   └── dual-push.js         # Dual-push deployment script
├── scripts/                 # Development scripts
└── .github/
    └── workflows/           # CI/CD workflows
```

## 🔄 Development Workflow

### Making Changes

1. **Develop in workspace** - All changes happen in this repository
2. **Test locally** - Use `npm run dev:all` for full-stack development
3. **Build and validate** - Run `npm run build:all` and `npm run test:all`
4. **Commit changes** - Standard git workflow in workspace
5. **📖 CONSULT PUSH GUIDE** - **ALWAYS** read [Push and Pull Logic Guide](server/docs/pushAndPullLogic.md) before pushing
6. **Deploy** - Use dual-push commands to deploy to specialized repositories

### ⚠️ **Critical Push Requirements**

**Before ANY push operation, you MUST:**
- ✅ Read the complete [Push and Pull Logic Guide](server/docs/pushAndPullLogic.md)
- ✅ Run `npm run test:all` to verify all tests pass
- ✅ Run `npm run build:all` to ensure builds succeed
- ✅ Check for security issues (no hardcoded secrets)
- ✅ Use appropriate dual-push command based on changes made

### Team Collaboration

- **Frontend Team**: Primary focus on `packages/client/`
- **Backend Team**: Primary focus on `packages/server/`
- **Fullstack Developers**: Cross-package integration and `packages/shared/`

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + PostgreSQL
- **State Management**: Redux Toolkit + RTK Query
- **UI Framework**: Material-UI + Tailwind CSS
- **Forms**: Formik + Yup validation
- **Testing**: Cypress (E2E) + Playwright (integration)
- **i18n**: Multi-language support (EN/HE/RU) with RTL

## 🗄️ Database-First Content System

The application uses a sophisticated content management system:

- **Cache → Database → File** fallback hierarchy
- **NodeCache** for server-side caching (5-minute TTL)
- **PostgreSQL** content database with translation tables
- **useContentApi** hook for React integration
- **Content API endpoints**: `/api/content/:screen/:language`

### Using Content in Components

```tsx
import { useContentApi } from '@/hooks/useContentApi';

const MyComponent = () => {
  const { getContent } = useContentApi('home_page');
  
  return (
    <div>
      <h1>{getContent('title', 'Default Title')}</h1>
      <p>{getContent('description', 'Default description...')}</p>
    </div>
  );
};
```

## 🌍 Multi-Language Support

- **Languages**: English, Hebrew, Russian
- **RTL Support**: Full right-to-left layout for Hebrew
- **Dynamic Switching**: Real-time language changes
- **Content Integration**: Database-first with translation fallbacks

## 🚦 Deployment Strategy

### Dual-Push Workflow

Each deployment updates both the workspace and the target repository:

**📖 ALWAYS consult [Push and Pull Logic Guide](server/docs/pushAndPullLogic.md) before using these commands:**

```bash
# Deploy client changes
npm run push-client
# → Pushes to workspace + bankimonline-web

# Deploy server changes  
npm run push-server
# → Pushes to workspace + bankimonline-api

# Deploy shared changes
npm run push-shared  
# → Pushes to workspace + bankimonline-shared

# Deploy all changes
npm run push-all
# → Pushes to workspace + all deployment repositories
```

### Deployment Targets

- **Client**: Vercel (recommended) or Netlify
- **Server**: Railway (current) or Heroku
- **Shared**: GitHub Packages (NPM registry)

## 📊 Monitoring and Observability

- **Server Logs**: Morgan HTTP request logging
- **Error Tracking**: Comprehensive error boundaries
- **Performance**: Vite build optimization with code splitting
- **Database**: Connection pooling and query optimization

## 🔐 Security Features

- **Authentication**: Dual-mode (SMS for customers, email for staff)
- **CORS**: Configured for multiple development and production origins
- **Input Validation**: Yup schemas with multi-language error messages
- **Database Security**: Parameterized queries and connection pooling

## 🤝 Contributing

### Development Guidelines

1. **Follow existing patterns** - Check similar components and follow conventions
2. **Use shared types** - Import from `@bankimonline/shared` when possible
3. **Test your changes** - Run E2E tests before pushing
4. **Update documentation** - Keep README and docs current
5. **Use content system** - Prefer `useContentApi` over hardcoded text

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and Node.js
- **Prettier**: Automated code formatting
- **Conventional Commits**: Use conventional commit messages

## 📞 Support

- **Documentation**: Check `packages/server/docs/` for API documentation
- **Issues**: GitHub Issues in workspace repository
- **Architecture**: See `server/docs/repositoriesLogic.md` for system design

## 📈 Performance Metrics

**Build Targets**:
- Client bundle: <2MB total, <500KB initial
- Server startup: <5 seconds
- API response: <200ms average
- Content cache hit rate: >80%

**Development Environment**:
- Hot reload: <200ms
- Full build: <30 seconds
- Test suite: <2 minutes

## 🚨 **CRITICAL REMINDER**

**Before ANY push operation, you MUST read the complete guide:**
📖 **[Push and Pull Logic Guide](server/docs/pushAndPullLogic.md)**

This guide contains:
- ✅ Step-by-step push/pull workflows
- ✅ Security requirements and JWT handling
- ✅ Testing and validation procedures
- ✅ Troubleshooting and emergency procedures
- ✅ Team collaboration patterns
- ✅ Branch management strategies

**Failure to follow the guide may result in:**
- 🔒 Security vulnerabilities
- 🚫 Deployment failures
- 🔄 Repository synchronization issues
- 🧪 Broken test suites

---

**Architecture Version**: 1.0  
**Team Size**: 10 developers  
**Last Updated**: 2025-08-06