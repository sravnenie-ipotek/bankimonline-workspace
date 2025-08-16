# CRITICAL FIXES - DO NOT LOSE THESE!

## Authentication Bug Fix History

### The Recurring Auth Bug
This bug has appeared multiple times because fixes keep getting overwritten when restoring from old backups.

### PERMANENT FIXES APPLIED:

#### 1. Duplicate Email Constraint Fix (server/server-db.js line ~3718)
```javascript
// FIXED VERSION - DO NOT OVERWRITE!
if (clientResult.rows.length > 0) {
    client = clientResult.rows[0];
} else {
    // Generate unique email using timestamp to avoid duplicates
    const timestamp = Date.now();
    const uniqueEmail = `${mobile_number.replace(/[^0-9]/g, '')}_${timestamp}@bankim.com`;
    const newResult = await pool.query(
        'INSERT INTO clients (first_name, last_name, phone, email, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
        ['New', 'Client', mobile_number, uniqueEmail, 'customer']
    );
    client = newResult.rows[0];
}
```

#### 2. JWT_SECRET Required in .env
```bash
# Add to .env file (not in git for security)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
```

#### 3. Correct Startup Script (server/start-dev.js line 23)
```javascript
// CORRECT - Standalone structure
const apiServer = spawn('node', ['server-db.js'], {
    stdio: 'pipe',
    cwd: __dirname
});

// WRONG - Old monorepo structure
// const apiServer = spawn('node', ['../packages/server/src/server.js'], {
```

## WHY THIS KEEPS BREAKING:

1. **Commit 99f85769c (Aug 15, 2025)**: Restored old server-db.js from packages/server, lost duplicate email handling
2. **Multiple file sources**: server/server-db.js vs packages/server/src/server.js confusion
3. **Missing .env variables**: JWT_SECRET not in git (correctly), but gets lost on fresh clones

## HOW TO PREVENT:

1. **NEVER restore server-db.js from packages/server** - they have diverged!
2. **Always check .env.example** for required variables
3. **Test auth flow after any server file changes**
4. **Keep this file as reference** when fixes get lost again

## TEST THE FIX:
```bash
# Test auth endpoint directly
curl -X POST http://localhost:8003/api/auth-verify \
  -H "Content-Type: application/json" \
  -d '{"code":"1111","mobile_number":"972544123456"}'

# Should return success with JWT token
```

Last fixed: August 16, 2025