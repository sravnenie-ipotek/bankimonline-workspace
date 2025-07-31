import { getValidationError, getValidationErrorSync, preloadValidationErrors, reloadValidationErrors } from '../validationHelpers';

// Mock fetch
global.fetch = jest.fn();

// Mock window.i18next
const mockI18next = {
  language: 'en',
  t: jest.fn()
};

Object.defineProperty(window, 'i18next', {
  value: mockI18next,
  writable: true
});

describe('validationHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear validation cache by reloading
    jest.resetModules();
  });

  describe('getValidationError', () => {
    it('should fetch validation error from database', async () => {
      const mockResponse = {
        content: {
          'error_required': {
            value: 'This field is required'
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getValidationError('error_required');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/content/validation_errors/en');
      expect(result).toBe('This field is required');
    });

    it('should use cached value on second call', async () => {
      const mockResponse = {
        content: {
          'error_required': {
            value: 'This field is required'
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // First call - should fetch
      await getValidationError('error_required');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result = await getValidationError('error_required');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe('This field is required');
    });

    it('should fallback to i18next when database fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      mockI18next.t.mockReturnValue('Required field');

      const result = await getValidationError('error_required');
      
      expect(mockI18next.t).toHaveBeenCalledWith('error_required');
      expect(result).toBe('Required field');
    });

    it('should use fallback when neither database nor i18next has translation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: {} })
      });
      mockI18next.t.mockReturnValue('error_required'); // Returns key when not found

      const result = await getValidationError('error_required', 'Default error message');
      
      expect(result).toBe('Default error message');
    });

    it('should return key when no fallback provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: {} })
      });
      mockI18next.t.mockReturnValue('error_unknown');

      const result = await getValidationError('error_unknown');
      
      expect(result).toBe('error_unknown');
    });

    it('should handle different languages', async () => {
      mockI18next.language = 'he';
      
      const mockResponse = {
        content: {
          'error_required': {
            value: 'שדה חובה'
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getValidationError('error_required');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/content/validation_errors/he');
      expect(result).toBe('שדה חובה');
    });
  });

  describe('getValidationErrorSync', () => {
    it('should return cached value synchronously', async () => {
      // Pre-populate cache
      const mockResponse = {
        content: {
          'error_required': {
            value: 'This field is required'
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Load cache first
      await preloadValidationErrors();

      // Now test sync method
      const result = getValidationErrorSync('error_required');
      expect(result).toBe('This field is required');
    });

    it('should fallback to i18next when cache miss', () => {
      mockI18next.t.mockReturnValue('Required field');

      const result = getValidationErrorSync('error_required');
      
      expect(mockI18next.t).toHaveBeenCalledWith('error_required');
      expect(result).toBe('Required field');
    });

    it('should use fallback when nothing available', () => {
      mockI18next.t.mockReturnValue('error_unknown');

      const result = getValidationErrorSync('error_unknown', 'Default message');
      
      expect(result).toBe('Default message');
    });
  });

  describe('preloadValidationErrors', () => {
    it('should preload validation errors from database', async () => {
      const mockResponse = {
        content: {
          'error_required': { value: 'This field is required' },
          'error_min_length': { value: 'Minimum length is {min}' },
          'error_invalid_email': { value: 'Invalid email address' }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await preloadValidationErrors();

      expect(global.fetch).toHaveBeenCalledWith('/api/content/validation_errors/en');
      
      // Verify cache is populated
      const result = getValidationErrorSync('error_required');
      expect(result).toBe('This field is required');
    });

    it('should handle preload failure gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(preloadValidationErrors()).resolves.toBeUndefined();
    });

    it('should preload for current language', async () => {
      mockI18next.language = 'ru';

      const mockResponse = {
        content: {
          'error_required': { value: 'Обязательное поле' }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await preloadValidationErrors();

      expect(global.fetch).toHaveBeenCalledWith('/api/content/validation_errors/ru');
    });
  });

  describe('reloadValidationErrors', () => {
    it('should clear cache and reload', async () => {
      // First load
      const mockResponse1 = {
        content: {
          'error_required': { value: 'Old message' }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse1
      });

      await preloadValidationErrors();
      expect(getValidationErrorSync('error_required')).toBe('Old message');

      // Now reload with new data
      const mockResponse2 = {
        content: {
          'error_required': { value: 'New message' }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse2
      });

      await reloadValidationErrors();
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(getValidationErrorSync('error_required')).toBe('New message');
    });
  });

  describe('Language Detection', () => {
    it('should detect language from i18next', async () => {
      mockI18next.language = 'fr';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: {} })
      });

      await getValidationError('error_test');

      expect(global.fetch).toHaveBeenCalledWith('/api/content/validation_errors/fr');
    });

    it('should fallback to document language', async () => {
      // Remove i18next temporarily
      delete (window as any).i18next;
      
      // Set document language
      Object.defineProperty(document.documentElement, 'lang', {
        value: 'es',
        configurable: true
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: {} })
      });

      await getValidationError('error_test');

      expect(global.fetch).toHaveBeenCalledWith('/api/content/validation_errors/es');

      // Restore i18next
      (window as any).i18next = mockI18next;
    });

    it('should default to English when no language detected', async () => {
      // Remove i18next
      delete (window as any).i18next;
      
      // Remove document language
      Object.defineProperty(document.documentElement, 'lang', {
        value: '',
        configurable: true
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: {} })
      });

      await getValidationError('error_test');

      expect(global.fetch).toHaveBeenCalledWith('/api/content/validation_errors/en');

      // Restore
      (window as any).i18next = mockI18next;
    });
  });
});