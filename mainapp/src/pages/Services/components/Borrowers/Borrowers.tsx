import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import CreditContextButton from '@components/ui/ContextButtons/CreditContextButton/CreditContextButton.tsx'
import { Error } from '@components/ui/Error'
import FormattedInput from '@components/ui/FormattedInput/FormattedInput.tsx'

import { FormTypes } from '../../types/formTypes'

const Borrowers = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <FormattedInput
        name="borrowers"
        handleChange={(value) => setFieldValue('borrowers', value)}
        onBlur={() => setFieldTouched('borrowers')}
        title={getContent('calculate_mortgage_borrowers', 'calculate_mortgage_borrowers')}
        placeholder={getContent('place_borrowers', 'place_borrowers')}
        disableCurrency={true}
        value={values.borrowers}
        error={touched.borrowers && errors.borrowers}
        size="xs"
      />
      <CreditContextButton />
      {touched.borrowers && errors.borrowers && (
        <Error error={errors.borrowers} />
      )}
    </Column>
  )
}

export default Borrowers
