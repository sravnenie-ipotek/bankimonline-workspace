import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import styles from './topHeader.module.scss'

const cx = classNames.bind(styles)

// Notification Icon
const NotificationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
  </svg>
)

// User Avatar Icon
const UserAvatarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
    <circle cx="16" cy="16" r="16" fill="#C7C7C7"/>
    <path d="M16 4a6 6 0 100 12 6 6 0 000-12zM8 24a8 8 0 1116 0v1H8v-1z" fill="#242529"/>
  </svg>
)

// Chevron Down Icon
const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" transform="rotate(90)">
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
  </svg>
)

export const TopHeader: React.FC = () => {
  const { t } = useTranslation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Mock user data - in real app would come from auth context
  const userData = {
    name: 'Александр Пушкин',
    email: 'bankimonline@mail.com',
    avatar: null
  }

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const handleNotificationClick = () => {
    // Handle notification click
    console.log('Notifications clicked')
  }

  return (
    <div className={cx('top-header')}>
      <div className={cx('header-content')}>
        {/* Left side - could add breadcrumbs or search here */}
        <div className={cx('header-left')}>
          {/* Empty for now, matches Figma design */}
        </div>

        {/* Right side - Notifications and Profile */}
        <div className={cx('header-right')}>
          {/* Notifications */}
          <div className={cx('notification-container')}>
            <button 
              className={cx('notification-button')}
              onClick={handleNotificationClick}
            >
              <div className={cx('notification-icon')}>
                <NotificationIcon />
              </div>
              <div className={cx('notification-badge')}>
                2
              </div>
            </button>
          </div>

          {/* User Profile */}
          <div className={cx('profile-container')}>
            <button 
              className={cx('profile-button')}
              onClick={handleProfileClick}
            >
              <div className={cx('profile-avatar')}>
                <UserAvatarIcon />
              </div>
              <div className={cx('profile-info')}>
                <span className={cx('profile-name')}>
                  {userData.name}
                </span>
              </div>
              <div className={cx('profile-chevron')}>
                <ChevronDownIcon />
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className={cx('profile-menu')}>
                <div className={cx('profile-menu-item')}>
                  <span>{t('profile_settings', 'Настройки профиля')}</span>
                </div>
                <div className={cx('profile-menu-item')}>
                  <span>{t('account_settings', 'Настройки аккаунта')}</span>
                </div>
                <div className={cx('profile-menu-divider')} />
                <div className={cx('profile-menu-item')}>
                  <span>{t('logout', 'Выйти')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 