import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Column } from '@src/components/ui/Column'

import { FormTypes } from '../../types/formTypes'

interface EducationProps {
  screenLocation?: string
}

const Education = ({ screenLocation = 'mortgage_step2' }: EducationProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // Use the correct database keys that actually exist
  const EducationSelectOptions = [
    { value: 'no_high_school_diploma', label: getContent(`${screenLocation}.field.education_no_high_school_diploma`, 'No high school certificate') },
    { value: 'partial_high_school_diploma', label: getContent(`${screenLocation}.field.education_partial_high_school_diploma`, 'Partial high school certificate') },
    { value: 'full_high_school_diploma', label: getContent(`${screenLocation}.field.education_full_high_school_diploma`, 'Full high school certificate') },
    { value: 'postsecondary_education', label: getContent(`${screenLocation}.field.education_postsecondary_education`, 'Post-secondary education') },
    { value: 'bachelors', label: getContent(`${screenLocation}.field.education_bachelors`, 'Bachelor\'s degree') },
    { value: 'masters', label: getContent(`${screenLocation}.field.education_masters`, 'Master\'s degree') },
    { value: 'doctorate', label: getContent(`${screenLocation}.field.education_doctorate`, 'Doctoral degree') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent(`${screenLocation}.field.education`, 'Education')}
        placeholder={getContent(`${screenLocation}.field.education_ph`, 'Select education level')}
        value={values.education}
        data={EducationSelectOptions}
        onChange={(value) => setFieldValue('education', value)}
        onBlur={() => setFieldTouched('education', true)}
        error={touched.education && errors.education}
      />
    </Column>
  )
}

export default Education
