import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import classNames from 'classnames/bind'

import { ProgrammCard } from '@components/ui/ProgrammCard'
import { CaretRightIcon } from '@assets/icons/CaretRightIcon'
import { useAppSelector } from '@src/hooks/store'
import { 
  fetchMortgagePrograms,
  type BankOffer,
  type MortgageProgram 
} from '@src/services/bankOffersApi'

import styles from './bankConfirmationPage.module.scss'

const cx = classNames.bind(styles)

interface BankConfirmationPageProps {
  selectedBankOffer?: BankOffer
}

export const BankConfirmationPage: React.FC<BankConfirmationPageProps> = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get selected bank offer from navigation state or props
  const [selectedBank, setSelectedBank] = useState<BankOffer | null>(null)
  const [mortgagePrograms, setMortgagePrograms] = useState<MortgageProgram[]>([])
  const [loading, setLoading] = useState(true)

  // Get mortgage parameters from Redux store
  const mortgageParameters = useAppSelector((state) => state.mortgage)

  useEffect(() => {
    // Get selected bank from navigation state
    if (location.state?.selectedBankOffer) {
      setSelectedBank(location.state.selectedBankOffer)
    } else {
      // If no bank selected, redirect back to bank selection
      console.warn('🚨 [BANK-CONFIRMATION] No bank selected, redirecting to services')
      navigate('/services/calculate-mortgage/fourth-step')
      return
    }
  }, [location.state, navigate])

  useEffect(() => {
    const loadMortgagePrograms = async () => {
      try {
        setLoading(true)
        const programs = await fetchMortgagePrograms()
        
        // Map API data to use correct language fields based on current language
        const currentLang = i18n.language || 'en'
        const mappedPrograms = programs.map((program: any) => ({
          id: program.id,
          title: currentLang === 'he' ? program.title : 
                 currentLang === 'ru' ? program.title_ru : 
                 program.title_en,
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
        }))
        
        setMortgagePrograms(mappedPrograms)
      } catch (error) {
        console.warn('⚠️ [BANK-CONFIRMATION] Failed to fetch programs, using fallback')
        // Fallback to basic program types if API fails
        setMortgagePrograms([
          {
            id: 'prime',
            title: t('mortgage_prime_percent', 'Прайм %'),
            description: t('prime_description', 'Prime rate linked mortgage program'),
            conditionFinance: t('up_to_33_percent', 'До 33%'),
            conditionPeriod: t('4_to_30_years', '4-30 лет'),
            conditionBid: t('prime_rate_structure', 'Variable + Fixed components'),
            interestRate: 2.1,
            termYears: 20
          },
          {
            id: 'fixed_inflation',
            title: t('mortgage_fix_percent', 'Фиксированная % с индексацией'),
            description: t('fixed_inflation_description', 'Fixed rate with inflation adjustment'),
            conditionFinance: t('up_to_70_percent', 'До 70%'),
            conditionPeriod: t('5_to_30_years', '5-30 лет'),
            conditionBid: t('fixed_rate_structure', 'Fixed rate structure'),
            interestRate: 3.2,
            termYears: 25
          },
          {
            id: 'variable_inflation',
            title: t('mortgage_float_percent', 'Переменная % с индексацией'),
            description: t('variable_inflation_description', 'Variable rate with inflation adjustment'),
            conditionFinance: t('up_to_75_percent', 'До 75%'),
            conditionPeriod: t('4_to_25_years', '4-25 лет'),
            conditionBid: t('variable_rate_structure', 'Variable rate structure'),
            interestRate: 2.8,
            termYears: 22
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    if (selectedBank) {
      loadMortgagePrograms()
    }
  }, [selectedBank, t, i18n.language])

  const handleBackNavigation = () => {
    navigate(-1) // Go back to previous page
  }

  const handleConfirmSelection = () => {
    // Navigate to application accepted modal
    navigate('/personal-cabinet', { 
      state: { showApplicationAccepted: true } 
    })
  }

  if (!selectedBank || loading) {
    return (
      <div className={cx('container')}>
        <div className={cx('loading')}>
          {t('loading', 'Загрузка...')}
        </div>
      </div>
    )
  }

  return (
    <div className={cx('container')}>
      {/* Action #1: Header with back navigation */}
      <div className={cx('header')}>
        <button 
          className={cx('back-button')}
          onClick={handleBackNavigation}
          aria-label={t('go_back', 'Назад')}
        >
          <CaretRightIcon size={20} color="#ffffff" style={{ transform: 'rotate(180deg)' }} />
        </button>
        <h1 className={cx('title')}>
          {t('bank_confirmation_title', 'Подтверждение')}
        </h1>
      </div>

      {/* Action #2: Bank logo and name display */}
      <div className={cx('bank-header')}>
        <div className={cx('bank-info')}>
          <div className={cx('bank-logo')}>
            {/* Bank logo placeholder - can be enhanced with actual logos */}
            <div className={cx('logo-placeholder')}>
              {selectedBank.bank_name?.charAt(0) || 'B'}
            </div>
          </div>
          <h2 className={cx('bank-name')}>
            {selectedBank.bank_name || t('selected_bank', 'Выбранный банк')}
          </h2>
        </div>
      </div>

      {/* Action #3: Selected program summary */}
      <div className={cx('offer-summary')}>
        <div className={cx('summary-grid')}>
          <div className={cx('summary-item')}>
            <span className={cx('summary-label')}>
              {t('mortgage_total', 'Сумма займа')}
            </span>
            <span className={cx('summary-value')}>
              {selectedBank.loan_amount?.toLocaleString('en-US') || '0'} ₪
            </span>
          </div>
          <div className={cx('summary-item')}>
            <span className={cx('summary-label')}>
              {t('mortgage_monthly', 'Ежемесячный платеж')}
            </span>
            <span className={cx('summary-value')}>
              {selectedBank.monthly_payment?.toLocaleString('en-US') || '0'} ₪
            </span>
          </div>
          <div className={cx('summary-item')}>
            <span className={cx('summary-label')}>
              {t('mortgage_percnt', 'Процентная ставка')}
            </span>
            <span className={cx('summary-value')}>
              {selectedBank.interest_rate || '0'}%
            </span>
          </div>
          <div className={cx('summary-item')}>
            <span className={cx('summary-label')}>
              {t('mortgage_term', 'Срок')}
            </span>
            <span className={cx('summary-value')}>
              {selectedBank.term_years || '0'} {t('years', 'лет')}
            </span>
          </div>
        </div>
      </div>

      {/* Action #4: Program information cards */}
      <div className={cx('programs-section')}>
        <h3 className={cx('programs-title')}>
          {t('available_programs', 'Доступные программы')}
        </h3>
        <div className={cx('programs-grid')}>
          {mortgagePrograms.map((program, index) => (
            <ProgrammCard
              key={program.id || index}
              title={program.title}
              percent={selectedBank.interest_rate || program.interestRate || 2.1}
              mortgageAmount={selectedBank.loan_amount || 0}
              monthlyPayment={selectedBank.monthly_payment || 0}
              period={selectedBank.term_years || program.termYears || 20}
              description={program.description}
              conditionFinance={program.conditionFinance}
              conditionPeriod={program.conditionPeriod}
              conditionBid={program.conditionBid}
            />
          ))}
        </div>
      </div>

      {/* Action #5: Confirmation button */}
      <div className={cx('confirmation-section')}>
        <button 
          className={cx('confirm-button')}
          onClick={handleConfirmSelection}
        >
          {t('confirm_bank_selection', 'Подтвердить выбор банка')}
        </button>
      </div>
    </div>
  )
} 