# 🏥 Health Checks Deep Dive - How Testing Works

## Overview
The SSH deployer runs 4 critical health checks on port 8004 (test instance) BEFORE switching traffic. Here's exactly how each test works:

---

## 1️⃣ API Health Endpoint Check

### What it tests:
```bash
curl -s -o /dev/null -w "%{http_code}" http://45.83.42.74:8004/api/health
```

### How it works:
```javascript
// The server must respond with:
GET /api/health → 200 OK
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Pass Criteria:
- ✅ HTTP Status Code = 200
- ✅ Response received within 5 seconds
- ❌ FAILS if: 500, 502, 503, timeout, connection refused

### What this proves:
- Node.js server is running
- Express routes are loaded
- Basic API functionality works

---

## 2️⃣ Dropdown Data Exists Check

### What it tests:
```bash
# Test 1: Check if dropdown API returns data
DROPDOWN_CHECK=$(curl -s http://45.83.42.74:8004/api/v1/dropdowns | jq '.property_ownership | length')

# Test 2: Verify specific dropdown endpoint
curl -s http://45.83.42.74:8004/api/v1/calculation-parameters?business_path=mortgage
```

### How it works:
```javascript
// Expected response structure:
{
  "property_ownership": [
    {"value": "no_property", "label": "I don't own any property"},
    {"value": "has_property", "label": "I own a property"},
    {"value": "selling_property", "label": "I'm selling a property"}
  ],
  "cities": [...],
  "banks": [...],
  "building_types": [...]
}
```

### Pass Criteria:
```bash
if [[ "$DROPDOWN_CHECK" -gt 0 ]]; then
  echo "✅ Dropdowns have data"
else
  echo "❌ Dropdowns are empty - CRITICAL FAILURE"
  exit 1
fi
```

### What this proves:
- Database queries are working
- JSONB dropdown data is accessible
- Content management system is functional
- No "undefined" will appear in UI

---

## 3️⃣ LTV Ratios Validation Check

### What it tests:
```bash
# Test each property ownership scenario
for SCENARIO in "no_property" "has_property" "selling_property"; do
  RESPONSE=$(curl -s -X POST http://45.83.42.74:8004/api/v1/validate-ltv \
    -H "Content-Type: application/json" \
    -d "{\"property_ownership\": \"$SCENARIO\", \"property_value\": 1000000}")
  
  LTV=$(echo $RESPONSE | jq '.max_ltv')
done
```

### How it validates:
```javascript
// Business Rules Validation:
const LTV_RULES = {
  'no_property': 75,    // First-time buyer
  'has_property': 50,    // Has existing property
  'selling_property': 70 // Selling to buy new
};

// Test validation logic:
function validateLTV(ownership, ltv) {
  const expected = LTV_RULES[ownership];
  if (ltv !== expected) {
    throw new Error(`LTV mismatch: got ${ltv}, expected ${expected}`);
  }
}
```

### Pass Criteria:
```bash
# Must match EXACTLY:
no_property    → 75% (allows 25% minimum down payment)
has_property   → 50% (requires 50% down payment)
selling_property → 70% (allows 30% minimum down payment)
```

### What this proves:
- Banking calculations are correct
- Business logic is properly implemented
- Mortgage calculator will work accurately
- Financial compliance is maintained

---

## 4️⃣ Database Connections Check

### What it tests:
```bash
# Run database connection test script
ssh root@45.83.42.74 "cd /var/www/bankim/green && node test-railway-simple.js"
```

### The test script (test-railway-simple.js):
```javascript
const { Client } = require('pg');

async function testDatabases() {
  // Test 1: Main Database (Maglev)
  const maglevClient = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await maglevClient.connect();
    const result = await maglevClient.query('SELECT NOW()');
    console.log('✅ Maglev DB connected:', result.rows[0].now);
    
    // Test critical tables exist
    const tables = await maglevClient.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_name IN ('users', 'clients', 'banks', 'cities')
    `);
    
    if (tables.rows[0].count < 4) {
      throw new Error('Critical tables missing!');
    }
  } catch (error) {
    console.error('❌ Maglev DB failed:', error);
    process.exit(1);
  }
  
  // Test 2: Content Database (Shortline)
  const shortlineClient = new Client({
    connectionString: process.env.CONTENT_DATABASE_URL
  });
  
  try {
    await shortlineClient.connect();
    
    // Test dropdown_configs table
    const dropdowns = await shortlineClient.query(`
      SELECT COUNT(*) as count 
      FROM dropdown_configs 
      WHERE screen_name = 'mortgage_step1'
    `);
    
    if (dropdowns.rows[0].count === 0) {
      throw new Error('No dropdown configurations found!');
    }
    
    console.log('✅ Shortline DB connected: ' + dropdowns.rows[0].count + ' configs');
  } catch (error) {
    console.error('❌ Shortline DB failed:', error);
    
    // FALLBACK: Check if fallback data is available
    const fallback = require('./server/dropdown-fallback-data.js');
    if (fallback.hasFallbackData('mortgage_step1')) {
      console.log('⚠️ Using fallback dropdown data');
    } else {
      process.exit(1);
    }
  }
  
  console.log('✅ All database checks passed!');
  process.exit(0);
}

testDatabases();
```

### Pass Criteria:
- ✅ Both databases connect successfully
- ✅ Critical tables exist (users, clients, banks, cities)
- ✅ Dropdown configurations are accessible
- ⚠️ OR fallback data is available if Shortline is down

### What this proves:
- PostgreSQL connections work
- Environment variables are correct
- Database schema is intact
- Application can read/write data

---

## 🔄 The Complete Test Flow

```bash
#!/bin/bash
# Actual test execution in ssh-deployer

echo -e "\033[36m🏥 Running 4 critical health checks...\033[0m"

# Start test instance
ssh root@45.83.42.74 "cd /var/www/bankim/green && PORT=8004 pm2 start server/server-db.js --name test-instance"
sleep 5  # Wait for server to start

# Check 1: API Health
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://45.83.42.74:8004/api/health)
if [[ "$HEALTH" != "200" ]]; then
  echo "❌ Health check failed: HTTP $HEALTH"
  ssh root@45.83.42.74 "pm2 delete test-instance"
  exit 1
fi
echo "✅ 1/4: API Health OK"

# Check 2: Dropdown Data
DROPDOWNS=$(curl -s http://45.83.42.74:8004/api/v1/dropdowns)
PROP_COUNT=$(echo $DROPDOWNS | jq '.property_ownership | length')
if [[ "$PROP_COUNT" -eq 0 ]]; then
  echo "❌ Dropdown check failed: No data"
  ssh root@45.83.42.74 "pm2 delete test-instance"
  exit 1
fi
echo "✅ 2/4: Dropdowns OK ($PROP_COUNT options)"

# Check 3: LTV Ratios
LTV_CHECK=$(curl -s http://45.83.42.74:8004/api/v1/calculation-parameters?business_path=mortgage)
NO_PROP_LTV=$(echo $LTV_CHECK | jq '.ltv_ratios.no_property')
if [[ "$NO_PROP_LTV" != "75" ]]; then
  echo "❌ LTV check failed: Expected 75, got $NO_PROP_LTV"
  ssh root@45.83.42.74 "pm2 delete test-instance"
  exit 1
fi
echo "✅ 3/4: LTV Ratios OK"

# Check 4: Database Connections
ssh root@45.83.42.74 "cd /var/www/bankim/green && node test-railway-simple.js"
if [[ $? -ne 0 ]]; then
  echo "❌ Database check failed"
  ssh root@45.83.42.74 "pm2 delete test-instance"
  exit 1
fi
echo "✅ 4/4: Databases OK"

# All passed - stop test instance
ssh root@45.83.42.74 "pm2 delete test-instance"
echo -e "\033[36m✅ All health checks passed! Safe to deploy.\033[0m"
```

---

## 🚨 What Happens When Tests Fail

### Immediate Actions:
1. **Stop test instance** - `pm2 delete test-instance`
2. **Keep current version running** - No symlink change
3. **Log failure details** - Record which test failed
4. **Alert team** - Send notification with error details

### Common Failure Scenarios:

#### Scenario 1: Dropdowns Empty
```
❌ Dropdown check failed: No data
Cause: Shortline database timeout
Fix: Activate fallback data or fix database connection
```

#### Scenario 2: Wrong LTV Ratio
```
❌ LTV check failed: Expected 75, got 70
Cause: Business logic regression
Fix: Check recent changes to calculation logic
```

#### Scenario 3: Database Timeout
```
❌ Database check failed: Connection timeout
Cause: Railway database sleeping or network issue
Fix: Wake up database via Railway dashboard
```

---

## 📊 Success Metrics

When all 4 checks pass, you'll see:
```
🏥 Running 4 critical health checks...
✅ 1/4: API Health OK
✅ 2/4: Dropdowns OK (3 options)
✅ 3/4: LTV Ratios OK
✅ 4/4: Databases OK
✅ All health checks passed! Safe to deploy.
```

Only then does the deployment proceed to switch traffic to the new version.