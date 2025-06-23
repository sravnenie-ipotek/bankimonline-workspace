import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { Calendar } from '@src/components/ui/Calendar'
import { Error } from '@src/components/ui/Error'

import { FormTypes } from '../../types/formTypes'

const NoIncome = () => {
  const { t, i18n } = useTranslation()
  const { values, setFieldValue, errors } = useFormikContext<FormTypes>()
  return (
    <Column>
      <Calendar
        title={t('no_income')}
        value={values.noIncome}
        onChange={(value) => setFieldValue('noIncome', value)}
        placeholder={t('date_ph')}
        error={errors.noIncome}
      />
      {errors.noIncome && <Error error={errors.noIncome} />}
    </Column>
  )
}

export default NoIncome
