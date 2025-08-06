# 🗄️ Database Configuration Guide

**Environment-based PostgreSQL configuration for Bankimonline application**

## 🏗️ Architecture Overview

The application uses a **dual database system** with environment-based configuration:

### **Development Environment**
- **Database**: Railway PostgreSQL (remote cloud database)
- **Connection**: Uses `CONTENT_DATABASE_URL` environment variable
- **URL Format**: `postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway`
- **SSL**: Enabled with `{ rejectUnauthorized: false }`
- **Usage**: Shared development database with existing data
- **Benefits**:
  - No local PostgreSQL installation needed
  - Shared data across dev team
  - Railway handles backups and maintenance

### **Production Environment**
- **Database**: Local PostgreSQL on production server
- **Connection**: `postgresql://postgres:postgres@localhost:5432/bankim_content`
- **Host**: localhost (same server)
- **SSL**: Disabled (local connection doesn't need SSL)
- **Usage**: Dedicated production database instance
- **Benefits**:
  - Better performance (no network latency)
  - Full control over database
  - No external dependencies

## 🔧 Configuration Logic

### **Environment Detection**
```javascript
const isProduction = process.env.NODE_ENV === 'production';
const isRailwayProduction = process.env.RAILWAY_ENVIRONMENT === 'production';

if (isProduction || isRailwayProduction) {
    // Use local PostgreSQL
} else {
    // Use Railway PostgreSQL
}
```

### **Database Connection Types**

#### **1. Content Database (`CONTENT_DATABASE_URL`)**
- **Purpose**: UI content and translations (primary)
- **Development**: Railway PostgreSQL
- **Production**: Local PostgreSQL

#### **2. Core Database (`DATABASE_URL`)**
- **Purpose**: Business logic, formulas, bank configurations
- **Development**: Railway PostgreSQL (different instance)
- **Production**: Local PostgreSQL

#### **3. Management Database (Future)**
- **Purpose**: Portal administrative data
- **Status**: Planned for future implementation

## 🚀 Environment Variables

### **Development Environment**
```bash
NODE_ENV=development
RAILWAY_ENVIRONMENT=development

# Content Database (Railway)
CONTENT_DATABASE_URL=postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway

# Core Database (Railway)
DATABASE_URL=postgresql://postgres:lqqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway
```

### **Production Environment**
```bash
NODE_ENV=production
RAILWAY_ENVIRONMENT=production

# Content Database (Local)
CONTENT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bankim_content

# Core Database (Local)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bankim_core
```

## 🔒 Security Configuration

### **Development (Railway)**
```javascript
{
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
}
```

### **Production (Local)**
```javascript
{
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: false
}
```

## 📊 Database Schema

### **Content Database Tables**
```sql
-- Content Items
content_items (
    id SERIAL PRIMARY KEY,
    content_key VARCHAR(255) UNIQUE,
    component_type VARCHAR(100),
    category VARCHAR(100),
    screen_location VARCHAR(100),
    status VARCHAR(50)
);

-- Content Translations
content_translations (
    id SERIAL PRIMARY KEY,
    content_item_id INTEGER REFERENCES content_items(id),
    language_code CHAR(2),
    content_value TEXT,
    status VARCHAR(50)
);
```

### **Core Database Tables**
```sql
-- User Management
clients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Banking Data
banking_standards (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(100),
    interest_rate DECIMAL(5,2),
    loan_terms JSONB
);
```

## 🛠️ Implementation Details

### **Connection Pool Configuration**
```javascript
const getDatabaseConfig = (connectionType = 'content') => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailwayProduction = process.env.RAILWAY_ENVIRONMENT === 'production';
    
    if (isProduction || isRailwayProduction) {
        return {
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bankim_content',
            ssl: false
        };
    } else {
        return {
            connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
            ssl: { rejectUnauthorized: false }
        };
    }
};
```

### **Health Check Endpoints**
- `/api/health` - Overall system health
- `/api/content-db/health` - Content database status
- `/api/main-db/health` - Core database status

## 🔄 Migration Strategy

### **Development to Production**
1. **Backup**: Export data from Railway databases
2. **Schema**: Create local PostgreSQL databases
3. **Import**: Restore data to local databases
4. **Environment**: Update environment variables
5. **Test**: Verify all connections work
6. **Deploy**: Update production environment

### **Rollback Plan**
1. **Immediate**: Revert environment variables
2. **Database**: Restore from backups
3. **Application**: Restart with old configuration

## 📈 Monitoring

### **Connection Monitoring**
```javascript
// Test connections on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Main Database connection failed:', err.message);
    } else {
        console.log('✅ Main Database connected:', res.rows[0].now);
    }
});
```

### **Health Checks**
- **Frequency**: Every 5 minutes
- **Timeout**: 30 seconds
- **Alert**: Log errors and send notifications

## 🚨 Troubleshooting

### **Common Issues**

#### **Connection Refused**
```bash
# Check if PostgreSQL is running
systemctl status postgresql

# Check port availability
netstat -tlnp | grep 5432
```

#### **SSL Certificate Issues**
```bash
# Development: Use rejectUnauthorized: false
# Production: Disable SSL for local connections
```

#### **Environment Variable Issues**
```bash
# Check environment variables
echo $NODE_ENV
echo $CONTENT_DATABASE_URL
echo $DATABASE_URL
```

### **Debug Commands**
```bash
# Test database connection
psql $CONTENT_DATABASE_URL -c "SELECT NOW();"

# Check application logs
tail -f /var/log/bankim-online/server.log

# Monitor database connections
SELECT * FROM pg_stat_activity WHERE datname = 'bankim_content';
```

## 📋 Checklist

### **Before Deployment**
- [ ] Environment variables configured
- [ ] Database connections tested
- [ ] SSL certificates valid (development)
- [ ] Local PostgreSQL installed (production)
- [ ] Database schemas created
- [ ] Data migrated (if applicable)
- [ ] Health checks implemented
- [ ] Monitoring configured

### **After Deployment**
- [ ] All endpoints responding
- [ ] Database connections stable
- [ ] Performance metrics normal
- [ ] Error logs clean
- [ ] Backup strategy working
- [ ] Rollback plan tested

---

**Last Updated**: January 2025  
**Version**: 2.0  
**Status**: Production Ready ✅ 