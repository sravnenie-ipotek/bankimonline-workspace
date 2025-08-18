# 🗺️ Technical Map - Bankim Online Banking Platform

## 📋 Overview
This technical map provides a comprehensive overview of the Bankim Online Banking Platform architecture, automation tools, and system components.

---

## 🏗️ Architecture Overview

### System Architecture
| **Component** | **Technology Stack** | **Purpose** | **Status** | **Documentation Link** |
|---------------|---------------------|-------------|------------|------------------------|
| **Frontend** | React + TypeScript + Vite | Main user interface | ✅ Production | [Frontend Architecture](./frontend-architecture) |
| **Backend API** | Node.js + Express | REST API services | ✅ Production | [API Documentation](./api-docs) |
| **Database** | PostgreSQL | Primary data storage | ✅ Production | [Database Schema](./database-schema) |
| **Authentication** | JWT + bcrypt | User authentication | ✅ Production | [Auth System](./auth-system) |
| **File Storage** | Local + Cloud | Static assets & uploads | ✅ Production | [File Management](./file-management) |

### Deployment Architecture
| **Environment** | **Platform** | **URL** | **Purpose** | **Status** |
|-----------------|--------------|---------|-------------|------------|
| **Development** | Local + Railway | `https://dev2.bankimonline.com` | Development & Testing | ✅ Active |
| **Staging** | Railway | `https://staging.bankimonline.com` | Pre-production testing | 🔄 Setup |
| **Production** | Railway | `https://bankimonline.com` | Live application | ✅ Active |

---

## 🤖 Automation Tools & CI/CD

### Testing Automation
| **Tool** | **Purpose** | **Coverage** | **Status** | **Configuration** |
|----------|-------------|--------------|------------|-------------------|
| **Playwright** | E2E Testing | Credit/Mortgage calculators | ✅ Active | [Test Config](./playwright-config) |
| **Cypress** | Component Testing | UI components | ✅ Active | [Cypress Setup](./cypress-setup) |
| **Jest** | Unit Testing | Business logic | 🔄 Setup | [Jest Config](./jest-config) |
| **BrowserStack** | Cross-browser Testing | Multi-browser validation | ✅ Active | [BrowserStack Config](./browserstack) |

### CI/CD Pipeline
| **Stage** | **Tool** | **Purpose** | **Status** | **Configuration** |
|-----------|----------|-------------|------------|-------------------|
| **Code Quality** | ESLint + Prettier | Code formatting & linting | ✅ Active | [Lint Config](./lint-config) |
| **Testing** | GitHub Actions | Automated test execution | ✅ Active | [GitHub Actions](./github-actions) |
| **Deployment** | Railway | Automated deployment | ✅ Active | [Railway Config](./railway-config) |
| **Monitoring** | Custom scripts | Health checks & alerts | ✅ Active | [Monitoring](./monitoring) |

### Quality Assurance
| **Tool** | **Purpose** | **Coverage** | **Status** | **Reports** |
|----------|-------------|--------------|------------|-------------|
| **Automated QA** | Playwright scripts | Critical user flows | ✅ Active | [QA Reports](./qa-reports) |
| **Performance Testing** | Custom benchmarks | API response times | ✅ Active | [Performance](./performance) |
| **Accessibility** | axe-core | WCAG compliance | 🔄 Setup | [A11y Testing](./accessibility) |
| **Security Scanning** | npm audit | Dependency vulnerabilities | ✅ Active | [Security](./security) |

---

## 💰 Banking Features & Logic

### Calculator Systems
| **Calculator** | **Purpose** | **Steps** | **Status** | **Documentation** |
|----------------|-------------|-----------|------------|-------------------|
| **Credit Calculator** | Personal loan calculations | 4 steps | ✅ Production | [Credit Logic](./credit-calculator) |
| **Mortgage Calculator** | Home loan calculations | 4 steps | ✅ Production | [Mortgage Logic](./mortgage-calculator) |
| **Refinance Calculator** | Loan refinancing | 3 steps | ✅ Production | [Refinance Logic](./refinance-calculator) |

### Business Logic Components
| **Component** | **Purpose** | **Technology** | **Status** | **Logic Documentation** |
|---------------|-------------|----------------|------------|-------------------------|
| **LTV Calculator** | Loan-to-Value calculations | Custom algorithm | ✅ Active | [LTV Logic](./ltv-calculations) |
| **Interest Calculator** | Interest rate computations | Financial formulas | ✅ Active | [Interest Logic](./interest-calculations) |
| **Payment Scheduler** | Payment plan generation | Date calculations | ✅ Active | [Payment Logic](./payment-scheduler) |
| **Risk Assessment** | Credit risk evaluation | Scoring algorithm | 🔄 Development | [Risk Logic](./risk-assessment) |

