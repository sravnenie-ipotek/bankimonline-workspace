import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const IsForeigner = () => {
  const { t, i18n } = useTranslation()
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement
        title={t('calculate_mortgage_is_foreigner')}
        tooltip={t('mest')}
      />
      <YesNo
        value={values.isForeigner}
        onChange={(value) => setFieldValue('isForeigner', value)}
        error={touched.isForeigner && errors.isForeigner}
      />
    </Column>
  )
}

export default IsForeigner
