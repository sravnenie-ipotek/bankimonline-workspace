/**
 * Build information - automatically generated during build process
 * DO NOT EDIT MANUALLY - This file is auto-generated
 */

export const BUILD_INFO = {
  version: '0.1.1',
  buildTime: new Date().toLocaleString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit', 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).replace(',', ''),
  environment: import.meta.env.MODE || 'production',
  buildNumber: process.env.GITHUB_RUN_NUMBER || 'local',
  commit: 'initial'
};
