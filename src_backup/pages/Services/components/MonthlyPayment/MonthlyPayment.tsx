import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import { FormattedInput } from '@components/ui/FormattedInput'

import { FormTypes } from '../../types/formTypes'

const MonthlyPayment = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()
  return (
    <Column>
      <FormattedInput
        value={values.monthlyPaymentForAnotherBank}
        title={t('calculate_mortgage_monthly_payment')}
        placeholder={t('calculate_mortgage_monthly_income_ph')}
        name="MonthlyPayment"
        handleChange={(value) =>
          setFieldValue('monthlyPaymentForAnotherBank', value)
        }
        onBlur={() => setFieldTouched('monthlyPayment')}
        error={
          touched.monthlyPaymentForAnotherBank &&
          errors.monthlyPaymentForAnotherBank
        }
        size="xs"
      />
      {touched.monthlyPaymentForAnotherBank &&
        errors.monthlyPaymentForAnotherBank && (
          <Error error={errors.monthlyPaymentForAnotherBank} />
        )}
    </Column>
  )
}

export default MonthlyPayment
