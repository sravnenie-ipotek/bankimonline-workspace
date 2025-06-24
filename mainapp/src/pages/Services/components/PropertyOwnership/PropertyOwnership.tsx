import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const PropertyOwnership = () => {
  const { t } = useTranslation()
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  const PropertyOwnershipOptions = [
    { value: 'yes', label: t('yes') },
    { value: 'no', label: t('no') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={t('property_ownership_title')}
        placeholder={t('property_ownership_placeholder')}
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
