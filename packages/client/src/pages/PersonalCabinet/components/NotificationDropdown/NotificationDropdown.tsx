import React from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import styles from './notificationDropdown.module.scss'

const cx = classNames.bind(styles)

// Notification status icons
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </svg>
)

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
  </svg>
)

const BankIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5h1zM7 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1A.5.5 0 0 1 7 5V4z"/>
    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2z"/>
  </svg>
)

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
  </svg>
)

export interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'bank' | 'chat'
  title: string
  message: string
  time: string
  date: string
  actionText?: string
  actionType?: 'chat' | 'document' | 'program'
  isRead?: boolean
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onNotificationClick: (notification: NotificationItem) => void
  onActionClick: (notification: NotificationItem) => void
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onActionClick
}) => {
  const { t } = useTranslation()

  if (!isOpen) return null

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckIcon />
      case 'error':
        return <ErrorIcon />
      case 'bank':
        return <BankIcon />
      case 'chat':
        return <ChatIcon />
      default:
        return <CheckIcon />
    }
  }

  const getNotificationClass = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 'notification-success'
      case 'error':
        return 'notification-error'
      case 'bank':
        return 'notification-bank'
      case 'chat':
        return 'notification-chat'
      default:
        return 'notification-success'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className={cx('backdrop')} onClick={onClose} />
      
      {/* Dropdown */}
      <div className={cx('dropdown')}>
        <div className={cx('dropdown-header')}>
          <h3 className={cx('dropdown-title')}>
            {t('notifications', 'Уведомления')}
          </h3>
          <button className={cx('close-button')} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className={cx('dropdown-content')}>
          {notifications.length === 0 ? (
            <div className={cx('empty-state')}>
              <p className={cx('empty-text')}>
                {t('no_notifications', 'Нет уведомлений')}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cx('notification-item', getNotificationClass(notification.type), {
                  'notification-unread': !notification.isRead
                })}
                onClick={() => onNotificationClick(notification)}
              >
                <div className={cx('notification-icon')}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className={cx('notification-content')}>
                  <div className={cx('notification-header')}>
                    <h4 className={cx('notification-title')}>
                      {notification.title}
                    </h4>
                    <div className={cx('notification-time')}>
                      <span className={cx('time')}>{notification.time}</span>
                      <span className={cx('date')}>{notification.date}</span>
                    </div>
                  </div>
                  
                  <p className={cx('notification-message')}>
                    {notification.message}
                  </p>
                  
                  {notification.actionText && (
                    <button
                      className={cx('notification-action')}
                      onClick={(e) => {
                        e.stopPropagation()
                        onActionClick(notification)
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
      </div>
    </>
  )
} 