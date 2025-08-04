# BankIM Online - Banking Application

## 🚀 Quick Start

### Dual Repository Setup
This project maintains two GitHub repositories that must be kept in sync:
- **Main Repo**: https://github.com/MichaelMishaev/bankDev2_standalone
- **Server Repo**: https://github.com/MichaelMishaev/bankimonlineapi

### Push to Both Repositories
```bash
# Automated push to both repos (recommended)
./push-to-both-repos.sh "Your commit message"

# Manual push
git add . && git commit -m "Update" && git push origin main && git push bankimonlineapi main
```

📖 **Detailed instructions**: See [GITHUB_PUSH_INSTRUCTIONS.md](./GITHUB_PUSH_INSTRUCTIONS.md)

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
├── backup1_2025-05-27_00-36-37.sql  # Production database backup
└── README.md            # This file
```

## 🔐 Authentication Flow Analysis

### Current Implementation (Mock)
The application currently uses **mock authentication** with the following flow:

#### 📱 SMS Login Process
1. **User Input**: Name + Phone number in popup modal
2. **API Call**: `POST /api/sms-login` (⚠️ **Currently Missing Endpoint**)
3. **SMS Code Screen**: Shows verification code input
4. **Code Verification**: `POST /api/sms-code-login` 
5. **Mock Response**: Returns fake JWT token and user data
6. **Local Storage**: Saves user data to browser only

#### 🔍 Key Components
- **LoginModal**: `mainapp/src/pages/Services/pages/Modals/LoginModal/`
- **LoginForm**: Main form component with name/phone inputs
- **PhoneInput**: Custom phone number input component
- **Code Verification**: SMS code validation screen

#### 📊 API Endpoints (Current Mock)
```javascript
// Working endpoints in server.js:
POST /api/sms-password-login  // Mock SMS sending
POST /api/sms-code-login      // Mock code verification

// Missing endpoint (causes generic response):
POST /api/sms-login           // Initial phone/name submission
```

### 🗄️ Database Structure Analysis

#### ✅ **REAL DATABASE AVAILABLE!**
The project includes `backup1_2025-05-27_00-36-37.sql` (5.2MB) containing a **complete production database** with:

#### 👥 Users Table Structure
```sql
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,        -- ✅ Matches frontend phoneNumber
  `email` varchar(255) NOT NULL,            -- ✅ Matches frontend email
  `password` varchar(255),                  -- ✅ Hashed passwords
  `role` varchar(255),                      -- admin/user roles
  `created_at` timestamp,
  `updated_at` timestamp,
  -- Additional fields for profile, verification, etc.
)
```

#### 🏦 Banks Table (Real Data)
```sql
-- Contains actual Israeli banks:
INSERT INTO `banks` VALUES 
(1,1,'...','Государственный банк Израиля','State Bank of Israel','בנק מדינת ישראל','http://www.bankisrael.gov.il/',...),
-- + More real bank data
```

#### 💳 Financial Tables
- `client_credits` - Credit applications
- `credit_rates` - Interest rates by bank
- `programs` - Loan programs
- `cities` - Location data
- `locales` - Multi-language content

#### 📈 Production-Ready Features
- ✅ **Real user authentication system**
- ✅ **Actual Israeli bank data**
- ✅ **Complete mortgage/credit calculations**
- ✅ **Multi-language support (RU/HE/EN)**
- ✅ **Client management system**
- ✅ **Document handling**
- ✅ **Rate calculations**

### 🔄 Migration Path: Mock → Database

#### Current State: Mock Only
```
User Input → Mock API (server.js) → Fake Response → localStorage
```

#### Potential: Full Database Integration
```
User Input → Real API (PHP/Laravel) → MySQL Database → JWT Auth → Full Features
```

#### 🛠️ What's Needed for Database Connection:
1. **Backend API Server** (likely PHP/Laravel based on schema)
2. **MySQL Database** (restore from backup1_2025-05-27_00-36-37.sql)
3. **Environment Configuration** (.env with DB credentials)
4. **API Endpoint Implementation** (replace mock endpoints)
5. **Authentication Middleware** (JWT token handling)

#### 📋 Database Connection Benefits:
- 🔐 **Real user accounts** instead of mock data
- 💾 **Persistent data** across sessions
- 🏦 **Actual bank integrations** and rates
- 📊 **Complete financial calculations**
- 👥 **Multi-user support** with roles
- 📱 **Real SMS integration** capability
- 🌐 **Production-ready** multi-language system

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
| **Database** | MySQL (backup available) | Production data storage |
| **Backend** | PHP/Laravel (inferred) | Production API server |

## 📊 Features Included

### ✅ Working Features (Mock Mode)
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
- `POST /api/sms-code-login` - Mock SMS verification

### 🚀 Potential Features (With Database)
- 🔐 **Real user authentication** with JWT tokens
- 💾 **Persistent user profiles** and preferences
- 📊 **Actual bank rate calculations** from database
- 📱 **Real SMS integration** for verification
- 👥 **Multi-user support** with admin panel
- 📄 **Document management** system
- 🏦 **Bank partner integrations**
- 📈 **Financial analytics** and reporting

## 🎯 Use Cases

### 🧑‍💻 **For Developers**
- Frontend development without backend setup
- Component testing with predictable data
- UI/UX prototyping and demos
- **Database schema analysis** and planning

### 📈 **For Demos**
- Client presentations
- Stakeholder reviews
- Trade show demonstrations
- **Production capability showcase**

### 🏃‍♂️ **For Quick Testing**
- Feature validation
- Performance testing
- Cross-browser compatibility
- **Authentication flow testing**

### 🏦 **For Production Planning**
- **Real database structure** available
- **Complete user management** system ready
- **Bank integration** framework in place
- **Multi-language** content management

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

# Database analysis
mysql -u root -p < backup1_2025-05-27_00-36-37.sql  # Restore database
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

### Database Configuration (For Production)
1. **Restore Database**: Import `backup1_2025-05-27_00-36-37.sql`
2. **Setup Backend**: Configure PHP/Laravel API server
3. **Environment Variables**: Set database credentials
4. **Update API Base URL**: Point to real backend instead of mock

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

### Authentication Issues
- ⚠️ **Missing Endpoint**: `/api/sms-login` needs implementation in `server.js`
- 🔄 **Mock Flow**: Currently uses fake SMS codes (any code works)
- 💾 **Data Loss**: User data only stored in browser localStorage
- 🔐 **No Security**: Mock JWT tokens have no validation

## 🗄️ **Railway PostgreSQL Database Integration**

### **✅ Database Connection Status: ACTIVE**

The application is now connected to a **live Railway PostgreSQL database** with real production data.

### **📊 Database Structure**

| Table | Purpose | Key Columns | Records |
|-------|---------|-------------|---------|
| **`banks`** | Israeli bank information | `name_ru`, `name_en`, `name_he`, `logo`, `url`, `priority` | 15+ banks |
| **`clients`** | Client registrations (SMS Auth) | `first_name`, `last_name`, `phone`, `email` | 350+ clients |
| **`users`** | Admin/staff accounts (Email Auth) | `name`, `email`, `password`, `role` | 5+ users |
| **`locales`** | Multi-language content | `key`, `name_ru`, `name_en`, `name_he`, `page_id` | 1600+ entries |
| **`params`** | System configuration | `key`, `value`, multilingual names | 25+ params |

### **🔐 Authentication System**

#### **Dual Authentication Model:**
- **📱 Phone-based (SMS)**: Uses `clients` table for customer registration/login
- **📧 Email-based**: Uses `users` table for admin/staff access

### **🧪 Login Testing Data**

#### **📱 SMS Phone Login (Customer Access):**
```
Phone Number: +972501234567
SMS Code: Any 4-digit code (e.g., 1234)
Result: Auto-creates client record, returns JWT token
```

#### **📧 Admin Login (if implementing email auth):**
```
Admin Email: ceo@bankimonline.com
Test Email: newuser@bankim.com  
Result: Authenticates against users table
```

### **🏦 Live Bank Data Available:**
1. **Государственный банк Израиля** / State Bank of Israel
2. **Банк Хапоалим** / Bank Hapoalim  
3. **Банк Дисконт** / Discount Bank
4. **Mizrahi Tefahot Bank**
5. *...and 10+ more Israeli banks with logos, URLs, and priority ratings*

### **🔧 Database Testing Commands**
```bash
# Test database connection
node test-railway-simple.js

