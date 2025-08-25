# Version Management - Manual Control

Simple hardcoded version management system.

## 📁 Configuration File

Edit: `mainapp/src/config/versionConfig.ts`

```typescript
export const VERSION_CONFIG = {
  // UPDATE THESE MANUALLY:
  version: '0.1.2',                    // Version number
  datetime: '25.08.2025 12:35',        // Deployment datetime
  showOnTest: true,                    // Show on TEST environment
  showOnProd: true,                    // Show on PROD environment
  
  // Optional:
  buildNumber: '001',
  commit: 'manual'
};
```

## 🎯 How to Update Version

1. **Edit the file**: `mainapp/src/config/versionConfig.ts`
2. **Update values**:
   - `version`: New version number (e.g., '0.1.3')
   - `datetime`: Current date/time
   - `showOnTest`/`showOnProd`: Control visibility
3. **Commit and deploy**

## 🔧 Environment Control

- **`showOnTest: false`** - Hides version chip on dev2.bankimonline.com
- **`showOnProd: false`** - Hides version chip on bankimonline.com
- **Both `false`** - Chip completely hidden

## 📊 Environment Detection

- **TEST**: `dev2.bankimonline.com` or `localhost`
- **PROD**: `bankimonline.com` (without dev2)

## ✅ Advantages

- ✅ Simple and reliable
- ✅ No CI/CD complexity
- ✅ Full manual control
- ✅ Immediate updates after deployment
- ✅ Easy to hide/show per environment
- ✅ No automatic increments or permissions issues