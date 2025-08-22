#!/usr/bin/env node

/**
 * Simple HTTP server for BrowserStack mobile testing
 * Serves the standalone mobile button test page
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const TEST_FILE = path.join(__dirname, 'test-mobile-buttons-standalone.html');

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

const server = http.createServer((req, res) => {
  log(`📱 Request: ${req.method} ${req.url}`, '\x1b[36m');
  
  // Serve the test page for any request
  try {
    const content = fs.readFileSync(TEST_FILE, 'utf8');
    
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    res.end(content);
    
  } catch (error) {
    log(`❌ Error serving file: ${error.message}`, '\x1b[31m');
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  log(`🚀 Mobile Test Server Started`, '\x1b[1m\x1b[32m');
  log(`📱 Local URL: http://localhost:${PORT}`, '\x1b[36m');
  log(`🌐 External URL: http://[YOUR_IP]:${PORT}`, '\x1b[36m');
  log(`🎯 BrowserStack can now access this test page`, '\x1b[32m');
  log(`\n⚡ Ready for mobile button testing!`, '\x1b[1m\x1b[33m');
  log(`Press Ctrl+C to stop the server`, '\x1b[33m');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log(`❌ Port ${PORT} is already in use`, '\x1b[31m');
    log(`💡 Try: lsof -i :${PORT} to see what's using it`, '\x1b[33m');
  } else {
    log(`❌ Server error: ${err.message}`, '\x1b[31m');
  }
  process.exit(1);
});

module.exports = server;