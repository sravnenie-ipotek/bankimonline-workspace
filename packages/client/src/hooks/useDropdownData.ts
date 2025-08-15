import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// ==================== TYPES ====================

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownData {
  options: DropdownOption[];
  placeholder?: string;
  label?: string;
  loading: boolean;
  error: Error | null;
}

// Phase 3 API Response Structure
interface StructuredDropdownResponse {
  status: string;
  screen_location: string;
  language_code: string;
  dropdowns: Array<{
    key: string;
    label: string;
  }>;
  options: Record<string, DropdownOption[]>;
  placeholders: Record<string, string>;
  labels: Record<string, string>;
  cache_info?: {
    hit: boolean;
    processing_time_ms: number;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

// ==================== CACHING SYSTEM ====================

class DropdownCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expires: now + this.TTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const dropdownCache = new DropdownCache();

// ==================== HOOKS ====================

/**
 * Enhanced dropdown data hook with Phase 4 capabilities
 * 
 * @param screenLocation - Screen location (e.g., 'mortgage_step1')
 * @param fieldName - Field name (e.g., 'when_needed', 'property_ownership')  
 * @param returnStructure - 'options' for backwards compatibility, 'full' for complete structure
 * @returns Dropdown data with options, placeholder, label, loading, and error states
 */
export const useDropdownData = (
  screenLocation: string,
  fieldName: string,
  returnStructure: 'options' | 'full' = 'options'
): DropdownData | DropdownOption[] => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dropdownData, setDropdownData] = useState<DropdownData>({
    options: [],
    placeholder: undefined,
    label: undefined,
    loading: true,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const language = i18n.language || 'en';

  const fetchDropdownData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      // Check cache first
      const cacheKey = `dropdown_${screenLocation}_${language}`;
      const cachedData = dropdownCache.get<StructuredDropdownResponse>(cacheKey);
      
      let apiData: StructuredDropdownResponse;

      if (cachedData) {
        apiData = cachedData;
      } else {
        const response = await fetch(`/api/dropdowns/${screenLocation}/${language}`, {
          signal: abortControllerRef.current.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        apiData = await response.json();
        
        if (apiData.status !== 'success') {
          throw new Error(`API Error: ${apiData.status}`);
        }

        // Cache successful response
        dropdownCache.set(cacheKey, apiData);
        }

      // Extract data for specific field
      const dropdownKey = `${screenLocation}_${fieldName}`;
      const placeholderKey = `${dropdownKey}_ph`;
      const labelKey = `${dropdownKey}_label`;

      // Field synonym support (prod/dev naming variations)
      const FIELD_SYNONYMS: Record<string, string[]> = {
        when_needed: ['when'],
        when: ['when_needed'],
        first_home: ['first'],
        first: ['first_home']
      };

      // Primary values
      let options = apiData.options?.[dropdownKey] || [];
      let placeholder = apiData.placeholders?.[placeholderKey] || apiData.placeholders?.[dropdownKey];
      let label = apiData.labels?.[labelKey] || apiData.labels?.[dropdownKey];

      // If primary empty, try synonyms
      if (options.length === 0 || (!placeholder && !label)) {
        const altFields = FIELD_SYNONYMS[fieldName] || [];
        for (const alt of altFields) {
          const altKey = `${screenLocation}_${alt}`;
          const altPlaceholderKey = `${altKey}_ph`;
          const altLabelKey = `${altKey}_label`;

          if (options.length === 0) {
            options = apiData.options?.[altKey] || [];
          }
          if (!placeholder) {
            placeholder = apiData.placeholders?.[altPlaceholderKey] || apiData.placeholders?.[altKey] || placeholder;
          }
          if (!label) {
            label = apiData.labels?.[altLabelKey] || apiData.labels?.[altKey] || label;
          }

          if (options.length > 0 && (placeholder || label)) break;
        }
      }

      const result: DropdownData = {
        options,
        placeholder,
        label,
        loading: false,
        error: null
      };

      setDropdownData(result);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      console.warn(`❌ Dropdown API error for ${screenLocation}/${fieldName}:`, err);
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      
      setError(errorObj);
      setDropdownData({
        options: [],
        placeholder: undefined,
        label: undefined,
        loading: false,
        error: errorObj
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [screenLocation, fieldName, language]);

  useEffect(() => {
    fetchDropdownData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDropdownData]);

  // Update loading state in dropdownData
  const finalData = {
    ...dropdownData,
    loading,
    error
  };

  // Return based on requested structure for backwards compatibility
  if (returnStructure === 'options' && !loading && !error) {
    return finalData.options;
  }

  return finalData;
};

/**
 * Bulk fetch hook for all dropdowns in a screen
 * Optimizes network usage by fetching all dropdown data at once
 * 
 * @param screenLocation - Screen location (e.g., 'mortgage_step1')
 * @returns All dropdown data for the screen with loading and error states
 */
export const useAllDropdowns = (screenLocation: string) => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<StructuredDropdownResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const language = i18n.language || 'en';

  const fetchAllDropdowns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      // Check cache first
      const cacheKey = `dropdown_${screenLocation}_${language}`;
      const cachedData = dropdownCache.get<StructuredDropdownResponse>(cacheKey);
      
      if (cachedData) {
        setData(cachedData);
        return;
      }

      const response = await fetch(`/api/dropdowns/${screenLocation}/${language}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiData: StructuredDropdownResponse = await response.json();
      
      if (apiData.status !== 'success') {
        throw new Error(`API Error: ${apiData.status}`);
      }

      // Cache successful response
      dropdownCache.set(cacheKey, apiData);
      setData(apiData);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      console.warn(`❌ Bulk dropdown API error for ${screenLocation}:`, err);
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      setData(null);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [screenLocation, language]);

  useEffect(() => {
    fetchAllDropdowns();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAllDropdowns]);

  /**
   * Get dropdown props for a specific field from bulk data
   * @param fieldName - Field name (e.g., 'when_needed')
   * @returns Dropdown props ready for component use
   */
  const getDropdownProps = (fieldName: string) => {
    if (!data) return { options: [], placeholder: undefined, label: undefined };

    const dropdownKey = `${screenLocation}_${fieldName}`;

    // Support synonym field names (prod/dev naming drift)
    const FIELD_SYNONYMS: Record<string, string[]> = {
      when_needed: ['when'],
      when: ['when_needed'],
      first_home: ['first'],
      first: ['first_home']
    };

    let options = data.options?.[dropdownKey] || [];
    let placeholder = data.placeholders?.[dropdownKey];
    let label = data.labels?.[dropdownKey];

    if (options.length === 0 || (!placeholder && !label)) {
      const altFields = FIELD_SYNONYMS[fieldName] || [];
      for (const alt of altFields) {
        const altKey = `${screenLocation}_${alt}`;
        if (options.length === 0) {
          options = data.options?.[altKey] || [];
        }
        if (!placeholder) {
          placeholder = data.placeholders?.[altKey] || placeholder;
        }
        if (!label) {
          label = data.labels?.[altKey] || label;
        }
        if (options.length > 0 && (placeholder || label)) break;
      }
    }

    return { options, placeholder, label };
  };

  return {
    data,
    loading,
    error,
    getDropdownProps,
    // Helper methods
    refresh: fetchAllDropdowns,
    clearCache: () => dropdownCache.clear()
  };
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Clear all dropdown cache
 * Useful for testing or when content updates
 */
export const clearDropdownCache = (): void => {
  dropdownCache.clear();
  };

/**
 * Get cache statistics
 * Useful for debugging and monitoring
 */
export const getDropdownCacheStats = () => {
  return {
    size: dropdownCache.size(),
    // Could add more stats like hit/miss ratio
  };
}; 