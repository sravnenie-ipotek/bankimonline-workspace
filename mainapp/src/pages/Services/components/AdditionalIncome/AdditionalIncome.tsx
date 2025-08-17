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

  // ✅ FIXED: Use dropdown API for all screen contexts (mortgage, credit, refinance)
  // This ensures consistent data source and eliminates content key mapping issues
  const isCredit = screenLocation?.includes('credit')
  const isRefinance = screenLocation?.includes('refinance')
  const dropdownData = useDropdownData(screenLocation, 'additional_income', 'full')
  
  // Build options from dropdown API for all contexts
  const additionalIncomeOptions = dropdownData?.options || []
  
  // Filter out "No Additional Income" option when used in modal context
  const filteredOptions = excludeNoIncome 
    ? additionalIncomeOptions.filter(option => 
        !checkIfNoAdditionalIncomeValue(option.value) && 
        option.value !== 'no_additional_income'
      )
    : additionalIncomeOptions

  // Debug additional income values
  console.log('Additional income debug:', {
    errors: errors.additionalIncome,
    touched: touched.additionalIncome
  })

  const handleValueChange = (value: string) => {
    console.log('Additional income value changed:', {
      value,
      willShowAmountField: !checkIfNoAdditionalIncomeValue(value)
    })
    
    // CRITICAL FIX: Work WITH Formik's validation cycle instead of against it
    // Set the value first without triggering validation
    setFieldValue('additionalIncome', value, false) // false = don't validate
    
    // Clear dependent field when "no additional income" is selected
    if (checkIfNoAdditionalIncomeValue(value) || value === 'no_additional_income') {
      setFieldValue('additionalIncomeAmount', null)
    }
    
    // For valid non-empty values, clear error and mark as untouched temporarily
    if (value && value !== '' && value !== null && value !== undefined) {
      // Clear any existing error
      setFieldError('additionalIncome', undefined)
      
      // Mark as touched but without validation
      setFieldTouched('additionalIncome', true, false)
      
      // Use a microtask to ensure our error clear persists after React state updates
      Promise.resolve().then(() => {
        setFieldError('additionalIncome', undefined)
      })
      
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
      return false
    }
    
    // For empty/invalid values, show the error normally
    return true
  })()

  return (
    <Column>
      <DropdownMenu
        title={(isCredit || isRefinance) && dropdownData ? 
          dropdownData.label : 
          getContent('calculate_mortgage_has_additional', t('calculate_mortgage_has_additional'))
        }
        placeholder={(isCredit || isRefinance) && dropdownData ? 
          dropdownData.placeholder : 
          getContent('calculate_mortgage_has_additional_ph', t('calculate_mortgage_has_additional_ph'))
        }
        data={filteredOptions}
        value={values.additionalIncome}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('additionalIncome', true)}
        error={shouldShowValidationError ? errors.additionalIncome : false}
        disabled={(isCredit || isRefinance) && dropdownData?.loading}
      />
      {(isCredit || isRefinance) && dropdownData?.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load additional income options. Please refresh the page.')} />
      )}
      <AddInc />
    </Column>
  )
}

export default AdditionalIncome
