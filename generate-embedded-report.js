const fs = require('fs');
const path = require('path');

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

// Function to convert video to base64 (for smaller videos only)
function videoToBase64(filePath, maxSizeMB = 10) {
  try {
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    if (fileSizeMB > maxSizeMB) {
      console.log(`Video ${filePath} is too large (${fileSizeMB.toFixed(1)}MB)`);
      return null;
    }
    
    const videoBuffer = fs.readFileSync(filePath);
    const base64 = videoBuffer.toString('base64');
    return `data:video/mp4;base64,${base64}`;
  } catch(e) {
    console.log('Could not read video:', filePath);
    return null;
  }
}

// Find recent screenshots and videos
const screenshotDir = 'mainapp/cypress/screenshots';
const videoDir = 'mainapp/cypress/videos';
const screenshots = [];
const videos = [];

// Get screenshots from most recent runs (2025-08-16)
function findRecentScreenshots(dir) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && item.includes('2025-08-16')) {
        const subItems = fs.readdirSync(fullPath);
        for (const subItem of subItems) {
          if (subItem.includes('.cy.ts')) {
            const testDir = path.join(fullPath, subItem);
            const testFiles = fs.readdirSync(testDir);
            for (const testFile of testFiles) {
              if (testFile.endsWith('.png')) {
                const screenshotPath = path.join(testDir, testFile);
                const base64Data = imageToBase64(screenshotPath);
                if (base64Data) {
                  screenshots.push({
                    path: screenshotPath,
                    name: testFile,
                    testName: subItem.replace('.cy.ts', ''),
                    base64: base64Data,
                    timestamp: testFile.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/) || ['N/A']
                  });
                }
              }
            }
          }
        }
      }
    }
  } catch(e) {
    console.log('Error reading directory:', dir);
  }
}

// Get recent videos
function findRecentVideos(dir) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item.endsWith('.mp4') && !item.includes('compressed')) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        const fileSizeMB = stat.size / (1024 * 1024);
        
        videos.push({
          path: fullPath,
          name: item,
          sizeMB: fileSizeMB.toFixed(1),
          // Only embed small videos, provide path for large ones
          base64: fileSizeMB < 5 ? videoToBase64(fullPath, 5) : null
        });
      }
    }
  } catch(e) {
    console.log('Error reading video directory:', dir);
  }
}

console.log('Scanning for screenshots and videos...');
findRecentScreenshots(screenshotDir);
findRecentVideos(videoDir);

console.log(`Found ${screenshots.length} recent screenshots`);
console.log(`Found ${videos.length} videos`);

// Take only the most recent/relevant screenshots (limit to 20 for file size)
const selectedScreenshots = screenshots
  .filter(s => s.name.includes('2025-08-16') || s.testName.includes('mortgage') || s.testName.includes('refinance'))
  .slice(0, 20);

console.log(`Selected ${selectedScreenshots.length} screenshots for embedding`);

// Generate HTML report with embedded media
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Test Report - EMBEDDED MEDIA - 2025-08-16</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f23;
            color: #e1e1e1;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 3rem 2rem;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            color: #fff;
        }
        
        .container {
            max-width: 1600px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .section {
            background: #1a1a2e;
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .section h2 {
            color: #667eea;
            margin-bottom: 1.5rem;
            font-size: 2rem;
            border-bottom: 2px solid #667eea;
            padding-bottom: 0.5rem;
        }
        
        .screenshot-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .screenshot-item {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            overflow: hidden;
            transition: transform 0.3s ease;
            cursor: pointer;
        }
        
        .screenshot-item:hover {
            transform: scale(1.02);
            box-shadow: 0 20px 40px rgba(102,126,234,0.3);
        }
        
        .screenshot-item img {
            width: 100%;
            height: auto;
            display: block;
            min-height: 300px;
            max-height: 500px;
            object-fit: contain;
            background: #000;
        }
        
        .screenshot-info {
            padding: 1rem;
            background: rgba(0,0,0,0.3);
        }
        
        .screenshot-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.5rem;
            word-break: break-all;
            font-size: 0.9rem;
        }
        
        .video-container {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        
        .video-container h3 {
            color: #667eea;
            margin-bottom: 1rem;
        }
        
        video {
            width: 100%;
            max-width: 1000px;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
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
            color: #667eea;
        }
        
        .warning {
            background: #ff4757;
            color: white;
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
            text-align: center;
        }
        
        .success {
            background: #5cb85c;
            color: white;
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎬 QA Test Report - WITH EMBEDDED SCREENSHOTS</h1>
        <p style="font-size: 1.2rem; opacity: 0.9;">All screenshots are embedded directly in this HTML file</p>
    </div>
    
    <div class="container">
        <div class="section">
            <h2>✅ Embedded Screenshots Status</h2>
            <div class="success">
                ✓ ${selectedScreenshots.length} screenshots successfully embedded as base64 data
            </div>
            <p style="margin-top: 1rem;">All images below are fully embedded in this HTML file. You can save this file and view it offline!</p>
        </div>
        
        <div class="section">
            <h2>📸 Test Screenshots - FULLY EMBEDDED</h2>
            <p style="color: #999; margin-bottom: 2rem;">Click any screenshot to view full size. These are actual embedded images, not placeholders!</p>
            
            <div class="screenshot-gallery">
                ${selectedScreenshots.map(screenshot => `
                <div class="screenshot-item" onclick="openModal('img${screenshots.indexOf(screenshot)}')">
                    <img id="img${screenshots.indexOf(screenshot)}" src="${screenshot.base64}" alt="${screenshot.name}" />
                    <div class="screenshot-info">
                        <div class="screenshot-title">${screenshot.testName}</div>
                        <div style="color: #999; font-size: 0.8rem;">${screenshot.name}</div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>🎥 Test Videos</h2>
            ${videos.map(video => {
                if (video.base64) {
                    return `
                    <div class="video-container">
                        <h3>🎬 ${video.name}</h3>
                        <p style="color: #999; margin-bottom: 1rem;">Size: ${video.sizeMB}MB - Embedded Video</p>
                        <video controls>
                            <source src="${video.base64}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>`;
                } else {
                    return `
                    <div class="video-container">
                        <h3>🎬 ${video.name}</h3>
                        <p style="color: #999;">Size: ${video.sizeMB}MB - Too large to embed</p>
                        <p style="color: #667eea;">Location: ${video.path}</p>
                    </div>`;
                }
            }).join('')}
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
        
        // Success message
        console.log('✅ All screenshots are embedded as base64 data!');
        console.log('✅ This HTML file contains the actual images, not just file paths!');
    </script>
</body>
</html>`;

// Write the HTML file
const outputPath = 'server/docs/QA/ReportsCreations/EMBEDDED-SCREENSHOTS-REPORT.html';
fs.writeFileSync(outputPath, htmlContent);

console.log(`\n✅ SUCCESS! Report generated with ${selectedScreenshots.length} embedded screenshots!`);
console.log(`📁 Report location: ${outputPath}`);
console.log(`📊 File size: ${(Buffer.byteLength(htmlContent) / 1024 / 1024).toFixed(2)}MB`);
console.log('\n🎯 The screenshots are now ACTUALLY EMBEDDED in the HTML file as base64 data!');
console.log('You can open this file in any browser and see the actual screenshots!');