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
  const creditParameters = useAppSelector((state) => state.credit)

  return (
    <FormContainer>
      <FormCaption title={t('calculate_credit_final')} />
      <UserParams
        credit={creditParameters.loanAmount}
        nameSurname={userData?.nameSurname}
        phoneNumber={userData?.phoneNumber}
      />
      <AlertWarning text={t('calculate_credit_warning')} />
      <Row>
        <Filter />
      </Row>
      <BankOffers />
    </FormContainer>
  )
}

export default FourthStepForm
