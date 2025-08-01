import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface PropertyOwnershipProps {
  screenLocation?: string
}

const PropertyOwnership = ({ screenLocation = 'personal_data_form' }: PropertyOwnershipProps) => {
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData(screenLocation, 'property_ownership', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading property ownership dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Property ownership dropdown error:', dropdownData.error)
  }

  return (
    <Column>
      <DropdownMenu
        title={dropdownData.label || getContent('personal_data_property_ownership', 'Do you own real estate property?')}
        placeholder={dropdownData.placeholder || getContent('personal_data_property_ownership_ph', 'Select property ownership status')}
        value={values.propertyOwnership}
        data={dropdownData.options}
        onChange={(value) => setFieldValue('propertyOwnership', value)}
        onBlur={() => setFieldTouched('propertyOwnership', true)}
        error={touched.propertyOwnership && errors.propertyOwnership}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load property ownership options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export { PropertyOwnership }
