import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'

// Import icons and components (to be created)
import { SuccessIcon } from '@components/icons/SuccessIcon'
import { Button } from '@components/ui/Button'

import styles from './ApplicationSubmitted.module.css'

const cx = classNames.bind(styles)

const ApplicationSubmitted: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className={cx('application-submitted')}>
      <div className={cx('application-submitted-container')}>
        <div className={cx('application-submitted-header')}>
          <SuccessIcon size={80} color="#FBE54D" />
          <h2 className={cx('application-submitted-title')}>
            {t('application_submitted_title')}
          </h2>
          <p className={cx('application-submitted-description')}>
            {t('application_submitted_description')}
          </p>
        </div>
        <div className={cx('application-submitted-footer')}>
          <Button
            as={Link}
            to="/personal-cabinet"
            className={cx('application-submitted-button')}
          >
            {t('go_to_correspondence')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationSubmitted