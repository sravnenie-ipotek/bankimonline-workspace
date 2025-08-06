import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'

import { SuccessIcon } from '@assets/icons/SuccessIcon'

import styles from './bankMeetingConfirmationModal.module.scss'

const cx = classNames.bind(styles)

interface AppointmentData {
  city: string
  branch: string
  date: string
  time: string
}

interface BankMeetingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentData?: AppointmentData
}

export const BankMeetingConfirmationModal: React.FC<BankMeetingConfirmationModalProps> = ({
  isOpen,
  onClose,
  appointmentData
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!isOpen) return null

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Handle continue to personal cabinet
  const handleContinue = () => {
    onClose()
    navigate('/personal-cabinet')
  }

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal-container')}>
        {/* Modal Header */}
        <div className={cx('modal-header')}>
          <button
            type="button"
            onClick={onClose}
            className={cx('close-button')}
            aria-label={t('close', 'Закрыть')}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className={cx('modal-content')}>
          {/* Success Icon */}
          <div className={cx('success-icon-container')}>
            <SuccessIcon size={80} />
          </div>

          {/* Title */}
          <h2 className={cx('modal-title')}>
            {t('meeting_scheduled_title', 'Встреча назначена!')}
          </h2>

          {/* Appointment Details */}
          {appointmentData && (
            <div className={cx('appointment-details')}>
              <div className={cx('detail-item')}>
                <span className={cx('detail-label')}>
                  {t('city', 'Город')}:
                </span>
                <span className={cx('detail-value')}>
                  {appointmentData.city}
                </span>
              </div>
              
              <div className={cx('detail-item')}>
                <span className={cx('detail-label')}>
                  {t('bank_branch', 'Филиал банка')}:
                </span>
                <span className={cx('detail-value')}>
                  {appointmentData.branch}
                </span>
              </div>
              
              <div className={cx('detail-item')}>
                <span className={cx('detail-label')}>
                  {t('meeting_date', 'Дата встречи')}:
                </span>
                <span className={cx('detail-value')}>
                  {formatDate(appointmentData.date)}
                </span>
              </div>
              
              <div className={cx('detail-item')}>
                <span className={cx('detail-label')}>
                  {t('meeting_time', 'Время встречи')}:
                </span>
                <span className={cx('detail-value')}>
                  {appointmentData.time}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <p className={cx('modal-description')}>
            {t('meeting_confirmation_message', 
              'Ваша встреча с банком успешно назначена. Вы получите подтверждение на указанный email.'
            )}
          </p>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleContinue}
            className={cx('continue-button')}
          >
            {t('continue_to_personal_cabinet', 'Продолжить в личный кабинет')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BankMeetingConfirmationModal 