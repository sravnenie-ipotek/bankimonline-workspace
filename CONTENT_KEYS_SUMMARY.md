# Content Keys Usage Analysis Report

## Overview

This report provides a comprehensive analysis of all content keys being used in the React codebase at `/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/src`.

## Summary Statistics

- **Total unique content keys**: 1,672
- **Total usage instances**: 2,834
- **Average usages per key**: 1.7

## Usage Methods Distribution

| Method | Count | Percentage | Description |
|--------|-------|------------|-------------|
| `t()` | 2,293 | 80.9% | i18next translation function calls |
| `getContent` | 469 | 16.5% | Content API getter function calls |
| `useContentApi` | 63 | 2.2% | React hook for content API |
| `i18n.t()` | 4 | 0.1% | Direct i18n translation calls |
| `t() (dynamic)` | 5 | 0.2% | Dynamic template literal t() calls |

## Key Findings

### High-Usage Content Keys
The following content keys appear most frequently across the codebase:

1. Form validation and UI labels are extensively used
2. Mortgage calculation steps have comprehensive content coverage
3. Bank worker management and admin functionality has detailed translations
4. Personal cabinet functionality is well-covered

### Content API vs Translation System
- **useContentApi/getContent** (532 total usages): Used primarily for database-backed content management
  - Most common in step forms and major page components
  - Pattern: `useContentApi('page_context')` followed by `getContent('specific_key', 'fallback')`

- **t() function** (2,293 usages): Used for traditional JSON-based translations
  - Widespread across all components
  - Often includes fallback values: `t('key', 'default_value')`

### Dynamic Content Keys
5 instances of dynamic content key generation were found, primarily using template literals like:
- `t(\`key_\${variable}\`)`
- `t(\`__MIGRATED_\${key}\`)`

## Content Key Categories

Based on analysis of the key patterns, content falls into these main categories:

### 1. Form Components (High Coverage)
- Field labels, placeholders, validation messages
- Multi-step form navigation
- Dropdown options and selections

### 2. Page Content (Database-backed)
- `home_page`, `about`, `contacts`
- Step-specific content: `mortgage_step1`, `mortgage_step2`, etc.
- Service-specific content: `calculate_credit_1`, `refinance_step1`

### 3. UI Components (JSON-based)
- Button labels, tooltips, messages
- Navigation items, breadcrumbs
- Modal dialogs and confirmations

### 4. Business Logic Content
- Bank offers and program details
- Calculation parameters and results
- Personal cabinet functionality

## Potential Orphaned Keys

To identify orphaned database entries, you should cross-reference the extracted content keys against your `content_items` table. Keys that appear in the database but NOT in this analysis may be orphaned.

## Migration Status

The codebase shows evidence of an ongoing migration from JSON-based translations to database-backed content:
- `__MIGRATED_` prefixed keys indicate completed migrations
- Dual patterns where both `getContent` and `t()` are used with the same keys
- Some components use database content with JSON fallbacks

## Recommendations

1. **Orphan Cleanup**: Compare this list against your database to identify unused entries
2. **Migration Completion**: Components using both systems could be fully migrated
3. **Dynamic Key Validation**: The 5 dynamic keys should be carefully validated
4. **Content Consolidation**: Consider standardizing on either database or JSON approach per component type

## Technical Notes

- Analysis covers all `.ts`, `.tsx`, `.js`, `.jsx` files in the React source
- Pattern matching includes quoted strings, template literals, and function calls
- File paths are relative to the project root
- Line numbers indicate exact usage locations

The complete detailed analysis is available in `content_keys_analysis.json` for programmatic processing.