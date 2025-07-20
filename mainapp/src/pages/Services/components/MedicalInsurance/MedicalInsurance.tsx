import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const MedicalInsurance = () => {
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement title={getContent('calculate_mortgage_is_medinsurance', 'calculate_mortgage_is_medinsurance')} />
      <YesNo
        value={values.medicalInsurance}
        onChange={(value) => setFieldValue('medicalInsurance', value)}
        error={touched.medicalInsurance && errors.medicalInsurance}
      />
    </Column>
  )
}

export default MedicalInsurance
