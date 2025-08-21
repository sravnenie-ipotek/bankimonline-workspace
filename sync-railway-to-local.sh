#!/bin/bash

# Sync Railway databases to local PostgreSQL
# This script compares and syncs all content from Railway to local databases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Starting Railway to Local Database Sync...${NC}"

# Railway database connections
RAILWAY_CORE_URL="postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"
RAILWAY_CONTENT_URL="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"

# Local database connections
LOCAL_CORE_DB="bankim_core"
LOCAL_CONTENT_DB="bankim_content"
LOCAL_USER="postgres"

# Function to count records in a table
count_records() {
    local db_url="$1"
    local table="$2"
    local is_local="$3"
    
    if [ "$is_local" = "true" ]; then
        psql -U "$LOCAL_USER" -d "$db_url" -t -c "SELECT COUNT(*) FROM $table" 2>/dev/null || echo "0"
    else
        psql "$db_url" -t -c "SELECT COUNT(*) FROM $table" 2>/dev/null || echo "0"
    fi
}

# Function to compare table counts
compare_tables() {
    local railway_db="$1"
    local local_db="$2"
    local table="$3"
    
    echo -e "\n${YELLOW}Comparing table: $table${NC}"
    
    railway_count=$(count_records "$railway_db" "$table" "false")
    local_count=$(count_records "$local_db" "$table" "true")
    
    railway_count=$(echo $railway_count | tr -d ' ')
    local_count=$(echo $local_count | tr -d ' ')
    
    echo "  Railway: $railway_count records"
    echo "  Local:   $local_count records"
    
    if [ "$railway_count" -gt "$local_count" ]; then
        echo -e "  ${RED}⚠️  Local is missing $(($railway_count - $local_count)) records${NC}"
        return 1
    elif [ "$railway_count" -lt "$local_count" ]; then
        echo -e "  ${BLUE}ℹ️  Local has $(($local_count - $railway_count)) extra records${NC}"
        return 0
    else
        echo -e "  ${GREEN}✅ Counts match${NC}"
        return 0
    fi
}

# Step 1: Compare CONTENT database
echo -e "\n${BLUE}=== CONTENT DATABASE COMPARISON ===${NC}"

# Check content_items table
compare_tables "$RAILWAY_CONTENT_URL" "$LOCAL_CONTENT_DB" "content_items"
content_items_diff=$?

# Check content_translations table
compare_tables "$RAILWAY_CONTENT_URL" "$LOCAL_CONTENT_DB" "content_translations"
content_translations_diff=$?

# Check dropdown_configs table
compare_tables "$RAILWAY_CONTENT_URL" "$LOCAL_CONTENT_DB" "dropdown_configs"
dropdown_configs_diff=$?

# Step 2: Compare CORE database key tables
echo -e "\n${BLUE}=== CORE DATABASE COMPARISON ===${NC}"

# Check banks table
compare_tables "$RAILWAY_CORE_URL" "$LOCAL_CORE_DB" "banks"
banks_diff=$?

# Check cities table
compare_tables "$RAILWAY_CORE_URL" "$LOCAL_CORE_DB" "cities"
cities_diff=$?

# Check regions table
compare_tables "$RAILWAY_CORE_URL" "$LOCAL_CORE_DB" "regions"
regions_diff=$?

# Check professions table
compare_tables "$RAILWAY_CORE_URL" "$LOCAL_CORE_DB" "professions"
professions_diff=$?

# Check banking_standards table
compare_tables "$RAILWAY_CORE_URL" "$LOCAL_CORE_DB" "banking_standards"
banking_standards_diff=$?

