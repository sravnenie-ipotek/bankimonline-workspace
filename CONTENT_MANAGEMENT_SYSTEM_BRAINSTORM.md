# Content Management System Database Design - Brainstorming Document

## Project Overview
Moving all web app content (headers, content, dropdown options, hints, placeholders, etc.) from hardcoded values to a database-driven system (`bankim_content`) to enable admin panel control over all content elements.

## Current Requirements Analysis (Based on Confluence Docs)

### Content Types Identified:
1. **Text Content** - Headers, labels, descriptions, help text
2. **Dropdown Options** - Single/multi-select options with ordering support
3. **Links** - Navigation links, external URLs
4. **Placeholders** - Form input placeholders
5. **Hints** - Tooltips, help text, validation messages
6. **Navigation Elements** - Menu items, breadcrumbs

### Multi-language Support Required:
- **Russian (RU)** - Primary language
- **Hebrew (HE)** - RTL support required
- **English (EN)** - Secondary language

### Admin Panel Features Needed:
- Content editing with real-time preview
- Drag-and-drop reordering for dropdowns
- Bulk content operations
- Change tracking and approval workflow
- Content versioning and rollback
- Search and filtering capabilities

## Database Design Patterns Analysis

### 1. WordPress Pattern (Key-Value Meta System)
**Structure:**
- `wp_posts` - Main content table
- `wp_postmeta` - Key-value pairs for custom fields
- `wp_options` - Site-wide settings

**Advantages:**
- Extremely flexible - unlimited custom fields
- Stable schema - structure doesn't change
- Plugin/theme friendly
- Handles various content types in single table

**Disadvantages:**
- Performance issues with large datasets
- Complex queries for filtering/searching
- Data type inconsistency (everything is text)
- Harder to maintain data integrity

### 2. Drupal Pattern (Entity-Field System)
**Structure:**
- Entities define content types
- Fields are strongly typed with schemas
- Automatic table generation for field storage
- Built-in multilingual support

**Advantages:**
- Strong data typing and validation
- Excellent multilingual support
- Automatic schema management
- Revision tracking built-in
- Granular permissions

**Disadvantages:**
- Complex architecture
- Steeper learning curve
- More database tables
- Potential over-engineering for simple needs

### 3. Strapi Pattern (Modern Headless CMS)
**Structure:**
- Content types as JSON schemas
- Dynamic API generation
- Built-in internationalization
- Role-based access control

**Advantages:**
- API-first approach
- Modern developer experience
- Built-in admin panel
- Excellent performance
- Multi-database support

**Disadvantages:**
- Less mature than WordPress/Drupal
- Requires Node.js expertise
- May be overkill for simple content management

## Recommended Database Schema Design

### Final Approach: Hierarchical Content Management System
Based on successful CMS patterns with practical content key naming and robust workflow management:

## Core Database Tables

### 1. Content Items (Main Content Registry)
```sql
CREATE TABLE content_items (
    id BIGSERIAL PRIMARY KEY,
    content_key VARCHAR(255) UNIQUE NOT NULL,  -- e.g., 'app.login.welcome_message'
    content_type VARCHAR(20) CHECK (content_type IN ('text', 'html', 'markdown', 'json')) DEFAULT 'text',
    category VARCHAR(100),                     -- e.g., 'headers', 'buttons', 'placeholders'
    screen_location VARCHAR(100),              -- e.g., 'login_page', 'dashboard', 'profile'
    component_type VARCHAR(50),                -- e.g., 'button', 'header', 'placeholder', 'hint'
    description TEXT,                          -- Admin description of what this content does
    is_active BOOLEAN DEFAULT TRUE,
    legacy_translation_key VARCHAR(255),       -- Map to existing translation keys
    migration_status VARCHAR(20) DEFAULT 'pending', -- Track migration progress
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,                        -- Admin user ID
    updated_by INTEGER,                        -- Admin user ID
    
    -- Indexes for performance
    INDEX idx_content_key (content_key),
    INDEX idx_category (category),
    INDEX idx_screen_location (screen_location),
    INDEX idx_active (is_active),
    INDEX idx_legacy_key (legacy_translation_key)
);
```

