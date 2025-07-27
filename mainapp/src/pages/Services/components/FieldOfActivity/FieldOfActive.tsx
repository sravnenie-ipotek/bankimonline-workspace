import { useFormikContext } from 'formik'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { useContentApi } from '@src/hooks/useContentApi'

import { FormTypes } from '../../types/formTypes'

const FieldOfActivity = () => {
  const { getContent } = useContentApi('mortgage_step3')

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  const FieldOfActivityOptions = [
    { value: 'option_1', label: getContent('field_of_activity_option_1', 'Agriculture, Forestry, Fishing') },
    { value: 'option_2', label: getContent('field_of_activity_option_2', 'Technology and Communications') },
    { value: 'option_3', label: getContent('field_of_activity_option_3', 'Healthcare and Social Services') },
    { value: 'option_4', label: getContent('field_of_activity_option_4', 'Education and Training') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent('field_of_activity_label', 'Field of Activity')}
        placeholder={getContent('field_of_activity_placeholder', 'Select field of activity')}
        searchable
        searchPlaceholder={getContent('search_placeholder', 'Search...')}
        value={values.fieldOfActivity}
        onChange={(value) => setFieldValue('fieldOfActivity', value)}
        onBlur={() => setFieldTouched('fieldOfActivity')}
        error={touched.fieldOfActivity && errors.fieldOfActivity}
        data={FieldOfActivityOptions}
      />
    </Column>
  )
}

export default FieldOfActivity
