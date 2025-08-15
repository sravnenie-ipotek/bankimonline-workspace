import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import React from 'react'

import { Button } from '@src/components/ui/ButtonUI'
import { Column } from '@src/components/ui/Column'
import { useAppDispatch } from '@src/hooks/store.ts'
import { MainSourceOfIncome } from '@src/pages/Services/components/MainSourceOfIncome'
import { getComponentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { SourceOfIncomeModalTypes } from '@src/pages/Services/types/formTypes'

import styles from './sourceOfIncomeForm.module.scss'

const cx = classNames.bind(styles)

const SourceOfIncomeForm = () => {
  const { t, i18n } = useTranslation()

  const { handleSubmit, isValid, values, errors, touched, validateForm } =
    useFormikContext<SourceOfIncomeModalTypes>()
  
  // ✅ FIXED: Detect screen location for modal components
  // Credit Step 3 modal needs 'credit_step3' for proper API calls
  const currentPath = window.location.pathname
  const screenLocation = currentPath.includes('calculate-credit') ? 'credit_step3' 
    : currentPath.includes('calculate-mortgage') ? 'mortgage_step3'
    : currentPath.includes('refinance-mortgage') ? 'refinance_step3'
    : currentPath.includes('other-borrowers') ? 'other_borrowers_step2'
    : 'credit_step3' // Default fallback

  const { mainSourceOfIncome } = values

  // ✅ FIXED: Modal needs same numeric-to-semantic mapping as main form
  // Credit API returns numeric values ("1", "2", "3") but componentsByIncomeSource expects semantic keys
  const getIncomeSourceKey = (optionValue: string): string => {
    // If already semantic, return as-is (future-proofing)
    if (optionValue && !optionValue.match(/^\d+$/)) {
      return optionValue
    }
    
    // Numeric-to-semantic mapping for calculate_credit_3 API
    const numericMapping: { [key: string]: string } = {
      '1': 'employee',        // Employee
      '2': 'selfemployed',    // Self-employed
      '3': 'selfemployed',    // Business owner (treat as self-employed)
      '4': 'pension',         // Pension
      '5': 'student',         // Student
      '6': 'unemployed',      // Unemployed
      '7': 'other'            // Other
    }
    return numericMapping[optionValue] || ''
  }
  
  const incomeSourceKey = getIncomeSourceKey(mainSourceOfIncome)

  // ✅ FIXED: Get components with proper screenLocation for modal context
  const componentsByIncomeSource = getComponentsByIncomeSource(screenLocation)

  // Debug current selection and mapping
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    ,
      willRender: !!componentsByIncomeSource[incomeSourceKey],
    })
  }, [mainSourceOfIncome, incomeSourceKey, screenLocation, componentsByIncomeSource])

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
