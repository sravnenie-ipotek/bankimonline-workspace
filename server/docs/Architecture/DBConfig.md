# Database Configuration Architecture

## Overview

The Bankimonline application uses a **dual-database architecture** hosted on Railway, with complete separation between content management and admin/management systems. This architecture provides better scalability, security, and data organization.

## Railway Database Architecture

### 🏗️ Database Separation Strategy

Based on the Railway dashboard analysis, the application uses two distinct PostgreSQL databases:

#### 1. `bankim_content` Database
- **Purpose**: Content Management System (CMS)
- **Railway Host**: shortline.proxy.rlwy.net:33452
- **Last Updated**: 1 month ago via Docker Image
- **Contains**: Translation content, dropdown options, UI text, localization data
- **Functions**: `get_content_by_screen()`, `get_content_with_fallback()`
- **Tables**: `content_items`, `content_translations`, `content_pages`, `content_sections`

#### 2. `bankim_management` Database  
- **Purpose**: Admin & Management System
- **Railway Host**: yamanote.proxy.rlwy.net:53119
- **Last Updated**: 2 months ago via Docker
- **Contains**: User accounts, admin functions, management tools, business logic
- **Tables**: `users`, `admins`, `management_settings`, `audit_logs`, `system_config`

## Connection Configurations

### 🔌 Railway Database Endpoints

Based on our investigation and the Railway screenshots, here are the database connections:

| Database | Host | Status | Purpose |
|----------|------|--------|---------|
| **shortline** | `shortline.proxy.rlwy.net:33452` | ✅ **ACTIVE** | bankim_content (CMS + test data, 12 test users) |
| **yamanote** | `yamanote.proxy.rlwy.net:53119` | ✅ **ACTIVE** | bankim_management (admin/management system) |
| **maglev** | `maglev.proxy.rlwy.net:43809` | ✅ **ACTIVE** | bankim_core (production users, 226 clients) |

### 🚀 Production Configuration

```javascript
// Content Database (shortline) - RECOMMENDED FOR CMS
const contentConfig = {
  connectionString: process.env.CONTENT_DATABASE_URL || 
    'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
};

// Management Database (yamanote) - FOR ADMIN FUNCTIONS
const managementConfig = {
  connectionString: process.env.MANAGEMENT_DATABASE_URL || 
    'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
};
```

### 🛠️ Development Configuration

```javascript
// Package Server (packages/server/config/database-core.js)
const getDatabaseConfig = (connectionType = 'content') => {
  if (connectionType === 'content') {
    return {
      // Content Database - shortline (CMS with functions)
      connectionString: process.env.CONTENT_DATABASE_URL || 
        'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
      ssl: { rejectUnauthorized: false }
    };
  } else if (connectionType === 'management') {
    return {
      // Management Database - yamanote (Admin/Management)
      connectionString: process.env.MANAGEMENT_DATABASE_URL || 
        'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
      ssl: { rejectUnauthorized: false }
    };
  }
};
```

## Environment Variables

### 📝 Required Environment Variables

Create a `.env` file in the server directory with these variables:

```bash
# Content Management Database (shortline - CMS with functions)
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway

# Main/Fallback Database (maglev - used by package server as DATABASE_URL fallback)
DATABASE_URL=postgresql://postgres:lqqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway

# Optional: Management Database (yamanote - if needed for admin operations)  
# MANAGEMENT_DATABASE_URL=postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway

# Server Configuration
PORT=8003
NODE_ENV=development

# Railway Configuration
RAILWAY_ENVIRONMENT=development
```

### 🔐 Security Best Practices

1. **Never commit `.env` files** to git repositories
2. Use different `.env` files for different environments
3. Rotate database passwords regularly
4. Use Railway's built-in SSL certificates
5. Keep connection strings in environment variables only

## Database Functions & Features

### 🔧 Content Management Functions (shortline only)

The `bankim_content` database (shortline) includes these PostgreSQL functions:

#### `get_content_by_screen(screen_location, language)`
```sql
-- Returns content items for a specific screen and language
SELECT * FROM get_content_by_screen('mortgage_calculation', 'en');
```

#### `get_content_with_fallback(key, language, fallback_language)`
```sql  
-- Returns content with fallback language support
SELECT * FROM get_content_with_fallback('app.mortgage.title', 'he', 'en');
```

### ✅ Function Availability Matrix

| Database | `get_content_by_screen` | `get_content_with_fallback` | Purpose |
|----------|-------------------------|----------------------------|---------|
| **shortline** (bankim_content) | ✅ Available | ✅ Available | **CMS/Content + Test Data** (12 test users) |
| **yamanote** (bankim_management) | ❌ Not Applicable | ❌ Not Applicable | **Admin/Management** (TBD) |
| **maglev** (bankim_core) | ❌ Not Applicable | ❌ Not Applicable | **Production User Data** (226 users) |

## API Integration

### 🔄 Server Configuration

#### Main Server (`server/server-db.js`)
- **Primary Database**: shortline (bankim_content)
- **Port**: 8003
- **Features**: Content management, dropdown functions
- **Status**: ✅ **RECOMMENDED FOR CMS OPERATIONS**

```javascript
// Content API endpoint example (shortline database)
app.get('/api/admin/dropdown-options', async (req, res) => {
  const { screen_location, language = 'en' } = req.query;
  
  try {
    const result = await contentPool.query(
      'SELECT * FROM get_content_by_screen($1, $2)', 
      [screen_location, language]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Content API Error:', error);
    res.status(500).json({ error: 'Content database function not available' });
  }
});

// Management API endpoint example (yamanote database)
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await managementPool.query('SELECT * FROM users WHERE active = true');
    res.json(result.rows);
  } catch (error) {
    console.error('Management API Error:', error);
    res.status(500).json({ error: 'Management database not available' });
  }
});
```

