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

  // ✅ UPDATED: Follow systemTranslationLogic.md - use database-first approach for all contexts
  // Use 'source' field name to match API key (calculate_credit_3_source)
  const dropdownData = useDropdownData(screenLocation, 'source', 'full') as {
    options: Array<{value: string; label: string}>;
    placeholder?: string;
    label?: string;
    loading: boolean;
    error: Error | null;
  }

  // Keep fallback for mortgage contexts that might not have database dropdown data
  const mainSourceOptions = (screenLocation?.includes('credit') && dropdownData?.options?.length > 0) 
    ? dropdownData.options 
    : Array.from({ length: 7 }, (_, i) => {
        const optionNumber = i + 1
        const contentKey = `calculate_mortgage_main_source_option_${optionNumber}`
        const fallbackKey = `calculate_mortgage_main_source_option_${optionNumber}`
        
        return {
          value: `option_${optionNumber}`,
          label: getContent(contentKey, t(fallbackKey))
        }
      }).filter(option => option.label && option.label !== option.value) // Filter out missing options

  // Debug dropdown data
  ,
    errors: errors.mainSourceOfIncome,
    touched: touched.mainSourceOfIncome,
    errorShowing: touched.mainSourceOfIncome && errors.mainSourceOfIncome
  })

  const handleValueChange = (value: string) => {
    })
    
    // Additional validation debugging
    ,
      willRequireFields: !checkIfNoIncomeValue(value)
    })
    
    // Set value and validate immediately to clear any initial required error
    setFieldValue('mainSourceOfIncome', value, true)
    
    // Mark as touched without triggering another validation cycle
    setFieldTouched('mainSourceOfIncome', true, false)
  }

  return (
    <Column>
      <DropdownMenu
        data={mainSourceOptions}
        title={(screenLocation?.includes('credit') && dropdownData?.label) ? dropdownData.label : getContent('calculate_mortgage_main_source', t('calculate_mortgage_main_source'))}
        placeholder={(screenLocation?.includes('credit') && dropdownData?.placeholder) ? dropdownData.placeholder : getContent('calculate_mortgage_main_source_ph', t('calculate_mortgage_main_source_ph'))}
        value={values.mainSourceOfIncome || ''}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('mainSourceOfIncome', true, true)}
        error={touched.mainSourceOfIncome && errors.mainSourceOfIncome}
        disabled={screenLocation?.includes('credit') && dropdownData?.loading}
      />
      {screenLocation?.includes('credit') && dropdownData?.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load main source options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default MainSourceOfIncome