### 2. Content Translations (Multi-language Support)
```sql
CREATE TABLE content_translations (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL,       -- e.g., 'en', 'he', 'ru', 'en-US'
    content_value TEXT NOT NULL,              -- The actual text/content
    is_default BOOLEAN DEFAULT FALSE,         -- Default language for this content
    status VARCHAR(20) CHECK (status IN ('draft', 'review', 'approved', 'archived')) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    approved_by INTEGER,
    approved_at TIMESTAMP NULL,
    
    FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE,
    UNIQUE (content_item_id, language_code),
    INDEX idx_language (language_code),
    INDEX idx_status (status),
    INDEX idx_approved (approved_at)
);
```

### 3. Languages (Supported Languages)
```sql
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,         -- e.g., 'en', 'he', 'ru'
    name VARCHAR(100) NOT NULL,               -- e.g., 'English', 'Hebrew', 'Russian'
    native_name VARCHAR(100),                 -- e.g., 'English', 'עברית', 'Русский'
    direction VARCHAR(3) CHECK (direction IN ('ltr', 'rtl')) DEFAULT 'ltr',
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Content Categories (Organization)
```sql
CREATE TABLE content_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,        -- e.g., 'headers', 'buttons', 'forms'
    display_name VARCHAR(100),                -- Admin-friendly name
    description TEXT,
    parent_id INTEGER NULL,                   -- For hierarchical categories
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (parent_id) REFERENCES content_categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_sort (sort_order)
);
```

### 5. Admin Users (Content Management Access)
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('super_admin', 'content_manager', 'translator', 'reviewer')) DEFAULT 'content_manager',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);
```

## Advanced Features Tables

### 6. Content Versions (Version Control)
```sql
CREATE TABLE content_versions (
    id BIGSERIAL PRIMARY KEY,
    content_translation_id BIGINT NOT NULL,
    version_number INTEGER NOT NULL,
    content_value TEXT NOT NULL,              -- Historical content
    change_reason VARCHAR(500),               -- Why was this changed?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    FOREIGN KEY (content_translation_id) REFERENCES content_translations(id) ON DELETE CASCADE,
    INDEX idx_content_translation (content_translation_id),
    INDEX idx_version (version_number)
);
```

### 7. Content Variables (Dynamic Content)
```sql
CREATE TABLE content_variables (
    id SERIAL PRIMARY KEY,
    variable_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'user_name', 'bank_name'
    variable_type VARCHAR(20) CHECK (variable_type IN ('string', 'number', 'date', 'boolean')) DEFAULT 'string',
    description TEXT,
    default_value VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_variable_key (variable_key)
);
```

### 8. Content Publications (Deployment Control)
```sql
CREATE TABLE content_publications (
    id BIGSERIAL PRIMARY KEY,
    publication_name VARCHAR(100) NOT NULL,   -- e.g., 'Production Release v1.2'
    environment VARCHAR(20) CHECK (environment IN ('development', 'staging', 'production')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'published', 'rolled_back')) DEFAULT 'pending',
    published_at TIMESTAMP NULL,
    published_by INTEGER,
    rollback_reason TEXT NULL,
    
    INDEX idx_environment (environment),
    INDEX idx_status (status),
    INDEX idx_published (published_at)
);
```

### 9. Content Publication Items (Published Content Tracking)
```sql
CREATE TABLE content_publication_items (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL,
    content_translation_id BIGINT NOT NULL,
    
    FOREIGN KEY (publication_id) REFERENCES content_publications(id) ON DELETE CASCADE,
    FOREIGN KEY (content_translation_id) REFERENCES content_translations(id) ON DELETE CASCADE,
    UNIQUE (publication_id, content_translation_id)
);
```

