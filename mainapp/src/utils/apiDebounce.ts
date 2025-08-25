/**
 * API debouncing utilities (Bug #17)
 * Prevents excessive API calls during rapid user input
 */

/**
 * Creates a debounced version of an async function
 * @param func - The async function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with cancel method
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  delay: number = 300
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null
  let pendingPromise: Promise<any> | null = null
  
  const debounced = (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // Create new promise for this call
    pendingPromise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          timeoutId = null
          pendingPromise = null
        }
      }, delay)
    })
    
    return pendingPromise
  }
  
  // Add cancel method
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    pendingPromise = null
  }
  
  return debounced as T & { cancel: () => void }
}

/**
 * Hook for debounced API calls
 */
import { useCallback, useEffect, useRef } from 'react'

export function useDebouncedApi<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  delay: number = 300
): [T, () => void] {
  const debouncedFnRef = useRef<ReturnType<typeof debounceAsync<T>> | null>(null)
  
  useEffect(() => {
    debouncedFnRef.current = debounceAsync(apiFunction, delay)
    
    return () => {
      if (debouncedFnRef.current) {
        debouncedFnRef.current.cancel()
      }
    }
  }, [apiFunction, delay])
  
  const call = useCallback((...args: Parameters<T>) => {
    if (debouncedFnRef.current) {
      return debouncedFnRef.current(...args)
    }
    return Promise.reject(new Error('Debounced function not initialized'))
  }, []) as T
  
  const cancel = useCallback(() => {
    if (debouncedFnRef.current) {
      debouncedFnRef.current.cancel()
    }
  }, [])
  
  return [call, cancel]
}

/**
 * Debounce configuration for different API types
 */
export const API_DEBOUNCE_DELAYS = {
  search: 500,        // Search operations
  validation: 300,    // Form validation
  calculation: 1000,  // Heavy calculations
  autocomplete: 200,  // Autocomplete suggestions
  save: 2000         // Auto-save operations
} as const