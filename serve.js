const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'application/x-font-ttf',
  '.otf': 'application/x-font-otf',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  let filePath = '';
  
  // Handle single domain routing strategy
  if (req.url === '/admin' || req.url === '/admin/') {
    filePath = './admin.html';
  } else if (req.url === '/customer' || req.url === '/customer/') {
    filePath = './customer-approval-check.html';
  } else if (req.url.startsWith('/admin-panel')) {
    // Legacy route for admin panel
    filePath = './admin.html';
  } else if (req.url.startsWith('/customer-approval-check')) {
    // Legacy route for customer approval
    filePath = './customer-approval-check.html';
  } else if (req.url === '/debug.html') {
    filePath = './debug.html';
  } else if (req.url.startsWith('/js/') || req.url.startsWith('/css/') || req.url.startsWith('/locales/')) {
    // Serve static files from project root
    filePath = '.' + req.url;
  } else if (req.url === '/' || req.url === '/index.html') {
    // Serve personal admin dashboard
    filePath = './index.html';
  } else {
    // For any other route, try to serve from project root first, then fallback to React app
    filePath = '.' + req.url;
  }
  
  // Security: prevent directory traversal
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Try to fallback to React app's index.html for client-side routing
        if (!filePath.includes('admin') && !filePath.includes('.')) {
          fs.readFile('./mainapp/dist/index.html', (err, indexContent) => {
            if (err) {
              res.writeHead(404);
              res.end('404 Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(indexContent, 'utf-8');
            }
          });
        } else {
          res.writeHead(404);
          res.end('404 Not Found');
        }
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 BankimOnline Server running at http://localhost:${PORT}/`);
  console.log(`📊 Personal Admin Dashboard: http://localhost:${PORT}/`);
  console.log(`🏦 Banking Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`🧮 Customer Calculator: http://localhost:${PORT}/customer`);
  console.log(`📡 API Health Check: http://localhost:8003/api/health`);
  console.log(`\n✅ Single Domain Strategy Active - Navigation Ready!`);
});