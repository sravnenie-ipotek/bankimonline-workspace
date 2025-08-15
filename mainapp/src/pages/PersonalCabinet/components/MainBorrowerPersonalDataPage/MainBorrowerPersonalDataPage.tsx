import React from 'react'
import { Formik, Form } from 'formik'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'
import * as Yup from 'yup'

import { FormContainer } from '@components/ui/FormContainer'
import { Row } from '@components/ui/Row'
import { Column } from '@components/ui/Column'
import Divider from '@components/ui/Divider/Divider'
import FormCaption from '@components/ui/FormCaption/FormCaption'
import { Info } from '@pages/Services/components/Info'
import { PersonalCabinetLayout } from '../PersonalCabinetLayout/PersonalCabinetLayout'

// Import existing components from Services
import { NameSurname } from '@pages/Services/components/NameSurname'
import { Birthday } from '@pages/Services/components/Birthday'
import { Education } from '@pages/Services/components/Education'
import { AdditionalCitizenship } from '@pages/Services/components/AdditionalCitizenships'
import { CitizenshipsDropdown } from '@pages/Services/components/CitizenshipsDropdown'
import { Taxes } from '@pages/Services/components/Taxes'
import { CountriesPayTaxes } from '@pages/Services/components/CountriesPayTaxes'
import { Childrens } from '@pages/Services/components/Childrens'
import { HowMuchChildrens } from '@pages/Services/components/HowMuchChildrens'
import { MedicalInsurance } from '@pages/Services/components/MedicalInsurance'
import { IsForeigner } from '@pages/Services/components/IsForeigner'
import { PublicPerson } from '@pages/Services/components/PublicPerson'

// Import new components for additional fields
import { Address } from '@pages/Services/components/Address'
import { IDDocument } from '@pages/Services/components/IDDocument'
import { DocumentIssueDate } from '@pages/Services/components/DocumentIssueDate'
import { Gender } from '@pages/Services/components/Gender'
import { PropertyOwnership } from '@pages/Services/components/PropertyOwnership'

// Import missing components for Actions #17, #24, #25, #26
import { Borrowers } from '@pages/Services/components/Borrowers'
import { FamilyStatus } from '@pages/Services/components/FamilyStatus'
import { PartnerPayMortgage } from '@pages/Services/components/PartnerPayMortgage'
import { AddPartner } from '@pages/Services/components/AddPartner'

import { FormTypes } from '@pages/Services/types/formTypes'
import styles from './MainBorrowerPersonalDataPage.module.scss'

const cx = classNames.bind(styles)

interface MainBorrowerPersonalDataPageProps {
  borrowerName?: string
}

