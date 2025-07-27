// Create a simple cache within this file instead of importing non-existent contentCache
const validationCache = new Map<string, Record<string, string>>();

/**
 * Validation content helper that fetches error messages from database
 * Use this instead of i18next.t() in validation schemas
 */
export const getValidationError = (errorKey: string, fallback?: string): string => {
  try {
    // Try to get from content cache first
    const cached = validationCache.get('validation_errors')
    if (cached && cached[errorKey]) {
      return cached[errorKey]
    }
    
    // Return fallback or key if not found
    return fallback || errorKey
  } catch (error) {
    console.warn(`Validation error key not found: ${errorKey}`)
    return fallback || errorKey
  }
}

/**
 * Pre-load validation errors for better performance
 * Call this in app initialization or form components
 */
export const preloadValidationErrors = async () => {
  try {
    const response = await fetch(`/api/content/validation_errors/en`)
    if (response.ok) {
      const content = await response.json()
      validationCache.set('validation_errors', content)
    }
  } catch (error) {
    console.warn('Failed to preload validation errors:', error)
  }
}