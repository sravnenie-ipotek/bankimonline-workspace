import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const PropertyOwnership = () => {
  const { getContent } = useContentApi('personal_data_form')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  const PropertyOwnershipOptions = [
    { value: 'yes', label: getContent('personal_data_property_ownership_option_1', 'Yes') },
    { value: 'no', label: getContent('personal_data_property_ownership_option_2', 'No') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent('personal_data_property_ownership', 'Do you own real estate property?')}
        placeholder={getContent('personal_data_property_ownership_ph', 'Select property ownership status')}
        value={values.propertyOwnership}
        data={PropertyOwnershipOptions}
        onChange={(value) => setFieldValue('propertyOwnership', value)}
        onBlur={() => setFieldTouched('propertyOwnership', true)}
        error={touched.propertyOwnership && errors.propertyOwnership}
      />
    </Column>
  )
}

export { PropertyOwnership }