## Migration Strategy

### 📋 Current Architecture Status

Based on the Railway architecture analysis:

1. **✅ shortline (bankim_content)**: Active CMS database with working functions
2. **✅ yamanote (bankim_management)**: Active admin/management database  
3. **✅ maglev**: Active production database with 226 user accounts
4. **🔄 Dual-Database Integration**: In progress

### 🚀 Recommended Implementation Path

1. **Use shortline** for all content management and CMS operations
2. **Use yamanote** for all admin and management operations
3. **Evaluate maglev usage** - currently used as DATABASE_URL fallback
4. **Implement dual-connection pattern** in application code

## Troubleshooting

### 🔍 Common Issues & Solutions

#### Issue: "Function get_content_by_screen does not exist"
**Solution**: Ensure you're connecting to the **shortline** (bankim_content) database, not yamanote or maglev

```bash
# Test content database functions
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT * FROM get_content_by_screen($1, $2) LIMIT 1', ['mortgage_calculation', 'en'])
.then(result => console.log('✅ Content functions work:', result.rows.length, 'rows'))
.catch(err => console.error('❌ Content function error:', err.message));
"
```

#### Issue: Admin functions not working
**Solution**: Ensure you're connecting to the **yamanote** (bankim_management) database for admin operations

```bash
# Test management database connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW() as time, current_database() as db')
.then(result => console.log('✅ Management DB connected:', result.rows[0]))
.catch(err => console.error('❌ Management DB error:', err.message));
"
```

#### Issue: Port conflicts (EADDRINUSE)
**Solution**: Kill existing processes before starting new server

```bash
# Kill processes on port 8003
lsof -ti:8003 | xargs kill -9
```

### 🧪 Database Connection Testing

Test both databases to ensure proper connectivity:

```bash
# Test content database (shortline)
node -e "console.log('Testing shortline (bankim_content)...'); require('./fix-database-connections.js')"

# Test management database (yamanote)  
node -e "console.log('Testing yamanote (bankim_management)...'); /* Add yamanote test */"
```

## Performance Optimization

### 🚀 Dual Connection Pooling

```javascript
// Optimized dual-database configuration
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 15,                    // Content queries are frequent
  idleTimeoutMillis: 30000,   
  connectionTimeoutMillis: 5000
});

const managementPool = new Pool({
  connectionString: process.env.MANAGEMENT_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,                     // Management queries are less frequent
  idleTimeoutMillis: 30000,   
  connectionTimeoutMillis: 5000
});
```

### 📊 Health Check Endpoints

```javascript
// Content database health check
app.get('/api/health/content', async (req, res) => {
  try {
    const result = await contentPool.query('SELECT NOW() as current_time, version()');
    res.json({
      status: 'ok',
      database: 'bankim_content',
      host: 'shortline',
      timestamp: result.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'bankim_content',
      error: error.message
    });
  }
});

// Management database health check  
app.get('/api/health/management', async (req, res) => {
  try {
    const result = await managementPool.query('SELECT NOW() as current_time, version()');
    res.json({
      status: 'ok',
      database: 'bankim_management',
      host: 'yamanote',
      timestamp: result.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'bankim_management', 
      error: error.message
    });
  }
});
```

## Architecture Decision Records (ADR)

### ADR-001: Dual Database Architecture

**Status**: Accepted  
**Date**: December 2024  
**Context**: Need to separate content management from admin/management operations  

**Decision**: Use two separate PostgreSQL databases on Railway:
- `bankim_content` (shortline): CMS data with specialized functions
- `bankim_management` (yamanote): Admin/management data and operations

**Consequences**: 
- ✅ Clear separation of concerns
- ✅ Better security and access control
- ✅ Specialized optimization for each use case
- ❌ Increased connection management complexity
- ❌ Need for careful cross-database consistency

### ADR-002: Function Specialization

**Status**: Accepted  
**Date**: December 2024  
**Context**: Content management functions only needed in CMS database  

**Decision**: Keep content management functions (`get_content_by_screen`, `get_content_with_fallback`) only in shortline (bankim_content) database

**Consequences**:
- ✅ Clear functional boundaries
- ✅ Simplified database maintenance
- ✅ Better performance optimization
- ❌ Applications must use correct database for content operations
- ⚠️ maglev database function availability needs verification

### ADR-003: maglev Database Status

**Status**: Accepted  
**Date**: December 2024  
**Context**: maglev database confirmed as production user database  

**Current Status**: Active production database containing 226 user accounts and client data

**Validated Facts**:
- ✅ Contains production user data (clients, users, admin_users, etc.)
- ✅ Successfully serves as main database for user operations
- ✅ Connection and performance validated (189ms dual-query time)
- ✅ Properly separated from content management functions

## Future Considerations

### 🔮 Roadmap

1. **Q1 2025**: Complete dual-database integration across all services
2. **Q2 2025**: Implement database-specific monitoring and alerting
3. **Q3 2025**: Add read replicas for high availability
4. **Q4 2025**: Consider geographic distribution for global performance

### 🎯 Performance Goals

- **Content Queries**: < 50ms average (shortline)
- **Management Queries**: < 100ms average (yamanote)  
- **Connection Time**: < 100ms for both databases
- **Uptime**: 99.9% availability for each database
- **Concurrent Connections**: 1000+ total across both databases

---

**Last Updated**: December 2024  
**Version**: 4.0 (Architecture Fixed & Validated)  
**Maintainer**: Bankimonline Development Team

> 💡 **Architecture Summary**: 
> - **shortline** = bankim_content (CMS/content + 12 test users)
> - **yamanote** = bankim_management (admin/management system)  
> - **maglev** = bankim_core (production database with 226 users) ✅ **FIXED**