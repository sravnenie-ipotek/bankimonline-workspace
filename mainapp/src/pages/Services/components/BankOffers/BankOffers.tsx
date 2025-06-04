import classNames from 'classnames/bind'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { BankCard } from '@components/ui/BankCard'
import { ProgrammCard } from '@components/ui/ProgrammCard'

import styles from './bankOffers.module.scss'

const cx = classNames.bind(styles)

const BankOffers = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const banks = [
    {
      title: `${t('mortgage_bank_name')}1`,
      infoTitle: t('mortgage_register'),
      mortgageAmount: 1000000,
      totalAmount: 1500000,
      monthlyPayment: 10000,
    },
    {
      title: `${t('mortgage_bank_name')}2`,
      infoTitle: t('mortgage_register'),
      mortgageAmount: 1000000,
      totalAmount: 1500000,
      monthlyPayment: 10000,
    },
    {
      title: `${t('mortgage_bank_name')}3`,
      infoTitle: t('mortgage_register'),
      mortgageAmount: 1000000,
      totalAmount: 1500000,
      monthlyPayment: 10000,
    },
    {
      title: `${t('mortgage_bank_name')}4`,
      infoTitle: t('mortgage_register'),
      mortgageAmount: 1000000,
      totalAmount: 1500000,
      monthlyPayment: 10000,
    },
  ]

  const offers = [
    {
      title: t('mortgage_prime_percent'),
      mortgageAmount: 1000000,
      monthlyPayment: 10000,
      percent: 2.1,
      period: 4,
      description:
        'Процентная ставка в этой кредитной линии меняется каждый месяц в соответствии с процентной ставкой, установленной Банком Израиля. Любое изменение в процентной ставке Банка Израиля приводит к немедленному изменению суммы ежемесячного платежа. Использование этой линии ограничено до 1/3 от общей суммы ипотеки. Нет прикрепления к инфляции. На этой линии нет штрафов за досрочное погашение, за исключением операционного сбора (обычно 60 шекелей) и комиссии за не уведомление банка о досрочном погашении (0,1% от суммы погашения).',
      conditionFinance: 'до 33%',
      conditionPeriod: '4-30 лет',
      conditionBid:
        'Состоит из двух процентов: Меняющийся (0,25%) Постоянный (1,5%) = 1,75',
    },
    {
      title: 'Фиксированный процент, прикрепленный к инфляции',
      mortgageAmount: 1000000,
      monthlyPayment: 10000,
      percent: 2.1,
      period: 4,
      description:
        'Процентная ставка в этой кредитной линии меняется каждый месяц в соответствии с процентной ставкой, установленной Банком Израиля. Любое изменение в процентной ставке Банка Израиля приводит к немедленному изменению суммы ежемесячного платежа. Использование этой линии ограничено до 1/3 от общей суммы ипотеки. Нет прикрепления к инфляции. На этой линии нет штрафов за досрочное погашение, за исключением операционного сбора (обычно 60 шекелей) и комиссии за не уведомление банка о досрочном погашении (0,1% от суммы погашения).',
      conditionFinance: 'до 33%',
      conditionPeriod: '4-30 лет',
      conditionBid:
        'Состоит из двух процентов: Меняющийся (0,25%) Постоянный (1,5%) = 1,75%',
    },
    {
      title: 'Плавающий процент с прикреплением к инфляции ',
      mortgageAmount: 1000000,
      monthlyPayment: 10000,
      percent: 2.1,
      period: 4,
      description:
        'Процентная ставка в этой кредитной линии меняется каждый месяц в соответствии с процентной ставкой, установленной Банком Израиля. Любое изменение в процентной ставке Банка Израиля приводит к немедленному изменению суммы ежемесячного платежа. Использование этой линии ограничено до 1/3 от общей суммы ипотеки. Нет прикрепления к инфляции. На этой линии нет штрафов за досрочное погашение, за исключением операционного сбора (обычно 60 шекелей) и комиссии за не уведомление банка о досрочном погашении (0,1% от суммы погашения).',
      conditionFinance: 'до 33%',
      conditionPeriod: '4-30 лет',
      conditionBid:
        'Состоит из двух процентов: Меняющийся (0,25%) Постоянный (1,5%) = 1,75%',
    },
  ]

  return (
    <div className={cx('container')}>
      {banks.map((bank, index) => (
        <Fragment key={index}>
          <div className={cx('column')}>
            <BankCard
              key={index}
              title={bank.title}
              infoTitle={bank.infoTitle}
              mortgageAmount={bank.mortgageAmount}
              totalAmount={bank.totalAmount}
              mothlyPayment={bank.monthlyPayment}
            >
              {offers.map((offer, index) => (
                <ProgrammCard
                  key={index}
                  title={offer.title}
                  percent={offer.percent}
                  mortgageAmount={offer.mortgageAmount}
                  monthlyPayment={offer.monthlyPayment}
                  period={offer.period}
                  description={offer.description}
                  conditionFinance={offer.conditionFinance}
                  conditionPeriod={offer.conditionPeriod}
                  conditionBid={offer.conditionBid}
                />
              ))}
            </BankCard>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export default BankOffers
