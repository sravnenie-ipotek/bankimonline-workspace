# BankIM - Quick Start Guide for Development

## 🚀 How to Launch the Application

### Option 1: Start Both Servers Together (Recommended)
```bash
node start-dev.js
```
This will start:
- **API Server** on `http://localhost:8003` (handles all backend logic)
- **File Server** on `http://localhost:3001` (serves the React app)

### Option 2: Start Servers Separately
```bash
# Terminal 1 - Start API Server
node server-db.js

# Terminal 2 - Start File Server  
node serve.js
```

## 🌐 Application URLs

- **Main Website**: http://localhost:3001/
- **Admin Panel**: http://localhost:3001/admin-panel
- **Customer Calculator**: http://localhost:3001/customer-approval-check
- **API Health**: http://localhost:8003/api/admin/stats

## 📱 SMS Login (Development Mode)

The SMS login is **MOCKED** for development:

1. **Enter any phone number** in the login form
2. **Check the server console** for the generated OTP code
3. **Enter the displayed code** to complete login
4. System will auto-create user account if needed

**Example Console Output:**
```
[SMS] Request for: +972501234567
*** SMS CODE: 4829 ***
```

## 🔧 Troubleshooting

### "Connection Refused" Error
If you see: `POST http://localhost:8003/api/sms-login net::ERR_CONNECTION_REFUSED`

**Solution**: The API server is not running. Use `node start-dev.js` to start both servers.

### Port Already in Use
If port 3001 or 8003 is busy:
```bash
# Find process using the port
netstat -ano | findstr :3001
netstat -ano | findstr :8003

# Kill the process (replace XXXX with actual PID)
taskkill /PID XXXX /F
```

### Database Connection Issues
Make sure you have the correct database URL in your environment or the fallback URL in `server-db.js` is accessible.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   API Server    │
│   Port 3001     │───▶│   Port 8003     │
│   (Frontend)    │    │   (Backend)     │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼──────▶ PostgreSQL Database
                                 │
                    ┌─────────────▼──────────┐
                    │   File System         │
                    │   (Static Files)      │
                    └────────────────────────┘
```

## 📋 Development Features

- ✅ **Hot Reload**: React app rebuilds automatically
- ✅ **Mock SMS**: No real SMS service needed
- ✅ **Database**: Full PostgreSQL integration
- ✅ **Admin Panel**: Complete admin interface
- ✅ **Multi-language**: Hebrew, Russian, English support
- ✅ **Banking Logic**: Loan calculations, applications, tracking

## 🔒 Test Credentials

**Admin Login** (admin.html):
- Email: `test@test`
- Password: `test`

**SMS Login** (main app):
- Any phone number works
- Use code shown in console

## 📝 Next Steps

1. **Start Development**: `node start-dev.js`
2. **Open Browser**: http://localhost:3001/
3. **Test Features**: Try loan calculators, SMS login, admin panel
4. **Check Logs**: Monitor both server consoles for debugging

---
**Note**: This is a development setup. See `TODO_BEFORE_PRODUCTION.txt` for production deployment requirements. 