/**
 * SharedHeader Component
 * Reusable header component based on the main app header structure
 * Used in pages that need header without full Layout component
 * 
 * Features:
 * - Logo with optional navigation confirmation
 * - Language selector using existing ChangeLanguage component
 * - Responsive design matching main app header
 * - Follows codeClientSideDev.md guidelines
 */

import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Container } from '@components/ui/Container';
import { ChangeLanguage } from '@components/ui/ChangeLanguage';

import styles from './SharedHeader.module.scss';

const cx = classNames.bind(styles);

interface SharedHeaderProps {
  /** Show confirmation dialog when clicking logo */
  confirmNavigation?: boolean;
  /** Custom confirmation message */
  confirmationMessage?: string;
  /** Custom navigation path (default: '/') */
  navigateTo?: string;
  /** Hide language selector */
  hideLanguageSelector?: boolean;
  /** Custom logo click handler */
  onLogoClick?: () => void;
}

/**
 * SharedHeader component provides a reusable header with logo and language selector
 * Designed to be used in pages that need header functionality without full Layout
 */
const SharedHeader: React.FC<SharedHeaderProps> = ({
  confirmNavigation = false,
  confirmationMessage,
  navigateTo = '/',
  hideLanguageSelector = false,
  onLogoClick
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * Handle logo click with optional confirmation
   * If confirmNavigation is true, shows confirmation dialog
   * If custom onLogoClick is provided, uses that instead
   */
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
      return;
    }

    if (confirmNavigation) {
      const message = confirmationMessage || t('confirm_leave_registration', 'Are you sure you want to leave the registration process? Your progress will be lost.');
      
      if (window.confirm(message)) {
        navigate(navigateTo);
      }
    } else {
      navigate(navigateTo);
    }
  };

  return (
    <div className={cx('header-wrapper')}>
      <Container
        style={{
          display: 'flex',
          height: '94px',
          alignItems: 'center',
          maxWidth: 'auto',
        }}
      >
        <div className={cx('header-content')}>
          {/* Logo Section */}
          <div className={cx('logo-section')}>
            <button
              type="button"
              className={cx('logo-button')}
              onClick={handleLogoClick}
              aria-label={t('go_to_home', 'Go to home page')}
            >
              <img 
                alt="BankIM Online" 
                src="/static/primary-logo05-1.svg" 
                className={cx('logo-image')}
              />
            </button>
          </div>

          {/* Right Section - Language Selector */}
          {!hideLanguageSelector && (
            <div className={cx('right-section')}>
              <ChangeLanguage />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SharedHeader; 