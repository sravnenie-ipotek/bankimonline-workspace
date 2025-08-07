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
    
    // Simplified: Let Formik handle validation naturally
    setFieldValue('obligation', value)
    setFieldTouched('obligation', true)
    
    console.log('✅ Obligation: Set value and touched:', value)
  }

  // Simplified error display: Let Formik handle validation naturally
  const shouldShowError = touched.obligation && errors.obligation

  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent('calculate_mortgage_debt_types', 'Existing obligations')}
        data={dropdownData.options}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_debt_types_ph', 'Do you have existing debts or obligations?')}
        value={values.obligation}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('obligation', true)}
        error={shouldShowError}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load obligations options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default Obligation
