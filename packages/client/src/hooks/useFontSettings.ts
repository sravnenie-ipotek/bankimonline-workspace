import { useState, useEffect } from 'react';

interface FontSettings {
  menuFontFamily: string;
  menuMainFontWeight: string;
  menuSubFontWeight: string;
  menuMainFontSize: string;
  menuSubFontSize: string;
  menuLineHeight: string;
}

const defaultFontSettings: FontSettings = {
  menuFontFamily: 'Arimo',
  menuMainFontWeight: '500',
  menuSubFontWeight: '600',
  menuMainFontSize: '16px',
  menuSubFontSize: '14px',
  menuLineHeight: '1.5',
};

export const useFontSettings = () => {
  const [fontSettings, setFontSettings] = useState<FontSettings>(defaultFontSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFontSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use default settings
      // TODO: Integrate with backend API when font settings API is available
      setFontSettings(defaultFontSettings);
      setLoading(false);
    } catch (err) {
      // Use default settings if API is unavailable
      setFontSettings(defaultFontSettings);
      console.warn('API unavailable, using default font settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load font settings');
    } finally {
      setLoading(false);
    }
  };

  const updateFontSetting = async (key: string, value: string) => {
    try {
      // TODO: Implement API call to update font settings
      console.log('Update font setting:', key, value);
      
      // For now, update locally
      setFontSettings(prev => {
        const newSettings = { ...prev };
        switch (key) {
          case 'menu_font_family':
            newSettings.menuFontFamily = value;
            break;
          case 'menu_main_font_weight':
            newSettings.menuMainFontWeight = value;
            break;
          case 'menu_sub_font_weight':
            newSettings.menuSubFontWeight = value;
            break;
          case 'menu_main_font_size':
            newSettings.menuMainFontSize = value;
            break;
          case 'menu_sub_font_size':
            newSettings.menuSubFontSize = value;
            break;
          case 'menu_line_height':
            newSettings.menuLineHeight = value;
            break;
        }
        return newSettings;
      });
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update font setting');
      return false;
    }
  };

  useEffect(() => {
    loadFontSettings();
  }, []);

  return {
    fontSettings,
    loading,
    error,
    loadFontSettings,
    updateFontSetting,
  };
};