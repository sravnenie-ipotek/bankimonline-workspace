# 🔍 PRODUCTION QA TESTING GUIDE

**Target Environment**: https://dev2.bankimonline.com  
**Test Documentation**: `/server/docs/QA/`  
**Last Updated**: August 17, 2025

## 📋 Quick Start - Run QA Tests

### Option 1: Quick Shell Script (Recommended)
```bash
# Make executable
chmod +x scripts/quick-production-qa.sh

# Run quick QA tests
./scripts/quick-production-qa.sh

# View report
cat qa-report-*.txt
```

### Option 2: Comprehensive Playwright Tests
```bash
# Install dependencies first
cd server/docs/QA
npm install playwright

# Run comprehensive tests
node ../../scripts/run-production-qa.js

# View HTML report
open qa-reports/*/qa-report.html
```

### Option 3: Manual Testing via Browser
1. Open https://dev2.bankimonline.com
2. Follow test cases in `server/docs/QA/*/instructions-react-updated.md`
3. Document results in spreadsheet or text file

## 🎯 Critical Test Areas

### 1. Mortgage Calculator Dropdowns (HIGHEST PRIORITY)
**URL**: https://dev2.bankimonline.com/services/calculate-mortgage/1

**Step 1 - Must Have Dropdowns**:
- ✅ Property Ownership (`propertyOwnership`)
- ✅ When do you need the mortgage (`when_needed`)  
- ✅ Is this your first home (`first_home`)

**Step 2 - Critical Dropdown**:
- ✅ Family Status (`family_status`)

**Test Procedure**:
```bash
# Quick API test
curl -s 'https://dev2.bankimonline.com/api/dropdowns/mortgage_step1/he' | grep -c "property_ownership"
# Should return > 0

curl -s 'https://dev2.bankimonline.com/api/dropdowns/mortgage_step2/he' | grep -c "family_status"
# Should return > 0
```

### 2. Menu Navigation
**Test**: Hamburger menu functionality
```javascript
// Look for burger menu button
.burger, [class*="burger"], [class*="menu-button"]

// Should open side panel with navigation items
```

### 3. Language Support
**Languages to Test**: Hebrew (he), English (en), Russian (ru)
- Each language should display appropriate content
- RTL support for Hebrew
- Language switcher should be visible

### 4. Form Validation
**Test Areas**:
- Required field validation
- Phone number format
- Email validation
- Numeric field constraints

## 📊 Test Report Structure

### Automated Reports Include:
```
qa-report-[timestamp].txt
├── Environment details
├── Test execution timestamp
├── Section: Page Accessibility
│   ├── Homepage status
│   ├── Calculator pages status
│   └── HTTP response codes
├── Section: API Endpoints
│   ├── Banks API
│   ├── Cities API
│   └── Locales API
├── Section: Critical Dropdowns
│   ├── Property ownership options
│   ├── Family status options
│   └── Other dropdown validations
├── Section: Language Support
│   └── Multi-language API responses
└── Summary
    ├── Total tests run
    ├── Pass/Fail/Warning counts
    └── Pass rate percentage
```

## 🔧 Test Configuration Files

### Key Test Files in `/server/docs/QA/`:

1. **Mortgage Tests**: `mortgageStep1,2,3,4/instructions-react-updated.md`
2. **Credit Tests**: `calculateCredit1,2,3,4/instructions-react-updated.md`
3. **Menu Tests**: `menu-navigation/comprehensive-menu-testing-instructions.md`
4. **Responsive Tests**: `ResponsiveTest/comprehensive-responsive-test-suite.cy.ts`

## 🚨 Common Issues & Solutions

### Issue 1: Dropdowns Empty
**Symptom**: Dropdown exists but has no options
**Check**:
```bash
# Verify correct server is running
ssh root@45.83.42.74 'pm2 list | grep bankimonline-monorepo'

# Check API response
curl -s 'https://dev2.bankimonline.com/api/dropdowns/mortgage_step1/he' | jq
```

