import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import { PersonalCabinetLayout } from '../PersonalCabinetLayout/PersonalCabinetLayout'
import { Button } from '@src/components/ui/ButtonUI'
import { Calendar } from '@src/components/ui/Calendar'

import styles from './CreditHistoryConsentPage.module.scss'

const cx = classNames.bind(styles)

interface CreditHistoryConsentPageProps {
  userName?: string
}

interface ConsentFormTypes {
  consentDateIfNotApproved: string
  consentDateIfApproved: string
}

const validationSchema = Yup.object().shape({
  consentDateIfNotApproved: Yup.string().required('Дата согласия обязательна для заполнения'),
  consentDateIfApproved: Yup.string().required('Дата согласия обязательна для заполнения'),
})

export const CreditHistoryConsentPage: React.FC<CreditHistoryConsentPageProps> = ({ 
  userName = "Александр Пушкин" 
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const initialValues: ConsentFormTypes = {
    consentDateIfNotApproved: '',
    consentDateIfApproved: '',
  }

  const handleSubmit = (values: ConsentFormTypes) => {
    console.log('Credit History Consent data submitted:', values)
    // Navigate to next step (Service Payment - LK-136)
    navigate('/personal-cabinet/service-payment')
  }

  const handleBack = () => {
    navigate('/personal-cabinet/documents')
  }

  return (
    <div className={cx('credit-history-consent-page')}>
      <PersonalCabinetLayout>
        <div className={cx('content')}>
          {/* Action 16: Page Title */}
          <div className={cx('page-header')}>
            <h1 className={cx('page-title')}>
              {t('credit_history_consent_title', 'Согласие на запрос данных кредитной истории')}
            </h1>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched, isValid }) => (
              <Form>
                <div className={cx('consent-content')}>
                  {/* Action 17: Legal Text Part 1 */}
                  <div className={cx('legal-text-section')}>
                    <p className={cx('legal-text')}>
                      {t('consent_legal_text_1', 'Мы просим вашего согласия связать с бюро кредитных историй, чтобы получить ваши кредитные данные от Банка Израиля. Эти данные помогут нам изучить вашу заявку и скорректировать для вас ипотечное предложение')}
                    </p>
                    
                    <p className={cx('legal-text')}>
                      {t('consent_legal_text_2', `Я ${userName}, уполномочивает Bankimonlin связаться с бюро кредитных историй Пока я твердо согласен. Чтобы получить мой кредитный отчет с целью рассмотрения вопроса о получении ипотечного кредита`)}
                    </p>
                    
                    <p className={cx('legal-text')}>
                      {t('consent_legal_text_3', 'Мое согласие дано в силу того, что я являюсь заявителем на получение ипотечного кредита')}
                    </p>
                  </div>

                  {/* Consent Duration Section */}
                  <div className={cx('consent-duration-section')}>
                    <h2 className={cx('section-title')}>
                      {t('consent_duration_title', 'Срок действия согласия')}
                    </h2>

                    {/* Action 12: Date input for non-approved mortgage */}
                    <div className={cx('date-input-section')}>
                      <div className={cx('date-input-wrapper')}>
                        <div className={cx('radio-dot')} />
                        <div className={cx('date-input-content')}>
                          <label className={cx('date-label')}>
                            {t('consent_if_not_approved', 'Если ипотека не будет одобрена, мое согласие будет действовать до')}
                          </label>
                          <div className={cx('calendar-wrapper')}>
                            <Calendar
                              value={values.consentDateIfNotApproved}
                              onChange={(value) => setFieldValue('consentDateIfNotApproved', value || '')}
                              placeholder="ДД / ММ / ГГ"
                              error={errors.consentDateIfNotApproved && touched.consentDateIfNotApproved ? errors.consentDateIfNotApproved : undefined}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action 13: Date input for approved mortgage */}
                    <div className={cx('date-input-section')}>
                      <div className={cx('date-input-wrapper')}>
                        <div className={cx('radio-dot')} />
                        <div className={cx('date-input-content')}>
                          <label className={cx('date-label')}>
                            {t('consent_if_approved', 'Если ипотека будет одобрена, мое согласие будет действовать до окончание ипотеки или до даты')}
                          </label>
                          <div className={cx('calendar-wrapper')}>
                            <Calendar
                              value={values.consentDateIfApproved}
                              onChange={(value) => setFieldValue('consentDateIfApproved', value || '')}
                              placeholder="ДД / ММ / ГГ"
                              error={errors.consentDateIfApproved && touched.consentDateIfApproved ? errors.consentDateIfApproved : undefined}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action 18: Legal Text Part 2 */}
                  <div className={cx('legal-text-section-2')}>
                    <p className={cx('legal-text')}>
                      {t('consent_legal_text_4', 'Я понимаю, что мой кредитный отчет включает кредитные данные из базы данных: кредитных данных Банка Израиля, включая информацию о кредитах, текущих счета, структурах кредитных карт ипотечных кредитах, а также информацию о процедурах исплатежеспособности и финансового оздоровления Процедуры исполнения и ограничения счета в соответствии с Законом о непокрытых чеках')}
                    </p>
                    
                    <p className={cx('legal-text')}>
                      {t('consent_legal_text_5', 'Мое согласие позволяет Bankimonline получить мой кредитный рейтинг, а также позволит кредитному бюро предоставлять банку Bankimonline информацию о любых изменениях в моих кредитных данных и моей способности продолжать выполнять условия ипотеки, пока действует соглашение')}
                    </p>
                    
                    <p className={cx('legal-text')}>
                      {t('consent_legal_text_6', 'Предоставление информации из бюро кредитных историй зависит от моего согласия и я не обязан давать это согласие')}
                    </p>
                    
                    <p className={cx('legal-text')}>
                      {t('consent_legal_text_7', 'Уведомления о получении кредитной выписки Сообщаем Вам что с целью рассмотрения заявок на предоставление кредита банк может обратиться в бюро кредитных историй для получения кредитного отчета С этой целью кредитное бюро отправит запрос в Банк Израиля на получение кредитных данных, содержащихся о вас в базе данных.')}
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className={cx('button-section')}>
                    {/* Action 14: Back Button */}
                    <Button
                      variant="secondary"
                      onClick={handleBack}
                      type="button"
                      className={cx('back-button')}
                    >
                      {t('button_back', 'Назад')}
                    </Button>

                    {/* Action 15: I Agree Button */}
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={!isValid}
                      className={cx('agree-button')}
                    >
                      {t('button_agree', 'Я согласен')}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </PersonalCabinetLayout>
    </div>
  )
}

export default CreditHistoryConsentPage 