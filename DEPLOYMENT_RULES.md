# DEPLOYMENT RULES & BEST PRACTICES

## 🚨 CRITICAL DEPLOYMENT RULES

### Rule 1: NGINX Configuration MUST Be Environment-Specific
- **TEST Server**: `server_name dev2.bankimonline.com;`
- **PRODUCTION Server**: `server_name bankimonline.com www.bankimonline.com;`
- **NEVER** copy-paste NGINX configs between environments

### Rule 2: React Build MUST Be Served by NGINX
```nginx
# CORRECT - Serve React from build directory
root /var/www/bankim/current/build;
location / {
    try_files $uri $uri/ /index.html;
}

# WRONG - Proxying everything to Node.js
location / {
    proxy_pass http://localhost:8003;  # This serves API only!
}
```

### Rule 3: API Endpoints MUST Be Proxied Separately
```nginx
# Only /api/* goes to Node.js
location /api {
    proxy_pass http://localhost:8003;
}
```

### Rule 4: PM2 Environment MUST Match Server
- **TEST**: `pm2 start ecosystem.config.js --env test`
- **PRODUCTION**: `pm2 start ecosystem.config.js --env production`
- **NEVER**: Use production env on test server

### Rule 5: Always Include ecosystem.config.js in Deployment
```javascript
// Required files for deployment:
- ecosystem.config.js      // PM2 configuration
- ecosystem.production.js  // Production-specific PM2 config
- server/server-db.js      // Node.js backend
- build/                   // React build output
```

## 📋 PRE-DEPLOYMENT CHECKLIST

Before pushing to main/production:

- [ ] NGINX config has correct domain for target environment
- [ ] NGINX serves React from `/build` directory
- [ ] NGINX only proxies `/api` to Node.js
- [ ] PM2 ecosystem config exists
- [ ] PM2 uses correct environment (test/production)
- [ ] Version update script (`version:update`) exists in package.json
- [ ] React build completes successfully
- [ ] No hardcoded URLs in React code

## 🧪 POST-DEPLOYMENT VALIDATION

After deployment, verify:

1. **Frontend loads**: `curl https://[domain]/ | grep "<div id=\"root\">"`
2. **API responds**: `curl https://[domain]/api/v1/health`
3. **Version updated**: Check version chip shows new version
4. **No 404 errors**: Static assets load correctly
5. **Database connected**: Content endpoints respond

## 🔧 TROUBLESHOOTING GUIDE

### Problem: 404 on domain root
**Cause**: NGINX not serving React build
**Fix**: Check `root` directive points to `/build`

### Problem: API Connection Refused
**Cause**: PM2 not running or wrong port
**Fix**: Check `pm2 status` and restart with correct ecosystem config

### Problem: Old version still showing
**Cause**: Browser cache or wrong deployment target
**Fix**: Hard refresh (Ctrl+Shift+R) or check deployment logs

### Problem: CORS errors
**Cause**: Frontend calling wrong backend URL
**Fix**: Ensure frontend uses relative `/api` paths, not absolute URLs

## 🤖 USING DEVOPS-MASTER SUB-AGENT

For complex deployments, use the devops-master sub-agent:

```javascript
// Use for:
- SSH server access and diagnostics
- PM2 process management
- NGINX configuration updates
- Database connection fixes
- Blue-green deployment orchestration

// Example:
await Task({
  subagent_type: "devops-master",
  description: "Fix deployment issue",
  prompt: "SSH to server and fix NGINX configuration..."
})
```

## 📊 MONITORING & ALERTS

Set up monitoring for:
- NGINX status (port 80/443)
- Node.js API (port 8003)
- PM2 process health
- Database connectivity
- Disk space on /var/www
- Memory usage

## 🔄 ROLLBACK PROCEDURE

If deployment fails:
1. Switch symlink back: `ln -sfn /var/www/bankim/blue /var/www/bankim/current`
2. Restart PM2: `pm2 restart bankim-api`
3. Reload NGINX: `nginx -s reload`
4. Verify old version is restored

## 📝 DEPLOYMENT ARCHITECTURE

```
/var/www/bankim/
├── blue/               # Previous deployment
├── green/              # New deployment
├── current -> green/   # Symlink to active version
└── current/
    ├── server/         # Node.js backend
    ├── build/          # React frontend (served by NGINX)
    ├── ecosystem.config.js
    └── package.json
```

## ⚠️ NEVER DO THIS

1. **NEVER** deploy without ecosystem.config.js
2. **NEVER** use production environment on test server
3. **NEVER** proxy all traffic to Node.js (React needs static serving)
4. **NEVER** hardcode server URLs in frontend code
5. **NEVER** skip deployment validation tests
6. **NEVER** copy NGINX config between environments without updating domain

---

Last Updated: August 24, 2025
Deployment Issues Fixed: NGINX configuration, PM2 environment, React serving