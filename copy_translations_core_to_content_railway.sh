#!/bin/bash

# Copy translation data from Railway core_db to Railway content_db
# This must be run BEFORE the cleanup scripts
# DATE: 2025-08-21

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Railway database connections
RAILWAY_CORE_URL="postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"
RAILWAY_CONTENT_URL="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"

echo -e "${BLUE}🔄 Copying translation data from Railway core_db to Railway content_db...${NC}"

# Step 1: Create tables in Railway content_db
echo -e "${YELLOW}Step 1: Creating translation tables in Railway content_db...${NC}"
psql "$RAILWAY_CONTENT_URL" -f server/migrationDB/move_all_translations_to_content_db_20250821_164500.sql

# Step 2: Export data from Railway core_db and import to Railway content_db
echo -e "${YELLOW}Step 2: Copying cities data...${NC}"
psql "$RAILWAY_CORE_URL" -c "\copy (SELECT id, key, name_en, name_he, name_ru FROM cities ORDER BY id) TO '/tmp/railway_cities_data.csv' WITH CSV HEADER"
psql "$RAILWAY_CONTENT_URL" -c "\copy cities (id, key, name_en, name_he, name_ru) FROM '/tmp/railway_cities_data.csv' WITH CSV HEADER"

echo -e "${YELLOW}Step 3: Copying regions data...${NC}"
psql "$RAILWAY_CORE_URL" -c "\copy (SELECT id, key, name_en, name_he, name_ru, is_active FROM regions ORDER BY id) TO '/tmp/railway_regions_data.csv' WITH CSV HEADER"
psql "$RAILWAY_CONTENT_URL" -c "\copy regions (id, key, name_en, name_he, name_ru, is_active) FROM '/tmp/railway_regions_data.csv' WITH CSV HEADER"

echo -e "${YELLOW}Step 4: Copying professions data...${NC}"
psql "$RAILWAY_CORE_URL" -c "\copy (SELECT id, key, name_en, name_he, name_ru, category, is_active FROM professions ORDER BY id) TO '/tmp/railway_professions_data.csv' WITH CSV HEADER"
psql "$RAILWAY_CONTENT_URL" -c "\copy professions (id, key, name_en, name_he, name_ru, category, is_active) FROM '/tmp/railway_professions_data.csv' WITH CSV HEADER"

echo -e "${YELLOW}Step 5: Copying banks translation data...${NC}"
psql "$RAILWAY_CORE_URL" -c "\copy (SELECT id, name_en, name_he, name_ru FROM banks ORDER BY id) TO '/tmp/railway_banks_data.csv' WITH CSV HEADER"
psql "$RAILWAY_CONTENT_URL" -c "\copy banks_translations (bank_id, name_en, name_he, name_ru) FROM '/tmp/railway_banks_data.csv' WITH CSV HEADER"

# Step 6: Reset sequences in Railway content_db
echo -e "${YELLOW}Step 6: Resetting sequences...${NC}"
psql "$RAILWAY_CONTENT_URL" -c "SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities));"
psql "$RAILWAY_CONTENT_URL" -c "SELECT setval('regions_id_seq', (SELECT MAX(id) FROM regions));"  
psql "$RAILWAY_CONTENT_URL" -c "SELECT setval('professions_id_seq', (SELECT MAX(id) FROM professions));"
psql "$RAILWAY_CONTENT_URL" -c "SELECT setval('banks_translations_id_seq', (SELECT MAX(id) FROM banks_translations));"

# Step 7: Cleanup temp files
rm -f /tmp/railway_cities_data.csv /tmp/railway_regions_data.csv /tmp/railway_professions_data.csv /tmp/railway_banks_data.csv

# Step 8: Validation
echo -e "${YELLOW}Step 8: Validation...${NC}"
psql "$RAILWAY_CONTENT_URL" -c "SELECT * FROM translation_tables_summary;"

echo -e "${GREEN}✅ Translation data copied successfully to Railway content_db${NC}"
echo -e "${BLUE}Next step: Run cleanup script on Railway core_db${NC}"