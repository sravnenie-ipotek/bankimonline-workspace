import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const PublicPerson = () => {
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement
        title={getContent('calculate_mortgage_is_public', 'calculate_mortgage_is_public')}
        tooltip={getContent('pub', 'pub')}
      />
      <YesNo
        value={values.publicPerson}
        onChange={(value) => setFieldValue('publicPerson', value)}
        error={touched.publicPerson && errors.publicPerson}
      />
    </Column>
  )
}

export default PublicPerson