const validationSchema = Yup.object().shape({
  nameSurname: Yup.string().required('שם מלא נדרש'),
  birthday: Yup.string().required('תאריך לידה נדרש'),
  education: Yup.string().required('השכלה נדרשת'),
  address: Yup.string().required('כתובת נדרשת'),
  idDocument: Yup.string().required('מספר תעודת זהות נדרש'),
  documentIssueDate: Yup.string().required('תאריך הוצאת התעודה נדרש'),
  gender: Yup.string().required('מין נדרש'),
  additionalCitizenships: Yup.string().required('יש לבחור תשובה'),
  taxes: Yup.string().required('יש לבחור תשובה'),
  childrens: Yup.string().required('יש לבחור תשובה'),
  medicalInsurance: Yup.string().required('יש לבחור תשובה'),
  isForeigner: Yup.string().required('יש לבחור תשובה'),
  publicPerson: Yup.string().required('יש לבחור תשובה'),
  propertyOwnership: Yup.string().required('יש לבחור תשובה'),
  borrowers: Yup.number().min(1, 'יש לבחור לפחות לווה אחד').required('מספר לווים נדרש'),
  familyStatus: Yup.string().required('יש לבחור מצב משפחתי'),
  partnerPayMortgage: Yup.string().when('familyStatus', {
    is: 'married',
    then: (schema) => schema.required('יש לבחור תשובה'),
    otherwise: (schema) => schema.notRequired(),
  }),
  citizenshipsDropdown: Yup.array().when('additionalCitizenships', {
    is: 'yes',
    then: (schema) => schema.min(1, 'יש לבחור לפחות אזרחות אחת'),
    otherwise: (schema) => schema.min(0),
  }),
  countriesPayTaxes: Yup.array().when('taxes', {
    is: 'yes',
    then: (schema) => schema.min(1, 'יש לבחור לפחות מדינה אחת'),
    otherwise: (schema) => schema.min(0),
  }),
  howMuchChildrens: Yup.number().when('childrens', {
    is: 'yes',
    then: (schema) => schema.required('מספר ילדים נדרש').min(1, 'לפחות ילד אחד'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const MainBorrowerPersonalDataPage: React.FC<MainBorrowerPersonalDataPageProps> = ({ 
  borrowerName = "דוד כהן" 
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Mock user data for demonstration
  const mockUserData = {
    nameSurname: 'דוד כהן',
    birthday: new Date('1985-06-25').getTime(),
    education: 'תואר ראשון',
    address: 'רחוב הרצל 123, תל אביב',
    idDocument: '123456789',
    documentIssueDate: '2020-01-15',
    gender: 'male',
    additionalCitizenships: 'no',
    citizenshipsDropdown: [],
    taxes: 'no',
    countriesPayTaxes: [],
    childrens: 'yes',
    howMuchChildrens: 2,
    medicalInsurance: 'yes',
    isForeigner: 'no',
    publicPerson: 'no',
    propertyOwnership: 'owner',
    borrowers: 1,
    familyStatus: 'married',
    partnerPayMortgage: 'yes',
    addPartner: '',
  }

  const initialValues: Partial<FormTypes> = {
    nameSurname: mockUserData.nameSurname,
    birthday: mockUserData.birthday,
    education: mockUserData.education,
    address: mockUserData.address,
    idDocument: mockUserData.idDocument,
    documentIssueDate: mockUserData.documentIssueDate,
    gender: mockUserData.gender,
    additionalCitizenships: mockUserData.additionalCitizenships,
    citizenshipsDropdown: mockUserData.citizenshipsDropdown,
    taxes: mockUserData.taxes,
    countriesPayTaxes: mockUserData.countriesPayTaxes,
    childrens: mockUserData.childrens,
    howMuchChildrens: mockUserData.howMuchChildrens,
    medicalInsurance: mockUserData.medicalInsurance,
    isForeigner: mockUserData.isForeigner,
    publicPerson: mockUserData.publicPerson,
    propertyOwnership: mockUserData.propertyOwnership,
    borrowers: mockUserData.borrowers,
    familyStatus: mockUserData.familyStatus,
    partnerPayMortgage: mockUserData.partnerPayMortgage,
    addPartner: mockUserData.addPartner,
  }

  const handleSubmit = (values: Partial<FormTypes>) => {
    navigate('/personal-cabinet')
  }

  const handleBack = () => {
    navigate('/personal-cabinet')
  }

  return (
    <div className={cx('main-borrower-personal-data-page')}>
      <PersonalCabinetLayout>
        <div className={cx('content')}>
          <div className={cx('header')}>
            <h1 className={cx('borrower-name')}>{borrowerName}</h1>
            <button 
              className={cx('back-to-cabinet')}
              onClick={() => navigate('/personal-cabinet')}
            >
              {t('back_to_personal_cabinet', 'Вернуться в личный кабинет')}
            </button>
          </div>

          <FormContainer>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values }) => (
            <Form>
              <FormCaption 
                title={t('borrowers_personal_data_title', 'Личные данные')}
                subtitle="1 из 2"
              />

              <Info 
                text={t('data_privacy_info', 'Ваши данные не попадут третьим лицам кроме банков партнеров и брокеров, мы соблюдаем закон о защите данных')}
              />

              {/* Actions #4-6: Basic Personal Information */}
              <Row>
                <NameSurname />
                <Birthday />
                <Education />
              </Row>

              {/* Actions #7-9: Citizenship and Family Questions */}
              <Row>
                <AdditionalCitizenship />
                <Taxes />
                <Childrens />
              </Row>

              {/* Actions #10-13: Conditional Fields */}
              <Row>
                {values.additionalCitizenships === 'yes' && <CitizenshipsDropdown />}
                {values.taxes === 'yes' && <CountriesPayTaxes />}
                {values.childrens === 'yes' && <HowMuchChildrens />}
              </Row>

              <Divider />

              {/* Actions #14-16: Insurance and Status */}
              <Row>
                <MedicalInsurance />
                <IsForeigner />
                <PublicPerson />
              </Row>

              <Divider />

              {/* Action #17: Total Borrowers */}
              <Row>
                <Borrowers />
                <Column />
                <Column />
              </Row>

              <Divider />

              {/* Actions #18-20: Address and Document Information */}
              <Row>
                <Address />
                <IDDocument />
                <DocumentIssueDate />
              </Row>

              <Row>
                <Gender />
                <PropertyOwnership />
                <Column />
              </Row>

              <Divider />

              {/* Actions #24-26: Family Status and Partner Information */}
              <Row>
                <FamilyStatus />
                {values.familyStatus === 'married' && <PartnerPayMortgage />}
                <Column />
              </Row>

              {/* Action #26: Add Partner */}
              {values.familyStatus === 'married' && values.partnerPayMortgage === 'yes' && (
                <Row>
                  <AddPartner />
                  <Column />
                  <Column />
                </Row>
              )}

              <Divider />

              {/* Actions #27-28: Navigation Buttons */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={handleBack}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#4a4a4a', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {t('button_back', 'Назад')}
                </button>
                <button 
                  type="submit"
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#FBE54D', 
                    color: 'black', 
                    border: 'none', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {t('button_save', 'Сохранить')}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </FormContainer>
        </div>
      </PersonalCabinetLayout>
    </div>
  )
}

export { MainBorrowerPersonalDataPage }
