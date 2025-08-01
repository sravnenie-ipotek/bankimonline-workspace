import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Column } from '@src/components/ui/Column'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface EducationProps {
  screenLocation?: string
}

const Education = ({ screenLocation = 'mortgage_step2' }: EducationProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData(screenLocation, 'education', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading education dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Education dropdown error:', dropdownData.error)
  }

  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent(`${screenLocation}.field.education`, 'Education')}
        placeholder={dropdownData.placeholder || getContent(`${screenLocation}.field.education_ph`, 'Select education level')}
        value={values.education}
        data={dropdownData.options}
        onChange={(value) => setFieldValue('education', value)}
        onBlur={() => setFieldTouched('education', true)}
        error={touched.education && errors.education}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load education options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default Education
