import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Calendar } from '@components/ui/Calendar'
import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

const EndDate = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('common')
  const { values, setFieldValue, errors } = useFormikContext<FormTypes>()
  return (
    <Column>
      <Calendar
        title={getContent('obligation_end_date_title', 'Obligation End Date')}
        value={values.endDate}
        onChange={(value) => setFieldValue('endDate', value)}
        placeholder={getContent('date_placeholder', t('date_ph'))}
        error={errors.endDate}
      />
      {errors.endDate && <Error error={errors.endDate as string} />}
    </Column>
  )
}

export default EndDate
