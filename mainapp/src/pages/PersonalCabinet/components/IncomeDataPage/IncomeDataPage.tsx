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

import styles from './IncomeDataPage.module.scss'

const cx = classNames.bind(styles)

interface IncomeDataFormTypes {
  mainIncomeSource: string
  workAddress: string
  incomeLastMonth: string
  incomeMonthBeforeLast: string
  incomeThreeMonthsAgo: string
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
}

interface IncomeDataPageProps {
  userName?: string
}

const validationSchema = Yup.object().shape({
  mainIncomeSource: Yup.string().required('יש לבחור מקור הכנסה'),
  workAddress: Yup.string().required('כתובת מקום העבודה נדרשת'),
  incomeLastMonth: Yup.string().required('הכנסה בחודש האחרון נדרשת'),
  incomeMonthBeforeLast: Yup.string().required('הכנסה בחודש שלפני האחרון נדרשת'),
  incomeThreeMonthsAgo: Yup.string().required('הכנסה משלושה חודשים נדרשת'),
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
    workAddress: '',
    incomeLastMonth: '',
    incomeMonthBeforeLast: '',
    incomeThreeMonthsAgo: '',
    hasSavings: '',
    savingsAmount: '',
    hasOtherProperty: '',
    propertyValue: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    accountOwner: '',
    additionalBankAccounts: []
  }

  const handleSubmit = (values: IncomeDataFormTypes) => {
    console.log('Income data submitted:', values)
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
    { value: 'employment', label: t('employment', 'Работа по найму') },
    { value: 'self_employed', label: t('self_employed', 'Самозанятость') },
    { value: 'business', label: t('business', 'Бизнес') },
    { value: 'pension', label: t('pension', 'Пенсия') },
    { value: 'unemployed', label: t('unemployed', 'Безработный') }
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
                  {/* Main Income Source and Work Address */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <label htmlFor="mainIncomeSource">
                          {t('main_income_source', 'Основной источник дохода')}
                        </label>
                        <select
                          id="mainIncomeSource"
                          name="mainIncomeSource"
                          value={values.mainIncomeSource}
                          onChange={(e) => setFieldValue('mainIncomeSource', e.target.value)}
                          className={cx('select-input')}
                        >
                          <option value="">{t('select_answer', 'Выберите ответ')}</option>
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
                          placeholder={t('enter_work_address', 'Введите Адрес места работы')}
                          className={cx('text-input')}
                        />
                        {errors.workAddress && touched.workAddress && (
                          <div className={cx('error')}>{errors.workAddress}</div>
                        )}
                      </div>
                    </Column>
                  </Row>

                  {/* Monthly Income Fields */}
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
                          placeholder="₪"
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
                          <option value="">{t('select_answer', 'Выберите ответ')}</option>
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
                          <option value="">{t('select_answer', 'Выберите ответ')}</option>
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