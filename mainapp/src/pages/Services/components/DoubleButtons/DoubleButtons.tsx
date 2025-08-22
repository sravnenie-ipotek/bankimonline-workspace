import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@components/ui/ButtonUI'

import styles from './doubleButtons.module.scss'

const cx = classNames.bind(styles)

const DoubleButtons: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { handleSubmit, isValid, errors, values, touched } = useFormikContext()

  // Enhanced debug logging
  useEffect(() => {
    console.log('Form validation state:', {
      isValid,
      errorCount: Object.keys(errors).length,
      touchedCount: Object.keys(touched).length,
      isMobile: window.innerWidth <= 890
    })
    
    // Log specific validation errors
    if (Object.keys(errors).length > 0) {
      console.log('Current validation errors:', errors)
    }
  }, [isValid, errors, values, touched])

  return (
    <div className={cx('doubleButtons')}>
      <div className={cx('wrapper')}>
        <div className={cx('buttons')}>
          <Button
            variant="modalBase"
            type="button"
            onClick={(e) => {
              e.preventDefault()
              navigate(-1)
            }}
            size="full"
          >
            {t('button_back')}
          </Button>
          <Button
            type="submit"
            isDisabled={!isValid}
            onClick={(e) => {
              e.preventDefault()
              console.log('Next button clicked, isValid:', isValid)
              if (isValid) {
                handleSubmit()
              }
            }}
            size="full"
          >
            {t('button_next_save')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DoubleButtons
