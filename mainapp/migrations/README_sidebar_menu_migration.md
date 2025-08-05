# Sidebar Menu Content Migration

This migration moves all sidebar menu content from translation files to the database content management system.

## Migration Details

### Content Structure
The sidebar menu has two main categories:
1. **Company** (sidebar_company) - 6 menu items
2. **Business** (sidebar_business) - 4 menu items

### Database Schema
- **content_items** table:
  - `content_key`: Unique identifier (e.g., 'sidebar_company_1')
  - `screen_location`: 'sidebar'
  - `component_type`: 'menu_category' or 'menu_item'
  - `element_order`: Determines display order

- **content_translations** table:
  - Stores translations for each content_item in EN, HE, and RU
  - `field_name`: 'text' for menu labels

### How to Run the Migration

1. **Execute the migration:**
   ```bash
   node run-sidebar-menu-migration.js
   ```

2. **Verify the migration:**
   ```bash
   node verify-sidebar-menu-content.js
   ```

### Content Keys and Translations

#### Company Section
- `sidebar_company`: Company / חברה / Компания
- `sidebar_company_1`: Our services / השירותים שלנו / Наши услуги
- `sidebar_company_2`: About / אודות / О нас
- `sidebar_company_3`: Jobs / משרות / Вакансии
- `sidebar_company_4`: Contact / צור קשר / Связаться с нами
- `sidebar_company_5`: Temporary Franchise for Brokers / זכיון זמני למתווכים / Временная франшиза для брокеров
- `sidebar_company_6`: Franchise for Real Estate Brokers / זיכיון למתווכי נדל"ן / Франшиза для брокеров недвижимости

#### Business Section
- `sidebar_business`: Business / עסקים / Бизнес
- `sidebar_business_1`: Partner financial institutions / מוסדות פיננסיים שותפים / Финансовые учреждения-партнеры
- `sidebar_business_2`: Partner program / תכנית שותפים / Партнерская программа
- `sidebar_business_3`: Broker franchise / זיכיון לברוקרים / Франшиза для брокеров
- `sidebar_business_4`: Lawyer partner program / תוכנית שותפים לעורכי דין / Партнерская программа для юристов

### Frontend Integration
The React components are already configured to use:
- `useContentApi()` hook to fetch content
- `getContent()` function to retrieve translations

The sidebar will automatically display the database content once migrated.