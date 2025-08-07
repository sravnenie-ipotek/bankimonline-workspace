import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'


import { Column } from '@components/ui/Column'
import AddInc from '@components/ui/ContextButtons/AddInc/AddInc.tsx'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface AdditionalIncomeProps {
  screenLocation?: string
  excludeNoIncome?: boolean // For modal context where "no income" option doesn't make sense
}

const AdditionalIncome = ({ screenLocation = 'mortgage_step3', excludeNoIncome = false }: AdditionalIncomeProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, errors, setFieldTouched, touched, setFieldError, validateField } =
    useFormikContext<FormTypes>()

  // Helper function to check if a value indicates "no additional income"
  const checkIfNoAdditionalIncomeValue = (value: string): boolean => {
    if (!value) return false
    const lowerValue = value.toLowerCase()
    return (
      lowerValue === 'option_1' ||
      lowerValue === '1' ||
      lowerValue.includes('no_additional') ||
      lowerValue.includes('no additional') ||
      lowerValue.includes('none')
    )
  }

  // ✅ NEW: Use dropdown API for credit contexts, fallback to content for mortgage
  const isCredit = screenLocation?.includes('credit')
  
  // Get dropdown data for credit contexts
  const dropdownData = isCredit ? useDropdownData(screenLocation, 'has_additional', 'full') : null
  
  // Build options based on context
  const additionalIncomeOptions = isCredit && dropdownData ? 
    dropdownData.options : // Use API data for credit
    Array.from({ length: 7 }, (_, i) => { // Fallback to content for mortgage
      const optionNumber = i + 1
      const contentKey = `calculate_mortgage_has_additional_option_${optionNumber}`
      const fallbackKey = `calculate_mortgage_has_additional_option_${optionNumber}`
      
      return {
        value: `option_${optionNumber}`,
        label: getContent(contentKey, t(fallbackKey))
      }
    }).filter(option => option.label && option.label !== option.value)
  
  // Filter out "No Additional Income" option when used in modal context
  const filteredOptions = excludeNoIncome 
    ? additionalIncomeOptions.filter(option => 
        !checkIfNoAdditionalIncomeValue(option.value) && 
        option.value !== 'no_additional_income'
      )
    : additionalIncomeOptions

  // Debug additional income values
  console.log('🔍 AdditionalIncome debug:', {
    currentValue: values.additionalIncome,
    originalOptions: additionalIncomeOptions,
    filteredOptions: filteredOptions,
    excludeNoIncome: excludeNoIncome,
    isNoAdditionalIncomeValue: checkIfNoAdditionalIncomeValue(values.additionalIncome),
    errors: errors.additionalIncome,
    touched: touched.additionalIncome
  })

  const handleValueChange = (value: string) => {
    console.log('🔍 AdditionalIncome onChange:', { 
      value,
      currentValue: values.additionalIncome,
      isNoAdditionalIncomeValue: checkIfNoAdditionalIncomeValue(value),
      willShowAmountField: !checkIfNoAdditionalIncomeValue(value)
    })
    
    // Additional validation debugging
    console.log('🔍 AdditionalIncome validation debug:', {
      value,
      isEmpty: !value || value === '' || value === null || value === undefined,
      willRequireFields: !checkIfNoAdditionalIncomeValue(value)
    })
    
    // CRITICAL FIX: Work WITH Formik's validation cycle instead of against it
    // Set the value first without triggering validation
    setFieldValue('additionalIncome', value, false) // false = don't validate
    
    // For valid non-empty values, clear error and mark as untouched temporarily
    if (value && value !== '' && value !== null && value !== undefined) {
      // Clear any existing error
      setFieldError('additionalIncome', undefined)
      
      // Mark as touched but without validation
      setFieldTouched('additionalIncome', true, false)
      
      // Use a microtask to ensure our error clear persists after React state updates
      Promise.resolve().then(() => {
        setFieldError('additionalIncome', undefined)
        console.log('✅ AdditionalIncome: Microtask error clear for:', value)
      })
      
      console.log('✅ AdditionalIncome: Applied validation bypass for valid selection:', value)
    } else {
      // For empty values, allow normal validation
      setFieldTouched('additionalIncome', true, true) // true = validate
    }
  }

  // CRITICAL FIX: Custom error display logic to prevent validation errors on valid selections
  const shouldShowValidationError = (() => {
    // If field is not touched, don't show error
    if (!touched.additionalIncome) return false
    
    // If no error from Formik, don't show error
    if (!errors.additionalIncome) return false
    
    // CRITICAL: If we have a valid non-empty value, don't show validation errors
    // This addresses the race condition where Formik validation overrides our manual clear
    const hasValidValue = values.additionalIncome && 
                         values.additionalIncome !== '' && 
                         values.additionalIncome !== null && 
                         values.additionalIncome !== undefined
    
    if (hasValidValue) {
      console.log('✅ AdditionalIncome: Suppressing validation error for valid value:', values.additionalIncome)
      return false
    }
    
    // For empty/invalid values, show the error normally
    return true
  })()

  return (
    <Column>
      <DropdownMenu
        title={isCredit && dropdownData ? 
          dropdownData.label : 
          getContent('calculate_mortgage_has_additional', t('calculate_mortgage_has_additional'))
        }
        placeholder={isCredit && dropdownData ? 
          dropdownData.placeholder : 
          getContent('calculate_mortgage_has_additional_ph', t('calculate_mortgage_has_additional_ph'))
        }
        data={filteredOptions}
        value={values.additionalIncome}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('additionalIncome', true)}
        error={shouldShowValidationError ? errors.additionalIncome : false}
        disabled={isCredit && dropdownData?.loading}
      />
      {isCredit && dropdownData?.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load additional income options. Please refresh the page.')} />
      )}
      <AddInc />
    </Column>
  )
}

export default AdditionalIncome
