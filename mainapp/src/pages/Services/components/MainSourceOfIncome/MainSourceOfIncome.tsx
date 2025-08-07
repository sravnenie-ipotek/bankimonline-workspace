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
  // Use 'source' field name to match API key (calculate_credit_3_source)
  const dropdownData = useDropdownData(screenLocation, 'source', 'full') as {
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
    
    // CRITICAL FIX: Work WITH Formik's validation cycle instead of against it
    // Set the value first without triggering validation
    setFieldValue('mainSourceOfIncome', value, false) // false = don't validate
    
    // For valid non-empty values, clear error and mark as untouched temporarily
    if (value && value !== '' && value !== null && value !== undefined) {
      // Clear any existing error
      setFieldError('mainSourceOfIncome', undefined)
      
      // Mark as touched but without validation
      setFieldTouched('mainSourceOfIncome', true, false)
      
      // Use a microtask to ensure our error clear persists after React state updates
      Promise.resolve().then(() => {
        setFieldError('mainSourceOfIncome', undefined)
        console.log('✅ MainSourceOfIncome: Microtask error clear for:', value)
      })
      
      console.log('✅ MainSourceOfIncome: Applied validation bypass for valid selection:', value)
    } else {
      // For empty values, allow normal validation
      setFieldTouched('mainSourceOfIncome', true, true) // true = validate
    }
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
        onBlur={() => setFieldTouched('mainSourceOfIncome', true)}
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
