import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Button } from '@src/components/ui/ButtonUI'
import { Column } from '@src/components/ui/Column'
import { useAppDispatch } from '@src/hooks/store.ts'
import { useContentApi } from '@src/hooks/useContentApi'
import { Obligation } from '@src/pages/Services/components/Obligation'
import { componentsByObligation } from '@src/pages/Services/constants/componentsByObligation'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { ObligationModalTypes } from '@src/pages/Services/types/formTypes'

import styles from './obligationForm.module.scss'

const cx = classNames.bind(styles)
const ObligationForm = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('common')
  const { handleSubmit, isValid, values, errors } =
    useFormikContext<ObligationModalTypes>()

  const dispatch = useAppDispatch()

  const { obligation } = values

  // ✅ STANDARDIZED: Direct database-driven obligation key  
  // Database returns semantic values directly (bank_loan, credit_card, etc.)
  // No mapping needed - use database values as-is per architecture docs
  const obligationKey = obligation === 'no_obligations' ? '' : obligation || ''

  // Debug: Log obligation mapping and form state
  console.log('🔍 Obligation Modal - Mapping:', {
    originalValue: obligation,
    mappedKey: obligationKey,
    hasComponents: !!componentsByObligation[obligationKey],
    availableKeys: Object.keys(componentsByObligation)
  })

  console.log('🔍 Obligation Modal - Form State:', {
    isValid,
    values,
    errors,
    obligation: obligation
  })

  return (
    <>
      <div className={cx('modal')}>
        <div className={cx('container')}>
          <Obligation />
          {componentsByObligation[obligationKey] &&
            componentsByObligation[obligationKey].map((Component, index) => (
              <div className={cx('component')} key={index}>
                {Component}
              </div>
            ))}
          <Column />
        </div>
        <div className={cx('modal-buttons')}>
          <div className={cx('buttons')}>
            <Button
              variant="modalBase"
              type="button"
              onClick={() => dispatch(closeModal())}
            >
              {getContent('button_back') || (i18n.language === 'he' ? 'חזור' : i18n.language === 'ru' ? 'Назад' : 'Back')}
            </Button>
            <Button
              type="submit"
              isDisabled={!isValid}
              onClick={handleSubmit as () => void}
              size="full"
            >
              {getContent('button_next_save') || (i18n.language === 'he' ? 'שמור והמשך' : i18n.language === 'ru' ? 'Сохранить и продолжить' : 'Save and Continue')}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ObligationForm
