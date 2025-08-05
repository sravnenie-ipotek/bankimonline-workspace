import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'
import styles from './LawyerQuestionnaireSuccess.module.scss'

const cx = classNames.bind(styles)

const LawyerQuestionnaireSuccess: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className={cx('success-page')}>
      <div className={cx('success-container')}>
        <div className={cx('success-card')}>
          <div className={cx('success-icon')}>
            <svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="28" cy="28" r="28" fill="#EF5350" />
              <path
                d="M23.5 28.5L26 31L33 24"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <h1 className={cx('success-title')}>
            {t('lawyer_success_title')}
          </h1>
          
          <p className={cx('success-message')}>
            {t('lawyer_success_message')}
          </p>
          
          <button
            className={cx('home-button')}
            onClick={handleBackToHome}
          >
            {t('lawyer_success_button')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LawyerQuestionnaireSuccess