# Step 3: Sync if needed
if [ $content_items_diff -eq 1 ] || [ $content_translations_diff -eq 1 ] || [ $dropdown_configs_diff -eq 1 ]; then
    echo -e "\n${YELLOW}📥 Content database needs syncing...${NC}"
    read -p "Do you want to sync content database from Railway? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}Syncing content database...${NC}"
        
        # Backup local database first
        echo "Creating backup of local content database..."
        pg_dump -U "$LOCAL_USER" "$LOCAL_CONTENT_DB" > "backup_${LOCAL_CONTENT_DB}_$(date +%Y%m%d_%H%M%S).sql"
        
        # Dump Railway content database
        echo "Dumping Railway content database..."
        pg_dump "$RAILWAY_CONTENT_URL" --no-owner --no-acl > railway_content_dump.sql
        
        # Restore to local
        echo "Restoring to local content database..."
        psql -U "$LOCAL_USER" -c "DROP DATABASE IF EXISTS ${LOCAL_CONTENT_DB}_temp"
        psql -U "$LOCAL_USER" -c "CREATE DATABASE ${LOCAL_CONTENT_DB}_temp"
        psql -U "$LOCAL_USER" "${LOCAL_CONTENT_DB}_temp" < railway_content_dump.sql
        
        # Swap databases
        psql -U "$LOCAL_USER" -c "ALTER DATABASE $LOCAL_CONTENT_DB RENAME TO ${LOCAL_CONTENT_DB}_old"
        psql -U "$LOCAL_USER" -c "ALTER DATABASE ${LOCAL_CONTENT_DB}_temp RENAME TO $LOCAL_CONTENT_DB"
        psql -U "$LOCAL_USER" -c "DROP DATABASE ${LOCAL_CONTENT_DB}_old"
        
        echo -e "${GREEN}✅ Content database synced successfully${NC}"
        rm railway_content_dump.sql
    fi
fi

if [ $banks_diff -eq 1 ] || [ $cities_diff -eq 1 ] || [ $regions_diff -eq 1 ] || [ $professions_diff -eq 1 ] || [ $banking_standards_diff -eq 1 ]; then
    echo -e "\n${YELLOW}📥 Core database tables need syncing...${NC}"
    read -p "Do you want to sync core database tables from Railway? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}Syncing core database tables...${NC}"
        
        # Backup local database first
        echo "Creating backup of local core database..."
        pg_dump -U "$LOCAL_USER" "$LOCAL_CORE_DB" > "backup_${LOCAL_CORE_DB}_$(date +%Y%m%d_%H%M%S).sql"
        
        # Sync specific tables
        for table in banks cities regions professions banking_standards; do
            echo "Syncing $table table..."
            
            # Dump table from Railway
            pg_dump "$RAILWAY_CORE_URL" --no-owner --no-acl --data-only --table="$table" > "railway_${table}.sql"
            
            # Clear local table and restore
            psql -U "$LOCAL_USER" "$LOCAL_CORE_DB" -c "TRUNCATE TABLE $table CASCADE"
            psql -U "$LOCAL_USER" "$LOCAL_CORE_DB" < "railway_${table}.sql"
            
            rm "railway_${table}.sql"
        done
        
        echo -e "${GREEN}✅ Core database tables synced successfully${NC}"
    fi
fi

# Step 4: Final verification
echo -e "\n${BLUE}=== FINAL VERIFICATION ===${NC}"

# Re-check key tables
echo -e "\n${YELLOW}Content Database:${NC}"
echo "  content_items: $(count_records "$LOCAL_CONTENT_DB" "content_items" "true" | tr -d ' ') records"
echo "  content_translations: $(count_records "$LOCAL_CONTENT_DB" "content_translations" "true" | tr -d ' ') records"
echo "  dropdown_configs: $(count_records "$LOCAL_CONTENT_DB" "dropdown_configs" "true" | tr -d ' ') records"

echo -e "\n${YELLOW}Core Database:${NC}"
echo "  banks: $(count_records "$LOCAL_CORE_DB" "banks" "true" | tr -d ' ') records"
echo "  cities: $(count_records "$LOCAL_CORE_DB" "cities" "true" | tr -d ' ') records"
echo "  regions: $(count_records "$LOCAL_CORE_DB" "regions" "true" | tr -d ' ') records"
echo "  professions: $(count_records "$LOCAL_CORE_DB" "professions" "true" | tr -d ' ') records"
echo "  banking_standards: $(count_records "$LOCAL_CORE_DB" "banking_standards" "true" | tr -d ' ') records"

echo -e "\n${GREEN}✅ Database sync check complete!${NC}"
echo -e "${BLUE}Run the debug endpoint to verify content availability:${NC}"
echo "  curl http://localhost:8003/api/debug/missing-content | jq '.statistics'"