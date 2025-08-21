#!/bin/bash

# Copy translation data from core_db to content_db
# This must be run BEFORE the cleanup scripts
# DATE: 2025-08-21

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Copying translation data from core_db to content_db...${NC}"

# Step 1: Create tables in content_db
echo -e "${YELLOW}Step 1: Creating translation tables in content_db...${NC}"
psql -U postgres -d bankim_content -f server/migrationDB/move_all_translations_to_content_db_20250821_164500.sql

# Step 2: Export data from core_db and import to content_db
echo -e "${YELLOW}Step 2: Copying cities data...${NC}"
psql -U postgres -d bankim_core -c "\copy (SELECT id, key, name_en, name_he, name_ru FROM cities ORDER BY id) TO '/tmp/cities_data.csv' WITH CSV HEADER"
psql -U postgres -d bankim_content -c "\copy cities (id, key, name_en, name_he, name_ru) FROM '/tmp/cities_data.csv' WITH CSV HEADER"

echo -e "${YELLOW}Step 3: Copying regions data...${NC}"
psql -U postgres -d bankim_core -c "\copy (SELECT id, key, name_en, name_he, name_ru, is_active FROM regions ORDER BY id) TO '/tmp/regions_data.csv' WITH CSV HEADER"
psql -U postgres -d bankim_content -c "\copy regions (id, key, name_en, name_he, name_ru, is_active) FROM '/tmp/regions_data.csv' WITH CSV HEADER"

echo -e "${YELLOW}Step 4: Copying professions data...${NC}"
psql -U postgres -d bankim_core -c "\copy (SELECT id, key, name_en, name_he, name_ru, category, is_active FROM professions ORDER BY id) TO '/tmp/professions_data.csv' WITH CSV HEADER"
psql -U postgres -d bankim_content -c "\copy professions (id, key, name_en, name_he, name_ru, category, is_active) FROM '/tmp/professions_data.csv' WITH CSV HEADER"

echo -e "${YELLOW}Step 5: Copying banks translation data...${NC}"
psql -U postgres -d bankim_core -c "\copy (SELECT id, name_en, name_he, name_ru FROM banks ORDER BY id) TO '/tmp/banks_data.csv' WITH CSV HEADER"
psql -U postgres -d bankim_content -c "\copy banks_translations (bank_id, name_en, name_he, name_ru) FROM '/tmp/banks_data.csv' WITH CSV HEADER"

# Step 6: Reset sequences in content_db
echo -e "${YELLOW}Step 6: Resetting sequences...${NC}"
psql -U postgres -d bankim_content -c "SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities));"
psql -U postgres -d bankim_content -c "SELECT setval('regions_id_seq', (SELECT MAX(id) FROM regions));"  
psql -U postgres -d bankim_content -c "SELECT setval('professions_id_seq', (SELECT MAX(id) FROM professions));"
psql -U postgres -d bankim_content -c "SELECT setval('banks_translations_id_seq', (SELECT MAX(id) FROM banks_translations));"

# Step 7: Cleanup temp files
rm -f /tmp/cities_data.csv /tmp/regions_data.csv /tmp/professions_data.csv /tmp/banks_data.csv

# Step 8: Validation
echo -e "${YELLOW}Step 8: Validation...${NC}"
psql -U postgres -d bankim_content -c "SELECT * FROM translation_tables_summary;"

echo -e "${GREEN}✅ Translation data copied successfully to content_db${NC}"
echo -e "${BLUE}Next step: Run cleanup script on core_db${NC}"