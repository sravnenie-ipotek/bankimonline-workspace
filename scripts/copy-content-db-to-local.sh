#!/bin/bash

# Content Database Copy Script
# Copies content database from Railway to local PostgreSQL

set -e  # Exit on any error

echo "🚀 Content Database Copy Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Get database connection details
get_railway_connection() {
    print_status "Getting Railway database connection details..."
    
    # Railway content database URL (from your .env file)
    RAILWAY_DB_URL="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"
    
    if [ -z "$RAILWAY_DB_URL" ]; then
        print_error "Railway database URL not found"
        exit 1
    fi
    
    print_success "Railway database URL configured"
}

# Get local database connection details
get_local_connection() {
    print_status "Getting local database connection details..."
    
    # Local database details
    LOCAL_HOST="localhost"
    LOCAL_PORT="5432"
    LOCAL_USER="postgres"
    LOCAL_PASSWORD="postgres"
    LOCAL_DB="bankim_content"
    
    # Check if local PostgreSQL is running
    if ! pg_isready -h $LOCAL_HOST -p $LOCAL_PORT &> /dev/null; then
        print_error "Local PostgreSQL is not running"
        print_status "Start PostgreSQL with: brew services start postgresql"
        exit 1
    fi
    
    print_success "Local PostgreSQL is running"
}

# Create local database if it doesn't exist
create_local_database() {
    print_status "Creating local content database..."
    
    # Try to create database (ignore if it already exists)
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d postgres -c "CREATE DATABASE $LOCAL_DB;" 2>/dev/null || true
    
    # Check if database exists
    if PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB -c "\dt" &> /dev/null; then
        print_success "Local database '$LOCAL_DB' is ready"
    else
        print_error "Failed to create/access local database"
        exit 1
    fi
}

# Backup Railway database
backup_railway_database() {
    print_status "Creating backup of Railway content database..."
    
    BACKUP_FILE="railway_content_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    print_status "Backup file: $BACKUP_FILE"
    
    # Create backup with schema and data
    if pg_dump "$RAILWAY_DB_URL" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --no-owner \
        --no-privileges \
        --schema=public \
        --file="$BACKUP_FILE" 2>/dev/null; then
        
        print_success "Railway database backup created: $BACKUP_FILE"
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_status "Backup size: $BACKUP_SIZE"
    else
        print_error "Failed to create Railway database backup"
        exit 1
    fi
}

# Restore to local database
restore_to_local() {
    print_status "Restoring content database to local PostgreSQL..."
    
    # Drop existing database and recreate
    print_status "Dropping existing local database..."
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d postgres -c "DROP DATABASE IF EXISTS $LOCAL_DB;" 2>/dev/null || true
    
    print_status "Creating fresh local database..."
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d postgres -c "CREATE DATABASE $LOCAL_DB;" 2>/dev/null || true
    
    # Restore from backup
    print_status "Restoring data from backup..."
    if PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB -f "$BACKUP_FILE" 2>/dev/null; then
        print_success "Database restored successfully to local PostgreSQL"
    else
        print_error "Failed to restore database to local PostgreSQL"
        exit 1
    fi
}

# Verify the copy
verify_copy() {
    print_status "Verifying the copy..."
    
    # Count tables in Railway
    RAILWAY_TABLES=$(psql "$RAILWAY_DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    
    # Count tables in local
    LOCAL_TABLES=$(PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    
    print_status "Railway tables: $RAILWAY_TABLES"
    print_status "Local tables: $LOCAL_TABLES"
    
    if [ "$RAILWAY_TABLES" = "$LOCAL_TABLES" ]; then
        print_success "Table count matches!"
    else
        print_warning "Table count mismatch - Railway: $RAILWAY_TABLES, Local: $LOCAL_TABLES"
    fi
    
    # Count content_items in Railway
    RAILWAY_ITEMS=$(psql "$RAILWAY_DB_URL" -t -c "SELECT COUNT(*) FROM content_items;" 2>/dev/null | tr -d ' ')
    
    # Count content_items in local
    LOCAL_ITEMS=$(PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB -t -c "SELECT COUNT(*) FROM content_items;" 2>/dev/null | tr -d ' ')
    
    print_status "Railway content_items: $RAILWAY_ITEMS"
    print_status "Local content_items: $LOCAL_ITEMS"
    
    if [ "$RAILWAY_ITEMS" = "$LOCAL_ITEMS" ]; then
        print_success "Content items count matches!"
    else
        print_warning "Content items count mismatch - Railway: $RAILWAY_ITEMS, Local: $LOCAL_ITEMS"
    fi
    
    # Count content_translations in Railway
    RAILWAY_TRANSLATIONS=$(psql "$RAILWAY_DB_URL" -t -c "SELECT COUNT(*) FROM content_translations;" 2>/dev/null | tr -d ' ')
    
    # Count content_translations in local
    LOCAL_TRANSLATIONS=$(PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB -t -c "SELECT COUNT(*) FROM content_translations;" 2>/dev/null | tr -d ' ')
    
    print_status "Railway content_translations: $RAILWAY_TRANSLATIONS"
    print_status "Local content_translations: $LOCAL_TRANSLATIONS"
    
    if [ "$RAILWAY_TRANSLATIONS" = "$LOCAL_TRANSLATIONS" ]; then
        print_success "Content translations count matches!"
    else
        print_warning "Content translations count mismatch - Railway: $RAILWAY_TRANSLATIONS, Local: $LOCAL_TRANSLATIONS"
    fi
}

# Update environment variables
update_env_file() {
    print_status "Updating .env file for local content database..."
    
    # Backup current .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Current .env backed up"
    
    # Update CONTENT_DATABASE_URL to point to local
    LOCAL_CONTENT_URL="postgresql://postgres:postgres@localhost:5432/bankim_content"
    
    # Replace the CONTENT_DATABASE_URL line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|CONTENT_DATABASE_URL=.*|CONTENT_DATABASE_URL=$LOCAL_CONTENT_URL|" .env
    else
        # Linux
        sed -i "s|CONTENT_DATABASE_URL=.*|CONTENT_DATABASE_URL=$LOCAL_CONTENT_URL|" .env
    fi
    
    print_success "Updated .env file to use local content database"
    print_status "Local content database URL: $LOCAL_CONTENT_URL"
}

# Show connection information
show_connection_info() {
    echo ""
    echo "🔗 Connection Information"
    echo "========================="
    echo "Local Content Database:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: bankim_content"
    echo "  User: postgres"
    echo "  Password: postgres"
    echo "  URL: postgresql://postgres:postgres@localhost:5432/bankim_content"
    echo ""
    echo "To connect manually:"
    echo "  psql -h localhost -p 5432 -U postgres -d bankim_content"
    echo ""
    echo "To test connection:"
    echo "  PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d bankim_content -c 'SELECT COUNT(*) FROM content_items;'"
}

# Main execution
main() {
    echo ""
    print_status "Starting content database copy process..."
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Get connection details
    get_railway_connection
    get_local_connection
    
    # Create local database
    create_local_database
    
    # Backup Railway database
    backup_railway_database
    
    # Restore to local
    restore_to_local
    
    # Verify the copy
    verify_copy
    
    # Update environment file
    update_env_file
    
    # Show connection information
    show_connection_info
    
    echo ""
    print_success "Content database copy completed successfully!"
    print_status "Your application will now use the local content database"
    echo ""
    print_warning "Remember to restart your application to use the new database"
    echo ""
}

# Run main function
main "$@"
