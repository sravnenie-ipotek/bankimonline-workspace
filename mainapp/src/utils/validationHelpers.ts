// Create a simple cache within this file instead of importing non-existent contentCache
const validationCache = new Map<string, Record<string, string>>();

/**
 * Get current language from i18next
 */
const getCurrentLanguage = (): string => {
  try {
    // Try to get from i18next first
    if (typeof window !== 'undefined' && window.i18next) {
      return window.i18next.language || 'he'
    }
    
    // Fallback to document language
    if (typeof document !== 'undefined') {
      return document.documentElement.lang || 'he'
    }
    
    // Default to Hebrew
    return 'he'
  } catch (error) {
    console.warn('Failed to get current language, defaulting to Hebrew:', error)
    return 'he'
  }
}

/**
 * Validation content helper that fetches error messages from database
 * Use this instead of i18next.t() in validation schemas
 */
export const getValidationError = async (errorKey: string, fallback?: string): Promise<string> => {
  try {
    const currentLang = getCurrentLanguage()
    
    // Try to get from content cache first
    const cached = validationCache.get(`validation_errors_${currentLang}`)
    if (cached && cached[errorKey]) {
      return cached[errorKey]
    }
    
    // Fetch from database if not in cache
    const response = await fetch(`/api/content/validation_errors/${currentLang}`)
    if (response.ok) {
      const data = await response.json()
      if (data.content && data.content[errorKey] && data.content[errorKey].value) {
        // Cache the result
        validationCache.set(`validation_errors_${currentLang}`, data.content)
        return data.content[errorKey].value
      }
    }
    
    // Return fallback or key if not found
    return fallback || errorKey
  } catch (error) {
    console.warn(`Validation error key not found: ${errorKey}`, error)
    return fallback || errorKey
  }
}

/**
 * Synchronous version for use in Yup schemas
 * Note: This will return fallback until cache is populated
 */
export const getValidationErrorSync = (errorKey: string, fallback?: string): string => {
  try {
    const currentLang = getCurrentLanguage()
    
    // Try to get from content cache first
    const cached = validationCache.get(`validation_errors_${currentLang}`)
    if (cached && cached[errorKey]) {
      return cached[errorKey]
    }
    
    // Return fallback if not in cache
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
    const currentLang = getCurrentLanguage()
    console.log('🔄 Preloading validation errors for language:', currentLang)
    
    const response = await fetch(`/api/content/validation_errors/${currentLang}`)
    if (response.ok) {
      const data = await response.json()
      if (data.content) {
        validationCache.set(`validation_errors_${currentLang}`, data.content)
        console.log('✅ Validation errors preloaded for language:', currentLang)
        console.log('📊 Cached validation errors:', Object.keys(data.content))
      }
    } else {
      console.warn('❌ Failed to preload validation errors, response not ok:', response.status)
    }
  } catch (error) {
    console.warn('Failed to preload validation errors:', error)
  }
}

/**
 * Force reload validation errors (useful for language changes)
 */
export const reloadValidationErrors = async () => {
  try {
    const currentLang = getCurrentLanguage()
    console.log('🔄 Reloading validation errors for language:', currentLang)
    
    // Clear existing cache for this language
    validationCache.delete(`validation_errors_${currentLang}`)
    
    // Reload from database
    await preloadValidationErrors()
  } catch (error) {
    console.warn('Failed to reload validation errors:', error)
  }
}