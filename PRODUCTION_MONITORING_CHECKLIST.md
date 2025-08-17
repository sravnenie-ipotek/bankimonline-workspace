# 📋 PRODUCTION MONITORING CHECKLIST

## Daily Checks (5 minutes)

### Morning Check
- [ ] Run health check: `ssh root@45.83.42.74 'bash /opt/health-check.sh'`
- [ ] Check PM2 status: `pm2 list` (should show `bankimonline-monorepo`)
- [ ] Test critical endpoints via browser

### Evening Check
- [ ] Review PM2 logs: `pm2 logs --lines 50`
- [ ] Check error count in logs
- [ ] Verify all dropdowns working

## Weekly Checks (15 minutes)

### Monday Morning
- [ ] Full system health check
- [ ] Database connection test
- [ ] Review server resource usage
- [ ] Check for any pending updates

### Friday Afternoon
- [ ] Backup PM2 configuration: `pm2 save`
- [ ] Clear old logs: `pm2 flush`
- [ ] Test all critical user flows

## Red Flags to Watch For

### 🚨 CRITICAL - Immediate Action
- PM2 shows `bankimonline-api` instead of `bankimonline-monorepo`
- Any dropdown returns empty options
- Server using `server/server-db.js` instead of `packages/server/src/server.js`

### ⚠️ WARNING - Investigate Soon
- High memory usage (>80%)
- Slow API responses (>500ms)
- Errors in PM2 logs
- Cache not clearing properly

## Quick Fix Commands

### If dropdowns stop working:
```bash
ssh root@45.83.42.74
pm2 restart bankimonline-monorepo
curl -X POST http://localhost:8003/api/cache/clear
```

### If wrong server is running:
```bash
pm2 stop bankimonline-api
pm2 delete bankimonline-api
cd /opt/bankimonline*/packages/server
PORT=8003 pm2 start src/server.js --name bankimonline-monorepo -i 2
pm2 save
```

### To verify everything:
```bash
curl -s 'https://dev2.bankimonline.com/api/dropdowns/mortgage_step2/he' | grep -c family_status
# Should return > 0
```

## Deployment Rules

### ✅ ALWAYS DO
- Use `packages/server/src/server.js`
- Test locally first
- Run health check after deployment
- Save PM2 configuration

### ❌ NEVER DO
- Use `server/server-db.js`
- Deploy without testing
- Skip health checks
- Ignore PM2 logs

## Contact for Issues

1. Check this checklist first
2. Run `/opt/health-check.sh`
3. Review PRODUCTION_DEPLOYMENT_GUIDE.md
4. Check PM2 logs for errors

## Success Metrics

When everything is healthy:
- ✅ All dropdowns return data
- ✅ PM2 shows `bankimonline-monorepo`
- ✅ No errors in last 24 hours
- ✅ API response < 200ms
- ✅ Memory usage < 70%