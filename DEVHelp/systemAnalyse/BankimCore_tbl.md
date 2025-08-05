# BankimCore Database Tables

## Core Authentication Tables

**`clients`** - Customer accounts with phone-based SMS authentication  
*Used by: Customer authentication flows, Personal cabinet, SMS login APIs*

**`users`** - Staff/admin accounts with email-based authentication  
*Used by: Staff login, Admin panel, Backend authentication*

**`admin_users`** - Enhanced admin account management  
*Used by: Admin panel, User management, Advanced admin features*

## Banking Core Tables

**`banks`** - Master list of Israeli banks with multilingual support  
*Used by: Bank selection dropdowns, Registration forms, Admin bank management*

**`bank_branches`** - Bank branch locations and contact information  
*Used by: Branch selection, Employee registration, Location services*

**`bank_employees`** - Bank employee accounts and registration management  
*Used by: Employee registration, Bank worker workflows, HR management*

**`bank_employee_sessions`** - Employee session management  
*Used by: Employee authentication, Session tracking*

**`bank_config`** - Bank-specific configuration settings  
*Used by: Bank customization, Configuration management*

**`bank_configurations`** - Advanced per-bank configuration and interest rates  
*Used by: Bank-specific settings, Interest rate management*

**`israeli_bank_numbers`** - Official Israeli bank routing numbers  
*Used by: Bank number selection, Payment processing*

## Location and Reference Tables

**`cities`** - City reference data with multilingual support  
*Used by: Address forms, Location selection, Multilingual city data*

**`regions`** - Regional administrative divisions  
*Used by: Regional selection, Address management, Location hierarchy*

**`professions`** - Professional categories and job classifications  
*Used by: Employment forms, Job categorization, Professional data*

## Configuration and Standards Tables

**`banking_standards`** - Database-driven configuration for loan calculations  
*Used by: Mortgage calculations, LTV ratios, Payment calculations*

**`banking_standards_history`** - Audit trail for banking standards changes  
*Used by: Compliance tracking, Change management, Audit logs*

**`banking_standards_overrides`** - Bank-specific overrides for standards  
*Used by: Custom bank configurations, Override management*

**`property_ownership_options`** - Property ownership categories with LTV ratios  
*Used by: Property ownership selection, Mortgage calculations*

**`calculation_parameters`** - System calculation parameters  
*Used by: Calculation engine, Parameter management*

**`calculation_rules`** - Calculation business rules  
*Used by: Business logic, Calculation validation*

**`params`** - General system parameters with multilingual support  
*Used by: System configuration, Parameter management*

**`services`** - Available banking services catalog  
*Used by: Service selection, Registration forms*

## Session and Application Management

**`client_form_sessions`** - Persists user data across multi-step forms  
*Used by: Multi-step forms, Session management, Form persistence*

**`loan_applications`** - Final loan application records  
*Used by: Application submission, Admin application management*

**`loan_calculations`** - Loan calculation results and history  
*Used by: Calculation tracking, Financial calculations*

**`mortgage_calculation_cache`** - Cached mortgage calculation results  
*Used by: Performance optimization, Calculation caching*

## Client Data Management

**`client_assets`** - Client asset information  
*Used by: Asset tracking, Financial assessment*

**`client_credit_history`** - Client credit history records  
*Used by: Credit assessment, Financial evaluation*

**`client_debts`** - Client debt information  
*Used by: Debt tracking, Financial assessment*

**`client_documents`** - Client document uploads and management  
*Used by: Document management, File uploads*

**`client_employment`** - Client employment information  
*Used by: Employment verification, Income assessment*

**`client_identity`** - Client identity verification data  
*Used by: Identity verification, KYC processes*

**`properties`** - Property information for loans  
*Used by: Property evaluation, Mortgage processing*

## HR and Recruitment Tables

**`vacancies`** - Job postings and recruitment management  
*Used by: Job listings, Career pages, Recruitment*

**`vacancy_applications`** - Job application tracking  
*Used by: Application processing, Resume management*

**`registration_invitations`** - Employee registration invitations  
*Used by: Employee onboarding, Invitation management*

**`worker_approval_queue`** - Employee approval workflow  
*Used by: Employee approval, Workflow management*

## Admin and Configuration

**`admin_audit_log`** - Admin action tracking and auditing  
*Used by: Security logging, Compliance tracking*

**`registration_form_config`** - Multilingual form field configuration  
*Used by: Dynamic form generation, Form customization*

**`registration_validation_rules`** - Form validation rules  
*Used by: Form validation, Input validation*

**`approval_matrix`** - Approval workflow configuration  
*Used by: Approval processes, Workflow management*

## Analytics and Monitoring

**`bank_analytics`** - Banking analytics and metrics  
*Used by: Performance monitoring, Analytics dashboard*

**`risk_parameters`** - Risk assessment parameters  
*Used by: Risk management, Credit assessment*

**`interest_rate_rules`** - Interest rate calculation rules  
*Used by: Rate calculations, Financial modeling*

## Content Management

**`locales`** - Translation content for multilingual support  
*Used by: i18n system, Content management, Translations*

## Test and Development

**`test1`** - Development/testing table  
*Used by: Development testing, Temporary data storage*

---

## Table Summary
- **Total Tables**: 46
- **Core Auth**: 3 tables
- **Banking**: 8 tables  
- **Location/Reference**: 3 tables
- **Configuration**: 9 tables
- **Session/Application**: 4 tables
- **Client Data**: 6 tables
- **HR/Recruitment**: 4 tables
- **Admin**: 4 tables
- **Analytics**: 3 tables
- **Content**: 1 table
- **Test**: 1 table

## Key Architecture Notes
- **Dual Database**: Main + Content databases
- **Multilingual**: Most tables support EN/HE/RU
- **Session Management**: Complex multi-step form persistence
- **Configuration-Driven**: Moving from hardcoded to database values
- **Audit Trail**: Comprehensive logging and history tracking