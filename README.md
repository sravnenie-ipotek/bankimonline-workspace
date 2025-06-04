# 🏦 Bankimonline Standalone Application

A **lightweight, portable** React application with Node.js mock API backend. This is a self-contained version of the Bankimonline platform that runs **without PHP, databases, or complex infrastructure**.

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js 14+** - Download from [nodejs.org](https://nodejs.org/)
- **Windows 10/11** - Batch scripts included for easy launch

### 2. Launch the Application
Double-click **`start-standalone.bat`** and wait for both services to start.

### 3. Access the Application
- **React App**: http://localhost:5173
- **Mock API**: http://localhost:8003

## 📁 Project Structure

```
standAlone_bankim/
├── mainapp/              # React frontend application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── package.json      # React dependencies
│   └── vite.config.ts    # Build configuration
├── server.js             # Node.js mock API server
├── package.json          # API server dependencies
├── start-standalone.bat  # Launch script
├── stop-standalone.bat   # Stop script
└── README.md            # This file
```

## 🛠️ Manual Setup (if batch file fails)

### Install Dependencies
```bash
# Install Mock API dependencies
npm install

# Install React app dependencies
cd mainapp
npm install
cd ..
```

### Start Services
```bash
# Terminal 1: Start Mock API (port 8003)
npm start

# Terminal 2: Start React App (port 5173)
cd mainapp
npm run dev
```

## 🔧 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React + TypeScript + Vite | User interface |
| **Mock API** | Node.js + Express | Development backend |
| **Styling** | Tailwind CSS + SCSS | UI styling |
| **State Management** | Redux Toolkit | Application state |
| **Forms** | Formik + Yup | Form handling & validation |

## 📊 Features Included

### ✅ Working Features
- 🏠 **Homepage** with service overview
- 💰 **Mortgage Calculator** with parameter inputs
- 💳 **Credit Calculator** with loan parameters  
- 👤 **User Registration/Login** flow (mock data)
- 🏦 **Bank Selection** and filtering
- 📱 **Responsive Design** for mobile/desktop
- 🌐 **Multi-language** support (Russian/Hebrew/English)

### 🔄 Mock API Endpoints
- `GET /api/health` - Health check
- `GET /api/v1/params` - App configuration
- `GET /api/v1/banks` - Bank list
- `GET /api/v1/cities` - City list
- `GET /api/v1/locales` - Language options
- `POST /api/sms-password-login` - Mock login

## 🎯 Use Cases

### 🧑‍💻 **For Developers**
- Frontend development without backend setup
- Component testing with predictable data
- UI/UX prototyping and demos

### 📈 **For Demos**
- Client presentations
- Stakeholder reviews
- Trade show demonstrations

### 🏃‍♂️ **For Quick Testing**
- Feature validation
- Performance testing
- Cross-browser compatibility

## 🔄 Development Commands

```bash
# React app development
cd mainapp
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Mock API development
npm start            # Start API server
npm run dev          # Start with auto-reload (if nodemon installed)
```

## 📋 Configuration

### API Endpoint Configuration
The React app connects to the mock API at `http://localhost:8003`. To change this:

1. Look for API configuration in `mainapp/src/services/api.ts`
2. Update the base URL if needed

### Mock Data Customization
Edit `server.js` to modify:
- Bank list data
- City/location data  
- User authentication responses
- Form validation responses

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill processes on specific ports
taskkill /F /PID [PID_NUMBER]

# Or use the stop script
.\stop-standalone.bat
```

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules mainapp/node_modules
npm install
cd mainapp && npm install
```

### React App Won't Start
```bash
cd mainapp
npm install
npm run dev
```

## 🔐 Security Note

⚠️ **This is a development/demo application**
- Uses mock authentication (no real security)
- Contains hardcoded demo data
- **Not suitable for production use**

## 📞 Support

For issues with this standalone version:
1. Check that Node.js 14+ is installed
2. Ensure ports 5173 and 8003 are available
3. Try rerunning `npm install` in both directories
4. Use `stop-standalone.bat` before restarting

## 🎉 Benefits of Standalone Version

✅ **No PHP required** - Pure Node.js/React  
✅ **No database setup** - Uses mock JSON data  
✅ **Portable** - Copy folder to any machine  
✅ **Fast startup** - 30 seconds vs 5+ minutes  
✅ **Lightweight** - ~100MB vs 1GB+ full stack  
✅ **Demo ready** - Perfect for presentations  

---

**Made with ❤️ for the Bankimonline development team** 