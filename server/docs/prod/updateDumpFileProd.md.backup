# PM2 DUMP ENVIRONMENT UPDATE PROCEDURE

**⚠️ CRITICAL: This production uses PM2 dump, NOT .env files!**

## STEP 1: CREATE BACKUPS (MANDATORY)
```bash
# Create timestamped backup of current dump
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
cp ~/.pm2/dump.pm2 /var/www/bankim/config-backups/pm2-dump-${BACKUP_DATE}.pm2

# Verify backup was created
ls -la /var/www/bankim/config-backups/pm2-dump-${BACKUP_DATE}.pm2

# Export current environment for reference
pm2 show bankim-online-server > /var/www/bankim/config-backups/env-${BACKUP_DATE}.txt
```

## STEP 2: PREPARE NEW ENVIRONMENT VARIABLES
```bash
# Current production values (update as needed):
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bankim_core"
export CONTENT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bankim_content"
export MANAGEMENT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bankim_management"
export JWT_SECRET="ADD_YOUR_SECURE_SECRET_HERE"  # ⚠️ Currently using weak default
export PORT="8004"
export NODE_ENV="production"

# Add any NEW variables here:
# export NEW_VARIABLE="new_value"
```

## STEP 3: DELETE CURRENT PM2 PROCESS
```bash
# Stop and remove current process
pm2 delete bankim-online-server

# Verify deletion
pm2 status
```

## STEP 4: START WITH NEW ENVIRONMENT
```bash
# Start with ALL environment variables inline
DATABASE_URL="${DATABASE_URL}" \
CONTENT_DATABASE_URL="${CONTENT_DATABASE_URL}" \
MANAGEMENT_DATABASE_URL="${MANAGEMENT_DATABASE_URL}" \
JWT_SECRET="${JWT_SECRET}" \
PORT="${PORT}" \
NODE_ENV="${NODE_ENV}" \
pm2 start /var/www/bankim/online/api/server/server-db.js \
  --name bankim-online-server \
  -i 2 \
  --max-memory-restart 1G
```

## STEP 5: SAVE NEW CONFIGURATION (CRITICAL!)
```bash
# THIS STEP IS MANDATORY - Creates new dump with updated env
pm2 save

# Verify new dump was created
ls -la ~/.pm2/dump.pm2
date  # Note the time for logs
```

## STEP 6: VERIFY CHANGES
```bash
# Check process is running
pm2 status

# Verify environment variables were applied
pm2 show bankim-online-server | grep -A 30 "Revision"

# Test application
curl http://localhost:8004/api/health

# Check logs for errors
pm2 logs bankim-online-server --lines 50
```

## STEP 7: TEST PERSISTENCE
```bash
# Ensure changes survive PM2 restart
pm2 kill
pm2 resurrect
pm2 status

# Test systemd service restart
sudo systemctl restart pm2-root
sleep 5
pm2 status

# Verify app still works
curl http://localhost:8004/api/health
```

## ROLLBACK PROCEDURE (IF NEEDED)
```bash
# If something goes wrong, restore from backup
pm2 kill
cp /var/www/bankim/config-backups/pm2-dump-${BACKUP_DATE}.pm2 ~/.pm2/dump.pm2
pm2 resurrect
pm2 status
```

## COMMON VARIABLES TO UPDATE

### Security Fixes (PRIORITY)
- `JWT_SECRET` - Replace weak 'secret' with strong value
- `JWT_BANK_SECRET` - Replace 'bank-employee-secret' with strong value

### Database Changes
- `DATABASE_URL` - Main application database
- `CONTENT_DATABASE_URL` - CMS content database  
- `MANAGEMENT_DATABASE_URL` - Admin management database

### Application Settings
- `PORT` - Server port (currently 8004)
- `NODE_ENV` - Environment (keep as 'production')
- `CORS_ORIGINS` - Allowed origins if needed

## ⚠️ WARNINGS

1. **NEVER** skip the `pm2 save` command - changes will be lost!
2. **NEVER** edit .env files - they are NOT used in production!
3. **ALWAYS** create backup before making changes
4. **ALWAYS** test that changes survive reboot
5. **REMEMBER** This server has been stable since Aug 14, 2025 - be careful!

## VERIFICATION CHECKLIST

- [ ] Backup created in `/var/www/bankim/config-backups/`
- [ ] All environment variables set correctly
- [ ] PM2 process deleted and recreated
- [ ] `pm2 save` executed successfully
- [ ] Application responds on port 8004
- [ ] Changes survive `pm2 kill && pm2 resurrect`
- [ ] Changes survive `systemctl restart pm2-root`
- [ ] No errors in PM2 logs

## EMERGENCY CONTACTS

- PM2 dump location: `~/.pm2/dump.pm2`
- Backup directory: `/var/www/bankim/config-backups/`
- Application directory: `/var/www/bankim/online/api`
- Logs: `pm2 logs bankim-online-server`
- Server access: Root SSH available

---
**Last Updated**: August 16, 2025
**Architecture**: PM2-dump-driven (NOT .env files)
**Stable Since**: August 14, 2025