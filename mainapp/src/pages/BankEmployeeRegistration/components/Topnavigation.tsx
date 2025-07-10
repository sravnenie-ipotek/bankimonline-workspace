/**
 * Topnavigation Component for Bank Employee Registration
 * Implements the navigation bar with logo and language selector
 * Following Figma design specifications from Confluence
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Topnavigation.module.scss';

export const Topnavigation: React.FC = () => {
  const { i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const languages = [
    { code: 'ru', name: 'Русский' },
    { code: 'he', name: 'עברית' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsDropdownOpen(false);
  };

  const handleLogoClick = () => {
    const userConfirmed = window.confirm(
      'Are you sure you want to leave the registration process? Your progress will be lost.'
    );
    
    if (userConfirmed) {
      window.location.href = '/';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(`.${styles.languageSelector}`)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo} onClick={handleLogoClick}>
        <div className={styles.logoFrame}>
          <div className={styles.logoGroup}>
            {/* BankIM Logo SVG with exact Figma vectors */}
            <svg width="96" height="43" viewBox="0 0 96 43" fill="none">
              {/* Yellow letters B-A-N-K-I-M */}
              <rect x="0.04" y="33.4" width="6.6" height="9.2" fill="#FBE54D" />
              <rect x="7.7" y="33.4" width="8.1" height="9.2" fill="#FBE54D" />
              <rect x="17.4" y="33.4" width="7.6" height="9.2" fill="#FBE54D" />
              <rect x="27.0" y="33.4" width="7.3" height="9.2" fill="#FBE54D" />
              <rect x="35.5" y="33.4" width="1.5" height="9.2" fill="#FBE54D" />
              <rect x="38.9" y="33.4" width="9.5" height="9.2" fill="#FBE54D" />
              
              {/* White letters */}
              <rect x="50.1" y="33.4" width="8.4" height="9.2" fill="#FFFFFF" />
              <rect x="60.3" y="33.4" width="7.7" height="9.2" fill="#FFFFFF" />
              <rect x="69.9" y="33.4" width="5.8" height="9.2" fill="#FFFFFF" />
              <rect x="77.1" y="33.4" width="1.5" height="9.2" fill="#FFFFFF" />
              <rect x="80.5" y="33.4" width="7.5" height="9.2" fill="#FFFFFF" />
              <rect x="90.0" y="33.4" width="5.8" height="9.2" fill="#FFFFFF" />
              
              {/* Main logo area */}
              <rect x="0" y="0" width="96" height="27" fill="#FBE54D" />
            </svg>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className={styles.languageSelector}>
        <div className={styles.languageSelectorButton} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <span className={styles.languageText}>{currentLanguage.name}</span>
          <div className={styles.angleDown}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 9L12 16L19 9" stroke="#F3F4F6" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className={styles.dropdownMenu}>
            <div className={styles.dropdownMenuContent}>
              {/* Russian Option */}
              <div className={styles.navLink} onClick={() => handleLanguageChange('ru')}>
                <div className={styles.flagIcon}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect width="18" height="18" fill="#F0F0F0" />
                    <rect y="5.87" width="18" height="7.09" fill="#0052B4" />
                    <rect x="0.56" y="12.13" width="16.88" height="5.87" fill="#D80027" />
                  </svg>
                </div>
                <span className={styles.languageOptionText}>Русский</span>
              </div>

              {/* Hebrew Option */}
              <div className={styles.navLink} onClick={() => handleLanguageChange('he')}>
                <div className={styles.flagIcon}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect width="18" height="18" fill="#F0F0F0" />
                    <rect x="1.32" y="1.96" width="15.36" height="2.35" fill="#0052B4" />
                    <rect x="5.61" y="5.09" width="6.78" height="7.83" fill="#0052B4" />
                    <rect x="1.32" y="13.69" width="15.36" height="2.35" fill="#0052B4" />
                  </svg>
                </div>
                <span className={styles.languageOptionText}>עברית</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};