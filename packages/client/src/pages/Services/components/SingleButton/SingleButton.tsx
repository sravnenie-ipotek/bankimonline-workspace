import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import { Button } from '@components/ui/ButtonUI'

import styles from './singleButton.module.scss'

const cx = classNames.bind(styles)

interface SingleButtonProps {
  showValidationHints?: boolean
}

const SingleButton: React.FC<SingleButtonProps> = ({ 
  showValidationHints = false 
}) => {
  const { t } = useTranslation()
  const { isValid, handleSubmit, errors, values, setFieldTouched } = useFormikContext<any>()
  const [showErrors, setShowErrors] = useState(false)

  const handleClick = () => {
    // Touch all fields to show validation errors
    Object.keys(values).forEach(fieldName => {
      setFieldTouched(fieldName, true, false)
    })
    
    // Only submit if form is valid
    if (isValid) {
      handleSubmit()
    } else {
      setShowErrors(true)
    }
  }

  return (
    <div className={cx('submit-btn')}>
      <div className={cx('wrapper')}>
        <div className={cx('buttons')}>
          <Button
            onClick={handleClick}
            size="smallLong"
            type="button"
            style={{
              opacity: isValid ? 1 : 0.7,
              cursor: isValid ? 'pointer' : 'not-allowed',
              pointerEvents: 'auto',
              zIndex: 9999
            }}
          >
            {t('button_next')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SingleButton