## Content Key Naming Convention

### Hierarchical Structure:
```
Format: {app_section}.{screen}.{component_type}.{specific_name}

Examples:
- app.login.button.sign_in
- app.login.placeholder.username
- app.login.header.welcome_message
- app.login.hint.password_requirements
- app.dashboard.dropdown.account_menu
- app.profile.button.save_changes
- app.errors.message.invalid_credentials
- app.notifications.text.success_message
- app.mortgage.step1.label.property_ownership
- app.mortgage.step1.dropdown.property_ownership_options
```

## Sample Data Structure

### Initial Languages Setup:
```sql
INSERT INTO languages (code, name, native_name, direction, is_default) VALUES
('en', 'English', 'English', 'ltr', false),
('he', 'Hebrew', 'עברית', 'rtl', false),
('ru', 'Russian', 'Русский', 'ltr', true);
```

### Sample Content Categories:
```sql
INSERT INTO content_categories (name, display_name, description) VALUES
('headers', 'Page Headers', 'Main headings and titles'),
('buttons', 'Button Labels', 'Text for clickable buttons'),
('placeholders', 'Input Placeholders', 'Placeholder text for form inputs'),
('hints', 'Help Text', 'Tooltips and help messages'),
('dropdowns', 'Dropdown Options', 'Options for select elements'),
('errors', 'Error Messages', 'Validation and error text'),
('notifications', 'Notifications', 'Success and info messages');
```

### Sample Content Items:
```sql
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('app.login.header.welcome', 'text', 'headers', 'login_page', 'header', 'Main welcome message on login page'),
('app.login.button.sign_in', 'text', 'buttons', 'login_page', 'button', 'Sign in button text'),
('app.login.placeholder.username', 'text', 'placeholders', 'login_page', 'placeholder', 'Username input placeholder'),
('app.login.hint.password_help', 'text', 'hints', 'login_page', 'hint', 'Password help text'),
('app.mortgage.step1.dropdown.property_ownership', 'json', 'dropdowns', 'mortgage_step1', 'dropdown', 'Property ownership dropdown options');
```

### Sample Translations:
```sql
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
(1, 'en', 'Welcome to Bankim Online Banking', false, 'approved'),
(1, 'he', 'ברוכים הבאים לבנקים הבנקאות המקוונת', false, 'approved'),
(1, 'ru', 'Добро пожаловать в Банким Онлайн-банкинг', true, 'approved'),
(2, 'en', 'Sign In', false, 'approved'),
(2, 'he', 'כניסה', false, 'approved'),
(2, 'ru', 'Войти', true, 'approved');
```

## Implementation Strategy

### Phase 1: Core Infrastructure & MVP ✅
**Goal:** Basic content management with hierarchical content keys and multi-language support

#### Database Setup

- [x] Implement core tables: content_items, content_translations, languages, admin_users, content_categories
- [x] Add proper indexes for performance optimization
- [x] Set up database connection pooling and health checks
- [x] Create database migration scripts

#### Content Key System
- [x] Implement hierarchical content key naming convention (app.section.component.name)
- [x] Create content categories and screen location mapping
- [x] Build content key validation and uniqueness checking
- [x] Add legacy translation key mapping for migration
- [x] Set up content key generation utilities

#### Basic API Layer
- [x] GET /api/content/:screen/:language - Get all content for specific screen
- [x] GET /api/content/:key/:language - Get specific content item with fallback
- [x] POST /api/content - Create new content item
- [x] PUT /api/content/:id - Update content item
- [x] DELETE /api/content/:id - Delete content item
- [x] GET /api/content/categories - Get content categories tree

#### Content Migration Tools
- [ ] Extract existing content from translation files (en/he/ru)
- [ ] Create mapping from existing translation keys to new hierarchical keys
- [ ] Build automated migration scripts
- [ ] Import existing content with proper categorization
- [ ] Validate migrated content completeness

