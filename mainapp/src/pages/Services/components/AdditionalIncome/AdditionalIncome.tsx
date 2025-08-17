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
  const { values, setFieldValue, errors, setFieldTouched, touched, setFieldError } =
    useFormikContext<FormTypes>()

  // Helper function to check if a value indicates "no additional income"
  const checkIfNoAdditionalIncomeValue = (value: string): boolean => {
    if (!value) return false
    const lowerValue = value.toLowerCase()
    return (
      // English patterns
      lowerValue === 'option_1' ||
      lowerValue === '1' ||
      lowerValue.includes('no_additional') ||
      lowerValue.includes('no additional') ||
      lowerValue.includes('none') ||
      lowerValue === 'no_additional_income' ||
      
      // Hebrew patterns - CRITICAL FIX for Hebrew interface
      value.includes('אין הכנסות נוספות') ||        // "No additional income" in Hebrew
      value.includes('אין הכנסות') ||               // "No income" in Hebrew
      value.includes('ללא הכנסות נוספות') ||         // "Without additional income" in Hebrew
      value.includes('ללא הכנסות') ||               // "Without income" in Hebrew
      lowerValue.includes('ein') ||                 // Hebrew romanized
      lowerValue.includes('לא') ||                  // "No" in Hebrew
      
      // Numeric patterns for database values
      lowerValue === '1' ||                         // Often first option
      lowerValue.startsWith('option_') && lowerValue.endsWith('1')
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
    
    // Set the additional income value
    setFieldValue('additionalIncome', value)
    setFieldTouched('additionalIncome', true)
    
    // CRITICAL FIX: Clear dependent field AND validation state when "no additional income" is selected
    if (checkIfNoAdditionalIncomeValue(value) || value === 'no_additional_income') {
      // Clear field value
      setFieldValue('additionalIncomeAmount', null)
      
      // CRITICAL: Clear touched state and validation errors
      setFieldTouched('additionalIncomeAmount', false)
      setFieldError('additionalIncomeAmount', undefined)
      
      console.log('✅ Cleared additionalIncomeAmount field and validation state for "no additional income"')
    }
    
    // Clear any existing error for the dropdown itself
    setFieldError('additionalIncome', undefined)
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
