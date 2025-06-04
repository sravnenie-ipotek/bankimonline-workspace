import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './serviceStatusLabel.module.scss'

interface DocumentStatusLabelProps {
  status:
    | 'completeSurvey'
    | 'documentsNotAccepted'
    | 'questionnaireNotAccepted'
    | 'sendApplicationBank'
    | 'waitResponseBank'
    | 'viewOffers'
    | 'theDealCompleted' //статус заявки
}

const cx = classNames.bind(styles)

const ServiceStatusLabel: React.FC<DocumentStatusLabelProps> = ({ status }) => {
  const { t } = useTranslation()

  const labelClasses = {
    [status]: true, // Добавление css-класса, соответствующего текущему статусу
    [styles.documentStatusLabel]: true, // Добавление базового css-класса метки
  }

  return (
    <p className={cx(labelClasses)}>
      {(() => {
        switch (status) {
          case 'completeSurvey':
            return <span>{t('labels.serviceStatusLabel.completeSurvey')}</span>
          case 'documentsNotAccepted':
            return (
              <span>{t('labels.serviceStatusLabel.documentsNotAccepted')}</span>
            )
          case 'questionnaireNotAccepted':
            return (
              <span>
                {t('labels.serviceStatusLabel.questionnaireNotAccepted')}
              </span>
            )
          case 'sendApplicationBank':
            return (
              <span>{t('labels.serviceStatusLabel.sendApplicationBank')}</span>
            )
          case 'waitResponseBank':
            return (
              <span>{t('labels.serviceStatusLabel.waitResponseBank')}</span>
            )
          case 'viewOffers':
            return <span>{t('labels.serviceStatusLabel.viewOffers')}</span>
          case 'theDealCompleted':
            return (
              <span>{t('labels.serviceStatusLabel.theDealCompleted')}</span>
            )
          default:
            return <span>{t('labels.serviceStatusLabel.noData')}</span>
        }
      })()}
    </p>
  )
}

export default ServiceStatusLabel
