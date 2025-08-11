import { useFormikContext } from 'formik'
import { useLocation } from 'react-router-dom'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { FormTypes } from '../../types/formTypes'

interface FieldOfActivityProps {
  screenLocation?: string
}

const FieldOfActivity = ({ screenLocation }: FieldOfActivityProps) => {
  const location = useLocation()
  const resolvedScreenLocation = screenLocation
    ? screenLocation
    : location.pathname.includes('calculate-mortgage')
    ? 'mortgage_step3'
    : location.pathname.includes('refinance-mortgage')
    ? 'refinance_mortgage_3'
    : 'calculate_credit_3'

  const { getContent } = useContentApi(resolvedScreenLocation)
  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  // FIXED: Use 'activity' to match API key shortening (calculate_credit_3_activity)
  const dropdownData = useDropdownData(resolvedScreenLocation, 'activity', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading field of activity dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Field of activity dropdown error:', dropdownData.error)
  }

  return (
    <Column>
      <DropdownMenu
        data={dropdownData.options}
        title={dropdownData.label || getContent('calculate_mortgage_field_of_activity', 'Field of Activity')}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_field_of_activity_ph', 'Select field of activity')}
        searchable
        searchPlaceholder={getContent('search', 'Search...')}
        value={values.fieldOfActivity}
        onChange={(value) => {
          setFieldValue('fieldOfActivity', value, true)
          setFieldTouched('fieldOfActivity', true, false)
        }}
        onBlur={() => setFieldTouched('fieldOfActivity', true, true)}
        error={touched.fieldOfActivity && errors.fieldOfActivity}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load field of activity options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default FieldOfActivity
