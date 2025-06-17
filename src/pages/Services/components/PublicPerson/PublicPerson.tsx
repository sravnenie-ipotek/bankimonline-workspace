import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const PublicPerson = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <TitleElement
        title={t('calculate_mortgage_is_public')}
        tooltip={t('pub')}
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
