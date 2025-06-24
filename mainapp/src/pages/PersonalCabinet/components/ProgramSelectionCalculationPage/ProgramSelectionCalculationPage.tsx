import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import classNames from 'classnames/bind'

import { DropdownMenu } from '@components/ui/DropdownMenu'
import Control from '@components/ui/FormattedInput/Control/Control'
import { CaretRightIcon } from '@assets/icons/CaretRightIcon'
import { useAppSelector } from '@src/hooks/store'
import { 
  fetchMortgagePrograms,
  type BankOffer,
  type MortgageProgram 
} from '@src/services/bankOffersApi'

import styles from './programSelectionCalculationPage.module.scss'

const cx = classNames.bind(styles)

interface ProgramData {
  id: string
  title: string
  programType: string
  paymentType: string
  monthlyPayment: number
  term: number
  mortgageAmount: number
  minMonthlyPayment: number
  maxMonthlyPayment: number
  minTerm: number
  maxTerm: number
  minMortgageAmount: number
  maxMortgageAmount: number
}

interface ProgramSelectionCalculationPageProps {
  selectedBankOffer?: BankOffer
}

export const ProgramSelectionCalculationPage: React.FC<ProgramSelectionCalculationPageProps> = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get selected bank offer from navigation state
  const [selectedBank, setSelectedBank] = useState<BankOffer | null>(null)
  const [mortgagePrograms, setMortgagePrograms] = useState<MortgageProgram[]>([])
  const [loading, setLoading] = useState(true)
  
  // Program data state - 3 programs as per Figma
  const [programsData, setProgramsData] = useState<ProgramData[]>([
    {
      id: 'program1',
      title: 'Программа #1',
      programType: 'prime',
      paymentType: 'annuity',
      monthlyPayment: 1000000,
      term: 10,
      mortgageAmount: 1000000,
      minMonthlyPayment: 2259,
      maxMonthlyPayment: 30259,
      minTerm: 48,
      maxTerm: 360,
      minMortgageAmount: 100000,
      maxMortgageAmount: 2000000
    },
    {
      id: 'program2', 
      title: 'Программа #2',
      programType: 'fixed_inflation',
      paymentType: 'annuity',
      monthlyPayment: 1000000,
      term: 1000000,
      mortgageAmount: 1000000,
      minMonthlyPayment: 48,
      maxMonthlyPayment: 360,
      minTerm: 48,
      maxTerm: 360,
      minMortgageAmount: 100000,
      maxMortgageAmount: 2000000
    },
    {
      id: 'program3',
      title: 'Программа #3',
      programType: 'variable_inflation',
      paymentType: 'annuity',
      monthlyPayment: 1000000,
      term: 1000000,
      mortgageAmount: 1000000,
      minMonthlyPayment: 48,
      maxMonthlyPayment: 360,
      minTerm: 48,
      maxTerm: 360,
      minMortgageAmount: 100000,
      maxMortgageAmount: 2000000
    }
  ])

  // Get mortgage parameters from Redux store
  const mortgageParameters = useAppSelector((state) => state.mortgage)

  useEffect(() => {
    // Get selected bank from navigation state
    if (location.state?.selectedBankOffer) {
      setSelectedBank(location.state.selectedBankOffer)
    } else {
      // Mock bank data for development - Bank Hapoalim as per Figma
      setSelectedBank({
        id: 'hapoalim',
        bank_name: 'Банк Hapoalim',
        loan_amount: 1000000,
        monthly_payment: 5000,
        total_payment: 1500000,
        interest_rate: 2.1,
        term_years: 20
      } as BankOffer)
    }
  }, [location.state])

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
        console.warn('⚠️ [PROGRAM-SELECTION] Failed to fetch programs, using fallback')
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

    loadMortgagePrograms()
  }, [t, i18n.language])

  // Program type options for dropdowns
  const programTypeOptions = mortgagePrograms.map(program => ({
    value: program.id,
    label: program.title
  }))

  const paymentTypeOptions = [
    { value: 'annuity', label: t('payment_type_annuity', 'Аннуитетный') },
    { value: 'differential', label: t('payment_type_differential', 'Дифференцированный') }
  ]

  // Action #2: Return to Personal Cabinet Button
  const handleBackNavigation = () => {
    navigate('/personal-cabinet')
  }

  // Action #12: Back Button - navigates to Documents page #31
  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }

  // Action #13: Submit Application Button - navigates to Bank #37
  const handleSubmitApplication = () => {
    // Navigate to offer modal first, then to bank application
    navigate('/personal-cabinet', { 
      state: { showOfferModal: true } 
    })
  }

  // Update program data
  const updateProgramData = (programId: string, field: string, value: any) => {
    setProgramsData(prev => prev.map(program => 
      program.id === programId 
        ? { ...program, [field]: value }
        : program
    ))
  }

  // Calculate total amounts and savings
  const calculateTotals = () => {
    const totalMortgageAmount = programsData.reduce((sum, program) => sum + program.mortgageAmount, 0)
    const totalMonthlyPayment = programsData.reduce((sum, program) => sum + program.monthlyPayment, 0)
    const avgTerm = Math.round(programsData.reduce((sum, program) => sum + program.term, 0) / programsData.length)
    const totalPayment = totalMonthlyPayment * avgTerm
    const savings = totalPayment * 0.1 // Mock 10% savings calculation
    
    return {
      totalMortgageAmount,
      totalMonthlyPayment,
      totalPayment,
      savings
    }
  }

  const totals = calculateTotals()

  if (loading) {
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
      {/* Action #1: Logo Display - handled by PersonalCabinetLayout */}
      
      {/* Action #2: Return to Personal Cabinet Button */}
      <div className={cx('header')}>
        <button 
          className={cx('return-button')}
          onClick={handleBackNavigation}
          aria-label={t('return_to_cabinet', 'Вернуться в личный кабинет')}
        >
          <CaretRightIcon size={20} color="#ffffff" style={{ transform: 'rotate(180deg)' }} />
          {t('return_to_cabinet', 'Вернуться в личный кабинет')}
        </button>
      </div>

      {/* Action #3: Bank Name and Logo Display */}
      <div className={cx('bank-header')}>
        <div className={cx('bank-info')}>
          <div className={cx('bank-logo')}>
            <div className={cx('logo-placeholder')}>
              {selectedBank?.bank_name?.charAt(0) || 'H'}
            </div>
          </div>
          <h2 className={cx('bank-name')}>
            {selectedBank?.bank_name || 'Банк Hapoalim'}
          </h2>
          <div className={cx('bank-action-label')}>
            {t('bank_action_3', 'Действие #3')}
          </div>
        </div>
      </div>

      {/* Action #4: Summary Information Display */}
      <div className={cx('summary-section')}>
        <div className={cx('summary-grid')}>
          <div className={cx('summary-item')}>
            <span className={cx('summary-label')}>
              {t('full_mortgage_amount', 'Полная сумма ипотеки')}
            </span>
            <span className={cx('summary-value')}>
              {totals.totalMortgageAmount.toLocaleString('en-US')} ₪
            </span>
          </div>
          <div className={cx('summary-item')}>
            <span className={cx('summary-label')}>
              {t('payment_amount_for_entire_period', 'Сумма выплат за весь срок')}
            </span>
            <span className={cx('summary-value')}>
              {totals.totalPayment.toLocaleString('en-US')} ₪
            </span>
          </div>
          <div className={cx('summary-item')}>
            <span className={cx('summary-label')}>
              {t('monthly_payment', 'Ежемесячный платеж')}
            </span>
            <span className={cx('summary-value')}>
              {totals.totalMonthlyPayment.toLocaleString('en-US')} ₪
            </span>
          </div>
        </div>
        <div className={cx('action-label')}>
          {t('bank_action_4', 'Действие #4')}
        </div>
      </div>

      {/* Action #5: Savings Display */}
      <div className={cx('savings-section')}>
        <div className={cx('savings-box')}>
          <span className={cx('savings-label')}>
            {t('savings', 'Экономия')}
          </span>
          <span className={cx('savings-value')}>
            {totals.savings.toLocaleString('en-US')} ₪
          </span>
        </div>
        <div className={cx('action-label')}>
          {t('bank_action_5', 'Действие #5')}
        </div>
      </div>

      {/* Programs Section - Actions #6-#11 */}
      <div className={cx('programs-section')}>
        {programsData.map((program, index) => (
          <div key={program.id} className={cx('program-card')}>
            {/* Action #6: Program Number Display */}
            <div className={cx('program-header')}>
              <h3 className={cx('program-title')}>{program.title}</h3>
              <div className={cx('action-label')}>
                {t('bank_action_6', 'Действие #6')}
              </div>
            </div>

            <div className={cx('program-controls')}>
              {/* Action #7: Program Selection Dropdown */}
              <div className={cx('control-row')}>
                <div className={cx('control-group')}>
                  <label className={cx('control-label')}>
                    {t('programs', 'Программы')}
                  </label>
                  <DropdownMenu
                    data={programTypeOptions}
                    placeholder={t('select_program', 'Выберите программу')}
                    value={program.programType}
                    onChange={(value) => updateProgramData(program.id, 'programType', value)}
                  />
                  <div className={cx('action-label')}>
                    {t('bank_action_7', 'Действие #7')}
                  </div>
                </div>

                {/* Action #8: Payment Type Selection Dropdown */}
                <div className={cx('control-group')}>
                  <label className={cx('control-label')}>
                    {t('payment_type', 'Тип платежа')}
                  </label>
                  <DropdownMenu
                    data={paymentTypeOptions}
                    placeholder={t('select_payment_type', 'Выберите тип платежа')}
                    value={program.paymentType}
                    onChange={(value) => updateProgramData(program.id, 'paymentType', value)}
                  />
                  <div className={cx('action-label')}>
                    {t('bank_action_8', 'Действие #8')}
                  </div>
                </div>
              </div>

              {/* Action #9: Monthly Payment Input with Slider */}
              <div className={cx('control-row')}>
                <div className={cx('control-group', 'slider-group')}>
                  <label className={cx('control-label')}>
                    {t('monthly_payment', 'Ежемесячный платеж')}
                  </label>
                  <div className={cx('slider-container')}>
                    <input
                      type="range"
                      min={program.minMonthlyPayment}
                      max={program.maxMonthlyPayment}
                      value={program.monthlyPayment}
                      onChange={(e) => updateProgramData(program.id, 'monthlyPayment', parseInt(e.target.value))}
                      className={cx('slider')}
                    />
                    <div className={cx('slider-labels')}>
                      <span>{program.minMonthlyPayment.toLocaleString()} ₪</span>
                      <span>{program.maxMonthlyPayment.toLocaleString()} ₪</span>
                    </div>
                  </div>
                  <Control
                    placeholder="1,000,000"
                    value={program.monthlyPayment}
                    handleChange={(value) => updateProgramData(program.id, 'monthlyPayment', value)}
                  />
                  <div className={cx('action-label')}>
                    {t('bank_action_9', 'Действие #9')}
                  </div>
                </div>

                {/* Action #10: Term Input with Slider */}
                <div className={cx('control-group', 'slider-group')}>
                  <label className={cx('control-label')}>
                    {t('term', 'Срок')}
                  </label>
                  <div className={cx('slider-container')}>
                    <input
                      type="range"
                      min={program.minTerm}
                      max={program.maxTerm}
                      value={program.term}
                      onChange={(e) => updateProgramData(program.id, 'term', parseInt(e.target.value))}
                      className={cx('slider')}
                    />
                    <div className={cx('slider-labels')}>
                      <span>{program.minTerm} {t('months', 'мес')}</span>
                      <span>{program.maxTerm} {t('months', 'мес')}</span>
                    </div>
                  </div>
                  <Control
                    placeholder="1,000,000"
                    value={program.term}
                    handleChange={(value) => updateProgramData(program.id, 'term', value)}
                  />
                  <div className={cx('action-label')}>
                    {t('bank_action_10', 'Действие #10')}
                  </div>
                </div>
              </div>

              {/* Action #11: Mortgage Amount Input */}
              <div className={cx('control-row')}>
                <div className={cx('control-group', 'slider-group')}>
                  <label className={cx('control-label')}>
                    {t('mortgage_amount', 'Сумма ипотеки')}
                  </label>
                  <div className={cx('slider-container')}>
                    <input
                      type="range"
                      min={program.minMortgageAmount}
                      max={program.maxMortgageAmount}
                      value={program.mortgageAmount}
                      onChange={(e) => updateProgramData(program.id, 'mortgageAmount', parseInt(e.target.value))}
                      className={cx('slider')}
                    />
                    <div className={cx('slider-labels')}>
                      <span>{program.minMortgageAmount.toLocaleString()} ₪</span>
                      <span>{program.maxMortgageAmount.toLocaleString()} ₪</span>
                    </div>
                  </div>
                  <Control
                    placeholder="1,000,000"
                    value={program.mortgageAmount}
                    handleChange={(value) => updateProgramData(program.id, 'mortgageAmount', value)}
                  />
                  <div className={cx('action-label')}>
                    {t('bank_action_11', 'Действие #11')}
                  </div>
                </div>
              </div>

              {/* Warning message */}
              <div className={cx('warning-message')}>
                <span className={cx('warning-icon')}>⚠️</span>
                <span className={cx('warning-text')}>
                  {t('increase_monthly_payment_warning', 'Увеличьте ежемесячный платеж и сократите срок кредитования для экономии')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className={cx('actions-section')}>
        {/* Action #12: Back Button */}
        <button 
          className={cx('back-button')}
          onClick={handleBack}
        >
          {t('back', 'Назад')}
        </button>

        {/* Action #13: Submit Application Button */}
        <button 
          className={cx('submit-button')}
          onClick={handleSubmitApplication}
        >
          {t('submit_bank_application', 'Подать заявку в банк')}
        </button>
      </div>
    </div>
  )
} 