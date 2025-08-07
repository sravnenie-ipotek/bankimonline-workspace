import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface OtherBorrowersObligationProps {
  screenLocation?: string
}

const OtherBorrowersObligation = ({ screenLocation = 'other_borrowers' }: OtherBorrowersObligationProps) => {
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
      lowerValue === 'no_obligations' ||
      lowerValue.includes('no_obligation') ||
      lowerValue.includes('no obligation') ||
      lowerValue.includes('none')
    )
  }

  // Use database-driven dropdown data for other-borrowers
  const dropdownData = useDropdownData(screenLocation, 'obligations', 'full')

  // Handle both DropdownData object and DropdownOption[] array
  const isDropdownDataObject = 'loading' in dropdownData
  const dropdownOptions = isDropdownDataObject ? dropdownData.options : dropdownData
  const isLoading = isDropdownDataObject ? dropdownData.loading : false
  const hasError = isDropdownDataObject ? dropdownData.error : null

  // Debug obligation values
  console.log('🔍 OtherBorrowersObligation debug:', {
    currentValue: values.obligation,
    options: dropdownOptions,
    isNoObligationValue: checkIfNoObligationValue(values.obligation),
    errors: errors.obligation,
    touched: touched.obligation,
    screenLocation
  })

  const handleValueChange = (value: string) => {
    console.log('🔍 OtherBorrowersObligation onChange:', { 
      value,
      currentValue: values.obligation,
      isNoObligationValue: checkIfNoObligationValue(value),
      willShowBankFields: !checkIfNoObligationValue(value)
    })
    
    setFieldValue('obligation', value)
    setFieldTouched('obligation', true)
  }

  // Use other-borrowers specific content keys
  const title = getContent('other_borrowers_obligation_title', 'other_borrowers_obligation_title')
  const placeholder = getContent('other_borrowers_obligation_placeholder', 'other_borrowers_obligation_placeholder')

  return (
    <Column>
      <DropdownMenu
        title={title}
        data={dropdownOptions}
        placeholder={placeholder}
        value={values.obligation}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('obligation', true)}
        error={touched.obligation && errors.obligation}
        disabled={isLoading}
      />
      {hasError && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load obligations options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default OtherBorrowersObligation
