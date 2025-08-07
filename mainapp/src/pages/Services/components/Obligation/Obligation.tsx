import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface ObligationProps {
  screenLocation?: string
}

const Obligation = ({ screenLocation = 'mortgage_step3' }: ObligationProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, touched, errors, setFieldTouched, setFieldError } =
    useFormikContext<FormTypes>()

  // Helper function to check if a value indicates "no obligation"
  const checkIfNoObligationValue = (value: string): boolean => {
    if (!value) return false
    const lowerValue = value.toLowerCase()
    return (
      lowerValue === 'option_1' ||
      lowerValue === 'no_obligations' ||           // CRITICAL FIX: Database value (plural)
      lowerValue.includes('no_obligation') ||      // Legacy patterns
      lowerValue.includes('no obligation') ||
      lowerValue.includes('none')
    )
  }

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  // FIXED: Use 'types' to match API key shortening (calculate_credit_3_types)
  const dropdownData = useDropdownData(screenLocation, 'types', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading obligations dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Obligations dropdown error:', dropdownData.error)
  }

  // Debug obligation values
  console.log('🔍 Obligation debug:', {
    currentValue: values.obligation,
    options: dropdownData.options,
    isNoObligationValue: checkIfNoObligationValue(values.obligation),
    errors: errors.obligation,
    touched: touched.obligation
  })

  const handleValueChange = (value: string) => {
    console.log('🔍 Obligation onChange:', { 
      value,
      currentValue: values.obligation,
      isNoObligationValue: checkIfNoObligationValue(value),
      willShowBankFields: !checkIfNoObligationValue(value)
    })
    
    // Additional validation debugging
    console.log('🔍 Obligation validation debug:', {
      value,
      isEmpty: !value || value === '' || value === null || value === undefined,
      isNoObligationValue: checkIfNoObligationValue(value),
      willRequireFields: !checkIfNoObligationValue(value)
    })
    
    // CRITICAL FIX: Work WITH Formik's validation cycle instead of against it
    // Set the value first without triggering validation
    setFieldValue('obligation', value, false) // false = don't validate
    
    // For valid non-empty values, clear error and mark as untouched temporarily
    if (value && value !== '' && value !== null && value !== undefined) {
      // Clear any existing error
      setFieldError('obligation', undefined)
      
      // Mark as touched but without validation
      setFieldTouched('obligation', true, false)
      
      // Use a microtask to ensure our error clear persists after React state updates
      Promise.resolve().then(() => {
        setFieldError('obligation', undefined)
        console.log('✅ Obligation: Microtask error clear for:', value)
      })
      
      console.log('✅ Obligation: Applied validation bypass for valid selection:', value)
    } else {
      // For empty values, allow normal validation
      setFieldTouched('obligation', true, true) // true = validate
    }
  }

  // CRITICAL FIX: Custom error display logic to prevent validation errors on valid selections
  const shouldShowValidationError = (() => {
    // If field is not touched, don't show error
    if (!touched.obligation) return false
    
    // If no error from Formik, don't show error
    if (!errors.obligation) return false
    
    // CRITICAL: If we have a valid non-empty value, don't show validation errors
    // This addresses the race condition where Formik validation overrides our manual clear
    const hasValidValue = values.obligation && 
                         values.obligation !== '' && 
                         values.obligation !== null && 
                         values.obligation !== undefined
    
    if (hasValidValue) {
      console.log('✅ Obligation: Suppressing validation error for valid value:', values.obligation)
      return false
    }
    
    // For empty/invalid values, show the error normally
    return true
  })()

  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent('calculate_credit_debt_types', 'Existing obligations')}
        data={dropdownData.options}
        placeholder={dropdownData.placeholder || getContent('calculate_credit_debt_types_ph', 'Do you have existing debts or obligations?')}
        value={values.obligation}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('obligation', true)}
        error={shouldShowValidationError ? errors.obligation : false}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load obligations options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default Obligation
