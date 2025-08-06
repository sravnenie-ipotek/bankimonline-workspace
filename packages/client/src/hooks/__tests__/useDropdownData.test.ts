import { renderHook, waitFor } from '@testing-library/react';
import { useDropdownData, useAllDropdowns, clearDropdownCache, getDropdownCacheStats } from '../useDropdownData';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en'
    }
  })
}));

// Mock fetch
global.fetch = jest.fn();

describe('useDropdownData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearDropdownCache();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should fetch dropdown data successfully', async () => {
      const mockResponse = {
        status: 'success',
        screen_location: 'mortgage_step1',
        language_code: 'en',
        dropdowns: [{ key: 'mortgage_step1_when_needed', label: 'When Do You Need Money' }],
        options: {
          mortgage_step1_when_needed: [
            { value: 'immediately', label: 'Immediately' },
            { value: '3_to_6_months', label: '3-6 months' }
          ]
        },
        placeholders: {
          mortgage_step1_when_needed: 'Select timeframe'
        },
        labels: {
          mortgage_step1_when_needed: 'When Do You Need Money'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { result } = renderHook(() => 
        useDropdownData('mortgage_step1', 'when_needed', 'full')
      );

      // Initial state should be loading
      expect(result.current.loading).toBe(true);
      expect(result.current.options).toEqual([]);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify data is loaded correctly
      expect(result.current.options).toHaveLength(2);
      expect(result.current.options[0]).toEqual({ value: 'immediately', label: 'Immediately' });
      expect(result.current.placeholder).toBe('Select timeframe');
      expect(result.current.label).toBe('When Do You Need Money');
      expect(result.current.error).toBeNull();
    });

    it('should return only options array when returnStructure is "options"', async () => {
      const mockResponse = {
        status: 'success',
        options: {
          mortgage_step1_type: [
            { value: 'apartment', label: 'Apartment' },
            { value: 'house', label: 'House' }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { result } = renderHook(() => 
        useDropdownData('mortgage_step1', 'type', 'options')
      );

      await waitFor(() => {
        expect(Array.isArray(result.current)).toBe(true);
      });

      expect(result.current).toHaveLength(2);
      expect(result.current[0]).toEqual({ value: 'apartment', label: 'Apartment' });
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const { result } = renderHook(() => 
        useDropdownData('invalid_screen', 'invalid_field', 'full')
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('HTTP 404: Not Found');
      expect(result.current.options).toEqual([]);
    });

    it('should handle API error status', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'error', message: 'Screen not found' })
      });

      const { result } = renderHook(() => 
        useDropdownData('invalid_screen', 'field', 'full')
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('API Error: error');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => 
        useDropdownData('mortgage_step1', 'when_needed', 'full')
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
    });
  });

  describe('Caching', () => {
    it('should cache successful responses', async () => {
      const mockResponse = {
        status: 'success',
        options: {
          mortgage_step1_type: [{ value: 'apartment', label: 'Apartment' }]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // First render - should fetch from API
      const { result: result1 } = renderHook(() => 
        useDropdownData('mortgage_step1', 'type', 'full')
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second render - should use cache
      const { result: result2 } = renderHook(() => 
        useDropdownData('mortgage_step1', 'type', 'full')
      );

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      // Fetch should not be called again
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result2.current.options).toEqual(result1.current.options);
    });

    it('should clear cache when requested', async () => {
      const mockResponse = {
        status: 'success',
        options: {
          mortgage_step1_type: [{ value: 'apartment', label: 'Apartment' }]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      // First render
      const { result: result1 } = renderHook(() => 
        useDropdownData('mortgage_step1', 'type', 'full')
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      clearDropdownCache();

      // Second render - should fetch again
      const { result: result2 } = renderHook(() => 
        useDropdownData('mortgage_step1', 'type', 'full')
      );

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Language Support', () => {
    it('should fetch data for different languages', async () => {
      // Mock Hebrew language
      jest.spyOn(require('react-i18next'), 'useTranslation').mockReturnValue({
        i18n: { language: 'he' }
      });

      const mockResponse = {
        status: 'success',
        options: {
          mortgage_step1_type: [{ value: 'apartment', label: 'דירה' }]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { result } = renderHook(() => 
        useDropdownData('mortgage_step1', 'type', 'full')
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dropdowns/mortgage_step1/he',
        expect.any(Object)
      );
      expect(result.current.options[0].label).toBe('דירה');
    });
  });

  describe('Request Abort', () => {
    it('should abort previous request when component unmounts', async () => {
      const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
      
      const { unmount } = renderHook(() => 
        useDropdownData('mortgage_step1', 'type', 'full')
      );

      // Unmount before request completes
      unmount();

      expect(abortSpy).toHaveBeenCalled();
    });
  });
});

describe('useAllDropdowns Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearDropdownCache();
  });

  it('should fetch all dropdowns for a screen', async () => {
    const mockResponse = {
      status: 'success',
      screen_location: 'mortgage_step1',
      language_code: 'en',
      dropdowns: [
        { key: 'mortgage_step1_when_needed', label: 'When Do You Need Money' },
        { key: 'mortgage_step1_type', label: 'Property Type' }
      ],
      options: {
        mortgage_step1_when_needed: [
          { value: 'immediately', label: 'Immediately' }
        ],
        mortgage_step1_type: [
          { value: 'apartment', label: 'Apartment' }
        ]
      },
      placeholders: {
        mortgage_step1_when_needed: 'Select timeframe',
        mortgage_step1_type: 'Select property type'
      },
      labels: {
        mortgage_step1_when_needed: 'When Do You Need Money',
        mortgage_step1_type: 'Property Type'
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => useAllDropdowns('mortgage_step1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();

    // Test getDropdownProps helper
    const whenNeededProps = result.current.getDropdownProps('when_needed');
    expect(whenNeededProps.options).toHaveLength(1);
    expect(whenNeededProps.placeholder).toBe('Select timeframe');
    expect(whenNeededProps.label).toBe('When Do You Need Money');
  });

  it('should handle errors in bulk fetch', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAllDropdowns('mortgage_step1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeNull();
  });

  it('should provide refresh functionality', async () => {
    const mockResponse = {
      status: 'success',
      dropdowns: []
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => useAllDropdowns('mortgage_step1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Call refresh
    result.current.refresh();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Cache Utilities', () => {
  it('should provide cache statistics', () => {
    const stats = getDropdownCacheStats();
    expect(stats).toHaveProperty('size');
    expect(stats.size).toBe(0);
  });
});