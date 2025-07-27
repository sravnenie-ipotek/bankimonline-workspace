# Database Screen Location Conventions

## Overview
This document defines the standardized screen location naming conventions used in the content management system database for all mortgage and credit processes.

## Database Screen Location Mapping

### Refinance Mortgage Process
Database screen locations for refinance mortgage:

- **Step 1 (Calculator)**: `refinance_credit_1`
- **Step 2 (Personal Data)**: `refinance_credit_2` 
- **Step 3 (Income Data)**: `refinance_credit_3`
- **Step 4 (Program/Bank Selection)**: `mortgage_step4`

### Refinance Credit Process
Database screen locations for refinance credit:

- **Step 1 (Calculator)**: `refinance_credit_1`
- **Step 2 (Personal Data)**: `refinance_credit_2`
- **Step 3 (Income Data)**: `refinance_credit_3` 
- **Step 4 (Results/Summary)**: `refinance_credit_4`

### Calculate Mortgage Process
Database screen locations for mortgage calculation:

- **Step 1 (Calculator)**: `mortgage_step1`
- **Step 2 (Personal Data)**: `mortgage_step2`
- **Step 3 (Income Data)**: `mortgage_step3`
- **Step 4 (Program/Bank Selection)**: `mortgage_step4`

### Calculate Credit Process
Database screen locations for credit calculation:

- **Step 1 (Calculator)**: `credit_step1`
- **Step 2 (Personal Data)**: `credit_step2`
- **Step 3 (Income Data)**: `credit_step3`
- **Step 4 (Program/Bank Selection)**: `credit_step4`

## Other Database Screen Locations

### Bank Components
- **Bank Offers Display**: `bank_offers`
- **Bank Comparison**: `bank_comparison`

### General Pages
- **Home Page**: `home_page`
- **About Page**: `about_page`
- **Contacts Page**: `contacts_page`

### Admin Panel
- **Admin Dashboard**: `admin_dashboard`
- **Content Management**: `admin_content`
- **User Management**: `admin_users`

## Database Rules

### Critical Conventions
- **Refinance Mortgage** MUST use `refinance_credit_*` screen locations in database
- **Calculate Mortgage** MUST use `mortgage_step*` screen locations in database
- **Calculate Credit** MUST use `credit_step*` screen locations in database
- **Refinance Credit** MUST use `refinance_credit_*` screen locations in database

### Language Support
All screen locations support three languages in `content_translations` table:
- `en` (English)
- `he` (Hebrew) 
- `ru` (Russian)

### Migration Status in Database
- ✅ `refinance_credit_1` - Content migrated to database
- ✅ `refinance_credit_2` - Content migrated to database
- ✅ `refinance_credit_3` - Content migrated to database
- ✅ `refinance_credit_4` - Content migrated to database
- ✅ `mortgage_step4` - Content migrated to database
- ⚠️ `mortgage_step1` - Partially migrated
- ⚠️ `mortgage_step2` - Partially migrated  
- ⚠️ `mortgage_step3` - Partially migrated
- ❌ `credit_step1` - Not migrated
- ❌ `credit_step2` - Not migrated
- ❌ `credit_step3` - Not migrated
- ❌ `credit_step4` - Not migrated

## Database Verification Queries

### Check Available Content by Screen Location
```sql
SELECT screen_location, COUNT(*) as content_items
FROM content_items 
WHERE screen_location IN (
    'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4',
    'mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4',
    'credit_step1', 'credit_step2', 'credit_step3', 'credit_step4'
)
GROUP BY screen_location
ORDER BY screen_location;
```

### Check Translation Coverage in Database
```sql
SELECT 
    ci.screen_location,
    COUNT(DISTINCT ci.id) as total_items,
    COUNT(DISTINCT CASE WHEN ct.language_code = 'en' THEN ci.id END) as english_items,
    COUNT(DISTINCT CASE WHEN ct.language_code = 'he' THEN ci.id END) as hebrew_items,
    COUNT(DISTINCT CASE WHEN ct.language_code = 'ru' THEN ci.id END) as russian_items
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location LIKE '%credit_%' OR ci.screen_location LIKE '%mortgage_%'
GROUP BY ci.screen_location
ORDER BY ci.screen_location;
```

### Find All Screen Locations in Database
```sql
SELECT DISTINCT screen_location, COUNT(*) as items
FROM content_items 
GROUP BY screen_location 
ORDER BY screen_location;
```

## Database Tables Structure

### Primary Tables
- **content_items**: Contains screen_location, content_key, component_type, category
- **content_translations**: Contains language-specific content values linked to content_items

### Key Database Fields
- **screen_location**: Process identifier (e.g., 'refinance_credit_1')
- **content_key**: Unique content identifier within screen location
- **language_code**: Language identifier ('en', 'he', 'ru')
- **content_value**: Actual translated text content
