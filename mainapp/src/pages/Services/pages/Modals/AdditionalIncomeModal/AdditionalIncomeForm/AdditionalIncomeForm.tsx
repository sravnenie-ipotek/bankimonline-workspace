import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Button } from '@src/components/ui/ButtonUI'
import { useAppDispatch } from '@src/hooks/store.ts'
import { AdditionalIncome } from '@src/pages/Services/components/AdditionalIncome'
import { AdditionalIncomeAmount } from '@src/pages/Services/components/AdditionalIncomeAmount'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { AdditionalIncomeModalTypes } from '@src/pages/Services/types/formTypes'

import styles from './additionalIncome.module.scss'

const cx = classNames.bind(styles)
const AdditionalIncomeForm = () => {
  const { t, i18n } = useTranslation()
  const { handleSubmit, isValid, values } =
    useFormikContext<AdditionalIncomeModalTypes>()

  const dispatch = useAppDispatch()

  return (
    <>
      <div className={cx('modal')}>
        <div className={cx('modal-item')}>
          <AdditionalIncome excludeNoIncome={true} />
          {values.additionalIncome && <AdditionalIncomeAmount />}
        </div>
        <div className={cx('modal-buttons')}>
          <div className={cx('buttons')}>
            <Button
              variant="modalBase"
              type="submit"
              onClick={() => dispatch(closeModal())}
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
    </>
  )
}

export default AdditionalIncomeForm
