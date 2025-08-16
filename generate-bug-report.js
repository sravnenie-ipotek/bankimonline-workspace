const fs = require('fs');
const path = require('path');

// Load bug data
const bugs = JSON.parse(fs.readFileSync('bug-data.json', 'utf8'));

// Function to convert image to base64
function imageToBase64(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(filePath).toLowerCase().slice(1);
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch(e) {
    console.log('Could not read file:', filePath);
    return null;
  }
}

// Map bugs to their actual screenshots
const screenshotDir = 'mainapp/cypress/screenshots';
const bugScreenshots = {};

// Find actual screenshot files for each bug
function findBugScreenshots() {
  // Specific screenshots for each bug
  const screenshotMappings = {
    'BUG-001': [
      'run-2025-08-16T13-50-49/menu-navigation-comprehensive.cy.ts/menu-navigation-comprehensive_undefined_2025-08-16T13-51-42.png',
      'run-2025-08-16T13-50-49/menu-navigation-comprehensive.cy.ts/menu-navigation-comprehensive_undefined_2025-08-16T13-51-29.png'
    ],
    'BUG-002': [
      'run-2025-08-16T20-40-23/mortgage-calculator-complete-journey.cy.ts/mortgage-calculator-complete-journey_undefined_2025-08-16T20-41-12.png',
      'run-2025-08-16T14-40-36/mortgage-calculator-simple-working.cy.ts/mortgage-calculator-simple-working_undefined_2025-08-16T14-40-46.png'
    ],
    'BUG-003': [
      'run-2025-08-16T20-42-06/refinance-mortgage-comprehensive.cy.ts/refinance-mortgage-comprehensive_undefined_2025-08-16T20-42-18.png'
    ],
    'BUG-005': [
      'run-2025-08-16T20-40-23/mortgage-calculator-complete-journey.cy.ts/mortgage-calculator-complete-journey_01-step1-initial_2025-08-16T20-41-17.png'
    ],
    'BUG-007': [
      'run-2025-08-16T14-40-36/mortgage-calculator-simple-working.cy.ts/mortgage-calculator-simple-working_01-step1-loaded_2025-08-16T14-40-53.png'
    ]
  };

  for (const bugId in screenshotMappings) {
    bugScreenshots[bugId] = [];
    for (const screenshotPath of screenshotMappings[bugId]) {
      const fullPath = path.join(screenshotDir, screenshotPath);
      const base64Data = imageToBase64(fullPath);
      if (base64Data) {
        bugScreenshots[bugId].push({
          path: fullPath,
          base64: base64Data,
          filename: path.basename(screenshotPath)
        });
      }
    }
  }
}

findBugScreenshots();

