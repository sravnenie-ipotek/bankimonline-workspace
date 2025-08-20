# SSH Deployment Setup for root@45.83.42.74

## 🔑 Required GitHub Secrets

To use the updated world-class CI/CD pipeline, you need to configure the following secrets in your GitHub repository:

### SSH Connection Secrets
- **`SSH_PRIVATE_KEY`**: Private SSH key for root@45.83.42.74
  - Generate with: `ssh-keygen -t ed25519 -C "github-actions@bankimonline.com"`
  - Add public key to server: `~/.ssh/authorized_keys`

### Database Connection Secrets
- **`DATABASE_URL`**: Primary PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
- **`MAGLEV_DATABASE_URL`**: Maglev database (main application data)
- **`SHORTLINE_DATABASE_URL`**: Shortline database (content/dropdowns)

### Application Secrets
- **`JWT_SECRET`**: JWT signing secret (generate with: `openssl rand -hex 64`)

### Optional Monitoring Secrets
- **`MONITORING_WEBHOOK`**: Webhook URL for deployment notifications
- **`SUCCESS_WEBHOOK`**: Success notification webhook
- **`FAILURE_WEBHOOK`**: Failure notification webhook

## 🔧 SSH Server Setup Commands

Run these commands on root@45.83.42.74 to prepare the server:

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install essential tools
apt-get update && apt-get install -y curl jq git build-essential

# Create deployment directory structure
mkdir -p /opt/bankimonline/{app,scripts,logs,backups,releases}
chown -R root:root /opt/bankimonline
chmod -R 755 /opt/bankimonline

# Set up log rotation
cat > /etc/logrotate.d/bankimonline << 'LOGROTATE_EOF'
/opt/bankimonline/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
LOGROTATE_EOF

# Set up firewall (if using ufw)
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8003/tcp  # API server
# ufw enable  # Uncomment if firewall is not enabled
```

## 🚀 Manual Deployment Test

Test the deployment manually before using CI/CD:

```bash
# SSH to server
ssh root@45.83.42.74

# Clone repository
cd /opt/bankimonline/app
git clone https://github.com/MichaelMishaev/bankDev2_standalone.git
cd bankDev2_standalone

# Install dependencies
npm ci --production=false
cd mainapp && npm ci --production=false && cd ..

# Build application
cd mainapp && npm run build && cd ..

# Set up environment
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=8003
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret_here
USE_JSONB_DROPDOWNS=true
CORS_ALLOWED_ORIGINS=https://bankimonline.com,https://dev2.bankimonline.com
EOF

# Start with PM2
cat > ecosystem.production.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bankimonline-prod-api',
    script: 'server/server-db.js',
    cwd: '/opt/bankimonline/app/bankDev2_standalone',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8003
    },
    error_file: '/opt/bankimonline/logs/prod-api-error.log',
    out_file: '/opt/bankimonline/logs/prod-api-out.log',
    log_file: '/opt/bankimonline/logs/prod-api-combined.log',
    time: true,
    max_restarts: 10,
    restart_delay: 5000,
    max_memory_restart: '1G'
  }]
};
EOF

pm2 start ecosystem.production.config.js
pm2 save
pm2 startup

# Test endpoints
curl http://localhost:8003/api/health
curl http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage
```

## 🏥 Health Monitoring

The deployment includes automatic health monitoring. Check logs:

```bash
# PM2 status
pm2 status
pm2 logs

# Application logs
tail -f /opt/bankimonline/logs/prod-api-combined.log

# Health monitoring logs
tail -f /opt/bankimonline/logs/health-monitor.log

# Deployment history
cat /opt/bankimonline/logs/deployments.log
```

## 🔄 Rollback Procedures

If deployment fails, rollback manually:

```bash
# Stop current deployment
pm2 delete ecosystem.production.config.js

# Find previous deployment
ls -la /opt/bankimonline/app/blue-*

# Restore previous deployment
cp -r /opt/bankimonline/app/blue-YYYYMMDD-HHMMSS /opt/bankimonline/app/current
cd /opt/bankimonline/app/current

# Start previous version
pm2 start ecosystem.production.config.js
```

## 🐛 Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Check SSH key is properly added to GitHub secrets
   - Verify public key is in `/root/.ssh/authorized_keys`
   - Test SSH connection manually: `ssh root@45.83.42.74`

2. **Database Connection Failed**
   - Verify `DATABASE_URL` secret is correct
   - Test connection from server: `node -e "const pg = require('pg'); const client = new pg.Client(process.env.DATABASE_URL); client.connect().then(() => console.log('Connected')).catch(console.error);"`

3. **PM2 Process Issues**
   - Check PM2 status: `pm2 status`
   - Restart PM2: `pm2 restart all`
   - Reset PM2: `pm2 delete all && pm2 kill`

4. **Port Already in Use**
   - Find process: `lsof -i :8003`
   - Kill process: `pkill -f server-db.js`

5. **Build Failures**
   - Check Node.js version: `node --version` (should be 20.x)
   - Clear npm cache: `npm cache clean --force`
   - Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`

### Debug Commands

```bash
# Check service status
systemctl status pm2-root
pm2 status
pm2 monit

# Check logs
journalctl -u pm2-root -f
pm2 logs --raw

# Test API manually
curl -v http://localhost:8003/api/health
curl -v http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage

# Check system resources
htop
df -h
free -h
```

## 🔐 Security Considerations

1. **SSH Key Security**
   - Use Ed25519 keys (more secure than RSA)
   - Restrict SSH key to specific commands if possible
   - Regularly rotate SSH keys

2. **Server Security**
   - Keep server updated: `apt update && apt upgrade`
   - Configure proper firewall rules
   - Use fail2ban for SSH protection
   - Regular security audits

3. **Application Security**
   - Ensure JWT secrets are strong (64+ characters)
   - Use HTTPS in production (configure nginx/apache proxy)
   - Regular dependency updates
   - Monitor for vulnerabilities

## 📊 Performance Monitoring

Set up additional monitoring:

```bash
# Install monitoring tools
npm install -g pm2-auto-pull
pm2 install pm2-server-monit

# Set up log monitoring
tail -f /opt/bankimonline/logs/health-monitor.log | grep "FAILED"
```

---

**Last Updated**: 2025-01-20  
**Version**: 1.0  
**Contact**: DevOps Team