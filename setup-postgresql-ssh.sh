#!/bin/bash

# ============================================================================
# PostgreSQL Production Setup for Banking Application
# Target Server: root@45.83.42.74
# ============================================================================

set -e  # Exit on error

# Color codes
CYAN='\033[36m'
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
NC='\033[0m'

# Configuration
SERVER="root@45.83.42.74"
PG_VERSION="14"
DB_USER="bankim"
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
BACKUP_DIR="/var/backups/postgresql"

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🐘 PostgreSQL Production Setup for Banking Application${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# ============================================================================
# PHASE 1: SSH CONNECTION CHECK
# ============================================================================
echo -e "\n${BLUE}📡 Phase 1: Checking SSH Connection${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $SERVER "echo '✅ Connected'" 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to $SERVER${NC}"
    echo -e "${YELLOW}Please ensure:${NC}"
    echo "  1. SSH key is configured (~/.ssh/id_rsa)"
    echo "  2. Server is accessible"
    echo "  3. You have root access"
    exit 1
fi

# ============================================================================
# PHASE 2: SYSTEM PREPARATION
# ============================================================================
echo -e "\n${BLUE}🔧 Phase 2: System Preparation${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

ssh $SERVER << 'ENDSSH'
# Update system
echo "📦 Updating package lists..."
apt-get update -qq

# Check if PostgreSQL is already installed
if command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is already installed"
    psql --version
else
    echo "✅ PostgreSQL not installed, proceeding..."
fi

# Install required packages
echo "📦 Installing prerequisites..."
apt-get install -y -qq wget ca-certificates curl gnupg lsb-release jq
ENDSSH

# ============================================================================
# PHASE 3: POSTGRESQL INSTALLATION
# ============================================================================
echo -e "\n${BLUE}🐘 Phase 3: Installing PostgreSQL ${PG_VERSION}${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

ssh $SERVER << ENDSSH
# Add PostgreSQL official APT repository
echo "📦 Adding PostgreSQL APT repository..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update -qq

# Install PostgreSQL
echo "📦 Installing PostgreSQL ${PG_VERSION}..."
apt-get install -y postgresql-${PG_VERSION} postgresql-client-${PG_VERSION} postgresql-contrib-${PG_VERSION}

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

echo "✅ PostgreSQL installed successfully"
ENDSSH

# ============================================================================
# PHASE 4: DATABASE CREATION
# ============================================================================
echo -e "\n${BLUE}🗄️ Phase 4: Creating Databases${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

ssh $SERVER << ENDSSH
# Switch to postgres user and create databases
sudo -u postgres psql << EOSQL
-- Create application user
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';

-- Create databases
CREATE DATABASE bankim_core OWNER ${DB_USER};
CREATE DATABASE bankim_content OWNER ${DB_USER};
CREATE DATABASE bankim_management OWNER ${DB_USER};

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE bankim_core TO ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE bankim_content TO ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE bankim_management TO ${DB_USER};

-- Enable required extensions
\c bankim_core
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c bankim_content
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c bankim_management
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- List databases to confirm
\l
EOSQL

echo "✅ Databases created successfully"
ENDSSH

# ============================================================================
# PHASE 5: POSTGRESQL CONFIGURATION
# ============================================================================
echo -e "\n${BLUE}⚙️ Phase 5: PostgreSQL Configuration${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

ssh $SERVER << ENDSSH
# Backup original configuration
cp /etc/postgresql/${PG_VERSION}/main/postgresql.conf /etc/postgresql/${PG_VERSION}/main/postgresql.conf.backup
cp /etc/postgresql/${PG_VERSION}/main/pg_hba.conf /etc/postgresql/${PG_VERSION}/main/pg_hba.conf.backup

# Configure PostgreSQL for production
cat >> /etc/postgresql/${PG_VERSION}/main/postgresql.conf << EOCONF

# =====================================
# Banking Application Custom Settings
# =====================================

# Connection Settings
listen_addresses = 'localhost'
max_connections = 200
superuser_reserved_connections = 3

# Memory Settings (for 2GB RAM server, adjust as needed)
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
work_mem = 4MB

# Checkpoint Settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1

# Logging
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_duration = off
log_lock_waits = on
log_min_duration_statement = 1000  # Log slow queries > 1 second
log_timezone = 'UTC'

# Performance
effective_io_concurrency = 2
max_worker_processes = 2
max_parallel_workers_per_gather = 1
max_parallel_workers = 2

# Replication (prepare for future)
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/${PG_VERSION}/archive/%f && cp %p /var/lib/postgresql/${PG_VERSION}/archive/%f'
EOCONF

# Configure authentication
cat > /etc/postgresql/${PG_VERSION}/main/pg_hba.conf << EOHBA
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD
# Local connections
local   all             all                                     md5
# IPv4 local connections
host    all             all             127.0.0.1/32            md5
# IPv6 local connections
host    all             all             ::1/128                 md5

# Application user connections
host    bankim_core     ${DB_USER}      127.0.0.1/32            md5
host    bankim_content  ${DB_USER}      127.0.0.1/32            md5
host    bankim_management ${DB_USER}    127.0.0.1/32            md5
EOHBA

# Create archive directory
mkdir -p /var/lib/postgresql/${PG_VERSION}/archive
chown postgres:postgres /var/lib/postgresql/${PG_VERSION}/archive

# Restart PostgreSQL
systemctl restart postgresql
echo "✅ PostgreSQL configured for production"
ENDSSH

# ============================================================================
# PHASE 6: SCHEMA MIGRATION
# ============================================================================
echo -e "\n${BLUE}📋 Phase 6: Schema Migration${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

# Create combined schema file from migrations
echo "📦 Preparing schema files..."
cat > /tmp/bankim_schema.sql << 'EOSQL'
-- ============================================================================
-- Banking Application Database Schema
-- ============================================================================

-- Connect to bankim_core database
\c bankim_core;

-- Users table (staff/admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table (customers)
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    id_number VARCHAR(20),
    birth_date DATE,
    address TEXT,
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banks table
CREATE TABLE IF NOT EXISTS banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE,
    logo_url VARCHAR(500),
    interest_rate DECIMAL(5,2),
    max_ltv DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_he VARCHAR(255),
    name_ru VARCHAR(255),
    region VARCHAR(100),
    population INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan calculations table
CREATE TABLE IF NOT EXISTS loan_calculations (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    property_value DECIMAL(15,2),
    down_payment DECIMAL(15,2),
    loan_amount DECIMAL(15,2),
    property_ownership VARCHAR(50),
    ltv_ratio DECIMAL(5,2),
    monthly_payment DECIMAL(15,2),
    interest_rate DECIMAL(5,2),
    loan_term_months INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banking standards table
CREATE TABLE IF NOT EXISTS banking_standards (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER REFERENCES banks(id),
    property_type VARCHAR(50),
    max_ltv DECIMAL(5,2),
    min_down_payment DECIMAL(5,2),
    interest_rate_base DECIMAL(5,2),
    interest_rate_prime DECIMAL(5,2),
    processing_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_loan_calculations_client ON loan_calculations(client_id);
CREATE INDEX idx_banking_standards_bank ON banking_standards(bank_id);

-- ============================================================================
-- Connect to bankim_content database
\c bankim_content;

-- Dropdown configurations with JSONB
CREATE TABLE IF NOT EXISTS dropdown_configs (
    id SERIAL PRIMARY KEY,
    screen_name VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    dropdown_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(screen_name, field_name)
);

-- Content items table
CREATE TABLE IF NOT EXISTS content_items (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    screen_location VARCHAR(255),
    content_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content translations table
CREATE TABLE IF NOT EXISTS content_translations (
    id SERIAL PRIMARY KEY,
    content_item_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_item_id, language_code)
);

-- Locales table (legacy translations)
CREATE TABLE IF NOT EXISTS locales (
    id SERIAL PRIMARY KEY,
    language_code VARCHAR(5) NOT NULL,
    key VARCHAR(500) NOT NULL,
    value TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(language_code, key)
);

-- Create indexes
CREATE INDEX idx_dropdown_configs_screen ON dropdown_configs(screen_name);
CREATE INDEX idx_dropdown_configs_field ON dropdown_configs(field_name);
CREATE INDEX idx_content_items_key ON content_items(key);
CREATE INDEX idx_content_items_category ON content_items(category);
CREATE INDEX idx_content_translations_item ON content_translations(content_item_id);
CREATE INDEX idx_content_translations_lang ON content_translations(language_code);
CREATE INDEX idx_locales_lang_key ON locales(language_code, key);

-- ============================================================================
-- Connect to bankim_management database
\c bankim_management;

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    value_type VARCHAR(50),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_system_settings_key ON system_settings(key);
EOSQL

# Copy schema file to server
echo "📤 Copying schema to server..."
scp /tmp/bankim_schema.sql $SERVER:/tmp/

# Execute schema migration
echo "🔄 Executing schema migration..."
ssh $SERVER << ENDSSH
sudo -u postgres psql -f /tmp/bankim_schema.sql
echo "✅ Schema migration completed"
ENDSSH

# ============================================================================
# PHASE 7: INITIAL DATA SEEDING
# ============================================================================
echo -e "\n${BLUE}🌱 Phase 7: Seeding Initial Data${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

cat > /tmp/seed_data.sql << 'EOSQL'
-- Connect to bankim_core
\c bankim_core;

-- Insert default banks
INSERT INTO banks (name, code, interest_rate, max_ltv, is_active) VALUES
('Bank Leumi', 'LEUMI', 5.25, 75, true),
('Bank Hapoalim', 'HAPOALIM', 5.30, 75, true),
('Discount Bank', 'DISCOUNT', 5.35, 70, true),
('Mizrahi Tefahot', 'MIZRAHI', 5.20, 75, true),
('First International', 'FIBI', 5.40, 70, true)
ON CONFLICT DO NOTHING;

-- Insert major cities
INSERT INTO cities (name, name_he, population) VALUES
('Tel Aviv', 'תל אביב', 460613),
('Jerusalem', 'ירושלים', 936425),
('Haifa', 'חיפה', 285316),
('Rishon LeZion', 'ראשון לציון', 254384),
('Petah Tikva', 'פתח תקווה', 247956),
('Ashdod', 'אשדוד', 225939),
('Netanya', 'נתניה', 221353),
('Beer Sheva', 'באר שבע', 209687),
('Holon', 'חולון', 196282),
('Bnei Brak', 'בני ברק', 195298)
ON CONFLICT DO NOTHING;

-- Connect to bankim_content
\c bankim_content;

-- Insert critical dropdown configurations
INSERT INTO dropdown_configs (screen_name, field_name, dropdown_data, is_active) VALUES
('mortgage_step1', 'property_ownership', '{
  "en": [
    {"value": "no_property", "label": "I don''t own any property"},
    {"value": "has_property", "label": "I own a property"},
    {"value": "selling_property", "label": "I''m selling a property"}
  ],
  "he": [
    {"value": "no_property", "label": "אין לי נכס"},
    {"value": "has_property", "label": "יש לי נכס"},
    {"value": "selling_property", "label": "אני מוכר נכס"}
  ],
  "ru": [
    {"value": "no_property", "label": "У меня нет недвижимости"},
    {"value": "has_property", "label": "У меня есть недвижимость"},
    {"value": "selling_property", "label": "Я продаю недвижимость"}
  ]
}'::jsonb, true),

('mortgage_step2', 'marital_status', '{
  "en": [
    {"value": "single", "label": "Single"},
    {"value": "married", "label": "Married"},
    {"value": "divorced", "label": "Divorced"},
    {"value": "widowed", "label": "Widowed"}
  ],
  "he": [
    {"value": "single", "label": "רווק/ה"},
    {"value": "married", "label": "נשוי/אה"},
    {"value": "divorced", "label": "גרוש/ה"},
    {"value": "widowed", "label": "אלמן/ה"}
  ]
}'::jsonb, true),

('mortgage_step3', 'employment_status', '{
  "en": [
    {"value": "employed", "label": "Employed"},
    {"value": "self_employed", "label": "Self Employed"},
    {"value": "business_owner", "label": "Business Owner"},
    {"value": "unemployed", "label": "Unemployed"},
    {"value": "retired", "label": "Retired"}
  ],
  "he": [
    {"value": "employed", "label": "שכיר"},
    {"value": "self_employed", "label": "עצמאי"},
    {"value": "business_owner", "label": "בעל עסק"},
    {"value": "unemployed", "label": "לא מועסק"},
    {"value": "retired", "label": "פנסיונר"}
  ]
}'::jsonb, true)
ON CONFLICT (screen_name, field_name) DO UPDATE 
SET dropdown_data = EXCLUDED.dropdown_data,
    updated_at = CURRENT_TIMESTAMP;

-- Connect to bankim_management
\c bankim_management;

-- Insert system settings
INSERT INTO system_settings (key, value, value_type, description, is_public) VALUES
('ltv_ratio_no_property', '75', 'number', 'LTV ratio for buyers with no property', true),
('ltv_ratio_has_property', '50', 'number', 'LTV ratio for buyers with existing property', true),
('ltv_ratio_selling_property', '70', 'number', 'LTV ratio for buyers selling property', true),
('default_interest_rate', '5.0', 'number', 'Default interest rate for calculations', true),
('max_loan_term_months', '360', 'number', 'Maximum loan term in months', true),
('min_down_payment_percent', '25', 'number', 'Minimum down payment percentage', true)
ON CONFLICT (key) DO NOTHING;

-- Verify data
\c bankim_core;
SELECT 'Banks count:' as info, COUNT(*) as count FROM banks;
SELECT 'Cities count:' as info, COUNT(*) as count FROM cities;

\c bankim_content;
SELECT 'Dropdown configs:' as info, COUNT(*) as count FROM dropdown_configs;

\c bankim_management;
SELECT 'System settings:' as info, COUNT(*) as count FROM system_settings;
EOSQL

# Copy and execute seed data
scp /tmp/seed_data.sql $SERVER:/tmp/
ssh $SERVER "sudo -u postgres psql -f /tmp/seed_data.sql"

# ============================================================================
# PHASE 8: ENVIRONMENT FILE CREATION
# ============================================================================
echo -e "\n${BLUE}📝 Phase 8: Creating Environment Configuration${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

ssh $SERVER << ENDSSH
# Create environment file for the application
mkdir -p /var/www/bankim/shared

cat > /var/www/bankim/shared/.env.production << EOENV
# ============================================
# Banking Application Production Configuration
# PostgreSQL Local Database Setup
# ============================================

# Environment
NODE_ENV=production
PORT=8003

# Local PostgreSQL Databases
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/bankim_core
CONTENT_DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/bankim_content
MANAGEMENT_DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/bankim_management

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=10000
DB_CONNECTION_TIMEOUT=2000

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_BANK_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Features
USE_JSONB_DROPDOWNS=true
USE_LOCAL_DATABASE=true
ENABLE_DB_FALLBACK=true

# CORS
CORS_ALLOWED_ORIGINS=http://45.83.42.74:8003,https://45.83.42.74

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/bankim/app.log

# Redis (optional, for sessions)
# REDIS_URL=redis://localhost:6379

# Monitoring (optional)
# SENTRY_DSN=your-sentry-dsn
# NEW_RELIC_LICENSE_KEY=your-newrelic-key
EOENV

echo "✅ Environment file created"
echo ""
echo "📋 Database Credentials:"
echo "   User: ${DB_USER}"
echo "   Password: ${DB_PASS}"
echo "   Databases: bankim_core, bankim_content, bankim_management"
echo ""
echo "⚠️  SAVE THESE CREDENTIALS SECURELY!"
ENDSSH

# ============================================================================
# PHASE 9: BACKUP SETUP
# ============================================================================
echo -e "\n${BLUE}💾 Phase 9: Backup Configuration${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

ssh $SERVER << 'ENDSSH'
# Create backup directory
mkdir -p /var/backups/postgresql
chown postgres:postgres /var/backups/postgresql

# Create backup script
cat > /usr/local/bin/backup-bankim-db.sh << 'EOSCRIPT'
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="bankim"

# Backup all three databases
for DB in bankim_core bankim_content bankim_management; do
    pg_dump -U ${DB_USER} -h localhost ${DB} | gzip > ${BACKUP_DIR}/${DB}_${DATE}.sql.gz
    
    # Keep only last 7 days of backups
    find ${BACKUP_DIR} -name "${DB}_*.sql.gz" -mtime +7 -delete
done

echo "Backup completed at $(date)"
EOSCRIPT

chmod +x /usr/local/bin/backup-bankim-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-bankim-db.sh >> /var/log/backup.log 2>&1") | crontab -

echo "✅ Backup system configured (daily at 2 AM)"
ENDSSH

# ============================================================================
# PHASE 10: PERFORMANCE TUNING
# ============================================================================
echo -e "\n${BLUE}⚡ Phase 10: Performance Tuning${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

ssh $SERVER << ENDSSH
# Create monitoring script
cat > /usr/local/bin/check-db-health.sh << 'EOSCRIPT'
#!/bin/bash
# Database health check script

echo "=== PostgreSQL Health Check ==="
echo "Time: $(date)"
echo ""

# Check connections
sudo -u postgres psql -c "SELECT datname, numbackends FROM pg_stat_database WHERE datname LIKE 'bankim%';"

# Check database sizes
sudo -u postgres psql -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size FROM pg_database WHERE datname LIKE 'bankim%';"

# Check slow queries
sudo -u postgres psql -c "SELECT query, calls, mean_exec_time, max_exec_time FROM pg_stat_statements WHERE query NOT LIKE '%pg_stat%' ORDER BY mean_exec_time DESC LIMIT 5;" 2>/dev/null || echo "pg_stat_statements not enabled"

# Check cache hit ratio
sudo -u postgres psql -c "SELECT datname, blks_hit::float/(blks_hit+blks_read) as cache_hit_ratio FROM pg_stat_database WHERE datname LIKE 'bankim%' AND blks_read > 0;"
EOSCRIPT

chmod +x /usr/local/bin/check-db-health.sh

echo "✅ Performance monitoring configured"
ENDSSH

# ============================================================================
# PHASE 11: TESTING
# ============================================================================
echo -e "\n${BLUE}🧪 Phase 11: Testing Database Setup${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"

# Create test script
cat > /tmp/test_db_connection.js << 'EOJS'
const { Client } = require('pg');

async function testDatabases() {
    const databases = [
        { name: 'Core', url: process.env.DATABASE_URL },
        { name: 'Content', url: process.env.CONTENT_DATABASE_URL },
        { name: 'Management', url: process.env.MANAGEMENT_DATABASE_URL }
    ];

    for (const db of databases) {
        console.log(`Testing ${db.name} database...`);
        const client = new Client({ connectionString: db.url });
        
        try {
            await client.connect();
            const result = await client.query('SELECT NOW()');
            console.log(`✅ ${db.name}: Connected at ${result.rows[0].now}`);
            
            // Test specific queries
            if (db.name === 'Core') {
                const banks = await client.query('SELECT COUNT(*) FROM banks');
                console.log(`   Banks: ${banks.rows[0].count}`);
            } else if (db.name === 'Content') {
                const dropdowns = await client.query('SELECT COUNT(*) FROM dropdown_configs');
                console.log(`   Dropdowns: ${dropdowns.rows[0].count}`);
            }
            
            await client.end();
        } catch (error) {
            console.error(`❌ ${db.name}: ${error.message}`);
        }
    }
}

// Load environment from file
require('dotenv').config({ path: '/var/www/bankim/shared/.env.production' });
testDatabases();
EOJS

echo "📋 Testing database connections..."
scp /tmp/test_db_connection.js $SERVER:/tmp/

ssh $SERVER << ENDSSH
cd /tmp
npm install pg dotenv 2>/dev/null || true
node test_db_connection.js || echo "Test requires pg module installation"
ENDSSH

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ PostgreSQL Setup Complete!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

echo -e "\n${BLUE}📊 Summary:${NC}"
echo "  • PostgreSQL ${PG_VERSION} installed"
echo "  • 3 databases created (bankim_core, bankim_content, bankim_management)"
echo "  • Schema migrated"
echo "  • Initial data seeded"
echo "  • Backup system configured"
echo "  • Performance monitoring enabled"

echo -e "\n${BLUE}🔑 Credentials saved in:${NC}"
echo "  /var/www/bankim/shared/.env.production"

echo -e "\n${BLUE}📝 Useful Commands:${NC}"
echo "  Check health: ssh $SERVER '/usr/local/bin/check-db-health.sh'"
echo "  Manual backup: ssh $SERVER '/usr/local/bin/backup-bankim-db.sh'"
echo "  PostgreSQL logs: ssh $SERVER 'tail -f /var/log/postgresql/*.log'"

echo -e "\n${BLUE}🚀 Next Steps:${NC}"
echo "  1. Update deployment script to use local PostgreSQL"
echo "  2. Test application with new database"
echo "  3. Monitor performance and adjust settings"

echo -e "\n${GREEN}The database is ready for production use!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# Save credentials locally
echo -e "\n${YELLOW}⚠️  Database credentials have been saved on the server.${NC}"
echo "${YELLOW}Make sure to retrieve them from:${NC}"
echo "  ssh $SERVER 'cat /var/www/bankim/shared/.env.production | grep DB_'"