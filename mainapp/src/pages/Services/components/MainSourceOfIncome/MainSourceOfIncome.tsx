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
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

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
    setFieldValue('mainSourceOfIncome', value)
    setFieldTouched('mainSourceOfIncome', true)
    // Force revalidation after setting the value
    setTimeout(() => {
      setFieldTouched('mainSourceOfIncome', true)
    }, 0)
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
