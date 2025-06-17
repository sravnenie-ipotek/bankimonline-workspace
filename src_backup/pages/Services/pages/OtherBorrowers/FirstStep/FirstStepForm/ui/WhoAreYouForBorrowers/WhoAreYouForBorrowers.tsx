import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import StringInput from '@src/components/ui/StringInput/StringInput'
import { FormTypes } from '@src/pages/Services/types/formTypes'

const WhoAreYouForBorrowers = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <StringInput
        title={t('who_are_you_for_borrowers')}
        placeholder={t('who_are_you_for_borrowers_ph')}
        name="whoAreYouForBorrowers"
        onChange={(value) => setFieldValue('whoAreYouForBorrowers', value)}
        onBlur={() => setFieldTouched('whoAreYouForBorrowers')}
        error={touched.whoAreYouForBorrowers && errors.whoAreYouForBorrowers}
        value={values.whoAreYouForBorrowers}
      />
      {touched.whoAreYouForBorrowers && errors.whoAreYouForBorrowers && (
        <Error error={errors.whoAreYouForBorrowers} />
      )}
    </Column>
  )
}

export default WhoAreYouForBorrowers
