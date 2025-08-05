# 🛡️ PROTECTED FILES - DO NOT MODIFY

## ⚠️ CRITICAL WARNING
**Before making ANY file modifications, deletions, or major changes to this project, you MUST first check this PROTECTED_FILES.md file to ensure you're not modifying critical production files.**

This document lists all files that are critical to the system's operation and should NOT be modified without extreme caution and proper testing.

---

## 🔴 CRITICAL PRODUCTION FILES - NEVER MODIFY

### Core Server Files
- `server-db.js` - Main database server with authentication, API endpoints, and business logic
- `serve.js` - Static file server configuration
- `start-dev.js` - Development environment startup script
- `nixpacks.toml` - Railway deployment configuration

### Database & Migrations
- `migrations/001-add-admin-columns.sql` - Initial admin system setup
- `migrations/002-banking-tables.sql` - Core banking data structure
- `migrations/003-admin-configurable-standards.sql` - Bank standards configuration
- `migrations/004-banking-standards-audit-history.sql` - Audit trail system
- `migrations/005-multi-role-admin.sql` - Multi-role admin system
- `run-multi-role-migration.js` - Migration execution script

### Admin System
- `admin.html` - Standalone admin panel interface
- `customer-approval-check.html` - Customer approval verification system
- `js/role-manager.js` - Role-based access control system
- `mainapp/src/pages/Admin/` - React admin components

### Authentication & Security
- `js/i18n.js` - Internationalization configuration
- `mainapp/src/store/slices/adminSlice.ts` - Admin authentication state
- `mainapp/src/pages/AuthModal/` - Authentication modal system

---

## 🟡 HIGH-PRIORITY PROTECTED FILES

### Translation System
- `translations/en.json` - English translations (master file)
- `translations/he.json` - Hebrew translations
- `translations/ru.json` - Russian translations
- `locales/*/translation.json` - All locale files
- `mainapp/public/locales/*/translation.json` - React app translations
- `scripts/sync-translations.js` - Translation synchronization script

### Core Configuration
- `js/bank-config.js` - Banking system configuration
- `mainapp/src/config/i18n.ts` - React i18n configuration
- `mainapp/src/services/api.ts` - API service configuration

### Business Logic Components
- `mainapp/src/pages/Services/` - All service calculation pages
- `mainapp/src/store/` - Redux store and state management
- `mainapp/src/hooks/` - Custom React hooks

---

## 🟠 VACANCIES SYSTEM - PROTECTED COMPONENTS

### Core Vacancies Files
- `mainapp/src/pages/Vacancies/Vacancies.tsx` - Main vacancies page component
- `mainapp/src/pages/Vacancies/VacancyDetail/VacancyDetail.tsx` - Detailed vacancy view
- `mainapp/src/pages/Vacancies/components/VacancyCard/VacancyCard.tsx` - Vacancy card component
- `mainapp/src/pages/Vacancies/components/CategoryFilter/CategoryFilter.tsx` - Category filtering

### Vacancies Styling
- `mainapp/src/pages/Vacancies/Vacancies.module.scss` - Main page styles
- `mainapp/src/pages/Vacancies/VacancyDetail/VacancyDetail.module.scss` - Detail page styles
- `mainapp/src/pages/Vacancies/components/VacancyCard/VacancyCard.module.scss` - Card styles
- `mainapp/src/pages/Vacancies/components/CategoryFilter/CategoryFilter.module.scss` - Filter styles

### Vacancies Translation Keys
**In all translation files (en.json, he.json, ru.json):**
- `vacancies_title`, `vacancies_subtitle`, `vacancies_no_results`
- `vacancy_employment_*` keys (fulltime, parttime, contract, temporary)
- `vacancies_category_*` keys (all, development, design, management, marketing, finance, customer_service)
- `vacancy_salary_from`, `loading`, `error_loading_vacancies`, `retry`
- `vacancyDetail.*` - All nested vacancy detail translations
- `navigation.home`, `vacancies.title`, `vacancies.backToVacancies`

---

## 🟠 CONTACTS SYSTEM - PROTECTED COMPONENTS

### Core Contacts Files
- `mainapp/src/pages/Contacts/Contacts.tsx` - Main contacts page component
- `mainapp/src/components/layout/Footer/Contacts/Contacts.tsx` - Footer contacts component

### Contacts Styling
- `mainapp/src/pages/Contacts/contacts.module.scss` - Main contacts page styles
- `mainapp/src/components/layout/Footer/Contacts/contacts.module.scss` - Footer contacts styles

