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

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData(screenLocation, 'additional_income', 'full')
  
  // Filter out "No Additional Income" option when used in modal context
  const filteredOptions = excludeNoIncome 
    ? dropdownData.options.filter(option => 
        !checkIfNoAdditionalIncomeValue(option.value) && 
        option.value !== 'no_additional_income'
      )
    : dropdownData.options

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading additional income dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Additional income dropdown error:', dropdownData.error)
  }

  // Debug additional income values
  console.log('🔍 AdditionalIncome debug:', {
    currentValue: values.additionalIncome,
    originalOptions: dropdownData.options,
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
    
    // Just set the value - let Formik handle validation naturally
    setFieldValue('additionalIncome', value)
    
    // Mark as touched only after value is set
    setFieldTouched('additionalIncome', true)
  }

  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent('calculate_mortgage_has_additional', 'calculate_mortgage_has_additional')}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_has_additional_ph', 'calculate_mortgage_has_additional_ph')}
        data={filteredOptions}
        value={values.additionalIncome}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('additionalIncome')}
        error={touched.additionalIncome && errors.additionalIncome}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load additional income options. Please refresh the page.')} />
      )}
      <AddInc />
    </Column>
  )
}

export default AdditionalIncome
