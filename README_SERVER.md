# BankIM Online API - Server Repository

## Overview
This repository contains the Node.js server-side code for the BankIM Online application. It provides REST API endpoints for the React client application.

## Remote Server Hierarchy

### SSH Server Structure
```
/var/www/bankim/
├── bankimonlineapi/          # Server repository
│   ├── mainapp/             # Main application directory
│   │   ├── server-db.js     # Main server entry point
│   │   ├── package.json     # Server dependencies
│   │   ├── .env.production  # Production environment variables
│   │   └── migrations/      # Database migration files
│   └── .git/                # Git repository
└── client/                  # Client repository (separate)
    ├── mainapp/             # React application
    │   ├── src/             # React source code
    │   ├── package.json     # Client dependencies
    │   └── .env             # Client environment variables
    └── .git/                # Git repository
```

## Environment Configuration

### Production Environment (.env.production)
```env
CONTENT_DATABASE_URL=postgresql://bankim_user:password@localhost:5432/bankim_content
DATABASE_URL=postgresql://bankim_user:password@localhost:5432/bankim_content
PORT=8003
NODE_ENV=production
```

### Database Configuration
- **Database Name:** `bankim_content`
- **User:** `bankim_user`
- **Port:** `5432` (PostgreSQL)
- **Host:** `localhost` (on SSH server)

## Build and Deployment Process

### 1. Server Setup
```bash
# SSH into server
ssh root@your-server-ip

# Navigate to server directory
cd /var/www/bankim/bankimonlineapi

# Install dependencies
npm install

# Set up environment
cp .env.example .env.production
# Edit .env.production with correct database credentials
```

### 2. Database Setup
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE bankim_content;
CREATE USER bankim_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bankim_content TO bankim_user;
\q

# Import data from Railway backup
psql -U bankim_user -d bankim_content -f railway_backup.sql
```

### 3. Start Server with PM2
```bash
# Start server
pm2 start mainapp/server-db.js --name "bankim-server"

# Check status
pm2 status

# View logs
pm2 logs bankim-server
```

## File Locations and Purposes

### Core Server Files
- `mainapp/server-db.js` - Main server entry point
- `mainapp/package.json` - Server dependencies and scripts
- `mainapp/.env.production` - Production environment variables
- `mainapp/migrations/` - Database migration files

### Database Files
- `railway_backup.sql` - Database backup from Railway
- PostgreSQL configuration files in `/etc/postgresql/`

### PM2 Configuration
- PM2 processes managed via `pm2` command
- Configuration saved with `pm2 save`
- Auto-start on reboot with `pm2 startup`

## API Endpoints

### Base URL
- **Development:** `http://localhost:8003`
- **Production:** `http://your-server-ip:8003`

### Available Endpoints
- `/api/v1/content` - Content management
- `/api/v1/translations` - Translation management
- `/api/v1/locales` - Locale management

## Database Schema

### Main Tables
- `content_items` - Content management
- `content_translations` - Translation data
- `locales` - Supported locales

## Monitoring and Maintenance

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs bankim-server

# Restart server
pm2 restart bankim-server

# Monitor resources
pm2 monit

# Save configuration
pm2 save
```

### Database Maintenance
```bash
# Backup database
pg_dump -U bankim_user bankim_content > backup_$(date +%Y%m%d).sql

# Restore database
psql -U bankim_user -d bankim_content < backup_file.sql
```

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check PostgreSQL service: `sudo systemctl status postgresql`
   - Verify credentials in `.env.production`
   - Check `pg_hba.conf` for authentication settings

2. **Port Already in Use**
   - Check if another process is using port 8003: `netstat -tulpn | grep 8003`
   - Kill process or change port in `.env.production`

3. **PM2 Process Not Starting**
   - Check logs: `pm2 logs bankim-server`
   - Restart PM2: `pm2 restart bankim-server`

## Security Considerations

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 8003  # Server API
sudo ufw allow 5432  # PostgreSQL (if external access needed)
```

### Database Security
- Use strong passwords for database users
- Limit database access to localhost only
- Regular security updates for PostgreSQL

## Backup Strategy

### Automated Backups
```bash
# Create backup script
cat > /var/www/bankim/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U bankim_user bankim_content > /var/www/bankim/backups/backup_$DATE.sql
find /var/www/bankim/backups/ -name "backup_*.sql" -mtime +7 -delete
EOF

# Make executable and add to cron
chmod +x /var/www/bankim/backup.sh
crontab -e
# Add: 0 2 * * * /var/www/bankim/backup.sh
```

## Repository Management

### Git Workflow
```bash
# Pull latest changes
git pull origin main

# Check status
git status

# View recent commits
git log --oneline -10
```

### Branch Strategy
- `main` - Production-ready code
- `php-legacy` - Legacy PHP code (archived)
- Feature branches for development

## Contact and Support
- **Repository:** `bankimonlineapi`
- **Server Location:** SSH server at `/var/www/bankim/bankimonlineapi`
- **PM2 Process:** `bankim-server`
- **Port:** 8003 