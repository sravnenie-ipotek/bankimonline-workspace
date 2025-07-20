import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const Taxes = () => {
  const { getContent } = useContentApi('mortgage_step2')

  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement 
        title={getContent('calculate_mortgage_tax', 'calculate_mortgage_tax')} 
        tooltip={getContent('plat', 'plat')} 
      />
      <YesNo
        value={values.taxes}
        onChange={(value) => setFieldValue('taxes', value)}
        error={touched.taxes && errors.taxes}
      />
    </Column>
  )
}

export default Taxes
