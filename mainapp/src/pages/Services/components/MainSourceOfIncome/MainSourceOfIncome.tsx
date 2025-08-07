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

  // ✅ NEW: Use dropdown API for credit contexts, fallback to content for mortgage
  const isCredit = screenLocation?.includes('credit')
  
  // Get dropdown data for credit contexts
  const dropdownData = isCredit ? useDropdownData(screenLocation, 'main_source', 'full') : null
  
  // Build options based on context
  const mainSourceOptions = isCredit && dropdownData ? 
    (Array.isArray(dropdownData) ? dropdownData : dropdownData.options) : // Use API data for credit
    Array.from({ length: 7 }, (_, i) => { // Fallback to content for mortgage
      const optionNumber = i + 1
      const contentKey = `calculate_mortgage_main_source_option_${optionNumber}`
      const fallbackKey = `calculate_mortgage_main_source_option_${optionNumber}`
      
      return {
        value: `option_${optionNumber}`,
        label: getContent(contentKey, t(fallbackKey))
      }
    }).filter(option => option.label && option.label !== option.value)

  // Debug dropdown data
  console.log('🔍 MainSourceOfIncome options:', {
    options: mainSourceOptions,
    currentValue: values.mainSourceOfIncome,
    selectedItem: mainSourceOptions.find(item => item.value === values.mainSourceOfIncome),
    errors: errors.mainSourceOfIncome,
    touched: touched.mainSourceOfIncome,
    errorShowing: touched.mainSourceOfIncome && errors.mainSourceOfIncome
  })

  const handleValueChange = (value: string) => {
    console.log('🔍 MainSourceOfIncome onChange:', { 
      value, 
      currentValue: values.mainSourceOfIncome,
      dropdownOptions: mainSourceOptions,
      selectedOption: mainSourceOptions.find(item => item.value === value)
    })
    
    // Simplified: Let Formik handle validation naturally
    setFieldValue('mainSourceOfIncome', value)
    setFieldTouched('mainSourceOfIncome', true)
    
    console.log('✅ MainSourceOfIncome: Set value and touched:', value)
  }

  // Simplified error display: Let Formik handle validation naturally
  const shouldShowError = touched.mainSourceOfIncome && errors.mainSourceOfIncome

  return (
    <Column>
      <DropdownMenu
        data={mainSourceOptions}
        title={isCredit && dropdownData && !Array.isArray(dropdownData) ? 
          dropdownData.label : 
          getContent('calculate_mortgage_main_source', t('calculate_mortgage_main_source'))
        }
        placeholder={isCredit && dropdownData && !Array.isArray(dropdownData) ? 
          dropdownData.placeholder : 
          getContent('calculate_mortgage_main_source_ph', t('calculate_mortgage_main_source_ph'))
        }
        value={values.mainSourceOfIncome || ''}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('mainSourceOfIncome', true)}
        error={shouldShowError}
        disabled={isCredit && dropdownData && !Array.isArray(dropdownData) && dropdownData.loading}
      />
      {isCredit && dropdownData && !Array.isArray(dropdownData) && dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load main source options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default MainSourceOfIncome
