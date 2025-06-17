import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { CustomPhoneInput } from '@src/components/ui/CustomPhoneInput'

import { LoginFormTypes } from '../../LoginForm'

const PhoneInput = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<LoginFormTypes>()

  console.log(errors)

  return (
    <>
      <CustomPhoneInput
        title={t('phone_number')}
        value={values.phoneNumber}
        handleChange={(value) => setFieldValue('phoneNumber', value)}
        onBlur={() => setFieldTouched('phoneNumber')}
        error={touched.phoneNumber && errors.phoneNumber}
      />
    </>
  )
}

export default PhoneInput
