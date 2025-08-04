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

  // Helper function to check if a value indicates "no income" or "unemployed"
  const checkIfNoIncomeValue = (value: string): boolean => {
    if (!value) return false
    const lowerValue = value.toLowerCase()
    return (
      lowerValue.includes('unemployed') ||
      lowerValue.includes('no_income') || 
      lowerValue.includes('no income') ||
      lowerValue.includes('option_5') ||
      lowerValue.includes('option_6') ||
      lowerValue.includes('main_source_income_option_5') ||
      lowerValue.includes('main_source_income_option_6')
    )
  }

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData(screenLocation, 'main_source', 'full') as any

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading main source of income dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Main source of income dropdown error:', dropdownData.error)
  }

  // Debug dropdown data
  console.log('🔍 MainSourceOfIncome dropdown data:', {
    options: dropdownData.options,
    placeholder: dropdownData.placeholder,
    label: dropdownData.label,
    currentValue: values.mainSourceOfIncome,
    selectedItem: dropdownData.options.find(item => item.value === values.mainSourceOfIncome),
    errors: errors.mainSourceOfIncome,
    touched: touched.mainSourceOfIncome,
    errorShowing: touched.mainSourceOfIncome && errors.mainSourceOfIncome
  })

  const handleValueChange = (value: string) => {
    console.log('🔍 MainSourceOfIncome onChange:', { 
      value, 
      currentValue: values.mainSourceOfIncome,
      dropdownOptions: dropdownData.options,
      selectedOption: dropdownData.options.find(item => item.value === value)
    })
    
    // Additional validation debugging
    console.log('🔍 MainSourceOfIncome validation debug:', {
      value,
      isEmpty: !value || value === '' || value === null || value === undefined,
      isNoIncomeValue: checkIfNoIncomeValue(value),
      willRequireFields: !checkIfNoIncomeValue(value)
    })
    
    // Just set the value - let Formik handle validation naturally
    setFieldValue('mainSourceOfIncome', value)
    
    // Mark as touched only after value is set
    setFieldTouched('mainSourceOfIncome', true)
  }

  return (
    <Column>
      <DropdownMenu
        data={dropdownData.options || []}
        title={dropdownData.label || getContent('calculate_mortgage_main_source', 'calculate_mortgage_main_source')}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_main_source_ph', 'calculate_mortgage_main_source_ph')}
        value={values.mainSourceOfIncome || ''}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('mainSourceOfIncome', true)}
        error={touched.mainSourceOfIncome && errors.mainSourceOfIncome}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load main source of income options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default MainSourceOfIncome
