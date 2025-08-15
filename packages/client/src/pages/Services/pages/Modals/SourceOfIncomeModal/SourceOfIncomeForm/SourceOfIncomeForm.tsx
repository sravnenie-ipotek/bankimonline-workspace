import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import React from 'react'

import { Button } from '@src/components/ui/ButtonUI'
import { Column } from '@src/components/ui/Column'
import { useAppDispatch } from '@src/hooks/store.ts'
import { MainSourceOfIncome } from '@src/pages/Services/components/MainSourceOfIncome'
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { SourceOfIncomeModalTypes } from '@src/pages/Services/types/formTypes'

import styles from './sourceOfIncomeForm.module.scss'

const cx = classNames.bind(styles)

const SourceOfIncomeForm = () => {
  const { t, i18n } = useTranslation()

  const { handleSubmit, isValid, values, errors, touched, validateForm } =
    useFormikContext<SourceOfIncomeModalTypes>()

  const { mainSourceOfIncome } = values

  const dispatch = useAppDispatch()

  // Debug validation state
  React.useEffect(() => {
    }, [isValid, values, errors, touched])

  // Force validation when mainSourceOfIncome changes
  React.useEffect(() => {
    if (mainSourceOfIncome) {
      validateForm()
    }
  }, [mainSourceOfIncome, validateForm])

  return (
    <>
      <div className={cx('modal')}>
        <div className={cx('container')}>
          <div className={cx('component')}>
            <MainSourceOfIncome />
          </div>
          {componentsByIncomeSource[mainSourceOfIncome] &&
            componentsByIncomeSource[mainSourceOfIncome].map(
              (Component, index) => (
                <div className={cx('component')} key={index}>
                  {Component}
                </div>
              )
            )}
          <Column />
        </div>
        <div className={cx('modal-buttons')}>
          <div className={cx('buttons')}>
            <Button
              variant="modalBase"
              type="button"
              onClick={() => dispatch(closeModal())}
            >
              {t('button_back')}
            </Button>
            <Button
              type="button"
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

export default SourceOfIncomeForm
