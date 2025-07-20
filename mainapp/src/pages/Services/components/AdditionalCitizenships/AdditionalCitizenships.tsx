import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'
import Column from '@src/components/ui/Column/Column.tsx'

import { FormTypes } from '../../types/formTypes'

const AdditionalCitizenship = () => {
  const { getContent } = useContentApi('mortgage_step2')

  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement title={getContent('calculate_mortgage_citizenship', 'calculate_mortgage_citizenship')} />
      <YesNo
        value={values.additionalCitizenships}
        onChange={(value) => setFieldValue('additionalCitizenships', value)}
        error={touched.additionalCitizenships && errors.additionalCitizenships}
      />
    </Column>
  )
}

export default AdditionalCitizenship
