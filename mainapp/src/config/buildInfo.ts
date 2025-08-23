/**
 * Build information - automatically generated during build process
 * This file is updated by the build script with the current timestamp
 */

// Use the global BUILD_INFO injected by Vite, or fallback to defaults
declare const __BUILD_INFO__: {
  version: string;
  buildTime: string;
  buildNumber: string;
  commit: string;
} | undefined;

// This will be replaced during build with actual timestamp
export const BUILD_INFO = typeof __BUILD_INFO__ !== 'undefined' ? {
  ...(__BUILD_INFO__),
  environment: import.meta.env.MODE || 'development'
} : {
  version: '5.2.1',
  buildTime: '23.08.2025 12:31',
  environment: import.meta.env.MODE || 'development',
  buildNumber: 'local',
  commit: 'local'
};
