# 📦 Railway to Local Database Migration Guide

## Current Situation
- **Railway databases are inaccessible** from your network (timeout errors)
- **Local databases are set up and working** (bankim_core, bankim_content, bankim_management)
- **You want to migrate the latest data** from Railway to local

## Migration Options

### Option 1: Railway Dashboard (Recommended) 🌟
1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Navigate to your project**
3. **For each database (maglev/core, shortline/content):**
   - Click on the PostgreSQL service
   - Go to the "Data" tab
   - Click "Create Backup"
   - Download the backup file (.sql)
4. **Import to local databases:**
   ```bash
   # For main database
   psql -U michaelmishayev -d bankim_core < railway_main_backup.sql
   
   # For content database
   psql -U michaelmishayev -d bankim_content < railway_content_backup.sql
   ```

### Option 2: Railway CLI Connection 🚂
```bash
# Connect to Railway PostgreSQL directly
railway connect postgres

# Once connected, export tables
\copy content_items TO '/tmp/content_items.csv' CSV HEADER
\copy content_translations TO '/tmp/content_translations.csv' CSV HEADER

# Exit Railway connection
\q

# Import to local database
psql -U michaelmishayev -d bankim_content << EOF
\copy content_items FROM '/tmp/content_items.csv' CSV HEADER
\copy content_translations FROM '/tmp/content_translations.csv' CSV HEADER
EOF
```

### Option 3: Use Railway's Built-in Backup Feature 💾
1. In Railway dashboard, go to PostgreSQL service
2. Click on "Settings" tab
3. Look for "Backups" section
4. Enable automatic backups or create manual backup
5. Download and restore locally

### Option 4: Temporary VPN/Proxy Solution 🌐
If the timeout is due to network restrictions:
1. Try using a VPN to change your network route
2. Or use Railway's private networking feature
3. Or access from a different network/location

## Quick Check: What Tables Need Migration?

### Critical Tables for Content Database:
- `content_items` - UI text and labels
- `content_translations` - Multi-language translations
- Any custom content tables

### Critical Tables for Main Database:
- `clients` - User accounts
- `banks` - Bank configurations
- `locales` - Legacy translations
- `params` - System parameters
- Financial calculation tables

## Post-Migration Verification

```bash
# Check content items count
psql -U michaelmishayev -d bankim_content -c "SELECT COUNT(*) FROM content_items;"

# Check translations count
psql -U michaelmishayev -d bankim_content -c "SELECT COUNT(*) FROM content_translations;"

# Verify refinance translations
psql -U michaelmishayev -d bankim_content -c "
  SELECT ci.content_key, ct.content_value 
  FROM content_items ci 
  JOIN content_translations ct ON ci.id = ct.content_item_id 
  WHERE ci.screen_location = 'refinance_step1' 
    AND ct.language_code = 'he'
  LIMIT 5;
"
```

## Current Local Database Status
✅ **Databases exist locally:**
- bankim_core
- bankim_content  
- bankim_management

✅ **Refinance translations added locally:**
- app.refinance.step1.title
- app.refinance.step1.property_value_label
- app.refinance.step1.balance_label

⚠️ **Need to migrate from Railway:**
- All other content and data
- Recent changes made in production
- User data and configurations

## Emergency Workaround
If you can't migrate immediately but need to continue development:
1. Your local databases have the essential structure
2. The refinance translations are already fixed locally
3. You can continue development using local databases
4. Schedule Railway migration for when network access improves

## Contact Railway Support
If connection issues persist:
- Email: team@railway.app
- Discord: https://discord.gg/railway
- Status page: https://status.railway.app/