# Check database structure  
node check-db-structure.js

# Test login flow and registration
node test-login-flow.js
```

### **🚀 Production Features Now Available:**
- ✅ **Real user registration** - Creates actual client records
- ✅ **Persistent authentication** - JWT tokens with database validation
- ✅ **Live bank data** - Actual Israeli bank information with logos
- ✅ **Multi-language content** - 1600+ localized text entries
- ✅ **System configuration** - Live parameter management
- ✅ **CRUD operations** - Full database read/write capabilities

## 🔐 Security Note

⚠️ **Current State: Development/Demo Only**
- Uses mock authentication (no real security)
- Contains hardcoded demo data
- **Not suitable for production use**

✅ **Production Potential: Enterprise Ready**
- Real database with proper user management
- Hashed passwords and JWT authentication
- Complete audit trail and logging
- Multi-role access control system

## 📞 Support

For issues with this standalone version:
1. Check that Node.js 14+ is installed
2. Ensure ports 5173 and 8003 are available
3. Try rerunning `npm install` in both directories
4. Use `stop-standalone.bat` before restarting

For database integration questions:
1. Analyze the `backup1_2025-05-27_00-36-37.sql` file
2. Review the existing table structures
3. Plan backend API implementation
4. Consider Laravel/PHP framework setup

## 🎉 Benefits of Standalone Version

✅ **No PHP required** - Pure Node.js/React  
✅ **No database setup** - Uses mock JSON data  
✅ **Portable** - Copy folder to any machine  
✅ **Fast startup** - 30 seconds vs 5+ minutes  
✅ **Lightweight** - ~100MB vs 1GB+ full stack  
✅ **Demo ready** - Perfect for presentations  

## 🚀 Production Upgrade Path

✅ **Database Available** - Complete MySQL schema with real data  
✅ **Schema Matches** - Frontend forms align with database fields  
✅ **Multi-language Ready** - Translation system in database  
✅ **Bank Data Included** - Real Israeli bank information  
✅ **User Management** - Complete authentication system  
✅ **Scalable Architecture** - Production-ready structure  

---

**Made with ❤️ for the Bankimonline development team** 

*This standalone version provides both immediate demo capabilities and a clear path to full production deployment with the included database backup.* #   T r i g g e r   d e p l o y m e n t 
 
 #   T r i g g e r   d e p l o y m e n t   w i t h   f i x e d   v e r c e l . j s o n 
 
 #   R a i l w a y   d e p l o y m e n t   f i x   0 6 / 1 8 / 2 0 2 5   1 4 : 1 1 : 4 1 
 
 