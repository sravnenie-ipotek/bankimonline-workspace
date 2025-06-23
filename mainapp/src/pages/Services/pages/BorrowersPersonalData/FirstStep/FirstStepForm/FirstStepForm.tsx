import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { FormContainer } from '@components/ui/FormContainer'
import { Row } from '@components/ui/Row'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { RowTwo } from '@src/components/ui/RowTwo'
import { AdditionalCitizenship } from '@src/pages/Services/components/AdditionalCitizenships'
import { Birthday } from '@src/pages/Services/components/Birthday'
import { Childrens } from '@src/pages/Services/components/Childrens'
import { CitizenshipsDropdown } from '@src/pages/Services/components/CitizenshipsDropdown'
import { CountriesPayTaxes } from '@src/pages/Services/components/CountriesPayTaxes'
import { Education } from '@src/pages/Services/components/Education'
import { HowMuchChildrens } from '@src/pages/Services/components/HowMuchChildrens'
import { Info } from '@src/pages/Services/components/Info'
import { IsForeigner } from '@src/pages/Services/components/IsForeigner'
import { MedicalInsurance } from '@src/pages/Services/components/MedicalInsurance'
import { NameSurname } from '@src/pages/Services/components/NameSurname'
import { PublicPerson } from '@src/pages/Services/components/PublicPerson'
import { Taxes } from '@src/pages/Services/components/Taxes'
import { FormTypes } from '@src/pages/Services/types/formTypes'

const FirstStepForm = () => {
  const { t, i18n } = useTranslation()
  const { values } = useFormikContext<FormTypes>()

  return (
    <FormContainer>
      <FormCaption title={t('borrowers_personal_data_title')} />
      <RowTwo>
        <Info />
      </RowTwo>
      <Row>
        <NameSurname />
        <Birthday />
        <Education />
      </Row>

      <Row>
        <AdditionalCitizenship />
        <Taxes />
        <Childrens />
        {values.additionalCitizenships === 'yes' && <CitizenshipsDropdown />}
        {values.taxes === 'yes' && <CountriesPayTaxes />}
        {values.childrens === 'yes' && <HowMuchChildrens />}
      </Row>

      <Divider />

      <Row>
        <MedicalInsurance />
        <IsForeigner />
        <PublicPerson />
      </Row>
    </FormContainer>
  )
}

export default FirstStepForm
