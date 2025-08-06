# 📦 Bankimonline Shared

**Cross-Platform Shared Package**

This repository contains the **shared types, utilities, and constants** used across the Bankimonline application ecosystem. This is automatically synchronized from the [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace) development monorepo.

## ⚠️ Development Notice

**🚨 DO NOT develop directly in this repository!**

- **Development**: Happens in [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace)
- **Deployment**: This repository is automatically updated via dual-push workflow
- **Issues**: Report bugs and feature requests in the workspace repository

## 🏗️ Architecture

This repository is part of the **Hybrid 4-Repository System**:

- 🔧 **bankimonline-workspace** - Development hub (source of truth)
- 🌐 **bankimonline-web** - Client deployment
- 🔧 **bankimonline-api** - Server deployment  
- 📍 **bankimonline-shared** (this repo) - Shared package

## 📦 Package Contents

### Core Shared Components

- **🔷 TypeScript Interfaces** - API contracts and data models
- **🛠️ Utility Functions** - Cross-platform helper functions
- **📋 Validation Schemas** - Yup schemas for form validation
- **🌐 Translation Management** - Multi-language content system
- **⚙️ Constants** - Banking logic, routes, and configuration
- **🎨 Design Tokens** - UI constants and theme definitions

## 📁 Package Structure

```
src/
├── types/                   # TypeScript type definitions
│   ├── api.ts              # API request/response interfaces
│   ├── content.ts          # Content management types
│   ├── banking.ts          # Banking domain types
│   ├── user.ts             # User and authentication types
│   └── common.ts           # Common utility types
│
├── schemas/                # Validation schemas
│   ├── mortgage.ts         # Mortgage form validation
│   ├── credit.ts           # Credit form validation
│   ├── auth.ts             # Authentication validation
│   └── profile.ts          # User profile validation
│
├── constants/              # Application constants
│   ├── banking.ts          # Banking business rules
│   ├── routes.ts           # API and frontend routes
│   ├── validation.ts       # Validation constants
│   └── ui.ts               # UI constants and themes
│
├── utils/                  # Utility functions
│   ├── format.ts           # Number/date formatting
│   ├── validation.ts       # Custom validation helpers
│   ├── currency.ts         # Currency conversion utilities
│   ├── hebrew.ts           # Hebrew/RTL text utilities
│   └── api.ts              # API helper functions
│
├── locales/               # Translation files
│   ├── en/                # English translations
│   ├── he/                # Hebrew translations (RTL)
│   └── ru/                # Russian translations
│
└── hooks/                 # Shared React hooks (client-side)
    ├── useContentApi.ts   # Database-first content system
    ├── useValidation.ts   # Form validation hooks
    └── useFormatting.ts   # Number/currency formatting
```

## 🔷 TypeScript Interfaces

### API Contracts

```typescript
// User authentication
export interface LoginRequest {
  phone: string;
  verificationCode: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
  expiresAt: string;
}

// Banking services
export interface MortgageCalculationRequest {
  propertyValue: number;
  downPayment: number;
  loanTerm: number;
  interestRate?: number;
}

export interface BankOffer {
  bankId: string;
  bankName: string;
  interestRate: number;
  maxLoanAmount: number;
  terms: LoanTerms;
}
```

### Content Management Types

```typescript
// Database-first content system
export interface ContentItem {
  content_key: string;
  component_type: 'text' | 'button' | 'dropdown_option' | 'placeholder';
  category: string;
  screen_location: string;
  status: 'active' | 'inactive';
}

export interface ContentTranslation {
  content_item_id: number;
  language_code: 'en' | 'he' | 'ru';
  content_value: string;
  status: 'approved' | 'pending' | 'draft';
}
```

## 🛠️ Utility Functions

### Currency & Formatting

```typescript
import { formatCurrency, formatPercentage } from '@bankimonline/shared/utils/format';

// Usage examples
const amount = formatCurrency(250000, 'ILS'); // "₪250,000"
const rate = formatPercentage(0.045); // "4.5%"
```

### Hebrew & RTL Support

```typescript
import { isHebrewText, formatHebrewNumber } from '@bankimonline/shared/utils/hebrew';

// RTL text detection and formatting
const isRTL = isHebrewText(text);
const hebrewNumber = formatHebrewNumber(12345); // "12,345" with RTL formatting
```

