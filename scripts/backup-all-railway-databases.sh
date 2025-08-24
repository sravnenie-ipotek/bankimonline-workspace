#!/bin/bash

# Complete Railway Database Backup Script
# Backs up all Railway databases: core, content, and management

set -e  # Exit on any error

echo "🚀 Complete Railway Database Backup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

print_db_info() {
    echo -e "${CYAN}[DATABASE]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) is not installed"
        print_status "Install with: brew install postgresql"
        exit 1
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        print_error "PostgreSQL dump tool (pg_dump) is not installed"
        print_status "Install with: brew install postgresql"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Get Railway database connection details
get_railway_connections() {
    print_status "Getting Railway database connection details..."
    
    # Railway database URLs (from your .env file)
    CORE_DB_URL="postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"
    CONTENT_DB_URL="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"
    MANAGEMENT_DB_URL="postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway"
    
    # Verify URLs are not empty
    if [ -z "$CORE_DB_URL" ] || [ -z "$CONTENT_DB_URL" ] || [ -z "$MANAGEMENT_DB_URL" ]; then
        print_error "One or more Railway database URLs are missing"
        exit 1
    fi
    
    print_success "All Railway database URLs configured"
}

# Test database connections
test_connections() {
    print_status "Testing database connections..."
    
    # Test core database
    print_db_info "Testing core database (maglev)..."
    if psql "$CORE_DB_URL" -c "SELECT 1;" &> /dev/null; then
        print_success "Core database connection successful"
    else
        print_error "Core database connection failed"
        exit 1
    fi
    
    # Test content database
    print_db_info "Testing content database (shortline)..."
    if psql "$CONTENT_DB_URL" -c "SELECT 1;" &> /dev/null; then
        print_success "Content database connection successful"
    else
        print_error "Content database connection failed"
        exit 1
    fi
    
    # Test management database
    print_db_info "Testing management database (yamanote)..."
    if psql "$MANAGEMENT_DB_URL" -c "SELECT 1;" &> /dev/null; then
        print_success "Management database connection successful"
    else
        print_error "Management database connection failed"
        exit 1
    fi
}

# Get database information
get_database_info() {
    print_status "Getting database information..."
    
    # Core database info
    print_db_info "Core Database (maglev):"
    CORE_TABLES=$(psql "$CORE_DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    CORE_SIZE=$(psql "$CORE_DB_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | tr -d ' ')
    echo "  Tables: $CORE_TABLES"
    echo "  Size: $CORE_SIZE"
    
    # Content database info
    print_db_info "Content Database (shortline):"
    CONTENT_TABLES=$(psql "$CONTENT_DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    CONTENT_SIZE=$(psql "$CONTENT_DB_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | tr -d ' ')
    echo "  Tables: $CONTENT_TABLES"
    echo "  Size: $CONTENT_SIZE"
    
    # Management database info
    print_db_info "Management Database (yamanote):"
    MANAGEMENT_TABLES=$(psql "$MANAGEMENT_DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    MANAGEMENT_SIZE=$(psql "$MANAGEMENT_DB_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | tr -d ' ')
    echo "  Tables: $MANAGEMENT_TABLES"
    echo "  Size: $MANAGEMENT_SIZE"
}

# Create backup directory
create_backup_directory() {
    print_status "Creating backup directory..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="railway_backups_$TIMESTAMP"
    
    mkdir -p "$BACKUP_DIR"
    print_success "Backup directory created: $BACKUP_DIR"
    
    # Create subdirectories for each database
    mkdir -p "$BACKUP_DIR/core"
    mkdir -p "$BACKUP_DIR/content"
    mkdir -p "$BACKUP_DIR/management"
    
    print_success "Subdirectories created for each database"
}

# Backup core database
backup_core_database() {
    print_header "Backing up Core Database (maglev)..."
    
    BACKUP_FILE="$BACKUP_DIR/core/railway_core_backup_$TIMESTAMP.sql"
    
    print_status "Backup file: $BACKUP_FILE"
    
    # Create backup with schema and data
    if pg_dump "$CORE_DB_URL" \
        --verbose \
        --no-owner \
        --no-privileges \
        --schema=public \
        --file="$BACKUP_FILE" 2>/dev/null; then
        
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_success "Core database backup created: $BACKUP_FILE"
        print_status "Backup size: $BACKUP_SIZE"
        
        # Get table counts for verification
        CORE_BACKUP_TABLES=$(grep -c "CREATE TABLE" "$BACKUP_FILE" || echo "0")
        print_status "Tables in backup: $CORE_BACKUP_TABLES"
    else
        print_error "Failed to create core database backup"
        exit 1
    fi
}

# Backup content database
backup_content_database() {
    print_header "Backing up Content Database (shortline)..."
    
    BACKUP_FILE="$BACKUP_DIR/content/railway_content_backup_$TIMESTAMP.sql"
    
    print_status "Backup file: $BACKUP_FILE"
    
    # Create backup with schema and data
    if pg_dump "$CONTENT_DB_URL" \
        --verbose \
        --no-owner \
        --no-privileges \
        --schema=public \
        --file="$BACKUP_FILE" 2>/dev/null; then
        
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_success "Content database backup created: $BACKUP_FILE"
        print_status "Backup size: $BACKUP_SIZE"
        
        # Get table counts for verification
        CONTENT_BACKUP_TABLES=$(grep -c "CREATE TABLE" "$BACKUP_FILE" || echo "0")
        print_status "Tables in backup: $CONTENT_BACKUP_TABLES"
    else
        print_error "Failed to create content database backup"
        exit 1
    fi
}

# Backup management database
backup_management_database() {
    print_header "Backing up Management Database (yamanote)..."
    
    BACKUP_FILE="$BACKUP_DIR/management/railway_management_backup_$TIMESTAMP.sql"
    
    print_status "Backup file: $BACKUP_FILE"
    
    # Create backup with schema and data
    if pg_dump "$MANAGEMENT_DB_URL" \
        --verbose \
        --no-owner \
        --no-privileges \
        --schema=public \
        --file="$BACKUP_FILE" 2>/dev/null; then
        
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_success "Management database backup created: $BACKUP_FILE"
        print_status "Backup size: $BACKUP_SIZE"
        
        # Get table counts for verification
        MANAGEMENT_BACKUP_TABLES=$(grep -c "CREATE TABLE" "$BACKUP_FILE" || echo "0")
        print_status "Tables in backup: $MANAGEMENT_BACKUP_TABLES"
    else
        print_error "Failed to create management database backup"
        exit 1
    fi
}

# Create backup summary
create_backup_summary() {
    print_status "Creating backup summary..."
    
    SUMMARY_FILE="$BACKUP_DIR/backup_summary_$TIMESTAMP.md"
    
    cat > "$SUMMARY_FILE" << EOF
# Railway Database Backup Summary

**Backup Date**: $(date)
**Backup Directory**: $BACKUP_DIR

## Database Information

### Core Database (maglev)
- **Host**: maglev.proxy.rlwy.net:43809
- **Tables**: $CORE_TABLES
- **Size**: $CORE_SIZE
- **Backup File**: railway_core_backup_$TIMESTAMP.sql
- **Backup Size**: $(du -h "$BACKUP_DIR/core/railway_core_backup_$TIMESTAMP.sql" | cut -f1)

### Content Database (shortline)
- **Host**: shortline.proxy.rlwy.net:33452
- **Tables**: $CONTENT_TABLES
- **Size**: $CONTENT_SIZE
- **Backup File**: railway_content_backup_$TIMESTAMP.sql
- **Backup Size**: $(du -h "$BACKUP_DIR/content/railway_content_backup_$TIMESTAMP.sql" | cut -f1)

### Management Database (yamanote)
- **Host**: yamanote.proxy.rlwy.net:53119
- **Tables**: $MANAGEMENT_TABLES
- **Size**: $MANAGEMENT_SIZE
- **Backup File**: railway_management_backup_$TIMESTAMP.sql
- **Backup Size**: $(du -h "$BACKUP_DIR/management/railway_management_backup_$TIMESTAMP.sql" | cut -f1)

## Backup Files

\`\`\`
$BACKUP_DIR/
├── core/
│   └── railway_core_backup_$TIMESTAMP.sql
├── content/
│   └── railway_content_backup_$TIMESTAMP.sql
├── management/
│   └── railway_management_backup_$TIMESTAMP.sql
└── backup_summary_$TIMESTAMP.md
\`\`\`

## Restore Commands

### Core Database
\`\`\`bash
psql -h localhost -p 5432 -U postgres -d bankim_core -f "$BACKUP_DIR/core/railway_core_backup_$TIMESTAMP.sql"
\`\`\`

### Content Database
\`\`\`bash
psql -h localhost -p 5432 -U postgres -d bankim_content -f "$BACKUP_DIR/content/railway_content_backup_$TIMESTAMP.sql"
\`\`\`

### Management Database
\`\`\`bash
psql -h localhost -p 5432 -U postgres -d bankim_management -f "$BACKUP_DIR/management/railway_management_backup_$TIMESTAMP.sql"
\`\`\`

## Verification

To verify the backups, you can check the table counts:

\`\`\`bash
# Core database
grep -c "CREATE TABLE" "$BACKUP_DIR/core/railway_core_backup_$TIMESTAMP.sql"

# Content database
grep -c "CREATE TABLE" "$BACKUP_DIR/content/railway_content_backup_$TIMESTAMP.sql"

# Management database
grep -c "CREATE TABLE" "$BACKUP_DIR/management/railway_management_backup_$TIMESTAMP.sql"
\`\`\`
EOF

    print_success "Backup summary created: $SUMMARY_FILE"
}

# Create restore script
create_restore_script() {
    print_status "Creating restore script..."
    
    RESTORE_SCRIPT="$BACKUP_DIR/restore_all_databases.sh"
    
    cat > "$RESTORE_SCRIPT" << 'EOF'
#!/bin/bash

# Railway Database Restore Script
# Restores all Railway databases to local PostgreSQL

set -e

echo "🚀 Railway Database Restore Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Local database details
LOCAL_HOST="localhost"
LOCAL_PORT="5432"
LOCAL_USER="postgres"
LOCAL_PASSWORD="postgres"

# Get backup directory from script location
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(basename "$BACKUP_DIR" | sed 's/railway_backups_//')

print_status "Backup directory: $BACKUP_DIR"
print_status "Timestamp: $TIMESTAMP"

# Check if backup files exist
CORE_BACKUP="$BACKUP_DIR/core/railway_core_backup_$TIMESTAMP.sql"
CONTENT_BACKUP="$BACKUP_DIR/content/railway_content_backup_$TIMESTAMP.sql"
MANAGEMENT_BACKUP="$BACKUP_DIR/management/railway_management_backup_$TIMESTAMP.sql"

if [ ! -f "$CORE_BACKUP" ]; then
    print_error "Core backup file not found: $CORE_BACKUP"
    exit 1
fi

if [ ! -f "$CONTENT_BACKUP" ]; then
    print_error "Content backup file not found: $CONTENT_BACKUP"
    exit 1
fi

if [ ! -f "$MANAGEMENT_BACKUP" ]; then
    print_error "Management backup file not found: $MANAGEMENT_BACKUP"
    exit 1
fi

print_success "All backup files found"

# Create local databases
create_local_databases() {
    print_status "Creating local databases..."
    
    # Create core database
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d postgres -c "DROP DATABASE IF EXISTS bankim_core;" 2>/dev/null || true
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d postgres -c "CREATE DATABASE bankim_core;" 2>/dev/null || true
    
    # Create content database
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d postgres -c "DROP DATABASE IF EXISTS bankim_content;" 2>/dev/null || true
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d postgres -c "CREATE DATABASE bankim_content;" 2>/dev/null || true
    
    # Create management database
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d postgres -c "DROP DATABASE IF EXISTS bankim_management;" 2>/dev/null || true
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d postgres -c "CREATE DATABASE bankim_management;" 2>/dev/null || true
    
    print_success "Local databases created"
}

# Restore core database
restore_core_database() {
    print_status "Restoring core database..."
    
    if PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d bankim_core -f "$CORE_BACKUP" 2>/dev/null; then
        print_success "Core database restored successfully"
    else
        print_error "Failed to restore core database"
        exit 1
    fi
}

# Restore content database
restore_content_database() {
    print_status "Restoring content database..."
    
    if PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d bankim_content -f "$CONTENT_BACKUP" 2>/dev/null; then
        print_success "Content database restored successfully"
    else
        print_error "Failed to restore content database"
        exit 1
    fi
}

# Restore management database
restore_management_database() {
    print_status "Restoring management database..."
    
    if PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d bankim_management -f "$MANAGEMENT_BACKUP" 2>/dev/null; then
        print_success "Management database restored successfully"
    else
        print_error "Failed to restore management database"
        exit 1
    fi
}

# Update environment file
update_env_file() {
    print_status "Updating .env file for local databases..."
    
    # Backup current .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Current .env backed up"
    
    # Update database URLs to point to local
    LOCAL_CORE_URL="postgresql://postgres:postgres@localhost:5432/bankim_core"
    LOCAL_CONTENT_URL="postgresql://postgres:postgres@localhost:5432/bankim_content"
    LOCAL_MANAGEMENT_URL="postgresql://postgres:postgres@localhost:5432/bankim_management"
    
    # Replace the database URL lines
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$LOCAL_CORE_URL|" .env
        sed -i '' "s|CONTENT_DATABASE_URL=.*|CONTENT_DATABASE_URL=$LOCAL_CONTENT_URL|" .env
        sed -i '' "s|MANAGEMENT_DATABASE_URL=.*|MANAGEMENT_DATABASE_URL=$LOCAL_MANAGEMENT_URL|" .env
    else
        # Linux
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=$LOCAL_CORE_URL|" .env
        sed -i "s|CONTENT_DATABASE_URL=.*|CONTENT_DATABASE_URL=$LOCAL_CONTENT_URL|" .env
        sed -i "s|MANAGEMENT_DATABASE_URL=.*|MANAGEMENT_DATABASE_URL=$LOCAL_MANAGEMENT_URL|" .env
    fi
    
    print_success "Updated .env file to use local databases"
}

# Main execution
main() {
    print_status "Starting database restore process..."
    
    create_local_databases
    restore_core_database
    restore_content_database
    restore_management_database
    update_env_file
    
    print_success "All databases restored successfully!"
    print_status "Your application will now use local databases"
    print_warning "Remember to restart your application"
}

# Run main function
main "$@"
EOF

    chmod +x "$RESTORE_SCRIPT"
    print_success "Restore script created: $RESTORE_SCRIPT"
}

# Show backup information
show_backup_info() {
    echo ""
    echo "📊 BACKUP SUMMARY"
    echo "================="
    echo "Backup Directory: $BACKUP_DIR"
    echo "Timestamp: $TIMESTAMP"
    echo ""
    echo "📁 Backup Files:"
    echo "  Core: $BACKUP_DIR/core/railway_core_backup_$TIMESTAMP.sql"
    echo "  Content: $BACKUP_DIR/content/railway_content_backup_$TIMESTAMP.sql"
    echo "  Management: $BACKUP_DIR/management/railway_management_backup_$TIMESTAMP.sql"
    echo ""
    echo "📄 Documentation:"
    echo "  Summary: $BACKUP_DIR/backup_summary_$TIMESTAMP.md"
    echo "  Restore Script: $BACKUP_DIR/restore_all_databases.sh"
    echo ""
    echo "🔧 Restore Commands:"
    echo "  ./$BACKUP_DIR/restore_all_databases.sh"
    echo ""
    echo "💾 Total Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
}

# Main execution
main() {
    echo ""
    print_status "Starting complete Railway database backup process..."
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Get connection details
    get_railway_connections
    
    # Test connections
    test_connections
    
    # Get database information
    get_database_info
    
    # Create backup directory
    create_backup_directory
    
    # Backup all databases
    backup_core_database
    backup_content_database
    backup_management_database
    
    # Create documentation
    create_backup_summary
    create_restore_script
    
    # Show results
    show_backup_info
    
    echo ""
    print_success "Complete Railway database backup finished successfully!"
    print_status "All three databases have been backed up"
    echo ""
    print_warning "Keep the backup directory safe - it contains all your data!"
    echo ""
}

# Run main function
main "$@"
