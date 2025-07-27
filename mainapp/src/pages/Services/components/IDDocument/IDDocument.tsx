import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import StringInput from '@components/ui/StringInput/StringInput'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

const IDDocument = () => {
  const { getContent } = useContentApi('personal_data_form')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <StringInput
        title={getContent('personal_data_id_document', 'ID Document Number')}
        placeholder={getContent('personal_data_id_document_ph', 'Enter ID document number')}
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
