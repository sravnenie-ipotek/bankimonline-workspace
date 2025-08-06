import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import { SuccessIcon } from '@assets/icons/SuccessIcon'
import { Button } from '@src/components/ui/ButtonUI'

import styles from './applicationSubmitted.module.scss'

const cx = classNames.bind(styles)

const ApplicationSubmitted = () => {
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
