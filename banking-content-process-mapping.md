# Banking Content Process Mapping

## Overview
This document maps content keys to their respective banking processes based on data from two sources:
1. **banking_content database** (content_items & content_translations tables)
2. **Main database** (locales table)

## Current Status

### Banking Content Database (content_items table)
Currently contains only general content:
- Total items: 18 unique keys across 50 entries
- All items are categorized as "general"
- No process-specific content found

### Main Database (locales table)
Contains process-specific content with mortgage, credit, and refinancing keys.

## Process Mapping

### 1. Mortgage Process
Keys related to standard mortgage calculations and applications:
- `calculate_mortgage` - Calculate mortgage button/title
- `mortgage` - General mortgage label
- `go_mortgage` - Navigate to mortgage section
- `go_mortgage_text` - Text for mortgage navigation
- `make_mortgage` - Create/apply for mortgage
- `bank_mortgage_sum` - Bank mortgage amount
- `mortgage_error_enter` - Mortgage entry error message
- `mortgage_error_min_sum` - Minimum mortgage amount error

### 2. Refinance Mortgage Process
Keys specific to mortgage refinancing:
- `make_refinance_mortgage` - Create/apply for mortgage refinancing
- (Additional refinance-specific keys would follow the pattern: `refinance_mortgage_*`)

### 3. Credit Process
Keys related to credit/loan calculations and applications:
- `credit` - General credit label
- `menu_credit` - Credit menu item
- `continue_new_credit` - Continue with new credit application
- `make_credit` - Create/apply for credit
- `credit_sum` - Credit amount
- `credit_max_payment` - Maximum credit payment
- `credit_min_payment` - Minimum credit payment
- `credit_payment_text` - Credit payment description
- `credit_delay` - Credit delay/deferment
- `about_credits` - About credits section

### 4. Refinance Credit Process
Keys specific to credit refinancing:
- `make_refinance_credit` - Create/apply for credit refinancing
- (Additional refinance credit keys would follow the pattern: `refinance_credit_*`)

### 5. General/Shared Content
Content used across multiple processes or for general UI:

#### From banking_content database:
- **Navigation**: `sidebar_business`, `sidebar_business_1-4`, `sidebar_company`, `sidebar_company_1-5`
- **About Section**: `about_title`, `about_desc`
- **Contact Section**: `contacts_title`, `contacts_main_office`
- **Franchise**: `franchise_main_hero_title`
- **Test Content**: `test_content`, `test_key_2`

#### From locales table (general patterns):
- Error messages
- Common UI elements
- Shared validation messages
- Navigation elements

## Key Patterns and Conventions

### Naming Conventions:
1. **Process Prefix**: Keys typically start with the process name (mortgage, credit, refinance)
2. **Action Verbs**: `make_`, `calculate_`, `go_`, `continue_`
3. **UI Elements**: `_text`, `_title`, `_button`, `_label`
4. **Errors**: `_error_`, followed by error type
5. **Limits**: `_min_`, `_max_`

### Screen Location Patterns:
- `about` - About us page content
- `contacts` - Contact information
- `navigation` - Navigation menu items
- `temporary_franchise` - Franchise-related content

## Recommendations

1. **Standardize Key Naming**: Follow consistent patterns for new keys
2. **Migrate Process Content**: Consider moving process-specific content from locales to banking_content database
3. **Add Missing Keys**: Many process-specific keys likely need to be added for complete functionality
4. **Language Support**: Ensure all keys have translations in en, he, and ru

## Database Structure Reference

### content_items table:
- `id` - Primary key
- `key` - Unique content key
- `screen_location` - Where content appears
- `component_type` - Type of UI component
- `category` - Content category
- `status` - Active/inactive status

### content_translations table:
- `id` - Primary key
- `content_item_id` - Foreign key to content_items
- `language_code` - Language (en, he, ru)
- `value` - Translated content
- `status` - Translation status

### locales table:
- `key` - Content key
- `en` - English translation
- `he` - Hebrew translation
- `ru` - Russian translation