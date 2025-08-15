#!/usr/bin/env node

/**
 * 🌐 QA Reports and Screenshots HTTP Server
 * 
 * SOLVES: "Screenshot not accessible" issue in HTML reports
 * 
 * This server provides HTTP access to QA reports and screenshots,
 * bypassing browser file:// security restrictions.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.QA_SERVER_PORT || 3002;

// Enable CORS for all origins
app.use(cors());

// Base paths
const projectRoot = path.join(__dirname, '..');
const screenshotsPath = path.join(projectRoot, 'mainapp/cypress/screenshots');
const playwrightScreenshotsPath = path.join(projectRoot, 'test-results');
const reportsPath = path.join(projectRoot, 'server/docs/QA');

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files with proper headers
const staticOptions = {
  setHeaders: (res, path) => {
    // Set appropriate headers for different file types
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache'); // Always fresh HTML
    }
  }
};

// Serve Cypress screenshots
app.use('/screenshots/cypress', express.static(screenshotsPath, staticOptions));

// Serve Playwright screenshots and test results
app.use('/screenshots/playwright', express.static(playwrightScreenshotsPath, staticOptions));

// Serve QA reports
app.use('/reports', express.static(reportsPath, staticOptions));

// API endpoints for screenshot discovery
app.get('/api/screenshots', (req, res) => {
  const { type = 'all', testSuite = '' } = req.query;
  
  try {
    const screenshots = [];
    
    // Function to recursively find screenshots
    const findScreenshots = (basePath, category) => {
      if (!fs.existsSync(basePath)) return;
      
      const scanDirectory = (dir, relativePath = '') => {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const relativeFilePath = path.join(relativePath, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath, relativeFilePath);
          } else if (item.endsWith('.png') || item.endsWith('.jpg')) {
            // Filter by test suite if specified
            if (!testSuite || relativeFilePath.includes(testSuite)) {
              screenshots.push({
                name: item,
                category,
                relativePath: relativeFilePath,
                url: `/screenshots/${category}/${relativeFilePath}`,
                size: stat.size,
                lastModified: stat.mtime,
                timestamp: extractTimestamp(item),
                description: generateDescription(item)
              });
            }
          }
        });
      };
      
      scanDirectory(basePath);
    };
    
    // Discover screenshots based on type
    if (type === 'all' || type === 'cypress') {
      findScreenshots(screenshotsPath, 'cypress');
    }
    
    if (type === 'all' || type === 'playwright') {
      findScreenshots(playwrightScreenshotsPath, 'playwright');
    }
    
    // Sort by last modified (newest first)
    screenshots.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    res.json({
      success: true,
      count: screenshots.length,
      screenshots,
      filters: { type, testSuite }
    });
    
  } catch (error) {
    console.error('Error discovering screenshots:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint for report discovery
app.get('/api/reports', (req, res) => {
  try {
    const reports = [];
    
    const scanReports = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativeFilePath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanReports(fullPath, relativeFilePath);
        } else if (item.endsWith('.html')) {
          reports.push({
            name: item,
            relativePath: relativeFilePath,
            url: `/reports/${relativeFilePath}`,
            size: stat.size,
            lastModified: stat.mtime,
            timestamp: extractTimestamp(item)
          });
        }
      });
    };
    
    scanReports(reportsPath);
    
    // Sort by last modified (newest first)
    reports.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
    
  } catch (error) {
    console.error('Error discovering reports:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Main dashboard endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🏦 Banking QA Dashboard</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; background: #f8f9fa; padding: 2rem;
            }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { 
                background: linear-gradient(135deg, #667eea, #764ba2); 
                color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;
            }
            .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
            .card { 
                background: white; border-radius: 12px; padding: 2rem; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.3s ease;
            }
            .card:hover { transform: translateY(-5px); }
            .card h3 { color: #333; margin-bottom: 1rem; }
            .btn { 
                display: inline-block; background: #667eea; color: white; 
                padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; 
                transition: background 0.3s ease; margin: 0.5rem 0.5rem 0.5rem 0;
            }
            .btn:hover { background: #5a6fd8; }
            .status { 
                padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; font-weight: 500;
                display: inline-block; margin: 0.5rem 0;
            }
            .status.running { background: #d4edda; color: #155724; }
            .endpoint { 
                background: #f8f9fa; padding: 1rem; border-radius: 8px; 
                font-family: monospace; margin: 1rem 0; border-left: 4px solid #667eea;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏦 Banking QA Dashboard</h1>
                <p>Server running on port ${PORT}</p>
                <div class="status running">🟢 Server Active</div>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>📸 Screenshots</h3>
                    <p>Access Cypress and Playwright test screenshots via HTTP to bypass browser file:// restrictions.</p>
                    <a href="/api/screenshots" class="btn">📋 List All Screenshots</a>
                    <a href="/api/screenshots?type=cypress" class="btn">🔍 Cypress Only</a>
                    <a href="/api/screenshots?type=playwright" class="btn">🎭 Playwright Only</a>
                    
                    <div class="endpoint">
                        <strong>Endpoints:</strong><br>
                        GET /screenshots/cypress/{path}<br>
                        GET /screenshots/playwright/{path}<br>
                        GET /api/screenshots?type=all&testSuite=refinance
                    </div>
                </div>
                
                <div class="card">
                    <h3>📊 QA Reports</h3>
                    <p>Access HTML QA reports with properly functioning screenshot displays.</p>
                    <a href="/api/reports" class="btn">📋 List All Reports</a>
                    <a href="/reports" class="btn">📁 Browse Reports</a>
                    
                    <div class="endpoint">
                        <strong>Endpoints:</strong><br>
                        GET /reports/{reportPath}<br>
                        GET /api/reports
                    </div>
                </div>
                
                <div class="card">
                    <h3>🛠️ Testing Tools</h3>
                    <p>Quick access to test execution and report generation tools.</p>
                    <a href="/api/screenshots?testSuite=mortgage" class="btn">🏠 Mortgage Tests</a>
                    <a href="/api/screenshots?testSuite=refinance" class="btn">🔄 Refinance Tests</a>
                    <a href="/api/screenshots?testSuite=credit" class="btn">💳 Credit Tests</a>
                    
                    <div class="endpoint">
                        <strong>Filter Examples:</strong><br>
                        ?testSuite=mortgage-calculator<br>
                        ?testSuite=refinance-mortgage<br>
                        ?type=cypress&testSuite=authentication
                    </div>
                </div>
                
                <div class="card">
                    <h3>⚙️ Server Configuration</h3>
                    <p>Current server configuration and available endpoints.</p>
                    
                    <div class="endpoint">
                        <strong>Base Paths:</strong><br>
                        Screenshots: ${screenshotsPath}<br>
                        Reports: ${reportsPath}<br>
                        Playwright: ${playwrightScreenshotsPath}
                    </div>
                    
                    <div class="endpoint">
                        <strong>CORS:</strong> Enabled for all origins<br>
                        <strong>Cache:</strong> 1h for images, no-cache for HTML<br>
                        <strong>Port:</strong> ${PORT} (configurable via QA_SERVER_PORT)
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 3rem; color: #666; font-size: 0.9rem;">
                <p>🚀 Banking QA Server - Solving "Screenshot not accessible" issues</p>
                <p>Generated by Enhanced QA Infrastructure • ${new Date().toLocaleString()}</p>
            </div>
        </div>
        
        <script>
            // Auto-refresh status every 30 seconds
            setInterval(() => {
                fetch('/api/screenshots')
                    .then(response => response.json())
                    .then(data => {
                        console.log(\`📸 Screenshots available: \${data.count}\`);
                    })
                    .catch(error => console.error('Server check failed:', error));
            }, 30000);
        </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    port: PORT,
    paths: {
      screenshots: screenshotsPath,
      reports: reportsPath,
      playwright: playwrightScreenshotsPath
    }
  });
});

// Utility functions
function extractTimestamp(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
  return match ? match[1] : 'unknown';
}

function generateDescription(filename) {
  return filename
    .replace(/[-_]/g, ' ')
    .replace('.png', '')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/g, '')
    .replace('undefined', 'Navigation Flow')
    .trim();
}

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Path ${req.url} not found`,
    availableEndpoints: [
      'GET /',
      'GET /api/screenshots',
      'GET /api/reports',
      'GET /screenshots/cypress/{path}',
      'GET /screenshots/playwright/{path}',
      'GET /reports/{path}',
      'GET /health'
    ]
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🌐 QA Reports & Screenshots Server`);
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📸 Screenshots: http://localhost:${PORT}/screenshots/cypress`);
  console.log(`📊 Reports: http://localhost:${PORT}/reports`);
  console.log(`📋 API: http://localhost:${PORT}/api/screenshots`);
  console.log(`🔍 Dashboard: http://localhost:${PORT}`);
  console.log(`\n📁 Serving from:`);
  console.log(`   Cypress: ${screenshotsPath}`);
  console.log(`   Playwright: ${playwrightScreenshotsPath}`);
  console.log(`   Reports: ${reportsPath}`);
  console.log(`\n✅ SOLVES: "Screenshot not accessible" browser issues`);
  console.log(`💡 TIP: Use http://localhost:${PORT} URLs in HTML reports instead of file:// paths\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ QA Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ QA Server closed');
    process.exit(0);
  });
});

module.exports = { app, server };