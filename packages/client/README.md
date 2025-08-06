# 🌐 Bankimonline Web

**Production-Optimized React Frontend**

This repository contains the **production deployment** of the Bankimonline client application. This is automatically synchronized from the [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace) development monorepo.

## ⚠️ Development Notice

**🚨 DO NOT develop directly in this repository!**

- **Development**: Happens in [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace)
- **Deployment**: This repository is automatically updated via dual-push workflow
- **Issues**: Report bugs and feature requests in the workspace repository

## 🏗️ Architecture

This repository is part of the **Hybrid 4-Repository System**:

- 🔧 **bankimonline-workspace** - Development hub (source of truth)
- 📍 **bankimonline-web** (this repo) - Client deployment
- 🔧 **bankimonline-api** - Server deployment
- 📦 **bankimonline-shared** - Shared package

## 🚀 Deployment

### Production Deployment

**Recommended Platform**: Vercel

```bash
# Automatic deployment via Git integration
# Connects to this repository for seamless CI/CD
```

**Alternative Platforms**:
- Netlify
- AWS S3 + CloudFront
- Custom Docker deployment

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com

# Application Settings
VITE_APP_NAME=Bankimonline
VITE_APP_ENV=production

# Content Management
VITE_CONTENT_API_URL=https://your-api-domain.com/api/content
```

### Build Configuration

```bash
# Production build
npm run build

# Preview build
npm run preview

# Build with custom API URL
VITE_API_BASE_URL=https://api.bankimonline.com npm run build
```

## 📱 Application Features

### Core Banking Services

- **🏠 Mortgage Calculator** - Multi-step mortgage calculation with 10+ steps
- **💳 Credit Calculator** - Personal credit assessment and offers
- **🔄 Refinancing** - Mortgage and credit refinancing options
- **🏛️ Bank Comparison** - Compare offers from Israeli banks

### Multi-Language Support

- **🇺🇸 English** - Default language
- **🇮🇱 Hebrew** - RTL support with custom fonts
- **🇷🇺 Russian** - Full Cyrillic support
- **Dynamic Switching** - Real-time language changes

### Technical Features

- **📱 Responsive Design** - Mobile-first with desktop optimization
- **🎨 Material-UI + Tailwind** - Modern, accessible UI components
- **⚡ Vite Build System** - Optimized bundling and hot reload
- **🗄️ Database-First Content** - Dynamic content from PostgreSQL
- **🔒 JWT Authentication** - Secure user sessions

## 🛠️ Technology Stack

### Frontend Framework
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **React Router** for client-side routing

### State Management
- **Redux Toolkit** for global state
- **RTK Query** for API data fetching
- **Redux Persist** for state persistence

### UI & Styling
- **Material-UI (MUI)** for component library
- **Tailwind CSS** for utility styling
- **SCSS Modules** for component-specific styles
- **RTL Support** for Hebrew language

### Forms & Validation
- **Formik** for form management
- **Yup** for schema validation
- **Multi-language validation messages**

### Internationalization
- **i18next** for translation management
- **Database-first content system** with fallbacks
- **Dynamic font loading** for Hebrew

## 📊 Performance Optimizations

### Build Optimizations

- **Code Splitting** - Route-based lazy loading
- **Manual Chunks** - Optimized vendor bundles:
  - React vendor: 348.26 kB → 108.55 kB gzipped
  - Components vendor: 306.08 kB → 86.52 kB gzipped
  - Utils vendor: 103.32 kB → 28.72 kB gzipped

### Runtime Optimizations

- **Image Optimization** - WebP format with fallbacks
- **API Caching** - RTK Query with intelligent cache invalidation
- **Content Caching** - 5-minute TTL for database content
- **Bundle Analysis** - Comprehensive chunk optimization

## 🗄️ Content Management Integration

### Database-First Content System

The application integrates with a sophisticated content management system:

```typescript
// Content API integration
const { getContent } = useContentApi('home_page');

// Usage in components
<h1>{getContent('title', 'Default Title')}</h1>
<p>{getContent('description', 'Default description')}</p>
```

### Content Features

- **Dynamic Content** - Database-driven text and UI elements
- **Multi-Language** - Automatic translation based on user language
- **Fallback System** - Cache → Database → File → Default hierarchy
- **Real-Time Updates** - Content changes without deployment

## 🔐 Security Features

### Authentication & Authorization
- **Dual Authentication** - SMS for customers, email for staff
- **JWT Token Management** - Secure session handling
- **Protected Routes** - Role-based access control

### Data Security
- **Input Sanitization** - All form inputs validated and sanitized  
- **HTTPS Enforcement** - TLS encryption for all communications
- **CORS Configuration** - Restricted cross-origin requests
- **XSS Protection** - React's built-in XSS protection

## 📈 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals** tracking
- **Bundle size analysis**
- **API response time monitoring**
- **Error boundary logging**

### User Analytics
- **Page view tracking**
- **User journey analytics**
- **Conversion funnel analysis**
- **Multi-language usage stats**

## 🧪 Testing

### Automated Testing
- **E2E Tests** - Comprehensive user journey testing
- **Component Tests** - Individual component validation
- **API Integration Tests** - Backend integration validation

### Quality Assurance
- **Cross-browser Testing** - Chrome, Firefox, Safari, Edge
- **Mobile Testing** - iOS and Android device testing
- **Accessibility Testing** - WCAG 2.1 AA compliance
- **Performance Testing** - Load time and bundle size validation

## 📱 Mobile Support

### Responsive Design
- **Mobile-First** - Optimized for mobile devices
- **Progressive Web App** features
- **Touch-Friendly** interface design
- **Adaptive Layout** - Optimized for different screen sizes

### Device Support
- **iOS** - Safari and Chrome mobile
- **Android** - Chrome, Samsung Browser, Firefox
- **Tablets** - iPad and Android tablet optimization

## 🌍 Browser Support

### Modern Browsers
- **Chrome** 90+ (primary target)
- **Firefox** 88+ (full support)
- **Safari** 14+ (full support)
- **Edge** 90+ (full support)

### Legacy Support
- **Polyfills** for older browsers
- **Graceful degradation** for unsupported features
- **Progressive enhancement** approach

## 📦 Deployment Artifacts

### Build Output
```
dist/
├── index.html                 # Main HTML entry point
├── assets/
│   ├── *.js                   # JavaScript bundles
│   ├── *.css                  # Stylesheets
│   └── *.{png,svg,woff2}     # Static assets
└── static/                    # Public static files
```

### Production Configuration
- **Minified bundles** with source maps
- **Optimized images** and assets
- **Service worker** for caching (optional)
- **Environment-specific configuration**

---

## 🔗 Related Repositories

- **Development**: [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace)
- **API Backend**: [`bankimonline-api`](https://github.com/sravnenie-ipotek/bankimonline-api)
- **Shared Package**: [`bankimonline-shared`](https://github.com/sravnenie-ipotek/bankimonline-shared)

## 📞 Support

- **Issues**: Report in [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace/issues)
- **Documentation**: See workspace repository for full documentation
- **Deployment Help**: Check CI/CD configuration in `.github/workflows/`

---

**🚨 Remember**: This is a deployment repository. All development happens in the workspace!

**Deployment Target**: Production  
**Last Sync**: Automatic via dual-push  
**Build Status**: [![Deploy Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)