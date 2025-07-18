import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ContentItem {
  value: string;
  component_type: string;
  category: string;
  language: string;
  status: string;
}

interface ContentResponse {
  status: string;
  screen_location: string;
  language_code: string;
  content_count: number;
  content: Record<string, ContentItem>;
}

/**
 * Custom hook for fetching content from the content management API
 * with fallback to existing translation system
 */
export const useContentApi = (screenLocation: string) => {
  const { i18n, t } = useTranslation();
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const language = i18n.language || 'en';
        // Use relative URL to work with proxy in development
        const apiUrl = `/api/content/${screenLocation}/${language}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ContentResponse = await response.json();
        
        if (data.status === 'success' && data.content) {
          // Transform API response to key-value pairs
          const transformedContent: Record<string, string> = {};
          
          Object.entries(data.content).forEach(([key, item]) => {
            // Extract the final part of the content key (e.g., 'calculate_mortgage' from 'app.home.service.calculate_mortgage')
            const shortKey = key.split('.').pop() || key;
            transformedContent[shortKey] = item.value;
            
            // Also store with full key for more specific lookups
            transformedContent[key] = item.value;
          });
          
          setContent(transformedContent);
        } else {
          throw new Error('Invalid API response format');
        }
        
      } catch (err) {
        console.warn(`Content API error for ${screenLocation}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback: use empty content, let translation system handle it
        setContent({});
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [screenLocation, i18n.language]);

  /**
   * Get content with fallback to translation system
   */
  const getContent = (key: string, fallbackKey?: string): string => {
    // Try to get from API content first (exact match)
    if (content[key]) {
      return content[key];
    }
    
    // Try with specific prefixes based on the key
    const prefixMap: Record<string, string[]> = {
      'calculate_mortgage': ['app.home.service.calculate_mortgage'],
      'refinance_mortgage': ['app.home.service.refinance_mortgage'],
      'calculate_credit': ['app.home.service.calculate_credit'],
      'refinance_credit': ['app.home.service.refinance_credit'],
      'title_compare': ['app.home.header.title_compare', 'app.home.header.TITLE_COMPARE'],
      'TITLE_COMPARE': ['app.home.header.TITLE_COMPARE', 'app.home.header.title_compare'],
      'compare_in_5minutes': ['app.home.text.compare_in_5minutes', 'app.home.text.compare_in_5mins'],
      'show_offers': ['app.home.button.show_offers'],
      'fill_form': ['app.home.button.fill_form'],
      'how_it_works': ['app.home.text.how_it_works'],
      'mortgage_calculator': ['app.home.text.mortgage_calculator'],
      'fill_form_text': ['app.home.text.fill_form_description'],
      'mortgage_calculator_text': ['app.home.text.calculator_description'],
      'calculator_description': ['app.home.text.calculator_description'],
      'fill_form_description': ['app.home.text.fill_form_description']
    };
    
    // Try specific mappings first
    const mappedKeys = prefixMap[key] || [];
    for (const mappedKey of mappedKeys) {
      if (content[mappedKey]) {
        return content[mappedKey];
      }
    }
    
    // Try with general prefixes
    const alternativeKeys = [
      `app.home.service.${key}`,
      `app.home.button.${key}`,
      `app.home.header.${key}`,
      `app.home.text.${key}`,
      `app.home.navigation.${key}`
    ];
    
    for (const altKey of alternativeKeys) {
      if (content[altKey]) {
        return content[altKey];
      }
    }
    
    // Debug logging
    console.log(`Content lookup for key: ${key}, available keys:`, Object.keys(content));
    
    // Fallback to translation system
    const translationKey = fallbackKey || key;
    const translatedValue = t(translationKey);
    
    // If translation returns the key itself, it means translation not found
    if (translatedValue === translationKey) {
      console.warn(`No content found for key: ${key}, fallback: ${fallbackKey}`);
      return key; // Return the key as last resort
    }
    
    return translatedValue;
  };

  return {
    content,
    loading,
    error,
    getContent
  };
};

export default useContentApi;