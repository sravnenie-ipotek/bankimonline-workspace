import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const Childrens = () => {
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement title={getContent('calculate_mortgage_children18', 'calculate_mortgage_children18')} />
      <YesNo
        value={values.childrens}
        onChange={(value) => setFieldValue('childrens', value)}
        error={touched.childrens && errors.childrens}
      />
    </Column>
  )
}

export default Childrens
