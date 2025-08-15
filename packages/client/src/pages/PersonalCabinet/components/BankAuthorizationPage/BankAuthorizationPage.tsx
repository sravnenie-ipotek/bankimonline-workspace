import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

import { PersonalCabinetLayout } from '../PersonalCabinetLayout/PersonalCabinetLayout'
import { Button } from '@src/components/ui/ButtonUI'
import { Calendar } from '@src/components/ui/Calendar'

import styles from './bankAuthorizationPage.module.scss'

const cx = classNames.bind(styles)

interface BankAuthorizationPageProps {
  userName?: string
}

interface BankAuthorizationFormTypes {
  contractSigningDate: string
}

const validationSchema = Yup.object().shape({
  contractSigningDate: Yup.string().required('Дата подписания договора обязательна для заполнения'),
})

export const BankAuthorizationPage: React.FC<BankAuthorizationPageProps> = ({ 
  userName = "Пользователь" 
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Get current date in DD/MM/YY format for pre-filling
  const getCurrentDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = String(today.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }

  const initialValues: BankAuthorizationFormTypes = {
    contractSigningDate: getCurrentDate(),
  }

  const handleSubmit = (values: BankAuthorizationFormTypes) => {
    // Save authorization data to user profile
    // Navigate to "Application Submitted" page (LK-133)
    navigate('/personal-cabinet/application-submitted')
  }

  const handleBack = () => {
    // Navigate back to Documents page (LK-131)
    navigate('/personal-cabinet/documents')
  }

  const handleReturnToPersonalCabinet = () => {
    // Action #2: Return to Personal Cabinet (LK-126)
    navigate('/personal-cabinet')
  }

  // Action #6: Main legal text (should be loaded from admin panel in real implementation)
  const legalText = `Предоставленный текст содержит неструктурированный список с пунктами и подпунктами, поэтому для его перевода на русский язык и расстановки в таком же порядке я предлагаю привести его в более структурированный вид:

**Перевод текста:**

**Параметры контакта**
- Идентификационный номер (ИНН, паспорт)
- Удостоверение личности для ипотечного консультанта идентификационный номер (ИНН, паспорт)
- 515958197

**Имя**
1. Мы, нижеподписавшиеся, 
Мы, нижеподписавшиеся, уполномочиваем:
- Имя
    - לנהל בשמנו ובמקומנו משא ומתן לצורך קבלת הלוואת משכנתא (далее - "Заявка на кредит"), как нового кредита, так и кредита на погашение существующего ипотечного кредита.
    - לפנות אל נציג הבנק, להופיע בפניו, להיפגש עימו ולדון בתנאי ההלוואה השונים, לרבות, בין היתר, גובה הריבית, סוגי ההלוואה, термин ее и т. д.
    - לחתום בשמנו ובמקומנו על בקשה להלוואה, включая подписание соглашения о конфиденциальности и защите персональных данных, предоставляющего банку право получать информацию из всех законных источников, включая популяционный реестр и информационные базы банка, где представляется запрос на кредит, и всю информацию от любой компании или работодателя, имеющуюся у них из любого источника, и которая требуется для обсуждения Заявки на кредит и/или подтверждения данных в Заявке на кредит, в соответствии с законодательством, и отказываемся от права на конфиденциальность или ответственность банка по отношению к указанной выше информации, согласно всем соглашениям, применимому банковскому праву и/или закону, включая Закон о защите персональных данных 5741-1981 и/или любому другому закон

у.
    - Либо принимать, изучать и фотографировать все необходимые документы из различных организаций, включая, помимо прочего, регистрационное бюро недвижимости, Израильское земельное управление и ипотечные компании, с целью подтверждения и выполнения Заявки на кредит, включая документы, за которые требуется уплата пошлины/комиссии/оплаты.
    - Вносить все необходимые документы от нас для получения принципиального согласия или отклонения от банка относительно Заявки на кредит.
    - Либо подписывать от нас и получать от нас Уведомления о решении банка: предварительное согласие, если предоставляется, на Заявку на кредит, включая все условия кредита, в том числе процентные ставки и сроки ее сохранения или отклонения запроса.
    - Либо проводить переговоры от нас с агентством по страхованию (1989) Ltd. для получения предложения по приобретению страхования жизни и страхования недвижимости в соответствии с ипотечным кредитом и предоставить, изучить и передать агентству все необходимые документы для этих страховых продуктов.

2. Мы заявляем, что мы не являемся "ограниченными клиентами" и у нас нет "ограниченного счета" в смысле Закона о безакцептном обороте 5741-1981, и мы, уполномочиваем названных выше уполномоченных лиц, заявляем это в наше имя по отношению к банку.

3. Мы заявляем, что никакие обременения не были наложены на предлагаемое имущество в связи с обеспечением ипотечного кредита и/или наши деньги и/или другие наши активы, и мы, уполномочиваем наших уполномоченных лиц заявить это в наше имя по отношению к банку.

4. Уполномоченные лица могут заявить от нашего имени перед банком, что нам известно и согласны с тем, что любое фактическое взаимодействие между нами и банком по предоставленному нам ипотечному кредиту будет соблюдать

 следующие условия:
   - Утверждение Заявки на кредит уполномоченными лицами в банке.
   - Все предоставленные нами данные, как непосредственно от нас, так и через вышеупомянутых уполномоченных лиц, являются точными, и каждый 
представленный нами банку документ является подлинным, полным и действительным.

1. Заполнение всех условий и требований, указанных в "Руководстве по получению кредита", предоставленном нам и/или уполномоченным лицам, а также тех, которые указаны в одобрении кредитного запроса, полученном или получаемом вышеупомянутыми уполномоченными лицами, и в соответствии с указаниями банка, одобряющего кредитный запрос.

2. Оплата всех необходимых расходов для выполнения кредита.

5. Уполномоченные лица имеют право заявить от нас перед банком, что нам известно и согласны с тем, что если кредитный запрос будет одобрен полностью или частично:
   - Любое одобрение кредита не служит иным, как выражением принципиальной готовности, и не накладывает на банк, одобривший кредитный запрос, какую-либо обязанность или ответственность по предоставлению кредита, и только содержащееся в договоре кредита, подписанном между нами и банком, будет обязывать банк.

   - Банк имеет право изменить процентную ставку и/или величину наценки/скидки к базовой процентной ставке в соответствии с общими правилами сохранения процентной ставки и/или изменить другие условия, согласованные, и это до фактического предоставления кредита.

6. Уточняется, что уполномоченные лица не действуют от имени банка, и банк не несет ответственности за их действия.

7. Нам известно, что рассмотрение нашего кредитного запроса со стороны банка зависит, в том числе, от получения кредитного отчета и/или кредитного доклада в соответствии с Законом о кредитных данных 5776-2016, относительно каждого из заемщиков и поручителей по кредиту.

8. Нам известно, что банк обратится к Банку Израиля для получения кредитного отчета относительно нас, который включает информацию из базы данных Банка Израиля.

9. Мы подтверждаем, что нам было разъяснено, что согласно положениям Закона, получение кредитного доклада является обязательным, в том числе, для получения согласия

 каждого из заемщиков и поручителей на предоставление банку кредитных данных, согласие, которое будет предоставлено путем подписания каждым из заемщиков и поручителей формы согласия, установленной в Законе ("Форма согласия на предоставление кредитных данных").

10. Нам было разъяснено, что процесс рассмотрения нашего запроса и предоставление принципиального согласия на кредит невозможны без подписания каждым из заемщиков и поручителей формы согласия на предоставление кредитных данных для получения кредитного доклада.

11. Мы разрешаем уполномоченным лицам от нас передать банку форму согласия на предоставление кредитных данных, которую мы подписали перед ними, для обращения в кредитное бюро с целью получения кредитного доклада.

12. Нам было разъяснено, что согласие на кредит и его исполнение подлежат тому, чтобы банку не была раскрыта информация, не соответствующая заявлениям и данным, предоставленным нами.

Я, _____________, удостоверяю, что настоящий документ, подписанный указанными выше лицами, был подписан мной в присутствии указанных лиц в день ____________ в моем офисе, расположенном по адресу ____________, после личной идентификации их посредством предъявления оригинальных удостоверений личности, указанных выше, и после ознакомления с его содержанием и объяснения значения. Прилагаются актуальные копии удостоверений личности вложенные в приложении.
Дата: __________________
Подпись консультанта: _________________________`

  return (
    <div className={cx('bank-authorization-page')}>
      <PersonalCabinetLayout>
        <div className={cx('content')}>
          {/* Top Navigation with Action #1 (Logo) and Action #2 (Return Button) */}
          <div className={cx('top-navigation')}>
            <div className={cx('logo-section')} onClick={handleReturnToPersonalCabinet}>
              <div className={cx('logo')}>
                {/* Action #1: Logo - navigate to Personal Cabinet */}
                <span className={cx('logo-text')}>BANKIMONLINE</span>
              </div>
            </div>
            <div className={cx('return-button-section')}>
              {/* Action #2: Return to Personal Cabinet button */}
              <Button
                variant="secondary"
                onClick={handleReturnToPersonalCabinet}
                className={cx('return-button')}
              >
                <span className={cx('return-text')}>Вернуться в личный кабинет</span>
                <span className={cx('return-icon')}>→</span>
              </Button>
            </div>
          </div>

          {/* Action #7: Page Title */}
          <div className={cx('page-header')}>
            <h1 className={cx('page-title')}>
              Доверенность для передачи персональных данных банкам
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
                <div className={cx('authorization-content')}>
                  {/* Action #6: Main Legal Text */}
                  <div className={cx('legal-text-section')}>
                    <div className={cx('legal-text')}>
                      {legalText.split('\n').map((paragraph, index) => (
                        <p key={index} className={cx('legal-paragraph')}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Action #3: Date Input Field */}
                  <div className={cx('date-input-section')}>
                    <div className={cx('date-input-wrapper')}>
                      <div className={cx('date-indicator')} />
                      <div className={cx('date-input-content')}>
                        <label className={cx('date-label')}>
                          Дата
                        </label>
                        <div className={cx('calendar-wrapper')}>
                          <Calendar
                            value={values.contractSigningDate}
                            onChange={(value) => setFieldValue('contractSigningDate', value || '')}
                            placeholder="ДД / ММ / ГГ"
                            error={errors.contractSigningDate && touched.contractSigningDate ? errors.contractSigningDate : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className={cx('button-section')}>
                    {/* Action #4: Back Button */}
                    <Button
                      variant="secondary"
                      onClick={handleBack}
                      type="button"
                      className={cx('back-button')}
                    >
                      Назад
                    </Button>

                    {/* Action #5: I Agree Button */}
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={!isValid}
                      className={cx('agree-button')}
                    >
                      Я согласен
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

export default BankAuthorizationPage 