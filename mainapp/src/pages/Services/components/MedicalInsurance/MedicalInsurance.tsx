import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const MedicalInsurance = () => {
  const { t, i18n } = useTranslation()
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement title={t('calculate_mortgage_is_medinsurance')} />
      <YesNo
        value={values.medicalInsurance}
        onChange={(value) => setFieldValue('medicalInsurance', value)}
        error={touched.medicalInsurance && errors.medicalInsurance}
      />
    </Column>
  )
}

export default MedicalInsurance
