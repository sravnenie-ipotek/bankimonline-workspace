import React from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import styles from './mainDashboard.module.scss'
import { Button } from '@src/components/ui/ButtonUI'
import { ProgressBar } from '@src/components/ui/ProgressBar'

const cx = classNames.bind(styles)

export const MainDashboard: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Mock application data - in real app would come from context/state
  const applicationData = {
    service: t('calculate_credit', 'Рассчитать кредит'),
    loanAmount: '1,000,000 ₪',
    term: '360 месяцев',
    downPayment: '500,000 ₪ (50%)',
    progress: 70,
    status: 'in_progress'
  }

  const handleCompleteApplication = () => {
    navigate('/personal-cabinet/main-borrower-personal-data')
  }

  const handleUploadDocuments = () => {
    navigate('/documents')
  }

  const handleViewPrograms = () => {
    navigate('/programs')
  }

  return (
    <div className={cx('main-dashboard')}>
      {/* Page Header */}
      <div className={cx('header')}>
        <h1 className={cx('title')}>
          {t('main_dashboard_title', 'Главная')}
        </h1>
      </div>

      {/* Application Section */}
      <div className={cx('application-section')}>
        <div className={cx('section-header')}>
          <h2 className={cx('section-title')}>
            {t('my_application', 'Моя Анкета')}
          </h2>
        </div>

        {/* Service Summary Card */}
        <div className={cx('service-card')}>
          <div className={cx('service-header')}>
            <h3 className={cx('service-title')}>
              {applicationData.service}
            </h3>
          </div>

          <div className={cx('service-details')}>
            <div className={cx('detail-row')}>
              <div className={cx('detail-item')}>
                <span className={cx('detail-label')}>
                  {t('loan_amount', 'Сумма кредита')}:
                </span>
                <span className={cx('detail-value')}>
                  {applicationData.loanAmount}
                </span>
              </div>
              <div className={cx('detail-item')}>
                <span className={cx('detail-label')}>
                  {t('term', 'Срок')}:
                </span>
                <span className={cx('detail-value')}>
                  {applicationData.term}
                </span>
              </div>
            </div>
            <div className={cx('detail-row')}>
              <div className={cx('detail-item')}>
                <span className={cx('detail-label')}>
                  {t('down_payment', 'Первоначальный взнос')}:
                </span>
                <span className={cx('detail-value')}>
                  {applicationData.downPayment}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className={cx('progress-section')}>
          <div className={cx('progress-header')}>
            <h3 className={cx('progress-title')}>
              {t('complete_application_message', 'Закончите анкету, позвольте банкам конкурировать за вас')}
            </h3>
          </div>

          <div className={cx('progress-container')}>
            <ProgressBar 
              progress="3"
              data={['Калькулятор', 'Анкета', 'Доходы', 'Программы']}
            />
          </div>

          {/* Action Buttons */}
          <div className={cx('action-buttons')}>
            <Button
              variant="primary"
              size="full"
              onClick={handleCompleteApplication}
              className={cx('complete-button')}
            >
              {t('complete_application', 'Завершить анкету')}
            </Button>

            <Button
              variant="secondary"
              size="full"
              onClick={handleUploadDocuments}
              className={cx('upload-button')}
            >
              {t('upload_documents', 'Загрузите документы')}
            </Button>
          </div>
        </div>

        {/* Preliminary Program Selection */}
        <div className={cx('program-section')}>
          <div className={cx('program-header')}>
            <span className={cx('program-label')}>
              {t('preliminary_selected_program', 'Предварительно выбранная программа')}
            </span>
          </div>
          
          <div className={cx('program-dropdown')}>
            <Button
              variant="secondary"
              size="medium"
              onClick={handleViewPrograms}
              className={cx('program-button')}
            >
              {t('view_programs', 'Просмотреть программы')}
            </Button>
          </div>
        </div>
      </div>

      {/* Technical Support */}
      <div className={cx('support-section')}>
        <Button
          variant="transparent"
          size="small"
          className={cx('support-button')}
        >
          {t('technical_support', 'Техническая поддержка')}
        </Button>
      </div>
    </div>
  )
} 