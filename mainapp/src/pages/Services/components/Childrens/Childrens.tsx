import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const Childrens = () => {
  const { t, i18n } = useTranslation()
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement title={t('calculate_mortgage_children18')} />
      <YesNo
        value={values.childrens}
        onChange={(value) => setFieldValue('childrens', value)}
        error={touched.childrens && errors.childrens}
      />
    </Column>
  )
}

export default Childrens