### Contacts Translation Keys
**In all translation files (en.json, he.json, ru.json):**
- `contacts_title`, `contacts_main_office`, `contacts_address`
- `contacts_phone`, `contacts_email`, `contacts_phone_label`, `contacts_email_label`
- `contacts_*_questions` keys (general, service, real_estate)
- `contacts_cooperation`, `contacts_tech_support`, `contacts_secretary`, `contacts_customer_service`
- `contacts_*_phone`, `contacts_*_email`, `contacts_*_link` keys for all departments
- `contacts_social_follow`, `contacts_login_cabinet`
- All `contacts_footer_*` keys for footer information

---

## 🔵 DEPLOYMENT & BUILD FILES

### Production Deployment
- `deploy-production.sh` - Production deployment script
- `build-railway.sh` - Railway-specific build script
- `mainapp/dist/` - Production build output
- `mainapp/build/` - React build directory

### Environment Configuration
- `.env` - Development environment variables
- `.env.production` - Production environment variables
- `mainapp/.env` - React app environment variables
- `mainapp/.env.production` - React production environment

### CI/CD Configuration
- `.gitlab-ci/client.yml` - GitLab CI configuration
- `mainapp/.gitlab-ci/client.yml` - React app CI configuration
- `.gitignore` - Git ignore rules
- `mainapp/.gitignore` - React app ignore rules

---

## 🟢 DOCUMENTATION FILES - MODIFY WITH CAUTION

### System Documentation
- `README.md` - Main project documentation
- `CLAUDE_CONTEXT.md` - Development context and history
- `DEPLOYMENT_GUIDE.md` - Production deployment guide
- `TODO_BEFORE_PRODUCTION.txt` - Critical production checklist

### Development Documentation
- `DEVHelp/ENVIRONMENT_SETUP.txt` - Environment configuration guide
- `DEVHelp/LOCAL_DEVELOPMENT_GUIDE.txt` - Local development instructions
- `DEVHelp/SYSTEM_ANALYSIS.txt` - System architecture analysis
- `toDev/BANKING_SYSTEM_ENHANCEMENT_TASK.txt` - Enhancement roadmap

---

## 📋 MODIFICATION GUIDELINES

### 🚫 PROTECTED FILES MODIFICATION POLICY
**ALL PROTECTED FILES LISTED IN THIS DOCUMENT CAN ONLY BE MODIFIED WHEN EXPLICITLY REQUESTED BY THE PROJECT OWNER.**

- **No unauthorized modifications** to any protected file
- **No proactive changes** without explicit permission
- **All modifications must be requested** before implementation
- **Changes require approval** from the project owner

### ✅ SAFE TO MODIFY (Only when requested)
- Static assets in `mainapp/public/static/`
- CSS files for styling adjustments (with testing)
- New component files (non-core functionality)
- Test files (`*.test.js`, `*.spec.js`)

### ⚠️ MODIFY WITH EXTREME CAUTION (Only when explicitly requested)
- Any file listed in the protected sections above
- Database-related files
- Authentication system files
- Translation files (coordinate changes across all languages)
- Core business logic components
- Contacts system files
- Vacancies system files

### ❌ NEVER MODIFY WITHOUT EXPLICIT REQUEST AND BACKUP
- `server-db.js` - Contains all API endpoints and business logic
- Migration files - Database schema changes
- `admin.html` - Standalone admin interface
- `role-manager.js` - Security and access control
- All protected component files and their translations

---

## 🚨 EMERGENCY PROCEDURES

### Before Modifying Protected Files:
1. **Create a full backup** of the current working system
2. **Test in development environment** thoroughly
3. **Review impact** on all dependent systems
4. **Coordinate with team** if working in a team environment
5. **Document changes** in appropriate log files

### If You Accidentally Modify a Protected File:
1. **Stop immediately** and assess the damage
2. **Restore from backup** if available
3. **Check system functionality** thoroughly
4. **Review git history** for recent changes
5. **Test all critical paths** before continuing

---

## 📝 CHANGE LOG

| Date | File Modified | Reason | Modified By |
|------|---------------|--------|-------------|
| 2025-01-13 | translations/he.json | Added missing vacancies translations | System |
| 2025-01-13 | PROTECTED_FILES.md | Initial creation | System |
| 2025-01-13 | mainapp/src/pages/Contacts/Contacts.tsx | Removed login button per owner request | System |
| 2025-01-13 | PROTECTED_FILES.md | Added Contacts system protection + owner-only modification policy | System |

---

## 🔗 RELATED DOCUMENTATION

- See `CLAUDE_CONTEXT.md` for complete development history
- See `TODO_BEFORE_PRODUCTION.txt` for production readiness checklist
- See `DEPLOYMENT_GUIDE.md` for deployment procedures
- See `DEVHelp/` folder for detailed technical documentation

---

**Last Updated:** January 13, 2025  
**Version:** 1.0  
**Status:** Active Protection
