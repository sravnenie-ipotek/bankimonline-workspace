import { useFormikContext } from 'formik'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { FormContainer } from '@components/ui/FormContainer'
import { Row } from '@components/ui/Row'
import { UserProfileCard } from '@components/ui/UserProfileCard'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { RowTwo } from '@src/components/ui/RowTwo'
import { useAppSelector } from '@src/hooks/store'
import { useContentApi } from '@src/hooks/useContentApi'
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
  const { getContent } = useContentApi('refinance_step2')

  const { values } = useFormikContext<FormTypes>()
  const userData = useAppSelector((state) => state.login.loginData)
  const [fallbackUserData, setFallbackUserData] = useState<any>(null)
  
  // Fallback to localStorage if Redux doesn't have user data
  useEffect(() => {
    if (!userData?.nameSurname || !userData?.phoneNumber) {
      const localStorageData = localStorage.getItem('USER_DATA')
      if (localStorageData) {
        try {
          const parsedData = JSON.parse(localStorageData)
          setFallbackUserData({
            nameSurname: parsedData.nameSurname || parsedData.name_surname,
            phoneNumber: parsedData.phoneNumber || parsedData.mobile_number
          })
        } catch (error) {
          console.error('Error parsing localStorage USER_DATA:', error)
        }
      }
    }
  }, [userData])
  
  const displayUserData = userData?.nameSurname ? userData : fallbackUserData
  
  console.log('Display user data:', displayUserData)

  return (
    <FormContainer>
      <FormCaption title={getContent('refinance_step2_title', 'calculate_mortgage_step2_title')} />
      <RowTwo>
        <Info />
        <UserProfileCard 
          name={displayUserData?.nameSurname} 
          phone={displayUserData?.phoneNumber} 
        />
      </RowTwo>
      <Row>
        <NameSurname />
        <Birthday />
        <Education screenLocation="refinance_step2" />
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
