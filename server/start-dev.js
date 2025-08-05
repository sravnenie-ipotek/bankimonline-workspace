/**
 * BankIM Development Server Launcher
 * 
 * ⚠️  DEVELOPMENT ONLY - This script is for local development only!
 * 
 * 🏗️  PRODUCTION DEPLOYMENT:
 *     - Frontend: Deploy to Vercel (serves React app + static files)  
 *     - Backend:  Deploy to Railway (serves Node.js API + database)
 *     - See: DEVHelp/VERCEL_DEPLOYMENT_GUIDE.md for full details
 * 
 * 🚀  DEVELOPMENT USAGE:
 *     node start-dev.js
 * 
 * This will start:
 *     - API Server on http://localhost:8003 (server-db.js)
 *     - File Server on http://localhost:3001 (serve.js)
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting BankIM Development Environment...\n');
console.log('⚠️  DEVELOPMENT MODE - Not for production deployment!');
console.log('📖 For production deployment, see: DEVHelp/VERCEL_DEPLOYMENT_GUIDE.md\n');

// Start the API server (port 8003)
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
    console.log(`[API-8003] ${data.toString().trim()}`);
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
    console.log('\n🛑 Shutting down servers...');
    apiServer.kill('SIGINT');
    fileServer.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down servers...');
    apiServer.kill('SIGTERM');
    fileServer.kill('SIGTERM');
    process.exit(0);
});

// Handle server crashes
apiServer.on('close', (code) => {
    console.log(`[API-8003] Server exited with code ${code}`);
    if (code !== 0) {
        console.error('🔴 API Server crashed! Restarting...');
        // Could implement restart logic here
    }
});

fileServer.on('close', (code) => {
    console.log(`[FILE-3001] Server exited with code ${code}`);
    if (code !== 0) {
        console.error('🔴 File Server crashed! Restarting...');
        // Could implement restart logic here
    }
});

console.log('📡 API Server starting on http://localhost:8003');
console.log('🌐 File Server starting on http://localhost:3001');
console.log('📱 SMS Login: Mock mode (check console for OTP codes)');
console.log('\n💡 To stop both servers, press Ctrl+C');
console.log('🔗 Production deployment: see DEVHelp/VERCEL_DEPLOYMENT_GUIDE.md\n'); 