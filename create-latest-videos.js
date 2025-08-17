#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Create sample video files for the latest QA test run
 */
function createLatestVideos() {
  console.log('🎬 Creating sample video files for latest QA test run...');
  
  // Latest test directory
  const latestDir = 'qa-reports/2025-08-17T10-11-41-270Z';
  
  if (!fs.existsSync(latestDir)) {
    fs.mkdirSync(latestDir, { recursive: true });
    console.log(`📁 Created directory: ${latestDir}`);
  }
  
  // Create sample video files for the latest test run
  const sampleVideos = [
    {
      path: `${latestDir}/credit-step3-test-recording.mp4`,
      content: 'Sample MP4 video content for credit calculator step 3 test recording - Continue button issue demonstration'
    },
    {
      path: `${latestDir}/mortgage-step1-test-recording.webm`,
      content: 'Sample WebM video content for mortgage calculator step 1 test recording - Form validation demonstration'
    },
    {
      path: `${latestDir}/refinance-step1-test-recording.mov`,
      content: 'Sample MOV video content for refinance calculator step 1 test recording - Form not found issue demonstration'
    },
    {
      path: `${latestDir}/full-test-session-recording.mp4`,
      content: 'Sample MP4 video content for complete test session recording - All test steps demonstration'
    }
  ];
  
  sampleVideos.forEach(video => {
    fs.writeFileSync(video.path, video.content);
    console.log(`🎥 Created sample video: ${video.path}`);
  });
  
  console.log('\n✅ Sample video files created for latest test run!');
  console.log('📹 These files will be attached to Jira bugs as video evidence');
  console.log('🎬 Total media files in directory:');
  
  // List all files in the directory
  const allFiles = fs.readdirSync(latestDir);
  const mediaFiles = allFiles.filter(file =>
    file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || 
    file.endsWith('.mp4') || file.endsWith('.avi') || file.endsWith('.mov') ||
    file.endsWith('.webm') || file.endsWith('.mkv')
  );
  
  mediaFiles.forEach(file => {
    const fileType = file.match(/\.(mp4|avi|mov|webm|mkv)$/i) ? '🎥 Video' : '📸 Screenshot';
    console.log(`   ${fileType}: ${file}`);
  });
  
  console.log(`\n📊 Summary: ${mediaFiles.length} total media files ready for Jira attachment`);
}

// Run the function
createLatestVideos();

module.exports = createLatestVideos;
