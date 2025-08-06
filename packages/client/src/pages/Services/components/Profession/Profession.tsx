import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import StringInput from '@components/ui/StringInput/StringInput.tsx'

import { FormTypes } from '../../types/formTypes'

const Profession = () => {
  const { t, i18n } = useTranslation()

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <StringInput
        placeholder={t('calculate_mortgage_profession_ph')}
        value={values.profession}
        title={t('calculate_mortgage_profession')}
        name="Profession"
        onChange={(value) => setFieldValue('profession', value)}
        onBlur={() => setFieldTouched('profession')}
        error={touched.profession && errors.profession}
      />
      {touched.profession && errors.profession && (
        <Error error={errors.profession} />
      )}
    </Column>
  )
}

export default Profession
