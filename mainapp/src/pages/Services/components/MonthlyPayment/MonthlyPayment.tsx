import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import { FormattedInput } from '@components/ui/FormattedInput'

import { FormTypes } from '../../types/formTypes'

const MonthlyPayment = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('common')

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()
  return (
    <Column>
      <FormattedInput
        value={values.monthlyPaymentForAnotherBank}
        title={getContent('obligation_monthly_payment_title', 'Monthly Payment')}
        placeholder={getContent('obligation_monthly_payment_placeholder', 'Enter monthly payment amount')}
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
