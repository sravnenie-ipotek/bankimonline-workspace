import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { Error } from '@components/ui/Error'
import StringInput from '@components/ui/StringInput/StringInput.tsx'

import { FormTypes } from '../../types/formTypes'

const CompanyName = () => {
  const { t, i18n } = useTranslation()

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <StringInput
        placeholder={t('calculate_mortgage_company')}
        value={values.companyName}
        title={t('calculate_mortgage_company')}
        name="СompanyName"
        onChange={(value) => setFieldValue('companyName', value)}
        onBlur={() => setFieldTouched('companyName')}
        error={touched.companyName && errors.companyName}
      />
      {touched.companyName && errors.companyName && (
        <Error error={errors.companyName} />
      )}
    </Column>
  )
}

export default CompanyName
