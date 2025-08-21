# 🐘 PostgreSQL Setup for SSH Server 45.83.42.74

## Overview
Complete PostgreSQL database setup for the banking application on SSH server, replacing Railway cloud databases with local PostgreSQL for better performance and reliability.

## What We Built

### 1. **PostgreSQL Installation Script** (`setup-postgresql-ssh.sh`)
A comprehensive 11-phase installation script that:
- **Phase 1**: Checks SSH connectivity
- **Phase 2**: System preparation and prerequisites
- **Phase 3**: PostgreSQL 14 installation
- **Phase 4**: Creates 3 databases (bankim_core, bankim_content, bankim_management)
- **Phase 5**: Production-optimized PostgreSQL configuration
- **Phase 6**: Complete schema migration (all tables, indexes, constraints)
- **Phase 7**: Seeds initial data (banks, cities, dropdowns, LTV ratios)
- **Phase 8**: Creates production environment file
- **Phase 9**: Sets up automated daily backups
- **Phase 10**: Performance tuning and monitoring
- **Phase 11**: Tests database connections

### 2. **Data Migration Script** (`migrate-railway-to-local.sh`)
Migrates data from Railway to local PostgreSQL:
- Exports data from Railway Maglev database (working)
- Handles Shortline timeout with fallback data
- Imports all data to SSH server PostgreSQL
- Creates LTV calculation functions
- Validates data integrity

### 3. **Deployment Script Update** (`deploy-to-ssh.sh`)
Updated deployment script to use local PostgreSQL instead of Railway

## Database Architecture

### Three Databases Created:

#### 1. **bankim_core** (Main Application Data)
```sql
- users (staff/admin accounts)
- clients (customer accounts)
- banks (Israeli banks)
- cities (location data)
- loan_calculations
- banking_standards
```

#### 2. **bankim_content** (Content Management)
```sql
- dropdown_configs (JSONB dropdowns)
- content_items
- content_translations
- locales (legacy translations)
```

#### 3. **bankim_management** (Audit & Settings)
```sql
- audit_logs
- system_settings (LTV ratios, interest rates)
```

## Critical Banking Features

### LTV Ratio Functions
```sql
calculate_ltv_ratio('no_property')     → 75%
calculate_ltv_ratio('has_property')    → 50%
calculate_ltv_ratio('selling_property') → 70%
```

### Dropdown Data (JSONB)
All critical dropdowns with fallback data:
- Property ownership (3 languages: en/he/ru)
- Cities
- Marital status
- Employment status
- Loan purposes

## Performance Optimizations

### PostgreSQL Configuration:
- **Memory**: 512MB shared buffers, 1.5GB cache
- **Connections**: 200 max, connection pooling
- **Logging**: Slow query logging (>1 second)
- **Backup**: Daily automated backups at 2 AM
- **Monitoring**: Health check script included

### Connection Pool Settings:
```env
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=10000
DB_CONNECTION_TIMEOUT=2000
```

## Security Features

1. **Database User**: Separate `bankim` user (not postgres)
2. **Password**: Auto-generated 25-character secure password
3. **Access Control**: localhost only, no external connections
4. **Backup Encryption**: Ready for encryption setup
5. **Audit Logging**: All changes tracked in audit_logs table

## How to Deploy

### Step 1: Configure SSH Key
```bash
# Add your SSH key to the server
ssh-copy-id root@45.83.42.74
```

### Step 2: Install PostgreSQL
```bash
./setup-postgresql-ssh.sh
# This will:
# - Install PostgreSQL 14
# - Create all databases
# - Set up schema
# - Configure for production
# - Save credentials in /var/www/bankim/shared/.env.production
```

### Step 3: Migrate Data
```bash
./migrate-railway-to-local.sh
# This will:
# - Export from Railway (if accessible)
# - Use fallback data for timeouts
# - Import to SSH server
# - Create calculation functions
```

### Step 4: Deploy Application
```bash
./deploy-to-ssh.sh
# This will:
# - Deploy code with blue-green strategy
# - Run health checks
# - Use local PostgreSQL
# - Zero-downtime deployment
```

## Monitoring Commands

### Check Database Health
```bash
ssh root@45.83.42.74 '/usr/local/bin/check-db-health.sh'
```

### View Application Logs
```bash
ssh root@45.83.42.74 'pm2 logs bankim-api'
```

### Manual Backup
```bash
ssh root@45.83.42.74 '/usr/local/bin/backup-bankim-db.sh'
```

### Database Connection Test
```bash
ssh root@45.83.42.74 'cd /var/www/bankim/current && node test-railway-simple.js'
```

## Advantages Over Railway

| Feature | Railway (Cloud) | Local PostgreSQL |
|---------|----------------|------------------|
| **Latency** | 30-100ms | <1ms |
| **Reliability** | Timeouts, sleeping DBs | Always available |
| **Cost** | Monthly fees | Free (server cost only) |
| **Control** | Limited | Full control |
| **Backup** | Manual | Automated daily |
| **Performance** | Shared resources | Dedicated resources |
| **Debugging** | Limited access | Full access to logs |

## Troubleshooting

### If PostgreSQL won't start:
```bash
ssh root@45.83.42.74 'systemctl status postgresql'
ssh root@45.83.42.74 'journalctl -xe | grep postgres'
```

### If connection fails:
```bash
# Check credentials
ssh root@45.83.42.74 'cat /var/www/bankim/shared/.env.production | grep DB_'

# Test connection
ssh root@45.83.42.74 'psql -U bankim -h localhost -d bankim_core -c "SELECT NOW();"'
```

### If dropdowns are empty:
```bash
# Re-import fallback data
ssh root@45.83.42.74 'psql -U bankim -h localhost -d bankim_content -f /tmp/dropdown_configs_fallback.sql'
```

## Next Steps

1. **Configure SSH keys** for passwordless deployment
2. **Run setup script** to install PostgreSQL
3. **Migrate data** from Railway or use fallback
4. **Deploy application** with new database
5. **Monitor performance** and adjust settings
6. **Set up SSL** for HTTPS (optional)
7. **Configure firewall** rules (recommended)

## Important Files

- **Database Credentials**: `/var/www/bankim/shared/.env.production`
- **PostgreSQL Config**: `/etc/postgresql/14/main/postgresql.conf`
- **Backup Script**: `/usr/local/bin/backup-bankim-db.sh`
- **Health Check**: `/usr/local/bin/check-db-health.sh`
- **Backups Location**: `/var/backups/postgresql/`

## Success Metrics

When everything is working correctly:
- ✅ API health endpoint returns 200
- ✅ Dropdowns have data (not empty arrays)
- ✅ LTV calculations return correct percentages
- ✅ Database connections < 5ms
- ✅ No timeout errors in logs
- ✅ PM2 shows "online" status

## Support

If you encounter issues:
1. Check the logs: `pm2 logs bankim-api`
2. Verify database: `check-db-health.sh`
3. Test connections: `test-railway-simple.js`
4. Review this documentation

The system is now ready for production deployment with local PostgreSQL!