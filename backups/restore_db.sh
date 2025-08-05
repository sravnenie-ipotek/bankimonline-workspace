#!/bin/bash

# **DATABASE RESTORE SCRIPT**
# Restore PostgreSQL database from backup files
# Created: July 15, 2025

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="railway"
BACKUP_DIR="$(dirname "$0")/db"

# Available backup files
CUSTOM_BACKUP="railway_backup_20250715_092012.backup"
SQL_BACKUP="railway_backup_20250715_092053.sql"
SCHEMA_BACKUP="railway_schema_only_20250715_092138.sql"

# Functions
print_header() {
    echo -e "${BLUE}=================================="
    echo -e "  DATABASE RESTORE SCRIPT"
    echo -e "=================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if backup files exist
check_backup_files() {
    print_info "Checking backup files..."
    
    if [ ! -f "$BACKUP_DIR/$CUSTOM_BACKUP" ]; then
        print_error "Custom backup file not found: $BACKUP_DIR/$CUSTOM_BACKUP"
    fi
    
    if [ ! -f "$BACKUP_DIR/$SQL_BACKUP" ]; then
        print_error "SQL backup file not found: $BACKUP_DIR/$SQL_BACKUP"
    fi
    
    if [ ! -f "$BACKUP_DIR/$SCHEMA_BACKUP" ]; then
        print_error "Schema backup file not found: $BACKUP_DIR/$SCHEMA_BACKUP"
    fi
    
    print_success "All backup files found"
}

# Check PostgreSQL connection
check_postgres_connection() {
    print_info "Checking PostgreSQL connection..."
    
    if ! command -v psql &> /dev/null; then
        print_error "psql command not found. Please install PostgreSQL client."
    fi
    
    if ! command -v pg_restore &> /dev/null; then
        print_error "pg_restore command not found. Please install PostgreSQL client."
    fi
    
    print_success "PostgreSQL client tools found"
}

# Show restore options
show_options() {
    echo -e "${BLUE}Available restore options:${NC}"
    echo "1. Custom Format Backup (Recommended - Fast & Selective)"
    echo "2. Full SQL Backup (Complete with data)"
    echo "3. Schema Only (Structure only, no data)"
    echo "4. Exit"
    echo ""
}

# Restore from custom format backup
restore_custom() {
    print_info "Restoring from custom format backup..."
    print_warning "This will drop and recreate the database!"
    
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restore cancelled."
        return
    fi
    
    print_info "Using pg_restore for custom format backup..."
    
    if pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --create --if-exists \
        "$BACKUP_DIR/$CUSTOM_BACKUP"; then
        print_success "Custom format backup restored successfully!"
    else
        print_error "Failed to restore custom format backup"
    fi
}

# Restore from SQL backup
restore_sql() {
    print_info "Restoring from SQL backup..."
    print_warning "This will drop and recreate the database!"
    
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restore cancelled."
        return
    fi
    
    print_info "Using psql for SQL backup..."
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
        -f "$BACKUP_DIR/$SQL_BACKUP"; then
        print_success "SQL backup restored successfully!"
    else
        print_error "Failed to restore SQL backup"
    fi
}

# Restore schema only
restore_schema() {
    print_info "Restoring schema only (no data)..."
    print_warning "This will create database structure only!"
    
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restore cancelled."
        return
    fi
    
    print_info "Using psql for schema backup..."
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -f "$BACKUP_DIR/$SCHEMA_BACKUP"; then
        print_success "Schema restored successfully!"
    else
        print_error "Failed to restore schema"
    fi
}

# Main function
main() {
    print_header
    
    # Check if PGPASSWORD is set
    if [ -z "$PGPASSWORD" ]; then
        print_warning "PGPASSWORD environment variable not set."
        print_info "Please set it before running this script:"
        print_info "export PGPASSWORD='your_password'"
        echo ""
        read -p "Enter PostgreSQL password: " -s DB_PASSWORD
        echo ""
        export PGPASSWORD="$DB_PASSWORD"
    fi
    
    # Check prerequisites
    check_backup_files
    check_postgres_connection
    
    # Show file sizes
    echo -e "${BLUE}Backup file sizes:${NC}"
    ls -lah "$BACKUP_DIR"/*.backup "$BACKUP_DIR"/*.sql 2>/dev/null || print_warning "Some backup files may be missing"
    echo ""
    
    # Main loop
    while true; do
        show_options
        read -p "Please choose an option (1-4): " choice
        
        case $choice in
            1)
                restore_custom
                break
                ;;
            2)
                restore_sql
                break
                ;;
            3)
                restore_schema
                break
                ;;
            4)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-4."
                ;;
        esac
    done
    
    print_success "Database restore process completed!"
    print_info "Please verify the restored database and test functionality."
}

# Run main function
main "$@" 