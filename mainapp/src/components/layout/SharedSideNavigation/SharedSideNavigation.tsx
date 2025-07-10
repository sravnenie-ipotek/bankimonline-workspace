import React, { useMemo } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

// Import icon components
import { ChartPieIcon } from '@assets/icons/ChartPieIcon'
import { UsersGroupIcon } from '@assets/icons/UsersGroupIcon'
import { FileLinesIcon } from '@assets/icons/FileLinesIcon'
import { BankIcon } from '@assets/icons/BankIcon/BankIcon'
import { AddUserIcon } from '@assets/icons/AddUserIcon'
import { MessageIcon } from '@assets/icons/MessageIcon/MessageIcon'
import { Settings } from '@assets/icons/Settings'
import { Logout } from '@assets/icons/Logout'

// Import types
import { SharedSideNavigationProps, NavigationItem, SideNavItemProps, LogoSectionProps } from './types'

import styles from './SharedSideNavigation.module.scss'

const cx = classNames.bind(styles)

/**
 * Logo Section Component (Action #1)
 * Displays Bankimonline project logo
 */
const LogoSection: React.FC<LogoSectionProps> = ({ logo, isCollapsed }) => {
  const { t } = useTranslation()
  
  return (
    <div className={cx('logo-section')}>
      {logo ? (
        <div className={cx('logo-content')}>
          <img 
            src={logo.src} 
            alt={logo.alt} 
            className={cx('logo-image')}
          />
          {!isCollapsed && logo.name && (
            <span className={cx('logo-text')}>{logo.name}</span>
          )}
        </div>
      ) : (
        <div className={cx('logo-content')}>
          <div className={cx('default-logo')}>
            <span className={cx('logo-text-default')}>
              {isCollapsed ? 'BO' : 'BANKIMONLINE'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Navigation Item Component
 * Renders individual navigation items with icons and labels
 */
const SideNavItem: React.FC<SideNavItemProps> = ({ item, isCollapsed }) => {
  const handleClick = () => {
    if (item.onClick) {
      item.onClick()
    }
  }

  return (
    <button
      className={cx('nav-item', { 
        'nav-item--active': item.isActive,
        'nav-item--collapsed': isCollapsed
      })}
      onClick={handleClick}
      title={isCollapsed ? item.label : undefined}
    >
      <div className={cx('nav-item-content')}>
        <div className={cx('nav-item-icon')}>
          <item.icon 
            size={24} 
            color={item.isActive ? '#FFFFFF' : '#9CA3AF'} 
          />
        </div>
        {!isCollapsed && (
          <span className={cx('nav-item-label')}>
            {item.label}
          </span>
        )}
      </div>
    </button>
  )
}

/**
 * Main SharedSideNavigation Component
 * Implements all 9 actions from Confluence documentation for bank employee navigation
 */
const SharedSideNavigation: React.FC<SharedSideNavigationProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  className = '',
  isCollapsed = false,
  bankLogo
}) => {
  const { t } = useTranslation()
  const location = useLocation()

  // Main navigation items (Actions #2-#7)
  const mainNavigationItems: NavigationItem[] = useMemo(() => [
    {
      id: 'home',
      label: t('side_nav_home', 'Главная'),
      icon: ChartPieIcon,
      path: '/admin/dashboard',
      isActive: currentPath === '/admin/dashboard' || currentPath.includes('/admin/dashboard'),
      onClick: () => onNavigate('/admin/dashboard', 'home')
    },
    {
      id: 'clients',
      label: t('side_nav_clients', 'Клиенты'),
      icon: UsersGroupIcon,
      path: '/admin/clients',
      isActive: currentPath.includes('/admin/clients'),
      onClick: () => onNavigate('/admin/clients', 'clients')
    },
    {
      id: 'offers',
      label: t('side_nav_offers', 'Предложения'),
      icon: FileLinesIcon,
      path: '/admin/offers',
      isActive: currentPath.includes('/admin/offers'),
      onClick: () => onNavigate('/admin/offers', 'offers')
    },
    {
      id: 'bank_programs',
      label: t('side_nav_bank_programs', 'Банковские программы'),
      icon: BankIcon,
      path: '/admin/bank-programs',
      isActive: currentPath.includes('/admin/bank-programs'),
      onClick: () => onNavigate('/admin/bank-programs', 'bank_programs')
    },
    {
      id: 'audience_creation',
      label: t('side_nav_audience_creation', 'Создание аудитории'),
      icon: AddUserIcon,
      path: '/admin/audience-creation',
      isActive: currentPath.includes('/admin/audience-creation'),
      onClick: () => onNavigate('/admin/audience-creation', 'audience_creation')
    },
    {
      id: 'chat',
      label: t('side_nav_chat', 'Чат'),
      icon: MessageIcon,
      path: '/admin/chat',
      isActive: currentPath.includes('/admin/chat'),
      onClick: () => onNavigate('/admin/chat', 'chat')
    }
  ], [currentPath, onNavigate, t])

  // Bottom navigation items (Actions #8-#9)
  const bottomNavigationItems: NavigationItem[] = useMemo(() => [
    {
      id: 'settings',
      label: t('side_nav_settings', 'Настройки'),
      icon: Settings,
      path: '/admin/settings',
      isActive: currentPath.includes('/admin/settings'),
      onClick: () => onNavigate('/admin/settings', 'settings')
    },
    {
      id: 'logout',
      label: t('side_nav_logout', 'Выйти'),
      icon: Logout,
      path: '/logout',
      isActive: false,
      onClick: onLogout
    }
  ], [currentPath, onNavigate, onLogout, t])

  return (
    <aside className={cx('shared-side-navigation', className, { 
      'shared-side-navigation--collapsed': isCollapsed 
    })}>
      {/* Logo Section (Action #1) */}
      <LogoSection logo={bankLogo} isCollapsed={isCollapsed} />

      {/* Main Navigation Section (Actions #2-#7) */}
      <div className={cx('main-navigation')}>
        <nav className={cx('nav-list')}>
          {mainNavigationItems.map((item) => (
            <SideNavItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>

      {/* Separator */}
      <div className={cx('separator')} />

      {/* Bottom Navigation Section (Actions #8-#9) */}
      <div className={cx('bottom-navigation')}>
        <nav className={cx('nav-list')}>
          {bottomNavigationItems.map((item) => (
            <SideNavItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default SharedSideNavigation 