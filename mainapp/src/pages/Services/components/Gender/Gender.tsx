import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface GenderProps {
  screenLocation?: string
}

const Gender = ({ screenLocation = 'personal_data_form' }: GenderProps) => {
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData(screenLocation, 'gender', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading gender dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Gender dropdown error:', dropdownData.error)
  }

  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent('personal_data_gender', 'Gender')}
        placeholder={dropdownData.placeholder || getContent('personal_data_gender_ph', 'Select gender')}
        value={values.gender}
        data={dropdownData.options}
        onChange={(value) => setFieldValue('gender', value)}
        onBlur={() => setFieldTouched('gender', true)}
        error={touched.gender && errors.gender}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load gender options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export { Gender }
