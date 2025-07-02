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
    console.log('=== VALIDATION DEBUG ===')
    console.log('isValid:', isValid)
    console.log('values:', values)
    console.log('errors:', errors)
    console.log('========================')
    
    if (isValid) {
      handleSubmit()
    } else if (showValidationHints) {
      // Mark all fields as touched to show errors
      const touchAllFields = (obj: any, path = '') => {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key
          setFieldTouched(currentPath, true)
          
          if (Array.isArray(obj[key])) {
            obj[key].forEach((_: any, index: number) => {
              if (typeof obj[key][index] === 'object' && obj[key][index] !== null) {
                touchAllFields(obj[key][index], `${currentPath}.${index}`)
              }
            })
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            touchAllFields(obj[key], currentPath)
          }
        })
      }
      
      touchAllFields(values)
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
              opacity: isValid ? 1 : 0.6,
              cursor: isValid ? 'pointer' : 'not-allowed'
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
