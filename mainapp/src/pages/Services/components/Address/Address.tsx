import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import StringInput from '@components/ui/StringInput/StringInput'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

const Address = () => {
  const { getContent } = useContentApi('personal_data_form')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <StringInput
        title={getContent('personal_data_address', 'Residential Address')}
        placeholder={getContent('personal_data_address_ph', 'Enter full residential address')}
        value={values.address || ''}
        onChange={(value) => setFieldValue('address', value)}
        onBlur={() => setFieldTouched('address', true)}
        error={touched.address && errors.address}
      />
      {touched.address && errors.address && (
        <Error error={errors.address} />
      )}
    </Column>
  )
}

export { Address }
