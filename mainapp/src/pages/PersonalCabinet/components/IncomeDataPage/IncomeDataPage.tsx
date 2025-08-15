import React, { useState } from 'react'
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
import { Button } from '@components/ui/ButtonUI'
import { useContentApi } from '@src/hooks/useContentApi'

import styles from './IncomeDataPage.module.scss'

const cx = classNames.bind(styles)

interface IncomeDataFormTypes {
  mainIncomeSource: string
  monthlyIncome: string          // Action #5 - Monthly income amount
  workAddress: string            // Action #6 - Work address
  workStartDate: string          // Action #7 - Work start date
  activitySphere: string         // Action #8 - Activity sphere
  professionName: string         // Action #9 - Profession name
  incomeLastMonth: string        // Action #10 - Last month income
  incomeMonthBeforeLast: string  // Action #11 - Month before last income
  incomeThreeMonthsAgo: string   // Action #12 - Three months ago income
  companyName: string            // Action #13 - Company name
  
  // Additional income (Actions #15-17)
  additionalIncomeSource: string
  additionalIncomeAmount: string
  
  // Debt obligations (Actions #18-22)
  debtType: string
  debtBank: string
  monthlyPayment: string
  debtEndDate: string
  
  hasSavings: string
  savingsAmount?: string
  hasOtherProperty: string
  propertyValue?: string
  bankName: string
  branch: string
  accountNumber: string
  accountOwner: string
  additionalBankAccounts: Array<{
    bankName: string
    branch: string
    accountNumber: string
    accountOwner: string
  }>
  
  // Co-borrowers (Actions #30-31, #34-35)
  coBorrowers: Array<{
    id: string
    name: string
    relationship: string
  }>
}

interface IncomeDataPageProps {
  userName?: string
}

