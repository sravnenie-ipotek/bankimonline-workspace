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
  
  // Parse URL to separate path from query parameters
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  
  // Handle API requests - proxy to database server
  if (pathname.startsWith('/api/')) {
    console.log(`🔄 Proxying API request: ${req.url} to port 8003`);
    
    const options = {
      hostname: 'localhost',
      port: 8003,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    
    proxyReq.on('error', (err) => {
      console.error('❌ Proxy error:', err);
      res.writeHead(500);
      res.end('API server unavailable');
    });
    
    req.pipe(proxyReq, { end: true });
    return;
  }
  
  let filePath = '';
  
  // Handle customer approval check
  if (pathname.startsWith('/customer-approval-check')) {
    filePath = './customer-approval-check.html';
  } else if (pathname === '/debug.html') {
    filePath = './debug.html';
  } else if (pathname.startsWith('/js/') || 
             pathname.startsWith('/css/')) {
    // Serve static files directly from project root
    filePath = '.' + pathname;
  } else if (pathname.startsWith('/locales/')) {
    // Serve locales from React app build directory
    filePath = '../mainapp/build' + pathname;
  } else {
    // Default to React app
    filePath = pathname === '/' ? '../mainapp/build/index.html' : '../mainapp/build' + pathname;
  }
  
  // Security: prevent directory traversal (but allow ../mainapp for our specific case)
  filePath = path.normalize(filePath);
  if (filePath.includes('../mainapp')) {
    // Allow this specific path for our React app
  } else {
    filePath = filePath.replace(/^(\.\.[\/\\])+/, '');
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Try to fallback to React app's index.html for client-side routing
        if (!filePath.includes('admin') && !filePath.includes('.')) {
          fs.readFile('../mainapp/build/index.html', (err, indexContent) => {
            if (err) {
              res.writeHead(404);
              res.end('404 Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(indexContent, 'utf-8');
            }
          });
        } else {
          console.error(`File not found: ${filePath} (requested: ${req.url})`);
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
  console.log(`Customer approval check at http://localhost:${PORT}/customer-approval-check`);
  console.log(`Main app at http://localhost:${PORT}/`);
});