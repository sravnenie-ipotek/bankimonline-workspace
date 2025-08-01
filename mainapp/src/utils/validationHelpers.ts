// Create a simple cache within this file instead of importing non-existent contentCache
const validationCache = new Map<string, Record<string, string>>();

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
    console.log(`🔍 getValidationError called for key: ${errorKey}, language: ${currentLang}`)
    
    // Try to get from content cache first
    const cached = validationCache.get(`validation_errors_${currentLang}`)
    if (cached && cached[errorKey]) {
      // Extract the value if it's an object, otherwise use as-is
      const cachedValue = typeof cached[errorKey] === 'object' ? cached[errorKey].value : cached[errorKey]
      console.log(`✅ Found cached validation error: ${errorKey} -> "${cachedValue}"`)
      return cachedValue
    }
    
    // Try to fetch from database first
    try {
      console.log(`🌐 Fetching from database: /api/content/validation_errors/${currentLang}`)
      const response = await fetch(`/api/content/validation_errors/${currentLang}`)
      if (response.ok) {
        const data = await response.json()
        console.log(`📊 Database response:`, data)
        if (data.content && data.content[errorKey] && data.content[errorKey].value) {
          // Cache the result
          validationCache.set(`validation_errors_${currentLang}`, data.content)
          console.log(`✅ Found database validation error: ${errorKey} -> "${data.content[errorKey].value}"`)
          return data.content[errorKey].value
        } else {
          console.log(`❌ Key ${errorKey} not found in database response`)
        }
      } else {
        console.log(`❌ Database response not ok:`, response.status)
      }
    } catch (dbError) {
      console.warn('Database fetch failed, falling back to translation system:', dbError)
    }
    
    // FALLBACK: Use translation system (i18next)
    if (typeof window !== 'undefined' && window.i18next) {
      const translatedValue = window.i18next.t(errorKey)
      if (translatedValue && translatedValue !== errorKey) {
        console.log(`✅ Found translation: ${errorKey} -> "${translatedValue}"`)
        return translatedValue
      } else {
        console.log(`❌ Translation not found for key: ${errorKey}`)
      }
    }
    
    // Return fallback or key if not found
    console.log(`⚠️ Using fallback for key: ${errorKey} -> "${fallback || errorKey}"`)
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
    console.log(`🔍 getValidationErrorSync called for key: ${errorKey}, language: ${currentLang}`)
    
    // Try to get from content cache first
    const cached = validationCache.get(`validation_errors_${currentLang}`)
    if (cached && cached[errorKey]) {
      // Extract the value if it's an object, otherwise use as-is
      const cachedValue = typeof cached[errorKey] === 'object' ? cached[errorKey].value : cached[errorKey]
      console.log(`✅ Found cached validation error: ${errorKey} -> "${cachedValue}"`)
      return cachedValue
    }
    
    // FALLBACK: Use translation system (i18next) synchronously
    if (typeof window !== 'undefined' && window.i18next) {
      const translatedValue = window.i18next.t(errorKey)
      if (translatedValue && translatedValue !== errorKey) {
        console.log(`✅ Found translation: ${errorKey} -> "${translatedValue}"`)
        return translatedValue
      } else {
        console.log(`❌ Translation not found for key: ${errorKey}`)
      }
    }
    
    // Return fallback if not in cache or translation
    console.log(`⚠️ Using fallback for key: ${errorKey} -> "${fallback || errorKey}"`)
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
    
    // Try database first
    try {
      const response = await fetch(`/api/content/validation_errors/${currentLang}`)
      if (response.ok) {
        const data = await response.json()
        if (data.content) {
          validationCache.set(`validation_errors_${currentLang}`, data.content)
          console.log('✅ Validation errors preloaded from database for language:', currentLang)
          console.log('📊 Cached validation errors:', Object.keys(data.content))
          return
        }
      }
    } catch (dbError) {
      console.warn('Database preload failed, validation errors will use translation system:', dbError)
    }
    
    // If database fails, we'll rely on translation system
    console.log('ℹ️ Validation errors will use translation system for language:', currentLang)
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
        console.log('🔄 i18next language changed, reloading validation errors for:', lng)
        reloadValidationErrors()
      })
      console.log('✅ i18next language change listener initialized')
    }
    
    // Listen for document language changes (fallback)
    if (typeof document !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
            const newLang = document.documentElement.lang
            if (newLang) {
              console.log('🔄 Document language changed, reloading validation errors for:', newLang)
              setTimeout(() => reloadValidationErrors(), 100) // Small delay to ensure language is fully switched
            }
          }
        })
      })
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
      })
      console.log('✅ Document language change observer initialized')
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
    console.log('🔄 Reloading validation errors for language:', currentLang)
    
    // Clear existing cache for this language
    validationCache.delete(`validation_errors_${currentLang}`)
    
    // Reload from database or translation system
    await preloadValidationErrors()
  } catch (error) {
    console.warn('Failed to reload validation errors:', error)
  }
}