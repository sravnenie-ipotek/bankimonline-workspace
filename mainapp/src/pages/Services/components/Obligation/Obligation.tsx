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
  const { values, setFieldValue, touched, errors, setFieldTouched } =
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
  // FIXED: Use 'obligations' to match API-generated key (mortgage_step3_obligations)
  const dropdownData = useDropdownData(screenLocation, 'obligations', 'full')

  // Handle both DropdownData object and DropdownOption[] array
  const isDropdownDataObject = 'loading' in dropdownData
  const dropdownOptions = isDropdownDataObject ? dropdownData.options : dropdownData
  const isLoading = isDropdownDataObject ? dropdownData.loading : false
  const hasError = isDropdownDataObject ? dropdownData.error : null
  const dropdownLabel = isDropdownDataObject ? dropdownData.label : null
  const dropdownPlaceholder = isDropdownDataObject ? dropdownData.placeholder : null

  // Phase 4: Handle loading and error states
  if (isLoading) {
    console.log('🔄 Loading obligations dropdown options...')
  }

  if (hasError) {
    console.warn('❌ Obligations dropdown error:', hasError)
  }

  // Debug obligation values
  console.log('🔍 Obligation debug:', {
    currentValue: values.obligation,
    options: dropdownOptions,
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
    
    // Simplified: Let Formik handle validation naturally
    setFieldValue('obligation', value)
    setFieldTouched('obligation', true)
    
    console.log('✅ Obligation: Set value and touched:', value)
  }

  // Simplified error display: Let Formik handle validation naturally
  const shouldShowError = touched.obligation && errors.obligation

  // Determine if we're in other-borrowers context by checking the URL
  const isOtherBorrowersContext = window.location.pathname.includes('other-borrowers')
  
  // Use different content keys for other-borrowers context
  const title = isOtherBorrowersContext 
    ? getContent('other_borrowers_obligation_title', 'other_borrowers_obligation_title')
    : dropdownLabel || getContent('calculate_mortgage_debt_types', 'calculate_mortgage_debt_types')
  
  const placeholder = isOtherBorrowersContext
    ? getContent('other_borrowers_obligation_placeholder', 'other_borrowers_obligation_placeholder')
    : dropdownPlaceholder || getContent('calculate_mortgage_debt_types_ph', 'calculate_mortgage_debt_types_ph')

  return (
    <Column>
      <DropdownMenu
        title={title}
        data={dropdownOptions}
        placeholder={placeholder}
        value={values.obligation}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('obligation', true)}
        error={shouldShowError}
        disabled={isLoading}
      />
      {hasError && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load obligations options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default Obligation
