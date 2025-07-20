import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const IsForeigner = () => {
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement
        title={getContent('calculate_mortgage_is_foreigner', 'calculate_mortgage_is_foreigner')}
        tooltip={getContent('mest', 'mest')}
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