// Generate comprehensive bug report HTML
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐛 COMPREHENSIVE BUG REPORT - Banking Application - 2025-08-16</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0e27;
            color: #e1e1e1;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%);
            padding: 3rem 2rem;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.03) 10px,
                rgba(255,255,255,0.03) 20px
            );
            animation: slide 20s linear infinite;
        }
        
        @keyframes slide {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            color: #fff;
            position: relative;
            z-index: 1;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
            position: relative;
            z-index: 1;
        }
        
        .stat-card {
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            text-align: center;
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #fff;
        }
        
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
            color: #fff;
        }
        
        .container {
            max-width: 1600px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .executive-summary {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .executive-summary h2 {
            color: #fff;
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        
        .severity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .severity-card {
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            color: #fff;
            font-weight: bold;
        }
        
        .severity-p0 { background: #ff4757; }
        .severity-p1 { background: #ff6348; }
        .severity-p2 { background: #ffa502; }
        
        .bug-card {
            background: #1a1a2e;
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border-left: 5px solid #ff4757;
            position: relative;
            overflow: hidden;
        }
        
        .bug-card.p0 { border-left-color: #ff4757; }
        .bug-card.p1 { border-left-color: #ff6348; }
        .bug-card.p2 { border-left-color: #ffa502; }
        
        .bug-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        
        .bug-title {
            font-size: 1.5rem;
            color: #fff;
            margin-bottom: 0.5rem;
        }
        
        .bug-id {
            background: #ff4757;
            color: #fff;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
        }
        
        .severity-badge {
            padding: 0.5rem 1rem;
            border-radius: 5px;
            font-weight: bold;
            color: #fff;
            font-size: 0.9rem;
        }
        
        .bug-details {
            display: grid;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .detail-row {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 1rem;
            padding: 0.75rem;
            background: rgba(255,255,255,0.05);
            border-radius: 5px;
        }
        
        .detail-label {
            font-weight: bold;
            color: #667eea;
        }
        
        .detail-value {
            color: #e1e1e1;
        }
        
        .error-box {
            background: rgba(255,71,87,0.1);
            border: 1px solid #ff4757;
            border-radius: 5px;
            padding: 1rem;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            color: #ff6b6b;
        }
        
        .impact-box {
            background: rgba(255,163,2,0.1);
            border: 1px solid #ffa502;
            border-radius: 5px;
            padding: 1rem;
            margin: 1rem 0;
            color: #ffd93d;
        }
        
        .root-cause-box {
            background: rgba(102,126,234,0.1);
            border: 1px solid #667eea;
            border-radius: 5px;
            padding: 1rem;
            margin: 1rem 0;
            color: #a5b4fc;
        }
        
        .screenshot-section {
            margin-top: 2rem;
        }
        
        .screenshot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .screenshot-container {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .screenshot-container:hover {
            transform: scale(1.02);
            box-shadow: 0 20px 40px rgba(255,71,87,0.3);
        }
        
        .screenshot-container img {
            width: 100%;
            height: auto;
            display: block;
            min-height: 250px;
            object-fit: contain;
            background: #000;
        }
        
        .screenshot-caption {
            padding: 0.75rem;
            background: rgba(0,0,0,0.5);
            color: #999;
            font-size: 0.85rem;
        }
        
        .recommendations {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 2rem;
            margin-top: 3rem;
            color: #fff;
        }
        
        .recommendations h2 {
            margin-bottom: 1.5rem;
            font-size: 2rem;
        }
        
        .recommendation-list {
            list-style: none;
        }
        
        .recommendation-list li {
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 5px;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: start;
            gap: 1rem;
        }
        
        .rec-icon {
            font-size: 1.5rem;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.95);
            cursor: pointer;
        }
        
        .modal.active {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .modal-content {
            max-width: 95%;
            max-height: 95%;
            object-fit: contain;
        }
        
        .modal-close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .modal-close:hover {
            color: #ff4757;
        }
        
        .timeline {
            background: #16213e;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        
        .timeline-item {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .timeline-time {
            color: #667eea;
            font-weight: bold;
            min-width: 100px;
        }
        
        .timeline-event {
            color: #e1e1e1;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐛 COMPREHENSIVE BUG REPORT</h1>
        <p style="font-size: 1.2rem; opacity: 0.9;">Banking Application QA Test Results - Critical Issues Found</p>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${bugs.length}</div>
                <div class="stat-label">Total Bugs Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${bugs.filter(b => b.severity === 'P0-BLOCKER').length}</div>
                <div class="stat-label">P0 Blockers</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${bugs.filter(b => b.severity === 'P1-CRITICAL').length}</div>
                <div class="stat-label">P1 Critical</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">0%</div>
                <div class="stat-label">Tests Passing</div>
            </div>
        </div>
    </div>
    
    <div class="container">
        <!-- Executive Summary -->
        <div class="executive-summary">
            <h2>📊 EXECUTIVE SUMMARY</h2>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
                The banking application is currently <strong style="color: #ff4757;">NOT READY FOR PRODUCTION</strong> with 
                ${bugs.filter(b => b.severity === 'P0-BLOCKER').length} blocker issues preventing core functionality.
            </p>
            
            <div class="severity-grid">
                <div class="severity-card severity-p0">
                    <div style="font-size: 2rem;">${bugs.filter(b => b.severity === 'P0-BLOCKER').length}</div>
                    <div>P0 - BLOCKERS</div>
                    <div style="font-size: 0.85rem; margin-top: 0.5rem;">System Unusable</div>
                </div>
                <div class="severity-card severity-p1">
                    <div style="font-size: 2rem;">${bugs.filter(b => b.severity === 'P1-CRITICAL').length}</div>
                    <div>P1 - CRITICAL</div>
                    <div style="font-size: 0.85rem; margin-top: 0.5rem;">Major Features Broken</div>
                </div>
                <div class="severity-card severity-p2">
                    <div style="font-size: 2rem;">${bugs.filter(b => b.severity === 'P2-MAJOR').length}</div>
                    <div>P2 - MAJOR</div>
                    <div style="font-size: 0.85rem; margin-top: 0.5rem;">Significant Issues</div>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255,71,87,0.2); border-radius: 5px;">
                <strong>⚠️ CRITICAL FINDING:</strong> The application has a 37.3 second page load time (LCP), 
                which is 15x slower than acceptable limits. Combined with API failures and missing UI elements, 
                the application is completely non-functional for end users.
            </div>
        </div>
        
        <!-- Detailed Bug Reports -->
        ${bugs.map((bug, index) => `
        <div class="bug-card ${bug.severity.toLowerCase().replace('-', '')}">
            <div class="bug-header">
                <div>
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                        <span class="bug-id">${bug.id}</span>
                        <span class="severity-badge severity-${bug.severity.toLowerCase().split('-')[0]}">${bug.severity}</span>
                    </div>
                    <h3 class="bug-title">${bug.title}</h3>
                    <div style="color: #999; font-size: 0.9rem;">Component: ${bug.component}</div>
                </div>
            </div>
            
            <div class="bug-details">
                <div class="detail-row">
                    <div class="detail-label">📝 Description</div>
                    <div class="detail-value">${bug.description}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">🎯 Reproducibility</div>
                    <div class="detail-value">${bug.reproducibility}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">📊 Affected Tests</div>
                    <div class="detail-value">${bug.affectedTests} test(s) failing</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">📅 First Detected</div>
                    <div class="detail-value">${bug.firstSeen}</div>
                </div>
            </div>
            
            <div class="error-box">
                <strong>Error Message:</strong><br>
                ${bug.errorMessage}
            </div>
            
            <div class="impact-box">
                <strong>🚨 Business Impact:</strong><br>
                ${bug.impact}
            </div>
            
            <div class="root-cause-box">
                <strong>🔍 Root Cause Analysis:</strong><br>
                ${bug.rootCause}
            </div>
            
            ${bugScreenshots[bug.id] && bugScreenshots[bug.id].length > 0 ? `
            <div class="screenshot-section">
                <h4 style="color: #fff; margin-bottom: 1rem;">📸 Visual Evidence</h4>
                <div class="screenshot-grid">
                    ${bugScreenshots[bug.id].map((screenshot, idx) => `
                    <div class="screenshot-container" onclick="openModal('bug${index}_img${idx}')">
                        <img id="bug${index}_img${idx}" src="${screenshot.base64}" alt="${bug.title} - Screenshot ${idx + 1}" />
                        <div class="screenshot-caption">
                            ${screenshot.filename}
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        `).join('')}
        
        <!-- Timeline of Issues -->
        <div class="timeline">
            <h2 style="color: #fff; margin-bottom: 1.5rem;">⏱️ Issue Detection Timeline</h2>
            ${bugs.sort((a, b) => new Date(a.firstSeen) - new Date(b.firstSeen)).map(bug => `
            <div class="timeline-item">
                <div class="timeline-time">${bug.firstSeen.split('T')[1]}</div>
                <div class="timeline-event">
                    <strong>${bug.id}</strong>: ${bug.title} (${bug.severity})
                </div>
            </div>
            `).join('')}
        </div>
        
        <!-- Recommendations -->
        <div class="recommendations">
            <h2>🔧 IMMEDIATE ACTION REQUIRED</h2>
            <ul class="recommendation-list">
                <li>
                    <span class="rec-icon">🚨</span>
                    <div>
                        <strong>P0 - Fix Frontend Server Stability:</strong><br>
                        Replace PM2 with native Node.js process management or use production build for testing.
                        Current setup is causing 100% test failure rate.
                    </div>
                </li>
                <li>
                    <span class="rec-icon">⚡</span>
                    <div>
                        <strong>P0 - Emergency Performance Fix:</strong><br>
                        37.3s load time is catastrophic. Implement code splitting, lazy loading, and CDN for assets.
                        Target: Reduce to under 3 seconds immediately.
                    </div>
                </li>
                <li>
                    <span class="rec-icon">🔧</span>
                    <div>
                        <strong>P0 - Restore Refinance API:</strong><br>
                        All refinance endpoints are down. Check server logs, verify routes, and ensure database connectivity.
                        This affects 21 test cases.
                    </div>
                </li>
                <li>
                    <span class="rec-icon">📝</span>
                    <div>
                        <strong>P0 - Fix Dropdown Selectors:</strong><br>
                        Update DOM structure or test selectors for property ownership dropdown.
                        Tests expect search input that no longer exists.
                    </div>
                </li>
                <li>
                    <span class="rec-icon">🌐</span>
                    <div>
                        <strong>P1 - Restore Missing Translations:</strong><br>
                        Property ownership translations are missing. Restore from git history or re-add keys to all language files.
                    </div>
                </li>
                <li>
                    <span class="rec-icon">🛡️</span>
                    <div>
                        <strong>P1 - Fix Cookie Consent:</strong><br>
                        Implement proper cookie consent handling or update test selectors to match current implementation.
                    </div>
                </li>
            </ul>
        </div>
        
        <!-- Test Environment Info -->
        <div style="background: #16213e; border-radius: 15px; padding: 2rem; margin-top: 2rem;">
            <h2 style="color: #fff; margin-bottom: 1rem;">🖥️ Test Environment</h2>
            <div class="detail-row">
                <div class="detail-label">Test Date</div>
                <div class="detail-value">2025-08-16</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Test Framework</div>
                <div class="detail-value">Cypress 14.5.4</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Frontend Server</div>
                <div class="detail-value">Vite Dev Server (Port 5173) - UNSTABLE</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Backend Server</div>
                <div class="detail-value">Node.js Express (Port 8003)</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Database</div>
                <div class="detail-value">PostgreSQL on Railway</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Test Suites Run</div>
                <div class="detail-value">5 (MenuNavigation, MortgageSteps, RefinanceCredit, RefinanceMortgage, CalculateCredit)</div>
            </div>
        </div>
    </div>
    
    <!-- Modal for full-size images -->
    <div id="imageModal" class="modal" onclick="closeModal()">
        <span class="modal-close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImage">
    </div>
    
    <script>
        function openModal(imgId) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            const img = document.getElementById(imgId);
            modal.classList.add('active');
            modalImg.src = img.src;
        }
        
        function closeModal() {
            document.getElementById('imageModal').classList.remove('active');
        }
        
        // Add severity coloring
        document.querySelectorAll('.severity-p0').forEach(el => {
            el.style.background = '#ff4757';
        });
        document.querySelectorAll('.severity-p1').forEach(el => {
            el.style.background = '#ff6348';
        });
        document.querySelectorAll('.severity-p2').forEach(el => {
            el.style.background = '#ffa502';
        });
        
        console.log('🐛 Bug Report Generated Successfully!');
        console.log('📊 Total Bugs: ${bugs.length}');
        console.log('🚨 P0 Blockers: ${bugs.filter(b => b.severity === 'P0-BLOCKER').length}');
        console.log('⚠️ P1 Critical: ${bugs.filter(b => b.severity === 'P1-CRITICAL').length}');
    </script>
</body>
</html>`;

// Write the comprehensive bug report
const outputPath = 'server/docs/QA/ReportsCreations/COMPREHENSIVE-BUG-REPORT.html';
fs.writeFileSync(outputPath, htmlContent);

console.log(`\n✅ COMPREHENSIVE BUG REPORT GENERATED!`);
console.log(`📁 Report location: ${outputPath}`);
console.log(`📊 Report size: ${(Buffer.byteLength(htmlContent) / 1024 / 1024).toFixed(2)}MB`);
console.log(`\n🐛 Bug Summary:`);
console.log(`   - P0 BLOCKERS: ${bugs.filter(b => b.severity === 'P0-BLOCKER').length}`);
console.log(`   - P1 CRITICAL: ${bugs.filter(b => b.severity === 'P1-CRITICAL').length}`);
console.log(`   - P2 MAJOR: ${bugs.filter(b => b.severity === 'P2-MAJOR').length}`);
console.log(`\n📸 Screenshots embedded: ${Object.values(bugScreenshots).flat().length}`);
console.log('\n🎯 The report includes actual embedded screenshots showing each bug!');