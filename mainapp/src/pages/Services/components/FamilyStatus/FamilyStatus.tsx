import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const FamilyStatus = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, touched, errors, setFieldTouched } =
    useFormikContext<FormTypes>()

  const FamilyStatusOptions = [
    {
      value: 'option_1',
      label: getContent('calculate_mortgage_family_status_option_1', 'calculate_mortgage_family_status_option_1'),
    },
    {
      value: 'option_2',
      label: getContent('calculate_mortgage_family_status_option_2', 'calculate_mortgage_family_status_option_2'),
    },
    {
      value: 'option_3',
      label: getContent('calculate_mortgage_family_status_option_3', 'calculate_mortgage_family_status_option_3'),
    },
    {
      value: 'option_4',
      label: getContent('calculate_mortgage_family_status_option_4', 'calculate_mortgage_family_status_option_4'),
    },
    {
      value: 'option_5',
      label: getContent('calculate_mortgage_family_status_option_5', 'calculate_mortgage_family_status_option_5'),
    },
    {
      value: 'option_6',
      label: getContent('calculate_mortgage_family_status_option_6', 'calculate_mortgage_family_status_option_6'),
    },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent('calculate_mortgage_family_status', 'calculate_mortgage_family_status')}
        placeholder={getContent('calculate_mortgage_family_status_ph', 'calculate_mortgage_family_status_ph')}
        value={values.familyStatus}
        data={FamilyStatusOptions}
        onChange={(value) => setFieldValue('familyStatus', value)}
        onBlur={() => setFieldTouched('familyStatus', true)}
        error={touched.familyStatus && errors.familyStatus}
      />
    </Column>
  )
}

export default FamilyStatus
