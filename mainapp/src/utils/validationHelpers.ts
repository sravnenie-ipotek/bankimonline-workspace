// Create a simple cache within this file instead of importing non-existent contentCache
const validationCache = new Map<string, Record<string, string>>();

/**
 * Get API base URL (same logic as api.ts)
 */
const getApiBaseUrl = (): string => {
  // Check if we're running on localhost (development)
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8003/api'
  }
  
  // In production, use environment variable or fallback to production
  return import.meta.env.VITE_NODE_API_BASE_URL || 'https://bankimonline.com/api'
}

/**
 * Get current language from i18next (same as useContentApi)
 */
const getCurrentLanguage = (): string => {
  try {
    // Use the same logic as useContentApi
    if (typeof window !== 'undefined' && window.i18next) {
      return window.i18next.language || 'en'
    }
    
    // Fallback to document language
    if (typeof document !== 'undefined') {
      return document.documentElement.lang || 'en'
    }
    
    // Default to English (same as useContentApi)
    return 'en'
  } catch (error) {
    console.warn('Failed to get current language, defaulting to English:', error)
    return 'en'
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
      // Extract the value if it's an object, otherwise use as-is
      const cachedValue = typeof cached[errorKey] === 'object' ? cached[errorKey].value : cached[errorKey]
      return cachedValue
    }
    
    // Try to fetch from database first
    try {
      const apiUrl = `${getApiBaseUrl()}/content/validation_errors/${currentLang}`
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        if (data.content && data.content[errorKey] && data.content[errorKey].value) {
          // Cache the result
          validationCache.set(`validation_errors_${currentLang}`, data.content)
          return data.content[errorKey].value
        } else {
          }
      } else {
        }
    } catch (dbError) {
      console.warn('Database fetch failed, falling back to translation system:', dbError)
    }
    
    // FALLBACK: Use translation system (i18next)
    if (typeof window !== 'undefined' && window.i18next) {
      const translatedValue = window.i18next.t(errorKey)
      if (translatedValue && translatedValue !== errorKey) {
        return translatedValue
      } else {
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
      // Extract the value if it's an object, otherwise use as-is
      const cachedValue = typeof cached[errorKey] === 'object' ? cached[errorKey].value : cached[errorKey]
      return cachedValue
    }
    
    // FALLBACK: Use translation system (i18next) synchronously
    if (typeof window !== 'undefined' && window.i18next) {
      const translatedValue = window.i18next.t(errorKey)
      if (translatedValue && translatedValue !== errorKey) {
        return translatedValue
      } else {
        }
    }
    
    // Return fallback if not in cache or translation
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
    // Try database first
    try {
      const apiUrl = `${getApiBaseUrl()}/content/validation_errors/${currentLang}`
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        if (data.content) {
          validationCache.set(`validation_errors_${currentLang}`, data.content)
          console.log('Validation helper debug')
          return
        }
      }
    } catch (dbError) {
      console.warn('Database preload failed, validation errors will use translation system:', dbError)
    }
    
    // If database fails, we'll rely on translation system
    } catch (error) {
    console.warn('Failed to preload validation errors:', error)
  }
}

/**
 * Initialize language change listener
 * Should be called in app initialization
 */
export const initializeValidationLanguageListener = () => {
  try {
    // Listen for i18next language changes
    if (typeof window !== 'undefined' && window.i18next) {
      window.i18next.on('languageChanged', (lng: string) => {
        reloadValidationErrors()
      })
      }
    
    // Listen for document language changes (fallback)
    if (typeof document !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
            const newLang = document.documentElement.lang
            if (newLang) {
              setTimeout(() => reloadValidationErrors(), 100) // Small delay to ensure language is fully switched
            }
          }
        })
      })
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
      })
      }
    
    // Preload validation errors for current language
    preloadValidationErrors()
  } catch (error) {
    console.warn('Failed to initialize validation language listener:', error)
  }
}

/**
 * Force reload validation errors (useful for language changes)
 */
export const reloadValidationErrors = async () => {
  try {
    const currentLang = getCurrentLanguage()
    // Clear existing cache for this language
    validationCache.delete(`validation_errors_${currentLang}`)
    
    // Reload from database or translation system
    await preloadValidationErrors()
  } catch (error) {
    console.warn('Failed to reload validation errors:', error)
  }
}