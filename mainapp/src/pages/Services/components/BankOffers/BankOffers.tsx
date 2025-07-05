import classNames from 'classnames/bind'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BankCard } from '@components/ui/BankCard'
import { ProgrammCard } from '@components/ui/ProgrammCard'
import { useAppSelector } from '@src/hooks/store'
import { useServiceContext } from '@src/hooks/useServiceContext'
import { 
  fetchBankOffers, 
  fetchMortgagePrograms, 
  transformUserDataToRequest,
  type BankOffer,
  type MortgageProgram 
} from '@src/services/bankOffersApi'

import styles from './bankOffers.module.scss'

const cx = classNames.bind(styles)

const BankOffers = () => {
  const { t, i18n } = useTranslation()
  const serviceType = useServiceContext()

  const [banks, setBanks] = useState<BankOffer[]>([])
  const [mortgagePrograms, setMortgagePrograms] = useState<MortgageProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get parameters from Redux store based on service type
  const mortgageParameters = useAppSelector((state) => state.mortgage)
  const creditParameters = useAppSelector((state) => state.credit)
  const userPersonalData = useAppSelector((state) => serviceType === 'credit' ? state.credit : state.mortgage)
  const userIncomeData = useAppSelector((state) => state.mortgage.incomeData)
  
  const isCredit = serviceType === 'credit'

  useEffect(() => {
    const loadBankOffers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Transform user data to API request format
        const requestPayload = transformUserDataToRequest(
          isCredit ? creditParameters : mortgageParameters, 
          userPersonalData, 
          userIncomeData,
          serviceType || undefined
        )
        
        console.log('🚀 [BANK-OFFERS] Service Type:', serviceType)
        console.log('🚀 [BANK-OFFERS] Is Credit:', isCredit)
        console.log('🚀 [BANK-OFFERS] Credit Parameters:', creditParameters)
        console.log('🚀 [BANK-OFFERS] Mortgage Parameters:', mortgageParameters)
        console.log('🚀 [BANK-OFFERS] Making API request with payload:', requestPayload)
        
        // Fetch bank offers from API
        const bankOffers = await fetchBankOffers(requestPayload)
        
        console.log('🏦 [BANK-OFFERS] Received bank offers:', bankOffers.length)
        
        if (bankOffers.length === 0) {
          console.warn('⚠️ [BANK-OFFERS] NO BANK OFFERS FOUND!')
          console.log('💡 [BANK-OFFERS] Check admin panel banking standards!')
        }
        
        setBanks(bankOffers)
        
      } catch (error: any) {
        console.error('💥 [BANK-OFFERS] Error fetching bank offers:', error)
        setError(error.message || 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadBankOffers()
  }, [mortgageParameters, creditParameters, userPersonalData, userIncomeData, isCredit, t])

  useEffect(() => {
    const loadMortgagePrograms = async () => {
      try {
        const programs = await fetchMortgagePrograms()
        
        // Map API data to use correct language fields based on current language
        const currentLang = i18n.language || 'en'
        const mappedPrograms = programs.map((program: any) => {
          // Base title by language
          let title = currentLang === 'he' ? program.title : 
                     currentLang === 'ru' ? program.title_ru : 
                     program.title_en

          // Force correct Hebrew label using program.id for full determinism
          if (currentLang === 'he') {
            switch (program.id) {
              case 'prime':
                title = isCredit ? t('credit_prime_percent') : t('mortgage_prime_percent')
                break
              case 'fixed_inflation':
                title = isCredit ? t('credit_fix_percent') : t('mortgage_fix_percent')
                break
              case 'variable_inflation':
                title = isCredit ? t('credit_float_percent') : t('mortgage_float_percent')
                break
              default:
                break
            }
          }
          
          return {
            id: program.id,
            title: title,
            description: currentLang === 'he' ? program.description : 
                        currentLang === 'ru' ? program.description_ru : 
                        program.description_en,
            conditionFinance: currentLang === 'he' ? program.conditionFinance : 
                             currentLang === 'ru' ? program.conditionFinance_ru : 
                             program.conditionFinance_en,
            conditionPeriod: currentLang === 'he' ? program.conditionPeriod : 
                            currentLang === 'ru' ? program.conditionPeriod_ru : 
                            program.conditionPeriod_en,
            conditionBid: currentLang === 'he' ? program.conditionBid : 
                         currentLang === 'ru' ? program.conditionBid_ru : 
                         program.conditionBid_en,
            interestRate: program.interestRate,
            termYears: program.termYears
          }
        })
        
        setMortgagePrograms(mappedPrograms)
      } catch (error) {
        console.warn('⚠️ [MORTGAGE-PROGRAMS] Failed to fetch programs, using fallback')
        // Fallback to basic program types if API fails
        if (isCredit) {
          setMortgagePrograms([
            {
              id: 'prime',
              title: t('credit_prime_percent'),
              description: t('prime_description') || 'Prime rate linked credit program',
              conditionFinance: t('up_to_33_percent') || 'Up to 33%',
              conditionPeriod: t('4_to_30_years') || '4-30 years',
              conditionBid: t('prime_rate_structure') || 'Variable + Fixed components'
            },
            {
              id: 'fixed_inflation',
              title: t('credit_fix_percent') || 'Fixed rate linked to inflation',
              description: t('fixed_inflation_description') || 'Fixed rate with inflation adjustment',
              conditionFinance: t('up_to_70_percent') || 'Up to 70%',
              conditionPeriod: t('5_to_30_years') || '5-30 years',
              conditionBid: t('fixed_rate_structure') || 'Fixed rate structure'
            },
            {
              id: 'variable_inflation',
              title: t('credit_float_percent') || 'Variable rate linked to inflation',
              description: t('variable_inflation_description') || 'Variable rate with inflation adjustment',
              conditionFinance: t('up_to_75_percent') || 'Up to 75%',
              conditionPeriod: t('4_to_25_years') || '4-25 years',
              conditionBid: t('variable_rate_structure') || 'Variable rate structure'
            }
          ])
        } else {
          setMortgagePrograms([
            {
              id: 'prime',
              title: t('mortgage_prime_percent'),
              description: t('prime_description') || 'Prime rate linked mortgage program',
              conditionFinance: t('up_to_33_percent') || 'Up to 33%',
              conditionPeriod: t('4_to_30_years') || '4-30 years',
              conditionBid: t('prime_rate_structure') || 'Variable + Fixed components'
            },
            {
              id: 'fixed_inflation',
              title: t('mortgage_fix_percent') || 'Fixed rate linked to inflation',
              description: t('fixed_inflation_description') || 'Fixed rate with inflation adjustment',
              conditionFinance: t('up_to_70_percent') || 'Up to 70%',
              conditionPeriod: t('5_to_30_years') || '5-30 years',
              conditionBid: t('fixed_rate_structure') || 'Fixed rate structure'
            },
            {
              id: 'variable_inflation',
              title: t('mortgage_float_percent') || 'Variable rate linked to inflation',
              description: t('variable_inflation_description') || 'Variable rate with inflation adjustment',
              conditionFinance: t('up_to_75_percent') || 'Up to 75%',
              conditionPeriod: t('4_to_25_years') || '4-25 years',
              conditionBid: t('variable_rate_structure') || 'Variable rate structure'
            }
          ])
        }
      }
    }

    loadMortgagePrograms()
  }, [t, i18n.language, isCredit])

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
          <Fragment key={bank.bank_id || index}>
            <div className={cx('column')}>
              <BankCard
                key={bank.bank_id || index}
                title={bank.bank_name || `${t('bank_name')} #${index + 1}`}
                infoTitle={isCredit ? t('bank_offers_credit_register') : t('mortgage_register')}
                mortgageAmount={bank.loan_amount}
                totalAmount={bank.total_payment}
                mothlyPayment={bank.monthly_payment}
                bankOffer={{
                  id: bank.bank_id,
                  bankName: bank.bank_name,
                  program: isCredit ? 'Credit Program' : 'Mortgage Program',
                  rate: bank.interest_rate,
                  monthlyPayment: bank.monthly_payment,
                  totalAmount: bank.total_payment,
                  mortgageAmount: bank.loan_amount
                }}
              >
                {(isCredit ? mortgagePrograms.slice(0, 1) : mortgagePrograms).map((program, programIndex) => (
                  <ProgrammCard
                    key={programIndex}
                    title={program.title}
                    percent={bank.interest_rate || program.interestRate || 2.1}
                    mortgageAmount={bank.loan_amount}
                    monthlyPayment={bank.monthly_payment}
                    period={bank.term_years || program.termYears || 20}
                    description={program.description}
                    conditionFinance={program.conditionFinance}
                    conditionPeriod={program.conditionPeriod}
                    conditionBid={program.conditionBid}
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
