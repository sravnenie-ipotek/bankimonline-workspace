# BankIM Online - Client Repository

## Overview
This repository contains the React client-side code for the BankIM Online application. It provides the user interface and communicates with the Node.js server API.

## Remote Server Hierarchy

### SSH Server Structure
```
/var/www/bankim/
├── bankimonlineapi/          # Server repository
│   ├── mainapp/             # Server application
│   │   ├── server-db.js     # Server entry point
│   │   └── package.json     # Server dependencies
│   └── .git/                # Git repository
└── client/                  # Client repository (this repo)
    ├── mainapp/             # React application
    │   ├── src/             # React source code
    │   │   ├── components/  # React components
    │   │   ├── pages/       # Page components
    │   │   ├── services/    # API services
    │   │   ├── store/       # Redux store
    │   │   ├── utils/       # Utility functions
    │   │   └── index.tsx    # App entry point
    │   ├── public/          # Static assets
    │   ├── package.json     # Client dependencies
    │   ├── vite.config.ts   # Vite configuration
    │   ├── .env             # Development environment
    │   └── index.html       # HTML template
    └── .git/                # Git repository
```

## Environment Configuration

### Development Environment (.env)
```env
VITE_API_BASE_URL=http://localhost:8003/api/v1
VITE_NODE_API_BASE_URL=http://localhost:8003/api
VITE_ACCOUNT_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```

### Production Environment (.env.production)
```env
VITE_API_BASE_URL=http://your-server-ip:8003/api/v1
VITE_NODE_API_BASE_URL=http://your-server-ip:8003/api
VITE_ACCOUNT_URL=http://your-server-ip:3000
VITE_ENVIRONMENT=production
```

## Build and Deployment Process

### 1. Client Setup
```bash
# SSH into server
ssh root@your-server-ip

# Navigate to client directory
cd /var/www/bankim/client

# Pull latest changes
git pull origin main

# Navigate to mainapp
cd mainapp

# Install dependencies
npm install
```

### 2. Development Mode
```bash
# Start development server
npm run dev

# Or with PM2
pm2 start npm --name "bankim-client" -- run dev
```

### 3. Production Build
```bash
# Build for production
npm run build

# Serve built files
npm install -g serve
pm2 start serve --name "bankim-client" -- -s dist -l 3000
```

## File Locations and Purposes

### Core Client Files
- `mainapp/src/index.tsx` - React application entry point
- `mainapp/src/App.tsx` - Main App component
- `mainapp/package.json` - Client dependencies and scripts
- `mainapp/vite.config.ts` - Vite build configuration
- `mainapp/index.html` - HTML template

### Source Code Structure
```
mainapp/src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components
│   ├── ui/            # UI components
│   └── shared/        # Shared components
├── pages/             # Page components
│   ├── Home/          # Home page
│   ├── Services/      # Services pages
│   ├── PersonalCabinet/ # User dashboard
│   └── AuthModal/     # Authentication
├── services/          # API services
│   ├── api.ts         # Base API configuration
│   ├── auth/          # Authentication services
│   └── calculationService.ts # Calculation services
├── store/             # Redux store
│   ├── index.ts       # Store configuration
│   └── slices/        # Redux slices
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── assets/            # Static assets
```

### Build Output
- `mainapp/dist/` - Production build output
- `mainapp/build/` - Development build output

## Development Workflow

### Local Development
```bash
# Clone repository
git clone git@github.com:MichaelMishaev/bankDev2_standalone.git
cd bankDev2_standalone/mainapp

# Install dependencies
npm install

# Start development server
npm run dev
```

### Remote Development
```bash
# SSH into server
ssh root@your-server-ip

# Navigate to client
cd /var/www/bankim/client/mainapp

# Start development
npm run dev
```

## Build Scripts

### Available Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx",
  "test": "jest",
  "cypress": "cypress open"
}
```

### Build Process
1. **Development:** `npm run dev` - Starts Vite dev server
2. **Production:** `npm run build` - Creates optimized build
3. **Preview:** `npm run preview` - Serves production build locally

## PM2 Configuration

### Development Mode
```bash
pm2 start npm --name "bankim-client" -- run dev
```

### Production Mode
```bash
# Build first
npm run build