#### Basic Admin Interface
- [ ] Content listing with category filtering
- [ ] Content creation/editing forms with validation
- [ ] Language selector with RTL support for Hebrew
- [ ] Basic search functionality by key/category
- [ ] Authentication integration with existing admin system

### Phase 2: Advanced Admin Features & Workflow
**Goal:** Full-featured admin panel with approval workflow and dropdown management

#### Enhanced Admin UI
- [ ] Content tree view organized by category/screen
- [ ] Inline editing capabilities with auto-save
- [ ] Bulk operations (select multiple, bulk edit, bulk translate)
- [ ] Advanced search and filtering (by status, category, screen, language)
- [ ] Content preview functionality showing actual UI context
- [ ] Rich text editor for HTML content types

#### Approval Workflow System
- [ ] Content status workflow (draft → review → approved → archived)
- [ ] User roles and permissions (super_admin, content_manager, translator, reviewer)
- [ ] Change tracking and audit logs with reasons
- [ ] Content approval notifications
- [ ] Pending changes dashboard
- [ ] Bulk approval operations

#### Dropdown Management
- [ ] Dropdown option creation/editing interface
- [ ] Drag-and-drop reordering functionality
- [ ] Option dependencies and conditional display
- [ ] Bulk option management operations
- [ ] Dropdown option validation and constraints

#### Translation Management
- [ ] Translation queue showing untranslated content
- [ ] Translation memory and reuse suggestions
- [ ] Character limits and UI constraint validation
- [ ] Context information for translators
- [ ] Translation progress tracking

### Phase 3: Versioning & Publishing System
**Goal:** Production-ready system with version control and deployment management

#### Content Versioning
- [ ] Implement content_versions table
- [ ] Version history tracking for all changes
- [ ] Content rollback functionality
- [ ] Version comparison views (diff interface)
- [ ] Change reason tracking and categorization
- [ ] Automated backup system

#### Publishing & Deployment
- [ ] Environment-specific content (development/staging/production)
- [ ] Content publishing workflow and approvals
- [ ] Rollback mechanisms for published content
- [ ] Publishing history and audit trails
- [ ] Scheduled publishing capabilities
- [ ] Content deployment validation

#### Advanced Content Features
- [ ] Content variables for dynamic content
- [ ] Content dependencies and relationships
- [ ] Content lifecycle management
- [ ] Content archiving and cleanup
- [ ] Template-based content creation

#### Import/Export System
- [ ] Content export to multiple formats (JSON, CSV, Excel)
- [ ] Content import with validation and conflict resolution
- [ ] Translation memory export/import
- [ ] Backup/restore functionality
- [ ] Migration utilities for system updates

### Phase 4: Performance & Frontend Integration
**Goal:** Optimized system fully integrated with existing application

#### Performance Optimization
- [ ] Redis caching for frequently accessed content
- [ ] Smart cache invalidation strategies
- [ ] Database query optimization and monitoring
- [ ] CDN integration for static content assets
- [ ] API response compression and pagination

#### Caching Strategy Implementation
- [ ] Content caching by screen and language
- [ ] Cache key format: content:{screen}:{language}
- [ ] TTL configuration (1 hour prod, 5 minutes dev)
- [ ] Cache warming for critical content
- [ ] Cache monitoring and metrics

#### Frontend Integration
- [ ] Replace hardcoded translation keys with API calls
- [ ] Implement content fallback mechanisms (language → default)
- [ ] Add content loading states and error handling
- [ ] Update build process for content validation
- [ ] Real-time content updates via WebSocket

#### API Performance
- [ ] Content retrieval optimization
- [ ] Fallback query patterns for missing translations
- [ ] Batch content loading for screens
- [ ] API response caching headers
- [ ] Content preloading strategies

### Phase 5: Enterprise Features & Analytics
**Goal:** Enterprise-grade content management with advanced analytics

