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
      lowerValue.includes('no_obligation') ||
      lowerValue.includes('no obligation') ||
      lowerValue.includes('none')
    )
  }

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
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
    
    // Just set the value - let Formik handle validation naturally
    setFieldValue('obligation', value)
    
    // Mark as touched only after value is set
    setFieldTouched('obligation', true)
  }

  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent('calculate_mortgage_obligations', 'Obligations')}
        data={dropdownData.options}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_obligations_ph', 'Select obligation type')}
        value={values.obligation}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('obligation')}
        error={touched.obligation && errors.obligation}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load obligations options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default Obligation