# Serve with PM2
pm2 start serve --name "bankim-client" -- -s dist -l 3000
```

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs bankim-client

# Restart client
pm2 restart bankim-client

# Monitor resources
pm2 monit
```

## API Integration

### Base Configuration
- **Development API:** `http://localhost:8003`
- **Production API:** `http://your-server-ip:8003`

### API Services
- `services/api.ts` - Base API configuration
- `services/auth/` - Authentication services
- `services/calculationService.ts` - Calculation services

### Environment Variables
- `VITE_API_BASE_URL` - API base URL
- `VITE_NODE_API_BASE_URL` - Node API base URL
- `VITE_ACCOUNT_URL` - Account service URL
- `VITE_ENVIRONMENT` - Environment (development/production)

## Testing

### Unit Tests
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### E2E Tests (Cypress)
```bash
npm run cypress
npm run cypress:run
npm run test:e2e
```

### Translation Tests
```bash
npm run test:translations
npm run test:translations:full
```

## Internationalization (i18n)

### Supported Languages
- Hebrew (he)
- English (en)
- Russian (ru)

### Translation Files
- `src/config/i18n.ts` - i18n configuration
- `locales/` - Translation files
- `src/utils/i18n/` - i18n utilities

## Styling and UI

### CSS Framework
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS Modules** - Component-scoped styles
- **Material-UI** - React UI components

### Configuration Files
- `tailwind.config.ts` - Tailwind configuration
- `postcss.config.ts` - PostCSS configuration
- `vite.config.ts` - Vite configuration

## Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port
   netstat -tulpn | grep 5173
   # Kill process or change port in vite.config.ts
   ```

3. **PM2 Process Not Starting**
   ```bash
   # Check logs
   pm2 logs bankim-client
   # Restart process
   pm2 restart bankim-client
   ```

4. **API Connection Issues**
   - Verify server is running: `pm2 status`
   - Check API URL in `.env` files
   - Verify network connectivity

### Development Tips

1. **Hot Reload Issues**
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

3. **Dependency Issues**
   ```bash
   # Update dependencies
   npm update
   # Or reinstall
   npm ci
   ```

## Performance Optimization

### Build Optimization
- Code splitting with Vite
- Tree shaking for unused code
- Image optimization
- CSS minification

### Runtime Optimization
- React.memo for component memoization
- Lazy loading for routes
- Bundle analysis with `npm run build -- --analyze`

## Security Considerations

### Environment Variables
- Never commit sensitive data to repository
- Use `.env` files for local development
- Use `.env.production` for production

### Content Security Policy
- Configure CSP headers
- Sanitize user inputs
- Validate API responses

## Deployment Checklist

### Pre-deployment
- [ ] Run tests: `npm run test`
- [ ] Build application: `npm run build`
- [ ] Check build output: `npm run preview`
- [ ] Update environment variables
- [ ] Verify API connectivity

### Deployment
- [ ] Pull latest changes: `git pull origin main`
- [ ] Install dependencies: `npm install`
- [ ] Build application: `npm run build`
- [ ] Start with PM2: `pm2 start serve --name "bankim-client" -- -s dist -l 3000`
- [ ] Verify deployment: `pm2 status`

### Post-deployment
- [ ] Test application functionality
- [ ] Check error logs: `pm2 logs bankim-client`
- [ ] Monitor performance: `pm2 monit`
- [ ] Save PM2 configuration: `pm2 save`

## Repository Management

### Git Workflow
```bash
# Pull latest changes
git pull origin main

# Check status
git status

# View recent commits
git log --oneline -10
```

### Branch Strategy
- `main` - Production-ready code
- `client-only` - Client-specific features
- Feature branches for development

## Contact and Support
- **Repository:** `bankDev2_standalone`
- **Server Location:** SSH server at `/var/www/bankim/client`
- **PM2 Process:** `bankim-client`
- **Development Port:** 5173
- **Production Port:** 3000 