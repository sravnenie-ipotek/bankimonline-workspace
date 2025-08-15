import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames/bind'

import { NameSurname } from '@pages/Services/components/NameSurname'
import { Birthday } from '@pages/Services/components/Birthday'
import { Education } from '@pages/Services/components/Education'
import { AdditionalCitizenship } from '@pages/Services/components/AdditionalCitizenships'
import { Taxes } from '@pages/Services/components/Taxes'
import { Childrens } from '@pages/Services/components/Childrens'
import { MedicalInsurance } from '@pages/Services/components/MedicalInsurance'
import { IsForeigner } from '@pages/Services/components/IsForeigner'
import { PublicPerson } from '@pages/Services/components/PublicPerson'
import { Address } from '@pages/Services/components/Address'
import { IDDocument } from '@pages/Services/components/IDDocument'
import { DocumentIssueDate } from '@pages/Services/components/DocumentIssueDate'
import { Gender } from '@pages/Services/components/Gender'
import { Button } from '@components/ui/ButtonUI'
import { FormContainer } from '@components/ui/FormContainer'
import { Row } from '@components/ui/Row'
import { Column } from '@components/ui/Column'
import Divider from '@components/ui/Divider/Divider'
import FormCaption from '@components/ui/FormCaption/FormCaption'
import { Info } from '@pages/Services/components/Info'
import { PersonalCabinetLayout } from '../PersonalCabinetLayout/PersonalCabinetLayout'
import { ProgressBar } from '@components/ui/ProgressBar'

import { FormTypes } from '@pages/Services/types/formTypes'
import styles from './CoBorrowerPersonalDataPage.module.scss'

// Extended interface for co-borrower with missing fields
interface CoBorrowerFormTypes extends Partial<FormTypes> {
  respondentRelationship?: string     // Action #19 - Respondent relationship
  familyStatus?: string               // Action #20 - Family status
}

const cx = classNames.bind(styles)

// Validation schema for co-borrower (excludes PropertyOwnership and HowMuchChildrens validation)
const validationSchema = Yup.object().shape({
  nameSurname: Yup.object().shape({
    name: Yup.string().required('Name is required'),
    surname: Yup.string().required('Surname is required'),
  }),
  birthday: Yup.string().required('Birthday is required'),
  education: Yup.string().required('Education is required'),
  address: Yup.string().required('Address is required'),
  idDocument: Yup.string().required('ID Document is required'),
  documentIssueDate: Yup.string().required('Document issue date is required'),
  gender: Yup.string().required('Gender is required'),
  additionalCitizenship: Yup.object().shape({
    hasAdditionalCitizenship: Yup.string().required('Additional citizenship selection is required'),
    countries: Yup.array().when('hasAdditionalCitizenship', {
      is: 'yes',
      then: (schema) => schema.min(1, 'At least one country must be selected'),
      otherwise: (schema) => schema,
    }),
  }),
  taxes: Yup.object().shape({
    paysTaxes: Yup.string().required('Tax payment selection is required'),
    countries: Yup.array().when('paysTaxes', {
      is: 'yes', 
      then: (schema) => schema.min(1, 'At least one country must be selected'),
      otherwise: (schema) => schema,
    }),
  }),
  childrens: Yup.object().shape({
    hasChildren: Yup.string().required('Children selection is required'),
    // NOTE: No HowMuchChildrens validation for co-borrower
  }),
  medicalInsurance: Yup.string().required('Medical insurance selection is required'),
  isForeigner: Yup.string().required('Foreigner status is required'),
  publicPerson: Yup.string().required('Public person status is required'),
  respondentRelationship: Yup.string().required('Respondent relationship is required'),
  familyStatus: Yup.string().required('Family status is required'),
})

const initialValues: CoBorrowerFormTypes = {
  nameSurname: {
    name: '',
    surname: '',
  },
  birthday: '',
  education: '',
  address: '',
  idDocument: '',
  documentIssueDate: '',
  gender: '',
  additionalCitizenship: {
    hasAdditionalCitizenship: '',
    countries: [],
  },
  taxes: {
    paysTaxes: '',
    countries: [],
  },
  childrens: {
    hasChildren: '',
    // NOTE: No howMuchChildrens for co-borrower
  },
  medicalInsurance: '',
  isForeigner: '',
  publicPerson: '',
  respondentRelationship: '',     // Action #19 
  familyStatus: '',               // Action #20
  // NOTE: No propertyOwnership for co-borrower
}

export const CoBorrowerPersonalDataPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Co-borrower name from Figma design
  const coBorrowerName = "Людмила Пушкина"

  const handleSubmit = (values: CoBorrowerFormTypes) => {
    // Handle form submission
    navigate('/personal-cabinet')
  }

  return (
    <div className={cx('co-borrower-personal-data-page')}>
      <PersonalCabinetLayout>
        <div className={cx('content')}>
          <div className={cx('header')}>
            <h1 className={cx('borrower-name')}>{coBorrowerName}</h1>
            <button 
              className={cx('back-to-cabinet')}
              onClick={() => navigate('/personal-cabinet')}
            >
              {t('back_to_personal_cabinet', 'Вернуться в личный кабинет')}
            </button>
          </div>

          {/* Action #3 - Progress Bar */}
          <div className={cx('progress-bar-container')}>
            <ProgressBar 
              currentStep={3} 
              totalSteps={5} 
              label={t('progress_personal_data', 'Шаг 3 из 5: Личные данные созаемщика')}
            />
          </div>

          <FormContainer>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, setFieldValue }) => (
                <Form>
                  <FormCaption text={t('data_privacy_info', 'Ваши данные не попадут третьим лицам кроме банков партнеров и брокеров, мы соблюдаем закон о защите данных')} />

                  {/* Row 1: Name, Birthday, Education */}
                  <Row>
                    <Column>
                      <NameSurname
                        value={values.nameSurname}
                        onChange={(value) => setFieldValue('nameSurname', value)}
                        errors={errors.nameSurname}
                        touched={touched.nameSurname}
                      />
                    </Column>
                    <Column>
                      <Birthday
                        value={values.birthday}
                        onChange={(value) => setFieldValue('birthday', value)}
                        error={errors.birthday}
                        touched={touched.birthday}
                      />
                    </Column>
                    <Column>
                      <Education
                        value={values.education}
                        onChange={(value) => setFieldValue('education', value)}
                        error={errors.education}
                        touched={touched.education}
                      />
                    </Column>
                  </Row>

                  {/* Row 2: Address, ID Document, Document Issue Date */}
                  <Row>
                    <Column>
                      <Address
                        value={values.address}
                        onChange={(value) => setFieldValue('address', value)}
                        error={errors.address}
                        touched={touched.address}
                      />
                    </Column>
                    <Column>
                      <IDDocument
                        value={values.idDocument}
                        onChange={(value) => setFieldValue('idDocument', value)}
                        error={errors.idDocument}
                        touched={touched.idDocument}
                      />
                    </Column>
                    <Column>
                      <DocumentIssueDate
                        value={values.documentIssueDate}
                        onChange={(value) => setFieldValue('documentIssueDate', value)}
                        error={errors.documentIssueDate}
                        touched={touched.documentIssueDate}
                      />
                    </Column>
                  </Row>

                  {/* Row 3: Gender, Additional Citizenship (NOTE: PropertyOwnership excluded for co-borrower) */}
                  <Row>
                    <Column>
                      <Gender
                        value={values.gender}
                        onChange={(value) => setFieldValue('gender', value)}
                        error={errors.gender}
                        touched={touched.gender}
                      />
                    </Column>
                    <Column>
                      <AdditionalCitizenship
                        value={values.additionalCitizenship}
                        onChange={(value) => setFieldValue('additionalCitizenship', value)}
                        errors={errors.additionalCitizenship}
                        touched={touched.additionalCitizenship}
                      />
                    </Column>
                    <Column>
                      {/* Empty column to maintain 3-column layout */}
                    </Column>
                  </Row>

                  <Divider />

                  {/* Row 4: Taxes, Children, Medical Insurance */}
                  <Row>
                    <Column>
                      <Taxes
                        value={values.taxes}
                        onChange={(value) => setFieldValue('taxes', value)}
                        errors={errors.taxes}
                        touched={touched.taxes}
                      />
                    </Column>
                    <Column>
                      <Childrens
                        value={values.childrens}
                        onChange={(value) => setFieldValue('childrens', value)}
                        errors={errors.childrens}
                        touched={touched.childrens}
                      />
                      {/* NOTE: HowMuchChildrens component excluded for co-borrower */}
                    </Column>
                    <Column>
                      <MedicalInsurance
                        value={values.medicalInsurance}
                        onChange={(value) => setFieldValue('medicalInsurance', value)}
                        error={errors.medicalInsurance}
                        touched={touched.medicalInsurance}
                      />
                    </Column>
                  </Row>

                  {/* Row 5: Is Foreigner, Public Person, Respondent Relationship */}
                  <Row>
                    <Column>
                      <IsForeigner
                        value={values.isForeigner}
                        onChange={(value) => setFieldValue('isForeigner', value)}
                        error={errors.isForeigner}
                        touched={touched.isForeigner}
                      />
                    </Column>
                    <Column>
                      <PublicPerson
                        value={values.publicPerson}
                        onChange={(value) => setFieldValue('publicPerson', value)}
                        error={errors.publicPerson}
                        touched={touched.publicPerson}
                      />
                    </Column>
                    <Column>
                      {/* Action #19 - Respondent Relationship */}
                      <div className={cx('form-field')}>
                        <label htmlFor="respondentRelationship">
                          {t('respondent_relationship', 'Отношение к заявителю')}
                        </label>
                        <select
                          id="respondentRelationship"
                          name="respondentRelationship"
                          value={values.respondentRelationship || ''}
                          onChange={(e) => setFieldValue('respondentRelationship', e.target.value)}
                          className={cx('select-input')}
                        >
                          <option value="">{t('select_relationship', 'Выберите отношение')}</option>
                          <option value="spouse">{t('spouse', 'Супруг/супруга')}</option>
                          <option value="parent">{t('parent', 'Родитель')}</option>
                          <option value="child">{t('child', 'Ребенок')}</option>
                          <option value="sibling">{t('sibling', 'Брат/сестра')}</option>
                          <option value="relative">{t('relative', 'Родственник')}</option>
                          <option value="friend">{t('friend', 'Друг')}</option>
                          <option value="business_partner">{t('business_partner', 'Деловой партнер')}</option>
                          <option value="other">{t('other', 'Другое')}</option>
                        </select>
                        {errors.respondentRelationship && touched.respondentRelationship && (
                          <div className={cx('error')}>{errors.respondentRelationship}</div>
                        )}
                      </div>
                    </Column>
                  </Row>

                  {/* Row 6: Family Status */}
                  <Row>
                    <Column>
                      {/* Action #20 - Family Status */}
                      <div className={cx('form-field')}>
                        <label htmlFor="familyStatus">
                          {t('family_status', 'Семейное положение')}
                        </label>
                        <select
                          id="familyStatus"
                          name="familyStatus"
                          value={values.familyStatus || ''}
                          onChange={(e) => setFieldValue('familyStatus', e.target.value)}
                          className={cx('select-input')}
                        >
                          <option value="">{t('select_family_status', 'Выберите семейное положение')}</option>
                          <option value="single">{t('single', 'Холост/не замужем')}</option>
                          <option value="married">{t('married', 'Женат/замужем')}</option>
                          <option value="divorced">{t('divorced', 'Разведен(а)')}</option>
                          <option value="widowed">{t('widowed', 'Вдовец/вдова')}</option>
                          <option value="civil_union">{t('civil_union', 'Гражданский брак')}</option>
                          <option value="separated">{t('separated', 'В разводе')}</option>
                        </select>
                        {errors.familyStatus && touched.familyStatus && (
                          <div className={cx('error')}>{errors.familyStatus}</div>
                        )}
                      </div>
                    </Column>
                    <Column>
                      {/* Empty column for spacing */}
                    </Column>
                    <Column>
                      {/* Empty column for spacing */}
                    </Column>
                  </Row>

                  {/* Navigation Buttons - Actions #24 & #25 */}
                  <div className={cx('navigation-buttons')}>
                    <button
                      type="button"
                      className={cx('back-button')}
                      onClick={() => navigate('/personal-cabinet')}
                    >
                      {t('button_back', 'Назад')}
                    </button>
                    <button
                      type="submit"
                      className={cx('save-button')}
                    >
                      {t('button_save', 'Сохранить')}
                    </button>
                  </div>

                  <Info text={t('form_info', 'Все поля обязательны для заполнения')} />
                </Form>
              )}
            </Formik>
          </FormContainer>
        </div>
      </PersonalCabinetLayout>
    </div>
  )
}