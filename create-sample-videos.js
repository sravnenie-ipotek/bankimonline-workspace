#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Create sample video files for testing Jira video attachments
 */
function createSampleVideos() {
  console.log('🎬 Creating sample video files for testing...');
  
  // Create test directories if they don't exist
  const testDirs = [
    'qa-reports/2025-08-17T10-03-57-170Z',
    'test-error-reports/2025-08-17T10-03-53-821Z'
  ];
  
  testDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  // Create sample video files (dummy files with video extensions)
  const sampleVideos = [
    {
      path: 'qa-reports/2025-08-17T10-03-57-170Z/credit-step3-test-recording.mp4',
      content: 'Sample MP4 video content for credit calculator step 3 test recording'
    },
    {
      path: 'qa-reports/2025-08-17T10-03-57-170Z/mortgage-step1-test-recording.webm',
      content: 'Sample WebM video content for mortgage calculator step 1 test recording'
    },
    {
      path: 'qa-reports/2025-08-17T10-03-57-170Z/refinance-step1-test-recording.mov',
      content: 'Sample MOV video content for refinance calculator step 1 test recording'
    },
    {
      path: 'test-error-reports/2025-08-17T10-03-53-821Z/test-error-recording.mp4',
      content: 'Sample MP4 video content for test error recording'
    }
  ];
  
  sampleVideos.forEach(video => {
    fs.writeFileSync(video.path, video.content);
    console.log(`🎥 Created sample video: ${video.path}`);
  });
  
  console.log('\n✅ Sample video files created successfully!');
  console.log('📹 These files will be attached to Jira bugs as video evidence');
  console.log('🎬 Supported formats: .mp4, .webm, .mov, .avi, .mkv');
}

// Run the function
createSampleVideos();

module.exports = createSampleVideos;
