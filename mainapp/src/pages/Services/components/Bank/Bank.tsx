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
  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent('calculate_mortgage_bank', t('calculate_mortgage_bank'))}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_bank_ph', t('calculate_mortgage_bank'))}
        data={dropdownData.options}
        value={values.bank}
        onChange={(value) => setFieldValue('bank', value)}
        onBlur={() => setFieldTouched('bank')}
        error={touched.bank && errors.bank}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error="Failed to load bank options. Please refresh the page." />
      )}
    </Column>
  )
}

export default Bank
