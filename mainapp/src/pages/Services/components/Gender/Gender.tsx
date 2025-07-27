import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const Gender = () => {
  const { getContent } = useContentApi('personal_data_form')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  const GenderOptions = [
    { value: 'male', label: getContent('personal_data_gender_option_1', 'Male') },
    { value: 'female', label: getContent('personal_data_gender_option_2', 'Female') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent('personal_data_gender', 'Gender')}
        placeholder={getContent('personal_data_gender_ph', 'Select gender')}
        value={values.gender}
        data={GenderOptions}
        onChange={(value) => setFieldValue('gender', value)}
        onBlur={() => setFieldTouched('gender', true)}
        error={touched.gender && errors.gender}
      />
    </Column>
  )
}

export { Gender }
