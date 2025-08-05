import React, { useState, useRef, useCallback, useEffect } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

// Import existing components we can reuse
import { ChangeLanguage } from '@src/components/ui/ChangeLanguage'

// Import icons
import { RussiaFlagIcon } from '@assets/icons/RussiaFlagIcon'
import { IsraelFlagIcon } from '@assets/icons/IsraelFlagIcon'
import { CaretDownIcon } from '@assets/icons/CaretDownIcon'
import { CaretUpIcon } from '@assets/icons/CaretUpIcon'
import { CheckIcon } from '@assets/icons/CheckIcon'

// Import types
import { SharedNavigationProps, DropdownMenuProps, IconButtonProps, NotificationItem } from './types'

import styles from './SharedNavigation.module.scss'

const cx = classNames.bind(styles)

/**
 * Dropdown Menu Component
 * Reusable dropdown component for various navigation dropdowns
 */
const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '', 
  position = 'right' 
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  if (!isOpen) return null

  return (
    <div 
      ref={dropdownRef}
      className={cx('dropdown', `dropdown--${position}`, className)}
    >
      {children}
    </div>
  )
}

/**
 * Icon Button Component
 * Reusable button component with optional badge
 */
const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  onClick, 
  badge, 
  className = '', 
  title 
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cx('icon-button', className)}
    title={title}
  >
    {icon}
    {badge && badge > 0 && (
      <span className={cx('badge')}>
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
)

/**
 * Language Selector Component
 * Custom language selector for Russian and Hebrew (Actions #1, #6, #7)
 */
const LanguageSelector: React.FC<{ onLanguageChange?: (language: string) => void }> = ({ 
  onLanguageChange 
}) => {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    {
      code: 'ru',
      name: t('language_russian'),
      country: t('country_russia'),
      flag: <RussiaFlagIcon />
    },
    {
      code: 'he', 
      name: t('language_hebrew'),
      country: t('country_israel'),
      flag: <IsraelFlagIcon />
    }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode)
      onLanguageChange?.(languageCode)
      setIsOpen(false)
      
      // Update document direction
      document.documentElement.dir = languageCode === 'he' ? 'rtl' : 'ltr'
      document.documentElement.lang = languageCode
      
      // Save to localStorage
      localStorage.setItem('admin_language', languageCode)
      localStorage.setItem('language', languageCode)
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  return (
    <div className={cx('language-selector')}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cx('language-button')}
      >
        <span className={cx('language-text')}>{currentLanguage.country}</span>
        {isOpen ? <CaretUpIcon /> : <CaretDownIcon />}
      </button>

      <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)} className={cx('language-dropdown')}>
        <div className={cx('dropdown-header')}>
          <span>{t('sel_cntr')}</span>
        </div>
        <div className={cx('dropdown-separator')} />
        {languages.map((language) => (
          <button
            key={language.code}
            type="button"
            onClick={() => handleLanguageChange(language.code)}
            className={cx('dropdown-item')}
          >
            <div className={cx('language-option')}>
              <span className={cx('flag')}>{language.flag}</span>
              <div className={cx('language-info')}>
                <span className={cx('country')}>{language.country}</span>
                <span className={cx('name')}>{language.name}</span>
              </div>
            </div>
            {currentLanguage.code === language.code && <CheckIcon />}
          </button>
        ))}
      </DropdownMenu>
    </div>
  )
}

/**
 * Tech Support Icon Component (Action #2)
 */
const TechSupportButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { t } = useTranslation()
  
  return (
    <IconButton
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      }
      onClick={onClick}
      title={t('tech_support')}
      className={cx('tech-support')}
    />
  )
}

/**
 * Notifications Component (Actions #3, #10, #12, #13, #14)
 */
