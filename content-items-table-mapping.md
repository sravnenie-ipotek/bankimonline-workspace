# Content Items Table Mapping

## Table Overview

The `content_items` table is part of the banking_content database and stores UI content metadata.

### Database: `banking_content`
### Total Records: 18
### Last Updated: 2025-07-24

## Table Structure

| Column | Type | Max Length | Nullable | Default | Description |
|--------|------|------------|----------|---------|-------------|
| `id` | integer | - | NO | auto-increment | Primary key |
| `key` | varchar | 255 | NO | - | Unique content identifier |
| `screen_location` | varchar | 100 | NO | - | Where content appears |
| `component_type` | varchar | 50 | YES | 'text' | UI component type |
| `category` | varchar | 100 | YES | 'general' | Content category |
| `status` | varchar | 20 | YES | 'active' | Active/inactive status |
| `created_at` | timestamp | - | YES | CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | timestamp | - | YES | CURRENT_TIMESTAMP | Last update timestamp |

## Content Distribution

### By Screen Location
```
navigation          ████████████ 12 items (66.7%)
about               ██ 2 items (11.1%)
contacts            ██ 2 items (11.1%)
temporary_franchise █ 1 item (5.6%)
test                █ 1 item (5.6%)
```

### By Category
```
general ████████████████████ 18 items (100%)
```

### By Component Type
```
text ████████████████████ 18 items (100%)
```

### By Status
```
active ████████████████████ 18 items (100%)
```

## Content Mapping by Screen

### 1. Navigation Screen (12 items)
Sidebar navigation elements for business and company sections.

| ID | Key | Component | Created |
|----|-----|-----------|---------|
| 1 | sidebar_business | text | 2025-07-21 |
| 2 | sidebar_business_1 | text | 2025-07-21 |
| 3 | sidebar_business_2 | text | 2025-07-21 |
| 4 | sidebar_business_3 | text | 2025-07-21 |
| 5 | sidebar_business_4 | text | 2025-07-21 |
| 6 | sidebar_company | text | 2025-07-21 |
| 7 | sidebar_company_1 | text | 2025-07-21 |
| 8 | sidebar_company_2 | text | 2025-07-21 |
| 9 | sidebar_company_3 | text | 2025-07-21 |
| 10 | sidebar_company_4 | text | 2025-07-21 |
| 11 | sidebar_company_5 | text | 2025-07-21 |
| 12 | test_key_2 | text | 2025-07-21 |

### 2. About Screen (2 items)
About page content including title and description.

| ID | Key | Component | Created |
|----|-----|-----------|---------|
| 13 | about_title | text | 2025-07-21 |
| 14 | about_desc | text | 2025-07-21 |

### 3. Contacts Screen (2 items)
Contact page content for displaying office information.

| ID | Key | Component | Created |
|----|-----|-----------|---------|
| 15 | contacts_title | text | 2025-07-21 |
| 16 | contacts_main_office | text | 2025-07-21 |

### 4. Temporary Franchise Screen (1 item)
Franchise-related content.

| ID | Key | Component | Created |
|----|-----|-----------|---------|
| 17 | franchise_main_hero_title | text | 2025-07-21 |

### 5. Test Screen (1 item)
Test content for development purposes.

| ID | Key | Component | Created |
|----|-----|-----------|---------|
| 18 | test_content | text | 2025-07-21 |

## Key Patterns

### Navigation Keys
- `sidebar_business` - Main business section header
- `sidebar_business_[1-4]` - Business submenu items
- `sidebar_company` - Main company section header
- `sidebar_company_[1-5]` - Company submenu items

### Content Keys
- `[screen]_title` - Page titles (e.g., about_title, contacts_title)
- `[screen]_desc` - Page descriptions (e.g., about_desc)
- `[screen]_main_[element]` - Main page elements (e.g., contacts_main_office)

## Translation Coverage

Each content item can have translations in multiple languages through the `content_translations` table relationship:
- Primary languages: en (English), he (Hebrew), ru (Russian)
- Translation status tracked separately from item status
- One-to-many relationship: content_items.id → content_translations.content_item_id

## Current Limitations

1. **Limited Process Coverage**: No mortgage, credit, or refinancing specific content
2. **Single Category**: All items are categorized as "general"
3. **Single Component Type**: Only "text" components are used
4. **No Inactive Items**: All items are marked as "active"

## Recommendations

1. **Add Process-Specific Content**: Migrate mortgage, credit, and refinancing content from `locales` table
2. **Expand Categories**: Create specific categories for different banking processes
3. **Add Component Types**: Support buttons, forms, labels, errors, etc.
4. **Version Control**: Add version tracking for content changes
5. **Metadata Enhancement**: Add fields for SEO, priority, or display order

## Related Tables

- **content_translations**: Stores actual translated content for each item
- **content_categories**: (If exists) Defines available categories
- **languages**: (If exists) Defines supported languages

## Usage in Application

Content is typically fetched by:
1. Screen location (e.g., all content for "navigation" screen)
2. Specific key (e.g., get "about_title" content)
3. Category + Language combination for bulk loading

Example API endpoints:
- `GET /api/content/:screen/:language` - Get all content for a screen
- `GET /api/content/:key/:language` - Get specific content item