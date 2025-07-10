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
      {/* Logo - Exact Figma specification */}
      <div className={styles.logo} onClick={handleLogoClick}>
        <div className={styles.logoFrame}>
          <div className={styles.logoGroup}>
            {/* BankIM Logo SVG with exact Figma vectors and positioning */}
            <svg width="96" height="43" viewBox="0 0 96 43" fill="none">
              {/* Main logo background - Vector */}
              <rect x="0" y="0" width="96" height="27" fill="#FBE54D" />
              
              {/* Bottom decorative vectors - Yellow section (BANKIM) */}
              {/* Group 1 - Vector at left: 0.04%, right: 92.96%, top: 77.76%, bottom: 0.35% */}
              <rect x="0.04" y="33.4" width="6.6" height="9.2" fill="#FBE54D" />
              {/* Group 2 - Vector at left: 8.04%, right: 83.29%, top: 77.77%, bottom: 0.34% */}
              <rect x="7.7" y="33.4" width="8.1" height="9.2" fill="#FBE54D" />
              {/* Group 3 - Vector at left: 18.11%, right: 74.05%, top: 77.78%, bottom: 0.33% */}
              <rect x="17.4" y="33.4" width="7.6" height="9.2" fill="#FBE54D" />
              {/* Group 4 - Vector at left: 28.08%, right: 64.41%, top: 77.79%, bottom: 0.32% */}
              <rect x="27.0" y="33.4" width="7.3" height="9.2" fill="#FBE54D" />
              {/* Group 5 - Vector at left: 36.95%, right: 61.58%, top: 77.8%, bottom: 0.32% */}
              <rect x="35.5" y="33.4" width="1.5" height="9.2" fill="#FBE54D" />
              {/* Group 6 - Vector at left: 40.54%, right: 49.6%, top: 77.81%, bottom: 0.31% */}
              <rect x="38.9" y="33.4" width="9.5" height="9.2" fill="#FBE54D" />
              
              {/* Bottom decorative vectors - White section (ONLINE) */}
              {/* Group 7 - Vector at left: 52.22%, right: 39.04%, top: 77.52%, bottom: 0% */}
              <rect x="50.1" y="33.4" width="8.4" height="9.2" fill="#FFFFFF" />
              {/* Group 8 - Vector at left: 62.78%, right: 29.38%, top: 77.83%, bottom: 0.28% */}
              <rect x="60.3" y="33.4" width="7.7" height="9.2" fill="#FFFFFF" />
              {/* Group 9 - Vector at left: 72.74%, right: 21.39%, top: 77.84%, bottom: 0.27% */}
              <rect x="69.9" y="33.4" width="5.8" height="9.2" fill="#FFFFFF" />
              {/* Group 10 - Vector at left: 80.27%, right: 18.26%, top: 77.85%, bottom: 0.27% */}
              <rect x="77.1" y="33.4" width="1.5" height="9.2" fill="#FFFFFF" />
              {/* Group 11 - Vector at left: 83.87%, right: 8.29%, top: 77.85%, bottom: 0.26% */}
              <rect x="80.5" y="33.4" width="7.5" height="9.2" fill="#FFFFFF" />
              {/* Group 12 - Vector at left: 93.84%, right: 0.02%, top: 77.86%, bottom: 0.25% */}
              <rect x="90.0" y="33.4" width="5.8" height="9.2" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      </div>

      {/* Language Selector - Frame 949 */}
      <div className={styles.languageSelector}>
        {/* Language selector button */}
        <button
          className={styles.languageSelectorButton}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          type="button"
        >
          {/* Русский text */}
          <span className={styles.languageText}>
            {currentLanguage.name}
          </span>
          {/* angle-down icon */}
          <div className={styles.angleDown}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M5 8L12 15L19 8" 
                stroke="#F3F4F6" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className={styles.dropdownMenu}>
            <div className={styles.dropdownMenuContainer}>
              {/* Russian Nav Link */}
              <button 
                className={styles.navLink}
                onClick={() => handleLanguageChange('ru')}
                type="button"
              >
                {/* Russia flag with exact Figma vectors */}
                <div className={styles.flagIcon}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect width="18" height="18" fill="#F0F0F0"/>
                    <rect y="5.87" width="18" height="7.09" fill="#0052B4"/>
                    <rect x="0.56" y="12.13" width="16.88" height="5.87" fill="#D80027"/>
                  </svg>
                </div>
                {/* Text */}
                <span className={styles.languageOptionText}>Русский</span>
              </button>

              {/* Hebrew Nav Link */}
              <button 
                className={styles.navLink}
                onClick={() => handleLanguageChange('he')}
                type="button"
              >
                {/* Israel flag with exact Figma vectors */}
                <div className={styles.flagIcon}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect width="18" height="18" fill="#F0F0F0"/>
                    <rect x="1.32" y="1.96" width="15.36" height="2.35" fill="#0052B4"/>
                    <rect x="1.32" y="13.69" width="15.36" height="2.35" fill="#0052B4"/>
                    {/* Star of David simplified */}
                    <polygon points="9,5.09 10.85,7.83 6.15,7.83" fill="#0052B4"/>
                    <polygon points="9,12.91 7.15,10.17 11.85,10.17" fill="#0052B4"/>
                  </svg>
                </div>
                {/* Text */}
                <span className={styles.languageOptionText}>עברית</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};