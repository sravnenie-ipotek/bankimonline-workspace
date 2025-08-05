import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Error } from '@components/ui/Error'
import StringInput from '@src/components/ui/StringInput/StringInput'

import { LoginFormTypes } from '../../LoginForm'

const NameSurnameLogin = () => {
  const { t, i18n } = useTranslation()
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<LoginFormTypes>()

  return (
    <>
      <StringInput
        title={t('name_surname_login')}
        placeholder={t('calculate_mortgage_name_surname_ph')}
        name="NameSurname"
        onChange={(value) => setFieldValue('nameSurname', value)}
        onBlur={() => setFieldTouched('nameSurname')}
        error={touched.nameSurname && errors.nameSurname}
        value={values.nameSurname}
      />
      {touched.nameSurname && errors.nameSurname && (
        <Error error={errors.nameSurname} />
      )}
    </>
  )
}

export default NameSurnameLogin
