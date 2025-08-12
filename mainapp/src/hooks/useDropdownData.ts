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
        console.log(`✅ Cache hit for ${cacheKey}`);
        apiData = cachedData;
      } else {
        console.log(`🌐 Fetching dropdown data from API: /api/dropdowns/${screenLocation}/${language}`);
        
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
        console.log(`💾 Cached dropdown data for ${cacheKey}`);
      }

      // Extract data for specific field
      let dropdownKey = `${screenLocation}_${fieldName}`;
      let placeholderKey = `${dropdownKey}_ph`;
      let labelKey = `${dropdownKey}_label`;

      // Primary read
      let options = apiData.options?.[dropdownKey] || [];
      let placeholder = apiData.placeholders?.[placeholderKey] || apiData.placeholders?.[dropdownKey];
      let label = apiData.labels?.[labelKey] || apiData.labels?.[dropdownKey];

      // Backward-compat fallback for historical key names
      // Example: 'field_of_activity' ⇄ 'activity'
      if (options.length === 0) {
        const legacyFieldName = fieldName === 'field_of_activity' ? 'activity' : fieldName === 'activity' ? 'field_of_activity' : null;
        if (legacyFieldName) {
          const legacyKey = `${screenLocation}_${legacyFieldName}`;
          const legacyPlaceholderKey = `${legacyKey}_ph`;
          const legacyLabelKey = `${legacyKey}_label`;
          const legacyOptions = apiData.options?.[legacyKey] || [];
          if (legacyOptions.length > 0) {
            dropdownKey = legacyKey;
            placeholderKey = legacyPlaceholderKey;
            labelKey = legacyLabelKey;
            options = legacyOptions;
            placeholder = apiData.placeholders?.[legacyPlaceholderKey] || apiData.placeholders?.[legacyKey];
            label = apiData.labels?.[legacyLabelKey] || apiData.labels?.[legacyKey];
          }
        }
      }

      const result: DropdownData = {
        options,
        placeholder,
        label,
        loading: false,
        error: null
      };

      console.log(`🔍 Dropdown data for ${dropdownKey}:`, {
        optionsCount: result.options.length,
        hasPlaceholder: !!result.placeholder,
        hasLabel: !!result.label,
        cacheHit: !!cachedData
      });

      setDropdownData(result);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
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
        console.log(`✅ Bulk cache hit for ${cacheKey}`);
        setData(cachedData);
        return;
      }

      console.log(`🌐 Bulk fetching dropdowns from API: /api/dropdowns/${screenLocation}/${language}`);
      
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

      console.log(`✅ Bulk dropdown data loaded for ${screenLocation}:`, {
        dropdowns: apiData.dropdowns?.length || 0,
        optionGroups: Object.keys(apiData.options || {}).length,
        cacheInfo: apiData.cache_info
      });
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Bulk request aborted');
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
    return {
      options: data.options?.[dropdownKey] || [],
      placeholder: data.placeholders?.[dropdownKey],
      label: data.labels?.[dropdownKey]
    };
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
  console.log('🗑️ Dropdown cache cleared');
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