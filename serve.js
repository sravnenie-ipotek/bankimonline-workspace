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
  
  // Handle admin routes FIRST - serve standalone admin page
  if (req.url.startsWith('/admin-panel')) {
    filePath = './admin.html';
  } else if (req.url.startsWith('/customer-approval-check')) {
    filePath = './customer-approval-check.html';
  } else if (req.url === '/debug.html') {
    filePath = './debug.html';
  } else if (req.url.startsWith('/js/') || 
             req.url.startsWith('/css/')) {
    // Serve static files directly from project root
    filePath = '.' + req.url;
  } else if (req.url.startsWith('/locales/')) {
    // Serve locales from React app build directory
    filePath = './mainapp/build' + req.url;
  } else {
    // Default to React app
    filePath = req.url === '/' ? './mainapp/build/index.html' : './mainapp/build' + req.url;
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
          fs.readFile('./mainapp/build/index.html', (err, indexContent) => {
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
  console.log(`File server running at http://localhost:${PORT}/`);
  console.log(`Admin panel available at http://localhost:${PORT}/admin-panel`);
  console.log(`Customer approval check at http://localhost:${PORT}/customer-approval-check`);
  console.log(`Main app at http://localhost:${PORT}/`);
});