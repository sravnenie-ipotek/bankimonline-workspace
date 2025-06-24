import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import StringInput from '@components/ui/StringInput/StringInput'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

const Address = () => {
  const { t } = useTranslation()
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <StringInput
        title={t('address_title')}
        placeholder={t('address_placeholder')}
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
