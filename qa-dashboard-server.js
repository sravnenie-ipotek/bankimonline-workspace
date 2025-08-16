#!/usr/bin/env node

/**
 * Lightweight server for QA Dashboard
 * Serves dashboard and stats with zero performance impact
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456; // Non-conflicting port

const server = http.createServer((req, res) => {
  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.url === '/') {
    // Serve dashboard HTML
    const html = fs.readFileSync('qa-dashboard-lite.html', 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url === '/stats' || req.url.startsWith('/stats?')) {
    // Serve stats JSON
    try {
      const stats = fs.readFileSync('.qa-stats.json', 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(stats);
    } catch (e) {
      // Return empty stats if file doesn't exist
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        passed: 0,
        failed: 0,
        filesChanged: 0,
        lastRun: 'Never',
        recentLogs: []
      }));
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 QA Dashboard running at: http://localhost:${PORT}`);
  console.log('📊 Zero performance impact - only serves static files');
  console.log('Press Ctrl+C to stop');
  
  // Open dashboard automatically on macOS
  if (process.platform === 'darwin') {
    require('child_process').exec(`open http://localhost:${PORT}`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Dashboard server stopped');
  process.exit(0);
});