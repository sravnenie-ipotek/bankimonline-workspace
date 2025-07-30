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
    { value: 'option_1', label: getContent(`${screenLocation}_education_option_1`, 'No high school certificate') },
    { value: 'option_2', label: getContent(`${screenLocation}_education_option_2`, 'Partial high school certificate') },
    { value: 'option_3', label: getContent(`${screenLocation}_education_option_3`, 'Full high school certificate') },
    { value: 'option_4', label: getContent(`${screenLocation}_education_option_4`, 'Post-secondary education') },
    { value: 'option_5', label: getContent(`${screenLocation}_education_option_5`, 'Bachelor\'s degree') },
    { value: 'option_6', label: getContent(`${screenLocation}_education_option_6`, 'Master\'s degree') },
    { value: 'option_7', label: getContent(`${screenLocation}_education_option_7`, 'Doctoral degree') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent(`${screenLocation}_education`, 'Education')}
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
