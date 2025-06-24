import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const Gender = () => {
  const { t } = useTranslation()
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  const GenderOptions = [
    { value: 'male', label: t('gender_male') },
    { value: 'female', label: t('gender_female') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={t('gender_title')}
        placeholder={t('gender_placeholder')}
        value={values.gender}
        data={GenderOptions}
        onChange={(value) => setFieldValue('gender', value)}
        onBlur={() => setFieldTouched('gender', true)}
        error={touched.gender && errors.gender}
      />
    </Column>
  )
}

export { Gender }
