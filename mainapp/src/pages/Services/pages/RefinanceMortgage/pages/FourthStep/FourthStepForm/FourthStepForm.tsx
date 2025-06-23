import { useTranslation } from 'react-i18next'

import { AlertWarning } from '@components/ui/AlertWarning'
import { FormContainer } from '@components/ui/FormContainer'
import { Row } from '@components/ui/Row'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { useAppSelector } from '@src/hooks/store'
import { BankOffers } from '@src/pages/Services/components/BankOffers'
import { Filter } from '@src/pages/Services/components/Filter'
import { UserParams } from '@src/pages/Services/components/UserParams'

const FourthStepForm = () => {
  const { t, i18n } = useTranslation()

  const userData = useAppSelector((state) => state.login.loginData)
  const mortgageParameters = useAppSelector((state) => state.refinanceMortgage)

  return (
    <FormContainer>
      <FormCaption title={t('calculate_mortgage_final')} />
      <UserParams
        cost={mortgageParameters?.priceOfEstate}
        initialPayment={mortgageParameters?.mortgageBalance}
        period={mortgageParameters?.period}
        nameSurname={userData?.nameSurname}
        phoneNumber={userData?.phoneNumber}
      />
      <AlertWarning text={t('calculate_mortgage_warning')} />
      <Row>
        <Filter />
      </Row>
      <BankOffers />
    </FormContainer>
  )
}

export default FourthStepForm
