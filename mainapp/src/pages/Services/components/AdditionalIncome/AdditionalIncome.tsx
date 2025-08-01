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
}

const AdditionalIncome = ({ screenLocation = 'mortgage_step3' }: AdditionalIncomeProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData(screenLocation, 'additional_income', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading additional income dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Additional income dropdown error:', dropdownData.error)
  }

  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent('calculate_mortgage_has_additional', 'calculate_mortgage_has_additional')}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_has_additional_ph', 'calculate_mortgage_has_additional_ph')}
        data={dropdownData.options}
        value={values.additionalIncome}
        onChange={(value) => setFieldValue('additionalIncome', value)}
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
