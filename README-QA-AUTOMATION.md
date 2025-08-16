# 🛠️ QA AUTOMATION ENVIRONMENT SWITCHER

Simple scripts to switch between development and production environments for automated testing.

## 🚀 Quick Start

### **Option 1: Environment Switcher (Manual)**
```bash
# Set development environment
./qa-env-switch.sh dev

# Set production environment  
./qa-env-switch.sh prod

# Check current status
./qa-env-switch.sh status

# Load environment and run test
source .env.qa && node test-remaining-bugs.js
```

### **Option 2: One-Click Test Runner (Automatic)**
```bash
# Run test on development
./qa-run.sh dev test-remaining-bugs.js

# Run test on production (safe mode)
./qa-run.sh prod test-remaining-bugs.js

# Run with defaults (dev environment, remaining bugs test)
./qa-run.sh
```

## 📋 Available Commands

### **Environment Switcher** (`qa-env-switch.sh`)
```bash
./qa-env-switch.sh dev              # Set development environment
./qa-env-switch.sh prod             # Set production environment  
./qa-env-switch.sh status           # Show current environment
./qa-env-switch.sh run <script>     # Quick run with current environment
./qa-env-switch.sh help             # Show help
```

### **Test Runner** (`qa-run.sh`)
```bash
./qa-run.sh [environment] [script]

# Examples:
./qa-run.sh dev test-remaining-bugs.js
./qa-run.sh prod verify-menu-fix-comprehensive.js
./qa-run.sh dev test-property-dropdown-fix.js
./qa-run.sh prod test-dropdown-debug.js
```

## 🏗️ How It Works

### **Environment Configuration**
The scripts create a `.env.qa` file with environment-specific settings:

#### **Development Environment** (`dev`)
```env
PLAYWRIGHT_BASE_URL="http://localhost:5173"
TEST_ENVIRONMENT="development"
CREATE_REAL_BUGS="true"
SAFETY_MODE="disabled"
JIRA_CREATE_REAL_ISSUES="true"
```

#### **Production Environment** (`prod`)
```env
PLAYWRIGHT_BASE_URL="https://dev2.bankimonline.com"
TEST_ENVIRONMENT="production"
CREATE_REAL_BUGS="false"
SAFETY_MODE="enabled"
JIRA_CREATE_REAL_ISSUES="false"
```

### **Safety Features**
- ✅ **Development**: Real JIRA tickets created, full testing enabled
- 🛡️ **Production**: No real JIRA tickets, safety mode enabled, local bug storage only

## 🧪 Available Test Scripts

| Script | Description |
|--------|-------------|
| `test-remaining-bugs.js` | Comprehensive bug testing |
| `verify-menu-fix-comprehensive.js` | Menu navigation testing |
| `test-property-dropdown-fix.js` | Property ownership dropdown testing |
| `test-dropdown-debug.js` | Dropdown debugging and analysis |

## 📊 Environment Status

Check your current environment:
```bash
./qa-env-switch.sh status
```

**Output Example:**
```
📊 CURRENT ENVIRONMENT STATUS:
----------------------------------------
✅ Environment file found: .env.qa
🚨 Environment: PRODUCTION  
📍 URL: https://dev2.bankimonline.com
🛡️ Mode: SAFE - No real bugs will be created
⚙️ Test Environment: production
🛡️ Bug Creation: DISABLED (Safe Mode)
----------------------------------------
```

## 🎯 Common Workflows

### **Test Development Changes**
```bash
# 1. Set development environment
./qa-env-switch.sh dev

# 2. Run comprehensive tests
./qa-run.sh dev test-remaining-bugs.js

# 3. Test specific components
./qa-run.sh dev test-property-dropdown-fix.js
```

### **Validate Production**
```bash
# 1. Set production environment (safe mode)
./qa-env-switch.sh prod

# 2. Run production validation
./qa-run.sh prod test-remaining-bugs.js

# 3. Test critical paths
./qa-run.sh prod verify-menu-fix-comprehensive.js
```

### **Compare Environments**
```bash
# Test on development
./qa-run.sh dev test-remaining-bugs.js > dev-results.log

# Test on production
./qa-run.sh prod test-remaining-bugs.js > prod-results.log

# Compare results
diff dev-results.log prod-results.log
```

## 🔧 Manual Environment Setup

If you prefer manual control:

### **Development Setup**
```bash
export PLAYWRIGHT_BASE_URL="http://localhost:5173"
export TEST_ENVIRONMENT="development"
export CREATE_REAL_BUGS="true"
export SAFETY_MODE="disabled"

node test-remaining-bugs.js
```

### **Production Setup**
```bash
export PLAYWRIGHT_BASE_URL="https://dev2.bankimonline.com"
export TEST_ENVIRONMENT="production"
export CREATE_REAL_BUGS="false"
export SAFETY_MODE="enabled"

node test-remaining-bugs.js
```

## 🚨 Production Safety

When testing on production (`https://dev2.bankimonline.com`):

### **Automatic Safety Features**
- 🛡️ **No Real JIRA Tickets**: All bugs saved locally only
- ⚠️ **Visual Warnings**: Red banners and warning modals
- 🔒 **Read-Only Mode**: Limited destructive actions
- 📱 **Safe Timeouts**: Shorter timeouts to avoid impact

### **What You'll See**
- Red "🚨 PRODUCTION ENVIRONMENT" banners
- Bug buttons show "⚠️ LOG PROD BUG"
- Warning modals before any bug creation
- Console messages about safety mode

### **Emergency Stop**
```bash
# Kill all running tests
pkill -f node
pkill -f playwright

# Check for running processes
ps aux | grep -E "(node|playwright)"
```

## 📁 Generated Files

| File | Purpose |
|------|---------|
| `.env.qa` | Environment configuration |
| `production-bugs.json` | Locally saved production bugs |
| `qa-report-*.html` | Generated test reports |
| `screenshots/` | Test failure screenshots |

## 🎉 Examples

### **Quick Development Test**
```bash
./qa-run.sh dev
```

### **Comprehensive Production Validation**
```bash
./qa-run.sh prod test-remaining-bugs.js
./qa-run.sh prod verify-menu-fix-comprehensive.js
./qa-run.sh prod test-property-dropdown-fix.js
```

### **Debug Production Issues**
```bash
./qa-run.sh prod test-dropdown-debug.js
```

---

## 🔗 Related Files

- **Main Documentation**: `/server/docs/QA/ReportsCreations/reportDetails_afterEachRun.md`
- **Project Guide**: `/CLAUDE.md`
- **Test Scripts**: `test-*.js` and `verify-*.js`

**🛡️ Remember: Production testing is automatically safe - no real changes will be made to live environment!**