import React, { useEffect, useState, useMemo } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

import { FormContainer } from '@components/ui/FormContainer'
import { Button } from '@components/ui/Button'
import { BankOfferCard } from '@components/ui/BankOfferCard'
import { useAppSelector, useAppDispatch } from '@src/hooks/store.ts'
import { useContentApi } from '@src/hooks/useContentApi'
import { resetFilter } from '@src/pages/Services/slices/filterSlice'

import { MortgageProgram, BankOffer } from '@src/types'
import {
  fetchMortgagePrograms,
  fetchBankOffers,
  generateFallbackOffers
} from '@src/services/bankOffersApi'

import styles from './bankOffers.module.scss'

const cx = classNames.bind(styles)
const BankOffers = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step4')
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  const [mortgagePrograms, setMortgagePrograms] = useState<MortgageProgram[]>([])
  const [banks, setBanks] = useState<BankOffer[]>([])
  const [loading, setLoading] = useState(true)

  // Get state from Redux
  const mortgageParameters = useAppSelector((state) => state.mortgage)
  const creditParameters = useAppSelector((state) => state.credit)
  const userPersonalData = useAppSelector((state) => state.personalData)
  const userIncomeData = useAppSelector((state) => state.incomeData)
  const filterState = useAppSelector((state) => state.filter)

  // Determine if this is a credit calculation
  const isCredit = location.pathname.includes('calculate-credit')

  // Filter mortgage programs based on selected mortgage type
  const filteredMortgagePrograms = useMemo(() => {
    if (!filterState.mortgageType || filterState.mortgageType === 'all') {
      return mortgagePrograms
    }
    
    return mortgagePrograms.filter(program => {
      // Map program IDs to filter values
      switch (filterState.mortgageType) {
        case 'prime':
          return program.id === 'prime'
        case 'fixed_inflation':
          return program.id === 'fixed_inflation'
        case 'variable_inflation':
          return program.id === 'variable_inflation'
        default:
          return true
      }
    })
  }, [mortgagePrograms, filterState.mortgageType])

  // Also filter bank offers based on mortgage type
  const filteredBankOffers = useMemo(() => {
    if (!filterState.mortgageType || filterState.mortgageType === 'all') {
      return banks
    }
    
    return banks.filter(bank => {
      // Assuming bank offers have a programType property that matches our filter values
      const programType = bank.programType || bank.mortgageType || 'prime' // fallback
      return programType === filterState.mortgageType
    })
  }, [banks, filterState.mortgageType])

  useEffect(() => {
    const loadBankOffers = async () => {
      try {
        setLoading(true)
        const offers = await fetchBankOffers()
        setBanks(offers || generateFallbackOffers())
      } catch (error) {
        console.warn('⚠️ [BANK-OFFERS] Using fallback offers due to API error')
        setBanks(generateFallbackOffers())
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

          // Force correct label using program.id for full determinism
          switch (program.id) {
            case 'prime':
              title = isCredit ? getContent('credit_prime_percent', 'Prime Rate Credit') : getContent('mortgage_prime_percent', 'Prime Rate Mortgage')
              break
            case 'fixed_inflation':
              title = isCredit ? getContent('credit_fix_percent', 'Fixed Rate Credit') : getContent('mortgage_fix_percent', 'Fixed Rate Mortgage')
              break
            case 'variable_inflation':
              title = isCredit ? getContent('credit_float_percent', 'Variable Rate Credit') : getContent('mortgage_float_percent', 'Variable Rate Mortgage')
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
              title: getContent('credit_prime_percent', 'Prime Rate Credit'),
              description: getContent('prime_description', 'Prime rate linked credit program'),
              conditionFinance: getContent('up_to_33_percent', 'Up to 33%'),
              conditionPeriod: getContent('4_to_30_years', '4-30 years'),
              conditionBid: getContent('prime_rate_structure', 'Variable + Fixed components'),
              interestRate: 2.1,
              termYears: 20
            },
            {
              id: 'fixed_inflation',
              title: getContent('credit_fix_percent', 'Fixed Rate Credit'),
              description: getContent('fixed_inflation_description', 'Fixed rate with inflation adjustment'),
              conditionFinance: getContent('up_to_70_percent', 'Up to 70%'),
              conditionPeriod: getContent('5_to_30_years', '5-30 years'),
              conditionBid: getContent('fixed_rate_structure', 'Fixed rate structure'),
              interestRate: 3.2,
              termYears: 25
            },
            {
              id: 'variable_inflation',
              title: getContent('credit_float_percent', 'Variable Rate Credit'),
              description: getContent('variable_inflation_description', 'Variable rate with inflation adjustment'),
              conditionFinance: getContent('up_to_75_percent', 'Up to 75%'),
              conditionPeriod: getContent('4_to_25_years', '4-25 years'),
              conditionBid: getContent('variable_rate_structure', 'Variable rate structure'),
              interestRate: 2.8,
              termYears: 22
            }
          ])
        } else {
          setMortgagePrograms([
            {
              id: 'prime',
              title: getContent('mortgage_prime_percent', 'Prime Rate Mortgage'),
              description: getContent('prime_description', 'Prime rate linked mortgage program'),
              conditionFinance: getContent('up_to_33_percent', 'Up to 33%'),
              conditionPeriod: getContent('4_to_30_years', '4-30 years'),
              conditionBid: getContent('prime_rate_structure', 'Variable + Fixed components'),
              interestRate: 2.1,
              termYears: 20
            },
            {
              id: 'fixed_inflation',
              title: getContent('mortgage_fix_percent', 'Fixed Rate Mortgage'),
              description: getContent('fixed_inflation_description', 'Fixed rate with inflation adjustment'),
              conditionFinance: getContent('up_to_70_percent', 'Up to 70%'),
              conditionPeriod: getContent('5_to_30_years', '5-30 years'),
              conditionBid: getContent('fixed_rate_structure', 'Fixed rate structure'),
              interestRate: 3.2,
              termYears: 25
            },
            {
              id: 'variable_inflation',
              title: getContent('mortgage_float_percent', 'Variable Rate Mortgage'),
              description: getContent('variable_inflation_description', 'Variable rate with inflation adjustment'),
              conditionFinance: getContent('up_to_75_percent', 'Up to 75%'),
              conditionPeriod: getContent('4_to_25_years', '4-25 years'),
              conditionBid: getContent('variable_rate_structure', 'Variable rate structure'),
              interestRate: 2.8,
              termYears: 22
            }
          ])
        }
      }
    }

    loadMortgagePrograms()
  }, [isCredit, getContent, i18n.language])

  const handleBankSelection = (bankOffer: BankOffer) => {
    if (isCredit) {
      navigate('/services/calculate-credit/4', { 
        state: { selectedBankOffer: bankOffer } 
      })
    } else {
      navigate('/services/calculate-mortgage/4', { 
        state: { selectedBankOffer: bankOffer } 
      })
    }
  }

  const handleResetFilter = () => {
    dispatch(resetFilter())
  }

  if (loading) {
    return (
      <FormContainer>
        <div className={cx('loading-container')}>
          <div className={cx('loading-text')}>
            {getContent('loading_programs', 'Loading programs...')}
          </div>
        </div>
      </FormContainer>
    )
  }

  return (
    <FormContainer>
      <div className={cx('offers-container')}>
        {/* Mortgage Programs Section */}
        {filteredMortgagePrograms.length > 0 && (
          <div className={cx('programs-section')}>
            <h3 className={cx('section-title')}>
              {isCredit ? getContent('available_credit_programs', 'Available Credit Programs') : getContent('available_mortgage_programs', 'Available Mortgage Programs')}
            </h3>
            <div className={cx('programs-grid')}>
              {filteredMortgagePrograms.map((program) => (
                <div key={program.id} className={cx('program-card')}>
                  <div className={cx('program-header')}>
                    <h4 className={cx('program-title')}>{program.title}</h4>
                    <span className={cx('interest-rate')}>{program.interestRate}%</span>
                  </div>
                  <div className={cx('program-details')}>
                    <p className={cx('program-description')}>{program.description}</p>
                    <div className={cx('program-conditions')}>
                      <div className={cx('condition')}>
                        <span className={cx('condition-label')}>{getContent('financing', 'Financing')}:</span>
                        <span className={cx('condition-value')}>{program.conditionFinance}</span>
                      </div>
                      <div className={cx('condition')}>
                        <span className={cx('condition-label')}>{getContent('period', 'Period')}:</span>
                        <span className={cx('condition-value')}>{program.conditionPeriod}</span>
                      </div>
                      <div className={cx('condition')}>
                        <span className={cx('condition-label')}>{getContent('rate_type', 'Rate Type')}:</span>
                        <span className={cx('condition-value')}>{program.conditionBid}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bank Offers Section */}
        {filteredBankOffers.length > 0 && (
          <div className={cx('offers-section')}>
            <h3 className={cx('section-title')}>
              {getContent('bank_offers_title', 'Bank Offers')}
            </h3>
            <div className={cx('offers-grid')}>
              {filteredBankOffers.map((bank, index) => (
                <BankOfferCard
                  key={bank.id || index}
                  bank={bank}
                  onSelect={() => handleBankSelection(bank)}
                  isCredit={isCredit}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {filteredMortgagePrograms.length === 0 && filteredBankOffers.length === 0 && (
          <div className={cx('no-results')}>
            <p className={cx('no-results-text')}>
              {getContent('no_programs_found', 'No programs found for the selected filter')}
            </p>
            <Button
              onClick={handleResetFilter}
              size="medium"
            >
              {getContent('show_all_programs', 'Show All Programs')}
            </Button>
          </div>
        )}
      </div>
    </FormContainer>
  )
}

export { BankOffers }
