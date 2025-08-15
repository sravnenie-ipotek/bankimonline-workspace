import classNames from 'classnames/bind'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BankCard } from '@components/ui/BankCard'
import { ProgrammCard } from '@components/ui/ProgrammCard'
import { useAppSelector } from '@src/hooks/store'
import { useServiceContext } from '@src/hooks/useServiceContext'
import { useContentApi } from '@src/hooks/useContentApi'
import type { MortgageFilterType } from '@src/pages/Services/slices/filterSlice'
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
  const { getContent } = useContentApi('bank_offers')

  const [banks, setBanks] = useState<BankOffer[]>([])
  const [mortgagePrograms, setMortgagePrograms] = useState<MortgageProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get parameters from Redux store based on service type
  const mortgageParameters = useAppSelector((state) => state.mortgage)
  const creditParameters = useAppSelector((state) => state.credit)
  const refinanceMortgageParameters = useAppSelector((state) => state.refinanceMortgage)
  const refinanceCreditParameters = useAppSelector((state) => state.refinanceCredit)
  
  // Select the correct state based on service type
  const getUserPersonalData = () => {
    switch (serviceType) {
      case 'credit':
        return creditParameters
      case 'refinance-mortgage':
        return refinanceMortgageParameters
      case 'refinance-credit':
        return refinanceCreditParameters
      default:
        return mortgageParameters
    }
  }
  
  const getUserIncomeData = () => {
    switch (serviceType) {
      case 'credit':
        return creditParameters
      case 'refinance-mortgage':
        return refinanceMortgageParameters
      case 'refinance-credit':
        return refinanceCreditParameters
      default:
        return mortgageParameters.incomeData
    }
  }
  
  const userPersonalData = getUserPersonalData()
  const userIncomeData = getUserIncomeData()
  const mortgageTypeFilter = useAppSelector((state) => state.filter.mortgageType)
  
  const isCredit = serviceType === 'credit'

  useEffect(() => {
    const loadBankOffers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get the correct parameters based on service type
        const getParameters = () => {
          switch (serviceType) {
            case 'credit':
              return creditParameters
            case 'refinance-mortgage':
              return refinanceMortgageParameters
            case 'refinance-credit':
              return refinanceCreditParameters
            default:
              return mortgageParameters
          }
        }
        
        // Transform user data to API request format
        const requestPayload = transformUserDataToRequest(
          getParameters(), 
          userPersonalData, 
          userIncomeData,
          serviceType || undefined
        )
        
        console.log('Bank offers request payload prepared')
        // Fetch bank offers from API
        const bankOffers = await fetchBankOffers(requestPayload)
        
        if (bankOffers.length === 0) {
          console.warn('⚠️ [BANK-OFFERS] NO BANK OFFERS FOUND!')
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
  }, [mortgageParameters, creditParameters, refinanceMortgageParameters, refinanceCreditParameters, userPersonalData, userIncomeData, serviceType, t])

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

          // Force correct label using program.id for full determinism
          switch (program.id) {
            case 'prime':
              title = isCredit ? t('credit_prime_percent', 'Prime Rate Credit') : t('mortgage_prime_percent', 'Prime Rate Mortgage')
              break
            case 'fixed_inflation':
              title = isCredit ? t('credit_fix_percent', 'Fixed Rate Credit') : t('mortgage_fix_percent', 'Fixed Rate Mortgage')
              break
            case 'variable_inflation':
              title = isCredit ? t('credit_float_percent', 'Variable Rate Credit') : t('mortgage_float_percent', 'Variable Rate Mortgage')
              break
            default:
              break
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
              title: t('credit_prime_percent', 'Prime Rate Credit'),
              description: t('prime_description', 'Prime rate linked credit program'),
              conditionFinance: t('up_to_33_percent', 'Up to 33%'),
              conditionPeriod: t('4_to_30_years', '4-30 years'),
              conditionBid: t('prime_rate_structure', 'Variable + Fixed components')
            },
            {
              id: 'fixed_inflation',
              title: t('credit_fix_percent', 'Fixed rate linked to inflation'),
              description: t('fixed_inflation_description', 'Fixed rate with inflation adjustment'),
              conditionFinance: t('up_to_70_percent', 'Up to 70%'),
              conditionPeriod: t('5_to_30_years', '5-30 years'),
              conditionBid: t('fixed_rate_structure', 'Fixed rate structure')
            },
            {
              id: 'variable_inflation',
              title: t('credit_float_percent', 'Variable rate linked to inflation'),
              description: t('variable_inflation_description', 'Variable rate with inflation adjustment'),
              conditionFinance: t('up_to_75_percent', 'Up to 75%'),
              conditionPeriod: t('4_to_25_years', '4-25 years'),
              conditionBid: t('variable_rate_structure', 'Variable rate structure')
            }
          ])
        } else {
          setMortgagePrograms([
            {
              id: 'prime',
              title: t('mortgage_prime_percent', 'Prime Rate Mortgage'),
              description: t('prime_description', 'Prime rate linked mortgage program'),
              conditionFinance: t('up_to_33_percent', 'Up to 33%'),
              conditionPeriod: t('4_to_30_years', '4-30 years'),
              conditionBid: t('prime_rate_structure', 'Variable + Fixed components')
            },
            {
              id: 'fixed_inflation',
              title: t('mortgage_fix_percent', 'Fixed rate linked to inflation'),
              description: t('fixed_inflation_description', 'Fixed rate with inflation adjustment'),
              conditionFinance: t('up_to_70_percent', 'Up to 70%'),
              conditionPeriod: t('5_to_30_years', '5-30 years'),
              conditionBid: t('fixed_rate_structure', 'Fixed rate structure')
            },
            {
              id: 'variable_inflation',
              title: t('mortgage_float_percent', 'Variable rate linked to inflation'),
              description: t('variable_inflation_description', 'Variable rate with inflation adjustment'),
              conditionFinance: t('up_to_75_percent', 'Up to 75%'),
              conditionPeriod: t('4_to_25_years', '4-25 years'),
              conditionBid: t('variable_rate_structure', 'Variable rate structure')
            }
          ])
        }
      }
    }

    loadMortgagePrograms()
  }, [t, i18n.language, isCredit])

  // Filter mortgage programs based on selected filter
  const getFilteredPrograms = (programs: MortgageProgram[]) => {
    if (mortgageTypeFilter === 'all' || isCredit) {
      return programs
    }

    return programs.filter(program => {
      switch (mortgageTypeFilter) {
        case 'prime':
          // Filter for prime rate programs
          return program.id === 'prime'
        case 'fixed':
          // Filter for fixed rate programs (fixed_inflation)
          return program.id === 'fixed_inflation'
        case 'variable':
          // Filter for variable rate programs (variable_inflation)
          return program.id === 'variable_inflation'
        default:
          return true
      }
    })
  }

  if (loading) {
    return <div className={cx('container')}>{getContent('loading_bank_offers', t('loading_bank_offers'))}</div>
  }

  if (error) {
    return <div className={cx('container')}>{getContent('bank_offers_error', t('bank_offers_error'))}{error}</div>
  }

  return (
    <div className={cx('container')}>
      {banks.length === 0 ? (
        <div className={cx('no-offers')}>
          <h3>{getContent('no_bank_offers_available', t('no_bank_offers_available'))}</h3>
          <p>{getContent('no_offers_message', t('no_offers_message'))}</p>
        </div>
      ) : (
        banks.map((bank, index) => (
          <Fragment key={bank.bank_id || index}>
            <div className={cx('column')}>
              <BankCard
                key={bank.bank_id || index}
                title={bank.bank_name || `${getContent('bank_name', 'Bank')} #${index + 1}`}
                infoTitle={isCredit ? getContent('bank_offers_credit_register', 'Credit Registration') : getContent('mortgage_register', 'Mortgage Registration')}
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
                {!isCredit && (
                  getFilteredPrograms(mortgagePrograms).length > 0 ? (
                    getFilteredPrograms(mortgagePrograms).map((program, programIndex) => (
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
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      {getContent('no_programs_match_filter', 'No programs match your selected filter. Try selecting "All Programs" to see all available options.')}
                    </div>
                  )
                )}
              </BankCard>
            </div>
          </Fragment>
        ))
      )}
    </div>
  )
}

export default BankOffers