### Validation Utilities

```typescript
import { validateIsraeliPhone, validateIsraeliID } from '@bankimonline/shared/utils/validation';

// Israeli-specific validation
const isValidPhone = validateIsraeliPhone('0501234567'); // true
const isValidID = validateIsraeliID('123456789'); // validates checksum
```

## 📋 Validation Schemas

### Mortgage Form Validation

```typescript
import { mortgageCalculationSchema } from '@bankimonline/shared/schemas/mortgage';

// Yup schema for mortgage forms
const validationSchema = mortgageCalculationSchema;

// Usage with Formik
<Formik
  initialValues={initialValues}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
>
  {/* Form components */}
</Formik>
```

### Multi-Language Error Messages

```typescript
// Validation schemas include multi-language error messages
export const phoneValidation = yup
  .string()
  .required(t('error_phone_required'))
  .matches(/^05\d{8}$/, t('error_phone_format'));
```

## 🌐 Translation System

### Multi-Language Content

The shared package manages translations for all supported languages:

- **English (en)** - Primary language
- **Hebrew (he)** - Right-to-left support  
- **Russian (ru)** - Cyrillic character support

### Translation File Structure

```javascript
// locales/en/common.json
{
  "buttons": {
    "continue": "Continue",
    "back": "Back",
    "calculate": "Calculate",
    "submit": "Submit"
  },
  "validation": {
    "required": "This field is required",
    "invalid_email": "Please enter a valid email",
    "invalid_phone": "Please enter a valid Israeli phone number"
  }
}

// locales/he/common.json (RTL)
{
  "buttons": {
    "continue": "המשך",
    "back": "חזור",
    "calculate": "חשב",
    "submit": "שלח"
  }
}
```

## ⚙️ Constants & Configuration

### Banking Business Rules

```typescript
// constants/banking.ts
export const BANKING_RULES = {
  PROPERTY_OWNERSHIP: {
    NO_PROPERTY: {
      max_ltv: 0.75,
      min_down_payment: 0.25
    },
    HAS_PROPERTY: {
      max_ltv: 0.50,
      min_down_payment: 0.50
    },
    SELLING_PROPERTY: {
      max_ltv: 0.70,
      min_down_payment: 0.30
    }
  },
  LOAN_TERMS: {
    MIN_YEARS: 4,
    MAX_YEARS: 30,
    DEFAULT_RATE: 0.05 // 5%
  }
};
```

### API Route Constants

```typescript
// constants/routes.ts
export const API_ROUTES = {
  AUTH: {
    SMS_LOGIN: '/api/sms-login',
    VERIFY_CODE: '/api/sms-code-login',
    REFRESH_TOKEN: '/api/refresh-token'
  },
  BANKING: {
    COMPARE_BANKS: '/api/customer/compare-banks',
    MORTGAGE_PROGRAMS: '/api/customer/mortgage-programs',
    SUBMIT_APPLICATION: '/api/customer/submit-application'
  },
  CONTENT: {
    GET_CONTENT: '/api/content/:screen/:language',
    CACHE_STATS: '/api/content/cache/stats'
  }
} as const;
```

## 🎨 Design System Integration

### UI Constants

```typescript
// constants/ui.ts
export const THEME = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    error: '#d32f2f',
    warning: '#ed6c02',
    info: '#0288d1'
  },
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536
  },
  spacing: {
    unit: 8, // Material-UI spacing unit
    section: 24,
    component: 16
  }
} as const;
```

### Component Props

```typescript
// types/common.ts
export interface BaseComponentProps {
  className?: string;
  testId?: string;
  ariaLabel?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface LanguageSupport {
  language: 'en' | 'he' | 'ru';
  direction: 'ltr' | 'rtl';
}
```

## 🔧 Installation & Usage

### NPM Installation

```bash
# Install as dependency
npm install @bankimonline/shared

# Or as dev dependency for types only
npm install -D @bankimonline/shared
```

### TypeScript Usage

