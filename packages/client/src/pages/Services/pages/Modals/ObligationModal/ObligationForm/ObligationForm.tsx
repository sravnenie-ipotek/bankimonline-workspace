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

  // Map dropdown option values to componentsByObligation keys
  const getObligationKey = (optionValue: string): string => {
    const mapping: { [key: string]: string } = {
      '1': '',                    // No obligations - no additional components
      '2': 'bank_loan',           // Bank loan
      '3': 'credit_card',         // Credit card debt
      '4': 'other'                // Other obligations
    }
    return mapping[optionValue] || ''
  }

  const obligationKey = getObligationKey(obligation)

  // Debug: Log obligation mapping and form state
  })

  return (
    <>
      <div className={cx('modal')}>
        <div className={cx('container')}>
          <Obligation screenLocation="calculate_credit_3" />
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
