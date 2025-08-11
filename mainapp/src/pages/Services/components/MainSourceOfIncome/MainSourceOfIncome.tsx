import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'


import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface MainSourceOfIncomeProps {
  screenLocation?: string
}

const MainSourceOfIncome = ({ screenLocation = 'mortgage_step3' }: MainSourceOfIncomeProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, errors, touched, setFieldTouched, setFieldError } =
    useFormikContext<FormTypes>()

  // ✅ UPDATED: Follow systemTranslationLogic.md - use database-first approach for all contexts
  // Use 'main_source' field name to match API key (mortgage_step3_main_source)
  const dropdownData = useDropdownData(screenLocation, 'main_source', 'full') as {
    options: Array<{value: string; label: string}>;
    placeholder?: string;
    label?: string;
    loading: boolean;
    error: Error | null;
  }

  // Debug dropdown data
  console.log('🔍 MainSourceOfIncome options:', {
    dropdownData: dropdownData,
    options: dropdownData.options,
    currentValue: values.mainSourceOfIncome,
    selectedItem: dropdownData.options?.find(item => item.value === values.mainSourceOfIncome),
    errors: errors.mainSourceOfIncome,
    touched: touched.mainSourceOfIncome,
    errorShowing: touched.mainSourceOfIncome && errors.mainSourceOfIncome
  })

  const handleValueChange = (value: string) => {
    console.log('🔍 MainSourceOfIncome onChange:', { 
      value, 
      currentValue: values.mainSourceOfIncome,
      dropdownOptions: dropdownData.options,
      selectedOption: dropdownData.options?.find(item => item.value === value)
    })
    
    // Prefer validating immediately on selection to clear initial required error
    setFieldValue('mainSourceOfIncome', value, true)

    // Mark as touched without triggering another validation cycle
    setFieldTouched('mainSourceOfIncome', true, false)
  }

  // CRITICAL FIX: Custom error display logic to prevent validation errors on valid selections
  const shouldShowValidationError = (() => {
    // If field is not touched, don't show error
    if (!touched.mainSourceOfIncome) return false
    
    // If no error from Formik, don't show error
    if (!errors.mainSourceOfIncome) return false
    
    // CRITICAL: If we have a valid non-empty value, don't show validation errors
    // This addresses the race condition where Formik validation overrides our manual clear
    const hasValidValue = values.mainSourceOfIncome && 
                         values.mainSourceOfIncome !== '' && 
                         values.mainSourceOfIncome !== null && 
                         values.mainSourceOfIncome !== undefined
    
    if (hasValidValue) {
      console.log('✅ MainSourceOfIncome: Suppressing validation error for valid value:', values.mainSourceOfIncome)
      return false
    }
    
    // For empty/invalid values, show the error normally
    return true
  })()

  return (
    <Column>
      <DropdownMenu
        data={dropdownData.options}
        title={dropdownData.label || getContent('calculate_mortgage_main_source', t('calculate_mortgage_main_source'))}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_main_source_ph', t('calculate_mortgage_main_source_ph'))}
        value={values.mainSourceOfIncome || ''}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('mainSourceOfIncome', true, true)}
        error={shouldShowValidationError ? errors.mainSourceOfIncome : false}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load main source options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default MainSourceOfIncome
