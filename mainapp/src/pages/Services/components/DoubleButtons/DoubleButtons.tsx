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
    console.log('🔍 DoubleButtons Debug:', { 
      isValid, 
      errors, 
      values,
      touched,
      errorCount: Object.keys(errors).length,
      touchedCount: Object.keys(touched).length
    })
    
    // Log specific validation errors
    if (Object.keys(errors).length > 0) {
      console.log('❌ Validation Errors:', errors)
    }
  }, [isValid, errors, values, touched])

  return (
    <div className={cx('doubleButtons')}>
      <div className={cx('wrapper')}>
        <div className={cx('buttons')}>
          <Button
            variant="modalBase"
            type="submit"
            onClick={() => navigate(-1)}
            size="full"
          >
            {t('button_back')}
          </Button>
          <Button
            type="submit"
            isDisabled={!isValid}
            onClick={handleSubmit as () => void}
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
