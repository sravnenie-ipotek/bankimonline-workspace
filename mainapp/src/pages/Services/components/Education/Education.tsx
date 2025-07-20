import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Column } from '@src/components/ui/Column'

import { FormTypes } from '../../types/formTypes'

const Education = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  const EducationSelectOptions = [
    { value: 'option_1', label: getContent('calculate_mortgage_education_option_1', 'calculate_mortgage_education_option_1') },
    { value: 'option_2', label: getContent('calculate_mortgage_education_option_2', 'calculate_mortgage_education_option_2') },
    { value: 'option_3', label: getContent('calculate_mortgage_education_option_3', 'calculate_mortgage_education_option_3') },
    { value: 'option_4', label: getContent('calculate_mortgage_education_option_4', 'calculate_mortgage_education_option_4') },
    { value: 'option_5', label: getContent('calculate_mortgage_education_option_5', 'calculate_mortgage_education_option_5') },
    { value: 'option_6', label: getContent('calculate_mortgage_education_option_6', 'calculate_mortgage_education_option_6') },
    { value: 'option_7', label: getContent('calculate_mortgage_education_option_7', 'calculate_mortgage_education_option_7') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent('calculate_mortgage_education', 'calculate_mortgage_education')}
        placeholder={getContent('calculate_mortgage_education_ph', 'calculate_mortgage_education_ph')}
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
