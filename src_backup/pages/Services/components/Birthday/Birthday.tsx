import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import Calendar from '@components/ui/Calendar/Calendar.tsx'
import { Error } from '@components/ui/Error'
import { Column } from '@src/components/ui/Column'

import { FormTypes } from '../../types/formTypes'

const Birthday = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  const { setFieldValue, values, errors } = useFormikContext<FormTypes>()

  return (
    <Column>
      <Calendar
        title={t('calculate_mortgage_birth_date')}
        onChange={(date) => setFieldValue('birthday', date)}
        value={values.birthday}
        placeholder={'DD/MM/YYYY'}
        error={errors.birthday}
        isMaxAge
      />
      {errors.birthday && <Error error={errors.birthday} />}
    </Column>
  )
}

export default Birthday