### Data Management
| **System** | **Purpose** | **Technology** | **Status** | **Schema** |
|------------|-------------|----------------|------------|------------|
| **Content Management** | Multi-language content | PostgreSQL + i18n | ✅ Active | [Content Schema](./content-schema) |
| **User Management** | User profiles & sessions | JWT + bcrypt | ✅ Active | [User Schema](./user-schema) |
| **Calculation History** | User calculation logs | PostgreSQL | ✅ Active | [History Schema](./history-schema) |
| **Analytics** | Usage statistics | Custom tracking | 🔄 Setup | [Analytics Schema](./analytics) |

---

## 🌐 Internationalization & Localization

### Language Support
| **Language** | **Code** | **Status** | **Coverage** | **Translation Files** |
|--------------|----------|------------|--------------|----------------------|
| **English** | `en` | ✅ Complete | 100% | [English Translations](./translations/en) |
| **Hebrew** | `he` | ✅ Complete | 100% | [Hebrew Translations](./translations/he) |
| **Russian** | `ru` | ✅ Complete | 100% | [Russian Translations](./translations/ru) |

### i18n Implementation
| **Component** | **Technology** | **Purpose** | **Status** | **Configuration** |
|---------------|----------------|-------------|------------|-------------------|
| **Frontend i18n** | react-i18next | UI translations | ✅ Active | [Frontend i18n](./frontend-i18n) |
| **Backend i18n** | Custom middleware | API responses | ✅ Active | [Backend i18n](./backend-i18n) |
| **Content i18n** | Database-driven | Dynamic content | ✅ Active | [Content i18n](./content-i18n) |
| **Email i18n** | Template system | Email notifications | 🔄 Setup | [Email i18n](./email-i18n) |

---

## 🔧 Development Tools & Utilities

### Development Environment
| **Tool** | **Purpose** | **Version** | **Status** | **Configuration** |
|----------|-------------|-------------|------------|-------------------|
| **Node.js** | Runtime environment | 18.x+ | ✅ Active | [Node Config](./node-config) |
| **npm/yarn** | Package management | Latest | ✅ Active | [Package Config](./package-config) |
| **Git** | Version control | Latest | ✅ Active | [Git Workflow](./git-workflow) |
| **Docker** | Containerization | Latest | 🔄 Setup | [Docker Config](./docker-config) |

### Code Quality Tools
| **Tool** | **Purpose** | **Configuration** | **Status** | **Reports** |
|----------|-------------|-------------------|------------|-------------|
| **ESLint** | Code linting | [.eslintrc](./eslint-config) | ✅ Active | [Lint Reports](./lint-reports) |
| **Prettier** | Code formatting | [.prettierrc](./prettier-config) | ✅ Active | [Format Reports](./format-reports) |
| **TypeScript** | Type checking | [tsconfig.json](./typescript-config) | ✅ Active | [Type Reports](./type-reports) |
| **Husky** | Git hooks | [.huskyrc](./husky-config) | ✅ Active | [Hook Reports](./hook-reports) |

### Monitoring & Logging
| **Tool** | **Purpose** | **Configuration** | **Status** | **Dashboard** |
|----------|-------------|-------------------|------------|---------------|
| **Custom Logging** | Application logs | [Logging Config](./logging-config) | ✅ Active | [Log Dashboard](./log-dashboard) |
| **Error Tracking** | Error monitoring | [Error Config](./error-config) | ✅ Active | [Error Dashboard](./error-dashboard) |
| **Performance Monitoring** | Response times | [Performance Config](./performance-config) | ✅ Active | [Performance Dashboard](./performance-dashboard) |
| **Health Checks** | System status | [Health Config](./health-config) | ✅ Active | [Health Dashboard](./health-dashboard) |

---

## 📊 Database & Data Management

### Database Architecture
| **Database** | **Purpose** | **Tables** | **Status** | **Schema** |
|--------------|-------------|------------|------------|------------|
| **bankim_core** | Core application data | 15+ tables | ✅ Active | [Core Schema](./core-schema) |
| **bankim_content** | Content & translations | 10+ tables | ✅ Active | [Content Schema](./content-schema) |
| **bankim_analytics** | Analytics & tracking | 5+ tables | 🔄 Setup | [Analytics Schema](./analytics-schema) |

