import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { TitleElement } from '@components/ui/TitleElement'
import { YesNo } from '@components/ui/YesNo'

import { FormTypes } from '../../types/formTypes'

const PartnerPayMortgage = () => {
  const { getContent } = useContentApi('mortgage_step2')
  const { values, setFieldValue, errors, touched } =
    useFormikContext<FormTypes>()

  return (
    <>
      <TitleElement title={getContent('calculate_mortgage_partner_pay_mortgage', 'calculate_mortgage_partner_pay_mortgage')} />
      <YesNo
        value={values.partnerPayMortgage}
        onChange={(value) => setFieldValue('partnerPayMortgage', value)}
        error={touched.partnerPayMortgage && errors.partnerPayMortgage}
      />
    </>
  )
}

export default PartnerPayMortgage
