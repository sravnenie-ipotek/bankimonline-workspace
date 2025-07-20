import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import { FormattedInput } from '@components/ui/FormattedInput'

import { FormTypes } from '../../types/formTypes'

const HowMuchChildrens = () => {
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <FormattedInput
        name="HowManyBorrowers"
        handleChange={(value) => setFieldValue('howMuchChildrens', value)}
        title={getContent('calculate_mortgage_how_much_childrens', 'calculate_mortgage_how_much_childrens')}
        placeholder="0"
        disableCurrency={true}
        value={values.howMuchChildrens}
        error={errors.howMuchChildrens}
      />
      {touched.howMuchChildrens && errors.howMuchChildrens && (
        <Error error={errors.howMuchChildrens} />
      )}
    </Column>
  )
}

export default HowMuchChildrens
