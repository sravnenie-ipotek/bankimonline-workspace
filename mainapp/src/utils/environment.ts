/**
 * Environment utilities for safe access to Vite environment variables
 * This module provides Jest-compatible environment variable access
 */

/**
 * Safely get environment variable with Jest compatibility
 * @param key - The environment variable key (without VITE_ prefix)
 * @param defaultValue - Default value if not found
 * @returns The environment variable value or default
 */
export const getEnvVar = (key: string, defaultValue?: string): string | undefined => {
  // Check if we're in a test environment (Jest)
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    // In test environment, return test defaults
    const testDefaults: Record<string, string> = {
      'NODE_API_BASE_URL': '/api',
      'GOOGLE_MAPS_API_KEY': 'TEST_API_KEY'
    }
    return testDefaults[key] || defaultValue
  }
  
  // Safe check for import.meta (only available in ESM environments)
  try {
    // @ts-ignore - import.meta might not be available in all environments
    const metaEnv = (globalThis as any).import?.meta?.env
    if (metaEnv) {
      const viteKey = `VITE_${key}`
      return metaEnv[viteKey] || defaultValue
    }
  } catch (e) {
    // import.meta not available, fall through to default
  }
  
  return defaultValue
}

/**
 * Check if running in development mode
 * @returns true if in development mode
 */
export const isDevelopment = (): boolean => {
  // Check for test environment
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return false
  }
  
  // Safe check for import.meta.env.DEV
  try {
    // @ts-ignore
    const isDev = (globalThis as any).import?.meta?.env?.DEV
    if (isDev !== undefined) {
      return isDev
    }
  } catch (e) {
    // import.meta not available
  }
  
  return false
}

/**
 * Get the current environment mode
 * @returns The environment mode (development, production, test)
 */
export const getMode = (): string => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'test'
  }
  
  try {
    // @ts-ignore
    const mode = (globalThis as any).import?.meta?.env?.MODE
    if (mode) {
      return mode
    }
  } catch (e) {
    // import.meta not available
  }
  
  return 'production'
}

/**
 * Get the API base URL with proper fallbacks
 * @returns The API base URL
 */
export const getApiBaseUrl = (): string => {
  // In development or localhost, always use proxy
  if (isDevelopment() || 
      (typeof window !== 'undefined' && 
       (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))) {
    return '/api'
  }
  
  // In production, use environment variable or fallback
  return getEnvVar('NODE_API_BASE_URL') || '/api'
}