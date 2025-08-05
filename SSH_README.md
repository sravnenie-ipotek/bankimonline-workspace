# 🚀 BankimOnline Linux Server Deployment

## 🔐 SSH Connection Details

### Server Information
- **IP Address**: `185.253.72.80`
- **Username**: `root`
- **Password**: `PZy3oNaxQLTCvf`

### Connection Command
```bash
ssh root@185.253.72.80
```

### Alternative Connection Methods

#### Using PuTTY (Windows)
1. Open PuTTY
2. Enter IP: `185.253.72.80`
3. Port: `22`
4. Connection type: `SSH`
5. Click "Open"
6. Username: `root`
7. Password: `PZy3oNaxQLTCvf`

#### Using SSH Config (Recommended)
Add to your `~/.ssh/config`:
```
Host bankim-server
    HostName 185.253.72.80
    User root
    Port 22
```

Then connect with:
```bash
ssh bankim-server
```

## 🏗️ Deployment Architecture

### 3 Databases
- **bankim_core**: Main application data
- **bankim_content**: Content/translations
- **bankim_management**: Admin panel data (empty for now)

### Applications
- **Main Banking App**: React frontend
- **Admin Panel**: Separate React app
- **API Server**: Node.js/Express backend

## 📋 Quick Deployment Commands

### 1. Connect to Server
```bash
ssh root@185.253.72.80
```

### 2. Run Deployment Script
```bash
# Download and run deployment script
wget https://raw.githubusercontent.com/your-repo/deploy-linux-server.sh
chmod +x deploy-linux-server.sh
./deploy-linux-server.sh
```

### 3. Clone Repository
```bash
cd /var/www/bankim
git clone https://github.com/yourusername/bankim-main.git .
```

### 4. Install and Build
```bash
npm install
cd mainapp && npm install && npm run build && cd ..
```

### 5. Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Access URLs

- **Main Application**: `http://185.253.72.80/`
- **Admin Panel**: `http://185.253.72.80/admin-panel`
- **API Health**: `http://185.253.72.80/api/health`

## 🔧 Useful Commands

### Check Application Status
```bash
pm2 status
pm2 logs bankim-api
```

### Restart Application
```bash
pm2 restart bankim-api
```

### Check Database Connections
```bash
pg_isready -h localhost -U bankim_user -d bankim_core
pg_isready -h localhost -U bankim_user -d bankim_content
pg_isready -h localhost -U bankim_user -d bankim_management
```

### View Logs
```bash
# Application logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx
```

### Backup Databases
```bash
pg_dump -h localhost -U bankim_user bankim_core > backup_core.sql
pg_dump -h localhost -U bankim_user bankim_content > backup_content.sql
pg_dump -h localhost -U bankim_user bankim_management > backup_management.sql
```

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test SSH connection
ssh -v root@185.253.72.80

# Check if server is reachable
ping 185.253.72.80
```

### Application Issues
```bash
# Check if Node.js is running
ps aux | grep node

# Check if PM2 is running
pm2 status

# Check environment variables
cat /var/www/bankim/.env
```

### Database Issues
```bash
# Check PostgreSQL status
systemctl status postgresql

# Test database connection
psql -h localhost -U bankim_user -d bankim_core -c "SELECT 1;"
```

## 🔒 Security Notes

⚠️ **IMPORTANT**: 
- This file contains sensitive credentials
- Keep this file secure and don't commit to public repositories
- Consider using SSH keys instead of password authentication
- Change default passwords after deployment

### Recommended Security Steps
1. **Set up SSH keys** for passwordless login
2. **Change root password** after deployment
3. **Configure firewall** rules
4. **Set up SSL certificate** for HTTPS
5. **Regular security updates**

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs bankim-api`
2. Verify database connections
3. Check Nginx configuration: `nginx -t`
4. Restart services if needed

---

**Last Updated**: January 2025  
**Server**: 185.253.72.80  
**Status**: Ready for deployment 