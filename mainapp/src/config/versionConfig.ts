/**
 * Version Configuration - Manual Management
 * EDIT THIS FILE to update version information
 */

export const VERSION_CONFIG = {
  // Version number (update manually)
  version: '0.1.2',
  
  // Deployment timestamp (update manually when deploying)
  datetime: '25.08.2025 12:35',
  
  // Environment visibility flags
  showOnTest: true,
  showOnProd: true,
  
  // Additional info
  buildNumber: '001',
  commit: 'manual',
  
  // Helper method to check if chip should be visible
  isVisible: () => {
    // Detect environment - you can customize this logic
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isTest = hostname.includes('dev2') || hostname.includes('test') || hostname.includes('localhost');
    const isProd = hostname.includes('bankimonline.com') && !hostname.includes('dev2');
    
    if (isTest) return VERSION_CONFIG.showOnTest;
    if (isProd) return VERSION_CONFIG.showOnProd;
    
    // Default to visible for unknown environments (local dev)
    return true;
  }
};

// Export for easy imports
export default VERSION_CONFIG;