### Migration System
| **Migration** | **Purpose** | **Status** | **Date** | **Documentation** |
|---------------|-------------|------------|----------|-------------------|
| **Content Migration** | Multi-language content | ✅ Complete | 2025-08 | [Migration Docs](./content-migration) |
| **Schema Updates** | Database structure | ✅ Active | Ongoing | [Schema Updates](./schema-updates) |
| **Data Backups** | Backup automation | ✅ Active | Daily | [Backup System](./backup-system) |

---

## 🔒 Security & Compliance

### Security Measures
| **Security Layer** | **Technology** | **Purpose** | **Status** | **Configuration** |
|-------------------|----------------|-------------|------------|-------------------|
| **Authentication** | JWT + bcrypt | User authentication | ✅ Active | [Auth Config](./auth-config) |
| **Authorization** | Role-based access | User permissions | ✅ Active | [RBAC Config](./rbac-config) |
| **Input Validation** | Joi + sanitization | Data validation | ✅ Active | [Validation Config](./validation-config) |
| **HTTPS** | SSL/TLS | Secure communication | ✅ Active | [SSL Config](./ssl-config) |

### Compliance Features
| **Compliance** | **Requirement** | **Implementation** | **Status** | **Documentation** |
|----------------|-----------------|-------------------|------------|-------------------|
| **GDPR** | Data protection | Privacy controls | ✅ Active | [GDPR Compliance](./gdpr) |
| **Banking Regulations** | Financial compliance | Audit trails | 🔄 Development | [Banking Compliance](./banking-compliance) |
| **Accessibility** | WCAG 2.1 | Screen reader support | 🔄 Setup | [Accessibility Compliance](./accessibility-compliance) |

---

## 📱 Frontend Architecture

### Component Structure
| **Component Type** | **Location** | **Purpose** | **Status** | **Documentation** |
|-------------------|--------------|-------------|------------|-------------------|
| **Pages** | `src/pages/` | Main page components | ✅ Active | [Pages Docs](./pages-docs) |
| **Components** | `src/components/` | Reusable UI components | ✅ Active | [Components Docs](./components-docs) |
| **Hooks** | `src/hooks/` | Custom React hooks | ✅ Active | [Hooks Docs](./hooks-docs) |
| **Services** | `src/services/` | API integration | ✅ Active | [Services Docs](./services-docs) |

### State Management
| **Store** | **Technology** | **Purpose** | **Status** | **Configuration** |
|-----------|----------------|-------------|------------|-------------------|
| **Global State** | React Context | App-wide state | ✅ Active | [Context Config](./context-config) |
| **Local State** | React useState | Component state | ✅ Active | [State Management](./state-management) |
| **Form State** | React Hook Form | Form handling | ✅ Active | [Form Config](./form-config) |

---

## 🔌 API Architecture

### Endpoint Structure
| **Endpoint Group** | **Base Path** | **Purpose** | **Status** | **Documentation** |
|-------------------|---------------|-------------|------------|-------------------|
| **Calculation APIs** | `/api/v1/calculation-*` | Calculator endpoints | ✅ Active | [Calculation APIs](./calculation-apis) |
| **Content APIs** | `/api/v1/content` | Content management | ✅ Active | [Content APIs](./content-apis) |
| **User APIs** | `/api/v1/user` | User management | ✅ Active | [User APIs](./user-apis) |
| **Analytics APIs** | `/api/v1/analytics` | Usage tracking | 🔄 Development | [Analytics APIs](./analytics-apis) |

### API Features
| **Feature** | **Implementation** | **Purpose** | **Status** | **Configuration** |
|-------------|-------------------|-------------|------------|-------------------|
| **Rate Limiting** | Express rate-limit | API protection | ✅ Active | [Rate Limit Config](./rate-limit) |
| **Caching** | NodeCache | Performance optimization | ✅ Active | [Cache Config](./cache-config) |
| **Validation** | Joi schemas | Input validation | ✅ Active | [Validation Schemas](./validation-schemas) |
| **Error Handling** | Custom middleware | Error responses | ✅ Active | [Error Handling](./error-handling) |

---

## 📈 Performance & Optimization

### Performance Metrics
| **Metric** | **Current Value** | **Target** | **Status** | **Monitoring** |
|------------|------------------|------------|------------|----------------|
| **API Response Time** | <1ms (cached) | <100ms | ✅ Excellent | [Performance Monitoring](./performance-monitoring) |
| **Page Load Time** | <2s | <3s | ✅ Good | [Page Speed](./page-speed) |
| **Database Queries** | <50ms | <100ms | ✅ Good | [Query Performance](./query-performance) |
| **Cache Hit Rate** | 95%+ | 90%+ | ✅ Excellent | [Cache Performance](./cache-performance) |

