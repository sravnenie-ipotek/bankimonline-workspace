import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import { FormattedInput } from '@components/ui/FormattedInput'

import { FormTypes } from '../../types/formTypes'

const AdditionalIncomeAmount = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()
  return (
    <Column>
      <FormattedInput
        title={t('calculate_mortgage_monthly_income')}
        placeholder={t('calculate_mortgage_monthly_income_ph')}
        value={values.additionalIncomeAmount}
        handleChange={(value) => setFieldValue('additionalIncomeAmount', value)}
        onBlur={() => setFieldTouched('additionalIncomeAmount')}
        error={touched.additionalIncomeAmount && errors.additionalIncomeAmount}
        size="xs"
      />
      {touched.additionalIncomeAmount && errors.additionalIncomeAmount && (
        <Error error={errors.additionalIncomeAmount} />
      )}
    </Column>
  )
}

export default AdditionalIncomeAmount
