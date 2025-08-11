import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

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

  // Use database-driven content approach (consistent with system translation logic)
  const additionalIncomeOptions = [
    { value: 'option_1', label: getContent('calculate_mortgage_has_additional_option_1', t('calculate_mortgage_has_additional_option_1')) },
    { value: 'option_2', label: getContent('calculate_mortgage_has_additional_option_2', t('calculate_mortgage_has_additional_option_2')) },
    { value: 'option_3', label: getContent('calculate_mortgage_has_additional_option_3', t('calculate_mortgage_has_additional_option_3')) },
    { value: 'option_4', label: getContent('calculate_mortgage_has_additional_option_4', t('calculate_mortgage_has_additional_option_4')) },
    { value: 'option_5', label: getContent('calculate_mortgage_has_additional_option_5', t('calculate_mortgage_has_additional_option_5')) },
    { value: 'option_6', label: getContent('calculate_mortgage_has_additional_option_6', t('calculate_mortgage_has_additional_option_6')) },
    { value: 'option_7', label: getContent('calculate_mortgage_has_additional_option_7', t('calculate_mortgage_has_additional_option_7')) }
  ]
  
  // Filter out "No Additional Income" option when used in modal context
  const filteredOptions = excludeNoIncome 
    ? additionalIncomeOptions.filter(option => 
        !checkIfNoAdditionalIncomeValue(option.value) && 
        option.value !== 'no_additional_income'
      )
    : additionalIncomeOptions

  // Debug additional income values
  console.log('🔍 AdditionalIncome debug:', {
    currentValue: values.additionalIncome,
    originalOptions: additionalIncomeOptions,
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
    
    // Set value and validate immediately to clear initial required error
    setFieldValue('additionalIncome', value, true)
    
    // Mark as touched without triggering another validation cycle
    setFieldTouched('additionalIncome', true, false)
  }

  return (
    <Column>
      <DropdownMenu
        title={getContent('calculate_mortgage_has_additional', t('calculate_mortgage_has_additional'))}
        placeholder={getContent('calculate_mortgage_has_additional_ph', t('calculate_mortgage_has_additional_ph'))}
        data={filteredOptions}
        value={values.additionalIncome}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('additionalIncome', true, true)}
        error={touched.additionalIncome && errors.additionalIncome}
      />
      <AddInc />
    </Column>
  )
}

export default AdditionalIncome
