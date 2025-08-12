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

  // Map dropdown value (which might include full content keys) to a canonical key
  const getIncomeSourceKey = (optionValue: string): string => {
    const mapping: { [key: string]: string } = {
      // Direct semantic values
      employee: 'employee',
      selfemployed: 'selfemployed',
      pension: 'pension',
      student: 'student',
      unemployed: 'unemployed',
      unpaid_leave: 'unpaid_leave',
      other: 'other',
      // Legacy numerics
      '1': 'employee',
      '2': 'selfemployed',
      '3': 'selfemployed',
      '4': 'pension',
      '5': 'student',
      '6': 'unemployed',
      '7': 'other',
      // Legacy option format
      option_1: 'employee',
      option_2: 'selfemployed',
      option_3: 'selfemployed',
      option_4: 'pension',
      option_5: 'student',
      option_6: 'unemployed',
      option_7: 'other',
    }

    // Exact match first
    if (mapping[optionValue]) return mapping[optionValue]

    // Fallback: detect substring (handles values like 'mortgage_step3_main_source_employee')
    const lower = optionValue.toLowerCase()

    if (lower.includes('employee')) return 'employee'
    if (lower.includes('selfemployed') || lower.includes('self_employed') || lower.includes('self-employed')) return 'selfemployed'
    if (lower.includes('pension')) return 'pension'
    if (lower.includes('student')) return 'student'
    if (lower.includes('unemployed')) return 'unemployed'
    if (lower.includes('unpaid_leave') || lower.includes('unpaid') || lower.includes('leave')) return 'unpaid_leave'
    if (lower.includes('other')) return 'other'

    // If nothing matched, return empty string so nothing renders (safe fallback)
    return ''
  }

  const incomeSourceKey = getIncomeSourceKey(mainSourceOfIncome)

  // Debug current selection and mapping
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('🔎 SourceOfIncomeModal mapping:', {
      rawValue: mainSourceOfIncome,
      incomeSourceKey,
      availableKeys: Object.keys(componentsByIncomeSource),
      willRender: !!componentsByIncomeSource[incomeSourceKey],
    })
  }, [mainSourceOfIncome, incomeSourceKey])

  const dispatch = useAppDispatch()

  // Debug validation state
  React.useEffect(() => {
    console.log('🔍 Form Validation Debug:', {
      isValid,
      values,
      errors,
      touched,
      mainSourceOfIncome: values.mainSourceOfIncome
    })
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
          {componentsByIncomeSource[incomeSourceKey] &&
            componentsByIncomeSource[incomeSourceKey].map(
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
