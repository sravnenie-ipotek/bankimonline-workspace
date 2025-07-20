import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Error } from '@components/ui/Error'
import StringInput from '@components/ui/StringInput/StringInput.tsx'
import Column from '@src/components/ui/Column/Column.tsx'

import { FormTypes } from '../../types/formTypes'

const NameSurname = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <StringInput
        title={getContent('calculate_mortgage_name_surname', 'calculate_mortgage_name_surname')}
        placeholder={getContent('calculate_mortgage_name_surname_ph', 'calculate_mortgage_name_surname_ph')}
        onChange={(value) => setFieldValue('nameSurname', value)}
        onBlur={() => setFieldTouched('nameSurname')}
        error={touched.nameSurname && errors.nameSurname}
        value={values.nameSurname}
        autoComplete="on"
      />
      {touched.nameSurname && errors.nameSurname && (
        <Error error={errors.nameSurname} />
      )}
    </Column>
  )
}

export default NameSurname
