#!/usr/bin/env node

/**
 * ⛔ MONOREPO STRUCTURE IS PERMANENTLY DISABLED ⛔
 * 
 * This project has been migrated from monorepo to standalone structure.
 * Any attempts to use monorepo packages will be blocked.
 * 
 * CURRENT STRUCTURE:
 * - Backend: /server/server-db.js
 * - Frontend: /mainapp/
 * 
 * DO NOT USE:
 * - /packages/server/
 * - /packages/client/
 * - Any monorepo commands
 */

const fs = require('fs');
const path = require('path');

console.error(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ⛔⛔⛔ MONOREPO STRUCTURE IS DISABLED ⛔⛔⛔               ║
║                                                                ║
║   This project uses STANDALONE structure only!                ║
║                                                                ║
║   ❌ DO NOT USE:                                             ║
║      • packages/server/                                       ║
║      • packages/client/                                       ║
║      • lerna commands                                         ║
║      • workspace commands                                     ║
║                                                                ║
║   ✅ USE INSTEAD:                                            ║
║      • Backend:  node server/server-db.js                    ║
║      • Frontend: cd mainapp && npm run dev                   ║
║      • Both:     npm run dev (from root)                     ║
║                                                                ║
║   📖 See CRITICAL_FIXES.md for architecture details          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Check if someone is trying to access monorepo paths
const checkMonorepoAccess = () => {
  const monorepoIndicators = [
    'packages/server',
    'packages/client',
    '../packages',
    './packages'
  ];
  
  const callerPath = process.argv[2] || '';
  
  for (const indicator of monorepoIndicators) {
    if (callerPath.includes(indicator)) {
      console.error(`
❌ BLOCKED: Attempting to access monorepo path: ${callerPath}
💡 Use standalone structure instead:
   - Backend: server/server-db.js
   - Frontend: mainapp/
      `);
      process.exit(1);
    }
  }
};

// Check if packages directory exists and warn
const checkPackagesDirectory = () => {
  const packagesPath = path.join(__dirname, 'packages');
  if (fs.existsSync(packagesPath)) {
    console.error(`
⚠️  WARNING: 'packages/' directory found but SHOULD NOT BE USED!
🗑️  Consider removing it to prevent confusion.
    `);
  }
};

// Verify standalone structure is in place
const verifyStandaloneStructure = () => {
  const requiredPaths = [
    { path: 'server/server-db.js', name: 'Backend server' },
    { path: 'mainapp/package.json', name: 'Frontend package' },
    { path: '.env', name: 'Environment config' }
  ];
  
  let allGood = true;
  
  for (const item of requiredPaths) {
    const fullPath = path.join(__dirname, item.path);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing: ${item.name} at ${item.path}`);
      allGood = false;
    }
  }
  
  if (allGood) {
    console.log(`
✅ Standalone structure verified:
   • Backend:  server/server-db.js
   • Frontend: mainapp/
   • Config:   .env (single source)
    `);
  }
};

// Main execution
checkMonorepoAccess();
checkPackagesDirectory();
verifyStandaloneStructure();

// Exit with error to prevent any monorepo operations
if (process.argv.includes('--check-only')) {
  process.exit(0);
} else {
  process.exit(1);
}