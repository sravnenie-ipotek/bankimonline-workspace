# Production Safeguards & Error Prevention

## 🚨 Critical: Database Authentication Failures

### Root Causes
1. **Stale Process State**: Server processes holding outdated database credentials
2. **Environment Variable Changes**: DATABASE_URL changes not picked up by running processes
3. **Connection Pool Exhaustion**: Old connections not properly closed
4. **SSL/TLS Misconfigurations**: Railway requires SSL, local dev might not

### Prevention Strategies

## 1. Environment Variable Management

### Development (.env file)
```bash
# Always use these exact Railway database URLs
DATABASE_URL=postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway

# Always require SSL for Railway connections
PGSSLMODE=require
```

### Production Environment
```bash
# Use environment-specific database URLs
DATABASE_URL=${PRODUCTION_DATABASE_URL}
CONTENT_DATABASE_URL=${PRODUCTION_CONTENT_DATABASE_URL}

# Production should use local PostgreSQL (no SSL)
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
```

## 2. Process Management

### Health Check Script
Create `server/health-check.js`:
```javascript
const { Pool } = require('pg');
const { getDatabaseConfig } = require('./config/database-core');

async function checkDatabases() {
    const mainConfig = getDatabaseConfig('main');
    const contentConfig = getDatabaseConfig('content');
    
    const mainPool = new Pool(mainConfig);
    const contentPool = new Pool(contentConfig);
    
    try {
        // Test main database
        const mainResult = await mainPool.query('SELECT NOW()');
        console.log('✅ Main DB: Connected');
        
        // Test content database
        const contentResult = await contentPool.query('SELECT NOW()');
        console.log('✅ Content DB: Connected');
        
        // Test critical tables
        await mainPool.query('SELECT COUNT(*) FROM banks');
        console.log('✅ Banks table: Accessible');
        
        await mainPool.query('SELECT COUNT(*) FROM banking_standards');
        console.log('✅ Banking standards: Accessible');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
    } finally {
        await mainPool.end();
        await contentPool.end();
    }
}

checkDatabases();
```

### Automatic Recovery Script
Create `server/auto-recover.sh`:
```bash
#!/bin/bash

# Function to check if server is healthy
check_health() {
    curl -s http://localhost:8003/api/server-mode > /dev/null 2>&1
    return $?
}

# Function to test database connection
test_database() {
    node server/health-check.js > /dev/null 2>&1
    return $?
}

# Main recovery logic
echo "🔍 Checking server health..."

if ! check_health; then
    echo "⚠️ Server not responding, attempting recovery..."
    
    # Kill existing processes
    pkill -f "server-db.js"
    sleep 2
    
    # Test database connectivity first
    if test_database; then
        echo "✅ Database connection OK"
        
        # Start server
        node server/server-db.js &
        sleep 3
        
        # Verify recovery
        if check_health; then
            echo "✅ Server recovered successfully"
        else
            echo "❌ Recovery failed - manual intervention required"
            exit 1
        fi
    else
        echo "❌ Database connection failed - check credentials"
        exit 1
    fi
else
    echo "✅ Server is healthy"
fi
```

## 3. Production Deployment Checklist

### Pre-Deployment
- [ ] Run health check: `node server/health-check.js`
- [ ] Verify environment variables: `node -e "console.log(process.env.DATABASE_URL)"`
- [ ] Test database migrations: `node test-railway-simple.js`
- [ ] Check SSL configuration: `node check-db-structure.js`

### Deployment Process
1. **Stop Old Server Gracefully**
   ```bash
   # Send SIGTERM for graceful shutdown
   kill -TERM $(pgrep -f server-db.js)
   sleep 5
   ```

2. **Verify Database Access**
   ```bash
   node server/health-check.js
   ```

3. **Start New Server with Monitoring**
   ```bash
   # Use PM2 for production
   pm2 start server/server-db.js --name bankapi --watch false
   pm2 save
   ```

4. **Verify Deployment**
   ```bash
   curl http://localhost:8003/api/server-mode
   curl -X POST http://localhost:8003/api/customer/compare-banks -d '{...}'
   ```

## 4. Monitoring & Alerting

### Error Logging Enhancement
Add to `server/server-db.js`:
```javascript
// Enhanced error logging for database issues
pool.on('error', (err) => {
    console.error('❌ Main Database Pool Error:', {
        message: err.message,
        code: err.code,
        timestamp: new Date().toISOString(),
        action: 'REQUIRES IMMEDIATE ATTENTION'
    });
    
    // Attempt automatic recovery
    if (err.code === '28P01' || err.message.includes('authentication')) {
        console.log('🔄 Attempting to reconnect...');
        // Trigger recovery script
        require('child_process').exec('./server/auto-recover.sh');
    }
});

// API endpoint for health monitoring
app.get('/api/health', async (req, res) => {
    try {
        const mainHealth = await pool.query('SELECT 1');
        const contentHealth = await contentPool.query('SELECT 1');
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            databases: {
                main: 'connected',
                content: 'connected'
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
```

