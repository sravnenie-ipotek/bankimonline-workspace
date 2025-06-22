import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import styles from './settingsPage.module.scss'
import { ModalType } from '../../PersonalCabinet'

const cx = classNames.bind(styles)

interface SettingsPageProps {
  onOpenModal: (modalType: ModalType) => void
}

// Icons
const DotsThreeVerticalIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
    <circle cx="16" cy="8" r="2" />
    <circle cx="16" cy="16" r="2" />
    <circle cx="16" cy="24" r="2" />
  </svg>
)

const UserCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM4 14a6 6 0 1112 0v1H4v-1z"/>
  </svg>
)

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM4 14a6 6 0 1112 0v1H4v-1z"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
  </svg>
)

const EnvelopeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
  </svg>
)

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
  </svg>
)

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenModal }) => {
  const { t } = useTranslation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Mock user data
  const userData = {
    name: 'Александр Пушкин',
    phone: '+ 935 55 324 3223',
    email: 'Bankimonline@mail.com'
  }

  const handleProfileMenuClick = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const handleMenuItemClick = (modalType: ModalType) => {
    setShowProfileMenu(false)
    if (modalType) {
      onOpenModal(modalType)
    }
  }

  return (
    <div className={cx('settings-page')}>
      {/* Page Title */}
      <div className={cx('page-title')}>
        <h1 className={cx('title-text')}>
          {t('settings_title', 'Настройки')}
        </h1>
      </div>

      {/* Profile Details Card */}
      <div className={cx('profile-card')}>
        <div className={cx('profile-header')}>
          <h2 className={cx('profile-title')}>
            {t('profile_details', 'Детали профиля')}
          </h2>
          <div className={cx('profile-menu-container')}>
            <button 
              className={cx('profile-menu-button')}
              onClick={handleProfileMenuClick}
            >
              <DotsThreeVerticalIcon />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className={cx('profile-dropdown')}>
                <div 
                  className={cx('dropdown-item')}
                  onClick={() => handleMenuItemClick('profilePhoto')}
                >
                  <UserCircleIcon />
                  <span>{t('change_profile_photo', 'Изменить фото профиля')}</span>
                </div>
                <div 
                  className={cx('dropdown-item')}
                  onClick={() => handleMenuItemClick(null)}
                >
                  <UserIcon />
                  <span>{t('change_name', 'Изменить Фамилию Имя')}</span>
                </div>
                <div 
                  className={cx('dropdown-item')}
                  onClick={() => handleMenuItemClick('changePhone')}
                >
                  <PhoneIcon />
                  <span>{t('change_phone', 'Изменить Номер телефона')}</span>
                </div>
                <div 
                  className={cx('dropdown-item')}
                  onClick={() => handleMenuItemClick('emailSettings')}
                >
                  <EnvelopeIcon />
                  <span>{t('change_email', 'Изменить Email')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={cx('profile-content')}>
          {/* User Avatar */}
          <div className={cx('user-avatar')}>
            <div className={cx('avatar-circle')}>
              <UserIcon />
            </div>
          </div>

          {/* User Information */}
          <div className={cx('user-info')}>
            <div className={cx('info-group')}>
              <div className={cx('info-label')}>
                {t('full_name', 'Имя Фамилия')}
              </div>
              <div className={cx('info-value')}>
                {userData.name}
              </div>
            </div>

            <div className={cx('info-group')}>
              <div className={cx('info-label')}>
                {t('phone_number', 'Номер телефона')}
              </div>
              <div className={cx('info-value')}>
                {userData.phone}
              </div>
            </div>
          </div>

          <div className={cx('user-info')}>
            <div className={cx('info-group')}>
              <div className={cx('info-label')}>
                Email
              </div>
              <div className={cx('info-value')}>
                {userData.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className={cx('password-section')}>
        <div className={cx('password-content')}>
          <h2 className={cx('password-title')}>
            {t('password', 'Пароль')}
          </h2>
          <button 
            className={cx('change-password-button')}
            onClick={() => onOpenModal('changePassword')}
          >
            <LockIcon />
            <span>{t('change_password', 'Изменить пароль')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}