### Optimization Strategies
| **Strategy** | **Implementation** | **Impact** | **Status** | **Documentation** |
|--------------|-------------------|------------|------------|-------------------|
| **Application Caching** | NodeCache | 1505x improvement | ✅ Active | [Caching Strategy](./caching-strategy) |
| **Database Indexing** | PostgreSQL indexes | Query optimization | ✅ Active | [Index Strategy](./index-strategy) |
| **Code Splitting** | Dynamic imports | Bundle optimization | ✅ Active | [Bundle Strategy](./bundle-strategy) |
| **Image Optimization** | WebP + compression | Asset optimization | ✅ Active | [Asset Strategy](./asset-strategy) |

---

## 🚀 Deployment & DevOps

### Deployment Strategy
| **Environment** | **Deployment Method** | **Automation** | **Status** | **Configuration** |
|-----------------|----------------------|----------------|------------|-------------------|
| **Development** | Railway auto-deploy | GitHub integration | ✅ Active | [Dev Deployment](./dev-deployment) |
| **Staging** | Railway manual | Pull request triggers | 🔄 Setup | [Staging Deployment](./staging-deployment) |
| **Production** | Railway auto-deploy | Main branch triggers | ✅ Active | [Prod Deployment](./prod-deployment) |

### Infrastructure
| **Service** | **Provider** | **Purpose** | **Status** | **Configuration** |
|-------------|--------------|-------------|------------|-------------------|
| **Hosting** | Railway | Application hosting | ✅ Active | [Railway Config](./railway-config) |
| **Database** | Railway PostgreSQL | Data storage | ✅ Active | [Database Config](./database-config) |
| **File Storage** | Railway + Local | Asset storage | ✅ Active | [Storage Config](./storage-config) |
| **CDN** | Railway | Content delivery | 🔄 Setup | [CDN Config](./cdn-config) |

---

## 📚 Documentation & Knowledge Base

### Documentation Structure
| **Documentation Type** | **Location** | **Purpose** | **Status** | **Last Updated** |
|------------------------|--------------|-------------|------------|------------------|
| **API Documentation** | `/docs/api/` | API reference | ✅ Active | 2025-08-17 |
| **Architecture Docs** | `/docs/architecture/` | System design | ✅ Active | 2025-08-17 |
| **Development Guide** | `/docs/development/` | Developer onboarding | ✅ Active | 2025-08-17 |
| **Deployment Guide** | `/docs/deployment/` | Deployment procedures | ✅ Active | 2025-08-17 |

### Knowledge Management
| **Resource** | **Purpose** | **Access** | **Status** | **Maintenance** |
|--------------|-------------|------------|------------|----------------|
| **Confluence Pages** | Project documentation | Team access | ✅ Active | Weekly |
| **GitHub Wiki** | Technical documentation | Public access | ✅ Active | As needed |
| **Code Comments** | Inline documentation | Developer access | ✅ Active | With code changes |
| **README Files** | Quick start guides | Public access | ✅ Active | With updates |

---

## 🔄 Maintenance & Support

### Regular Maintenance
| **Task** | **Frequency** | **Purpose** | **Status** | **Automation** |
|----------|---------------|-------------|------------|----------------|
| **Database Backups** | Daily | Data protection | ✅ Active | Automated |
| **Security Updates** | Weekly | Vulnerability patches | ✅ Active | Semi-automated |
| **Performance Monitoring** | Continuous | System health | ✅ Active | Automated |
| **Content Updates** | As needed | Content management | ✅ Active | Manual |

### Support Systems
| **System** | **Purpose** | **Technology** | **Status** | **Configuration** |
|------------|-------------|----------------|------------|-------------------|
| **Error Tracking** | Bug monitoring | Custom logging | ✅ Active | [Error Config](./error-config) |
| **Health Checks** | System monitoring | Custom scripts | ✅ Active | [Health Config](./health-config) |
| **Backup System** | Data protection | Automated scripts | ✅ Active | [Backup Config](./backup-config) |
| **Recovery System** | Disaster recovery | Manual procedures | 🔄 Setup | [Recovery Procedures](./recovery) |

---

## 📋 Legend

### Status Indicators
- ✅ **Active/Complete** - Fully implemented and operational
- 🔄 **Setup/Development** - In progress or being set up
- ⚠️ **Maintenance** - Requires attention or updates
- ❌ **Deprecated** - No longer in use

### Priority Levels
- 🔴 **Critical** - System-breaking issues
- 🟡 **High** - Important features or fixes
- 🟢 **Medium** - Nice-to-have improvements
- 🔵 **Low** - Minor enhancements

---

*Last Updated: 2025-08-17*
*Maintained by: Development Team*
*Version: 1.0*
