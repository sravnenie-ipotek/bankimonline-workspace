import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Calendar } from '@components/ui/Calendar'
import { Column } from '@components/ui/Column'
import IncomeContextButton from '@components/ui/ContextButtons/IncomeContextButton/IncomeContextButton.tsx'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

const StartDate = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const { values, setFieldValue, errors } = useFormikContext<FormTypes>()
  return (
    <Column>
      <Calendar
        title={t('calculate_mortgage_start_date')}
        value={values.startDate}
        onChange={(value) => setFieldValue('startDate', value)}
        placeholder={t('date_ph')}
        error={errors.startDate}
      />
      <IncomeContextButton />
      {errors.startDate && <Error error={errors.startDate} />}
    </Column>
  )
}

export default StartDate
