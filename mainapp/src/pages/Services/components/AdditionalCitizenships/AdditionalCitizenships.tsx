import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'
import Column from '@src/components/ui/Column/Column.tsx'

import { FormTypes } from '../../types/formTypes'

const AdditionalCitizenship = () => {
  const { t, i18n } = useTranslation()

  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement title={t('calculate_mortgage_citizenship')} />
      <YesNo
        value={values.additionalCitizenships}
        onChange={(value) => setFieldValue('additionalCitizenships', value)}
        error={touched.additionalCitizenships && errors.additionalCitizenships}
      />
    </Column>
  )
}

export default AdditionalCitizenship
