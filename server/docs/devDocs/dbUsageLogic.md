# =Ä Database Usage Logic - BankimOnline

**Database Architecture & Environment-Based Configuration**

---

## =Ë Overview

This document outlines the database usage strategy for the BankimOnline application, which uses different database configurations based on the deployment environment:

- **Development**: Railway PostgreSQL (cloud-hosted)
- **Production**: Local PostgreSQL (server-hosted)

---

## <× Architecture

### Database Structure
The application uses a **dual-database architecture**:

1. **Main Database** (`pool`) - Core business data
   - User accounts, authentication
   - Bank information, loan calculations
   - Client data, applications, transactions

2. **Content Database** (`contentPool`) - Content management
   - Multi-language translations (English, Hebrew, Russian)
   - UI content, validation messages
   - Dynamic content for forms and components

### Connection Configuration
Located in `/server/server-db.js` - `getDatabaseConfig()` function:

```javascript
const getDatabaseConfig = (connectionType = 'main') => {
    if (process.env.NODE_ENV === 'production') {
        // Production: Local PostgreSQL on server
        return {
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bankim_content',
            ssl: false // Local connections don't need SSL
        };
    } else {
        // Development: Railway PostgreSQL
        if (connectionType === 'content') {
            return {
                connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
                ssl: { rejectUnauthorized: false }
            };
        } else {
            return {
                connectionString: process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
                ssl: { rejectUnauthorized: false }
            };
        }
    }
};
```

---

## =à Development Environment

### Railway PostgreSQL Configuration

**Current Working Credentials** (as of August 2025):
```bash
# Both databases use the same Railway instance
DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
```

### Features:
-  **Cloud-hosted**: No local PostgreSQL installation required
-  **SSL Required**: Secure connections with `{ rejectUnauthorized: false }`
-  **Shared Instance**: Both main and content databases use the same Railway database
-  **Remote Access**: Accessible from any development machine
-  **Automatic Backups**: Railway handles database backups
-  **Scalable**: Railway manages performance and scaling

### Connection Pool Setup:
```javascript
// Main database connection (Core Database)
const pool = new Pool(getDatabaseConfig('main'));

// Content database connection (Content/Translations)
const contentPool = new Pool(getDatabaseConfig('content'));
```

---

## =€ Production Environment

### Local PostgreSQL Configuration

**Production Setup**:
```bash
# Production uses local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bankim_content
NODE_ENV=production
```

### Features:
- = **Security**: Database isolated on production server
- ¡ **Performance**: No network latency for database queries
- =¾ **Control**: Full control over database configuration and backups
- =á **Compliance**: Meets banking security requirements
- =Ê **Monitoring**: Direct access for performance monitoring
- =° **Cost-Effective**: No external database hosting costs

### Production Requirements:
1. **PostgreSQL Installation**: Local PostgreSQL server must be installed and configured
2. **Database Creation**: `bankim_content` database must exist
3. **User Permissions**: `postgres` user with appropriate permissions
4. **SSL Disabled**: Local connections don't require SSL
5. **Firewall Configuration**: Database port (5432) should not be exposed externally

---

## =' Environment Detection

The application automatically detects the environment using `NODE_ENV`:

```javascript
if (process.env.NODE_ENV === 'production') {
    // Use local PostgreSQL
    console.log('=€ Production environment detected - using local PostgreSQL');
} else {
    // Use Railway PostgreSQL
    console.log('=à Development environment detected - using Railway PostgreSQL');
}
```

---

## =Ê Database Schema

### Core Tables (Main Database):
- `users` - Admin/staff accounts (email authentication)
- `clients` - Customer accounts (SMS authentication)
- `banks` - Israeli bank information
- `banking_standards` - Bank configuration and rates
- `loan_calculations` - Mortgage/credit calculations
- `client_applications` - Loan applications
- `client_credit_history` - Credit history tracking
- `cities` - Location data for Israel

### Content Tables (Content Database):
- `content_items` - Content structure and metadata
- `content_translations` - Multi-language translations
- `content_pages` - Page-based content organization
- `content_sections` - Section-based content grouping
- `locales` - Legacy translation support

---

## = Security Considerations

### Development (Railway):
-  SSL/TLS encryption for all connections
-  Network-level security managed by Railway
-  Access control through connection strings
-   Credentials in code (fallback only - use environment variables)

### Production (Local):
-  Database isolated on production server
-  No external network access to database
-  Local firewall protection
-  Direct server access control
- = SSL not required for localhost connections

---

## =¨ Connection Troubleshooting

### Common Development Issues:

1. **"password authentication failed"**
   - Check Railway credentials are up-to-date
   - Verify environment variables are set correctly
   - Confirm Railway database is accessible

2. **"connection refused" / "ECONNRESET"**
   - Railway database may be sleeping (try reconnecting)
   - Check network connectivity
   - Verify Railway service status

3. **SSL certificate errors**
   - Ensure `ssl: { rejectUnauthorized: false }` is set
   - Railway requires SSL for external connections

### Development Connection Test:
```bash
# Test main database
DATABASE_URL="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway" node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT NOW()').then(r => console.log(' Connected:', r.rows[0])).catch(e => console.log('L Failed:', e.message)).finally(() => pool.end());
"
```

### Common Production Issues:

1. **PostgreSQL not installed**
   - Install PostgreSQL: `sudo apt-get install postgresql postgresql-contrib`
   - Create database: `createdb bankim_content`

2. **Permission denied**
   - Check PostgreSQL user permissions
   - Verify database ownership: `ALTER DATABASE bankim_content OWNER TO postgres;`

3. **Connection refused**
   - Start PostgreSQL service: `sudo systemctl start postgresql`
   - Check PostgreSQL is listening: `sudo netstat -plntu | grep 5432`

### Production Connection Test:
```bash
# Test local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bankim_content" node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(r => console.log(' Connected:', r.rows[0])).catch(e => console.log('L Failed:', e.message)).finally(() => pool.end());
"
```

---

## =È Performance Optimization

### Development:
- Connection pooling with Railway limits
- Query caching for content database
- Lazy loading for non-critical data

### Production:
- Optimized local connection pooling
- Database-specific performance tuning
- Query optimization and indexing
- Connection monitoring and alerting

---

## = Migration Strategy

### Development to Production Migration:
1. **Database Export**: Export Railway database schema and data
2. **Local Import**: Import into local PostgreSQL
3. **Environment Configuration**: Set `NODE_ENV=production`
4. **Connection Testing**: Verify all endpoints work with local database
5. **Performance Testing**: Validate query performance on production hardware

### Backup Strategy:
- **Development**: Railway automatic backups
- **Production**: Custom backup scripts with local storage

---

## <¯ Best Practices

### Environment Variables:
```bash
# Development .env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@host:port/railway
CONTENT_DATABASE_URL=postgresql://postgres:password@host:port/railway

# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bankim_content
```

### Code Practices:
1. **Always use environment detection** - Never hardcode environment assumptions
2. **Fallback credentials** - Provide fallback connection strings for development
3. **Error handling** - Implement proper connection error handling
4. **Connection pooling** - Use connection pools for performance
5. **SSL configuration** - Environment-appropriate SSL settings

---

## =Ú Related Documentation

- [Railway Deployment Guide](../tasks/deployToSSH.md)
- [Database Configuration](../../packages/server/DATABASE_CONFIG.md)
- [Local Development Setup](../startProj.md)
- [Production Deployment](../../../DEPLOYMENT_GUIDE.md)

---

**Last Updated**: August 2025  
**Environment**: Development (Railway) ’ Production (Local PostgreSQL)  
**Database Version**: PostgreSQL 13+