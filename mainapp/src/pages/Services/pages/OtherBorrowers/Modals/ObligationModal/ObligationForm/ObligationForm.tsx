import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import BackButton from '@src/components/ui/BackButton/BackButton'
import { Button } from '@src/components/ui/ButtonUI'
import { Column } from '@src/components/ui/Column'
import { useAppDispatch } from '@src/hooks/store.ts'
import { Obligation } from '@src/pages/Services/components/Obligation'
import { componentsByObligation } from '@src/pages/Services/constants/componentsByObligation'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { ObligationModalTypes } from '@src/pages/Services/types/formTypes'

import styles from './obligationForm.module.scss'

const cx = classNames.bind(styles)
const ObligationForm = () => {
  const { t, i18n } = useTranslation()
  const { handleSubmit, isValid, values } =
    useFormikContext<ObligationModalTypes>()

  const dispatch = useAppDispatch()

  const { obligation } = values
  return (
    <>
      <div className={cx('modal')}>
        <div className={cx('container')}>
          <Obligation />
          {componentsByObligation[obligation] &&
            componentsByObligation[obligation].map((Component, index) => (
              <div className={cx('component')} key={index}>
                {Component}
              </div>
            ))}
          <Column />
        </div>
        <div className={cx('modal-buttons')}>
          <div className={cx('buttons')}>
            <BackButton
              title={t('button_back')}
              handleClick={() => dispatch(closeModal())}
            />
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

export default ObligationForm
