#!/usr/bin/env node

/**
 * Legacy Launch Warning Script
 * Prevents accidental use of old/deprecated launch methods
 */

const chalk = require('chalk') || console;
const log = console.log;

log(chalk.red?.bold?.('\n⚠️  WARNING: LEGACY LAUNCH METHOD DETECTED! ⚠️\n') || '\n⚠️  WARNING: LEGACY LAUNCH METHOD DETECTED! ⚠️\n');

log(chalk.yellow?.('This launch method is deprecated and should not be used.\n') || 'This launch method is deprecated and should not be used.\n');

log(chalk.cyan?.bold?.('✅ CORRECT Modern Launch Method:\n') || '✅ CORRECT Modern Launch Method:\n');
log(chalk.green?.(`
  Terminal 1 - Backend servers:
    npm run dev
  
  Terminal 2 - Frontend development:
    cd mainapp
    npm run dev
`) || `
  Terminal 1 - Backend servers:
    npm run dev
  
  Terminal 2 - Frontend development:
    cd mainapp
    npm run dev
`);

log(chalk.cyan?.bold?.('🚀 OR use PM2 for process management:\n') || '🚀 OR use PM2 for process management:\n');
log(chalk.green?.(`
  npm run pm2:dev        # Start both servers with PM2
  npm run pm2:status     # Check status
  npm run pm2:logs       # View logs
`) || `
  npm run pm2:dev        # Start both servers with PM2
  npm run pm2:status     # Check status
  npm run pm2:logs       # View logs
`);

log(chalk.red?.('\n❌ DO NOT USE:\n') || '\n❌ DO NOT USE:\n');
log(chalk.gray?.(`
  - Direct node commands without proper environment setup
  - Old monolithic scripts
  - Package-specific commands from legacy structure
  - npm run dev:all (if it exists from old setup)
`) || `
  - Direct node commands without proper environment setup
  - Old monolithic scripts
  - Package-specific commands from legacy structure
  - npm run dev:all (if it exists from old setup)
`);

log(chalk.magenta?.bold?.('\n📚 For more info, see: DEVELOPMENT.md\n') || '\n📚 For more info, see: DEVELOPMENT.md\n');

// Exit with error code to prevent continuation
process.exit(1);