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
import { Button } from '@components/ui/ButtonUI'

import styles from './CreditHistoryPage.module.scss'

const cx = classNames.bind(styles)

interface CreditHistoryPageProps {
  userName?: string
}

interface CreditHistoryFormTypes {
  hasCurrentLoans: string
  loanAmount?: string
  monthlyPayment?: string
  hasCreditHistory: string
  hasLoanDefaults: string
  hasPaymentDelays: string
  bankName: string
  branch: string
  accountNumber: string
  accountOwner: string
}

const validationSchema = Yup.object().shape({
  hasCurrentLoans: Yup.string().required('יש לבחור תשובה'),
  loanAmount: Yup.string().when('hasCurrentLoans', {
    is: 'yes',
    then: (schema) => schema.required('סכום ההלוואה נדרש'),
    otherwise: (schema) => schema.notRequired(),
  }),
  monthlyPayment: Yup.string().when('hasCurrentLoans', {
    is: 'yes',
    then: (schema) => schema.required('תשלום חודשי נדרש'),
    otherwise: (schema) => schema.notRequired(),
  }),
  hasCreditHistory: Yup.string().required('יש לבחור תשובה'),
  hasLoanDefaults: Yup.string().required('יש לבחור תשובה'),
  hasPaymentDelays: Yup.string().required('יש לבחור תשובה'),
  bankName: Yup.string().required('שם הבנק נדרש'),
  branch: Yup.string().required('סניף נדרש'),
  accountNumber: Yup.string().required('מספר חשבון נדרש'),
  accountOwner: Yup.string().required('בעל החשבון נדרש'),
})

