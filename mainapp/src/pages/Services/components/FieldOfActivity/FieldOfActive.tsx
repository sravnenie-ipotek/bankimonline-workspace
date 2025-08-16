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
    ? 'refinance_step3'
    : location.pathname.includes('other-borrowers')
    ? 'other_borrowers_step2'
    : location.pathname.includes('borrowers-personal-data')
    ? 'other_borrowers_step2'
    : 'credit_step3'

  const { getContent } = useContentApi(resolvedScreenLocation)
  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  // Phase 4: Use database-driven dropdown data instead of hardcoded array  
  // SCREEN INDEPENDENCE: Each screen uses the field name that exists in its API data
  // mortgage_step3 → field_of_activity (14 options), credit_step3 → professional_sphere (14 options)
  // This ensures NO cross-screen contamination - each screen is independent
  const getFieldNameForScreen = (screenLocation: string): string => {
    if (screenLocation === 'other_borrowers_step2') return 'field_of_activity'
    if (screenLocation === 'mortgage_step3') return 'field_of_activity'
    if (screenLocation === 'refinance_step3') return 'field_of_activity' 
    return 'professional_sphere' // credit_step3 and others
  }
  
  const fieldName = getFieldNameForScreen(resolvedScreenLocation)

  const dropdownData = useDropdownData(resolvedScreenLocation, fieldName, 'full') as {
    options: Array<{value: string; label: string}>;
    placeholder?: string;
    label?: string;
    loading: boolean;
    error: Error | null;
  }

  // Field of Activity component correctly configured for dropdown data
  // Uses screenLocation prop when provided, otherwise auto-detects from URL path

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    }

  if (dropdownData.error) {
    console.warn('❌ Field of activity dropdown error:', dropdownData.error)
  }

  return (
    <Column>
      <DropdownMenu
        data={dropdownData.options}
        title={dropdownData.label || getContent('calculate_credit_professional_sphere', 'תחום מקצועי')}
        placeholder={dropdownData.placeholder || getContent('calculate_credit_professional_sphere_ph', 'בחר תחום מקצועי')}
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
        <Error error={getContent('error_dropdown_load_failed', 'טעינת אפשרויות התחום המקצועי נכשלה. אנא רענן את הדף.')} />
      )}
    </Column>
  )
}

export default FieldOfActivity
