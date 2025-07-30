import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownResponse {
  status: string;
  screen_location: string;
  language_code: string;
  content_count: number;
  content: Record<string, {
    value: string;
    component_type: string;
    category: string;
    language: string;
    status: string;
  }>;
}

/**
 * Custom hook for fetching dropdown options from the database
 * Dynamically loads all options for a specific dropdown in a screen
 */
export const useDropdownData = (screenLocation: string, dropdownKey: string) => {
  const { i18n, t } = useTranslation();
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const language = i18n.language || 'en';
        const apiUrl = `/api/content/${screenLocation}/${language}`;
        
        console.log('🔍 DEBUG: Fetching dropdown options from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: DropdownResponse = await response.json();
        
        console.log('🔍 DEBUG: Dropdown API Response:', {
          status: data.status,
          contentCount: data.content_count,
          dropdownKey,
          availableKeys: Object.keys(data.content || {}).filter(key => key.includes(dropdownKey))
        });
        
        if (data.status === 'success' && data.content) {
          // Filter options that belong to this dropdown
          const dropdownOptions: DropdownOption[] = [];
          
          Object.entries(data.content).forEach(([key, item]) => {
            // Check if this is an option for our dropdown
            if (key.startsWith(dropdownKey) && item.component_type === 'option') {
              // Extract the option value from the key (e.g., 'hapoalim' from 'bank_hapoalim')
              const optionValue = key.replace(`${dropdownKey}_`, '');
              dropdownOptions.push({
                value: optionValue,
                label: item.value
              });
            }
          });
          
          console.log('🔍 DEBUG: Found dropdown options:', dropdownOptions);
          setOptions(dropdownOptions);
        } else {
          throw new Error('Invalid API response format');
        }
        
      } catch (err) {
        console.warn(`Dropdown API error for ${screenLocation}/${dropdownKey}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback: return empty array
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownOptions();
  }, [screenLocation, dropdownKey, i18n.language]);

  return {
    options,
    loading,
    error
  };
}; 