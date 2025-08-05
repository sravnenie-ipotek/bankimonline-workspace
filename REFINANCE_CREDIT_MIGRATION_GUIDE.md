# Refinance Credit Migration Guide

## Current Status

### ✅ Completed
1. **Fixed MIGRATED_ suffix issue** - All translation files cleaned
2. **Created migration SQL files** - All 4 steps of refinance credit have migration files ready
3. **Identified missing translations** - 239 Hebrew keys, 250 Russian keys need translation
4. **Created translation tools** - Export and import scripts for bulk translation

### ❌ Pending Tasks

## 1. Execute Database Migrations

Run the migration script to populate the database with refinance credit content:

```bash
node run-refinance-migrations.js
```

This will execute all 4 refinance credit migrations:
- Step 1: Dropdowns
- Step 2: Personal Details (Complete)
- Step 3: Complete
- Step 4: Complete

## 2. Add Missing Translations

### Option A: Use Google Translate (Recommended)

1. **Export missing translations:**
   ```bash
   node export-missing-translations.js
   ```

2. **Files created in `translations-to-translate/`:**
   - `hebrew-to-translate.txt` - Copy this into Google Translate (English → Hebrew)
   - `russian-to-translate.txt` - Copy this into Google Translate (English → Russian)

3. **Save translated text** to new files:
   - `hebrew-translated.txt`
   - `russian-translated.txt`

4. **Import translations back:**
   ```bash
   node import-translations.js
   ```
   - Choose language (he/ru)
   - Select import method 1 (from text file)
   - Provide path to translated file

### Option B: Manual Translation

The missing keys are in:
- `translations-to-translate/missing-hebrew.json`
- `translations-to-translate/missing-russian.json`

Key missing translations for refinance credit step 2:
- Personal details fields
- Family status options
- Education level options
- Citizenship options
- Yes/No options

## 3. Update Frontend Components

After database migration, the refinance credit components should automatically use database content through `useContentApi` hook.

Components that need verification:
- `/mainapp/src/pages/Services/RefinanceCredit/Steps/Step2.tsx`
- Other refinance credit step components

## 4. Verify Everything Works

1. **Check database content:**
   ```sql
   SELECT COUNT(*) FROM content_items WHERE screen_location LIKE 'refinance_credit_%';
   ```

2. **Test the application:**
   - Navigate to refinance credit calculator
   - Check all 4 steps display properly
   - Verify translations work in all languages

## Quick Commands Summary

```bash
# 1. Run database migrations
node run-refinance-migrations.js

# 2. Export missing translations
node export-missing-translations.js

# 3. After translating, import them back
node import-translations.js

# 4. Sync all translation files
npm run sync-translations

# 5. Start the application
npm run dev
```

## Important Notes

- The migration files are comprehensive and include all fields, labels, placeholders, and dropdown options
- Each migration uses `ON CONFLICT DO NOTHING` to prevent duplicate entries
- The frontend already uses `useContentApi` hook which will automatically fetch from database once populated
- Missing translations are primarily for Hebrew and Russian languages - English is complete