### Monitoring Script (cron job)
Create `server/monitor.sh`:
```bash
#!/bin/bash

# Run every 5 minutes via cron
# */5 * * * * /path/to/server/monitor.sh

HEALTH_URL="http://localhost:8003/api/health"
LOG_FILE="/var/log/bankapi/health.log"
ALERT_EMAIL="devops@bankimonline.com"

# Check health
response=$(curl -s -w "\n%{http_code}" $HEALTH_URL)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

timestamp=$(date '+%Y-%m-%d %H:%M:%S')

if [ "$http_code" != "200" ]; then
    echo "[$timestamp] ALERT: Server unhealthy - HTTP $http_code" >> $LOG_FILE
    echo "Response: $body" >> $LOG_FILE
    
    # Send alert (example using mail command)
    echo "BankAPI Health Check Failed at $timestamp\n\nResponse: $body" | \
        mail -s "🚨 BankAPI Health Alert" $ALERT_EMAIL
    
    # Attempt auto-recovery
    /path/to/server/auto-recover.sh >> $LOG_FILE 2>&1
else
    echo "[$timestamp] OK: Server healthy" >> $LOG_FILE
fi
```

## 5. Database Connection Best Practices

### Connection Pool Configuration
```javascript
// config/database-core.js enhancements
const getPoolConfig = (connectionType) => {
    const baseConfig = getDatabaseConfig(connectionType);
    
    return {
        ...baseConfig,
        // Connection pool settings
        max: process.env.NODE_ENV === 'production' ? 20 : 10,
        min: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        
        // Retry logic
        retryDelay: 1000,
        retryLimit: 3,
        
        // Error handling
        error: (err, client) => {
            console.error('Pool error:', err);
            // Trigger recovery if needed
        },
        
        // Connection validation
        validateConnection: async (client) => {
            try {
                await client.query('SELECT 1');
                return true;
            } catch {
                return false;
            }
        }
    };
};
```

### Graceful Shutdown
```javascript
// server/server-db.js
process.on('SIGTERM', async () => {
    console.log('📋 SIGTERM received, closing connections gracefully...');
    
    server.close(() => {
        console.log('🔒 HTTP server closed');
    });
    
    await pool.end();
    console.log('🔒 Main database pool closed');
    
    await contentPool.end();
    console.log('🔒 Content database pool closed');
    
    process.exit(0);
});
```

## 6. Emergency Recovery Procedures

### When Database Authentication Fails

1. **Immediate Actions**
   ```bash
   # Check current processes
   ps aux | grep server-db
   
   # Check database connectivity
   PGPASSWORD=<password> psql -h <host> -U postgres -d railway -c "SELECT NOW();"
   
   # Check environment variables
   env | grep DATABASE_URL
   ```

2. **Recovery Steps**
   ```bash
   # Step 1: Kill stale processes
   pkill -f server-db.js
   
   # Step 2: Clear any port locks
   lsof -i :8003 | grep LISTEN | awk '{print $2}' | xargs kill -9
   
   # Step 3: Verify database access
   node server/health-check.js
   
   # Step 4: Restart server
   node server/server-db.js
   ```

3. **If Recovery Fails**
   - Check Railway dashboard for database status
   - Verify database credentials haven't changed
   - Check SSL/TLS requirements
   - Review recent deployments for breaking changes
   - Contact Railway support if database is down

## 7. Testing Strategy

### Integration Tests for Database Connections
Create `tests/database-connection.test.js`:
```javascript
const { Pool } = require('pg');
const { getDatabaseConfig } = require('../server/config/database-core');

describe('Database Connections', () => {
    test('Main database connects successfully', async () => {
        const config = getDatabaseConfig('main');
        const pool = new Pool(config);
        
        try {
            const result = await pool.query('SELECT NOW()');
            expect(result.rows).toBeDefined();
        } finally {
            await pool.end();
        }
    });
    
    test('Content database connects successfully', async () => {
        const config = getDatabaseConfig('content');
        const pool = new Pool(config);
        
        try {
            const result = await pool.query('SELECT NOW()');
            expect(result.rows).toBeDefined();
        } finally {
            await pool.end();
        }
    });
    
    test('Critical endpoints respond', async () => {
        const endpoints = [
            '/api/server-mode',
            '/api/health',
            '/api/v1/banks'
        ];
        
        for (const endpoint of endpoints) {
            const response = await fetch(`http://localhost:8003${endpoint}`);
            expect(response.status).toBe(200);
        }
    });
});
```

## 8. Documentation & Training

### Team Knowledge Base
- Document all database connection strings
- Maintain recovery runbooks
- Record all incidents and resolutions
- Regular training on error recovery procedures

### Incident Response Template
```markdown
## Incident: Database Authentication Failure

**Date**: [YYYY-MM-DD HH:MM]
**Severity**: Critical
**Duration**: [XX minutes]

### Symptoms
- [ ] API returns 500 errors
- [ ] "password authentication failed" in logs
- [ ] Database pool errors

### Root Cause
[Describe the actual cause]

### Resolution Steps
1. [Step taken]
2. [Step taken]
3. [Step taken]

### Prevention
[What will prevent this in future]

### Lessons Learned
[Key takeaways]
```

## Summary

By implementing these safeguards, you can prevent and quickly recover from database authentication failures:

1. **Proactive Monitoring**: Health checks every 5 minutes
2. **Automatic Recovery**: Self-healing scripts
3. **Graceful Degradation**: Fallback mechanisms
4. **Clear Documentation**: Runbooks and procedures
5. **Testing Coverage**: Integration tests for connections
6. **Alert System**: Immediate notification of issues

Remember: The key to production stability is **prevention**, **detection**, and **rapid recovery**.