const validationSchema = Yup.object().shape({
  mainIncomeSource: Yup.string().required('Основной источник дохода обязателен'),
  monthlyIncome: Yup.string().when('mainIncomeSource', {
    is: (value: string) => value !== 'unemployed',
    then: (schema) => schema.required('Сумма ежемесячного дохода обязательна'),
    otherwise: (schema) => schema.notRequired(),
  }),
  workAddress: Yup.string().when('mainIncomeSource', {
    is: (value: string) => value !== 'unemployed',
    then: (schema) => schema.required('Адрес места работы обязателен'),
    otherwise: (schema) => schema.notRequired(),
  }),
  workStartDate: Yup.string().when('mainIncomeSource', {
    is: (value: string) => value !== 'unemployed',
    then: (schema) => schema.required('Дата начала работы обязательна'),
    otherwise: (schema) => schema.notRequired(),
  }),
  activitySphere: Yup.string().when('mainIncomeSource', {
    is: (value: string) => value !== 'unemployed',
    then: (schema) => schema.required('Сфера деятельности обязательна'),
    otherwise: (schema) => schema.notRequired(),
  }),
  professionName: Yup.string().when('mainIncomeSource', {
    is: (value: string) => value !== 'unemployed',
    then: (schema) => schema.required('Название профессии обязательно'),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: Yup.string().when('mainIncomeSource', {
    is: (value: string) => value !== 'unemployed',
    then: (schema) => schema.required('Название компании обязательно'),
    otherwise: (schema) => schema.notRequired(),
  }),
  incomeLastMonth: Yup.string().when('mainIncomeSource', {
    is: (value: string) => value !== 'unemployed',
    then: (schema) => schema.required('Доход за прошлый месяц обязателен'),
    otherwise: (schema) => schema.notRequired(),
  }),
  incomeMonthBeforeLast: Yup.string().when('mainIncomeSource', {
    is: (value: string) => value !== 'unemployed',
    then: (schema) => schema.required('Доход за позапрошлый месяц обязателен'),
    otherwise: (schema) => schema.notRequired(),
  }),
  incomeThreeMonthsAgo: Yup.string().when('mainIncomeSource', {
    is: (value: string) => value !== 'unemployed',
    then: (schema) => schema.required('Доход за позапозапрошлый месяц обязателен'),
    otherwise: (schema) => schema.notRequired(),
  }),
  additionalIncomeSource: Yup.string().notRequired(),
  additionalIncomeAmount: Yup.string().when('additionalIncomeSource', {
    is: (value: string) => value && value !== '',
    then: (schema) => schema.required('Сумма дополнительного дохода обязательна'),
    otherwise: (schema) => schema.notRequired(),
  }),
  debtType: Yup.string().notRequired(),
  debtBank: Yup.string().when('debtType', {
    is: (value: string) => value && value !== 'no',
    then: (schema) => schema.required('Банк обязателен'),
    otherwise: (schema) => schema.notRequired(),
  }),
  monthlyPayment: Yup.string().when('debtType', {
    is: (value: string) => value && value !== 'no',
    then: (schema) => schema.required('Ежемесячный платеж обязателен'),
    otherwise: (schema) => schema.notRequired(),
  }),
  debtEndDate: Yup.string().when('debtType', {
    is: (value: string) => value && value !== 'no',
    then: (schema) => schema.required('Дата окончания кредита обязательна'),
    otherwise: (schema) => schema.notRequired(),
  }),
  hasSavings: Yup.string().required('יש לבחור תשובה'),
  savingsAmount: Yup.string().when('hasSavings', {
    is: 'yes',
    then: (schema) => schema.required('סכום החיסכון נדרש'),
    otherwise: (schema) => schema.notRequired(),
  }),
  hasOtherProperty: Yup.string().required('יש לבחור תשובה'),
  propertyValue: Yup.string().when('hasOtherProperty', {
    is: 'yes',
    then: (schema) => schema.required('שווי הנכס נדרש'),
    otherwise: (schema) => schema.notRequired(),
  }),
  bankName: Yup.string().required('שם הבנק נדרש'),
  branch: Yup.string().required('סניף נדרש'),
  accountNumber: Yup.string().required('מספר חשבון נדרש'),
  accountOwner: Yup.string().required('בעל החשבון נדרש'),
})

const IncomeDataPage: React.FC<IncomeDataPageProps> = ({ 
  userName = "Александр Пушкин" 
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showAdditionalAccounts, setShowAdditionalAccounts] = useState(false)
  const { getContent } = useContentApi('personal_cabinet')

  // Get current month names (dynamic based on current date)
  const getCurrentMonthNames = () => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
    const monthBeforeLast = new Date(now.getFullYear(), now.getMonth() - 2)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3)

    const monthNames = {
      ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      he: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
           'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
      en: ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December']
    }

    const currentLang = 'ru' // Default to Russian as per Figma
    
    return {
      lastMonth: monthNames[currentLang][lastMonth.getMonth()],
      monthBeforeLast: monthNames[currentLang][monthBeforeLast.getMonth()],
      threeMonthsAgo: monthNames[currentLang][threeMonthsAgo.getMonth()]
    }
  }

  const monthNames = getCurrentMonthNames()

  const initialValues: IncomeDataFormTypes = {
    mainIncomeSource: '',
    monthlyIncome: '',
    workAddress: '',
    workStartDate: '',
    activitySphere: '',
    professionName: '',
    incomeLastMonth: '',
    incomeMonthBeforeLast: '',
    incomeThreeMonthsAgo: '',
    companyName: '',
    additionalIncomeSource: '',
    additionalIncomeAmount: '',
    debtType: '',
    debtBank: '',
    monthlyPayment: '',
    debtEndDate: '',
    hasSavings: '',
    savingsAmount: '',
    hasOtherProperty: '',
    propertyValue: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    accountOwner: '',
    additionalBankAccounts: [],
    coBorrowers: []
  }

  const handleSubmit = (values: IncomeDataFormTypes) => {
    // Navigate to next step (Documents page - LK-131)
    navigate('/personal-cabinet/documents')
  }

  const handleBack = () => {
    navigate('/personal-cabinet/main-borrower-personal-data')
  }

  const handleAddBankAccount = () => {
    setShowAdditionalAccounts(true)
  }

  const incomeSourceOptions = [
    { value: 'employment', label: getContent('employment') || t('employment', 'Работа по найму') },
    { value: 'self_employed', label: getContent('self_employed') || t('self_employed', 'Самозанятость') },
    { value: 'business', label: getContent('business') || t('business', 'Бизнес') },
    { value: 'pension', label: getContent('pension') || t('pension', 'Пенсия') },
    { value: 'unemployed', label: getContent('unemployed') || t('unemployed', 'Безработный') }
  ]

  const activitySphereOptions = [
    { value: 'it_technology', label: getContent('it_technology') || t('it_technology', 'IT и технологии') },
    { value: 'finance_banking', label: getContent('finance_banking') || t('finance_banking', 'Финансы и банковское дело') },
    { value: 'healthcare', label: getContent('healthcare') || t('healthcare', 'Здравоохранение') },
    { value: 'education', label: getContent('education') || t('education', 'Образование') },
    { value: 'construction', label: getContent('construction') || t('construction', 'Строительство') },
    { value: 'retail_trade', label: getContent('retail_trade') || t('retail_trade', 'Розничная торговля') },
    { value: 'manufacturing', label: getContent('manufacturing') || t('manufacturing', 'Производство') },
    { value: 'government', label: getContent('government') || t('government', 'Государственная служба') },
    { value: 'transport_logistics', label: getContent('transport_logistics') || t('transport_logistics', 'Транспорт и логистика') },
    { value: 'consulting', label: getContent('consulting') || t('consulting', 'Консалтинг') },
    { value: 'real_estate', label: getContent('real_estate') || t('real_estate', 'Недвижимость') },
    { value: 'other', label: getContent('other') || t('other', 'Другое') }
  ]

  const additionalIncomeOptions = [
    { value: 'alimony', label: getContent('alimony') || t('alimony', 'Алименты') },
    { value: 'rental_income', label: getContent('rental_income') || t('rental_income', 'Доходы от аренды') },
    { value: 'investment_income', label: getContent('investment_income') || t('investment_income', 'Инвестиционные доходы') },
    { value: 'freelance', label: getContent('freelance') || t('freelance', 'Фриланс') },
    { value: 'other_income', label: getContent('other_income') || t('other_income', 'Другие доходы') }
  ]

  const debtTypeOptions = [
    { value: 'no', label: t('no_debt', 'Нет') },
    { value: 'bank_credit', label: t('bank_credit', 'Банковский кредит') },
    { value: 'mortgage', label: t('mortgage', 'Ипотека') },
    { value: 'car_loan', label: t('car_loan', 'Автокредит') },
    { value: 'credit_card', label: t('credit_card', 'Кредитная карта') },
    { value: 'personal_loan', label: t('personal_loan', 'Потребительский кредит') },
    { value: 'other_debt', label: t('other_debt', 'Другие долговые обязательства') }
  ]

  const bankOptions = [
    { value: 'bank1', label: 'Банк Леуми' },
    { value: 'bank2', label: 'Банк Апоалим' },
    { value: 'bank3', label: 'Банк Дисконт' },
    { value: 'bank4', label: 'Банк Мизрахи' }
  ]

  const branchOptions = [
    { value: 'branch1', label: 'Филиал Тель-Авив' },
    { value: 'branch2', label: 'Филиал Иерусалим' },
    { value: 'branch3', label: 'Филиал Хайфа' }
  ]

  return (
    <div className={cx('income-data-page')}>
      <PersonalCabinetLayout>
        <div className={cx('content')}>
          <div className={cx('header')}>
            <h1 className={cx('user-name')}>{userName}</h1>
            <button 
              className={cx('back-to-cabinet')}
              onClick={() => navigate('/personal-cabinet')}
            >
              {t('back_to_personal_cabinet', 'Вернуться в личный кабинет')}
            </button>
          </div>

          {/* Information Banner */}
          <div className={cx('info-banner')}>
            <Info 
              text={t('data_privacy_message', 'Ваши данные не попадут третьим лицам кроме банков партнеров и брокеров, мы соблюдаем закон о защите данных')}
              variant="success"
            />
          </div>

          <FormContainer>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form>
                  {/* Main Income Source and Monthly Income - Actions #4-5 */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <label htmlFor="mainIncomeSource">
                          {getContent('main_income_source') || t('main_income_source', 'Основной источник дохода')}
                        </label>
                        <select
                          id="mainIncomeSource"
                          name="mainIncomeSource"
                          value={values.mainIncomeSource}
                          onChange={(e) => setFieldValue('mainIncomeSource', e.target.value)}
                          className={cx('select-input')}
                        >
                          <option value="">{getContent('select_answer') || t('select_answer', 'Выберите ответ')}</option>
                          {incomeSourceOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.mainIncomeSource && touched.mainIncomeSource && (
                          <div className={cx('error')}>{errors.mainIncomeSource}</div>
                        )}
                      </div>
                    </Column>

                    {/* Action #5 - Monthly Income Amount */}
                    {values.mainIncomeSource !== 'unemployed' && (
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="monthlyIncome">
                            {t('monthly_income', 'Сумма ежемесячного дохода')}
                          </label>
                          <input
                            type="text"
                            id="monthlyIncome"
                            name="monthlyIncome"
                            value={values.monthlyIncome}
                            onChange={(e) => setFieldValue('monthlyIncome', e.target.value)}
                            placeholder="3,500 ₪"
                            className={cx('text-input')}
                          />
                          <div className={cx('hint')}>
                            {t('monthly_income_hint', 'Указывается сумма после вычета налогов подтвержденная бухгалтером')}
                          </div>
                          {errors.monthlyIncome && touched.monthlyIncome && (
                            <div className={cx('error')}>{errors.monthlyIncome}</div>
                          )}
                        </div>
                      </Column>
                    )}
                  </Row>

                  {/* Work Details - Actions #6-9 */}
                  {values.mainIncomeSource !== 'unemployed' && (
                    <Row>
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="workAddress">
                            {t('work_address', 'Адрес места работы')}
                          </label>
                          <input
                            type="text"
                            id="workAddress"
                            name="workAddress"
                            value={values.workAddress}
                            onChange={(e) => setFieldValue('workAddress', e.target.value)}
                            placeholder={t('enter_work_address', 'Введите адрес проживания')}
                            className={cx('text-input')}
                          />
                          {errors.workAddress && touched.workAddress && (
                            <div className={cx('error')}>{errors.workAddress}</div>
                          )}
                        </div>
                      </Column>

                      {/* Action #7 - Work Start Date */}
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="workStartDate">
                            {t('work_start_date', 'Дата начала работы/деятельности')}
                          </label>
                          <input
                            type="date"
                            id="workStartDate"
                            name="workStartDate"
                            value={values.workStartDate}
                            onChange={(e) => setFieldValue('workStartDate', e.target.value)}
                            className={cx('text-input')}
                          />
                          <div className={cx('hint')}>
                            {t('work_start_hint', 'Если срок начала работы меньше трех месяцев, то указывается предыдущее место работы')}
                          </div>
                          {errors.workStartDate && touched.workStartDate && (
                            <div className={cx('error')}>{errors.workStartDate}</div>
                          )}
                        </div>
                      </Column>
                    </Row>
                  )}

                  {/* Activity Sphere and Profession - Actions #8-9 */}
                  {values.mainIncomeSource !== 'unemployed' && (
                    <Row>
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="activitySphere">
                            {t('activity_sphere', 'Сфера деятельности')}
                          </label>
                          <select
                            id="activitySphere"
                            name="activitySphere"
                            value={values.activitySphere}
                            onChange={(e) => setFieldValue('activitySphere', e.target.value)}
                            className={cx('select-input')}
                          >
                            <option value="">{t('select_education', 'Образование')}</option>
                            {activitySphereOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.activitySphere && touched.activitySphere && (
                            <div className={cx('error')}>{errors.activitySphere}</div>
                          )}
                        </div>
                      </Column>

                      {/* Action #9 - Profession Name */}
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="professionName">
                            {getContent('profession_name') || t('profession_name', 'Название профессии')}
                          </label>
                          <input
                            type="text"
                            id="professionName"
                            name="professionName"
                            value={values.professionName}
                            onChange={(e) => setFieldValue('professionName', e.target.value)}
                            placeholder={t('enter_profession', 'Учитель начальных классов')}
                            className={cx('text-input')}
                          />
                          {errors.professionName && touched.professionName && (
                            <div className={cx('error')}>{errors.professionName}</div>
                          )}
                        </div>
                      </Column>
                    </Row>
                  )}

                  {/* Company Name - Action #13 */}
                  {values.mainIncomeSource !== 'unemployed' && (
                    <Row>
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="companyName">
                            {t('company_name', 'Название компании')}
                          </label>
                          <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={values.companyName}
                            onChange={(e) => setFieldValue('companyName', e.target.value)}
                            placeholder="Bankimonline"
                            className={cx('text-input')}
                          />
                          {errors.companyName && touched.companyName && (
                            <div className={cx('error')}>{errors.companyName}</div>
                          )}
                        </div>
                      </Column>

                      {/* Action #14 - Add Workplace Button */}
                      <Column>
                        <div className={cx('form-field')}>
                          <button
                            type="button"
                            className={cx('add-button')}
                            onClick={() => {
                              // Add workplace functionality - would open modal in full implementation
                              }}
                          >
                            <span>+</span>
                            {t('add_workplace', 'Добавить место работы')}
                          </button>
                        </div>
                      </Column>
                    </Row>
                  )}

                  {/* Monthly Income Fields - Actions #10-12 */}
                  {values.mainIncomeSource !== 'unemployed' && (
                    <Row>
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="incomeLastMonth">
                            {t('income_last_month', 'Доход за прошлый месяц')} ({monthNames.lastMonth})
                          </label>
                          <input
                            type="text"
                            id="incomeLastMonth"
                            name="incomeLastMonth"
                            value={values.incomeLastMonth}
                            onChange={(e) => setFieldValue('incomeLastMonth', e.target.value)}
                            placeholder="3,500 ₪"
                            className={cx('text-input')}
                          />
                          <div className={cx('hint')}>
                            {t('income_hint', 'Указывается сумма после вычета налогов подтвержденная бухгалтером')}
                          </div>
                          {errors.incomeLastMonth && touched.incomeLastMonth && (
                            <div className={cx('error')}>{errors.incomeLastMonth}</div>
                          )}
                        </div>
                      </Column>

                    <Column>
                      <div className={cx('form-field')}>
                        <label htmlFor="incomeMonthBeforeLast">
                          {t('income_month_before_last', 'Доход за позапрошлый месяц')} ({monthNames.monthBeforeLast})
                        </label>
                        <input
                          type="text"
                          id="incomeMonthBeforeLast"
                          name="incomeMonthBeforeLast"
                          value={values.incomeMonthBeforeLast}
                          onChange={(e) => setFieldValue('incomeMonthBeforeLast', e.target.value)}
                          placeholder="₪"
                          className={cx('text-input')}
                        />
                        <div className={cx('hint')}>
                          {t('income_hint', 'Указывается сумма после вычета налогов подтвержденная бухгалтером')}
                        </div>
                        {errors.incomeMonthBeforeLast && touched.incomeMonthBeforeLast && (
                          <div className={cx('error')}>{errors.incomeMonthBeforeLast}</div>
                        )}
                      </div>
                    </Column>

                    <Column>
                      <div className={cx('form-field')}>
                        <label htmlFor="incomeThreeMonthsAgo">
                          {t('income_three_months_ago', 'Доход за поза-позапрошлый месяц')} ({monthNames.threeMonthsAgo})
                        </label>
                        <input
                          type="text"
                          id="incomeThreeMonthsAgo"
                          name="incomeThreeMonthsAgo"
                          value={values.incomeThreeMonthsAgo}
                          onChange={(e) => setFieldValue('incomeThreeMonthsAgo', e.target.value)}
                          placeholder="₪"
                          className={cx('text-input')}
                        />
                        <div className={cx('hint')}>
                          {t('income_hint', 'Указывается сумма после вычета налогов подтвержденная бухгалтером')}
                        </div>
                        {errors.incomeThreeMonthsAgo && touched.incomeThreeMonthsAgo && (
                          <div className={cx('error')}>{errors.incomeThreeMonthsAgo}</div>
                        )}
                      </div>
                    </Column>
                  </Row>
                  )}

                  {/* Additional Income Section - Actions #15-17 */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <label htmlFor="additionalIncomeSource">
                          {t('additional_income_source', 'Дополнительный источник дохода')}
                        </label>
                        <select
                          id="additionalIncomeSource"
                          name="additionalIncomeSource"
                          value={values.additionalIncomeSource}
                          onChange={(e) => setFieldValue('additionalIncomeSource', e.target.value)}
                          className={cx('select-input')}
                        >
                          <option value="">{t('select_alimony', 'Алименты')}</option>
                          {additionalIncomeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className={cx('hint')}>
                          {t('additional_income_hint', 'Все источники дохода могут быть заложены зрителем банка, поэтому в том числе')}
                        </div>
                        {errors.additionalIncomeSource && touched.additionalIncomeSource && (
                          <div className={cx('error')}>{errors.additionalIncomeSource}</div>
                        )}
                      </div>
                    </Column>

                    {/* Action #16 - Additional Income Amount */}
                    {values.additionalIncomeSource && (
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="additionalIncomeAmount">
                            {t('additional_income_amount', 'Сумма ежемесячного дохода')}
                          </label>
                          <input
                            type="text"
                            id="additionalIncomeAmount"
                            name="additionalIncomeAmount"
                            value={values.additionalIncomeAmount}
                            onChange={(e) => setFieldValue('additionalIncomeAmount', e.target.value)}
                            placeholder="3,500 ₪"
                            className={cx('text-input')}
                          />
                          {errors.additionalIncomeAmount && touched.additionalIncomeAmount && (
                            <div className={cx('error')}>{errors.additionalIncomeAmount}</div>
                          )}
                        </div>
                      </Column>
                    )}
                  </Row>

                  {/* Action #17 - Add Additional Income Source Button */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <button
                          type="button"
                          className={cx('add-button')}
                          onClick={() => {
                            // Add additional income functionality - would open modal in full implementation
                            }}
                        >
                          <span>+</span>
                          {t('add_additional_income', 'Добавить дополнительный источник дохода')}
                        </button>
                      </div>
                    </Column>
                  </Row>

                  {/* Debt Obligations Section - Actions #18-22 */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <label>
                          {t('debt_obligations_question', 'Есть ли у вас кредитные, долговые обязательства?')}
                        </label>
                        <select
                          id="debtType"
                          name="debtType"
                          value={values.debtType}
                          onChange={(e) => setFieldValue('debtType', e.target.value)}
                          className={cx('select-input')}
                        >
                          <option value="">{t('select_bank_credit', 'Банковский кредит')}</option>
                          {debtTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.debtType && touched.debtType && (
                          <div className={cx('error')}>{errors.debtType}</div>
                        )}
                      </div>
                    </Column>

                    {/* Action #19 - Debt Bank */}
                    {values.debtType && values.debtType !== 'no' && (
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="debtBank">
                            {t('debt_bank', 'Банк, оформивший кредит')}
                          </label>
                          <select
                            id="debtBank"
                            name="debtBank"
                            value={values.debtBank}
                            onChange={(e) => setFieldValue('debtBank', e.target.value)}
                            className={cx('select-input')}
                          >
                            <option value="">{t('select_bank_leumi', 'BankLeumi')}</option>
                            {bankOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.debtBank && touched.debtBank && (
                            <div className={cx('error')}>{errors.debtBank}</div>
                          )}
                        </div>
                      </Column>
                    )}

                    {/* Action #20 - Monthly Payment */}
                    {values.debtType && values.debtType !== 'no' && (
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="monthlyPayment">
                            {t('monthly_payment', 'Ежемесячный платеж')}
                          </label>
                          <input
                            type="text"
                            id="monthlyPayment"
                            name="monthlyPayment"
                            value={values.monthlyPayment}
                            onChange={(e) => setFieldValue('monthlyPayment', e.target.value)}
                            placeholder="1000 ₪"
                            className={cx('text-input')}
                          />
                          {errors.monthlyPayment && touched.monthlyPayment && (
                            <div className={cx('error')}>{errors.monthlyPayment}</div>
                          )}
                        </div>
                      </Column>
                    )}
                  </Row>

                  {/* Action #21 - Debt End Date */}
                  {values.debtType && values.debtType !== 'no' && (
                    <Row>
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="debtEndDate">
                            {t('debt_end_date', 'Дата окончания кредита')}
                          </label>
                          <input
                            type="date"
                            id="debtEndDate"
                            name="debtEndDate"
                            value={values.debtEndDate}
                            onChange={(e) => setFieldValue('debtEndDate', e.target.value)}
                            className={cx('text-input')}
                          />
                          {errors.debtEndDate && touched.debtEndDate && (
                            <div className={cx('error')}>{errors.debtEndDate}</div>
                          )}
                        </div>
                      </Column>
                    </Row>
                  )}

                  {/* Action #22 - Add Debt Obligation Button */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <button
                          type="button"
                          className={cx('add-button')}
                          onClick={() => {
                            // Add debt obligation functionality - would open modal in full implementation
                            }}
                        >
                          <span>+</span>
                          {t('add_debt_obligation', 'Добавить долговое обязательство')}
                        </button>
                      </div>
                    </Column>
                  </Row>

                  <Divider />

                  {/* Savings and Property Questions */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <label>
                          {t('has_savings_question', 'Есть ли сбережения, которые не входят в первоначальный взнос по ипотеке?')}
                        </label>
                        <div className={cx('button-group')}>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasSavings === 'yes' })}
                            onClick={() => setFieldValue('hasSavings', 'yes')}
                          >
                            {t('yes', 'Да')}
                          </button>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasSavings === 'no' })}
                            onClick={() => setFieldValue('hasSavings', 'no')}
                          >
                            {t('no', 'Нет')}
                          </button>
                        </div>
                        {values.hasSavings === 'yes' && (
                          <div className={cx('conditional-field')}>
                            <input
                              type="text"
                              name="savingsAmount"
                              value={values.savingsAmount}
                              onChange={(e) => setFieldValue('savingsAmount', e.target.value)}
                              placeholder={t('savings_amount', 'Сумма сбережений')}
                              className={cx('text-input')}
                            />
                          </div>
                        )}
                        {errors.hasSavings && touched.hasSavings && (
                          <div className={cx('error')}>{errors.hasSavings}</div>
                        )}
                      </div>
                    </Column>

                    <Column>
                      <div className={cx('form-field')}>
                        <label>
                          {t('has_other_property_question', 'Есть ли другое имущество в собственности, кроме купленного в ипотеку/ кредит?')}
                        </label>
                        <div className={cx('button-group')}>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasOtherProperty === 'yes' })}
                            onClick={() => setFieldValue('hasOtherProperty', 'yes')}
                          >
                            {t('yes', 'Да')}
                          </button>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasOtherProperty === 'no' })}
                            onClick={() => setFieldValue('hasOtherProperty', 'no')}
                          >
                            {t('no', 'Нет')}
                          </button>
                        </div>
                        {values.hasOtherProperty === 'yes' && (
                          <div className={cx('conditional-field')}>
                            <input
                              type="text"
                              name="propertyValue"
                              value={values.propertyValue}
                              onChange={(e) => setFieldValue('propertyValue', e.target.value)}
                              placeholder={t('property_value', 'Стоимость имущества')}
                              className={cx('text-input')}
                            />
                          </div>
                        )}
                        {errors.hasOtherProperty && touched.hasOtherProperty && (
                          <div className={cx('error')}>{errors.hasOtherProperty}</div>
                        )}
                      </div>
                    </Column>
                  </Row>

                  <Divider />

                  {/* Co-borrowers Section - Actions #30-31, #34-35 */}
                  <div className={cx('section-title')}>
                    <h3>{t('co_borrowers', 'Заемщики')}</h3>
                  </div>

                  {/* Action #30 - Co-borrowers List */}
                  {values.coBorrowers.length > 0 && (
                    <Row>
                      <Column>
                        {values.coBorrowers.map((coBorrower, index) => (
                          <div key={coBorrower.id} className={cx('co-borrower-card')}>
                            <div className={cx('co-borrower-info')}>
                              <span className={cx('co-borrower-name')}>{coBorrower.name}</span>
                              <span className={cx('co-borrower-relationship')}>{coBorrower.relationship}</span>
                            </div>
                            <div className={cx('co-borrower-actions')}>
                              {/* Action #34 - Edit Co-borrower */}
                              <button
                                type="button"
                                className={cx('edit-button')}
                                onClick={() => {
                                  // Navigate to edit co-borrower
                                  navigate(`/personal-cabinet/co-borrower-personal-data/${coBorrower.id}`)
                                }}
                              >
                                ✏️
                              </button>
                              {/* Action #35 - Delete Co-borrower */}
                              <button
                                type="button"
                                className={cx('delete-button')}
                                onClick={() => {
                                  // Open confirmation modal instead of direct deletion
                                  // In real app: would call parent component's modal handler
                                  // For now, show confirmation modal via PersonalCabinet
                                  const confirmed = window.confirm('Вы уверены, что хотите удалить созаемщика?')
                                  if (confirmed) {
                                    const updatedCoBorrowers = values.coBorrowers.filter((_, i) => i !== index)
                                    setFieldValue('coBorrowers', updatedCoBorrowers)
                                  }
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </Column>
                    </Row>
                  )}

                  {/* Action #31 - Add Co-borrower Button */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <button
                          type="button"
                          className={cx('add-button')}
                          onClick={() => {
                            // Navigate to co-borrower personal data page (LK-243)
                            navigate('/personal-cabinet/co-borrower-personal-data')
                          }}
                        >
                          <span>+</span>
                          {t('add_co_borrower', 'Добавить заемщика')}
                        </button>
                      </div>
                    </Column>
                  </Row>

                  <Divider />

                  {/* Bank Account Section */}
                  <div className={cx('section-title')}>
                    <h3>{t('bank_accounts', 'Банковские счета')}</h3>
                  </div>

                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <label htmlFor="bankName">
                          {t('bank_name', 'Название банка')}
                        </label>
                        <select
                          id="bankName"
                          name="bankName"
                          value={values.bankName}
                          onChange={(e) => setFieldValue('bankName', e.target.value)}
                          className={cx('select-input')}
                        >
                          <option value="">{getContent('select_answer') || t('select_answer', 'Выберите ответ')}</option>
                          {bankOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.bankName && touched.bankName && (
                          <div className={cx('error')}>{errors.bankName}</div>
                        )}
                      </div>
                    </Column>

                    <Column>
                      <div className={cx('form-field')}>
                        <label htmlFor="branch">
                          {t('branch', 'Филиал')}
                        </label>
                        <select
                          id="branch"
                          name="branch"
                          value={values.branch}
                          onChange={(e) => setFieldValue('branch', e.target.value)}
                          className={cx('select-input')}
                        >
                          <option value="">{getContent('select_answer') || t('select_answer', 'Выберите ответ')}</option>
                          {branchOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.branch && touched.branch && (
                          <div className={cx('error')}>{errors.branch}</div>
                        )}
                      </div>
                    </Column>

                    <Column>
                      <div className={cx('form-field')}>
                        <label htmlFor="accountNumber">
                          {t('account_number', 'Номер счета')}
                        </label>
                        <input
                          type="text"
                          id="accountNumber"
                          name="accountNumber"
                          value={values.accountNumber}
                          onChange={(e) => setFieldValue('accountNumber', e.target.value)}
                          placeholder={t('enter_account_number', 'Введите номер счета')}
                          className={cx('text-input')}
                        />
                        {errors.accountNumber && touched.accountNumber && (
                          <div className={cx('error')}>{errors.accountNumber}</div>
                        )}
                      </div>
                    </Column>

                    <Column>
                      <div className={cx('form-field')}>
                        <label htmlFor="accountOwner">
                          {t('account_owner', 'Владелец счета')}
                        </label>
                        <input
                          type="text"
                          id="accountOwner"
                          name="accountOwner"
                          value={values.accountOwner}
                          onChange={(e) => setFieldValue('accountOwner', e.target.value)}
                          placeholder={t('enter_account_owner', 'Укажите владельца счета')}
                          className={cx('text-input')}
                        />
                        {errors.accountOwner && touched.accountOwner && (
                          <div className={cx('error')}>{errors.accountOwner}</div>
                        )}
                      </div>
                    </Column>
                  </Row>

                  {/* Add Bank Account Button */}
                  <div className={cx('add-account-section')}>
                    <button
                      type="button"
                      className={cx('add-account-button')}
                      onClick={handleAddBankAccount}
                    >
                      <span className={cx('plus-icon')}>+</span>
                      {t('add_bank_account', 'Добавить Банковский счет')}
                    </button>
                  </div>

                  {/* Navigation Buttons */}
                  <div className={cx('navigation-buttons')}>
                    <Button
                      variant="secondary"
                      onClick={handleBack}
                      type="button"
                    >
                      {t('back', 'Назад')}
                    </Button>
                    
                    <Button
                      variant="primary"
                      type="submit"
                    >
                      {t('save_and_continue', 'Сохранить и продолжить')}
                    </Button>
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

export default IncomeDataPage 