#### Advanced Workflow Features
- [ ] Multi-step approval processes
- [ ] Content scheduling and automation
- [ ] Advanced content lifecycle management
- [ ] Translation workflow automation
- [ ] Content governance and compliance

#### Analytics & Reporting
- [ ] Content usage analytics and tracking
- [ ] Translation completion and progress metrics
- [ ] Performance metrics dashboard
- [ ] Content audit reports and compliance
- [ ] User activity tracking and analytics

#### Integration & Extensibility
- [ ] API documentation and SDK development
- [ ] Webhook system for content changes
- [ ] Third-party integration support
- [ ] Content synchronization tools
- [ ] Plugin architecture for extensions

#### Advanced Features
- [ ] A/B testing support for content variations
- [ ] Content personalization capabilities
- [ ] Advanced search with full-text indexing
- [ ] Content recommendation system
- [ ] Machine translation integration

## Success Criteria

### Phase 1 Success: ✅
- [x] Admin can create/edit/delete content items
- [x] Content is served from database instead of hardcoded files
- [x] Basic multi-language support working
- [x] Migration of existing content completed

### Phase 2 Success:
- [ ] Approval workflow functioning
- [ ] Bulk operations working
- [ ] Advanced search implemented
- [ ] Dropdown management fully functional

### Phase 3 Success:
- [ ] Content versioning and rollback working
- [ ] Publishing system operational
- [ ] Import/export functionality complete
- [ ] System ready for production use

### Phase 4 Success:
- [ ] Performance optimized with caching
- [ ] Frontend fully integrated
- [ ] Real-time updates working
- [ ] Production monitoring in place

### Phase 5 Success:
- [ ] Advanced workflow features operational
- [ ] Analytics and reporting functional
- [ ] Enterprise-grade features complete
- [ ] System scaling to handle growth

## Technology Stack Recommendations

### Backend API:
- **Node.js + Express** (existing stack)
- **PostgreSQL** (bankim_content database)
- **Redis** (caching layer)
- **JWT** (authentication)

### Admin Panel:
- **React + TypeScript** (consistent with existing frontend)
- **Material-UI** (consistent with existing design)
- **RTK Query** (API integration)
- **React DnD** (drag-and-drop functionality)

### Features to Implement:
1. **Rich Text Editor** - For content editing
2. **Live Preview** - See changes in real-time
3. **Bulk Operations** - Mass edit/update
4. **Search & Filter** - Find content quickly
5. **Change Tracking** - Audit trail
6. **Export/Import** - Content backup/restore
7. **API Documentation** - For developers

## Integration Points

### Frontend Integration:
- Replace hardcoded translation keys with API calls
- Implement content caching strategy
- Add fallback mechanisms for missing content
- Update build process to include content validation

### Existing System Integration:
- Integrate with current authentication system
- Use existing user roles and permissions
- Maintain compatibility with current translation system
- Preserve existing API structure where possible

## Performance Considerations

### Database Optimization:
- Index on `content_key`, `language_code`, `page_context`
- Implement database connection pooling
- Use read replicas for content serving
- Implement query optimization

### Caching Strategy:
- Redis for frequently accessed content
- CDN for static assets
- Application-level caching
- Invalidation strategies

### API Performance:
- Pagination for large datasets
- Compression for API responses
- Rate limiting for admin operations
- Batch operations for bulk updates

## Security Considerations

### Access Control:
- Role-based permissions (admin, editor, viewer)
- Content-level permissions
- API key authentication
- Rate limiting

### Data Protection:
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Content backup and recovery

## Conclusion

**Recommended Approach:** Option 1 (Hybrid Approach) provides the best balance of flexibility, performance, and maintainability for your specific needs. It offers:

- Strong typing and validation
- Excellent multilingual support
- Scalable architecture
- Change tracking and approval workflow
- Integration with existing systems

This approach will give you a robust content management system that can grow with your application while maintaining the flexibility needed for a dynamic banking/financial services platform.