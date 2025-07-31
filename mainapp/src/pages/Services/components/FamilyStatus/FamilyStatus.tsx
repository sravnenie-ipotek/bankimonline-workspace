import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

const FamilyStatus = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, touched, errors, setFieldTouched } =
    useFormikContext<FormTypes>()

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData('mortgage_step2', 'family_status', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading family status dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Family status dropdown error:', dropdownData.error)
  }

  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent('calculate_mortgage_family_status', 'calculate_mortgage_family_status')}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_family_status_ph', 'calculate_mortgage_family_status_ph')}
        value={values.familyStatus}
        data={dropdownData.options}
        onChange={(value) => setFieldValue('familyStatus', value)}
        onBlur={() => setFieldTouched('familyStatus', true)}
        error={touched.familyStatus && errors.familyStatus}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error="Failed to load family status options. Please refresh the page." />
      )}
    </Column>
  )
}

export default FamilyStatus
