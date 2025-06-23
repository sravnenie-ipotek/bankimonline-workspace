import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Calendar } from '@components/ui/Calendar'
import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

const EndDate = () => {
  const { t, i18n } = useTranslation()
  const { values, setFieldValue, errors } = useFormikContext<FormTypes>()
  return (
    <Column>
      <Calendar
        title={t('calculate_mortgage_end_date')}
        value={values.endDate}
        onChange={(value) => setFieldValue('endDate', value)}
        placeholder="ДД / ММ / ГГ"
        error={errors.endDate}
      />
      {errors.endDate && <Error error={errors.endDate as string} />}
    </Column>
  )
}

export default EndDate
