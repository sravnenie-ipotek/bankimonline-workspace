import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'

import { SuccessIcon } from '@assets/icons/SuccessIcon'

import styles from './applicationAcceptedModal.module.scss'

const cx = classNames.bind(styles)

interface ApplicationAcceptedModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ApplicationAcceptedModal: React.FC<ApplicationAcceptedModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!isOpen) return null

  // Handle navigation to program selection page (Action #2)
  const handleGoToProgramSelection = () => {
    onClose()
    // Navigate to program selection page - this would be the main services page
    // where users can select different loan programs
    navigate('/services')
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

          {/* Action #1: Title */}
          <h2 className={cx('modal-title')}>
            {t('application_submitted_title', 'Заявку приняли в обработку')}
          </h2>

          {/* Description */}
          <p className={cx('modal-description')}>
            {t('application_submitted_description', 
              'Ответ от банков по вашей заявке поступит в течение 2-3 рабочих дней. Мы пришлем вам Уведомления об ответе по SMS или Email.'
            )}
          </p>

          {/* Action #2: Navigation Button */}
          <button
            type="button"
            onClick={handleGoToProgramSelection}
            className={cx('continue-button')}
          >
            {t('go_to_program_selection', 'На страницу выбора программы')}
          </button>
        </div>
      </div>
    </div>
  )
} 