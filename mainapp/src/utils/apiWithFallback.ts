/**
 * API utility with automatic retry and fallback functionality
 */

import { API_RETRY_CONFIG } from '@src/config/fallbackDefaults'

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Calculate exponential backoff delay
 */
const calculateDelay = (attempt: number): number => {
  const delay = API_RETRY_CONFIG.retryDelay * Math.pow(API_RETRY_CONFIG.backoffMultiplier, attempt - 1)
  return Math.min(delay, API_RETRY_CONFIG.maxRetryDelay)
}

/**
 * Options for fetch with retry
 */
interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number
  onRetry?: (attempt: number, error: Error) => void
  fallbackData?: any
}

/**
 * Fetch with automatic retry and exponential backoff
 * @param url - The URL to fetch
 * @param options - Fetch options with retry configuration
 * @returns Response or fallback data
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = API_RETRY_CONFIG.maxRetries,
    onRetry,
    fallbackData,
    ...fetchOptions
  } = options

  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions)
      
      // Check for server errors (5xx) that should be retried
      if (response.status >= 500 && attempt < maxRetries) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      // For non-server errors, return immediately
      if (response.ok || response.status < 500) {
        return response
      }
      
      // Client errors (4xx) should not be retried
      throw new Error(`Client error: ${response.status}`)
      
    } catch (error) {
      lastError = error as Error
      
      // Network errors and server errors should be retried
      const isRetriableError = 
        error instanceof TypeError || // Network error
        (error instanceof Error && error.message.includes('Server error'))
      
      if (isRetriableError && attempt < maxRetries) {
        const delay = calculateDelay(attempt)
        
        if (onRetry) {
          onRetry(attempt, error as Error)
        }
        
        console.warn(`API call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, error)
        await sleep(delay)
      } else if (!isRetriableError) {
        // Non-retriable error, throw immediately
        throw error
      }
    }
  }
  
  // All retries exhausted
  console.error(`API call failed after ${maxRetries} attempts`, lastError)
  
  // If fallback data is provided, return it as a synthetic response
  if (fallbackData !== undefined) {
    console.info('Using fallback data due to API failure')
    return new Response(JSON.stringify(fallbackData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  throw lastError || new Error('API call failed')
}

/**
 * Fetch JSON with automatic retry and fallback
 * @param url - The URL to fetch
 * @param options - Fetch options with retry configuration
 * @returns Parsed JSON response or fallback data
 */
export async function fetchJsonWithFallback<T = any>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  try {
    const response = await fetchWithRetry(url, options)
    const data = await response.json()
    return data
  } catch (error) {
    if (options.fallbackData !== undefined) {
      console.warn('Using fallback data due to JSON fetch failure:', error)
      return options.fallbackData
    }
    throw error
  }
}

/**
 * Create a cached fetch function
 */
export function createCachedFetch<T = any>(
  cacheKey: string,
  ttl: number = 300000 // 5 minutes default
) {
  let cache: { data: T; timestamp: number } | null = null
  
  return async function cachedFetch(
    url: string,
    options: FetchWithRetryOptions = {}
  ): Promise<T> {
    // Check cache validity
    if (cache && Date.now() - cache.timestamp < ttl) {
      console.debug(`Using cached data for ${cacheKey}`)
      return cache.data
    }
    
    // Fetch fresh data
    const data = await fetchJsonWithFallback<T>(url, options)
    
    // Update cache
    cache = {
      data,
      timestamp: Date.now()
    }
    
    return data
  }
}