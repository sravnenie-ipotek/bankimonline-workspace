import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { FormContainer } from '@components/ui/FormContainer'
import { Row } from '@components/ui/Row'
import { UserProfileCard } from '@components/ui/UserProfileCard'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { RowTwo } from '@src/components/ui/RowTwo'
import { useAppSelector } from '@src/hooks/store'
import { AddPartner } from '@src/pages/Services/components/AddPartner'
import { AdditionalCitizenship } from '@src/pages/Services/components/AdditionalCitizenships'
import { Birthday } from '@src/pages/Services/components/Birthday'
import { Borrowers } from '@src/pages/Services/components/Borrowers'
import { Childrens } from '@src/pages/Services/components/Childrens'
import { CitizenshipsDropdown } from '@src/pages/Services/components/CitizenshipsDropdown'
import { CountriesPayTaxes } from '@src/pages/Services/components/CountriesPayTaxes'
import { Education } from '@src/pages/Services/components/Education'
import { FamilyStatus } from '@src/pages/Services/components/FamilyStatus'
import { HowMuchChildrens } from '@src/pages/Services/components/HowMuchChildrens'
import { Info } from '@src/pages/Services/components/Info'
import { IsForeigner } from '@src/pages/Services/components/IsForeigner'
import { MedicalInsurance } from '@src/pages/Services/components/MedicalInsurance'
import { NameSurname } from '@src/pages/Services/components/NameSurname'
import { PartnerPayMortgage } from '@src/pages/Services/components/PartnerPayMortgage'
import { PublicPerson } from '@src/pages/Services/components/PublicPerson'
import { Taxes } from '@src/pages/Services/components/Taxes'
import { FormTypes } from '@src/pages/Services/types/formTypes'

// Компонент расчета ипотеки - 2 шаг
const SecondStepForm = () => {
  const { t, i18n } = useTranslation()

  const { values } = useFormikContext<FormTypes>()

  const userData = useAppSelector((state) => state.login.loginData)

  return (
    <FormContainer>
      <FormCaption title={t('calculate_mortgage_step2_title')} />
      <RowTwo>
        <Info />
        <UserProfileCard
          name={userData?.nameSurname}
          phone={userData?.phoneNumber}
        />
      </RowTwo>
      <Row>
        <NameSurname />
        <Birthday />
        <Education />
      </Row>
      <Row>
        <Column style={{ gap: '2rem' }}>
          <AdditionalCitizenship />
          {values.additionalCitizenships === 'yes' && <CitizenshipsDropdown />}
        </Column>
        <Column style={{ gap: '2rem' }}>
          <Taxes />
          {values.taxes === 'yes' && <CountriesPayTaxes />}
        </Column>
        <Column style={{ gap: '2rem' }}>
          <Childrens />
          {values.childrens === 'yes' && <HowMuchChildrens />}
        </Column>
      </Row>

      <Divider />
      <Row>
        <MedicalInsurance />
        <IsForeigner />
        <PublicPerson />
      </Row>

      <Divider />

      <Row>
        <Borrowers />
        <Column></Column>
        <Column></Column>
      </Row>

      <Divider />

      <Row>
        <FamilyStatus />
        <Column>
          {values.familyStatus === 'option_2' && <PartnerPayMortgage />}
        </Column>
        <Column>
          {values.partnerPayMortgage === 'yes' &&
            values.familyStatus === 'option_2' && <AddPartner />}
        </Column>
      </Row>
    </FormContainer>
  )
}

export default SecondStepForm
