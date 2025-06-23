import classNames from 'classnames/bind'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BankCard } from '@components/ui/BankCard'
import { ProgrammCard } from '@components/ui/ProgrammCard'
import { useAppSelector } from '@src/hooks/store'

import styles from './bankOffers.module.scss'

const cx = classNames.bind(styles)

const BankOffers = () => {
  const { t, i18n } = useTranslation()

  const [banks, setBanks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get mortgage parameters from Redux store
  const mortgageParameters = useAppSelector((state) => state.mortgage)

  useEffect(() => {
    const fetchBankOffers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const requestPayload = {
          loan_type: 'mortgage',
          amount: mortgageParameters.priceOfEstate - mortgageParameters.initialFee || 496645,
          property_value: mortgageParameters.priceOfEstate || 1000000,
          monthly_income: 25000, // Default for testing
          age: 35, // Default for testing
          credit_score: 750, // Default for testing
          employment_years: 5, // Default for testing
          monthly_expenses: 8000, // Default for testing
        }
        
        console.log('🚀 [BANK-OFFERS] Making API request with payload:', requestPayload)
        console.log('🔍 [BANK-OFFERS] Customer LTV:', ((requestPayload.amount / requestPayload.property_value) * 100).toFixed(1) + '%')
        console.log('🔍 [BANK-OFFERS] Customer DTI:', ((requestPayload.monthly_expenses / requestPayload.monthly_income) * 100).toFixed(1) + '%')
        
        const API_BASE = 'https://bankdev2standalone-production.up.railway.app/api';
        const response = await fetch(`${API_BASE}/customer/compare-banks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        })
        
        console.log('📡 [BANK-OFFERS] API Response status:', response.status)
        console.log('📡 [BANK-OFFERS] API Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ [BANK-OFFERS] API Error:', response.status, errorText)
          throw new Error(`API Error: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()
        console.log('📦 [BANK-OFFERS] Full API Response:', data)
        
        // Transform API response to match component structure
        const bankOffers = data.data?.bank_offers || []
        console.log('🏦 [BANK-OFFERS] Bank offers array:', bankOffers)
        console.log('🔢 [BANK-OFFERS] Number of bank offers:', bankOffers.length)
        
        if (bankOffers.length === 0) {
          console.warn('⚠️ [BANK-OFFERS] NO BANK OFFERS FOUND!')
          console.log('🔍 [BANK-OFFERS] Possible reasons:')
          console.log('   - LTV too high (Customer: ' + ((requestPayload.amount / requestPayload.property_value) * 100).toFixed(1) + '%)')
          console.log('   - DTI too high (Customer: ' + ((requestPayload.monthly_expenses / requestPayload.monthly_income) * 100).toFixed(1) + '%)')
          console.log('   - Credit score too low (Customer: ' + requestPayload.credit_score + ')')
          console.log('   - Income too low (Customer: ₪' + requestPayload.monthly_income + ')')
          console.log('   - Age restrictions (Customer: ' + requestPayload.age + ' years)')
          console.log('💡 [BANK-OFFERS] Check admin panel banking standards!')
        }
        
        const transformedBanks = bankOffers.map((offer: any, index: number) => {
          console.log(`🏛️ [BANK-OFFERS] Processing bank ${index + 1}:`, offer.bank_name, 'Status:', offer.approval_status)
          
          // Calculate and display customer financial ratios for this bank
          const customerLTV = ((requestPayload.amount / requestPayload.property_value) * 100).toFixed(1)
          const customerDTI = ((requestPayload.monthly_expenses / requestPayload.monthly_income) * 100).toFixed(1)
          
          console.log(`📊 [BANK-OFFERS] Customer Profile for ${offer.bank_name}:`)
          console.log(`   💰 Loan Amount: ₪${requestPayload.amount.toLocaleString()}`)
          console.log(`   🏠 Property Value: ₪${requestPayload.property_value.toLocaleString()}`)
          console.log(`   📈 Customer LTV: ${customerLTV}% (Bank LTV: ${offer.ltv_ratio?.toFixed(1) || 'N/A'}%)`)
          console.log(`   📊 Customer DTI: ${customerDTI}% (Bank DTI: ${offer.dti_ratio?.toFixed(1) || 'N/A'}%)`)
          console.log(`   💳 Credit Score: ${requestPayload.credit_score}`)
          console.log(`   💵 Monthly Income: ₪${requestPayload.monthly_income.toLocaleString()}`)
          console.log(`   💸 Monthly Expenses: ₪${requestPayload.monthly_expenses.toLocaleString()}`)
          console.log(`   🎂 Age: ${requestPayload.age} years`)
          console.log(`   💼 Employment: ${requestPayload.employment_years} years`)
          console.log(`   ✅ Final Decision: ${offer.approval_status.toUpperCase()}`)
          console.log(`   💰 Monthly Payment: ₪${offer.monthly_payment?.toLocaleString() || 'N/A'}`)
          console.log(`   📈 Interest Rate: ${offer.interest_rate?.toFixed(2) || 'N/A'}%`)
          console.log(`   ⏱️ Term: ${offer.term_years || 'N/A'} years`)
          console.log(`   ────────────────────────────────────────────────────────`)
          
          return {
            title: offer.bank_name || `${t('mortgage_bank_name')}${index + 1}`,
            infoTitle: t('mortgage_register'),
            mortgageAmount: offer.loan_amount || mortgageParameters.priceOfEstate - mortgageParameters.initialFee,
            totalAmount: offer.total_payment || mortgageParameters.priceOfEstate,
            monthlyPayment: offer.monthly_payment || 10000,
            interestRate: offer.interest_rate || 2.1,
            approvalStatus: offer.approval_status || 'pending',
            bankId: offer.bank_id,
            bankLogo: offer.bank_logo,
            ltvRatio: offer.ltv_ratio,
            dtiRatio: offer.dti_ratio,
            termYears: offer.term_years
          }
        })
        
        console.log('✅ [BANK-OFFERS] Transformed banks for display:', transformedBanks)
        setBanks(transformedBanks)
        
      } catch (error: any) {
        console.error('💥 [BANK-OFFERS] Error fetching bank offers:', error)
        setError(error.message || 'Unknown error occurred')
      } finally {
        setLoading(false)
        console.log('🏁 [BANK-OFFERS] Fetch completed')
      }
    }

    fetchBankOffers()
  }, [mortgageParameters, t])

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

  if (loading) {
    return <div className={cx('container')}>Loading bank offers...</div>
  }

  if (error) {
    return <div className={cx('container')}>Error: {error}</div>
  }

  return (
    <div className={cx('container')}>
      {banks.length === 0 ? (
        <div className={cx('no-offers')}>
          <h3>{t('no_bank_offers_available')}</h3>
          <p>No bank offers match your profile. Try adjusting your parameters.</p>
        </div>
      ) : (
        banks.map((bank, index) => (
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
                    percent={bank.interestRate || offer.percent}
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
        ))
      )}
    </div>
  )
}

export default BankOffers
