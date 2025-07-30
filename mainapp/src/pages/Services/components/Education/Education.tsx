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

  const EducationSelectOptions = [
    { value: 'no_certificate', label: getContent(`${screenLocation}_education_no_certificate`, 'No high school certificate') },
    { value: 'partial_certificate', label: getContent(`${screenLocation}_education_partial_certificate`, 'Partial high school certificate') },
    { value: 'full_certificate', label: getContent(`${screenLocation}_education_full_certificate`, 'Full high school certificate') },
    { value: 'post_secondary', label: getContent(`${screenLocation}_education_post_secondary`, 'Post-secondary education') },
    { value: 'bachelors', label: getContent(`${screenLocation}_education_bachelors`, 'Bachelor\'s degree') },
    { value: 'masters', label: getContent(`${screenLocation}_education_masters`, 'Master\'s degree') },
    { value: 'doctorate', label: getContent(`${screenLocation}_education_doctorate`, 'Doctoral degree') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent(`${screenLocation}_education_label`, 'Education')}
        placeholder={getContent(`${screenLocation}_education_ph`, 'Select education level')}
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