### Issue 2: 404 Errors on API
**Symptom**: API endpoints return 404
**Check**:
- Verify nginx proxy configuration
- Check PM2 process is running on port 8003
- Verify `/api` routes are proxied correctly

### Issue 3: Language Not Switching
**Symptom**: Language buttons don't change content
**Check**:
- localStorage for language preference
- Translation files loaded correctly
- API returning localized content

## 📈 Pass/Fail Criteria

### Critical (Must Pass):
- [ ] All mortgage calculator dropdowns have options
- [ ] Homepage loads successfully
- [ ] API endpoints respond with 200 status
- [ ] Menu navigation works

### Important (Should Pass):
- [ ] All three languages work
- [ ] Form validation shows errors
- [ ] Cities dropdown is searchable
- [ ] Mobile responsive layout works

### Nice to Have:
- [ ] Performance < 3s page load
- [ ] All images load correctly
- [ ] No console errors
- [ ] Accessibility standards met

## 🔄 Continuous QA Process

### Daily Checks (5 minutes):
```bash
# Run quick QA
./scripts/quick-production-qa.sh

# If failures, run health check
./scripts/production-health-check.sh
```

### Weekly Full Test (30 minutes):
```bash
# Run comprehensive Playwright tests
node scripts/run-production-qa.js

# Review HTML report for details
# File screenshots for visual regression
```

### After Each Deployment:
1. Run quick QA immediately
2. Test all critical user flows
3. Verify no regressions from previous version
4. Document any new issues

## 📝 Manual Test Checklist

If automated tests aren't available, use this checklist:

### Mortgage Calculator Flow:
- [ ] Navigate to calculate-mortgage/1
- [ ] Property ownership dropdown has 3 options
- [ ] Can select city from dropdown
- [ ] Slider for initial payment works
- [ ] Continue button proceeds to step 2
- [ ] Step 2: Family status dropdown works
- [ ] Step 2: Can enter personal information
- [ ] Step 3: Income fields accept input
- [ ] Step 4: Shows bank offers

### General Site:
- [ ] Homepage loads
- [ ] Menu opens and closes
- [ ] Footer links work
- [ ] Contact form submits
- [ ] Language switcher works

## 🎯 Success Metrics

### Green Status (All Good):
- Pass rate ≥ 95%
- No critical failures
- All dropdowns populated
- Response times < 500ms

### Yellow Status (Attention Needed):
- Pass rate 80-94%
- Minor issues present
- Some warnings but no blockers

### Red Status (Critical):
- Pass rate < 80%
- Dropdown failures
- API endpoints down
- User flows broken

## 🛠️ Debugging Failed Tests

When tests fail:

1. **Check Server Status**:
```bash
ssh root@45.83.42.74
pm2 list
pm2 logs bankimonline-monorepo --lines 100
```

2. **Verify Database Connection**:
```bash
# From production server
curl -s 'http://localhost:8003/api/dropdowns/mortgage_step1/he' | jq
```

3. **Check Nginx Logs**:
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

4. **Clear Cache**:
```bash
curl -X POST https://dev2.bankimonline.com/api/cache/clear
```

## 📞 Escalation Path

If critical QA failures persist:

1. Run production health check
2. Review deployment guide: `PRODUCTION_DEPLOYMENT_GUIDE.md`
3. Check recent commits for changes
4. Rollback if necessary using PM2 saved configurations
5. Document issue with screenshots and logs

## 💡 Tips for Effective QA

1. **Always test in incognito/private mode** to avoid cache issues
2. **Test all three languages** - issues may be language-specific
3. **Check mobile view** using browser dev tools
4. **Document with screenshots** when issues found
5. **Test immediately after deployment** to catch issues early
6. **Keep test reports** for trend analysis

---

**Remember**: The goal of QA is to ensure users have a smooth experience. Focus on critical user paths first, then expand to edge cases.