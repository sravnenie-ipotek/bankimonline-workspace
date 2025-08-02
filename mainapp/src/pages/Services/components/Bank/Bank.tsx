import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface BankProps {
  screenLocation?: string
}

const Bank = ({ screenLocation = 'mortgage_step3' }: BankProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)
  const { getContent: getCommonContent } = useContentApi('common')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData(screenLocation, 'bank', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading bank dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Bank dropdown error:', dropdownData.error)
  }

  // Use obligation-specific content when in obligation context
  const isObligationContext = screenLocation === 'mortgage_step3' && values.obligation
  const title = isObligationContext 
    ? getCommonContent('obligation_bank_title', 'Bank Lender')
    : (dropdownData.label || getContent('calculate_mortgage_bank', t('calculate_mortgage_bank')))
  const placeholder = isObligationContext
    ? getCommonContent('obligation_bank_placeholder', 'Select bank')
    : (dropdownData.placeholder || getContent('calculate_mortgage_bank_ph', t('calculate_mortgage_bank')))

  return (
    <Column>
      <DropdownMenu
        title={title}
        placeholder={placeholder}
        data={dropdownData.options}
        value={values.bank}
        onChange={(value) => setFieldValue('bank', value)}
        onBlur={() => setFieldTouched('bank')}
        error={touched.bank && errors.bank}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load bank options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default Bank