```typescript
// Import types
import type { MortgageCalculationRequest, BankOffer } from '@bankimonline/shared/types/banking';

// Import utilities
import { formatCurrency, validateIsraeliPhone } from '@bankimonline/shared/utils';

// Import constants
import { BANKING_RULES, API_ROUTES } from '@bankimonline/shared/constants';

// Import validation schemas
import { mortgageSchema } from '@bankimonline/shared/schemas';
```

### React Integration

```typescript
// Import React hooks
import { useContentApi } from '@bankimonline/shared/hooks';

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

## 📊 Package Dependencies

### Runtime Dependencies

```json
{
  "yup": "^1.0.0",
  "i18next": "^22.0.0",
  "date-fns": "^2.29.0"
}
```

### Peer Dependencies

```json
{
  "react": "^18.0.0",
  "typescript": "^4.9.0"
}
```

## 🔄 Content Management Integration

### Database-First Content System

The shared package provides the interface for the database-first content system:

```typescript
// Integration with content API
export interface ContentApiResponse {
  status: 'success' | 'error';
  screen_location: string;
  language_code: string;
  content_count: number;
  content: Record<string, ContentValue>;
}

export interface ContentValue {
  value: string;
  component_type: string;
  category: string;
}
```

### Fallback Hierarchy

1. **Cache** - NodeCache (5-minute TTL)
2. **Database** - PostgreSQL content tables
3. **File System** - Static translation files
4. **Default Values** - Hardcoded fallbacks in components

## 🛡️ Security Features

### Input Validation

```typescript
// Sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Phone number validation with Israeli format
export const validateIsraeliPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return /^05\d{8}$/.test(cleanPhone);
};
```

### Data Masking

```typescript
// Sensitive data masking
export const maskPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2');
};

export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
};
```

## 📈 Performance Optimizations

### Tree Shaking Support

The package is optimized for tree shaking with ESM exports:

```typescript
// Individual imports (recommended)
import { formatCurrency } from '@bankimonline/shared/utils/format';
import { mortgageSchema } from '@bankimonline/shared/schemas/mortgage';

// Avoid importing entire package
// import * from '@bankimonline/shared'; // ❌ Not recommended
```

### Bundle Size Optimization

- **Modular Exports**: Each utility can be imported individually
- **No Runtime Dependencies**: Minimal external dependencies
- **TypeScript-First**: Optimized compilation and type checking

## 🧪 Testing Support

### Test Utilities

```typescript
// Test data factories
export const createMockUser = (overrides?: Partial<UserProfile>): UserProfile => {
  return {
    id: '123',
    phone: '0501234567',
    firstName: 'Test',
    lastName: 'User',
    ...overrides
  };
};

export const createMockBankOffer = (overrides?: Partial<BankOffer>): BankOffer => {
  return {
    bankId: 'bank-1',
    bankName: 'Test Bank',
    interestRate: 0.045,
    maxLoanAmount: 1000000,
    terms: { minYears: 4, maxYears: 30 },
    ...overrides
  };
};
```

## 📱 Mobile & Responsive Support

### Device Detection

```typescript
// Device and viewport utilities
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
```

### Responsive Constants

```typescript
// Breakpoint utilities
export const BREAKPOINTS = {
  mobile: { max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024 }
} as const;
```

## 🚀 Publishing & Versioning

### NPM Publishing

```bash
# Build package
npm run build

# Publish to NPM registry
npm publish

# Publish beta version
npm publish --tag beta
```

### Version Management

The package follows semantic versioning:
- **Major**: Breaking API changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

---

## 🔗 Related Repositories

- **Development**: [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace)
- **Frontend**: [`bankimonline-web`](https://github.com/sravnenie-ipotek/bankimonline-web)
- **Backend**: [`bankimonline-api`](https://github.com/sravnenie-ipotek/bankimonline-api)

## 📞 Support

- **Issues**: Report in [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace/issues)
- **Documentation**: See workspace repository for comprehensive documentation
- **API Changes**: Check CHANGELOG.md for version updates

---

**🚨 Remember**: This is a deployment repository. All development happens in the workspace!

**Package Version**: 1.0.0  
**Last Sync**: Automatic via dual-push  
**Registry Status**: [![NPM Version](https://img.shields.io/npm/v/@bankimonline/shared)](https://www.npmjs.com/package/@bankimonline/shared)