const NotificationsButton: React.FC<{ 
  notifications: NotificationItem[]
  unreadCount: number
  onNotificationClick?: (notification: NotificationItem) => void
  onViewAll?: () => void
}> = ({ 
  notifications, 
  unreadCount, 
  onNotificationClick, 
  onViewAll 
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleNotificationClick = (notification: NotificationItem) => {
    onNotificationClick?.(notification)
    setIsOpen(false)
  }

  return (
    <div className={cx('notifications')}>
      <IconButton
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        }
        onClick={() => setIsOpen(!isOpen)}
        badge={unreadCount}
        title={t('notifications')}
        className={cx('notifications-button')}
      />

      <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)} className={cx('notifications-dropdown')}>
        <div className={cx('dropdown-header')}>
          <span>{t('notifications')}</span>
        </div>
        
        <div className={cx('notifications-list')}>
          {notifications.length === 0 ? (
            <div className={cx('no-notifications')}>
              {t('no_notifications')}
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cx('notification-item', {
                  'notification-item--unread': !notification.isRead
                })}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={cx('notification-avatar')}>
                  {notification.sender?.avatar ? (
                    <img src={notification.sender.avatar} alt={notification.sender.name} />
                  ) : (
                    <span className={cx('avatar-initials')}>
                      {notification.sender?.initials || 'SY'}
                    </span>
                  )}
                </div>
                
                <div className={cx('notification-content')}>
                  <div className={cx('notification-text')}>
                    <p className={cx('notification-title')}>
                      {notification.title}
                    </p>
                    <p className={cx('notification-description')}>
                      {notification.description}
                    </p>
                    <div className={cx('notification-time')}>
                      <span>{notification.timestamp}</span>
                      <span>{notification.date}</span>
                    </div>
                  </div>
                  
                  {notification.actionText && (
                    <button
                      type="button"
                      className={cx('notification-action')}
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle action click
                      }}
                    >
                      {notification.actionText}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <div className={cx('dropdown-separator')} />
            <button
              type="button"
              className={cx('view-all-button')}
              onClick={() => {
                onViewAll?.()
                setIsOpen(false)
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              {t('view_all')}
            </button>
          </>
        )}
      </DropdownMenu>
    </div>
  )
}

/**
 * Bank Logo Component (Action #4)
 */
const BankLogo: React.FC<{ bank: { name: string; logo: string } }> = ({ bank }) => (
  <div className={cx('bank-logo')}>
    <img src={bank.logo} alt={bank.name} className={cx('bank-logo-image')} />
    <span className={cx('bank-name')}>{bank.name}</span>
  </div>
)

/**
 * User Profile Component (Actions #5, #8, #9, #11)
 */
const UserProfile: React.FC<{ 
  user: { name: string; email: string; avatar?: string }
  onSettingsClick?: () => void
  onNotificationsClick?: () => void
  onLogoutClick?: () => void
}> = ({ 
  user, 
  onSettingsClick, 
  onNotificationsClick, 
  onLogoutClick 
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cx('user-profile')}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cx('profile-button')}
      >
        <div className={cx('avatar')}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span className={cx('avatar-initials')}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          )}
        </div>
        <div className={cx('profile-info')}>
          <span className={cx('profile-name')}>{user.name}</span>
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </button>

      <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)} className={cx('profile-dropdown')}>
        <div className={cx('profile-header')}>
          <div className={cx('profile-name')}>{user.name}</div>
          <div className={cx('profile-email')}>{user.email}</div>
        </div>
        
        <div className={cx('dropdown-separator')} />
        
        <button
          type="button"
          className={cx('dropdown-item')}
          onClick={() => {
            onSettingsClick?.()
            setIsOpen(false)
          }}
        >
          {t('settings')}
        </button>
        
        <button
          type="button"
          className={cx('dropdown-item')}
          onClick={() => {
            onNotificationsClick?.()
            setIsOpen(false)
          }}
        >
          {t('notifications')}
        </button>
        
        <button
          type="button"
          className={cx('dropdown-item')}
          onClick={() => {
            onLogoutClick?.()
            setIsOpen(false)
          }}
        >
          {t('logout')}
        </button>
      </DropdownMenu>
    </div>
  )
}

/**
 * Main SharedNavigation Component
 * Implements all 14 actions from Confluence documentation
 */
const SharedNavigation: React.FC<SharedNavigationProps> = ({
  user,
  bank,
  notifications,
  unreadNotificationsCount,
  onLanguageChange,
  onTechSupportClick,
  onNotificationClick,
  onProfileSettingsClick,
  onProfileNotificationsClick,
  onLogoutClick,
  onNotificationViewAll,
  className = ''
}) => {
  return (
    <nav className={cx('shared-navigation', className)}>
      <div className={cx('navigation-container')}>
        {/* Left side - Language Selector (Actions #1, #6, #7) */}
        <div className={cx('navigation-left')}>
          <LanguageSelector onLanguageChange={onLanguageChange} />
        </div>

        {/* Right side - Main Navigation Items */}
        <div className={cx('navigation-right')}>
          {/* Tech Support (Action #2) */}
          <TechSupportButton onClick={onTechSupportClick} />

          {/* Notifications (Actions #3, #10, #12, #13, #14) */}
          <NotificationsButton
            notifications={notifications}
            unreadCount={unreadNotificationsCount}
            onNotificationClick={onNotificationClick}
            onViewAll={onNotificationViewAll}
          />

          {/* Bank Logo (Action #4) */}
          <BankLogo bank={bank} />

          {/* User Profile (Actions #5, #8, #9, #11) */}
          <UserProfile
            user={user}
            onSettingsClick={onProfileSettingsClick}
            onNotificationsClick={onProfileNotificationsClick}
            onLogoutClick={onLogoutClick}
          />
        </div>
      </div>
    </nav>
  )
}

export default SharedNavigation 