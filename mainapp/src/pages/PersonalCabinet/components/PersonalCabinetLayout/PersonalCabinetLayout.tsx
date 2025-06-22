import React from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import styles from './personalCabinetLayout.module.scss'
import { Sidebar } from '../Sidebar/Sidebar'
import { TopHeader } from '../TopHeader/TopHeader'

const cx = classNames.bind(styles)

interface PersonalCabinetLayoutProps {
  children: React.ReactNode
}

export const PersonalCabinetLayout: React.FC<PersonalCabinetLayoutProps> = ({ children }) => {
  const { t } = useTranslation()

  return (
    <div className={cx('layout')}>
      {/* Left Sidebar - 276px width */}
      <div className={cx('sidebar-container')}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className={cx('main-container')}>
        {/* Top Header */}
        <div className={cx('header-container')}>
          <TopHeader />
        </div>

        {/* Page Content */}
        <div className={cx('content-container')}>
          <div className={cx('content-wrapper')}>
            {children}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className={cx('footer-container')}>
          <div className={cx('footer-content')}>
            <span className={cx('footer-link')}>
              {t('user_agreement', 'Пользовательское соглашение')}
            </span>
            <span className={cx('footer-link')}>
              {t('privacy_policy', 'Политика конфиденциальности')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 