const CreditHistoryPage: React.FC<CreditHistoryPageProps> = ({ 
  userName = "דוד כהן" 
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const initialValues: CreditHistoryFormTypes = {
    hasCurrentLoans: '',
    loanAmount: '',
    monthlyPayment: '',
    hasCreditHistory: '',
    hasLoanDefaults: '',
    hasPaymentDelays: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    accountOwner: '',
  }

  const handleSubmit = (values: CreditHistoryFormTypes) => {
    console.log('Credit History data submitted:', values)
    // Navigate to next step (Documents page - LK-131)
    navigate('/personal-cabinet/documents')
  }

  const handleBack = () => {
    navigate('/personal-cabinet/co-borrower-income-data')
  }

  const bankOptions = [
    { value: 'bank_hapoalim', label: 'Bank Hapoalim' },
    { value: 'bank_leumi', label: 'Bank Leumi' },
    { value: 'bank_discount', label: 'Bank Discount' },
    { value: 'bank_mizrahi', label: 'Bank Mizrahi' },
    { value: 'bank_igud', label: 'Bank Igud' },
    { value: 'first_international_bank', label: 'First International Bank' },
  ]

  const branchOptions = [
    { value: 'tel_aviv_center', label: 'Tel Aviv Center' },
    { value: 'jerusalem_main', label: 'Jerusalem Main' },
    { value: 'haifa_center', label: 'Haifa Center' },
    { value: 'beer_sheva_main', label: 'Beer Sheva Main' },
    { value: 'netanya_center', label: 'Netanya Center' },
  ]

  return (
    <div className={cx('credit-history-page')}>
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

          <FormContainer>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form>
                  <FormCaption 
                    title={t('credit_history_title', 'Кредитная история')}
                    subtitle="4 из 4"
                  />

                  <Info 
                    text={t('credit_history_info', 'Ваши данные не попадут третьим лицам кроме банков партнеров и брокеров, мы соблюдаем закон о защите данных')}
                  />

                  {/* Current Loans Questions */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <label>
                          {t('has_current_loans_question', 'Есть ли у вас действующие кредиты/займы?')}
                        </label>
                        <div className={cx('button-group')}>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasCurrentLoans === 'yes' })}
                            onClick={() => setFieldValue('hasCurrentLoans', 'yes')}
                          >
                            {t('yes', 'Да')}
                          </button>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasCurrentLoans === 'no' })}
                            onClick={() => setFieldValue('hasCurrentLoans', 'no')}
                          >
                            {t('no', 'Нет')}
                          </button>
                        </div>
                        {errors.hasCurrentLoans && touched.hasCurrentLoans && (
                          <div className={cx('error')}>{errors.hasCurrentLoans}</div>
                        )}
                      </div>
                    </Column>
                  </Row>

                  {/* Conditional Loan Details */}
                  {values.hasCurrentLoans === 'yes' && (
                    <Row>
                      <Column>
                        <div className={cx('form-field')}>
                          <label htmlFor="loanAmount">
                            {t('loan_amount', 'Сумма кредита')}
                          </label>
                          <input
                            type="text"
                            id="loanAmount"
                            name="loanAmount"
                            value={values.loanAmount}
                            onChange={(e) => setFieldValue('loanAmount', e.target.value)}
                            placeholder="₪"
                            className={cx('text-input')}
                          />
                          {errors.loanAmount && touched.loanAmount && (
                            <div className={cx('error')}>{errors.loanAmount}</div>
                          )}
                        </div>
                      </Column>

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
                            placeholder="₪"
                            className={cx('text-input')}
                          />
                          {errors.monthlyPayment && touched.monthlyPayment && (
                            <div className={cx('error')}>{errors.monthlyPayment}</div>
                          )}
                        </div>
                      </Column>
                    </Row>
                  )}

                  <Divider />

                  {/* Credit History Questions */}
                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <label>
                          {t('has_credit_history_question', 'Есть ли у вас кредитная история?')}
                        </label>
                        <div className={cx('button-group')}>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasCreditHistory === 'yes' })}
                            onClick={() => setFieldValue('hasCreditHistory', 'yes')}
                          >
                            {t('yes', 'Да')}
                          </button>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasCreditHistory === 'no' })}
                            onClick={() => setFieldValue('hasCreditHistory', 'no')}
                          >
                            {t('no', 'Нет')}
                          </button>
                        </div>
                        {errors.hasCreditHistory && touched.hasCreditHistory && (
                          <div className={cx('error')}>{errors.hasCreditHistory}</div>
                        )}
                      </div>
                    </Column>

                    <Column>
                      <div className={cx('form-field')}>
                        <label>
                          {t('has_loan_defaults_question', 'Были ли случаи невозврата кредитов?')}
                        </label>
                        <div className={cx('button-group')}>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasLoanDefaults === 'yes' })}
                            onClick={() => setFieldValue('hasLoanDefaults', 'yes')}
                          >
                            {t('yes', 'Да')}
                          </button>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasLoanDefaults === 'no' })}
                            onClick={() => setFieldValue('hasLoanDefaults', 'no')}
                          >
                            {t('no', 'Нет')}
                          </button>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasLoanDefaults === 'prefer_not_to_answer' })}
                            onClick={() => setFieldValue('hasLoanDefaults', 'prefer_not_to_answer')}
                          >
                            {t('prefer_not_to_answer', 'Предпочитаю не отвечать')}
                          </button>
                        </div>
                        {errors.hasLoanDefaults && touched.hasLoanDefaults && (
                          <div className={cx('error')}>{errors.hasLoanDefaults}</div>
                        )}
                      </div>
                    </Column>
                  </Row>

                  <Row>
                    <Column>
                      <div className={cx('form-field')}>
                        <label>
                          {t('has_payment_delays_question', 'Были ли задержки платежей по кредитам?')}
                        </label>
                        <div className={cx('button-group')}>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasPaymentDelays === 'yes' })}
                            onClick={() => setFieldValue('hasPaymentDelays', 'yes')}
                          >
                            {t('yes', 'Да')}
                          </button>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasPaymentDelays === 'no' })}
                            onClick={() => setFieldValue('hasPaymentDelays', 'no')}
                          >
                            {t('no', 'Нет')}
                          </button>
                          <button
                            type="button"
                            className={cx('choice-button', { active: values.hasPaymentDelays === 'prefer_not_to_answer' })}
                            onClick={() => setFieldValue('hasPaymentDelays', 'prefer_not_to_answer')}
                          >
                            {t('prefer_not_to_answer', 'Предпочитаю не отвечать')}
                          </button>
                        </div>
                        {errors.hasPaymentDelays && touched.hasPaymentDelays && (
                          <div className={cx('error')}>{errors.hasPaymentDelays}</div>
                        )}
                      </div>
                    </Column>
                  </Row>

                  <Divider />

                  {/* Bank Account Details */}
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
                          <option value="">{t('select_bank', 'Выберите банк')}</option>
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
                          {t('branch', 'Отделение')}
                        </label>
                        <select
                          id="branch"
                          name="branch"
                          value={values.branch}
                          onChange={(e) => setFieldValue('branch', e.target.value)}
                          className={cx('select-input')}
                        >
                          <option value="">{t('select_branch', 'Выберите отделение')}</option>
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
                  </Row>

                  <Row>
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
                          placeholder={t('account_number_placeholder', 'Введите номер счета')}
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
                          placeholder={t('account_owner_placeholder', 'Введите имя владельца')}
                          className={cx('text-input')}
                        />
                        {errors.accountOwner && touched.accountOwner && (
                          <div className={cx('error')}>{errors.accountOwner}</div>
                        )}
                      </div>
                    </Column>
                  </Row>

                  {/* Navigation Buttons */}
                  <Row>
                    <Column>
                      <Button
                        variant="secondary"
                        onClick={handleBack}
                        type="button"
                      >
                        {t('button_back', 'Назад')}
                      </Button>
                    </Column>
                    <Column>
                      {/* Empty column for spacing */}
                    </Column>
                    <Column>
                      <Button
                        variant="primary"
                        type="submit"
                      >
                        {t('button_continue', 'Продолжить')}
                      </Button>
                    </Column>
                  </Row>
                </Form>
              )}
            </Formik>
          </FormContainer>
        </div>
      </PersonalCabinetLayout>
    </div>
  )
}

export default CreditHistoryPage 