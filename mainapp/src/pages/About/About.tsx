import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { BankIcon } from '@assets/icons/BankIcon'
import { HandCoinsIcon } from '@assets/icons/HandCoinsIcon'
import { HandPointingIcon } from '@assets/icons/HandPointingIcon'
import { LightningIcon } from '@assets/icons/LightningIcon'
import { PlusMinusIcon } from '@assets/icons/PlusMinusIcon'
import { ShieldCheckIcon } from '@assets/icons/ShieldCheckIcon'
import { TargetIcon } from '@assets/icons/TargetIcon'
import { Container } from '@src/components/ui/Container'
import { FeatureCard } from '@src/components/ui/FeatureCard'
import { useContentApi } from '@src/hooks/useContentApi'

import styles from './about.module.scss'

const cx = classNames.bind(styles)

const About: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('about')

  return (
    <Container>
      <div className={cx('about')}>
        <h1 className={cx('about-title')}>{getContent('about_title', t('about_title'))}</h1>
        <div className={cx('about-desc')}>
          {getContent('about_desc', t('about_desc'))}
          <svg
            width="252"
            height="130"
            viewBox="0 0 252 130"
            fill="none"
            className={cx('about-desc__vector')}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M450.758 -104.45L57.4961 229.744L-0.003336 229.745L266.941 -104.452L450.758 -104.45Z"
              fill="#FBE54D"
            />
            <path
              d="M492.345 7.78879L167.15 213.402L117.803 213.402L537.016 -132.557L492.345 7.78879Z"
              fill="#FBE54D"
            />
          </svg>
        </div>
        <div className={cx('about-how')}>
          <h2 className={cx('about-how-it-work')}>{getContent('about_how_it_work', t('about_how_it_work'))}</h2>
          <div className={cx('about-how__wrapper')}>
            <div className={cx('about-how__wrapper-text')}>
              {getContent('about_how_it_work_text', t('about_how_it_work_text'))}
              <span className={cx('bankimonline')}>{getContent('bankimonline', t('bankimonline'))}</span>
              {getContent('about_how_it_work_text_second', t('about_how_it_work_text_second'))}
            </div>
            <div className={cx('about-how__wrapper-img')}>
              <img src="/static/about/frame-1410093763@3x.png" alt="" />
            </div>
          </div>
        </div>
        <div className={cx('about-why')}>
          <h2 className={cx('about-why__title')}>{getContent('about_why_title', t('about_why_title'))}</h2>
          <div className={cx('about-why__cards')}>
            <FeatureCard
              icon={<PlusMinusIcon />}
              title={getContent('about_why_solve_problem_title', t('about_why_solve_problem_title'))}
              text={getContent('about_why_solve_problem', t('about_why_solve_problem'))}
            />
            <FeatureCard
              icon={<BankIcon />}
              title={getContent('about_why_bank_title', t('about_why_bank_title'))}
              text={getContent('about_why_bank', t('about_why_bank'))}
            />
            <FeatureCard
              icon={<LightningIcon />}
              title={getContent('about_why_mortgage_complete_title', t('about_why_mortgage_complete_title'))}
              text={getContent('about_why_mortgage_complete', t('about_why_mortgage_complete'))}
            />
            <FeatureCard
              icon={<HandPointingIcon />}
              title={getContent('about_why_simple_title', t('about_why_simple_title'))}
              text={getContent('about_why_simple', t('about_why_simple'))}
            />
            <FeatureCard
              icon={<HandCoinsIcon />}
              title={getContent('about_why_credit_title', t('about_why_credit_title'))}
              text={getContent('about_why_credit', t('about_why_credit'))}
            />
            <FeatureCard
              icon={<ShieldCheckIcon size={32} color="#fff" />}
              title={getContent('about_why_security_title', t('about_why_security_title'))}
              text={getContent('about_why_security', t('about_why_security'))}
            />
            <FeatureCard
              icon={<TargetIcon />}
              title={getContent('about_why_fast_title', t('about_why_fast_title'))}
              text={getContent('about_why_fast', t('about_why_fast'))}
              size="full"
            />
          </div>
        </div>
      </div>
    </Container>
  )
}

export default About
