import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { FormContainer } from '@components/ui/FormContainer'
import { Column } from '@components/ui/Column'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
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
      
      {/* Alert bar with green styling - matches Figma */}
      <Info />
      
      {/* Single column layout - matches Figma */}
      <Column>
        {/* Name and Surname */}
        <NameSurname />
        
        {/* Birth date */}
        <Birthday />
        
        {/* Education dropdown */}
        <Education />
        
        {/* Additional citizenship question */}
        <AdditionalCitizenship />
        {values.additionalCitizenships === 'yes' && <CitizenshipsDropdown />}
        
        {/* Tax payment question with tooltip */}
        <Taxes />
        {values.taxes === 'yes' && <CountriesPayTaxes />}
        
        {/* Children question */}
        <Childrens />
        {values.childrens === 'yes' && <HowMuchChildrens />}
        
        {/* Divider line - matches Figma */}
        <Divider />
        
        {/* Medical insurance question */}
        <MedicalInsurance />
        
        {/* Foreign resident question with tooltip */}
        <IsForeigner />
        
        {/* Public person question with tooltip */}
        <PublicPerson />
      </Column>
    </FormContainer>
  )
}

export default FirstStepForm
