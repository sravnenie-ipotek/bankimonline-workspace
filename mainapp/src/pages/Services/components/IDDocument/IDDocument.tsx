import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import StringInput from '@components/ui/StringInput/StringInput'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

const IDDocument = () => {
  const { t } = useTranslation()
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <StringInput
        title={t('id_document_title')}
        placeholder={t('id_document_placeholder')}
        value={values.idDocument || ''}
        onChange={(value) => setFieldValue('idDocument', value)}
        onBlur={() => setFieldTouched('idDocument', true)}
        error={touched.idDocument && errors.idDocument}
      />
      {touched.idDocument && errors.idDocument && (
        <Error error={errors.idDocument} />
      )}
    </Column>
  )
}

export { IDDocument }
