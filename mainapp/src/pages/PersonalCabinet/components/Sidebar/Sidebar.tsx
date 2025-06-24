import React from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import styles from './sidebar.module.scss'

const cx = classNames.bind(styles)

// SVG Icons as components (simplified for now - would use actual SVG assets)
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 14v-2h4v2H8zM10 1L1 8v11h6v-6h6v6h6V8L10 1z"/>
  </svg>
)

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM4 14a6 6 0 1112 0v1H4v-1z"/>
  </svg>
)

const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4z"/>
  </svg>
)

const ServicesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z"/>
  </svg>
)

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M18 6V4a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h4l4 4V6z"/>
  </svg>
)

const PaymentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v2H4V6zm0 4h12v4H4v-4z"/>
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z"/>
  </svg>
)

const SignOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 01-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"/>
  </svg>
)

export const Sidebar: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const navigationItems = [
    {
      key: 'home',
      label: t('nav_home', 'Main'),
      icon: <HomeIcon />,
      path: '/personal-cabinet',
      active: location.pathname === '/personal-cabinet'
    },
    {
      key: 'profile',
      label: t('nav_profile', 'Profile'),
      icon: <ProfileIcon />,
      path: '/personal-cabinet/main-borrower-personal-data',
      active: location.pathname.includes('/personal-data')
    },
    {
      key: 'documents',
      label: t('nav_documents', 'Documents'),
      icon: <DocumentIcon />,
      path: '/personal-cabinet/documents',
      active: location.pathname.includes('/documents')
    },
    {
      key: 'services',
      label: t('nav_services', 'Services'),
      icon: <ServicesIcon />,
      path: '/personal-cabinet',
      active: location.pathname === '/personal-cabinet'
    },
    {
      key: 'chat',
      label: t('nav_chat', 'Chat'),
      icon: <ChatIcon />,
      path: '/personal-cabinet/chat',
      active: location.pathname.includes('/chat'),
      notification: 2
    }
  ]

  const bottomNavigationItems = [
    {
      key: 'payments',
      label: t('nav_payments', 'Payments'),
      icon: <PaymentsIcon />,
      path: '/payments',
      active: location.pathname.includes('/payments')
    },
    {
      key: 'settings',
      label: t('nav_settings', 'Settings'),
      icon: <SettingsIcon />,
      path: '/personal-cabinet/settings',
      active: location.pathname.includes('/settings')
    },
    {
      key: 'signout',
      label: t('nav_signout', 'Sign Out'),
      icon: <SignOutIcon />,
      path: '/signout',
      active: false
    }
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <div className={cx('sidebar')}>
      {/* Logo Section */}
      <div className={cx('logo-section')}>
        <div className={cx('logo')}>
          <div className={cx('logo-icon')}>
            {/* BankimOnline Logo */}
            <span className={cx('logo-text')}>BANKIMONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={cx('navigation-section')}>
        <nav className={cx('nav-list')}>
          {navigationItems.map((item) => (
            <button
              key={item.key}
              className={cx('nav-item', { 'nav-item--active': item.active })}
              onClick={() => handleNavigation(item.path)}
            >
              <div className={cx('nav-item-content')}>
                <div className={cx('nav-item-icon')}>
                  {item.icon}
                </div>
                <span className={cx('nav-item-label')}>
                  {item.label}
                </span>
                {item.notification && (
                  <div className={cx('notification-badge')}>
                    {item.notification}
                  </div>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div className={cx('divider')} />

      {/* Bottom Navigation */}
      <div className={cx('bottom-navigation')}>
        <nav className={cx('nav-list')}>
          {bottomNavigationItems.map((item) => (
            <button
              key={item.key}
              className={cx('nav-item', { 
                'nav-item--active': item.active,
                'nav-item--settings': item.key === 'settings' && item.active
              })}
              onClick={() => handleNavigation(item.path)}
            >
              <div className={cx('nav-item-content')}>
                <div className={cx('nav-item-icon')}>
                  {item.icon}
                </div>
                <span className={cx('nav-item-label')}>
                  {item.label}
                </span>
              </div>
              {item.key === 'settings' && item.active && (
                <div className={cx('active-indicator')} />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
} 