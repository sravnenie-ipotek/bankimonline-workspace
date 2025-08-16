/**
 * PM2 Development Configuration
 * 
 * This configuration provides development environment parity with production's
 * PM2-dump-driven architecture while maintaining developer flexibility.
 * 
 * IMPORTANT: Development uses Railway databases, Production uses local PostgreSQL
 * 
 * Usage:
 *   npm run pm2:dev      - Start with PM2
 *   npm run pm2:stop     - Stop all PM2 processes
 *   npm run pm2:logs     - View logs
 *   npm run pm2:status   - Check status
 */

// Load Railway database connections from .env
require('dotenv').config({ path: '.env' });

module.exports = {
  apps: [
    {
      // Backend API Server
      name: 'bankim-dev-api',
      script: './server/server-db.js',
      cwd: './',
      instances: 1,  // Single instance in dev (not clustered like prod)
      exec_mode: 'fork',  // Fork mode for development (cluster in prod)
      watch: [
        'server/**/*.js',
        '.env'
      ],
      ignore_watch: [
        'node_modules',
        'logs',
        'uploads',
        '*.log',
        '.git',
        'mainapp'
      ],
      env: {
        NODE_ENV: 'development',
        PORT: 8003,  // Always use 8003 for development, ignore .env PORT
        DATABASE_URL: process.env.DATABASE_URL,
        CONTENT_DATABASE_URL: process.env.CONTENT_DATABASE_URL,
        MANAGEMENT_DATABASE_URL: process.env.MANAGEMENT_DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
        JWT_BANK_SECRET: process.env.JWT_BANK_SECRET || 'bank-dev-secret'
      },
      max_memory_restart: '500M',
      error_file: './logs/dev-api-error.log',
      out_file: './logs/dev-api-out.log',
      merge_logs: true,
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      kill_timeout: 3000
    },
    {
      // Static File Server (if needed)
      name: 'bankim-dev-files',
      script: './server/serve.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: false,  // Don't watch file server
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      max_memory_restart: '200M',
      error_file: './logs/dev-files-error.log',
      out_file: './logs/dev-files-out.log',
      merge_logs: true,
      time: true
    },
    {
      // Frontend Development Server (Vite)
      name: 'bankim-dev-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './mainapp',
      instances: 1,
      exec_mode: 'fork',
      watch: false,  // Vite has its own HMR
      env: {
        NODE_ENV: 'development'
      },
      max_memory_restart: '1G',
      error_file: './logs/dev-frontend-error.log',
      out_file: './logs/dev-frontend-out.log',
      merge_logs: true,
      time: true,
      autorestart: false  // Don't auto-restart Vite (it handles its own reloads)
    }
  ]
};