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

// Import new components
import { Address } from '@pages/Services/components/Address'
import { IDDocument } from '@pages/Services/components/IDDocument'
import { DocumentIssueDate } from '@pages/Services/components/DocumentIssueDate'
import { Gender } from '@pages/Services/components/Gender'
import { PropertyOwnership } from '@pages/Services/components/PropertyOwnership'

import { FormTypes } from '@pages/Services/types/formTypes'
import styles from './PartnerPersonalDataPage.module.scss'

const cx = classNames.bind(styles)

interface PartnerPersonalDataPageProps {
  partnerName?: string
}

const validationSchema = Yup.object().shape({
  address: Yup.string().required('כתובת נדרשת'),
  idDocument: Yup.string().required('מספר תעודת זהות נדרש'),
  documentIssueDate: Yup.string().required('תאריך הוצאת התעודה נדרש'),
  gender: Yup.string().required('מין נדרש'),
  propertyOwnership: Yup.string().required('יש לבחור תשובה'),
})

const PartnerPersonalDataPage: React.FC<PartnerPersonalDataPageProps> = ({ 
  partnerName = "Людмила Пушкина" 
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const initialValues: Partial<FormTypes> = {
    address: '',
    idDocument: '',
    documentIssueDate: '',
    gender: '',
    propertyOwnership: '',
  }

  const handleSubmit = (values: Partial<FormTypes>) => {
    // Navigate to next step or save data
    navigate('/personal-cabinet')
  }

  const handleBack = () => {
    navigate('/personal-cabinet')
  }

  return (
    <div className={cx('partner-personal-data-page')}>
      <PersonalCabinetLayout>
        <div className={cx('content')}>
          <div className={cx('header')}>
            <h1 className={cx('partner-name')}>{partnerName}</h1>
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
          {() => (
            <Form>
              <FormCaption 
                title={t('personal_data', 'Личные данные')}
                subtitle="1 из 2"
              />

              <Info 
                text={t('data_privacy_info', 'Ваши данные не попадут третьим лицам кроме банков партнеров и брокеров, мы соблюдаем закон о защите данных')}
              />

              <Row>
                <Address />
                <IDDocument />
              </Row>

              <Row>
                <DocumentIssueDate />
                <Gender />
              </Row>

              <Row>
                <PropertyOwnership />
              </Row>

              <Divider />

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
                  {t('button_back')}
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
                  {t('button_save')}
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

export { PartnerPersonalDataPage }
