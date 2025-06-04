import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './documentStatusLabel.module.scss'

interface DocumentStatusLabelProps {
  status: 'accepted' | 'notAccepted' | 'checked' //статусы метки
}

const cx = classNames.bind(styles)

const DocumentStatusLabel: React.FC<DocumentStatusLabelProps> = ({
  status,
}) => {
  const labelClasses = {
    [status]: true, // Добавление css-класса, соответствующего текущему статусу
    [styles.documentStatusLabel]: true, // Добавление базового css-класса метки
  }

  const { t } = useTranslation()

  return (
    <p className={cx(labelClasses)}>
      {(() => {
        switch (status) {
          case 'accepted':
            return (
              <span>{t('labels.documentStatusLabel.documentsAccepted')}</span>
            )
          case 'notAccepted':
            return (
              <span>
                {t('labels.documentStatusLabel.documentsNotAccepted')}
              </span>
            )
          case 'checked':
            return (
              <span>{t('labels.documentStatusLabel.documentsChecked')}</span>
            )
          default:
            return <span>{t('labels.documentStatusLabel.noData')}</span>
        }
      })()}
    </p>
  )
}

export default DocumentStatusLabel
