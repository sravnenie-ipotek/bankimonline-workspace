import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import StringInput from '@src/components/ui/StringInput/StringInput'
import { FormTypes } from '@src/pages/Services/types/formTypes'

const WhoAreYouForBorrowers = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('other_borrowers_step1')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <StringInput
        title={getContent('app.other_borrowers.step1.who_are_you_for_borrowers_label', 'What is your relationship to the borrowers?')}
        placeholder={getContent('who_are_you_for_borrowers_ph', 'Please specify your relationship')}
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
