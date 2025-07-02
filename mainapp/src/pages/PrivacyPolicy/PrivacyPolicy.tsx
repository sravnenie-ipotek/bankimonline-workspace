import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import classNames from 'classnames/bind'

import { Container } from '@src/components/ui/Container'
import { CaretRightIcon } from '@assets/icons/CaretRightIcon'

import styles from './privacyPolicy.module.scss'

const cx = classNames.bind(styles)

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className={cx('privacy-policy')}>
      <Container>
        <div className={cx('privacy-policy-container')}>
          <div className={cx('privacy-policy-header')}>
            <button className={cx('back-button')} onClick={() => navigate(-1)}>
              <CaretRightIcon
                color="#fff"
                style={{
                  transform: i18n.language === 'he' ? 'rotate(0)' : 'rotate(180deg)',
                }}
              />
              {t('back')}
            </button>
          </div>
          
          <div className={cx('privacy-policy-content')}>
            <h1 className={cx('privacy-policy-title')}>{t('privacy_policy_title')}</h1>
            
            <div className={cx('privacy-policy-text')}>
              <p>{t('privacy_policy_intro')}</p>
              
              <h2>{t('privacy_policy_section_1_title')}</h2>
              <p>{t('privacy_policy_section_1_1')}</p>
              <p>{t('privacy_policy_section_1_2')}</p>
              <p>{t('privacy_policy_section_1_3')}</p>
              <p>{t('privacy_policy_section_1_4')}</p>
              <p>{t('privacy_policy_section_1_5')}</p>
              
              <h2>{t('privacy_policy_section_2_title')}</h2>
              <p>{t('privacy_policy_section_2_1')}</p>
              <p>{t('privacy_policy_section_2_2')}</p>
              <p>{t('privacy_policy_section_2_2_1')}</p>
              <p>{t('privacy_policy_section_2_2_2')}</p>
              <p>{t('privacy_policy_section_2_2_3')}</p>
              <p>{t('privacy_policy_section_2_2_4')}</p>
              <p>{t('privacy_policy_section_2_2_5')}</p>
              
              <h2>{t('privacy_policy_section_3_title')}</h2>
              <p>{t('privacy_policy_section_3_1')}</p>
              <p>{t('privacy_policy_section_3_2')}</p>
              <p>{t('privacy_policy_section_3_3')}</p>
              <p>{t('privacy_policy_section_3_4')}</p>
              <p>{t('privacy_policy_section_3_5')}</p>
              <p>{t('privacy_policy_section_3_6')}</p>
              <p>{t('privacy_policy_section_3_7')}</p>
              <p>{t('privacy_policy_section_3_8')}</p>
              <p>{t('privacy_policy_section_3_9')}</p>
              <p>{t('privacy_policy_section_3_10')}</p>
              <p>{t('privacy_policy_section_3_11')}</p>
              <p>{t('privacy_policy_section_3_12')}</p>
              
              <h2>{t('privacy_policy_section_4_title')}</h2>
              <p>{t('privacy_policy_section_4_1')}</p>
              <p>{t('privacy_policy_section_4_2')}</p>
              <p>{t('privacy_policy_section_4_3')}</p>
              <p>{t('privacy_policy_section_4_4')}</p>
              <p>{t('privacy_policy_section_4_5')}</p>
              
              <h2>{t('privacy_policy_section_5_title')}</h2>
              <p>{t('privacy_policy_section_5_1')}</p>
              <p>{t('privacy_policy_section_5_2')}</p>
              <p>{t('privacy_policy_section_5_3')}</p>
              <p>{t('privacy_policy_section_5_4')}</p>
              <p>{t('privacy_policy_section_5_5')}</p>
              <p>{t('privacy_policy_section_5_6')}</p>
              <p>{t('privacy_policy_section_5_7')}</p>
              <p>{t('privacy_policy_section_5_8')}</p>
              <p>{t('privacy_policy_section_5_9')}</p>
              <p>{t('privacy_policy_section_5_10')}</p>
              <p>{t('privacy_policy_section_5_11')}</p>
              <p>{t('privacy_policy_section_5_12')}</p>
              <p>{t('privacy_policy_section_5_13')}</p>
              <p>{t('privacy_policy_section_5_14')}</p>
              <p>{t('privacy_policy_section_5_15')}</p>
              
              <h2>{t('privacy_policy_section_6_title')}</h2>
              <p>{t('privacy_policy_section_6_1')}</p>
              <p>{t('privacy_policy_section_6_2')}</p>
              
              <h2>{t('privacy_policy_section_7_title')}</h2>
              <p>{t('privacy_policy_section_7_1')}</p>
              <p>{t('privacy_policy_section_7_2')}</p>
              <p>{t('privacy_policy_section_7_3')}</p>
              <p>{t('privacy_policy_section_7_4')}</p>
              <p>{t('privacy_policy_section_7_5')}</p>
              <p>{t('privacy_policy_section_7_6')}</p>
              <p>{t('privacy_policy_section_7_7')}</p>
              <p>{t('privacy_policy_section_7_8')}</p>
              <p>{t('privacy_policy_section_7_9')}</p>
              <p>{t('privacy_policy_section_7_10')}</p>
              <p>{t('privacy_policy_section_7_11')}</p>
              <p>{t('privacy_policy_section_7_12')}</p>
              
              <h2>{t('privacy_policy_section_8_title')}</h2>
              <p>{t('privacy_policy_section_8_1')}</p>
              <p>{t('privacy_policy_section_8_2')}</p>
              <p>{t('privacy_policy_section_8_3')}</p>
              
              <h2>{t('privacy_policy_section_9_title')}</h2>
              <p>{t('privacy_policy_section_9_1')}</p>
              <p>{t('privacy_policy_section_9_2')}</p>
              <p>{t('privacy_policy_section_9_2_1')}</p>
              <p>{t('privacy_policy_section_9_2_2')}</p>
              <p>{t('privacy_policy_section_9_2_3')}</p>
              <p>{t('privacy_policy_section_9_2_4')}</p>
              <p>{t('privacy_policy_section_9_2_5')}</p>
              <p>{t('privacy_policy_section_9_2_6')}</p>
              <p>{t('privacy_policy_section_9_2_7')}</p>
              <p>{t('privacy_policy_section_9_2_8')}</p>
              <p>{t('privacy_policy_section_9_2_9')}</p>
              <p>{t('privacy_policy_section_9_2_10')}</p>
              <p>{t('privacy_policy_section_9_2_11')}</p>
              <p>{t('privacy_policy_section_9_2_12')}</p>
              <p>{t('privacy_policy_section_9_2_13')}</p>
              <p>{t('privacy_policy_section_9_2_14')}</p>
              <p>{t('privacy_policy_section_9_2_15')}</p>
              <p>{t('privacy_policy_section_9_2_16')}</p>
              <p>{t('privacy_policy_section_9_2_17')}</p>
              <p>{t('privacy_policy_section_9_3')}</p>
              <p>{t('privacy_policy_section_9_4')}</p>
              <p>{t('privacy_policy_section_9_5')}</p>
              <p>{t('privacy_policy_section_9_6')}</p>
              
              <h2>{t('privacy_policy_section_10_title')}</h2>
              <p>{t('privacy_policy_section_10_1')}</p>
              <p>{t('privacy_policy_section_10_2')}</p>
              
              <h2>{t('privacy_policy_section_11_title')}</h2>
              <p>{t('privacy_policy_section_11')}</p>
              
              <h2>{t('privacy_policy_section_12_title')}</h2>
              <p>{t('privacy_policy_section_12')}</p>
              
              <h2>{t('privacy_policy_section_13_title')}</h2>
              <p>{t('privacy_policy_section_13_1')}</p>
              <p>{t('privacy_policy_section_13_2')}</p>
              <p>{t('privacy_policy_section_13_3')}</p>
              
              <h2>{t('privacy_policy_section_14_title')}</h2>
              <p>{t('privacy_policy_section_14_1')}</p>
              <p>{t('privacy_policy_section_14_2')}</p>
              
              <h2>{t('privacy_policy_section_15_title')}</h2>
              <p>{t('privacy_policy_section_15')}</p>
              
              <h2>{t('privacy_policy_section_16_title')}</h2>
              <p>{t('privacy_policy_section_16_1')}</p>
              <p>{t('privacy_policy_section_16_2')}</p>
              
              <h2>{t('privacy_policy_section_17_title')}</h2>
              <p>{t('privacy_policy_section_17_1')}</p>
              <p>{t('privacy_policy_section_17_address')}</p>
              <p>{t('privacy_policy_section_17_phone')}</p>
              <p>{t('privacy_policy_section_17_email')}</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default PrivacyPolicy