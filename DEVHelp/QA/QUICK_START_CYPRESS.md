# Quick Start: Running Cypress Tests

## 🚀 Fastest Way to See Tests Run

### Step 1: Navigate to the Project
```bash
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp
```

### Step 2: Start the App
```bash
npm run dev
```
Wait for: "VITE v4.4.9 ready" message

### Step 3: Open Cypress (New Terminal)
```bash
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp
npm run cypress
```

### Step 4: Run a Test
1. Cypress window opens
2. Click "E2E Testing"
3. Choose a browser (Chrome recommended)
4. Click "Start E2E Testing in Chrome"
5. Browser opens with test list
6. Click `basic/app-launch.cy.ts`
7. Watch the test run automatically!

## 🎯 What You'll See
- Browser opens automatically
- Navigates to your app
- Performs actions (clicking, typing)
- Shows green checkmarks for passed tests
- Red X for any failures

## 💡 Tips
- Tests run in a real browser - you see everything!
- Hover over commands to see what happened
- Click on any command to see a snapshot
- Tests automatically re-run when you save changes

## 🔧 Quick Commands
```bash
# Interactive mode (recommended for development)
npm run cypress

# Run all tests quickly (no UI)
npm run cypress:run

# Run with browser visible but no Cypress UI
npm run test:e2e:headed
```

## ⚡ Example Test Location
Check out: `/mainapp/cypress/e2e/basic/app-launch.cy.ts`

This test:
1. Opens the homepage
2. Checks if app loaded
3. Navigates to bank employee registration
4. Tests language switching

## 🐛 If Something Goes Wrong
1. Make sure app is running (Step 1)
2. Check the port (might be 5174 instead of 5173)
3. Look at the Cypress error message
4. Screenshot saved in `/cypress/screenshots/`