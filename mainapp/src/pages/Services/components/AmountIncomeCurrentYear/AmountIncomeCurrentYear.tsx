import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import { FormattedInput } from '@components/ui/FormattedInput'
import { Hint } from '@components/ui/Hint'

import { FormTypes } from '../../types/formTypes'

const AmountIncomeCurrentYear = () => {
  const { t, i18n } = useTranslation()

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <FormattedInput
        title={t('calculate_mortgage_monthly_income')}
        placeholder={t('calculate_mortgage_monthly_income_ph')}
        value={values.amountIncomeCurrentYear}
        handleChange={(value) =>
          setFieldValue('amountIncomeCurrentYear', value)
        }
        onBlur={() => setFieldTouched('amountIncomeCurrentYear')}
        error={
          touched.amountIncomeCurrentYear && errors.amountIncomeCurrentYear
        }
        size="xs"
      />
      <Hint text={t('calculate_mortgage_monthly_income_year_hint')} />
      {touched.amountIncomeCurrentYear && errors.amountIncomeCurrentYear && (
        <Error error={errors.amountIncomeCurrentYear} />
      )}
    </Column>
  )
}

export default AmountIncomeCurrentYear
