/**
 * BankIM Development Server Launcher
 * 
 * ⚠️  DEVELOPMENT ONLY - This script is for local development only!
 * 
 * 🏗️  PRODUCTION DEPLOYMENT:
 *     - Frontend: Deploy to Railway (serves React app + static files)  
 *     - Backend:  Deploy to Railway (serves Node.js API + database)
 *     - See: DEVHelp/RAILWAY_DEPLOYMENT_GUIDE.md for full details
 * 
 * 🚀  DEVELOPMENT USAGE:
 *     node start-dev.js
 * 
 * This will start:
 *     - API Server on http://localhost:8003 (packages/server/src/server.js)
 *     - File Server on http://localhost:3001 (serve.js)
 */

const { spawn } = require('child_process');
const path = require('path');

// Start the API server (port 8003) - STANDALONE ARCHITECTURE
const apiServer = spawn('node', ['server-db.js'], {
    stdio: 'pipe',
    cwd: __dirname
});

// Start the file server (port 3001) 
const fileServer = spawn('node', ['serve.js'], {
    stdio: 'pipe',
    cwd: __dirname
});

// Handle API server output
apiServer.stdout.on('data', (data) => {
    console.log(`[API] ${data.toString().trim()}`);
});

apiServer.stderr.on('data', (data) => {
    console.error(`[API-8003] ERROR: ${data.toString().trim()}`);
});

// Handle file server output
fileServer.stdout.on('data', (data) => {
    console.log(`[FILE-3001] ${data.toString().trim()}`);
});

fileServer.stderr.on('data', (data) => {
    console.error(`[FILE-3001] ERROR: ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
    apiServer.kill('SIGINT');
    fileServer.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    apiServer.kill('SIGTERM');
    fileServer.kill('SIGTERM');
    process.exit(0);
});

// Handle server crashes
apiServer.on('close', (code) => {
    if (code !== 0) {
        console.error('🔴 API Server crashed! Restarting...');
        // Could implement restart logic here
    }
});

fileServer.on('close', (code) => {
    if (code !== 0) {
        console.error('🔴 File Server crashed! Restarting...');
        // Could implement restart logic here
    }
});

console.log('🚀 Development servers starting...');
console.log('📊 API Server: http://localhost:8003');
console.log('📁 File Server: http://localhost:3001');
console.log('Press Ctrl+C to stop both servers');
