import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const PartnerPayMortgage = () => {
  const { t, i18n } = useTranslation()
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <>
      <TitleElement title={t('calculate_mortgage_partner_pay_mortgage')} />
      <YesNo
        value={values.partnerPayMortgage}
        onChange={(value) => setFieldValue('partnerPayMortgage', value)}
        error={touched.partnerPayMortgage && errors.partnerPayMortgage}
      />
    </>
  )
}

export default PartnerPayMortgage
