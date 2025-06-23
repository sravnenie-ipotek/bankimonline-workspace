import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import { FormattedInput } from '@components/ui/FormattedInput'
import Hint from '@src/components/ui/Hint/Hint.tsx'

import { FormTypes } from '../../types/formTypes'

const MonthlyIncome = () => {
  const { t, i18n } = useTranslation()

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <FormattedInput
        title={t('calculate_mortgage_monthly_income')}
        placeholder={t('calculate_mortgage_monthly_income_ph')}
        value={values.monthlyIncome}
        handleChange={(value) => setFieldValue('monthlyIncome', value)}
        onBlur={() => setFieldTouched('monthlyIncome')}
        error={touched.monthlyIncome && errors.monthlyIncome}
        size="xs"
      />
      <Hint text={t('calculate_mortgage_monthly_income_hint')} />
      {touched.monthlyIncome && errors.monthlyIncome && (
        <Error error={errors.monthlyIncome} />
      )}
    </Column>
  )
}

export default MonthlyIncome
